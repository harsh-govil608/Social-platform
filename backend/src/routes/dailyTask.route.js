import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getTodayTask,
  startTask,
  completeAIPractice,
  offerPartnerInteraction,
  updateStreakAndComplete,
  getTaskHistory,
} from "../controllers/dailyTask.controller.js";
import { validatePartnerInteraction, validateCompleteAIPractice } from "../validators/learning.validator.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

/**
 * @swagger
 * /api/daily-task/today:
 *   get:
 *     summary: Get today's daily task for the authenticated user
 *     tags: [Daily Task]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Today's task returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 task:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [pending, in_progress, completed]
 *                     steps:
 *                       type: array
 *                       items:
 *                         type: object
 *                     xpReward:
 *                       type: integer
 *                     date:
 *                       type: string
 *                       format: date
 *       401:
 *         description: Not authenticated
 */
// Get today's task
router.get("/today", getTodayTask);

// Start the daily task
router.post("/start", startTask);

// Complete AI practice step
router.post("/complete-ai-practice", validateCompleteAIPractice, completeAIPractice);

// Offer/handle partner interaction
router.post("/partner-interaction", validatePartnerInteraction, offerPartnerInteraction);

// Update streak and complete the task
router.post("/complete", updateStreakAndComplete);

// Get task history
router.get("/history", getTaskHistory);

export default router;
