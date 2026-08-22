import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  type: {
    type: String,
    enum: ['school', 'university', 'bootcamp', 'company', 'nonprofit'],
    required: true
  },
  // Admin user who created the org
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Additional admins
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Members
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'instructor', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Subscription
  subscription: {
    tier: {
      type: String,
      enum: ['starter', 'growth', 'enterprise'],
      default: 'starter'
    },
    seats: {
      type: Number,
      default: 50
    },
    usedSeats: {
      type: Number,
      default: 0
    },
    stripeSubscriptionId: String,
    status: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'trialing'],
      default: 'trialing'
    },
    currentPeriodEnd: Date,
    trialEnd: Date
  },
  // White-label branding
  branding: {
    logo: String,
    favicon: String,
    primaryColor: {
      type: String,
      default: '#3B82F6'
    },
    secondaryColor: {
      type: String,
      default: '#8B5CF6'
    },
    customDomain: String,
    emailFromName: String,
    emailFromAddress: String
  },
  // Features enabled
  features: {
    customBranding: {
      type: Boolean,
      default: false
    },
    sso: {
      type: Boolean,
      default: false
    },
    customCurriculum: {
      type: Boolean,
      default: false
    },
    advancedAnalytics: {
      type: Boolean,
      default: false
    },
    apiAccess: {
      type: Boolean,
      default: false
    },
    prioritySupport: {
      type: Boolean,
      default: false
    }
  },
  // Contact info
  contact: {
    email: String,
    phone: String,
    website: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },
  // Settings
  settings: {
    allowMemberInvites: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    emailDomain: String, // Auto-join if email matches
    defaultRole: {
      type: String,
      enum: ['member', 'instructor'],
      default: 'member'
    }
  },
  // Statistics
  stats: {
    totalMembers: {
      type: Number,
      default: 0
    },
    activeMembers: {
      type: Number,
      default: 0
    },
    totalLearningHours: {
      type: Number,
      default: 0
    },
    completedChallenges: {
      type: Number,
      default: 0
    }
  },
  // Billing
  billing: {
    stripeCustomerId: String,
    paymentMethod: {
      last4: String,
      brand: String
    },
    billingEmail: String,
    invoiceHistory: [{
      date: Date,
      amount: Number,
      currency: String,
      status: String,
      invoiceId: String,
      invoiceUrl: String
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Index for efficient queries
// slug index is already defined via unique:true on the field
organizationSchema.index({ 'members.user': 1 });
organizationSchema.index({ owner: 1 });

// Methods
organizationSchema.methods.addMember = function(userId, role = 'member') {
  if (this.subscription.usedSeats >= this.subscription.seats) {
    throw new Error('No available seats. Please upgrade your plan.');
  }

  const exists = this.members.find(m => m.user.toString() === userId.toString());
  if (exists) {
    throw new Error('User is already a member');
  }

  this.members.push({ user: userId, role });
  this.subscription.usedSeats += 1;
  this.stats.totalMembers += 1;
};

organizationSchema.methods.removeMember = function(userId) {
  const index = this.members.findIndex(m => m.user.toString() === userId.toString());
  if (index > -1) {
    this.members.splice(index, 1);
    this.subscription.usedSeats -= 1;
    this.stats.totalMembers -= 1;
  }
};

organizationSchema.methods.isMember = function(userId) {
  return this.members.some(m => m.user.toString() === userId.toString());
};

organizationSchema.methods.isAdmin = function(userId) {
  if (this.owner.toString() === userId.toString()) return true;
  return this.admins.some(adminId => adminId.toString() === userId.toString());
};

organizationSchema.methods.getMemberRole = function(userId) {
  const member = this.members.find(m => m.user.toString() === userId.toString());
  return member ? member.role : null;
};

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;
