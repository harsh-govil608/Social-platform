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

describe('Auth Routes', () => {
  let app;
  let User;

  beforeAll(async () => {
    // Dynamic import after mocks are set up
    const express = (await import('express')).default;
    const cookieParser = (await import('cookie-parser')).default;
    const authRoutes = (await import('../routes/auth.route.js')).default;

    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/api/auth', authRoutes);

    // Mock User model
    const mockModule = await import('../models/User.js');
    User = mockModule.default;
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user with valid data', async () => {
      const mockUser = {
        _id: 'user123',
        fullName: 'Test User',
        email: 'test@example.com',
        isOnboarded: false,
      };

      User.findOne = jest.fn().mockResolvedValue(null);
      User.create = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'Password123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
    }, 10000);

    it('should return error if email already exists', async () => {
      User.findOne = jest.fn().mockResolvedValue({ email: 'test@example.com' });

      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'Password123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });
});
