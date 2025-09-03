import mongoose from "mongoose";

const dailyChallengeSchema = new mongoose.Schema({
  language: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    required: true
  },
  type: {
    type: String,
    enum: ["pronunciation", "vocabulary", "grammar", "listening", "translation", "conversation", "quiz", "matching", "writing", "creative", "story", "video"],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: Number,
    min: 1,
    max: 5,
    default: 1
  },
  xpReward: {
    type: Number,
    default: 50
  },
  coins: {
    type: Number,
    default: 10
  },
  duration: {
    type: Number, // in seconds
    default: 300
  },
  content: {
    // For pronunciation challenges
    phrases: [{
      text: String,
      translation: String,
      phoneticHint: String
    }],
    
    // For vocabulary/matching challenges
    words: [{
      word: String,
      translation: String,
      context: String,
      category: String
    }],
    pairs: [{
      word: String,
      translation: String
    }],
    
    // For quiz/grammar challenges
    questions: [{
      question: String,
      options: [String],
      correctAnswer: String,
      explanation: String
    }],
    
    // For listening/video challenges
    audioUrl: String,
    videoUrl: String,
    transcript: String,
    
    // For conversation challenges
    scenario: String,
    dialogues: [{
      role: String,
      text: String,
      options: [String],
      correct: Number
    }],
    responses: [{
      prompt: String,
      suggestedResponse: String
    }],
    
    // For writing/creative challenges
    requiredWords: [String],
    prompt: String,
    minLength: Number,
    maxLength: Number,
    
    // For translation challenges
    sentences: [{
      original: String,
      translation: String,
      hints: [String]
    }]
  },
  requirements: {
    minScore: {
      type: Number,
      default: 70
    },
    timeLimit: {
      type: Number, // in seconds
      default: 300
    }
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  dateCreated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Get daily challenges for a user
dailyChallengeSchema.statics.getDailyChallenges = async function(language, level, limit = 6) {
  // Get a variety of challenges across different types and levels
  const allChallenges = await this.find({
    language,
    isActive: true
  });
  
  // Group challenges by type
  const challengesByType = {};
  allChallenges.forEach(challenge => {
    if (!challengesByType[challenge.type]) {
      challengesByType[challenge.type] = [];
    }
    challengesByType[challenge.type].push(challenge);
  });
  
  // Select diverse challenges
  const selectedChallenges = [];
  const types = Object.keys(challengesByType);
  
  // Try to get one of each type first
  for (const type of types) {
    if (selectedChallenges.length < limit && challengesByType[type].length > 0) {
      // Prefer challenges matching the user's level, but take any if not available
      const levelMatch = challengesByType[type].find(c => c.level === level);
      const challenge = levelMatch || challengesByType[type][0];
      selectedChallenges.push(challenge);
      // Remove selected challenge from the pool
      challengesByType[type] = challengesByType[type].filter(c => c._id.toString() !== challenge._id.toString());
    }
  }
  
  // If we still need more, add remaining challenges
  while (selectedChallenges.length < limit) {
    for (const type of types) {
      if (selectedChallenges.length < limit && challengesByType[type].length > 0) {
        selectedChallenges.push(challengesByType[type].shift());
      }
    }
    if (types.every(type => challengesByType[type].length === 0)) break;
  }
  
  return selectedChallenges.slice(0, limit);
};

const DailyChallenge = mongoose.model("DailyChallenge", dailyChallengeSchema);

export default DailyChallenge;