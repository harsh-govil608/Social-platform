import mongoose from "mongoose";

const learningVideoSchema = new mongoose.Schema({
  language: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ["grammar", "conversation", "culture", "pronunciation", "vocabulary", "listening", "news", "entertainment", "business", "travel", "daily", "shopping", "food", "greetings"]
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  duration: {
    type: Number, // in seconds
    required: true
  },
  difficulty: {
    type: Number,
    min: 1,
    max: 5,
    default: 1
  },
  instructor: {
    name: String,
    avatar: String
  },
  features: {
    hasSubtitles: {
      type: Boolean,
      default: false
    },
    hasTranscript: {
      type: Boolean,
      default: false
    },
    hasQuiz: {
      type: Boolean,
      default: false
    },
    hasInteractiveNotes: {
      type: Boolean,
      default: false
    },
    hasDownloadableNotes: {
      type: Boolean,
      default: false
    },
    hasCertificate: {
      type: Boolean,
      default: false
    },
    hasDiscussionForum: {
      type: Boolean,
      default: false
    },
    hasExpertAnalysis: {
      type: Boolean,
      default: false
    },
    subtitleLanguages: [String]
  },
  subtitles: [{
    language: String,
    url: String
  }],
  transcript: {
    type: String
  },
  keyPhrases: [{
    phrase: String,
    translation: String,
    timestamp: Number // when it appears in the video
  }],
  quiz: [{
    question: String,
    options: [String],
    correctAnswer: String,
    timestamp: Number // when to show the question
  }],
  isPremium: {
    type: Boolean,
    default: false
  },
  xpReward: {
    type: Number,
    default: 100
  },
  coins: {
    type: Number,
    default: 20
  },
  tags: [String],
  viewCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
learningVideoSchema.index({ language: 1, level: 1, category: 1 });
learningVideoSchema.index({ language: 1, isPremium: 1 });

// Get videos for a user
learningVideoSchema.statics.getVideosForUser = async function(language, level, isPremium = false, categories = []) {
  const query = {
    language,
    level,
    isActive: true
  };
  
  // Non-premium users can only see non-premium videos
  if (!isPremium) {
    query.isPremium = false;
  }
  
  if (categories.length > 0) {
    query.category = { $in: categories };
  }
  
  return await this.find(query).sort({ viewCount: -1, rating: -1 });
};

// Increment view count
learningVideoSchema.methods.incrementViewCount = async function() {
  this.viewCount += 1;
  await this.save();
};

const LearningVideo = mongoose.model("LearningVideo", learningVideoSchema);

export default LearningVideo;