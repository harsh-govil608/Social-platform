import express from 'express';
import { protectRoute, adminRoute } from '../middleware/auth.middleware.js';
import {
    getContests,
    getContest,
    registerForContest,
    submitSolution,
    getLeaderboard,
    getUserSubmissions,
    createContest
} from '../controllers/contest.controller.js';

const router = express.Router();

/**
 * @swagger
 * /contests:
 *   get:
 *     summary: Get list of contests
 *     tags: [Contests]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [upcoming, live, ended]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [weekly, biweekly, special, practice]
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
 *         description: List of contests
 */
router.get('/', getContests);

/**
 * @swagger
 * /contests/{id}:
 *   get:
 *     summary: Get contest details
 *     tags: [Contests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contest details
 */
router.get('/:id', getContest);

/**
 * @swagger
 * /contests/{id}/leaderboard:
 *   get:
 *     summary: Get contest leaderboard
 *     tags: [Contests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contest leaderboard
 */
router.get('/:id/leaderboard', getLeaderboard);

// Protected routes (require authentication)
router.use(protectRoute);

/**
 * @swagger
 * /contests/{id}/register:
 *   post:
 *     summary: Register for a contest
 *     tags: [Contests]
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
 *         description: Successfully registered
 */
router.post('/:id/register', registerForContest);

/**
 * @swagger
 * /contests/{id}/submit/{problemId}:
 *   post:
 *     summary: Submit solution for a problem
 *     tags: [Contests]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: problemId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - language
 *             properties:
 *               code:
 *                 type: string
 *               language:
 *                 type: string
 *                 enum: [javascript, python, java, cpp, go, rust]
 *     responses:
 *       200:
 *         description: Submission result
 */
router.post('/:id/submit/:problemId', submitSolution);

/**
 * @swagger
 * /contests/{id}/submissions:
 *   get:
 *     summary: Get user's submissions for a contest
 *     tags: [Contests]
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
 *         description: User's submissions
 */
router.get('/:id/submissions', getUserSubmissions);

/**
 * @swagger
 * /contests:
 *   post:
 *     summary: Create a new contest (admin only)
 *     tags: [Contests]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - startTime
 *               - duration
 *               - problems
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: integer
 *                 description: Duration in minutes
 *               problems:
 *                 type: array
 *     responses:
 *       201:
 *         description: Contest created
 */
router.post('/', adminRoute, createContest);

export default router;
