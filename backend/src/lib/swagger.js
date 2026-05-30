import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LangPal API',
      version: '1.0.0',
      description: 'AI-powered language learning social platform API',
    },
    servers: [
      { url: 'http://localhost:5001', description: 'Development server' },
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
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            fullName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            profilePic: { type: 'string' },
            isOnboarded: { type: 'boolean' },
            nativeLanguage: { type: 'string' },
            learningLanguage: { type: 'string' },
            streak: { type: 'integer' },
          },
        },
        Post: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            content: { type: 'string' },
            author: { $ref: '#/components/schemas/User' },
            visibility: { type: 'string', enum: ['public', 'friends', 'private'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        WikiArticle: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            slug: { type: 'string' },
            summary: { type: 'string' },
            body: { type: 'string' },
            type: { type: 'string', enum: ['vocabulary', 'language_term', 'general'] },
            tags: { type: 'array', items: { type: 'string' } },
            viewCount: { type: 'integer' },
          },
        },
      },
    },
    security: [{ cookieAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
