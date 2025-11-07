import express from "express";
import mongoose from "mongoose";
import { protectRoute } from "../middleware/auth.middleware.js";
import AITutorSession from "../models/AITutorSession.js";
import User from "../models/User.js";

const router = express.Router();

// AI Tutor service - simulated intelligent responses
class AITutorService {
  static generateResponse(userMessage, context, sessionType) {
    const { userLanguages, currentTopic, userLevel, strugglingAreas } = context;
    
    // Language Learning Responses
    if (sessionType === 'language_help') {
      if (userMessage.toLowerCase().includes('grammar')) {
        return {
          content: `I can help you with ${userLanguages.learning} grammar! Based on your level (${userLevel}), let me explain this concept step by step. What specific grammar rule are you struggling with?`,
          suggestions: ['Verb conjugations', 'Sentence structure', 'Tenses', 'Articles']
        };
      }
      
      if (userMessage.toLowerCase().includes('pronunciation')) {
        return {
          content: `Pronunciation is key for ${userLanguages.learning}! Try practicing with these techniques: 1) Record yourself speaking, 2) Use tongue twisters, 3) Practice with native speakers. Would you like me to suggest some specific exercises?`,
          suggestions: ['Phonetic exercises', 'Common mistakes', 'Practice phrases']
        };
      }
      
      return {
        content: `Great question about ${userLanguages.learning}! As someone learning from ${userLanguages.native}, I understand this can be challenging. Let me break this down for you...`,
        suggestions: ['Grammar help', 'Vocabulary building', 'Conversation practice', 'Cultural tips']
      };
    }
    
    // Coding Help Responses
    if (sessionType === 'coding_help') {
      if (userMessage.toLowerCase().includes('algorithm') || userMessage.toLowerCase().includes('data structure')) {
        return {
          content: `Let's tackle this algorithm problem together! Based on your current level, I'll explain the concept step by step and provide examples in your preferred language. What specific part is confusing you?`,
          suggestions: ['Time complexity', 'Space complexity', 'Implementation tips', 'Similar problems']
        };
      }
      
      if (userMessage.toLowerCase().includes('debug') || userMessage.toLowerCase().includes('error')) {
        return {
          content: `Debugging can be frustrating, but it's a great learning opportunity! Let's go through your code systematically. Can you share the error message and the code snippet you're working with?`,
          suggestions: ['Share code', 'Error analysis', 'Testing strategies', 'Best practices']
        };
      }
      
      return {
        content: `I'm here to help with your coding journey! Whether it's algorithms, debugging, or understanding concepts, we can work through it together. What programming challenge are you facing?`,
        suggestions: ['Algorithm help', 'Code review', 'Best practices', 'Career advice']
      };
    }
    
    // Career Guidance
    if (sessionType === 'career_guidance') {
      return {
        content: `Career planning in tech is exciting! Based on your language skills (${userLanguages.native} → ${userLanguages.learning}) and coding progress, you have unique advantages. Let's discuss your goals and create a roadmap!`,
        suggestions: ['Skill assessment', 'Job market insights', 'Portfolio building', 'Interview prep']
      };
    }
    
    // General Chat
    return {
      content: `Hello! I'm your AI learning mentor. I can help you with language learning, coding challenges, career advice, or just chat about your learning journey. What would you like to explore today?`,
      suggestions: ['Language help', 'Coding assistance', 'Career guidance', 'Study tips']
    };
  }
  
  static generateContextualTips(userLevel, strugglingAreas) {
    const tips = [];
    
    if (strugglingAreas.includes('grammar')) {
      tips.push("💡 Try the 'explain it to a 5-year-old' technique for grammar rules");
    }
    
    if (strugglingAreas.includes('algorithms')) {
      tips.push("🧠 Break down complex algorithms into smaller, manageable steps");
    }
    
    if (userLevel === 'beginner') {
      tips.push("🌱 Remember: every expert was once a beginner. Take it one step at a time!");
    }
    
    return tips;
  }
}

