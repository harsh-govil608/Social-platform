import "dotenv/config";
import ConversationScenario from "../models/ConversationScenario.js";
import ConversationResponse from "../models/ConversationResponse.js";
import { connectDB } from "./db.js";

const conversationScenarios = [
  // Travel Scenarios
  {
    topic: "Travel",
    title: "Airport Check-in",
    context: "You're at the airport check-in counter preparing for your flight",
    difficulty: "medium",
    initialMessage: "Good morning! Where are you flying to today?",
    suggestedResponses: ["I'm flying to Paris", "My destination is London", "I'm going to Tokyo"],
    keywords: ["airport", "flight", "check-in", "luggage", "passport"]
  },
  {
    topic: "Travel",
    title: "Hotel Booking",
    context: "You're at a hotel reception desk checking in",
    difficulty: "easy",
    initialMessage: "Welcome to Grand Hotel! Do you have a reservation?",
    suggestedResponses: ["Yes, under the name Smith", "I have a booking for tonight", "I'd like to check in"],
    keywords: ["hotel", "reservation", "room", "check-in", "nights"]
  },
  {
    topic: "Travel",
    title: "Asking Directions",
    context: "You're lost in a new city and need directions",
    difficulty: "medium",
    initialMessage: "Hi there! You look a bit lost. Can I help you find something?",
    suggestedResponses: ["Yes, I'm looking for the museum", "Could you tell me how to get to the station?", "I need directions to the city center"],
    keywords: ["directions", "lost", "map", "street", "location"]
  },
  
  // Food Scenarios
  {
    topic: "Food",
    title: "Restaurant Ordering",
    context: "You're at a restaurant ready to order your meal",
    difficulty: "easy",
    initialMessage: "Good evening! Have you had a chance to look at the menu?",
    suggestedResponses: ["Yes, I'd like to order", "Could I have a few more minutes?", "What do you recommend?"],
    keywords: ["restaurant", "menu", "order", "food", "drink"]
  },
  {
    topic: "Food",
    title: "Café Experience",
    context: "You're at a cozy café ordering coffee and snacks",
    difficulty: "easy",
    initialMessage: "Hi! What can I get started for you today?",
    suggestedResponses: ["I'd like a coffee please", "What pastries do you have?", "Could I see the menu?"],
    keywords: ["coffee", "café", "drink", "pastry", "order"]
  },
  
  // Culture Scenarios
  {
    topic: "Culture",
    title: "Museum Tour",
    context: "You're visiting a famous art museum",
    difficulty: "medium",
    initialMessage: "Welcome to the National Art Museum! Is this your first visit?",
    suggestedResponses: ["Yes, it's my first time", "I've been here before", "What exhibitions do you have?"],
    keywords: ["museum", "art", "exhibition", "culture", "history"]
  },
  {
    topic: "Culture",
    title: "Local Festival",
    context: "You're attending a local cultural festival",
    difficulty: "medium",
    initialMessage: "Welcome to our annual festival! Have you been to this event before?",
    suggestedResponses: ["No, this is my first time", "What activities are there?", "Can you tell me about the festival?"],
    keywords: ["festival", "culture", "tradition", "event", "celebration"]
  },
  
  // Business Scenarios
  {
    topic: "Business",
    title: "Job Interview",
    context: "You're in a job interview for your dream position",
    difficulty: "hard",
    initialMessage: "Good morning! Thank you for coming. Please, tell me about yourself.",
    suggestedResponses: ["I have 5 years of experience in...", "I'm passionate about...", "My background is in..."],
    keywords: ["interview", "job", "experience", "skills", "career"]
  },
  {
    topic: "Business",
    title: "Team Meeting",
    context: "You're in a team meeting discussing a project",
    difficulty: "medium",
    initialMessage: "Let's start with project updates. How is your part coming along?",
    suggestedResponses: ["I've completed the first phase", "I'm working on the design", "I need some help with..."],
    keywords: ["meeting", "project", "team", "update", "progress"]
  },
  
  // Sports Scenarios
  {
    topic: "Sports",
    title: "Gym Membership",
    context: "You're at a gym inquiring about membership",
    difficulty: "easy",
    initialMessage: "Welcome to FitLife Gym! Are you interested in joining?",
    suggestedResponses: ["Yes, what packages do you offer?", "I'd like to know about the facilities", "How much is the membership?"],
    keywords: ["gym", "fitness", "membership", "exercise", "health"]
  },
  
  // Music Scenarios
  {
    topic: "Music",
    title: "Concert Tickets",
    context: "You're buying tickets for a concert",
    difficulty: "easy",
    initialMessage: "Hi! Which concert are you interested in?",
    suggestedResponses: ["I want tickets for the jazz concert", "When is the next show?", "Are there any seats available?"],
    keywords: ["concert", "music", "tickets", "show", "performance"]
  },
  
  // Technology Scenarios
  {
    topic: "Technology",
    title: "Tech Support",
    context: "You're calling tech support for help with your device",
    difficulty: "medium",
    initialMessage: "Tech support, how can I help you today?",
    suggestedResponses: ["My computer won't start", "I'm having internet issues", "The app keeps crashing"],
    keywords: ["tech", "support", "computer", "problem", "device"]
  },
  
  // Daily Life Scenarios
  {
    topic: "Daily Life",
    title: "Grocery Shopping",
    context: "You're at a grocery store doing your weekly shopping",
    difficulty: "easy",
    initialMessage: "Hello! Did you find everything you need today?",
    suggestedResponses: ["Yes, thank you", "Where can I find milk?", "Do you have any sales today?"],
    keywords: ["grocery", "shopping", "food", "store", "products"]
  },
  {
    topic: "Daily Life",
    title: "Doctor's Appointment",
    context: "You're at a doctor's office for a check-up",
    difficulty: "medium",
    initialMessage: "Good afternoon! What brings you in today?",
    suggestedResponses: ["I'm here for my check-up", "I haven't been feeling well", "I need a prescription refill"],
    keywords: ["doctor", "health", "appointment", "medical", "check-up"]
  }
];

