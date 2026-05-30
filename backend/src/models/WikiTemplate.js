import mongoose from "mongoose";

const wikiTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ["language_term", "concept", "vocabulary", "general"],
      required: true,
    },
    description: String,
    systemPrompt: { type: String, required: true },
    // Use {{content}} as the placeholder for raw content
    userPromptTemplate: { type: String, required: true },
    matchKeywords: [String],
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const WikiTemplate = mongoose.model("WikiTemplate", wikiTemplateSchema);
export default WikiTemplate;
