import mongoose from "mongoose";

const learningProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  language: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    default: "beginner"
  },
  xp: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  lastActiveDate: {
    type: Date,
    default: Date.now
  },
  dailyChallenges: {
    completed: [{
      challengeId: String,
      completedAt: Date,
      score: Number,
      xpEarned: Number
    }],
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  vocabulary: {
    mastered: [{
      word: String,
      translation: String,
      masteredAt: Date,
      category: String
    }],
    learning: [{
      word: String,
      translation: String,
      attempts: Number,
      lastAttempt: Date
    }],
    totalWords: {
      type: Number,
      default: 0
    }
  },
  conversations: {
    totalSessions: {
      type: Number,
      default: 0
    },
    totalMinutes: {
      type: Number,
      default: 0
    },
    scenarios: [{
      name: String,
      completions: Number,
      bestScore: Number,
      lastPlayed: Date
    }]
  },
  videos: {
    watched: [{
      videoId: String,
      title: String,
      watchedAt: Date,
      progress: Number,
      completed: Boolean
    }],
    totalWatched: {
      type: Number,
      default: 0
    },
    totalMinutes: {
      type: Number,
      default: 0
    }
  },
  achievements: [{
    id: String,
    name: String,
    description: String,
    unlockedAt: Date,
    xpReward: Number
  }],
  weeklyStats: {
    days: [{
      date: Date,
      xpEarned: Number,
      minutesLearned: Number,
      wordsLearned: Number,
      challengesCompleted: Number
    }],
    weeklyGoal: {
      type: Number,
      default: 300 // XP goal
    },
    currentWeekXP: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Update streak on activity
learningProgressSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActive = new Date(this.lastActiveDate);
  lastActive.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) {
    // Same day, streak continues
    return;
  } else if (daysDiff === 1) {
    // Next day, increment streak
    this.streak += 1;
  } else {
    // Missed days, reset streak
    this.streak = 1;
  }
  
  this.lastActiveDate = new Date();
};

// Add XP and update level
learningProgressSchema.methods.addXP = function(amount) {
  this.xp += amount;
  this.weeklyStats.currentWeekXP += amount;
  
  // Update level based on XP
  if (this.xp >= 10000) {
    this.level = "advanced";
  } else if (this.xp >= 3000) {
    this.level = "intermediate";
  }
  
  return this.xp;
};

let LearningProgress;
try {
  LearningProgress = mongoose.model("LearningProgress");
} catch {
  LearningProgress = mongoose.model("LearningProgress", learningProgressSchema);
}

export default LearningProgress;