import mongoose from "mongoose";
import ConversationScenario from "../models/ConversationScenario.js";
import ConversationResponse from "../models/ConversationResponse.js";
import ConversationSession from "../models/ConversationSession.js";
import User from "../models/User.js";
import { generateContextualResponse, generateVariedResponse } from "../lib/conversationAI.js";

// Analyze user message to determine intent
const analyzeUserIntent = (message) => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
    return "greeting";
  } else if (lowerMessage.includes("?") || lowerMessage.match(/^(what|where|when|why|how|who|which)/)) {
    return "question";
  } else if (lowerMessage.match(/thank|thanks/)) {
    return "thanks";
  } else if (lowerMessage.match(/sorry|apologize/)) {
    return "apology";
  } else if (lowerMessage.match(/bye|goodbye|see you/)) {
    return "closing";
  } else if (lowerMessage.match(/help|don't understand|confused/)) {
    return "help";
  } else if (lowerMessage.match(/yes|yeah|sure|okay|alright|agree/)) {
    return "agreement";
  } else if (lowerMessage.match(/no|nope|disagree|don't/)) {
    return "disagreement";
  } else {
    return "answer";
  }
};

// Extract keywords from message
const extractKeywords = (message) => {
  const stopWords = ["the", "is", "at", "which", "on", "a", "an", "as", "are", "was", "were", "been", "be"];
  const words = message.toLowerCase().split(/\s+/);
  return words.filter(word => 
    word.length > 2 && 
    !stopWords.includes(word) && 
    /^[a-z]+$/.test(word)
  );
};

// Analyze grammar and provide feedback
const analyzeGrammar = (message) => {
  const feedback = {
    score: 5,
    corrections: [],
    suggestions: []
  };
  
  // Check capitalization
  if (message[0] !== message[0].toUpperCase()) {
    feedback.score -= 1;
    feedback.corrections.push({
      original: message[0],
      corrected: message[0].toUpperCase(),
      explanation: "Sentences should start with a capital letter"
    });
  }
  
  // Check punctuation
  const lastChar = message[message.length - 1];
  if (!['.', '!', '?'].includes(lastChar)) {
    feedback.score -= 1;
    feedback.suggestions.push("End sentences with proper punctuation");
  }
  
  // Check for common grammar patterns
  if (message.match(/\bi\b/g) && !message.match(/\bI\b/g)) {
    feedback.score -= 1;
    feedback.corrections.push({
      original: "i",
      corrected: "I",
      explanation: "The pronoun 'I' should always be capitalized"
    });
  }
  
  // Add score based on sentence complexity
  const words = message.split(/\s+/);
  if (words.length >= 5 && words.length <= 20) {
    feedback.score += 3;
  } else if (words.length > 20) {
    feedback.suggestions.push("Try to keep sentences concise");
  } else if (words.length < 3) {
    feedback.suggestions.push("Try to form complete sentences");
  }
  
  // Check for variety in sentence structure
  if (message.includes(",") || message.includes(" and ") || message.includes(" but ")) {
    feedback.score += 2;
  }
  
  return {
    score: Math.min(10, Math.max(0, feedback.score)),
    corrections: feedback.corrections,
    suggestions: feedback.suggestions
  };
};

// Generate suggested responses based on context
const generateSuggestedResponses = async (topic, stage, keywords, intent) => {
  const suggestions = [];
  
  // Context-based suggestions
  const contextSuggestions = {
    greeting: {
      Travel: ["I love traveling!", "I'm planning a trip", "I recently visited..."],
      Food: ["I enjoy cooking", "I love trying new cuisines", "Food is my passion"],
      Culture: ["I'm interested in different cultures", "Cultural diversity fascinates me", "I'd love to learn more"],
      Business: ["I work in...", "My experience includes...", "I'm interested in business"],
      Sports: ["I play sports regularly", "I'm a sports fan", "Fitness is important to me"],
      Music: ["Music is my life", "I play an instrument", "I love all kinds of music"],
      Technology: ["I'm into tech", "Technology amazes me", "I work with computers"],
      "Daily Life": ["Nice to meet you!", "How are you today?", "Great to chat!"]
    },
    main: {
      Travel: ["Tell me about popular destinations", "What's the best time to visit?", "How do I plan my itinerary?"],
      Food: ["What ingredients do I need?", "How long does it take to cook?", "What's the nutritional value?"],
      Culture: ["What traditions are important?", "How do people celebrate?", "What should I know about customs?"],
      Business: ["What strategies work best?", "How do you measure success?", "What challenges do you face?"],
      Sports: ["How often should I train?", "What equipment do I need?", "How do I improve my technique?"],
      Music: ["Who are your favorite artists?", "What genre do you prefer?", "How did you get into music?"],
      Technology: ["What's the latest innovation?", "How does it work?", "What are the benefits?"],
      "Daily Life": ["What's your routine like?", "How do you spend weekends?", "What are your hobbies?"]
    },
    closing: {
      all: ["Thank you for the conversation", "This was really helpful", "I learned a lot today", "See you next time!"]
    }
  };
  
  // Get stage-specific suggestions
  const stageSuggestions = stage === "closing" ? 
    contextSuggestions.closing.all : 
    (contextSuggestions[stage] && contextSuggestions[stage][topic]) || 
    contextSuggestions.main[topic] || 
    ["Tell me more", "That's interesting", "I see what you mean"];
  
  // Add intent-based suggestions
  if (intent === "question") {
    suggestions.push("Let me think about that...", "That's a good question!");
  } else if (intent === "greeting") {
    suggestions.push("Nice to meet you!", "Hello there!");
  }
  
  // Combine and randomize
  const allSuggestions = [...new Set([...stageSuggestions, ...suggestions])];
  
  // Return 3 random suggestions
  const shuffled = allSuggestions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
};

// Get vocabulary examples for a topic
const getVocabularyExamples = (topic) => {
  const examples = {
    Travel: ["journey", "destination", "itinerary", "accommodation", "exploration"],
    Food: ["cuisine", "flavor", "ingredient", "recipe", "delicious"],
    Culture: ["tradition", "heritage", "customs", "celebration", "diversity"],
    Business: ["strategy", "innovation", "collaboration", "opportunity", "growth"],
    Sports: ["athletic", "competition", "endurance", "technique", "achievement"],
    Music: ["melody", "rhythm", "harmony", "composition", "performance"],
    Technology: ["innovation", "digital", "automation", "interface", "algorithm"],
    "Daily Life": ["routine", "leisure", "responsibility", "balance", "wellness"]
  };
  
  return examples[topic] || ["interesting", "wonderful", "amazing", "excellent", "fantastic"];
};

// Start a new conversation session
export const startConversation = async (req, res) => {
  try {
    const { topic } = req.body;
    const userId = req.user._id;
    
    // Get a random scenario for the topic from database
    const scenarios = await ConversationScenario.find({ 
      topic, 
      active: true 
    });
    
    if (scenarios.length === 0) {
      return res.status(404).json({ error: "No scenarios available for this topic" });
    }
    
    // Select random scenario
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    // Update scenario usage count
    await ConversationScenario.findByIdAndUpdate(scenario._id, {
      $inc: { usageCount: 1 }
    });
    
    // Generate dynamic initial message using AI
    const initialMessage = await generateContextualResponse(
      topic,
      "",
      [],
      "greeting"
    );
    
    // Create new conversation session
    const session = new ConversationSession({
      userId,
      scenarioId: scenario._id,
      topic,
      messages: [
        {
          role: "system",
          content: `Context: ${scenario.context}`
        },
        {
          role: "assistant",
          content: initialMessage || scenario.initialMessage,
          timestamp: new Date()
        }
      ],
      currentContext: {
        stage: "greeting",
        turnCount: 0,
        discussedTopics: [],
        pendingQuestions: []
      }
    });
    
    await session.save();
    
    // Generate initial suggested responses
    const suggestedResponses = await generateSuggestedResponses(topic, "greeting", [], "greeting");
    
    res.status(201).json({
      sessionId: session._id,
      scenario: {
        title: scenario.title,
        context: scenario.context,
        difficulty: scenario.difficulty
      },
      message: initialMessage || scenario.initialMessage,
      suggestedResponses
    });
  } catch (error) {
    console.error("Error starting conversation:", error);
    res.status(500).json({ error: "Failed to start conversation" });
  }
};

// Send message and get dynamic response
export const sendMessage = async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    const userId = req.user._id;
    
    // Get session with scenario details
    const session = await ConversationSession.findOne({
      _id: sessionId,
      userId
    }).populate('scenarioId');
    
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    // Analyze user message
    const userIntent = analyzeUserIntent(message);
    const keywords = extractKeywords(message);
    const grammarFeedback = analyzeGrammar(message);
    
    // Calculate vocabulary score based on message complexity
    const vocabularyScore = Math.min(10, Math.floor(keywords.length * 1.5));
    
    // Calculate fluency score based on response time and flow
    const fluencyScore = Math.min(10, 5 + Math.floor(message.split(/\s+/).length / 3));
    
    // Add user message to session
    const userMessage = {
      role: "user",
      content: message,
      timestamp: new Date(),
      userIntent,
      feedback: {
        grammar: grammarFeedback.score,
        vocabulary: vocabularyScore,
        fluency: fluencyScore,
        suggestion: grammarFeedback.suggestions[0] || "Good job!",
        corrections: grammarFeedback.corrections
      },
      analysis: {
        keywords,
        confidence: 0.8
      }
    };
    
    session.messages.push(userMessage);
    
    // Update context
    session.currentContext.turnCount += 1;
    session.currentContext.lastUserIntent = userIntent;
    session.currentContext.discussedTopics.push(...keywords);
    
    // Determine conversation stage
    if (session.currentContext.turnCount <= 2) {
      session.currentContext.stage = "greeting";
    } else if (session.currentContext.turnCount <= 4) {
      session.currentContext.stage = "introduction";
    } else if (session.currentContext.turnCount <= 8) {
      session.currentContext.stage = "main";
    } else {
      session.currentContext.stage = "closing";
    }
    
    // Generate AI-powered contextual response
    let responseText = await generateContextualResponse(
      session.topic,
      message,
      session.messages,
      session.currentContext.stage
    );
    
    // Try to enhance with database responses for variety
    const dbResponses = await ConversationResponse.find({
      topic: session.topic,
      userIntent: userIntent,
      active: true
    }).limit(3);
    
    if (dbResponses.length > 0) {
      const dbResponse = dbResponses[Math.floor(Math.random() * dbResponses.length)];
      
      // Mix AI and database responses for best results
      if (Math.random() > 0.5 && dbResponse.responseText) {
        // Sometimes use database response with AI enhancement
        const enhancedDb = generateVariedResponse(dbResponse.responseText, 1);
        responseText = `${enhancedDb} ${responseText.split('.')[1] || ''}`.trim();
      }
      
      // Update usage count
      await ConversationResponse.findByIdAndUpdate(dbResponse._id, {
        $inc: { usageCount: 1 }
      });
    }
    
    // Ensure response is unique and engaging
    const lastBotMessages = session.messages
      .filter(m => m.role === "assistant")
      .slice(-2)
      .map(m => m.content);
    
    // Check for repetition
    for (const lastMsg of lastBotMessages) {
      if (lastMsg && responseText.substring(0, 30).toLowerCase() === lastMsg.substring(0, 30).toLowerCase()) {
        // Generate completely new response if too similar
        responseText = await generateContextualResponse(
          session.topic,
          message,
          session.messages,
          session.currentContext.stage
        );
        responseText = generateVariedResponse(responseText, 2);
        break;
      }
    }
    
    // Add personality based on topic
    const personalities = {
      Travel: "enthusiastic and adventurous",
      Food: "warm and passionate",
      Culture: "respectful and curious",
      Business: "professional and insightful",
      Sports: "energetic and motivating",
      Music: "creative and expressive",
      Technology: "analytical and forward-thinking",
      "Daily Life": "friendly and relatable"
    };
    
    // Add assistant response
    const assistantMessage = {
      role: "assistant",
      content: responseText,
      timestamp: new Date()
    };
    
    session.messages.push(assistantMessage);
    
    // Update performance scores
    session.performance.totalScore += (grammarFeedback.score + vocabularyScore + fluencyScore) / 3;
    session.performance.grammarScore += grammarFeedback.score;
    session.performance.vocabularyScore += vocabularyScore;
    session.performance.fluencyScore += fluencyScore;
    
    // Check if conversation should end
    if (session.currentContext.turnCount >= 10 || session.currentContext.stage === "closing") {
      session.completed = true;
      session.completedAt = new Date();
      session.xpEarned = Math.round(session.performance.totalScore / 5);
      
      // Update user XP
      await User.findByIdAndUpdate(userId, {
        $inc: { 
          "languageProgress.xp": session.xpEarned,
          "languageProgress.conversationsCompleted": 1
        }
      });
    }
    
    await session.save();
    
    // Generate dynamic suggested responses
    const suggestedResponses = await generateSuggestedResponses(
      session.topic,
      session.currentContext.stage,
      keywords,
      userIntent
    );
    
    // Add grammar tips based on actual errors
    const grammarTips = [];
    if (grammarFeedback.corrections && grammarFeedback.corrections.length > 0) {
      grammarFeedback.corrections.forEach(correction => {
        grammarTips.push(`Tip: ${correction.explanation}`);
      });
    }
    
    // Add vocabulary enhancement suggestions
    const vocabularyNotes = [];
    if (vocabularyScore < 7) {
      const examples = getVocabularyExamples(session.topic);
      vocabularyNotes.push({
        tip: "Try using these words",
        examples: examples.slice(0, 3)
      });
    }
    
    // Prepare response
    const response = {
      message: responseText,
      feedback: userMessage.feedback,
      grammarTips,
      vocabularyNotes,
      suggestedResponses,
      performance: {
        currentScore: Math.round(session.performance.totalScore),
        grammarScore: grammarFeedback.score,
        vocabularyScore,
        fluencyScore
      },
      sessionStatus: {
        turnCount: session.currentContext.turnCount,
        stage: session.currentContext.stage,
        completed: session.completed,
        xpEarned: session.xpEarned
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to process message" });
  }
};

// Get conversation hints
export const getHint = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;
    
    const session = await ConversationSession.findOne({
      _id: sessionId,
      userId
    }).populate('scenarioId');
    
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    // Generate contextual hints based on current conversation
    const hints = await generateSuggestedResponses(
      session.topic,
      session.currentContext.stage,
      session.currentContext.discussedTopics,
      session.currentContext.lastUserIntent || "answer"
    );
    
    // Add more specific hints based on stage
    if (session.currentContext.stage === "greeting") {
      hints.push("Introduce yourself", "Ask about their experience");
    } else if (session.currentContext.stage === "main") {
      hints.push("Share your opinion", "Ask a follow-up question");
    }
    
    // Update hints used count
    session.performance.hintsUsed += 1;
    await session.save();
    
    res.json({
      hints: hints.slice(0, 3),
      hintsUsed: session.performance.hintsUsed,
      penaltyPoints: session.performance.hintsUsed * 2
    });
  } catch (error) {
    console.error("Error getting hints:", error);
    res.status(500).json({ error: "Failed to get hints" });
  }
};

// Get session history
export const getSessionHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;
    
    const session = await ConversationSession.findOne({
      _id: sessionId,
      userId
    }).populate('scenarioId');
    
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    res.json(session);
  } catch (error) {
    console.error("Error getting session:", error);
    res.status(500).json({ error: "Failed to get session" });
  }
};

// Get user conversation statistics
export const getConversationStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const stats = await ConversationSession.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$topic",
          totalSessions: { $sum: 1 },
          completedSessions: {
            $sum: { $cond: ["$completed", 1, 0] }
          },
          totalXP: { $sum: "$xpEarned" },
          avgGrammarScore: { $avg: "$performance.grammarScore" },
          avgVocabularyScore: { $avg: "$performance.vocabularyScore" },
          avgFluencyScore: { $avg: "$performance.fluencyScore" },
          totalMessages: { $sum: { $size: "$messages" } }
        }
      }
    ]);
    
    res.json(stats);
  } catch (error) {
    console.error("Error getting stats:", error);
    res.status(500).json({ error: "Failed to get statistics" });
  }
};