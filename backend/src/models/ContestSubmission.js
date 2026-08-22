import mongoose from 'mongoose';

const testResultSchema = new mongoose.Schema({
    testCaseIndex: Number,
    passed: Boolean,
    actualOutput: String,
    expectedOutput: String,
    executionTime: Number, // milliseconds
    memoryUsed: Number, // MB
    error: String
}, { _id: false });

const contestSubmissionSchema = new mongoose.Schema({
    contestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contest',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    problemIndex: {
        type: Number,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true,
        enum: ['javascript', 'python', 'java', 'cpp', 'go', 'rust']
    },
    status: {
        type: String,
        enum: ['pending', 'running', 'accepted', 'wrong_answer', 'time_limit', 'memory_limit', 'runtime_error', 'compile_error'],
        default: 'pending'
    },
    testResults: [testResultSchema],
    passedTests: {
        type: Number,
        default: 0
    },
    totalTests: {
        type: Number,
        default: 0
    },
    score: {
        type: Number,
        default: 0
    },
    executionTime: {
        type: Number, // total execution time in ms
        default: 0
    },
    memoryUsed: {
        type: Number, // peak memory in MB
        default: 0
    },
    errorMessage: {
        type: String,
        default: ''
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    judgedAt: {
        type: Date
    },
    // Time from contest start to submission
    timeTaken: {
        type: Number, // in seconds
        default: 0
    }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
contestSubmissionSchema.index({ contestId: 1, userId: 1, problemIndex: 1 });
contestSubmissionSchema.index({ contestId: 1, problemIndex: 1, status: 1, score: -1 });
contestSubmissionSchema.index({ userId: 1, status: 1 });

// Virtual for pass rate
contestSubmissionSchema.virtual('passRate').get(function() {
    if (this.totalTests === 0) return 0;
    return Math.round((this.passedTests / this.totalTests) * 100);
});

// Static method to get best submission for a user on a problem
contestSubmissionSchema.statics.getBestSubmission = async function(contestId, userId, problemIndex) {
    return this.findOne({
        contestId,
        userId,
        problemIndex,
        status: 'accepted'
    })
    .sort({ score: -1, submittedAt: 1 })
    .limit(1);
};

// Static method to get all submissions for a contest problem
contestSubmissionSchema.statics.getProblemSubmissions = async function(contestId, problemIndex) {
    return this.find({
        contestId,
        problemIndex,
        status: 'accepted'
    })
    .populate('userId', 'fullName profilePic')
    .sort({ score: -1, timeTaken: 1 })
    .limit(100);
};

// Static method to get user's submissions for a contest
contestSubmissionSchema.statics.getUserContestSubmissions = async function(contestId, userId) {
    return this.find({
        contestId,
        userId
    })
    .sort({ submittedAt: -1 });
};

// Static method to count submissions
contestSubmissionSchema.statics.getSubmissionStats = async function(contestId) {
    const stats = await this.aggregate([
        { $match: { contestId: new mongoose.Types.ObjectId(contestId) } },
        {
            $group: {
                _id: '$problemIndex',
                totalSubmissions: { $sum: 1 },
                acceptedSubmissions: {
                    $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
                },
                uniqueUsers: { $addToSet: '$userId' }
            }
        },
        {
            $project: {
                problemIndex: '$_id',
                totalSubmissions: 1,
                acceptedSubmissions: 1,
                uniqueAttempts: { $size: '$uniqueUsers' },
                acceptanceRate: {
                    $cond: [
                        { $gt: ['$totalSubmissions', 0] },
                        { $multiply: [{ $divide: ['$acceptedSubmissions', '$totalSubmissions'] }, 100] },
                        0
                    ]
                }
            }
        }
    ]);

    return stats;
};

contestSubmissionSchema.set('toJSON', { virtuals: true });
contestSubmissionSchema.set('toObject', { virtuals: true });

const ContestSubmission = mongoose.model('ContestSubmission', contestSubmissionSchema);

export default ContestSubmission;
