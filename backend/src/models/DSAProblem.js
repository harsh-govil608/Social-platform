import mongoose from 'mongoose';

const dsaProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  category: {
    type: String,
    enum: ['Array', 'String', 'LinkedList', 'Tree', 'Graph', 'DynamicProgramming', 'Sorting', 'Searching', 'Stack', 'Queue', 'Heap', 'Math', 'BitManipulation', 'Greedy', 'Backtracking', 'TwoPointers', 'SlidingWindow', 'DivideConquer', 'Recursion', 'BinarySearch'],
    required: true
  },
  tags: [{
    type: String
  }],
  description: {
    type: String,
    required: true
  },
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  constraints: [{
    type: String
  }],
  hints: [{
    type: String
  }],
  starterCode: {
    javascript: String,
    python: String,
    java: String,
    cpp: String
  },
  solution: {
    javascript: String,
    python: String,
    java: String,
    cpp: String,
    explanation: String,
    timeComplexity: String,
    spaceComplexity: String
  },
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: {
      type: Boolean,
      default: false
    }
  }],
  submissions: {
    type: Number,
    default: 0
  },
  accepted: {
    type: Number,
    default: 0
  },
  acceptanceRate: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  companies: [{
    type: String
  }],
  similarProblems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DSAProblem'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isPremium: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Index for faster queries
dsaProblemSchema.index({ difficulty: 1, category: 1 });
dsaProblemSchema.index({ tags: 1 });
dsaProblemSchema.index({ title: 'text', description: 'text' });

const DSAProblem = mongoose.model('DSAProblem', dsaProblemSchema);
export default DSAProblem;