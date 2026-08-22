import mongoose from "mongoose";

const conversationScenarioSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
    enum: ["Travel", "Food", "Culture", "Business", "Sports", "Music", "Technology", "Daily Life"]
  },
  title: {
    type: String,
    required: true
  },
  context: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium"
  },
  language: {
    type: String,
    default: "en"
  },
  initialMessage: {
    type: String,
    required: true
  },
  suggestedResponses: [{
    type: String
  }],
  keywords: [{
    type: String
  }],
  active: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for efficient querying
conversationScenarioSchema.index({ topic: 1, difficulty: 1, active: 1 });
conversationScenarioSchema.index({ keywords: 1 });

const ConversationScenario = mongoose.model("ConversationScenario", conversationScenarioSchema);
export default ConversationScenario;