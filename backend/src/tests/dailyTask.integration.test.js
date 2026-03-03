import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.unstable_mockModule('../lib/db.js', () => ({
  connectDB: jest.fn().mockResolvedValue(true),
}));

jest.unstable_mockModule('../lib/stream.js', () => ({
  upsertStreamUser: jest.fn().mockResolvedValue(true),
  generateStreamToken: jest.fn().mockReturnValue('mock-token'),
}));

jest.unstable_mockModule('../lib/sentry.js', () => ({
  initSentry: jest.fn(),
  sentryRequestHandler: jest.fn(() => (req, res, next) => next()),
  sentryTracingHandler: jest.fn(() => (req, res, next) => next()),
  sentryErrorHandler: jest.fn(() => (err, req, res, next) => next(err)),
}));

describe('Daily Task Routes Integration', () => {
  let app;
  let DailyTask;
  let User;
  let authCookie;
  const mockUserId = '507f1f77bcf86cd799439011';
  const mockUser = {
    _id: mockUserId,
    id: mockUserId,
    fullName: 'Test User',
    email: 'test@example.com',
    learningLanguage: 'spanish',
    isOnboarded: true,
    streak: 0,
    lastPracticeDate: null,
    blockedUsers: [],
    friends: [],
    following: [],
    save: jest.fn().mockResolvedValue(true),
  };

  beforeAll(async () => {
    const express = (await import('express')).default;
    const cookieParser = (await import('cookie-parser')).default;
    const dailyTaskRoutes = (await import('../routes/dailyTask.route.js')).default;

    const dailyTaskModule = await import('../models/DailyTask.js');
    DailyTask = dailyTaskModule.default;
    const userModule = await import('../models/User.js');
    User = userModule.default;

    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/api/daily-task', dailyTaskRoutes);

    const token = jwt.sign({ userId: mockUserId }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
    authCookie = `jwt=${token}`;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock User.findById to work both with and without .select()
    // protectRoute calls .select("-password"), populateTaskContent calls it directly
    const makeQueryable = (resolvedValue) => {
      const p = Promise.resolve(resolvedValue);
      p.select = jest.fn().mockResolvedValue(resolvedValue);
      return p;
    };
    User.findById = jest.fn().mockReturnValue(makeQueryable(mockUser));
  });

  describe('GET /api/daily-task/today', () => {
    it('should return 200 with task when one exists', async () => {
      const mockTask = {
        _id: 'task123',
        user: mockUserId,
        status: 'pending',
        taskType: 'grammar',  // non-vocabulary so populateTaskContent skips Vocabulary.find
        completedSteps: { taskStarted: false },
        getCurrentStep: jest.fn().mockReturnValue('start'),
        content: {},
        save: jest.fn().mockResolvedValue(true),
      };

      DailyTask.getTodayTask = jest.fn().mockResolvedValue(mockTask);

      const response = await request(app)
        .get('/api/daily-task/today')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('task');
    });

    it('should create and return a new task when none exists', async () => {
      const mockTask = {
        _id: 'task456',
        user: mockUserId,
        status: 'pending',
        taskType: 'grammar',
        completedSteps: { taskStarted: false },
        getCurrentStep: jest.fn().mockReturnValue('start'),
        content: { words: [] },
        save: jest.fn().mockResolvedValue(true),
      };

      DailyTask.getTodayTask = jest.fn()
        .mockResolvedValueOnce(null)      // First call: no task found
        .mockResolvedValueOnce(mockTask); // Should not be called again, but safety
      DailyTask.createDailyTask = jest.fn().mockResolvedValue(mockTask);

      const response = await request(app)
        .get('/api/daily-task/today')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(DailyTask.createDailyTask).toHaveBeenCalled();
    });
  });

  describe('POST /api/daily-task/start', () => {
    it('should return 200 and start the task', async () => {
      const mockTask = {
        _id: 'task123',
        user: mockUserId,
        status: 'pending',
        completedSteps: { taskStarted: false },
        getCurrentStep: jest.fn().mockReturnValue('ai_practice'),
        save: jest.fn().mockResolvedValue(true),
      };

      DailyTask.getTodayTask = jest.fn().mockResolvedValue(mockTask);

      const response = await request(app)
        .post('/api/daily-task/start')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(mockTask.save).toHaveBeenCalled();
    });

    it('should return 400 if task already started', async () => {
      const mockTask = {
        _id: 'task123',
        user: mockUserId,
        status: 'in_progress',
        completedSteps: { taskStarted: true },
        getCurrentStep: jest.fn().mockReturnValue('ai_practice'),
      };

      DailyTask.getTodayTask = jest.fn().mockResolvedValue(mockTask);

      const response = await request(app)
        .post('/api/daily-task/start')
        .set('Cookie', authCookie);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/already started/i);
    });

    it('should return 404 if no task found for today', async () => {
      DailyTask.getTodayTask = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .post('/api/daily-task/start')
        .set('Cookie', authCookie);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/daily-task/complete-ai-practice', () => {
    it('should return 200 and mark AI practice done', async () => {
      const mockTask = {
        _id: 'task123',
        user: mockUserId,
        status: 'in_progress',
        completedSteps: {
          taskStarted: true,
          aiPracticeCompleted: false,
        },
        result: {},
        getCurrentStep: jest.fn().mockReturnValue('partner_interaction'),
        save: jest.fn().mockResolvedValue(true),
      };

      DailyTask.getTodayTask = jest.fn().mockResolvedValue(mockTask);

      const response = await request(app)
        .post('/api/daily-task/complete-ai-practice')
        .set('Cookie', authCookie)
        .send({ feedback: 'Good job', score: 85, timeSpent: 300 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(mockTask.save).toHaveBeenCalled();
    });
  });

  describe('GET /api/daily-task/history', () => {
    it('should return 200 with stats object', async () => {
      DailyTask.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([
          { status: 'completed' },
          { status: 'completed' },
          { status: 'pending' },
        ]),
      });

      const response = await request(app)
        .get('/api/daily-task/history')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('stats');
      expect(response.body.stats).toHaveProperty('completedTasks');
      expect(response.body.stats).toHaveProperty('totalTasks');
      expect(response.body.stats).toHaveProperty('completionRate');
    });
  });
});
