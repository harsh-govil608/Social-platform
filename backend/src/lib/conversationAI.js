import ConversationResponse from "../models/ConversationResponse.js";
import { generateAIResponse, isAIConfigured } from './ai.js';
import { log } from './logger.js';

// Response templates with variables for dynamic generation
const responseTemplates = {
  Travel: {
    greetings: [
      "Hello! I see you're interested in travel. {question}",
      "Welcome, traveler! {topic_intro} {question}",
      "Hi there! {greeting_time} {topic_hook}"
    ],
    questions: [
      "That's interesting about {user_topic}. {follow_up}",
      "I understand you mentioned {keyword}. {clarification}",
      "{acknowledgment} Can you tell me more about {aspect}?"
    ],
    responses: [
      "{validation} {information} {next_question}",
      "{emotion} {explanation} {engagement}",
      "{agreement} {personal_touch} {continuation}"
    ]
  },
  Food: {
    greetings: [
      "Welcome to our culinary conversation! {question}",
      "Hello food lover! {topic_intro} {question}",
      "Hi! {greeting_time} {food_hook}"
    ],
    questions: [
      "Oh, you like {food_type}? {follow_up}",
      "{reaction} {cuisine_question}",
      "That sounds delicious! {preference_question}"
    ],
    responses: [
      "{taste_comment} {suggestion} {inquiry}",
      "{food_fact} {recommendation} {question}",
      "{agreement} {cooking_tip} {engagement}"
    ]
  },
  general: {
    acknowledgments: [
      "I see what you mean",
      "That makes sense",
      "I understand",
      "That's a good point",
      "Interesting perspective"
    ],
    transitions: [
      "Speaking of which",
      "On that note",
      "That reminds me",
      "By the way",
      "Additionally"
    ],
    encouragements: [
      "Great job with that!",
      "You're doing well!",
      "Excellent point!",
      "That's a thoughtful response",
      "Well said!"
    ]
  }
};

// Context-aware response components
const responseComponents = {
  greeting_time: () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning!";
    if (hour < 18) return "Good afternoon!";
    return "Good evening!";
  },
  
  topic_intro: (topic) => {
    const intros = {
      Travel: "I love discussing travel experiences.",
      Food: "Food is such a universal language!",
      Culture: "Cultural exchanges are fascinating.",
      Business: "Let's talk about professional matters.",
      Sports: "Sports bring people together!",
      Music: "Music is a wonderful topic.",
      Technology: "Technology is evolving so fast.",
      "Daily Life": "Let's chat about everyday experiences."
    };
    return intros[topic] || "This is an interesting topic.";
  },
  
  question: (topic, stage) => {
    const questions = {
      Travel: {
        greeting: ["Where would you like to travel to?", "What's your dream destination?", "Have you traveled recently?"],
        main: ["What do you enjoy most about traveling?", "How do you usually plan your trips?", "What's been your favorite trip so far?"],
        closing: ["Any travel plans coming up?", "Where would you go next?", "What travel advice would you give?"]
      },
      Food: {
        greeting: ["What's your favorite cuisine?", "Are you a cooking enthusiast?", "What did you have for your last meal?"],
        main: ["Do you prefer cooking or dining out?", "What's a dish you'd like to learn to make?", "Any dietary preferences?"],
        closing: ["What's your comfort food?", "Any restaurant recommendations?", "What's on your menu today?"]
      }
    };
    
    const topicQuestions = questions[topic] || questions.Travel;
    const stageQuestions = topicQuestions[stage] || topicQuestions.greeting;
    return stageQuestions[Math.floor(Math.random() * stageQuestions.length)];
  },
  
  follow_up: (keyword) => {
    const followUps = [
      `Can you elaborate on ${keyword}?`,
      `What specifically about ${keyword} interests you?`,
      `How did you get interested in ${keyword}?`,
      `Tell me more about your experience with ${keyword}.`,
      `What do you find most interesting about ${keyword}?`
    ];
    return followUps[Math.floor(Math.random() * followUps.length)];
  },
  
  validation: () => {
    const validations = [
      "That's a great point!",
      "I appreciate you sharing that.",
      "That's very insightful.",
      "Thanks for explaining.",
      "That's helpful to know."
    ];
    return validations[Math.floor(Math.random() * validations.length)];
  },
  
  emotion: (sentiment) => {
    const emotions = {
      positive: ["That's wonderful!", "How exciting!", "That sounds amazing!", "Fantastic!"],
      neutral: ["I see.", "Understood.", "That's interesting.", "Good to know."],
      negative: ["I'm sorry to hear that.", "That must be challenging.", "I understand that can be difficult."]
    };
    const emotionSet = emotions[sentiment] || emotions.neutral;
    return emotionSet[Math.floor(Math.random() * emotionSet.length)];
  }
};

