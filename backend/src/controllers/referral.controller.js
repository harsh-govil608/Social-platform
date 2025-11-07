import Referral from '../models/Referral.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import UserActivity from '../models/UserActivity.js';

// Get or create user's referral code
export const getReferralCode = async (req, res) => {
  try {
    let referral = await Referral.findOne({ referrer: req.user._id });

    if (!referral) {
      const code = await Referral.generateCode();
      referral = await Referral.create({
        referrer: req.user._id,
        referralCode: code
      });
    }

    res.json({
      referralCode: referral.referralCode,
      referralUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/signup?ref=${referral.referralCode}`,
      stats: referral.stats,
      tier: referral.tier,
      rewards: referral.rewards
    });
  } catch (error) {
    console.error('Error getting referral code:', error);
    res.status(500).json({ message: 'Failed to get referral code' });
  }
};

// Apply referral code during signup
export const applyReferralCode = async (userId, referralCode) => {
  try {
    if (!referralCode) return;

    const referral = await Referral.findOne({ referralCode: referralCode.toUpperCase() });
    if (!referral) {
      console.log('Referral code not found:', referralCode);
      return;
    }

    // Check if user is not referring themselves
    if (referral.referrer.toString() === userId.toString()) {
      console.log('User cannot refer themselves');
      return;
    }

    // Add referral
    referral.addReferral(userId);
    await referral.save();

    // Give bonus to new user
    const user = await User.findById(userId);
    if (user) {
      // Give 500 bonus coins to new user
      const userActivity = await UserActivity.findOne({ user: userId });
      if (userActivity) {
        userActivity.gamification.coins += 500;
        await userActivity.save();
      }
    }

    console.log(`✅ Referral applied: ${referralCode} for user ${userId}`);
  } catch (error) {
    console.error('Error applying referral code:', error);
  }
};

// Track referral conversion
export const trackReferralConversion = async (userId, conversionType) => {
  try {
    // Find referral where this user was referred
    const referral = await Referral.findOne({ 'referrals.user': userId });
    if (!referral) return;

    referral.completeReferral(userId, conversionType);
    await referral.save();

    console.log(`✅ Referral conversion tracked: ${conversionType} for user ${userId}`);
  } catch (error) {
    console.error('Error tracking referral conversion:', error);
  }
};

// Get referral statistics
export const getReferralStats = async (req, res) => {
  try {
    const referral = await Referral.findOne({ referrer: req.user._id })
      .populate('referrals.user', 'fullName profilePicture createdAt');

    if (!referral) {
      return res.json({
        stats: {
          totalReferrals: 0,
          completedReferrals: 0,
          activeReferrals: 0,
          conversionRate: 0
        },
        referrals: [],
        tier: 'bronze',
        rewards: {
          totalCoins: 0,
          freePremiumDays: 0,
          cashRewards: 0
        }
      });
    }

    res.json({
      stats: referral.stats,
      referrals: referral.referrals,
      tier: referral.tier,
      tierProgress: referral.tierProgress,
      rewards: referral.rewards
    });
  } catch (error) {
    console.error('Error getting referral stats:', error);
    res.status(500).json({ message: 'Failed to get referral stats' });
  }
};

// Redeem referral rewards
export const redeemRewards = async (req, res) => {
  try {
    const { rewardType } = req.body; // 'coins', 'premium', 'cash'

    const referral = await Referral.findOne({ referrer: req.user._id });
    if (!referral) {
      return res.status(404).json({ message: 'No referral program found' });
    }

    if (rewardType === 'coins') {
      if (referral.rewards.totalCoins === 0) {
        return res.status(400).json({ message: 'No coins to redeem' });
      }

      // Add coins to user activity
      const userActivity = await UserActivity.findOne({ user: req.user._id });
      if (userActivity) {
        userActivity.gamification.coins += referral.rewards.totalCoins;
        await userActivity.save();
      }

      referral.rewards.totalCoins = 0;
      await referral.save();

      return res.json({ message: 'Coins redeemed successfully' });
    }

    if (rewardType === 'premium') {
      if (referral.rewards.freePremiumDays === 0) {
        return res.status(400).json({ message: 'No premium days to redeem' });
      }

      // Extend premium subscription
      let subscription = await Subscription.findOne({ user: req.user._id });
      if (!subscription) {
        subscription = await Subscription.create({ user: req.user._id });
      }

      const daysToAdd = referral.rewards.freePremiumDays;
      const newEndDate = subscription.currentPeriodEnd
        ? new Date(subscription.currentPeriodEnd.getTime() + daysToAdd * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);

      subscription.currentPeriodEnd = newEndDate;
      await subscription.save();

      referral.rewards.freePremiumDays = 0;
      await referral.save();

      return res.json({ message: `${daysToAdd} premium days added` });
    }

    if (rewardType === 'cash') {
      if (referral.rewards.cashRewards < 10) {
        return res.status(400).json({ message: 'Minimum $10 required for cash payout' });
      }

      // In production, integrate with payment provider (Stripe Connect, PayPal, etc.)
      // For now, just mark as pending
      return res.json({
        message: 'Cash payout request received. You will be contacted via email.',
        amount: referral.rewards.cashRewards
      });
    }

    res.status(400).json({ message: 'Invalid reward type' });
  } catch (error) {
    console.error('Error redeeming rewards:', error);
    res.status(500).json({ message: 'Failed to redeem rewards' });
  }
};

// Get referral leaderboard
export const getReferralLeaderboard = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const leaderboard = await Referral.find()
      .populate('referrer', 'fullName profilePicture username')
      .sort({ 'stats.completedReferrals': -1 })
      .limit(parseInt(limit));

    // Get user's rank
    const userReferral = await Referral.findOne({ referrer: req.user._id });
    let userRank = 0;
    if (userReferral) {
      const higherRanked = await Referral.countDocuments({
        'stats.completedReferrals': { $gt: userReferral.stats.completedReferrals }
      });
      userRank = higherRanked + 1;
    }

    res.json({
      leaderboard: leaderboard.map((entry, index) => ({
        rank: index + 1,
        user: entry.referrer,
        completedReferrals: entry.stats.completedReferrals,
        tier: entry.tier,
        rewards: entry.rewards
      })),
      userRank,
      userStats: userReferral ? {
        completedReferrals: userReferral.stats.completedReferrals,
        tier: userReferral.tier
      } : null
    });
  } catch (error) {
    console.error('Error getting referral leaderboard:', error);
    res.status(500).json({ message: 'Failed to get referral leaderboard' });
  }
};
