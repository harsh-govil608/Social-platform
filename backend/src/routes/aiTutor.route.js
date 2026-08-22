import express from "express";
import mongoose from "mongoose";
import { protectRoute } from "../middleware/auth.middleware.js";
import AITutorSession from "../models/AITutorSession.js";
import User from "../models/User.js";
import { generateAIResponse, MODELS } from "../lib/ai.js";
import {
  getSystemPrompt,
  getPracticeStarter,
  formatFeedback
} from "../lib/aiPersonalities.js";

const router = express.Router();

// AI Tutor service with real Hugging Face integration
class AITutorService {
  static async generateResponse(userMessage, context, sessionType, conversationHistory = []) {
    const { userLanguages, currentTopic, userLevel, strugglingAreas } = context;

    // Get supportive coach system prompt
    let systemPrompt = getSystemPrompt({
      language: userLanguages?.learning,
      level: userLevel,
      topic: currentTopic
    });

    // Add language learning context
    systemPrompt += `\n\nYou are helping a ${userLevel} level student learn ${userLanguages?.learning || 'a new language'} (their native language is ${userLanguages?.native || 'English'}).

Your focus:
- Provide feedback on their practice attempt
- Correct mistakes with clear explanations
- Suggest better phrasing when appropriate
- Keep responses very concise (2-3 sentences)
- Adapt difficulty to their level

${strugglingAreas?.length > 0 ? `The student struggles with: ${strugglingAreas.join(', ')}` : ''}`;

    // Build conversation context (last 4 messages for context)
    const recentHistory = conversationHistory.slice(-4);
    let conversationContext = '';
    if (recentHistory.length > 0) {
      conversationContext = '\n\nRecent conversation:\n' +
        recentHistory.map(msg => `${msg.role === 'user' ? 'Student' : 'You'}: ${msg.content}`).join('\n');
    }

    // Generate AI response
    const aiContent = await generateAIResponse({
      systemPrompt,
      userMessage: userMessage + conversationContext,
      model: MODELS.BALANCED, // Use balanced model for tutoring
      temperature: 0.7,
      maxTokens: 400
    });

    // Generate contextual suggestions
    const suggestions = this.generateSuggestions(userMessage, userLevel);

    return {
      content: aiContent,
      suggestions
    };
  }

  static generateSuggestions(userMessage, userLevel) {
    // Generate simple practice suggestions
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('grammar')) {
      return ['Try using this in a sentence', 'Practice similar structures', 'Review the rule'];
    }
    if (lowerMessage.includes('pronunciation')) {
      return ['Break it into syllables', 'Listen and repeat', 'Practice slowly'];
    }
    if (lowerMessage.includes('vocabulary')) {
      return ['Use it in context', 'Find synonyms', 'Make flashcards'];
    }
    return ['Try again', 'Practice more', 'Keep going'];
  }

  static generateContextualTips(userLevel, strugglingAreas) {
    const tips = [];

    if (strugglingAreas.includes('grammar')) {
      tips.push("💡 Try explaining grammar rules in your own words - teaching helps learning!");
    }

    if (strugglingAreas.includes('algorithms')) {
      tips.push("🧠 Draw diagrams to visualize algorithm steps - it really helps!");
    }

    if (strugglingAreas.includes('pronunciation')) {
      tips.push("🗣️ Record yourself and compare with native speakers - you'll hear the difference!");
    }

    if (userLevel === 'beginner') {
      tips.push("🌱 Focus on consistency over intensity - 20 minutes daily beats 3 hours once a week!");
    }

    if (userLevel === 'intermediate') {
      tips.push("📈 You're past the hardest part! Now focus on depth over breadth.");
    }

    if (userLevel === 'advanced') {
      tips.push("🎯 Challenge yourself with real-world projects - that's where true mastery comes!");
    }

    return tips.length > 0 ? tips : ["💪 Keep up the great work! Learning is a journey, not a destination."];
  }
}

// Note: AI tutor personalities removed - using single supportive coach only

// Start new AI tutor session (for daily task practice)
router.post("/start-session", protectRoute, async (req, res) => {
  try {
    const { sessionType, initialMessage } = req.body;
    const userId = req.user._id;

    if (!initialMessage) {
      return res.status(400).json({ message: "Initial message is required" });
    }

    // Only support language_help session type (tied to daily tasks)
    const validSessionType = sessionType === 'language_help' ? sessionType : 'language_help';

    // Get user context
    const user = await User.findById(userId);

    const context = {
      userLanguages: {
        native: user.nativeLanguage || 'English',
        learning: user.learningLanguage || 'Spanish'
      },
      userLevel: user.proficiencyLevel || user.skillLevel || 'beginner',
      strugglingAreas: user.strugglingAreas || []
    };

    // Generate AI response using supportive coach
    const aiResponse = await AITutorService.generateResponse(
      initialMessage,
      context,
      validSessionType,
      []
    );

    // Create new session
    const session = new AITutorSession({
      userId,
      sessionType: validSessionType,
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
    res.status(500).json({ message: "Failed to start AI tutor session", error: error.message });
  }
});

// Continue conversation in existing session
router.post("/continue-session/:sessionId", protectRoute, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message, codeSnippet, problemContext } = req.body;
    const userId = req.user._id;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

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

    // Generate AI response with conversation history and personality
    const aiResponse = await AITutorService.generateResponse(
      message,
      session.context,
      session.sessionType,
      session.messages,
      session.context?.personality || 'friendly'
    );

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
    res.status(500).json({ message: "Failed to continue session", error: error.message });
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

// Quick grammar/spelling correction for chat messages (invisible AI)
router.post("/quick-correct", protectRoute, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.length < 10) {
      return res.json({
        hasSuggestion: false,
        corrected: text,
        explanation: null
      });
    }

    // Get user's learning language for context
    const user = await User.findById(req.user._id);
    const learningLanguage = user?.learningLanguage || 'English';

    // Use AI to check and correct the message
    const systemPrompt = `You are a helpful language assistant. The user is learning ${learningLanguage}.
Check their message for grammar, spelling, and natural phrasing errors.

Rules:
- If the message is correct or only has very minor issues, respond with: {"hasSuggestion": false}
- If there are meaningful improvements, respond with: {"hasSuggestion": true, "corrected": "the corrected text", "explanation": "brief 5-10 word explanation"}
- Keep corrections natural and conversational
- Don't change the meaning
- Only suggest changes if they significantly improve the message

Respond ONLY with valid JSON, nothing else.`;

    const aiResponse = await generateAIResponse({
      systemPrompt,
      userMessage: `Check this message: "${text}"`,
      model: MODELS.FAST, // Use fast model for quick responses
      temperature: 0.3,
      maxTokens: 150
    });

    // Parse AI response
    try {
      const parsed = JSON.parse(aiResponse);
      res.json({
        hasSuggestion: parsed.hasSuggestion || false,
        corrected: parsed.corrected || text,
        explanation: parsed.explanation || null
      });
    } catch {
      // If parsing fails, return no suggestion
      res.json({
        hasSuggestion: false,
        corrected: text,
        explanation: null
      });
    }

  } catch (error) {
    console.error("Error in quick-correct:", error);
    // Don't fail the request, just return no suggestion
    res.json({
      hasSuggestion: false,
      corrected: req.body.text,
      explanation: null
    });
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