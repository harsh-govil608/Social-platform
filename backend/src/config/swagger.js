import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Social Learning Platform API',
      version: '1.0.0',
      description: 'Comprehensive API documentation for the Social Learning Platform',
      contact: {
        name: 'API Support',
        email: 'support@sociallearning.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5001/api',
        description: 'Development server',
      },
      {
        url: 'https://api.yourdomain.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'jwt',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            fullName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            bio: { type: 'string' },
            profilePic: { type: 'string' },
            nativeLanguage: { type: 'string' },
            learningLanguage: { type: 'string' },
            location: { type: 'string' },
            isOnboarded: { type: 'boolean' },
            role: { type: 'string', enum: ['user', 'admin'] },
            isActive: { type: 'boolean' },
            friends: { type: 'array', items: { type: 'string' } },
            followers: { type: 'array', items: { type: 'string' } },
            following: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Post: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
            content: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            videos: { type: 'array', items: { type: 'string' } },
            visibility: { type: 'string', enum: ['public', 'friends', 'private'] },
            likes: { type: 'array', items: { type: 'string' } },
            comments: { type: 'array' },
            shares: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Subscription: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            planType: { type: 'string', enum: ['basic', 'pro', 'enterprise'] },
            status: { type: 'string', enum: ['active', 'cancelled', 'expired'] },
            stripeCustomerId: { type: 'string' },
            stripeSubscriptionId: { type: 'string' },
            currentPeriodEnd: { type: 'string', format: 'date-time' },
            amount: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            errors: { type: 'array' },
          },
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
