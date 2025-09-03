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
          content: scenario.initialMessage,
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
    
    res.status(201).json({
      sessionId: session._id,
      scenario: {
        title: scenario.title,
        context: scenario.context,
        difficulty: scenario.difficulty
      },
      message: scenario.initialMessage,
      suggestedResponses: scenario.suggestedResponses
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
    
    // Find appropriate response from database
    let responseQuery = {
      topic: session.topic,
      userIntent: userIntent,
      active: true
    };
    
    // Add context-based filtering
    if (keywords.length > 0) {
      responseQuery.contextKeywords = { $in: keywords };
    }
    
    // Get matching responses
    let responses = await ConversationResponse.find(responseQuery);
    
    // If no exact match, get responses by intent only
    if (responses.length === 0) {
      responses = await ConversationResponse.find({
        topic: session.topic,
        userIntent: userIntent,
        active: true
      });
    }
    
    // If still no match, get any response for the topic
    if (responses.length === 0) {
      responses = await ConversationResponse.find({
        topic: session.topic,
        responseType: "followup",
        active: true
      });
    }
    
    // Select response (prioritize unused or least used)
    let selectedResponse;
    if (responses.length > 0) {
      responses.sort((a, b) => a.usageCount - b.usageCount);
      selectedResponse = responses[0];
      
      // Update response usage
      await ConversationResponse.findByIdAndUpdate(selectedResponse._id, {
        $inc: { usageCount: 1 }
      });
    } else {
      // Fallback response if nothing in database
      selectedResponse = {
        responseText: "That's interesting! Can you tell me more about that?",
        grammarTips: ["Keep practicing!"],
        vocabularyNotes: []
      };
    }
    
    // Add assistant response
    const assistantMessage = {
      role: "assistant",
      content: selectedResponse.responseText,
      timestamp: new Date(),
      responseId: selectedResponse._id
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
    
    // Prepare response
    const response = {
      message: selectedResponse.responseText,
      feedback: userMessage.feedback,
      grammarTips: selectedResponse.grammarTips || [],
      vocabularyNotes: selectedResponse.vocabularyNotes || [],
      culturalNotes: selectedResponse.culturalNotes,
      suggestedResponses: selectedResponse.alternativeResponses || [],
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
    
    // Get context-appropriate hints
    const lastIntent = session.currentContext.lastUserIntent || "answer";
    const stage = session.currentContext.stage;
    
    // Find suggested responses for current context
    const suggestedResponses = await ConversationResponse.find({
      topic: session.topic,
      userIntent: lastIntent,
      difficulty: { $lte: session.scenarioId.difficulty },
      active: true
    }).select('alternativeResponses contextKeywords').limit(3);
    
    const hints = [];
    suggestedResponses.forEach(resp => {
      if (resp.alternativeResponses && resp.alternativeResponses.length > 0) {
        hints.push(...resp.alternativeResponses.slice(0, 2));
      }
    });
    
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