// Generate contextual response based on conversation history
export const generateContextualResponse = async (topic, userMessage, conversationHistory, stage = "main") => {
  // Try to use AI if configured
  if (isAIConfigured()) {
    try {
      // Build conversation context
      const recentMessages = conversationHistory.slice(-6);
      const conversationContext = recentMessages
        .filter(m => m.role !== 'system')
        .map(m => `${m.role === 'user' ? 'User' : 'You'}: ${m.content}`)
        .join('\n');

      const topicPersonalities = {
        Travel: "You are an enthusiastic travel expert who loves sharing travel tips and experiences.",
        Food: "You are a warm and passionate food enthusiast who enjoys discussing cuisines and cooking.",
        Culture: "You are a respectful and curious cultural guide who loves exploring traditions.",
        Business: "You are a professional and insightful business consultant.",
        Sports: "You are an energetic sports enthusiast and fitness motivator.",
        Music: "You are a creative and expressive music lover.",
        Technology: "You are an analytical tech expert who stays updated on innovations.",
        "Daily Life": "You are a friendly and relatable conversation partner."
      };

      const systemPrompt = `${topicPersonalities[topic] || topicPersonalities["Daily Life"]}

You are having a natural conversation about ${topic}. Keep your responses:
- Natural and conversational (2-3 sentences)
- Engaging with follow-up questions when appropriate
- Helpful and informative
- Stage: ${stage} (adjust tone accordingly - greeting=welcoming, main=engaging, closing=wrapping up)`;

      const aiResponse = await generateAIResponse({
        systemPrompt,
        userMessage: conversationContext
          ? `Previous conversation:\n${conversationContext}\n\nUser: ${userMessage || 'Start the conversation'}\n\nRespond naturally:`
          : `User: ${userMessage || 'Start the conversation'}\n\nRespond naturally:`,
        temperature: 0.8,
        maxTokens: 150
      });

      return polishResponse(aiResponse);
    } catch (error) {
      log.error('AI response error, falling back to templates:', error);
      // Fall through to template-based response
    }
  }

  // Fallback to template-based response
  const keywords = extractKeywords(userMessage);
  const sentiment = analyzeSentiment(userMessage);
  const messageLength = userMessage.split(' ').length;

  // Build context from conversation history
  const context = buildContext(conversationHistory);
  const previousTopics = context.discussedTopics || [];
  const lastIntent = context.lastIntent;

  // Generate response components
  const components = {
    greeting_time: responseComponents.greeting_time(),
    topic_intro: responseComponents.topic_intro(topic),
    question: responseComponents.question(topic, stage),
    follow_up: keywords.length > 0 ? responseComponents.follow_up(keywords[0]) : "Can you tell me more?",
    validation: responseComponents.validation(),
    emotion: responseComponents.emotion(sentiment),
    user_topic: keywords[0] || "that",
    keyword: keywords[0] || "your point",
    aspect: selectNewAspect(topic, previousTopics),
    acknowledgment: selectAcknowledgment(sentiment),
    information: await getRelevantInformation(topic, keywords),
    next_question: generateNextQuestion(topic, stage, context),
    personal_touch: addPersonalTouch(messageLength),
    continuation: selectContinuation(),
    engagement: createEngagement(topic, stage)
  };

  // Select appropriate template
  const templates = responseTemplates[topic] || responseTemplates.general;
  const templateCategory = stage === "greeting" ? "greetings" :
                          lastIntent === "question" ? "questions" : "responses";
  const availableTemplates = templates[templateCategory] || templates.responses;
  const selectedTemplate = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];

  // Fill template with components
  let response = selectedTemplate;
  for (const [key, value] of Object.entries(components)) {
    response = response.replace(`{${key}}`, value);
  }

  // Clean up any remaining placeholders
  response = response.replace(/\{[^}]+\}/g, '');

  // Ensure response is natural and flowing
  response = polishResponse(response);

  return response;
};

