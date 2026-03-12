import mongoose from "mongoose";

const dailyWordCacheSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // YYYY-MM-DD
  word: { type: String, required: true },
  partOfSpeech: { type: String, default: "" },
  definition: { type: String, default: "" },
  example: { type: String, default: "" },
  pronunciation: { type: String, default: "" },
  source: { type: String, default: "merriam-webster" },
}, { timestamps: true });

const DailyWordCache = mongoose.model("DailyWordCache", dailyWordCacheSchema);
export default DailyWordCache;
