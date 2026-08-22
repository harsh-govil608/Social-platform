import express from 'express';
import {
    requestPasswordReset,
    verifyResetToken,
    resetPassword
} from '../controllers/passwordReset.controller.js';

const router = express.Router();

// POST /api/auth/forgot-password - Request password reset email
router.post('/forgot-password', requestPasswordReset);

// GET /api/auth/verify-reset-token/:token - Verify token is still valid
router.get('/verify-reset-token/:token', verifyResetToken);

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', resetPassword);

export default router;
