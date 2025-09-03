import mongoose from 'mongoose';

const storySubmissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  challengeType: {
    type: String,
    required: true,
    enum: ['story_builder', 'creative_writing', 'vocabulary_story']
  },
  language: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'advanced']
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  prompts: [{
    type: String
  }],
  wordCount: {
    type: Number,
    required: true
  },
  timeSpent: {
    type: Number, // in seconds
    required: true
  },
  aiRating: {
    score: {
      type: Number,
      min: 0,
      max: 10
    },
    feedback: {
      type: String
    },
    criteria: {
      grammar: { type: Number, min: 0, max: 10 },
      creativity: { type: Number, min: 0, max: 10 },
      coherence: { type: Number, min: 0, max: 10 },
      vocabulary: { type: Number, min: 0, max: 10 },
      engagement: { type: Number, min: 0, max: 10 }
    }
  },
  userRatings: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    score: {
      type: Number,
      min: 0,
      max: 10,
      required: true
    },
    feedback: String,
    ratedAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageUserRating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  totalUserRatings: {
    type: Number,
    default: 0
  },
  xpEarned: {
    type: Number,
    default: 0
  },
  coinsEarned: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Calculate average user rating
storySubmissionSchema.methods.calculateAverageRating = function() {
  if (this.userRatings.length === 0) return 0;
  const sum = this.userRatings.reduce((acc, rating) => acc + rating.score, 0);
  return sum / this.userRatings.length;
};

// Index for queries
storySubmissionSchema.index({ userId: 1, createdAt: -1 });
storySubmissionSchema.index({ language: 1, difficulty: 1, isPublic: 1 });
storySubmissionSchema.index({ averageUserRating: -1, isPublic: 1 });

const StorySubmission = mongoose.model('StorySubmission', storySubmissionSchema);
export default StorySubmission;