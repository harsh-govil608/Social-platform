import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    points: {
        type: Number,
        required: true
    },
    testCases: [{
        input: String,
        expectedOutput: String,
        isHidden: {
            type: Boolean,
            default: false
        }
    }],
    starterCode: {
        type: Map,
        of: String // language -> code
    },
    solution: {
        type: String,
        default: ''
    },
    hints: [{
        type: String
    }],
    timeLimit: {
        type: Number,
        default: 5000 // milliseconds
    },
    memoryLimit: {
        type: Number,
        default: 256 // MB
    }
});

const contestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['weekly', 'biweekly', 'special', 'practice'],
        default: 'weekly'
    },
    status: {
        type: String,
        enum: ['upcoming', 'live', 'ended'],
        default: 'upcoming'
    },
    startTime: {
        type: Date,
        required: true,
        index: true
    },
    endTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    problems: [problemSchema],
    participants: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        registeredAt: {
            type: Date,
            default: Date.now
        },
        startedAt: Date,
        finishedAt: Date,
        totalScore: {
            type: Number,
            default: 0
        },
        problemScores: [{
            problemIndex: Number,
            score: Number,
            attempts: Number,
            solvedAt: Date,
            timeTaken: Number // in seconds
        }],
        rank: Number
    }],
    // Prizes and rewards
    prizes: [{
        rank: Number, // 1, 2, 3, etc.
        description: String,
        rewardType: {
            type: String,
            enum: ['badge', 'points', 'subscription', 'certificate']
        },
        rewardValue: mongoose.Schema.Types.Mixed
    }],
    // Contest settings
    settings: {
        maxParticipants: {
            type: Number,
            default: 0 // 0 = unlimited
        },
        allowLateJoin: {
            type: Boolean,
            default: true
        },
        showLeaderboardDuring: {
            type: Boolean,
            default: true
        },
        shuffleProblems: {
            type: Boolean,
            default: false
        },
        penaltyTime: {
            type: Number, // penalty for wrong submission (in seconds)
            default: 300 // 5 minutes
        }
    },
    // Visibility
    isPublic: {
        type: Boolean,
        default: true
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Statistics
    stats: {
        totalRegistered: {
            type: Number,
            default: 0
        },
        totalParticipated: {
            type: Number,
            default: 0
        },
        avgScore: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Indexes
contestSchema.index({ status: 1, startTime: 1 });
contestSchema.index({ 'participants.userId': 1 });
contestSchema.index({ type: 1, startTime: -1 });

// Virtual for checking if contest is active
contestSchema.virtual('isActive').get(function() {
    const now = new Date();
    return now >= this.startTime && now <= this.endTime;
});

// Virtual for time remaining
contestSchema.virtual('timeRemaining').get(function() {
    const now = new Date();
    if (now < this.startTime) {
        return this.startTime.getTime() - now.getTime();
    }
    if (now <= this.endTime) {
        return this.endTime.getTime() - now.getTime();
    }
    return 0;
});

// Method to register a user
contestSchema.methods.registerUser = async function(userId) {
    const existingParticipant = this.participants.find(
        p => p.userId.toString() === userId.toString()
    );

    if (existingParticipant) {
        throw new Error('Already registered for this contest');
    }

    if (this.settings.maxParticipants > 0 &&
        this.participants.length >= this.settings.maxParticipants) {
        throw new Error('Contest is full');
    }

    this.participants.push({
        userId,
        registeredAt: new Date()
    });

    this.stats.totalRegistered = this.participants.length;
    await this.save();

    return this;
};

// Method to update leaderboard rankings
contestSchema.methods.updateRankings = async function() {
    // Sort participants by score (desc) and time taken (asc)
    const ranked = this.participants
        .filter(p => p.totalScore > 0)
        .sort((a, b) => {
            if (b.totalScore !== a.totalScore) {
                return b.totalScore - a.totalScore;
            }
            // If scores are equal, sort by total time
            const aTime = a.problemScores.reduce((sum, ps) => sum + (ps.timeTaken || 0), 0);
            const bTime = b.problemScores.reduce((sum, ps) => sum + (ps.timeTaken || 0), 0);
            return aTime - bTime;
        });

    ranked.forEach((participant, index) => {
        participant.rank = index + 1;
    });

    await this.save();
    return ranked;
};

// Static method to update contest statuses
contestSchema.statics.updateContestStatuses = async function() {
    const now = new Date();

    // Mark contests as live
    await this.updateMany(
        { status: 'upcoming', startTime: { $lte: now } },
        { status: 'live' }
    );

    // Mark contests as ended
    await this.updateMany(
        { status: 'live', endTime: { $lte: now } },
        { status: 'ended' }
    );
};

// Static method to get upcoming contests
contestSchema.statics.getUpcoming = function(limit = 10) {
    return this.find({
        status: 'upcoming',
        isPublic: true
    })
    .sort({ startTime: 1 })
    .limit(limit)
    .select('-problems.solution -problems.testCases');
};

// Static method to get live contests
contestSchema.statics.getLive = function() {
    return this.find({
        status: 'live',
        isPublic: true
    })
    .sort({ endTime: 1 })
    .select('-problems.solution');
};

contestSchema.set('toJSON', { virtuals: true });
contestSchema.set('toObject', { virtuals: true });

const Contest = mongoose.model('Contest', contestSchema);

export default Contest;
