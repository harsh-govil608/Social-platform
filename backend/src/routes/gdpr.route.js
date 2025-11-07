import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
  exportUserData,
  requestAccountDeletion,
  cancelAccountDeletion,
} from '../controllers/gdpr.controller.js';

const router = express.Router();

// All GDPR routes require authentication
router.use(protectRoute);

/**
 * @swagger
 * /gdpr/export:
 *   get:
 *     summary: Export all user data (GDPR compliance)
 *     tags: [GDPR]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User data exported as JSON
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/export', exportUserData);

/**
 * @swagger
 * /gdpr/delete-account:
 *   post:
 *     summary: Request account deletion (30-day grace period)
 *     tags: [GDPR]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Account deletion scheduled
 */
router.post('/delete-account', requestAccountDeletion);

/**
 * @swagger
 * /gdpr/cancel-deletion:
 *   post:
 *     summary: Cancel account deletion request
 *     tags: [GDPR]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Account deletion cancelled
 */
router.post('/cancel-deletion', cancelAccountDeletion);

export default router;
