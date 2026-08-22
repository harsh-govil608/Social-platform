import mongoose from 'mongoose';

const pronunciationPhraseSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    unique: true
  },
  translation: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['greetings', 'introductions', 'questions', 'directions', 'shopping', 'restaurant', 
           'travel', 'emergency', 'social', 'business', 'numbers', 'time', 'weather', 'family', 
           'hobbies', 'opinions', 'feelings', 'daily', 'polite', 'phone']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard']
  },
  tips: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'english'
  },
  phonetic: {
    type: String // Optional phonetic spelling
  },
  audioUrl: {
    type: String // Optional audio file URL
  },
  contextExample: {
    type: String // Example of phrase in context
  },
  alternativeResponses: [{
    type: String // Alternative ways to say the same thing
  }],
  commonMistakes: [{
    type: String // Common pronunciation mistakes to avoid
  }],
  order: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
pronunciationPhraseSchema.index({ category: 1, difficulty: 1 });
pronunciationPhraseSchema.index({ language: 1, active: 1 });

const PronunciationPhrase = mongoose.model('PronunciationPhrase', pronunciationPhraseSchema);

export default PronunciationPhrase;