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

// Mock auth middleware
jest.unstable_mockModule('../middleware/auth.middleware.js', () => ({
  protectRoute: (req, res, next) => {
    req.user = {
      _id: mockOwnerId,
      fullName: 'Org Owner',
      email: 'owner@example.com',
    };
    next();
  },
  adminRoute: (req, res, next) => next(),
}));

// Mock org middleware — orgAdminRoute will be exercised per-test via Organization.isAdmin mock
jest.unstable_mockModule('../middleware/org.middleware.js', () => ({
  orgMemberRoute: (req, res, next) => next(),
  orgAdminRoute: (req, res, next) => next(),
  featureGate: () => (req, res, next) => next(),
}));

jest.unstable_mockModule('../lib/stripe.js', () => ({
  createCustomer: jest.fn().mockResolvedValue({ id: 'cus_test123' }),
  createCheckoutSession: jest.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test', id: 'cs_test' }),
  STRIPE_PRICES: { org_starter: 'price_starter', org_growth: 'price_growth', org_enterprise: 'price_enterprise' },
}));

const mockOwnerId = '64b1234567890abcdef11111';
const mockMemberId = '64b1234567890abcdef22222';

describe('Organization Routes', () => {
  let app;
  let Organization;
  let User;

  beforeAll(async () => {
    const express = (await import('express')).default;
    const cookieParser = (await import('cookie-parser')).default;
    const orgRoutes = (await import('../routes/organization.route.js')).default;

    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/api/organization', orgRoutes);

    const OrgModule = await import('../models/Organization.js');
    Organization = OrgModule.default;

    const UserModule = await import('../models/User.js');
    User = UserModule.default;
  });

  describe('POST /api/organization/create', () => {
    it('should create an organization with valid data', async () => {
      const mockOrg = {
        _id: 'org123',
        name: 'Test Org',
        slug: 'test-org',
        type: 'company',
        owner: mockOwnerId,
        admins: [mockOwnerId],
        members: [],
        subscription: { tier: 'starter', seats: 50, usedSeats: 0, status: 'trialing' },
        stats: { totalMembers: 0 },
        save: jest.fn().mockResolvedValue(true),
      };

      Organization.findOne = jest.fn().mockResolvedValue(null); // slug not taken
      Organization.create = jest.fn().mockResolvedValue(mockOrg);

      const response = await request(app)
        .post('/api/organization/create')
        .send({ name: 'Test Org', slug: 'test-org', type: 'company', seats: 50 });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('organization');
    });

    it('should return 400 if slug is already taken', async () => {
      Organization.findOne = jest.fn().mockResolvedValue({ slug: 'test-org' });

      const response = await request(app)
        .post('/api/organization/create')
        .send({ name: 'Another Org', slug: 'test-org', type: 'school' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/organization/:slug/invite', () => {
    it('should return 403 if caller is not an admin', async () => {
      const mockOrg = {
        _id: 'org123',
        slug: 'my-org',
        owner: 'someone-else',
        admins: [],
        members: [{ user: { toString: () => mockOwnerId }, role: 'member' }],
        isMember: jest.fn().mockReturnValue(true),
        isAdmin: jest.fn().mockReturnValue(false), // not admin
      };

      Organization.findOne = jest.fn().mockResolvedValue(mockOrg);

      const response = await request(app)
        .post('/api/organization/my-org/invite')
        .send({ email: 'newuser@example.com' });

      expect(response.status).toBe(403);
    });

    it('should return 404 if invited user does not exist', async () => {
      const mockOrg = {
        _id: 'org123',
        slug: 'my-org',
        owner: mockOwnerId,
        admins: [mockOwnerId],
        members: [],
        isMember: jest.fn().mockReturnValue(false),
        isAdmin: jest.fn().mockReturnValue(true),
      };

      Organization.findOne = jest.fn().mockResolvedValue(mockOrg);
      User.findOne = jest.fn().mockResolvedValue(null); // user not found

      const response = await request(app)
        .post('/api/organization/my-org/invite')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(404);
    });

    it('should invite a user successfully', async () => {
      const mockUser = { _id: mockMemberId, email: 'member@example.com' };
      const mockOrg = {
        _id: 'org123',
        slug: 'my-org',
        owner: mockOwnerId,
        admins: [mockOwnerId],
        members: [],
        subscription: { seats: 50, usedSeats: 1 },
        stats: { totalMembers: 1 },
        isMember: jest.fn().mockReturnValue(false),
        isAdmin: jest.fn().mockReturnValue(true),
        addMember: jest.fn(),
        save: jest.fn().mockResolvedValue(true),
      };

      Organization.findOne = jest.fn().mockResolvedValue(mockOrg);
      User.findOne = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/organization/my-org/invite')
        .send({ email: 'member@example.com' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/organization/:slug/invite/bulk', () => {
    it('should return mixed results for partial bulk invite', async () => {
      const existingUser = { _id: mockMemberId, email: 'existing@example.com' };

      const mockOrg = {
        _id: 'org123',
        slug: 'my-org',
        owner: mockOwnerId,
        admins: [mockOwnerId],
        members: [],
        subscription: { seats: 50, usedSeats: 0 },
        stats: { totalMembers: 0 },
        isMember: jest.fn()
          .mockReturnValueOnce(false)   // existing@example.com — not yet a member
          .mockReturnValueOnce(false),  // nonexistent — won't reach this
        isAdmin: jest.fn().mockReturnValue(true),
        addMember: jest.fn(),
        save: jest.fn().mockResolvedValue(true),
      };

      Organization.findOne = jest.fn().mockResolvedValue(mockOrg);
      User.findOne = jest.fn()
        .mockResolvedValueOnce(existingUser)  // found
        .mockResolvedValueOnce(null);         // not found

      const response = await request(app)
        .post('/api/organization/my-org/invite/bulk')
        .send({ emails: ['existing@example.com', 'ghost@example.com'] });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('added');
      expect(response.body.result).toHaveProperty('notFound');
      expect(response.body.result.added).toContain('existing@example.com');
      expect(response.body.result.notFound).toContain('ghost@example.com');
    });
  });
});
