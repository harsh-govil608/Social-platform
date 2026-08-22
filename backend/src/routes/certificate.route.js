import express from 'express';
import { protectRoute, adminRoute } from '../middleware/auth.middleware.js';
import {
    getUserCertificates,
    getCertificate,
    verifyCertificate,
    downloadCertificate,
    updateCertificateVisibility,
    getCertificateStats,
    issueCertificate,
    getPublicCertificates
} from '../controllers/certificate.controller.js';

const router = express.Router();

/**
 * @swagger
 * /certificates/verify/{certificateId}:
 *   get:
 *     summary: Verify a certificate (public endpoint)
 *     tags: [Certificates]
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique certificate verification ID (UUID)
 *     responses:
 *       200:
 *         description: Certificate verification result
 */
router.get('/verify/:certificateId', verifyCertificate);

/**
 * @swagger
 * /certificates/user/{userId}:
 *   get:
 *     summary: Get public certificates for a user
 *     tags: [Certificates]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of public certificates
 */
router.get('/user/:userId', getPublicCertificates);

// Protected routes (require authentication)
router.use(protectRoute);

/**
 * @swagger
 * /certificates:
 *   get:
 *     summary: Get all certificates for authenticated user
 *     tags: [Certificates]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [course, contest, achievement, skill, language_level]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of user's certificates
 */
router.get('/', getUserCertificates);

/**
 * @swagger
 * /certificates/stats:
 *   get:
 *     summary: Get certificate statistics for user
 *     tags: [Certificates]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Certificate statistics
 */
router.get('/stats', getCertificateStats);

/**
 * @swagger
 * /certificates/{id}:
 *   get:
 *     summary: Get a specific certificate
 *     tags: [Certificates]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Certificate details
 */
router.get('/:id', getCertificate);

/**
 * @swagger
 * /certificates/{id}/download:
 *   get:
 *     summary: Download certificate as PDF
 *     tags: [Certificates]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/:id/download', downloadCertificate);

/**
 * @swagger
 * /certificates/{id}/visibility:
 *   patch:
 *     summary: Update certificate visibility (public/private)
 *     tags: [Certificates]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Certificate visibility updated
 */
router.patch('/:id/visibility', updateCertificateVisibility);

/**
 * @swagger
 * /certificates:
 *   post:
 *     summary: Issue a new certificate (admin only)
 *     tags: [Certificates]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - type
 *               - title
 *               - description
 *             properties:
 *               userId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [course, contest, achievement, skill, language_level]
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               metadata:
 *                 type: object
 *               template:
 *                 type: string
 *     responses:
 *       201:
 *         description: Certificate issued
 */
router.post('/', adminRoute, issueCertificate);

export default router;
