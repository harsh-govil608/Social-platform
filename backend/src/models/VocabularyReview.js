import mongoose from 'mongoose';

const vocabularyReviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    // Word/phrase being learned
    word: {
        type: String,
        required: true
    },
    translation: {
        type: String,
        required: true
    },
    // Optional fields
    pronunciation: {
        type: String,
        default: ''
    },
    exampleSentence: {
        type: String,
        default: ''
    },
    exampleTranslation: {
        type: String,
        default: ''
    },
    notes: {
        type: String,
        default: ''
    },
    // Language info
    sourceLanguage: {
        type: String,
        required: true
    },
    targetLanguage: {
        type: String,
        required: true
    },
    // SM-2 Algorithm fields
    easeFactor: {
        type: Number,
        default: 2.5,
        min: 1.3,
        max: 5.0
    },
    interval: {
        type: Number,
        default: 0,
        min: 0
    },
    repetitions: {
        type: Number,
        default: 0,
        min: 0
    },
    nextReviewDate: {
        type: Date,
        default: Date.now,
        index: true
    },
    lastReviewDate: {
        type: Date,
        default: null
    },
    // Statistics
    totalReviews: {
        type: Number,
        default: 0
    },
    correctReviews: {
        type: Number,
        default: 0
    },
    // Categories/tags for organization
    category: {
        type: String,
        default: 'general'
    },
    tags: [{
        type: String
    }],
    // Source of the word (lesson, user-added, etc.)
    source: {
        type: String,
        enum: ['lesson', 'conversation', 'user', 'ai-tutor', 'import', 'starter'],
        default: 'user'
    },
    sourceId: {
        type: String, // Reference ID if from a specific lesson or conversation
        default: null
    },
    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    isMastered: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
vocabularyReviewSchema.index({ userId: 1, nextReviewDate: 1 });
vocabularyReviewSchema.index({ userId: 1, sourceLanguage: 1, targetLanguage: 1 });
vocabularyReviewSchema.index({ userId: 1, category: 1 });
vocabularyReviewSchema.index({ userId: 1, isActive: 1, nextReviewDate: 1 });
vocabularyReviewSchema.index({ userId: 1, isMastered: 1 });

// Prevent duplicate words for same user and language pair
vocabularyReviewSchema.index(
    { userId: 1, word: 1, sourceLanguage: 1, targetLanguage: 1 },
    { unique: true }
);

// Virtual for mastery percentage
vocabularyReviewSchema.virtual('masteryPercentage').get(function() {
    const repetitionScore = Math.min(this.repetitions / 7, 1) * 70;
    const easeScore = ((this.easeFactor - 1.3) / (3.0 - 1.3)) * 30;
    return Math.round(Math.min(100, repetitionScore + easeScore));
});

// Virtual for success rate
vocabularyReviewSchema.virtual('successRate').get(function() {
    if (this.totalReviews === 0) return 0;
    return Math.round((this.correctReviews / this.totalReviews) * 100);
});

// Virtual for difficulty rating
vocabularyReviewSchema.virtual('difficulty').get(function() {
    if (this.easeFactor >= 2.5) return 'easy';
    if (this.easeFactor >= 1.8) return 'medium';
    return 'hard';
});

// Virtual to check if review is due
vocabularyReviewSchema.virtual('isDue').get(function() {
    return new Date() >= this.nextReviewDate;
});

// Virtual for days until next review
vocabularyReviewSchema.virtual('daysUntilReview').get(function() {
    const now = new Date();
    const diff = this.nextReviewDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Ensure virtuals are included when converting to JSON
vocabularyReviewSchema.set('toJSON', { virtuals: true });
vocabularyReviewSchema.set('toObject', { virtuals: true });

// Static method to get due reviews for a user
vocabularyReviewSchema.statics.getDueReviews = async function(userId, limit = 20) {
    return this.find({
        userId,
        isActive: true,
        nextReviewDate: { $lte: new Date() }
    })
    .sort({ nextReviewDate: 1 })
    .limit(limit);
};

// Static method to get review statistics for a user
vocabularyReviewSchema.statics.getUserStats = async function(userId) {
    const stats = await this.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), isActive: true } },
        {
            $group: {
                _id: null,
                totalWords: { $sum: 1 },
                masteredWords: {
                    $sum: { $cond: [{ $eq: ['$isMastered', true] }, 1, 0] }
                },
                dueNow: {
                    $sum: {
                        $cond: [{ $lte: ['$nextReviewDate', new Date()] }, 1, 0]
                    }
                },
                avgEaseFactor: { $avg: '$easeFactor' },
                avgRepetitions: { $avg: '$repetitions' },
                totalReviews: { $sum: '$totalReviews' },
                correctReviews: { $sum: '$correctReviews' }
            }
        }
    ]);

    if (stats.length === 0) {
        return {
            totalWords: 0,
            masteredWords: 0,
            dueNow: 0,
            avgEaseFactor: 2.5,
            avgRepetitions: 0,
            totalReviews: 0,
            correctReviews: 0,
            successRate: 0
        };
    }

    const result = stats[0];
    result.successRate = result.totalReviews > 0
        ? Math.round((result.correctReviews / result.totalReviews) * 100)
        : 0;

    return result;
};

const VocabularyReview = mongoose.model('VocabularyReview', vocabularyReviewSchema);

export default VocabularyReview;
