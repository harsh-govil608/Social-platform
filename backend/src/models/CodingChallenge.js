import mongoose from 'mongoose';

const codingChallengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'python', 'java', 'cpp', 'rust']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'advanced']
  },
  xp: {
    type: Number,
    required: true,
    default: 10
  },
  coins: {
    type: Number,
    default: 5
  },
  hints: [{
    type: String
  }],
  testCases: [{
    input: String,
    expected: String,
    name: String
  }],
  active: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String
  }],
  category: {
    type: String,
    enum: ['basics', 'arrays', 'strings', 'algorithms', 'data-structures', 'dynamic-programming', 'graphs', 'trees']
  },
  solution: {
    type: String
  },
  starterCode: {
    type: String
  }
}, { timestamps: true });

// Index for faster queries
codingChallengeSchema.index({ language: 1, difficulty: 1, active: 1 });
codingChallengeSchema.index({ tags: 1 });

const CodingChallenge = mongoose.model('CodingChallenge', codingChallengeSchema);
export default CodingChallenge;