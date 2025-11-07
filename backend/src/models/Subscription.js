import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  tier: {
    type: String,
    enum: ['free', 'basic', 'pro', 'enterprise'],
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'trialing', 'paused'],
    default: 'active'
  },
  stripeCustomerId: {
    type: String,
    sparse: true
  },
  stripeSubscriptionId: {
    type: String,
    sparse: true
  },
  stripePriceId: String,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  trialEnd: Date,
  // Usage limits per tier
  limits: {
    aiTutorSessions: {
      type: Number,
      default: 5 // Free tier gets 5 per month
    },
    dsaProblems: {
      type: Number,
      default: 10
    },
    conversationPractice: {
      type: Number,
      default: 5
    },
    codingChallenges: {
      type: Number,
      default: 10
    },
    videoCallMinutes: {
      type: Number,
      default: 60
    }
  },
  // Current month usage
  usage: {
    aiTutorSessions: {
      type: Number,
      default: 0
    },
    dsaProblems: {
      type: Number,
      default: 0
    },
    conversationPractice: {
      type: Number,
      default: 0
    },
    codingChallenges: {
      type: Number,
      default: 0
    },
    videoCallMinutes: {
      type: Number,
      default: 0
    },
    lastReset: {
      type: Date,
      default: Date.now
    }
  },
  // Billing
  paymentMethod: {
    last4: String,
    brand: String
  },
  billingHistory: [{
    date: Date,
    amount: Number,
    currency: String,
    status: String,
    invoiceId: String,
    invoiceUrl: String
  }],
  // Enterprise/White-label specific
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  customBranding: {
    enabled: {
      type: Boolean,
      default: false
    },
    logo: String,
    primaryColor: String,
    secondaryColor: String,
    customDomain: String
  }
}, { timestamps: true });

// Reset usage monthly
subscriptionSchema.methods.resetUsageIfNeeded = function() {
  const now = new Date();
  const lastReset = new Date(this.usage.lastReset);

  // Reset if it's been more than 30 days
  if (now - lastReset > 30 * 24 * 60 * 60 * 1000) {
    this.usage.aiTutorSessions = 0;
    this.usage.dsaProblems = 0;
    this.usage.conversationPractice = 0;
    this.usage.codingChallenges = 0;
    this.usage.videoCallMinutes = 0;
    this.usage.lastReset = now;
    return true;
  }
  return false;
};

// Check if user can use a feature
subscriptionSchema.methods.canUseFeature = function(feature) {
  this.resetUsageIfNeeded();

  if (this.tier === 'enterprise') return true; // Enterprise has unlimited

  return this.usage[feature] < this.limits[feature];
};

// Increment usage
subscriptionSchema.methods.incrementUsage = function(feature, amount = 1) {
  this.resetUsageIfNeeded();
  this.usage[feature] += amount;
};

// Get tier limits
subscriptionSchema.statics.getTierLimits = function(tier) {
  const limits = {
    free: {
      aiTutorSessions: 5,
      dsaProblems: 10,
      conversationPractice: 5,
      codingChallenges: 10,
      videoCallMinutes: 60,
      price: 0
    },
    basic: {
      aiTutorSessions: 50,
      dsaProblems: 100,
      conversationPractice: 50,
      codingChallenges: 100,
      videoCallMinutes: 500,
      price: 9.99
    },
    pro: {
      aiTutorSessions: 200,
      dsaProblems: 500,
      conversationPractice: 200,
      codingChallenges: 500,
      videoCallMinutes: 2000,
      price: 29.99
    },
    enterprise: {
      aiTutorSessions: -1, // Unlimited
      dsaProblems: -1,
      conversationPractice: -1,
      codingChallenges: -1,
      videoCallMinutes: -1,
      price: 'Custom'
    }
  };

  return limits[tier] || limits.free;
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
