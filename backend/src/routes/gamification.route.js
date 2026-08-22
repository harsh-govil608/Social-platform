import express from 'express';
import {
  getAllAchievements,
  getUserAchievements,
  getLeaderboard
} from '../controllers/gamification.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/achievements', protectRoute, getAllAchievements);
router.get('/achievements/me', protectRoute, getUserAchievements);
router.get('/leaderboard', protectRoute, getLeaderboard);

export default router;
