import mongoose from 'mongoose';

const learningProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // XP and Level System
  totalXP: {
    type: Number,
    default: 0
  },
  currentLevel: {
    type: Number,
    default: 1
  },
  
  // Streak Tracking
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastActivityDate: {
    type: Date,
    default: Date.now
  },
  
  // Learning Stats
  totalStudyTime: {
    type: Number,
    default: 0 // in minutes
  },
  wordsLearned: {
    type: Number,
    default: 0
  },
  conversationsCompleted: {
    type: Number,
    default: 0
  },
  
  // Video Lessons Progress
  completedLessons: [{
    lessonId: String,
    completedAt: Date,
    xpEarned: Number
  }],
  
  // Learning Paths Progress
  learningPaths: [{
    pathName: String,
    progress: Number,
    totalModules: Number,
    completedModules: Number,
    startedAt: Date,
    completedAt: Date
  }],
  
  // Daily Challenges
  dailyChallenges: [{
    challengeId: String,
    title: String,
    completed: Boolean,
    xpEarned: Number,
    completedAt: Date,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Achievements
  achievements: [{
    achievementId: String,
    name: String,
    unlockedAt: Date,
    icon: String
  }],
  
  // Language Partners
  languagePartners: [{
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sessionsCompleted: Number,
    totalTime: Number,
    rating: Number,
    lastSession: Date
  }],
  
  // Vocabulary
  vocabulary: [{
    word: String,
    translation: String,
    language: String,
    learnedAt: Date,
    reviewCount: Number,
    lastReviewed: Date
  }],
  
  // Pronunciation Practice
  completedPhrases: [{
    type: String // Phrase IDs that have been completed
  }],
  
  practiceHistory: [{
    type: {
      type: String,
      enum: ['pronunciation', 'grammar', 'conversation']
    },
    phraseId: String,
    score: Number,
    accuracy: Number,
    completedAt: Date
  }]
}, {
  timestamps: true
});

// Update streak on activity
learningProgressSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActivity = new Date(this.lastActivityDate);
  lastActivity.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) {
    // Same day activity, streak continues
    return;
  } else if (daysDiff === 1) {
    // Next day activity, increment streak
    this.currentStreak += 1;
    if (this.currentStreak > this.longestStreak) {
      this.longestStreak = this.currentStreak;
    }
  } else {
    // Streak broken, reset to 1
    this.currentStreak = 1;
  }
  
  this.lastActivityDate = new Date();
};

// Calculate level from XP
learningProgressSchema.methods.calculateLevel = function() {
  const xpPerLevel = 500;
  this.currentLevel = Math.floor(this.totalXP / xpPerLevel) + 1;
};

// Add XP and check for level up
learningProgressSchema.methods.addXP = function(amount) {
  const previousLevel = this.currentLevel;
  this.totalXP += amount;
  this.calculateLevel();
  
  return {
    xpAdded: amount,
    totalXP: this.totalXP,
    leveledUp: this.currentLevel > previousLevel,
    newLevel: this.currentLevel
  };
};

const LearningProgress = mongoose.model('LearningProgress', learningProgressSchema);

export default LearningProgress;