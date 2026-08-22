import express from 'express';
import {
  getReferralCode,
  getReferralStats,
  redeemRewards,
  getReferralLeaderboard
} from '../controllers/referral.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/code', protectRoute, getReferralCode);
router.get('/stats', protectRoute, getReferralStats);
router.post('/redeem', protectRoute, redeemRewards);
router.get('/leaderboard', protectRoute, getReferralLeaderboard);

export default router;
