import mongoose from "mongoose";

const conversationResponseSchema = new mongoose.Schema({
  scenarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ConversationScenario"
  },
  topic: {
    type: String,
    required: true,
    index: true
  },
  responseType: {
    type: String,
    enum: ["greeting", "question", "answer", "followup", "closing", "clarification", "encouragement"],
    required: true
  },
  userIntent: {
    type: String,
    enum: ["greeting", "question", "answer", "help", "confusion", "agreement", "disagreement", "thanks", "apology", "closing"],
    required: true
  },
  responseText: {
    type: String,
    required: true
  },
  alternativeResponses: [{
    type: String
  }],
  contextKeywords: [{
    type: String
  }],
  emotionalTone: {
    type: String,
    enum: ["friendly", "professional", "casual", "encouraging", "helpful", "neutral"],
    default: "friendly"
  },
  grammarTips: [{
    type: String
  }],
  vocabularyNotes: [{
    word: String,
    explanation: String
  }],
  culturalNotes: {
    type: String
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium"
  },
  usageCount: {
    type: Number,
    default: 0
  },
  successRate: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Indexes for efficient querying
conversationResponseSchema.index({ topic: 1, responseType: 1, userIntent: 1 });
conversationResponseSchema.index({ contextKeywords: 1 });
conversationResponseSchema.index({ difficulty: 1, active: 1 });

const ConversationResponse = mongoose.model("ConversationResponse", conversationResponseSchema);
export default ConversationResponse;