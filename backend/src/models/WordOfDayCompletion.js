import mongoose from "mongoose";

const wordOfDayCompletionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  word: { type: String, required: true },
  translation: { type: String },
  language: { type: String },
  userSentence: { type: String },
  aiFeedback: {
    isCorrect: Boolean,
    score: Number,
    feedback: String,
    correction: String,
  },
  xpAwarded: { type: Number, default: 0 },
  completedAt: { type: Date, default: Date.now },
});

wordOfDayCompletionSchema.index({ user: 1, date: 1 }, { unique: true });

const WordOfDayCompletion = mongoose.model("WordOfDayCompletion", wordOfDayCompletionSchema);
export default WordOfDayCompletion;
