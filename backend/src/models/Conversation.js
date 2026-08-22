import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  topic: {
    type: String,
    required: true,
    enum: ["Travel", "Food", "Culture", "Business", "Sports", "Music", "Technology", "Daily Life"]
  },
  messages: [{
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
    feedback: {
      grammar: Number,
      vocabulary: Number,
      fluency: Number,
      suggestion: String
    }
  }],
  scenario: {
    title: String,
    context: String,
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"]
    }
  },
  score: {
    type: Number,
    default: 0
  },
  xpEarned: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;