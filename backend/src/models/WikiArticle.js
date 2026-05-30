import mongoose from "mongoose";

const claimSchema = new mongoose.Schema({
  fact: String,
  confidence: { type: Number, default: 0.8 },
  source: String,
});

const contradictionSchema = new mongoose.Schema({
  claim: String,
  conflictsWith: String,
  rawSource: { type: mongoose.Schema.Types.ObjectId, ref: "WikiRaw" },
  resolved: { type: Boolean, default: false },
  resolution: String,
});

const wikiArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    summary: String,
    body: { type: String, required: true },
    type: {
      type: String,
      enum: ["language_term", "concept", "vocabulary", "general"],
      default: "general",
    },
    claims: [claimSchema],
    tags: [String],
    sources: [{ type: mongoose.Schema.Types.ObjectId, ref: "WikiRaw" }],
    contradictions: [contradictionSchema],
    confidence: { type: Number, default: 0.8 },
    viewCount: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    lastEnrichedAt: Date,
  },
  { timestamps: true }
);

wikiArticleSchema.index({ tags: 1 });
wikiArticleSchema.index({ type: 1 });
wikiArticleSchema.index({ title: "text", body: "text", tags: "text" });

const WikiArticle = mongoose.model("WikiArticle", wikiArticleSchema);
export default WikiArticle;
