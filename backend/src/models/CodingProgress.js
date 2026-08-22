import mongoose from 'mongoose';

const codingProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  languagesLearned: [{
    type: String,
    enum: ['javascript', 'python', 'java', 'cpp', 'rust']
  }],
  problemsSolved: {
    type: Number,
    default: 0
  },
  totalXP: {
    type: Number,
    default: 0
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  rank: {
    type: String,
    default: 'Beginner',
    enum: ['Beginner', 'Novice', 'Intermediate', 'Advanced', 'Expert', 'Master']
  },
  solvedChallenges: [{
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CodingChallenge'
    },
    language: String,
    solvedAt: {
      type: Date,
      default: Date.now
    },
    attempts: {
      type: Number,
      default: 1
    },
    executionTime: Number
  }],
  lastActiveDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const CodingProgress = mongoose.model('CodingProgress', codingProgressSchema);
export default CodingProgress;