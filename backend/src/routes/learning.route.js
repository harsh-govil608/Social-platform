import express from "express";
import {
  getLearningProgress,
  getDailyChallenges,
  completeDailyChallenge,
  getDailyVocabulary,
  masterVocabulary,
  getLearningVideos,
  completeVideo,
  getWeeklyStats,
  getLearningStats,
  getLeaderboard,
  getSubscriptionStatus,
  upgradeSubscription
} from "../controllers/learning.controller.js";

const router = express.Router();

// TEMPORARILY REMOVED AUTHENTICATION FOR TESTING
// Add protectRoute back to all routes when authentication is working

// Learning Progress
router.get("/progress", getLearningProgress);

// Daily Challenges
router.get("/challenges/daily", getDailyChallenges);
router.post("/challenges/complete", completeDailyChallenge);

// Vocabulary
router.get("/vocabulary/daily", getDailyVocabulary);
router.post("/vocabulary/master", masterVocabulary);

// Videos
router.get("/videos", getLearningVideos);
router.post("/videos/complete", completeVideo);

// Stats
router.get("/stats", getLearningStats);
router.get("/stats/weekly", getWeeklyStats);

// Leaderboard
router.get("/leaderboard", getLeaderboard);

// Subscription
router.get("/subscription/status", getSubscriptionStatus);
router.post("/subscription/upgrade", upgradeSubscription);

export default router;