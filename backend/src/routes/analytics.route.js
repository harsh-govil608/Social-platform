import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  startSession,
  endSession,
  trackActivity,
  updateDailyTaskCompletion,
  getUserAnalytics,
  getPlatformAnalytics,
  getRetentionCohorts,
} from "../controllers/analytics.controller.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// User session tracking
router.post("/session/start", startSession);
router.post("/session/end", endSession);
router.post("/activity", trackActivity);

// Daily task completion tracking
router.post("/daily-task-completion", updateDailyTaskCompletion);

// Get user's personal analytics
router.get("/user", getUserAnalytics);

// Platform-wide analytics (admin only)
router.get("/platform", getPlatformAnalytics);
router.get("/cohorts", getRetentionCohorts);

export default router;
