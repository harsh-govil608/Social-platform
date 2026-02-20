import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
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
  upgradeSubscription,
  seedLearningData
} from "../controllers/learning.controller.js";

const router = express.Router();

// Learning Progress
router.get("/progress", protectRoute, getLearningProgress);

// Daily Challenges
router.get("/challenges/daily", protectRoute, getDailyChallenges);
router.post("/challenges/complete", protectRoute, completeDailyChallenge);

// Vocabulary
router.get("/vocabulary/daily", protectRoute, getDailyVocabulary);
router.post("/vocabulary/master", protectRoute, masterVocabulary);

// Videos
router.get("/videos", protectRoute, getLearningVideos);
router.post("/videos/complete", protectRoute, completeVideo);

// Stats
router.get("/stats", protectRoute, getLearningStats);
router.get("/stats/weekly", protectRoute, getWeeklyStats);

// Leaderboard
router.get("/leaderboard", protectRoute, getLeaderboard);

// Subscription
router.get("/subscription/status", protectRoute, getSubscriptionStatus);
router.post("/subscription/upgrade", protectRoute, upgradeSubscription);

// Seed data
router.post("/seed", protectRoute, seedLearningData);

export default router;