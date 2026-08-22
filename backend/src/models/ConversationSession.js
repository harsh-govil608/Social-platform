import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant", "system"],
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
  responseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ConversationResponse"
  },
  userIntent: String,
  feedback: {
    grammar: { type: Number, min: 0, max: 10 },
    vocabulary: { type: Number, min: 0, max: 10 },
    fluency: { type: Number, min: 0, max: 10 },
    pronunciation: { type: Number, min: 0, max: 10 },
    suggestion: String,
    corrections: [{
      original: String,
      corrected: String,
      explanation: String
    }]
  },
  analysis: {
    sentiment: String,
    confidence: Number,
    keywords: [String]
  }
});

const conversationSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  scenarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ConversationScenario",
    required: true
  },
  topic: {
    type: String,
    required: true,
    index: true
  },
  messages: [messageSchema],
  currentContext: {
    stage: {
      type: String,
      enum: ["greeting", "introduction", "main", "closing"],
      default: "greeting"
    },
    turnCount: {
      type: Number,
      default: 0
    },
    lastUserIntent: String,
    discussedTopics: [String],
    pendingQuestions: [String]
  },
  performance: {
    totalScore: {
      type: Number,
      default: 0
    },
    grammarScore: {
      type: Number,
      default: 0
    },
    vocabularyScore: {
      type: Number,
      default: 0
    },
    fluencyScore: {
      type: Number,
      default: 0
    },
    responseTime: {
      type: Number,
      default: 0
    },
    hintsUsed: {
      type: Number,
      default: 0
    }
  },
  completed: {
    type: Boolean,
    default: false
  },
  xpEarned: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  notes: String,
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
}, { timestamps: true });

// Indexes for efficient querying
conversationSessionSchema.index({ userId: 1, topic: 1, completed: 1 });
conversationSessionSchema.index({ userId: 1, createdAt: -1 });

const ConversationSession = mongoose.model("ConversationSession", conversationSessionSchema);
export default ConversationSession;