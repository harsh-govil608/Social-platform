import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const certificateSchema = new mongoose.Schema({
    // Unique verification ID
    certificateId: {
        type: String,
        unique: true,
        default: () => uuidv4()
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    // Certificate type
    type: {
        type: String,
        enum: ['course', 'contest', 'achievement', 'skill', 'language_level'],
        required: true
    },
    // What was achieved
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    // Reference to the completed item
    referenceType: {
        type: String,
        enum: ['course', 'contest', 'achievement', 'vocabulary', 'conversation'],
        default: null
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    // Additional metadata
    metadata: {
        score: Number,
        rank: Number,
        totalParticipants: Number,
        hoursCompleted: Number,
        wordsLearned: Number,
        level: String, // e.g., A1, A2, B1, B2, C1, C2 for language
        skills: [String],
        issueDate: {
            type: Date,
            default: Date.now
        }
    },
    // Certificate appearance customization
    template: {
        type: String,
        enum: ['classic', 'modern', 'minimal', 'achievement', 'contest'],
        default: 'modern'
    },
    // PDF file path (if pre-generated)
    pdfUrl: {
        type: String,
        default: null
    },
    // Verification
    isVerified: {
        type: Boolean,
        default: true
    },
    verificationUrl: {
        type: String
    },
    // Sharing
    isPublic: {
        type: Boolean,
        default: true
    },
    linkedInAddedAt: {
        type: Date,
        default: null
    },
    // Expiration (optional, for certain certificates)
    expiresAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Indexes
certificateSchema.index({ certificateId: 1 }, { unique: true });
certificateSchema.index({ userId: 1, type: 1 });
certificateSchema.index({ userId: 1, createdAt: -1 });

// Virtual for checking if certificate is expired
certificateSchema.virtual('isExpired').get(function() {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
});

// Virtual for verification URL
certificateSchema.virtual('fullVerificationUrl').get(function() {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return `${baseUrl}/verify-certificate/${this.certificateId}`;
});

// Pre-save hook to set verification URL
certificateSchema.pre('save', function(next) {
    if (!this.verificationUrl) {
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        this.verificationUrl = `${baseUrl}/verify-certificate/${this.certificateId}`;
    }
    next();
});

// Static method to generate certificate for course completion
certificateSchema.statics.generateForCourse = async function(userId, courseData) {
    return this.create({
        userId,
        type: 'course',
        title: `${courseData.name} Completion Certificate`,
        description: `Successfully completed the ${courseData.name} course`,
        referenceType: 'course',
        referenceId: courseData._id,
        metadata: {
            score: courseData.score,
            hoursCompleted: courseData.hours,
            skills: courseData.skills || [],
            issueDate: new Date()
        },
        template: 'modern'
    });
};

// Static method to generate certificate for contest
certificateSchema.statics.generateForContest = async function(userId, contestData) {
    return this.create({
        userId,
        type: 'contest',
        title: `${contestData.title} - Rank #${contestData.rank}`,
        description: `Achieved rank #${contestData.rank} in ${contestData.title}`,
        referenceType: 'contest',
        referenceId: contestData._id,
        metadata: {
            score: contestData.score,
            rank: contestData.rank,
            totalParticipants: contestData.totalParticipants,
            issueDate: new Date()
        },
        template: 'contest'
    });
};

// Static method to generate language proficiency certificate
certificateSchema.statics.generateForLanguageLevel = async function(userId, languageData) {
    return this.create({
        userId,
        type: 'language_level',
        title: `${languageData.language} - ${languageData.level} Proficiency`,
        description: `Achieved ${languageData.level} level proficiency in ${languageData.language}`,
        referenceType: 'vocabulary',
        metadata: {
            level: languageData.level,
            wordsLearned: languageData.wordsLearned,
            hoursCompleted: languageData.hours,
            issueDate: new Date()
        },
        template: 'classic'
    });
};

certificateSchema.set('toJSON', { virtuals: true });
certificateSchema.set('toObject', { virtuals: true });

const Certificate = mongoose.model('Certificate', certificateSchema);

export default Certificate;
