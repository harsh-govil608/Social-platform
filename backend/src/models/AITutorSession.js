import mongoose from "mongoose";

const aiTutorSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionType: {
    type: String,
    enum: ['language_help', 'coding_help', 'career_guidance', 'general_chat'],
    required: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      language: String,
      codeSnippet: String,
      problemContext: String,
      difficulty: String
    }
  }],
  context: {
    userLanguages: {
      native: String,
      learning: String
    },
    currentTopic: String,
    userLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    lastProblemSolved: String,
    strugglingAreas: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: String
}, {
  timestamps: true
});

// Index for efficient queries
aiTutorSessionSchema.index({ userId: 1, createdAt: -1 });
aiTutorSessionSchema.index({ isActive: 1 });

const AITutorSession = mongoose.model("AITutorSession", aiTutorSessionSchema);
export default AITutorSession;