import mongoose from 'mongoose';

const problemSubmissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DSAProblem',
    required: true
  },
  language: {
    type: String,
    enum: ['javascript', 'python', 'java', 'cpp'],
    required: true
  },
  code: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Memory Limit Exceeded', 'Runtime Error', 'Compile Error', 'Pending'],
    default: 'Pending'
  },
  runtime: {
    type: Number, // in ms
    default: 0
  },
  memory: {
    type: Number, // in MB
    default: 0
  },
  testCasesPassed: {
    type: Number,
    default: 0
  },
  totalTestCases: {
    type: Number,
    default: 0
  },
  testResults: [{
    input: String,
    expectedOutput: String,
    actualOutput: String,
    passed: Boolean,
    runtime: Number,
    memory: Number
  }],
  errorMessage: String,
  notes: String,
  isOptimal: {
    type: Boolean,
    default: false
  },
  timeComplexity: String,
  spaceComplexity: String,
  xpEarned: {
    type: Number,
    default: 0
  },
  coinsEarned: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Index for queries
problemSubmissionSchema.index({ userId: 1, problemId: 1 });
problemSubmissionSchema.index({ status: 1 });
problemSubmissionSchema.index({ createdAt: -1 });

// Compound index for user's solved problems
problemSubmissionSchema.index({ userId: 1, status: 1, problemId: 1 });

const ProblemSubmission = mongoose.model('ProblemSubmission', problemSubmissionSchema);
export default ProblemSubmission;