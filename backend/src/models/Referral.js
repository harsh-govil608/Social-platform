import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referralCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  referrals: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'rewarded'],
      default: 'pending'
    },
    // Completed when referred user subscribes or completes X challenges
    completedAt: Date,
    rewardedAt: Date,
    conversionType: {
      type: String,
      enum: ['subscription', 'challenges', 'active_user']
    }
  }],
  // Rewards earned
  rewards: {
    totalCoins: {
      type: Number,
      default: 0
    },
    freePremiumDays: {
      type: Number,
      default: 0
    },
    cashRewards: {
      type: Number,
      default: 0
    },
    paidOut: {
      type: Boolean,
      default: false
    },
    payoutHistory: [{
      amount: Number,
      date: Date,
      method: String,
      transactionId: String
    }]
  },
  // Statistics
  stats: {
    totalReferrals: {
      type: Number,
      default: 0
    },
    completedReferrals: {
      type: Number,
      default: 0
    },
    activeReferrals: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    }
  },
  // Referral tiers (unlock better rewards with more referrals)
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'ambassador'],
    default: 'bronze'
  },
  tierProgress: {
    current: {
      type: Number,
      default: 0
    },
    nextTierAt: {
      type: Number,
      default: 5
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Index for efficient lookups
// referralCode index is already defined via unique:true on the field
referralSchema.index({ referrer: 1 });
referralSchema.index({ 'referrals.user': 1 });

// Methods
referralSchema.methods.addReferral = function(userId) {
  const existing = this.referrals.find(r => r.user.toString() === userId.toString());
  if (existing) {
    throw new Error('User already referred');
  }

  this.referrals.push({ user: userId });
  this.stats.totalReferrals += 1;
  this.updateTier();
};

referralSchema.methods.completeReferral = function(userId, conversionType) {
  const referral = this.referrals.find(r => r.user.toString() === userId.toString());
  if (!referral) {
    throw new Error('Referral not found');
  }

  if (referral.status === 'pending') {
    referral.status = 'completed';
    referral.completedAt = new Date();
    referral.conversionType = conversionType;
    this.stats.completedReferrals += 1;
    this.calculateRewards(conversionType);
    this.updateConversionRate();
  }
};

referralSchema.methods.calculateRewards = function(conversionType) {
  const tierMultipliers = {
    bronze: 1,
    silver: 1.2,
    gold: 1.5,
    platinum: 2,
    ambassador: 3
  };

  const baseRewards = {
    subscription: { coins: 1000, premiumDays: 7, cash: 5 },
    challenges: { coins: 500, premiumDays: 3, cash: 2 },
    active_user: { coins: 200, premiumDays: 1, cash: 0 }
  };

  const multiplier = tierMultipliers[this.tier];
  const base = baseRewards[conversionType];

  this.rewards.totalCoins += Math.floor(base.coins * multiplier);
  this.rewards.freePremiumDays += Math.floor(base.premiumDays * multiplier);
  this.rewards.cashRewards += base.cash * multiplier;
};

referralSchema.methods.updateTier = function() {
  const completed = this.stats.completedReferrals;

  if (completed >= 100) {
    this.tier = 'ambassador';
    this.tierProgress.nextTierAt = -1;
  } else if (completed >= 50) {
    this.tier = 'platinum';
    this.tierProgress.nextTierAt = 100;
  } else if (completed >= 20) {
    this.tier = 'gold';
    this.tierProgress.nextTierAt = 50;
  } else if (completed >= 10) {
    this.tier = 'silver';
    this.tierProgress.nextTierAt = 20;
  } else {
    this.tier = 'bronze';
    this.tierProgress.nextTierAt = 10;
  }

  this.tierProgress.current = completed;
};

referralSchema.methods.updateConversionRate = function() {
  if (this.stats.totalReferrals > 0) {
    this.stats.conversionRate = (this.stats.completedReferrals / this.stats.totalReferrals) * 100;
  }
};

// Generate unique referral code
referralSchema.statics.generateCode = async function() {
  let code;
  let exists = true;

  while (exists) {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const found = await this.findOne({ referralCode: code });
    exists = !!found;
  }

  return code;
};

const Referral = mongoose.model('Referral', referralSchema);

export default Referral;
