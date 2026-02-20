import express from 'express';
import { protectRoute } from "../middleware/auth.middleware.js";
import { signup, logout, onboard, login } from "../controllers/auth.controller.js";
import { validateSignup, validateLogin, handleValidationErrors } from "../validators/auth.validator.js";
import { signupLimiter, loginLimiter } from "../middleware/security.middleware.js";
import {
    requestPasswordReset,
    verifyResetToken,
    resetPassword
} from '../controllers/passwordReset.controller.js';
import {
    sendVerificationEmail,
    verifyEmail,
    resendVerificationEmail,
    getVerificationStatus
} from '../controllers/emailVerification.controller.js';

const router= express.Router();

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or user already exists
 */
router.post("/signup", signupLimiter, validateSignup, handleValidationErrors, signup);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", loginLimiter, validateLogin, handleValidationErrors, login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", logout);

/**
 * @swagger
 * /auth/onboarding:
 *   post:
 *     summary: Complete user onboarding
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nativeLanguage:
 *                 type: string
 *               learningLanguage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Onboarding completed
 */
router.post("/onboarding", protectRoute, onboard);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 */
router.get("/me", protectRoute, (req,res)=>{
    res.status(200).json({ success: true, user: req.user});
});

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: If email exists, reset link sent
 *       429:
 *         description: Too many requests
 */
router.post("/forgot-password", requestPasswordReset);

/**
 * @swagger
 * /auth/verify-reset-token/{token}:
 *   get:
 *     summary: Verify password reset token is valid
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Token is valid
 *       400:
 *         description: Invalid or expired token
 */
router.get("/verify-reset-token/:token", verifyResetToken);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid token or password
 */
router.post("/reset-password", resetPassword);

// Email Verification Routes
/**
 * @swagger
 * /auth/send-verification:
 *   post:
 *     summary: Send email verification link (authenticated)
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Verification email sent
 *       429:
 *         description: Too many requests
 */
router.post("/send-verification", protectRoute, sendVerificationEmail);

/**
 * @swagger
 * /auth/verify-email/{token}:
 *   get:
 *     summary: Verify email with token
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
router.get("/verify-email/:token", verifyEmail);

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     summary: Resend verification email (public)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: If email is unverified, verification link sent
 *       429:
 *         description: Too many requests
 */
router.post("/resend-verification", resendVerificationEmail);

/**
 * @swagger
 * /auth/verification-status:
 *   get:
 *     summary: Check email verification status
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Verification status returned
 */
router.get("/verification-status", protectRoute, getVerificationStatus);

export default router;