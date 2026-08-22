import { jest } from '@jest/globals';

// Mock models and dependencies before importing the service
jest.unstable_mockModule('../models/WikiRaw.js', () => ({
  default: {
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    exists: jest.fn(),
  },
}));

jest.unstable_mockModule('../models/WikiArticle.js', () => ({
  default: {
    find: jest.fn(),
    findOne: jest.fn(),
    exists: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

jest.unstable_mockModule('../models/WikiTemplate.js', () => ({
  default: {
    findOne: jest.fn(),
  },
}));

jest.unstable_mockModule('../lib/ai.js', () => ({
  generateAIResponse: jest.fn(),
  isAIConfigured: jest.fn(),
}));

jest.unstable_mockModule('../lib/logger.js', () => ({
  log: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock BullMQ queue so tests don't try to connect to Redis
jest.unstable_mockModule('../queues/wiki.queue.js', () => ({
  wikiQueue: {
    add: jest.fn().mockResolvedValue({ id: 'mock-job-id' }),
    close: jest.fn().mockResolvedValue(undefined),
    getJobCounts: jest.fn().mockResolvedValue({ waiting: 0, active: 0, completed: 0, failed: 0 }),
  },
}));

describe('Wiki Service', () => {
  let ingestContent;
  let processRawEntry;
  let WikiRaw;
  let WikiArticle;
  let WikiTemplate;
  let generateAIResponse;
  let isAIConfigured;

  beforeAll(async () => {
    const service = await import('../services/wiki.service.js');
    ingestContent = service.ingestContent;
    processRawEntry = service.processRawEntry;

    WikiRaw = (await import('../models/WikiRaw.js')).default;
    WikiArticle = (await import('../models/WikiArticle.js')).default;
    WikiTemplate = (await import('../models/WikiTemplate.js')).default;

    const aiModule = await import('../lib/ai.js');
    generateAIResponse = aiModule.generateAIResponse;
    isAIConfigured = aiModule.isAIConfigured;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- ingestContent ---

  describe('ingestContent', () => {
    it('should create a WikiRaw entry and return it', async () => {
      const mockRaw = {
        _id: 'raw123',
        source: 'manual',
        content: 'Hello world vocabulary definition',
        status: 'pending',
      };

      WikiRaw.create.mockResolvedValue(mockRaw);

      // processRawEntry runs via setImmediate -- we don't await it here,
      // so we just need WikiRaw.findById to return something safe to avoid
      // unhandled rejections during setImmediate execution.
      WikiRaw.findById.mockResolvedValue(mockRaw);
      isAIConfigured.mockReturnValue(false);
      WikiRaw.findByIdAndUpdate.mockResolvedValue({});

      const result = await ingestContent({
        source: 'manual',
        content: 'Hello world vocabulary definition',
        submittedBy: 'user1',
      });

      expect(WikiRaw.create).toHaveBeenCalledTimes(1);
      expect(WikiRaw.create).toHaveBeenCalledWith(
        expect.objectContaining({
          source: 'manual',
          content: 'Hello world vocabulary definition',
          status: 'pending',
          submittedBy: 'user1',
        })
      );
      expect(result).toEqual(mockRaw);
    });
  });

  // --- processRawEntry ---

  describe('processRawEntry', () => {
    it('should set status to "failed" when AI is not configured', async () => {
      const mockRaw = {
        _id: 'raw001',
        content: 'some content',
        url: null,
      };

      WikiRaw.findById.mockResolvedValue(mockRaw);
      isAIConfigured.mockReturnValue(false);
      WikiRaw.findByIdAndUpdate.mockResolvedValue({});

      await processRawEntry('raw001');

      expect(WikiRaw.findByIdAndUpdate).toHaveBeenCalledWith('raw001', {
        status: 'failed',
        error: expect.stringContaining('No AI provider configured'),
      });
    });

    it('should create a new article when none exists with that title', async () => {
      const mockRaw = {
        _id: 'raw002',
        content: 'The word "ephemeral" means lasting for a very short time.',
        url: null,
      };
      const mockArticle = { _id: 'article001' };

      WikiRaw.findById.mockResolvedValue(mockRaw);
      isAIConfigured.mockReturnValue(true);
      WikiRaw.findByIdAndUpdate.mockResolvedValue({});
      WikiTemplate.findOne.mockResolvedValue(null);

      generateAIResponse.mockResolvedValue(JSON.stringify({
        title: 'Ephemeral',
        summary: 'Lasting for a very short time.',
        body: '## Definition\nEphemeral means short-lived.',
        claims: [{ fact: 'Ephemeral derives from Greek', confidence: 0.9, source: 'inferred' }],
        tags: ['vocabulary'],
        type: 'vocabulary',
      }));

      WikiArticle.findOne.mockResolvedValue(null);
      WikiArticle.exists.mockResolvedValue(false);
      WikiArticle.create.mockResolvedValue(mockArticle);

      await processRawEntry('raw002');

      expect(WikiArticle.create).toHaveBeenCalledTimes(1);
      expect(WikiArticle.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Ephemeral',
          slug: 'ephemeral',
        })
      );
      expect(WikiRaw.findByIdAndUpdate).toHaveBeenCalledWith(
        'raw002',
        expect.objectContaining({ status: 'processed', articleId: mockArticle._id })
      );
    });

    it('should enrich an existing article when title matches', async () => {
      const mockRaw = {
        _id: 'raw003',
        content: 'More information about ephemeral -- something that is short-lived.',
        url: null,
      };
      const existingArticle = {
        _id: 'article001',
        title: 'Ephemeral',
        body: '## Definition\nShort body.',
        claims: [{ fact: 'Existing fact about ephemeral', confidence: 0.8 }],
        contradictions: [],
      };

      WikiRaw.findById.mockResolvedValue(mockRaw);
      isAIConfigured.mockReturnValue(true);
      WikiRaw.findByIdAndUpdate.mockResolvedValue({});
      WikiTemplate.findOne.mockResolvedValue(null);

      const aiArticleJson = JSON.stringify({
        title: 'Ephemeral',
        summary: 'Lasting for a very short time.',
        body: '## Definition\nEphemeral means short-lived. This is a much longer and richer body than the existing one.',
        claims: [{ fact: 'New fact about ephemeral', confidence: 0.9, source: 'inferred' }],
        tags: ['vocabulary'],
        type: 'vocabulary',
      });

      // First AI call: article generation. Second AI call (checkContradictions): empty array.
      generateAIResponse
        .mockResolvedValueOnce(aiArticleJson)
        .mockResolvedValueOnce('[]');

      WikiArticle.findOne.mockResolvedValue(existingArticle);
      WikiArticle.findByIdAndUpdate.mockResolvedValue({});

      await processRawEntry('raw003');

      expect(WikiArticle.create).not.toHaveBeenCalled();
      expect(WikiArticle.findByIdAndUpdate).toHaveBeenCalledWith(
        existingArticle._id,
        expect.objectContaining({ $push: expect.any(Object) })
      );
      expect(WikiRaw.findByIdAndUpdate).toHaveBeenCalledWith(
        'raw003',
        expect.objectContaining({ status: 'processed', articleId: existingArticle._id })
      );
    });

    it('should set status to "failed" when AI returns invalid JSON', async () => {
      const mockRaw = {
        _id: 'raw004',
        content: 'some content about grammar',
        url: null,
      };

      WikiRaw.findById.mockResolvedValue(mockRaw);
      isAIConfigured.mockReturnValue(true);
      WikiRaw.findByIdAndUpdate.mockResolvedValue({});
      WikiTemplate.findOne.mockResolvedValue(null);

      generateAIResponse.mockResolvedValue('This is not JSON at all!!!');

      await processRawEntry('raw004');

      expect(WikiRaw.findByIdAndUpdate).toHaveBeenCalledWith(
        'raw004',
        expect.objectContaining({
          status: 'failed',
          error: expect.stringContaining('JSON parse failed'),
        })
      );
      expect(WikiArticle.create).not.toHaveBeenCalled();
    });

    it('should set status to "failed" when article is missing title or body', async () => {
      const mockRaw = {
        _id: 'raw005',
        content: 'content about something',
        url: null,
      };

      WikiRaw.findById.mockResolvedValue(mockRaw);
      isAIConfigured.mockReturnValue(true);
      WikiRaw.findByIdAndUpdate.mockResolvedValue({});
      WikiTemplate.findOne.mockResolvedValue(null);

      // AI returns JSON but without required fields
      generateAIResponse.mockResolvedValue(JSON.stringify({
        summary: 'A summary without title or body',
        claims: [],
        tags: [],
        type: 'general',
      }));

      await processRawEntry('raw005');

      expect(WikiRaw.findByIdAndUpdate).toHaveBeenCalledWith(
        'raw005',
        expect.objectContaining({
          status: 'failed',
          error: 'AI returned incomplete article',
        })
      );
      expect(WikiArticle.create).not.toHaveBeenCalled();
    });
  });
});
