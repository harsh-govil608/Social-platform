import PronunciationPhrase from '../models/PronunciationPhrase.js';

export const pronunciationPhrases = [
  // Greetings - Easy
  {
    text: "Hello, how are you?",
    translation: "Basic greeting",
    category: "greetings",
    difficulty: "easy",
    tips: "Speak clearly and naturally with a friendly tone",
    phonetic: "heh-LOH, how ar yoo",
    contextExample: "Meeting someone for the first time",
    alternativeResponses: ["Hi, how are you?", "Hello, how are you doing?"],
    commonMistakes: ["Rushing through the words", "Not emphasizing 'how'"]
  },
  {
    text: "Good morning",
    translation: "Morning greeting",
    category: "greetings",
    difficulty: "easy",
    tips: "Emphasize 'good' slightly",
    phonetic: "good MOR-ning",
    contextExample: "Greeting someone before noon"
  },
  {
    text: "Good evening",
    translation: "Evening greeting",
    category: "greetings",
    difficulty: "easy",
    tips: "Clear pronunciation of 'evening'",
    phonetic: "good EEV-ning"
  },
  {
    text: "How's it going?",
    translation: "Casual greeting",
    category: "greetings",
    difficulty: "easy",
    tips: "Relaxed, informal tone",
    phonetic: "howz it GO-ing"
  },
  {
    text: "Nice to meet you",
    translation: "Polite greeting",
    category: "greetings",
    difficulty: "easy",
    tips: "Sincere and friendly tone",
    phonetic: "nys too meet yoo"
  },

  // Introductions - Easy/Medium
  {
    text: "My name is Sarah",
    translation: "Self introduction",
    category: "introductions",
    difficulty: "easy",
    tips: "Clear pronunciation of your name",
    alternativeResponses: ["I'm Sarah", "My name's Sarah"]
  },
  {
    text: "I'm from New York",
    translation: "Origin introduction",
    category: "introductions",
    difficulty: "easy",
    tips: "Clear pronunciation of location"
  },
  {
    text: "I work as a teacher",
    translation: "Job introduction",
    category: "introductions",
    difficulty: "medium",
    tips: "Emphasize your profession"
  },
  {
    text: "I'm twenty-five years old",
    translation: "Age introduction",
    category: "introductions",
    difficulty: "easy",
    tips: "Clear number pronunciation"
  },
  {
    text: "This is my colleague, David",
    translation: "Introducing others",
    category: "introductions",
    difficulty: "medium",
    tips: "Gesture toward the person when introducing"
  },

  // Questions - Medium
  {
    text: "Where is the bathroom?",
    translation: "Essential question",
    category: "questions",
    difficulty: "easy",
    tips: "Clear pronunciation of 'bathroom'",
    phonetic: "wair iz the BATH-room"
  },
  {
    text: "How much does this cost?",
    translation: "Price inquiry",
    category: "questions",
    difficulty: "medium",
    tips: "Emphasize 'how much'",
    contextExample: "Shopping at a store"
  },
  {
    text: "What time is it?",
    translation: "Time inquiry",
    category: "questions",
    difficulty: "easy",
    tips: "Rising intonation at the end"
  },
  {
    text: "Could you repeat that, please?",
    translation: "Clarification request",
    category: "questions",
    difficulty: "medium",
    tips: "Polite tone with 'please'"
  },
  {
    text: "Do you speak English?",
    translation: "Language inquiry",
    category: "questions",
    difficulty: "easy",
    tips: "Clear and slow pronunciation"
  },
  {
    text: "Can you help me?",
    translation: "Help request",
    category: "questions",
    difficulty: "easy",
    tips: "Polite and clear tone"
  },
  {
    text: "Where can I find a restaurant?",
    translation: "Location inquiry",
    category: "questions",
    difficulty: "medium",
    tips: "Emphasize 'where' and 'restaurant'"
  },

  // Directions - Medium
  {
    text: "Turn left at the traffic light",
    translation: "Giving directions",
    category: "directions",
    difficulty: "medium",
    tips: "Clear pronunciation of 'left' and 'traffic light'"
  },
  {
    text: "It's straight ahead",
    translation: "Direction indication",
    category: "directions",
    difficulty: "easy",
    tips: "Emphasize 'straight ahead'"
  },
  {
    text: "The station is two blocks away",
    translation: "Distance description",
    category: "directions",
    difficulty: "medium",
    tips: "Clear number and distance words"
  },
  {
    text: "Take the second right",
    translation: "Direction instruction",
    category: "directions",
    difficulty: "medium",
    tips: "Emphasize 'second' and 'right'"
  },

  // Shopping - Medium
  {
    text: "I'd like to buy this shirt",
    translation: "Purchase request",
    category: "shopping",
    difficulty: "medium",
    tips: "Polite tone with 'I'd like'"
  },
  {
    text: "Do you have this in a larger size?",
    translation: "Size inquiry",
    category: "shopping",
    difficulty: "medium",
    tips: "Clear pronunciation of 'larger size'"
  },
  {
    text: "Can I pay by credit card?",
    translation: "Payment method",
    category: "shopping",
    difficulty: "medium",
    tips: "Clear 'credit card' pronunciation"
  },
  {
    text: "Is there a discount?",
    translation: "Discount inquiry",
    category: "shopping",
    difficulty: "easy",
    tips: "Rising intonation for question"
  },
  {
    text: "I need a receipt, please",
    translation: "Receipt request",
    category: "shopping",
    difficulty: "easy",
    tips: "Polite tone with 'please'"
  },

  // Restaurant - Medium
  {
    text: "Table for two, please",
    translation: "Table request",
    category: "restaurant",
    difficulty: "easy",
    tips: "Clear number and polite tone"
  },
  {
    text: "I'll have the chicken salad",
    translation: "Food order",
    category: "restaurant",
    difficulty: "medium",
    tips: "Clear food item pronunciation"
  },
  {
    text: "Could I see the menu?",
    translation: "Menu request",
    category: "restaurant",
    difficulty: "easy",
    tips: "Polite request tone"
  },
  {
    text: "The bill, please",
    translation: "Bill request",
    category: "restaurant",
    difficulty: "easy",
    tips: "Clear and polite"
  },
  {
    text: "Is service included?",
    translation: "Service charge inquiry",
    category: "restaurant",
    difficulty: "medium",
    tips: "Clear 'service' pronunciation"
  },

  // Travel - Medium/Hard
  {
    text: "I have a reservation under Smith",
    translation: "Hotel check-in",
    category: "travel",
    difficulty: "medium",
    tips: "Clear pronunciation of your name"
  },
  {
    text: "What time is check-out?",
    translation: "Hotel inquiry",
    category: "travel",
    difficulty: "easy",
    tips: "Emphasize 'check-out'"
  },
  {
    text: "My flight leaves at three o'clock",
    translation: "Flight timing",
    category: "travel",
    difficulty: "medium",
    tips: "Clear time pronunciation"
  },
  {
    text: "Where is the departure gate?",
    translation: "Airport navigation",
    category: "travel",
    difficulty: "medium",
    tips: "Clear 'departure gate'"
  },
  {
    text: "I'd like to book a room for tonight",
    translation: "Room booking",
    category: "travel",
    difficulty: "hard",
    tips: "Clear and polite booking request"
  },

  // Emergency - Hard
  {
    text: "I need a doctor immediately",
    translation: "Medical emergency",
    category: "emergency",
    difficulty: "hard",
    tips: "Urgent but clear tone"
  },
  {
    text: "Please call an ambulance",
    translation: "Emergency request",
    category: "emergency",
    difficulty: "medium",
    tips: "Clear and urgent tone"
  },
  {
    text: "I've lost my passport",
    translation: "Lost document",
    category: "emergency",
    difficulty: "medium",
    tips: "Clear 'passport' pronunciation"
  },

  // Social - Medium
  {
    text: "Would you like to grab coffee?",
    translation: "Social invitation",
    category: "social",
    difficulty: "medium",
    tips: "Friendly and inviting tone"
  },
  {
    text: "It was nice talking to you",
    translation: "Conversation ending",
    category: "social",
    difficulty: "medium",
    tips: "Sincere and friendly"
  },
  {
    text: "See you tomorrow",
    translation: "Casual goodbye",
    category: "social",
    difficulty: "easy",
    tips: "Casual and friendly"
  },
  {
    text: "Have a great day",
    translation: "Well wishes",
    category: "social",
    difficulty: "easy",
    tips: "Cheerful tone"
  },

  // Business - Hard
  {
    text: "I'd like to schedule a meeting",
    translation: "Meeting request",
    category: "business",
    difficulty: "hard",
    tips: "Professional and clear"
  },
  {
    text: "Could we discuss this further?",
    translation: "Discussion request",
    category: "business",
    difficulty: "hard",
    tips: "Professional inquiry tone"
  },
  {
    text: "I'll send you the report by Friday",
    translation: "Deadline commitment",
    category: "business",
    difficulty: "hard",
    tips: "Clear timeline pronunciation"
  },
  {
    text: "Thank you for your time",
    translation: "Professional thanks",
    category: "business",
    difficulty: "medium",
    tips: "Sincere and professional"
  },

  // Daily Life - Easy/Medium
  {
    text: "I need to go to the bank",
    translation: "Daily errand",
    category: "daily",
    difficulty: "easy",
    tips: "Clear 'bank' pronunciation"
  },
  {
    text: "What's the weather like today?",
    translation: "Weather inquiry",
    category: "weather",
    difficulty: "easy",
    tips: "Rising intonation"
  },
  {
    text: "It's raining outside",
    translation: "Weather description",
    category: "weather",
    difficulty: "easy",
    tips: "Clear 'raining' pronunciation"
  },
  {
    text: "I'm learning English",
    translation: "Language learning",
    category: "daily",
    difficulty: "easy",
    tips: "Clear and proud tone"
  },
  {
    text: "The wifi password is",
    translation: "Technical request",
    category: "daily",
    difficulty: "medium",
    tips: "Clear 'wifi' and 'password'"
  },

  // Polite Expressions - Medium
  {
    text: "Excuse me, sorry to bother you",
    translation: "Polite interruption",
    category: "polite",
    difficulty: "medium",
    tips: "Very polite and apologetic tone"
  },
  {
    text: "Thank you very much",
    translation: "Gratitude",
    category: "polite",
    difficulty: "easy",
    tips: "Sincere gratitude"
  },
  {
    text: "You're welcome",
    translation: "Response to thanks",
    category: "polite",
    difficulty: "easy",
    tips: "Friendly response"
  },
  {
    text: "I appreciate your help",
    translation: "Appreciation",
    category: "polite",
    difficulty: "medium",
    tips: "Sincere appreciation"
  },
  {
    text: "Sorry for the inconvenience",
    translation: "Apology",
    category: "polite",
    difficulty: "hard",
    tips: "Sincere apologetic tone"
  },

  // Numbers and Time - Easy
  {
    text: "My phone number is five five five, one two three four",
    translation: "Phone number",
    category: "numbers",
    difficulty: "medium",
    tips: "Clear number pronunciation with pauses"
  },
  {
    text: "It's half past three",
    translation: "Time telling",
    category: "time",
    difficulty: "medium",
    tips: "Clear 'half past' pronunciation"
  },
  {
    text: "The meeting is at nine thirty",
    translation: "Time specification",
    category: "time",
    difficulty: "medium",
    tips: "Clear time pronunciation"
  },

  // Feelings and Opinions - Medium
  {
    text: "I completely agree with you",
    translation: "Agreement",
    category: "opinions",
    difficulty: "medium",
    tips: "Emphasize 'completely'"
  },
  {
    text: "I'm not sure about that",
    translation: "Uncertainty",
    category: "opinions",
    difficulty: "medium",
    tips: "Diplomatic tone"
  },
  {
    text: "That's a great idea",
    translation: "Positive feedback",
    category: "opinions",
    difficulty: "easy",
    tips: "Enthusiastic tone"
  },
  {
    text: "I'm feeling much better now",
    translation: "Health update",
    category: "feelings",
    difficulty: "medium",
    tips: "Positive and clear"
  },

  // Phone Conversations - Hard
  {
    text: "May I speak to John, please?",
    translation: "Phone request",
    category: "phone",
    difficulty: "medium",
    tips: "Polite phone etiquette"
  },
  {
    text: "Could you hold for a moment?",
    translation: "Phone hold request",
    category: "phone",
    difficulty: "medium",
    tips: "Polite request"
  },
  {
    text: "I'll call you back later",
    translation: "Call back promise",
    category: "phone",
    difficulty: "medium",
    tips: "Clear 'call back' pronunciation"
  }
];

export async function seedPronunciationPhrases() {
  try {
    // Clear existing phrases
    await PronunciationPhrase.deleteMany({});
    
    // Insert new phrases
    const result = await PronunciationPhrase.insertMany(pronunciationPhrases);
    console.log(`Successfully seeded ${result.length} pronunciation phrases`);
    
    return result;
  } catch (error) {
    console.error('Error seeding pronunciation phrases:', error);
    throw error;
  }
}