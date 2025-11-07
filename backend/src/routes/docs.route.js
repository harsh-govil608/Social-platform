import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../config/swagger.js';

const router = express.Router();

// Swagger JSON endpoint
router.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Swagger UI
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Social Learning Platform API Docs',
}));

export default router;

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication and authorization
 *   - name: Users
 *     description: User management and profiles
 *   - name: Posts
 *     description: Social posts and interactions
 *   - name: Subscriptions
 *     description: Payment and subscription management
 *   - name: Admin
 *     description: Admin dashboard and management
 *   - name: Analytics
 *     description: Platform analytics and metrics
 */
