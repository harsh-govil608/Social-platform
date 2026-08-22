import mongoose from "mongoose";

const learningSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  
  // XP and Level System
  totalXP: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  coins: {
    type: Number,
    default: 100 // Starting coins
  },
  
  // Streaks
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastActivityDate: Date,
  
  // Daily Challenges
  dailyChallenges: {
    date: Date,
    challenges: [{
      challengeId: String,
      title: String,
      type: String,
      difficulty: String,
      xpReward: Number,
      coinsReward: Number,
      premium: Boolean
    }],
    completed: [String] // Array of completed challenge IDs
  },
  
  // Conversation Sessions
  conversationSessions: [{
    date: Date,
    scenario: String,
    duration: Number, // in seconds
    score: Number,
    feedback: {
      grammarScore: Number,
      fluencyScore: Number,
      vocabularyScore: Number
    }
  }],
  
  // Vocabulary
  masteredWords: [{
    word: String,
    translation: String,
    language: String,
    masteredAt: Date,
    reviewCount: {
      type: Number,
      default: 0
    }
  }],
  
  difficultWords: [{
    word: String,
    translation: String,
    language: String,
    attempts: Number,
    lastAttempt: Date
  }],
  
  // Videos
  watchedVideos: [String], // Array of video IDs
  videoProgress: [{
    videoId: String,
    watchedPercentage: Number,
    lastWatched: Date,
    notes: String
  }],
  
  // Achievements
  achievements: [{
    achievementId: String,
    name: String,
    description: String,
    icon: String,
    unlockedAt: Date,
    xpReward: Number,
    coinsReward: Number
  }],
  
  // Study Stats
  totalStudyTime: {
    type: Number,
    default: 0 // in seconds
  },
  studySessions: [{
    date: Date,
    duration: Number,
    type: String // 'video', 'conversation', 'vocabulary', 'challenge'
  }],
  
  // Subscription
  subscription: {
    status: {
      type: String,
      enum: ['free', 'active', 'expired', 'cancelled'],
      default: 'free'
    },
    plan: {
      type: String,
      enum: ['free', 'monthly', 'yearly', 'lifetime']
    },
    startDate: Date,
    endDate: Date,
    paymentMethod: String,
    autoRenew: {
      type: Boolean,
      default: true
    }
  },
  
  // Preferences
  preferences: {
    dailyGoal: {
      type: Number,
      default: 30 // minutes per day
    },
    reminderTime: String, // e.g., "09:00"
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    preferredDifficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'adaptive'],
      default: 'adaptive'
    }
  },
  
  // Learning Paths Progress
  learningPaths: [{
    pathName: String,
    progress: Number, // 0-100
    completedModules: Number,
    totalModules: Number,
    startedAt: Date,
    completedAt: Date
  }],
  
  // Quiz Scores
  quizHistory: [{
    date: Date,
    type: String,
    score: Number,
    totalQuestions: Number,
    timeSpent: Number,
    category: String
  }],
  
  // Social Learning
  studyPartners: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    sessionsCompleted: Number,
    lastSession: Date,
    rating: Number
  }],
  
  // Badges and Rewards
  badges: [{
    badgeId: String,
    name: String,
    description: String,
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze'
    },
    earnedAt: Date
  }],
  
  // Learning Analytics
  analytics: {
    strongAreas: [String],
    weakAreas: [String],
    averageSessionTime: Number,
    bestTimeToStudy: String,
    learningStyle: {
      type: String,
      enum: ['visual', 'auditory', 'reading', 'kinesthetic'],
      default: 'visual'
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
learningSchema.index({ userId: 1 });
learningSchema.index({ 'subscription.status': 1 });
learningSchema.index({ level: 1 });
learningSchema.index({ currentStreak: -1 });

// Methods
learningSchema.methods.addXP = function(amount) {
  this.totalXP += amount;
  const newLevel = Math.floor(this.totalXP / 1000) + 1;
  
  if (newLevel > this.level) {
    this.level = newLevel;
    // Award level up bonus
    this.coins += 100 * newLevel;
    return { leveledUp: true, newLevel, bonusCoins: 100 * newLevel };
  }
  
  return { leveledUp: false };
};

learningSchema.methods.updateStreak = function() {
  const today = new Date().toDateString();
  const lastActivity = this.lastActivityDate?.toDateString();
  
  if (lastActivity === today) {
    return this.currentStreak;
  }
  
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
  
  if (lastActivity === yesterday) {
    this.currentStreak += 1;
    if (this.currentStreak > this.longestStreak) {
      this.longestStreak = this.currentStreak;
    }
  } else {
    this.currentStreak = 1;
  }
  
  this.lastActivityDate = new Date();
  return this.currentStreak;
};

learningSchema.methods.isPremium = function() {
  return this.subscription.status === 'active' && 
         this.subscription.endDate > new Date();
};

learningSchema.methods.canAccessPremiumContent = function() {
  return this.isPremium() || this.coins >= 100; // Can use coins for one-time access
};

const Learning = mongoose.model("Learning", learningSchema);
export default Learning;