const conversationResponses = [
  // Travel Responses
  {
    topic: "Travel",
    responseType: "greeting",
    userIntent: "greeting",
    responseText: "Hello! Welcome to the airport. How can I assist you today?",
    alternativeResponses: ["Hi there! Ready for your journey?", "Good to see you! Where are you heading?"],
    contextKeywords: ["airport", "flight"],
    emotionalTone: "friendly",
    difficulty: "easy"
  },
  {
    topic: "Travel",
    responseType: "question",
    userIntent: "question",
    responseText: "Your flight is scheduled to depart from Gate 23. Do you have any luggage to check?",
    alternativeResponses: ["The boarding time is in 2 hours", "You can check your luggage here"],
    contextKeywords: ["gate", "luggage", "boarding"],
    emotionalTone: "professional",
    difficulty: "medium"
  },
  {
    topic: "Travel",
    responseType: "followup",
    userIntent: "answer",
    responseText: "Perfect! I'll process that for you. Do you have any preference for your seat?",
    alternativeResponses: ["Great! Would you like a window or aisle seat?", "Excellent! Any special requests?"],
    contextKeywords: ["seat", "preference"],
    emotionalTone: "helpful",
    difficulty: "easy"
  },
  
  // Food Responses
  {
    topic: "Food",
    responseType: "greeting",
    userIntent: "greeting",
    responseText: "Good evening! Welcome to our restaurant. Have you dined with us before?",
    alternativeResponses: ["Hello! It's lovely to have you here", "Welcome! Let me show you to your table"],
    contextKeywords: ["restaurant", "dining"],
    emotionalTone: "friendly",
    difficulty: "easy"
  },
  {
    topic: "Food",
    responseType: "question",
    userIntent: "question",
    responseText: "Our special today is grilled salmon with vegetables. Would you like to hear about our other specials?",
    alternativeResponses: ["We have a wonderful pasta dish", "The chef recommends our steak"],
    contextKeywords: ["special", "menu", "recommend"],
    emotionalTone: "helpful",
    difficulty: "medium"
  },
  {
    topic: "Food",
    responseType: "followup",
    userIntent: "answer",
    responseText: "Excellent choice! How would you like that prepared?",
    alternativeResponses: ["That's one of our most popular dishes!", "Great selection! Any dietary restrictions?"],
    contextKeywords: ["order", "prepare", "dietary"],
    emotionalTone: "encouraging",
    difficulty: "easy"
  },
  
  // Culture Responses
  {
    topic: "Culture",
    responseType: "greeting",
    userIntent: "greeting",
    responseText: "Welcome to our museum! We have a special exhibition on modern art today.",
    alternativeResponses: ["Hello! The gallery is open until 6 PM", "Welcome! Would you like a guided tour?"],
    contextKeywords: ["museum", "exhibition", "art"],
    emotionalTone: "friendly",
    difficulty: "easy"
  },
  {
    topic: "Culture",
    responseType: "answer",
    userIntent: "question",
    responseText: "This painting is from the 19th century. It represents the romantic period of art.",
    alternativeResponses: ["The artist was inspired by nature", "This piece is part of our permanent collection"],
    contextKeywords: ["painting", "artist", "collection"],
    emotionalTone: "professional",
    difficulty: "medium"
  },
  
  // Business Responses
  {
    topic: "Business",
    responseType: "greeting",
    userIntent: "greeting",
    responseText: "Good morning! Thank you for coming to the interview. How was your journey here?",
    alternativeResponses: ["Welcome! Please have a seat", "Hello! Ready to discuss the position?"],
    contextKeywords: ["interview", "meeting", "position"],
    emotionalTone: "professional",
    difficulty: "medium"
  },
  {
    topic: "Business",
    responseType: "question",
    userIntent: "answer",
    responseText: "That's impressive! Can you tell me more about your experience with project management?",
    alternativeResponses: ["Interesting! How did you handle that challenge?", "Great! What was your role in that project?"],
    contextKeywords: ["experience", "project", "role"],
    emotionalTone: "professional",
    difficulty: "hard"
  },
  
  // Daily Life Responses
  {
    topic: "Daily Life",
    responseType: "greeting",
    userIntent: "greeting",
    responseText: "Hi there! Nice weather we're having today, isn't it?",
    alternativeResponses: ["Hello neighbor! How's your day going?", "Good morning! How have you been?"],
    contextKeywords: ["weather", "day", "neighbor"],
    emotionalTone: "casual",
    difficulty: "easy"
  },
  {
    topic: "Daily Life",
    responseType: "followup",
    userIntent: "answer",
    responseText: "That sounds nice! I hope you have a great day!",
    alternativeResponses: ["Wonderful! Take care!", "Great talking to you!"],
    contextKeywords: ["day", "nice", "care"],
    emotionalTone: "friendly",
    difficulty: "easy"
  },
  
  // Generic helpful responses
  {
    topic: "Travel",
    responseType: "clarification",
    userIntent: "confusion",
    responseText: "I understand you might be confused. Let me explain that again more clearly.",
    alternativeResponses: ["No problem, let me help you with that", "I'll be happy to clarify"],
    contextKeywords: ["help", "confused", "explain"],
    emotionalTone: "helpful",
    difficulty: "easy"
  },
  {
    topic: "Food",
    responseType: "encouragement",
    userIntent: "help",
    responseText: "Take your time! I'm here to help with any questions about the menu.",
    alternativeResponses: ["No rush! Would you like me to explain any dishes?", "I'm happy to make recommendations"],
    contextKeywords: ["help", "menu", "questions"],
    emotionalTone: "encouraging",
    difficulty: "easy"
  }
];

