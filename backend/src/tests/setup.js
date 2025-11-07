import { jest } from '@jest/globals';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET_KEY = 'test-secret-key';
process.env.MONGO_URI = 'mongodb://localhost:27017/social-platform-test';
process.env.STREAM_API_KEY = 'test-stream-key';
process.env.STREAM_API_SECRET = 'test-stream-secret';
process.env.PORT = '5002';

// Increase timeout for async operations
jest.setTimeout(10000);