// Extract meaningful keywords from message
const extractKeywords = (message) => {
  const stopWords = ["the", "is", "at", "which", "on", "a", "an", "and", "or", "but", "in", "with", "to", "for"];
  const words = message.toLowerCase().split(/\W+/);
  return words.filter(word => 
    word.length > 3 && 
    !stopWords.includes(word)
  ).slice(0, 3);
};

// Simple sentiment analysis
const analyzeSentiment = (message) => {
  const positive = ["good", "great", "love", "excellent", "wonderful", "amazing", "fantastic", "enjoy", "happy", "excited"];
  const negative = ["bad", "hate", "terrible", "awful", "disappointed", "sad", "angry", "frustrated", "difficult", "hard"];
  
  const messageLower = message.toLowerCase();
  const positiveCount = positive.filter(word => messageLower.includes(word)).length;
  const negativeCount = negative.filter(word => messageLower.includes(word)).length;
  
  if (positiveCount > negativeCount) return "positive";
  if (negativeCount > positiveCount) return "negative";
  return "neutral";
};

// Build context from conversation history
const buildContext = (history) => {
  const context = {
    messageCount: history.length,
    discussedTopics: [],
    lastIntent: null,
    recentKeywords: []
  };
  
  // Analyze last 3 messages
  const recentMessages = history.slice(-3);
  recentMessages.forEach(msg => {
    if (msg.role === "user") {
      const keywords = extractKeywords(msg.content);
      context.recentKeywords.push(...keywords);
      context.discussedTopics.push(...keywords);
    }
  });
  
  // Get unique topics
  context.discussedTopics = [...new Set(context.discussedTopics)];
  
  return context;
};

// Select a new aspect to discuss
const selectNewAspect = (topic, previousTopics) => {
  const aspects = {
    Travel: ["accommodations", "local cuisine", "transportation", "attractions", "culture", "budget", "planning"],
    Food: ["ingredients", "cooking methods", "flavors", "presentation", "nutrition", "recipes", "dining experiences"],
    Culture: ["traditions", "festivals", "art", "history", "customs", "language", "social norms"],
    Business: ["strategy", "teamwork", "goals", "challenges", "innovation", "leadership", "growth"],
    Sports: ["training", "competition", "teamwork", "fitness", "technique", "equipment", "achievements"],
    Music: ["genres", "instruments", "artists", "concerts", "composition", "rhythm", "emotions"],
    Technology: ["innovations", "applications", "impact", "future", "learning", "tools", "trends"],
    "Daily Life": ["routines", "hobbies", "work-life balance", "relationships", "health", "goals", "experiences"]
  };
  
  const topicAspects = aspects[topic] || aspects["Daily Life"];
  const newAspects = topicAspects.filter(aspect => !previousTopics.includes(aspect));
  
  if (newAspects.length === 0) return topicAspects[Math.floor(Math.random() * topicAspects.length)];
  return newAspects[Math.floor(Math.random() * newAspects.length)];
};

// Select appropriate acknowledgment
const selectAcknowledgment = (sentiment) => {
  const acknowledgments = {
    positive: ["That's wonderful to hear!", "How exciting!", "That sounds great!"],
    neutral: ["I see what you mean.", "That's interesting.", "Thanks for sharing."],
    negative: ["I understand that can be challenging.", "That sounds difficult.", "I appreciate you telling me."]
  };
  
  const options = acknowledgments[sentiment] || acknowledgments.neutral;
  return options[Math.floor(Math.random() * options.length)];
};

