import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { ingest, getArticles, getArticle, getRawStatus, retryRaw, getQueueStats } from "../controllers/wiki.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/wiki:
 *   get:
 *     summary: List wiki articles
 *     tags: [Wiki]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [vocabulary, language_term, general]
 *         description: Filter by article type
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of wiki articles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 articles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/WikiArticle'
 *                 total:
 *                   type: integer
 */
// Public — anyone can browse
router.get("/", getArticles);

// Queue health monitoring — must come before /:slug
router.get("/queue/stats", protectRoute, getQueueStats);

// /status/:rawId must come before /:slug to avoid "status" being treated as a slug
router.get("/status/:rawId", protectRoute, getRawStatus);

/**
 * @swagger
 * /api/wiki/ingest:
 *   post:
 *     summary: Submit raw content to be processed into a wiki article
 *     tags: [Wiki]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 description: Raw text content to process
 *               language:
 *                 type: string
 *                 description: Language of the content
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       202:
 *         description: Content accepted for processing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 rawId:
 *                   type: string
 *                   description: ID to track processing status
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 */
// Authenticated — submit content
router.post("/ingest", protectRoute, ingest);
router.post("/retry/:rawId", protectRoute, retryRaw);

// Public — read a single article
router.get("/:slug", getArticle);

export default router;
