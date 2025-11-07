import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['learning', 'social', 'coding', 'language', 'milestone', 'special'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  requirement: {
    type: Number,
    default: 0
  },
  // Unlock criteria
  criteria: {
    type: {
      type: String,
      enum: ['count', 'streak', 'score', 'special'],
      required: true
    },
    metric: String, // e.g., 'dsaProblemsCompleted', 'loginStreak', 'friendsCount'
    target: Number, // Target value to unlock
    description: String
  },
  // Rewards
  rewards: {
    xp: {
      type: Number,
      default: 0
    },
    coins: {
      type: Number,
      default: 0
    },
    badge: String,
    unlockFeature: String // e.g., 'custom_profile_theme'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isSecret: {
    type: Boolean,
    default: false
  },
  unlockedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  totalUnlocks: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Index for efficient queries
achievementSchema.index({ category: 1, difficulty: 1 });

const Achievement = mongoose.model('Achievement', achievementSchema);

export default Achievement;
