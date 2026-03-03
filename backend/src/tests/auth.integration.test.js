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

jest.unstable_mockModule('../lib/sentry.js', () => ({
  initSentry: jest.fn(),
  sentryRequestHandler: jest.fn(() => (req, res, next) => next()),
  sentryTracingHandler: jest.fn(() => (req, res, next) => next()),
  sentryErrorHandler: jest.fn(() => (err, req, res, next) => next(err)),
}));

describe('Auth Routes Integration', () => {
  let app;
  let User;

  beforeAll(async () => {
    const express = (await import('express')).default;
    const cookieParser = (await import('cookie-parser')).default;
    const authRoutes = (await import('../routes/auth.route.js')).default;

    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/api/auth', authRoutes);

    const mockModule = await import('../models/User.js');
    User = mockModule.default;
  });

  describe('POST /api/auth/signup', () => {
    it('should return 201 with user object on valid signup', async () => {
      const mockUser = {
        _id: 'user123',
        fullName: 'Test User',
        email: 'test@example.com',
        isOnboarded: false,
        toJSON: () => ({
          _id: 'user123',
          fullName: 'Test User',
          email: 'test@example.com',
          isOnboarded: false,
        }),
      };

      User.findOne = jest.fn().mockResolvedValue(null);
      User.create = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'Password1',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
    });

    it('should return 400 when email already exists', async () => {
      User.findOne = jest.fn().mockResolvedValue({ email: 'test@example.com' });

      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'Password1',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 with weak password (too short)', async () => {
      User.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          fullName: 'Test User',
          email: 'newuser@example.com',
          password: '123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 200 with valid credentials', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        fullName: 'Test User',
        isOnboarded: true,
        matchPassword: jest.fn().mockResolvedValue(true),
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password1',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
    });

    it('should return 401 with wrong password', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        matchPassword: jest.fn().mockResolvedValue(false),
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword1',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/users/me', () => {
    it('should return 401 without authentication cookie', async () => {
      const express = (await import('express')).default;
      const cookieParser = (await import('cookie-parser')).default;
      const userRoutes = (await import('../routes/user.route.js')).default;

      const testApp = express();
      testApp.use(express.json());
      testApp.use(cookieParser());
      testApp.use('/api/users', userRoutes);

      const response = await request(testApp).get('/api/users/me');

      expect(response.status).toBe(401);
    });
  });
});
