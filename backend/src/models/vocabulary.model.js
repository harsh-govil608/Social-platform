import mongoose from "mongoose";

const vocabularySchema = new mongoose.Schema({
  language: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ["greetings", "food", "travel", "business", "daily", "emotions", "weather", "family", "shopping", "health", "technology", "culture"]
  },
  word: {
    type: String,
    required: true
  },
  translation: {
    type: String,
    required: true
  },
  pronunciation: {
    type: String
  },
  context: {
    type: String
  },
  exampleSentence: {
    original: String,
    translated: String
  },
  difficulty: {
    type: Number,
    min: 1,
    max: 5,
    default: 1
  },
  frequency: {
    type: Number,
    default: 1 // How common the word is (1-10)
  },
  tags: [String],
  relatedWords: [{
    word: String,
    relationship: String // synonym, antonym, etc.
  }],
  imageUrl: String,
  audioUrl: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
vocabularySchema.index({ language: 1, level: 1, category: 1 });
vocabularySchema.index({ language: 1, word: 1 }, { unique: true });

// Get daily vocabulary words
vocabularySchema.statics.getDailyWords = async function(language, level, categories = [], limit = 10) {
  const query = {
    language,
    level,
    isActive: true
  };
  
  if (categories.length > 0) {
    query.category = { $in: categories };
  }
  
  // Get a mix of different difficulties
  const words = await this.aggregate([
    { $match: query },
    { $sample: { size: limit } }
  ]);
  
  return words;
};

// Get words by category
vocabularySchema.statics.getWordsByCategory = async function(language, category, limit = 20) {
  return await this.find({
    language,
    category,
    isActive: true
  }).limit(limit).sort({ frequency: -1 });
};

const Vocabulary = mongoose.model("Vocabulary", vocabularySchema);

export default Vocabulary;