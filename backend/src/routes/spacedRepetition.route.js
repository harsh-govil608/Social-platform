import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
    getDueReviews,
    submitReview,
    addWord,
    addWordsBulk,
    updateWord,
    deleteWord,
    getVocabulary,
    getStats,
    getReviewForecast,
    resetWord,
    getTodaySession,
    submitReviewWithLimit,
    getDueReviewsWithLimit,
    getWeeklyStats,
    seedStarterWords
} from '../controllers/spacedRepetition.controller.js';
import { validateAddCustomVocab } from '../validators/learning.validator.js';

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

/**
 * @swagger
 * /vocabulary/today-session:
 *   get:
 *     summary: Get today's vocabulary session status
 *     tags: [Spaced Repetition]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Today's session status with limits
 */
router.get('/today-session', getTodaySession);

/**
 * @swagger
 * /vocabulary/weekly-stats:
 *   get:
 *     summary: Get weekly vocabulary statistics
 *     tags: [Spaced Repetition]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Weekly vocabulary stats
 */
router.get('/weekly-stats', getWeeklyStats);

/**
 * @swagger
 * /vocabulary/due-reviews-limited:
 *   get:
 *     summary: Get vocabulary words due for review (with daily limit)
 *     tags: [Spaced Repetition]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of words due for review (respecting daily limits)
 */
router.get('/due-reviews-limited', getDueReviewsWithLimit);

/**
 * @swagger
 * /vocabulary/due-reviews:
 *   get:
 *     summary: Get vocabulary words due for review
 *     tags: [Spaced Repetition]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of words due for review
 */
router.get('/due-reviews', getDueReviews);

/**
 * @swagger
 * /vocabulary/review-limited/{wordId}:
 *   post:
 *     summary: Submit a review with daily limit tracking
 *     tags: [Spaced Repetition]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: wordId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quality
 *             properties:
 *               quality:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 5
 *                 description: SM-2 quality rating (0=blackout, 5=perfect)
 *     responses:
 *       200:
 *         description: Review submitted successfully
 *       429:
 *         description: Daily limit reached
 */
router.post('/review-limited/:wordId', submitReviewWithLimit);

/**
 * @swagger
 * /vocabulary/review/{wordId}:
 *   post:
 *     summary: Submit a review for a vocabulary word
 *     tags: [Spaced Repetition]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: wordId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quality
 *             properties:
 *               quality:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 5
 *                 description: SM-2 quality rating (0=blackout, 5=perfect)
 *     responses:
 *       200:
 *         description: Review submitted successfully
 */
router.post('/review/:wordId', submitReview);

/**
 * @swagger
 * /vocabulary/stats:
 *   get:
 *     summary: Get vocabulary learning statistics
 *     tags: [Spaced Repetition]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User's vocabulary statistics
 */
router.get('/stats', getStats);

/**
 * @swagger
 * /vocabulary/forecast:
 *   get:
 *     summary: Get upcoming review forecast
 *     tags: [Spaced Repetition]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *     responses:
 *       200:
 *         description: Review forecast by day
 */
router.get('/forecast', getReviewForecast);

/**
 * @swagger
 * /vocabulary:
 *   get:
 *     summary: Get all vocabulary words
 *     tags: [Spaced Repetition]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: mastered
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Paginated vocabulary list
 */
router.get('/', getVocabulary);

/**
 * @swagger
 * /vocabulary:
 *   post:
 *     summary: Add a new vocabulary word
 *     tags: [Spaced Repetition]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - word
 *               - translation
 *               - sourceLanguage
 *               - targetLanguage
 *             properties:
 *               word:
 *                 type: string
 *               translation:
 *                 type: string
 *               pronunciation:
 *                 type: string
 *               exampleSentence:
 *                 type: string
 *               sourceLanguage:
 *                 type: string
 *               targetLanguage:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Word added successfully
 */
router.post('/', validateAddCustomVocab, addWord);

/**
 * @swagger
 * /vocabulary/bulk:
 *   post:
 *     summary: Add multiple vocabulary words at once
 *     tags: [Spaced Repetition]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - words
 *               - sourceLanguage
 *               - targetLanguage
 *             properties:
 *               words:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     word:
 *                       type: string
 *                     translation:
 *                       type: string
 *               sourceLanguage:
 *                 type: string
 *               targetLanguage:
 *                 type: string
 *     responses:
 *       201:
 *         description: Words added successfully
 */
router.post('/bulk', addWordsBulk);

// Seed starter vocabulary words for new users
router.post('/seed-starter', seedStarterWords);

/**
 * @swagger
 * /vocabulary/{wordId}:
 *   put:
 *     summary: Update a vocabulary word
 *     tags: [Spaced Repetition]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: wordId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Word updated successfully
 */
router.put('/:wordId', updateWord);

/**
 * @swagger
 * /vocabulary/{wordId}:
 *   delete:
 *     summary: Delete a vocabulary word
 *     tags: [Spaced Repetition]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: wordId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Word deleted successfully
 */
router.delete('/:wordId', deleteWord);

/**
 * @swagger
 * /vocabulary/{wordId}/reset:
 *   post:
 *     summary: Reset a word's progress
 *     tags: [Spaced Repetition]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: wordId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Word progress reset
 */
router.post('/:wordId/reset', resetWord);

export default router;
