import mongoose from "mongoose";

const wikiRawSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ["web", "user_post", "manual", "vocabulary"],
      required: true,
    },
    url: String,
    content: { type: String, required: true },
    title: String,
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ["pending", "processing", "processed", "failed"],
      default: "pending",
    },
    error: String,
    articleId: { type: mongoose.Schema.Types.ObjectId, ref: "WikiArticle" },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

wikiRawSchema.index({ status: 1 });
wikiRawSchema.index({ source: 1 });

const WikiRaw = mongoose.model("WikiRaw", wikiRawSchema);
export default WikiRaw;