export const seedConversationData = async () => {
  try {
    await connectDB();
    
    console.log("Seeding conversation scenarios...");
    
    // Clear existing data
    await ConversationScenario.deleteMany({});
    await ConversationResponse.deleteMany({});
    
    // Insert scenarios
    const insertedScenarios = await ConversationScenario.insertMany(conversationScenarios);
    console.log(`Inserted ${insertedScenarios.length} conversation scenarios`);
    
    // Insert responses
    const insertedResponses = await ConversationResponse.insertMany(conversationResponses);
    console.log(`Inserted ${insertedResponses.length} conversation responses`);
    
    // Add more responses for each topic to ensure variety
    const topics = ["Travel", "Food", "Culture", "Business", "Sports", "Music", "Technology", "Daily Life"];
    const intents = ["greeting", "question", "answer", "thanks", "apology", "help", "agreement", "disagreement", "closing"];
    const responseTypes = ["greeting", "question", "answer", "followup", "closing", "clarification", "encouragement"];
    
    const additionalResponses = [];
    
    for (const topic of topics) {
      for (const intent of intents) {
        for (const responseType of responseTypes) {
          // Generate contextual responses
          let responseText = "";
          let alternativeResponses = [];
          
          if (intent === "greeting" && responseType === "greeting") {
            responseText = `Hello! Welcome to our ${topic.toLowerCase()} conversation. How can I help you?`;
            alternativeResponses = [`Hi there! Ready to discuss ${topic.toLowerCase()}?`, `Welcome! Let's talk about ${topic.toLowerCase()}`];
          } else if (intent === "question" && responseType === "answer") {
            responseText = `That's a great question about ${topic.toLowerCase()}. Let me explain...`;
            alternativeResponses = [`Regarding your question about ${topic.toLowerCase()}...`, `I can help you with that ${topic.toLowerCase()} question`];
          } else if (intent === "thanks" && responseType === "followup") {
            responseText = "You're very welcome! Is there anything else you'd like to know?";
            alternativeResponses = ["My pleasure! Happy to help", "Glad I could assist you!"];
          } else if (intent === "closing" && responseType === "closing") {
            responseText = "It was great talking with you! Have a wonderful day!";
            alternativeResponses = ["Goodbye! Take care!", "See you next time!"];
          } else {
            responseText = `Let's continue our ${topic.toLowerCase()} discussion.`;
            alternativeResponses = [`Tell me more about your ${topic.toLowerCase()} interests`, `What else would you like to know about ${topic.toLowerCase()}?`];
          }
          
          additionalResponses.push({
            topic,
            responseType,
            userIntent: intent,
            responseText,
            alternativeResponses,
            contextKeywords: [topic.toLowerCase(), intent],
            emotionalTone: "friendly",
            difficulty: "medium"
          });
        }
      }
    }
    
    // Insert additional responses
    const moreResponses = await ConversationResponse.insertMany(additionalResponses);
    console.log(`Inserted ${moreResponses.length} additional conversation responses`);
    
    console.log("Conversation data seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding conversation data:", error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (process.argv[2] === "seed") {
  seedConversationData();
}