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
