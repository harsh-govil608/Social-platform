import { jest } from '@jest/globals';
import request from 'supertest';

// Mock dependencies before importing app
jest.unstable_mockModule('../lib/db.js', () => ({
  connectDB: jest.fn().mockResolvedValue(true),
}));

jest.unstable_mockModule('../lib/stream.js', () => ({
  upsertStreamUser: jest.fn().mockResolvedValue(true),
  createStreamUser: jest.fn().mockResolvedValue(true),
  generateStreamToken: jest.fn().mockReturnValue('mock-token'),
}));

// Mock auth middleware so protectRoute bypasses JWT check
jest.unstable_mockModule('../middleware/auth.middleware.js', () => ({
  protectRoute: (req, res, next) => {
    req.user = {
      _id: '64b1234567890abcdef12345',
      fullName: 'Test User',
      email: 'test@example.com',
    };
    next();
  },
  adminRoute: (req, res, next) => next(),
}));

// Mock upload middleware (multer) so tests don't need disk access
jest.unstable_mockModule('../middleware/upload.middleware.js', () => ({
  uploadFields: jest.fn(() => (req, res, next) => next()),
  handleUploadError: jest.fn((req, res, next) => next()),
  deleteUploadedFiles: jest.fn(),
  generateVideoThumbnail: jest.fn().mockResolvedValue(null),
}));

// Mock validators to be pass-through
jest.unstable_mockModule('../validators/post.validator.js', () => ({
  validateCreatePost: (req, res, next) => next(),
  validatePostId: (req, res, next) => next(),
  validateComment: (req, res, next) => next(),
}));

describe('Post Routes', () => {
  let app;
  let Post;
  let User;
  let mockUserId;

  beforeAll(async () => {
    const express = (await import('express')).default;
    const cookieParser = (await import('cookie-parser')).default;
    const jwt = (await import('jsonwebtoken')).default;
    const postRoutes = (await import('../routes/post.route.js')).default;

    app = express();
    app.use(express.json());
    app.use(cookieParser());

    app.use('/api/posts', postRoutes);

    const PostModule = await import('../models/Post.js');
    Post = PostModule.default;

    const UserModule = await import('../models/User.js');
    User = UserModule.default;

    mockUserId = '64b1234567890abcdef12345';
  });

  describe('POST /api/posts', () => {
    it('should return 400 when content is missing', async () => {
      const response = await request(app)
        .post('/api/posts')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should create a post with valid content', async () => {
      const mockPost = {
        _id: 'post123',
        author: { _id: mockUserId, fullName: 'Test User', profilePic: '', isVerified: false },
        content: 'Hello world',
        images: [],
        videos: [],
        visibility: 'public',
      };

      Post.create = jest.fn().mockResolvedValue({ _id: 'post123' });
      Post.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockPost),
      });

      const response = await request(app)
        .post('/api/posts')
        .send({ content: 'Hello world' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('post');
    });
  });

  describe('GET /api/posts/feed', () => {
    it('should return feed with success true and pagination', async () => {
      const mockUser = { _id: mockUserId, friends: [] };
      const mockPosts = [
        { _id: 'p1', content: 'Post 1', author: { fullName: 'Test User' } },
      ];

      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      // The actual chain is: find().sort().skip().limit().populate().populate().populate()
      let populateCalls = 0;
      const mockChain = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      };
      mockChain.populate = jest.fn().mockImplementation(() => {
        populateCalls++;
        if (populateCalls >= 3) return Promise.resolve(mockPosts);
        return mockChain;
      });
      Post.find = jest.fn().mockReturnValue(mockChain);
      Post.countDocuments = jest.fn().mockResolvedValue(1);

      const response = await request(app).get('/api/posts/feed');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('posts');
      expect(response.body).toHaveProperty('pagination');
    });
  });

  describe('POST /api/posts/:postId/like', () => {
    it('should return 404 when post does not exist', async () => {
      Post.findById = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .post('/api/posts/nonexistentid/like');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });
});
