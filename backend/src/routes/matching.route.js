import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
    getPartnerMatches,
    updateMatchingPreferences,
    getMatchingPreferences,
    getPartnerProfile,
    searchPartners
} from '../controllers/matching.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

/**
 * @swagger
 * /matching/partners:
 *   get:
 *     summary: Get recommended language partners
 *     tags: [Partner Matching]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of matched partners with compatibility scores
 */
router.get('/partners', getPartnerMatches);

/**
 * @swagger
 * /matching/search:
 *   get:
 *     summary: Search for language partners with specific criteria
 *     tags: [Partner Matching]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: nativeLanguage
 *         schema:
 *           type: string
 *       - in: query
 *         name: learningLanguage
 *         schema:
 *           type: string
 *       - in: query
 *         name: proficiency
 *         schema:
 *           type: string
 *           enum: [beginner, elementary, intermediate, upper_intermediate, advanced, native]
 *       - in: query
 *         name: timezone
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of matching partners
 */
router.get('/search', searchPartners);

/**
 * @swagger
 * /matching/preferences:
 *   get:
 *     summary: Get user's matching preferences
 *     tags: [Partner Matching]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User's current matching preferences
 */
router.get('/preferences', getMatchingPreferences);

/**
 * @swagger
 * /matching/preferences:
 *   post:
 *     summary: Update matching preferences
 *     tags: [Partner Matching]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               timezone:
 *                 type: string
 *               learningGoals:
 *                 type: array
 *                 items:
 *                   type: string
 *               availability:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     day:
 *                       type: string
 *                     startHour:
 *                       type: integer
 *                     endHour:
 *                       type: integer
 *               languageProficiency:
 *                 type: string
 *                 enum: [beginner, elementary, intermediate, upper_intermediate, advanced, native]
 *     responses:
 *       200:
 *         description: Preferences updated
 */
router.post('/preferences', updateMatchingPreferences);

/**
 * @swagger
 * /matching/partner/{partnerId}:
 *   get:
 *     summary: Get detailed profile of a potential partner
 *     tags: [Partner Matching]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: partnerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Partner profile with compatibility details
 */
router.get('/partner/:partnerId', getPartnerProfile);

export default router;