// Get relevant information based on topic and keywords
const getRelevantInformation = async (topic, keywords) => {
  // In a real implementation, this could query a knowledge base
  const information = {
    Travel: [
      "Many travelers find that planning ahead helps reduce stress.",
      "Local experiences often create the best memories.",
      "Travel insurance is always a good idea for international trips.",
      "Learning a few local phrases can enhance your experience."
    ],
    Food: [
      "Fresh ingredients make a huge difference in taste.",
      "Cooking is both an art and a science.",
      "Food brings people together across cultures.",
      "Experimenting with spices can transform a dish."
    ]
  };
  
  const topicInfo = information[topic] || ["That's an interesting point to consider."];
  return topicInfo[Math.floor(Math.random() * topicInfo.length)];
};

// Generate contextual next question
const generateNextQuestion = (topic, stage, context) => {
  const questions = [
    "What else would you like to discuss?",
    "Do you have any questions about this?",
    "What's your perspective on this?",
    "How does that relate to your experience?",
    "What are your thoughts on that?"
  ];
  
  if (stage === "closing") {
    return "Is there anything else you'd like to know?";
  }
  
  return questions[Math.floor(Math.random() * questions.length)];
};

// Add personal touch based on message length
const addPersonalTouch = (messageLength) => {
  if (messageLength > 15) {
    return "I really appreciate your detailed response.";
  } else if (messageLength > 8) {
    return "Thanks for sharing your thoughts.";
  } else {
    return "I'd love to hear more.";
  }
};

// Select continuation phrase
const selectContinuation = () => {
  const continuations = [
    "Let's explore this further.",
    "This is a great conversation.",
    "I'm enjoying our discussion.",
    "There's so much to talk about.",
    "Feel free to share more."
  ];
  return continuations[Math.floor(Math.random() * continuations.length)];
};

// Create engagement based on stage
const createEngagement = (topic, stage) => {
  if (stage === "greeting") {
    return "Let's have a great conversation!";
  } else if (stage === "closing") {
    return "It's been wonderful talking with you.";
  } else {
    return "What would you like to explore next?";
  }
};

// Polish the response to make it natural
const polishResponse = (response) => {
  // Remove double spaces
  response = response.replace(/\s+/g, ' ');
  
  // Ensure proper capitalization
  response = response.charAt(0).toUpperCase() + response.slice(1);
  
  // Fix punctuation issues
  response = response.replace(/\s+([.,!?])/g, '$1');
  response = response.replace(/([.,!?])([A-Z])/g, '$1 $2');
  
  // Ensure it ends with punctuation
  if (!/[.!?]$/.test(response)) {
    response += '.';
  }
  
  return response.trim();
};

// Generate varied responses for the same intent
export const generateVariedResponse = (baseResponse, variationLevel = 0) => {
  const variations = {
    0: (response) => response, // No variation
    1: (response) => { // Slight variation
      const synonyms = {
        "great": ["wonderful", "excellent", "fantastic"],
        "interesting": ["fascinating", "intriguing", "engaging"],
        "tell me": ["share with me", "let me know", "explain"]
      };
      
      for (const [word, alternatives] of Object.entries(synonyms)) {
        if (response.toLowerCase().includes(word)) {
          const alternative = alternatives[Math.floor(Math.random() * alternatives.length)];
          response = response.replace(new RegExp(word, 'gi'), alternative);
        }
      }
      return response;
    },
    2: (response) => { // Moderate variation
      // Add interjections
      const interjections = ["Well,", "So,", "Actually,", "You know,", "Hmm,"];
      const interjection = interjections[Math.floor(Math.random() * interjections.length)];
      return `${interjection} ${response.toLowerCase()}`;
    }
  };
  
  const variation = variations[variationLevel] || variations[0];
  return variation(baseResponse);
};