// Start new AI tutor session
router.post("/start-session", protectRoute, async (req, res) => {
  try {
    const { sessionType, initialMessage } = req.body;
    const userId = req.user._id;
    
    // Get user context
    const user = await User.findById(userId);
    const context = {
      userLanguages: {
        native: user.nativeLanguage,
        learning: user.learningLanguage
      },
      userLevel: user.skillLevel || 'beginner',
      strugglingAreas: user.strugglingAreas || []
    };
    
    // Generate AI response
    const aiResponse = AITutorService.generateResponse(initialMessage, context, sessionType);
    
    // Create new session
    const session = new AITutorSession({
      userId,
      sessionType,
      messages: [
        {
          role: 'user',
          content: initialMessage
        },
        {
          role: 'assistant',
          content: aiResponse.content,
          metadata: {
            suggestions: aiResponse.suggestions
          }
        }
      ],
      context
    });
    
    await session.save();
    
    res.status(201).json({
      success: true,
      session: session,
      tips: AITutorService.generateContextualTips(context.userLevel, context.strugglingAreas)
    });
    
  } catch (error) {
    console.error("Error starting AI tutor session:", error);
    res.status(500).json({ message: "Failed to start AI tutor session" });
  }
});

// Continue conversation in existing session
router.post("/continue-session/:sessionId", protectRoute, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message, codeSnippet, problemContext } = req.body;
    const userId = req.user._id;
    
    const session = await AITutorSession.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    
    // Add user message
    session.messages.push({
      role: 'user',
      content: message,
      metadata: {
        codeSnippet,
        problemContext
      }
    });
    
    // Generate AI response based on conversation history
    const aiResponse = AITutorService.generateResponse(message, session.context, session.sessionType);
    
    // Add AI response
    session.messages.push({
      role: 'assistant',
      content: aiResponse.content,
      metadata: {
        suggestions: aiResponse.suggestions
      }
    });
    
    await session.save();
    
    res.json({
      success: true,
      message: session.messages[session.messages.length - 1],
      tips: AITutorService.generateContextualTips(session.context.userLevel, session.context.strugglingAreas)
    });
    
  } catch (error) {
    console.error("Error continuing AI tutor session:", error);
    res.status(500).json({ message: "Failed to continue session" });
  }
});

// Get user's AI tutor sessions
router.get("/sessions", protectRoute, async (req, res) => {
  try {
    const userId = req.user._id;
    const sessions = await AITutorSession.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(10);
    
    res.json({
      success: true,
      sessions
    });
    
  } catch (error) {
    console.error("Error fetching AI tutor sessions:", error);
    res.status(500).json({ message: "Failed to fetch sessions" });
  }
});

// Get specific session with full conversation
router.get("/sessions/:sessionId", protectRoute, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;
    
    const session = await AITutorSession.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    
    res.json({
      success: true,
      session
    });
    
  } catch (error) {
    console.error("Error fetching AI tutor session:", error);
    res.status(500).json({ message: "Failed to fetch session" });
  }
});

// Rate AI tutor session
router.post("/rate-session/:sessionId", protectRoute, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { rating, feedback } = req.body;
    const userId = req.user._id;
    
    const session = await AITutorSession.findOneAndUpdate(
      { _id: sessionId, userId },
      { rating, feedback, isActive: false },
      { new: true }
    );
    
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    
    res.json({
      success: true,
      message: "Session rated successfully"
    });
    
  } catch (error) {
    console.error("Error rating AI tutor session:", error);
    res.status(500).json({ message: "Failed to rate session" });
  }
});

// Get AI tutor analytics
router.get("/analytics", protectRoute, async (req, res) => {
  try {
    const userId = req.user._id;

    const analytics = await AITutorSession.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$sessionType",
          count: { $sum: 1 },
          avgRating: { $avg: "$rating" },
          totalMessages: { $sum: { $size: "$messages" } }
        }
      }
    ]);

    const totalSessions = await AITutorSession.countDocuments({ userId });
    const activeSessions = await AITutorSession.countDocuments({ userId, isActive: true });

    res.json({
      success: true,
      analytics: {
        totalSessions,
        activeSessions,
        sessionBreakdown: analytics,
        lastSessionDate: (await AITutorSession.findOne({ userId }).sort({ updatedAt: -1 }))?.updatedAt
      }
    });

  } catch (error) {
    console.error("Error fetching AI tutor analytics:", error);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});

export default router;