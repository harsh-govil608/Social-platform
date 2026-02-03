import express from "express";
import mongoose from "mongoose";
import { protectRoute } from "../middleware/auth.middleware.js";
import AITutorSession from "../models/AITutorSession.js";
import User from "../models/User.js";
import { generateAIResponse, MODELS } from "../lib/ai.js";
import {
  getAllPersonalities,
  getPersonality,
  getSystemPrompt,
  getConversationStarter,
  formatFeedback
} from "../lib/aiPersonalities.js";

const router = express.Router();

// AI Tutor service with real Hugging Face integration
class AITutorService {
  static async generateResponse(userMessage, context, sessionType, conversationHistory = [], personality = 'friendly') {
    const { userLanguages, currentTopic, userLevel, strugglingAreas } = context;

    // Get personality-specific base prompt
    const personalityData = getPersonality(personality);
    let systemPrompt = getSystemPrompt(personality, {
      language: userLanguages?.learning,
      level: userLevel,
      topic: currentTopic
    });

    // Append session-type specific instructions

    if (sessionType === 'language_help') {
      systemPrompt += `\n\nYou are also an expert language tutor helping a ${userLevel} level student learn ${userLanguages?.learning || 'a new language'} (their native language is ${userLanguages?.native || 'English'}).

Additional teaching guidelines:
- Break down complex grammar into simple explanations
- Use examples from their native language when helpful
- Provide actionable practice suggestions
- Keep responses concise (2-3 paragraphs max)

${strugglingAreas?.length > 0 ? `The student struggles with: ${strugglingAreas.join(', ')}` : ''}`;
    }
    else if (sessionType === 'coding_help') {
      systemPrompt += `\n\nYou are also a patient programming mentor helping a ${userLevel} level developer.

Additional teaching guidelines:
- Explain concepts step-by-step
- Use simple analogies when explaining algorithms
- Provide code examples when relevant
- Ask clarifying questions before diving deep
- Keep responses focused (2-3 paragraphs)

${strugglingAreas?.length > 0 ? `Areas the student finds challenging: ${strugglingAreas.join(', ')}` : ''}`;
    }
    else if (sessionType === 'career_guidance') {
      systemPrompt += `\n\nYou are also a tech career advisor with expertise in global job markets. The student knows ${userLanguages?.native || 'one language'} and is learning ${userLanguages?.learning || 'another language'}, which gives them unique advantages.

Additional guidance:
- Provide practical, actionable career advice
- Highlight opportunities that match their language skills
- Be realistic but encouraging
- Keep advice concise and specific`;
    }
    else {
      systemPrompt += `\n\nYou help students with:
- Language learning (grammar, pronunciation, conversation)
- Programming and algorithms
- Career planning in tech
- Study strategies and motivation

Be conversational and concise in your responses.`;
    }

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

    // Generate contextual suggestions based on session type
    const suggestions = this.generateSuggestions(sessionType, userMessage, userLevel);

    return {
      content: aiContent,
      suggestions
    };
  }

  static generateSuggestions(sessionType, userMessage, userLevel) {
    // Generate dynamic suggestions based on context
    const lowerMessage = userMessage.toLowerCase();

    if (sessionType === 'language_help') {
      if (lowerMessage.includes('grammar')) {
        return ['Verb conjugations', 'Sentence structure', 'Tenses', 'Common mistakes'];
      }
      if (lowerMessage.includes('pronunciation')) {
        return ['Phonetic exercises', 'Practice phrases', 'Audio resources', 'Tongue twisters'];
      }
      if (lowerMessage.includes('vocabulary')) {
        return ['Word lists', 'Flashcards', 'Spaced repetition', 'Usage examples'];
      }
      return ['Grammar help', 'Vocabulary building', 'Conversation practice', 'Cultural tips'];
    }

    if (sessionType === 'coding_help') {
      if (lowerMessage.includes('algorithm') || lowerMessage.includes('data structure')) {
        return ['Time complexity', 'Space complexity', 'Implementation tips', 'Practice problems'];
      }
      if (lowerMessage.includes('debug') || lowerMessage.includes('error')) {
        return ['Common errors', 'Debugging strategies', 'Testing approaches', 'Best practices'];
      }
      return ['Algorithm help', 'Code review', 'Best practices', 'Similar problems'];
    }

    if (sessionType === 'career_guidance') {
      return ['Skill assessment', 'Job market insights', 'Portfolio building', 'Interview prep'];
    }

    return ['Language help', 'Coding assistance', 'Career guidance', 'Study tips'];
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

// Get available AI tutor personalities
router.get("/personalities", protectRoute, async (req, res) => {
  try {
    const personalities = getAllPersonalities();
    const user = await User.findById(req.user._id).select('aiPreferences');

    res.json({
      success: true,
      personalities,
      currentPreference: user?.aiPreferences?.preferredTutor || 'friendly'
    });
  } catch (error) {
    console.error("Error fetching personalities:", error);
    res.status(500).json({ message: "Failed to fetch personalities" });
  }
});

// Update user's preferred AI tutor personality
router.post("/preferences", protectRoute, async (req, res) => {
  try {
    const { preferredTutor } = req.body;
    const validPersonalities = ['friendly', 'professional', 'challenging', 'playful'];

    if (!validPersonalities.includes(preferredTutor)) {
      return res.status(400).json({ message: "Invalid personality type" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      'aiPreferences.preferredTutor': preferredTutor
    });

    res.json({
      success: true,
      message: "AI tutor preference updated",
      preferredTutor
    });
  } catch (error) {
    console.error("Error updating AI preference:", error);
    res.status(500).json({ message: "Failed to update preference" });
  }
});

// Start new AI tutor session
router.post("/start-session", protectRoute, async (req, res) => {
  try {
    const { sessionType, initialMessage, personality } = req.body;
    const userId = req.user._id;

    if (!initialMessage || !sessionType) {
      return res.status(400).json({ message: "Initial message and session type are required" });
    }

    // Get user context and preferred personality
    const user = await User.findById(userId);
    const userPersonality = personality || user?.aiPreferences?.preferredTutor || 'friendly';

    const context = {
      userLanguages: {
        native: user.nativeLanguage || 'English',
        learning: user.learningLanguage || 'Spanish'
      },
      userLevel: user.skillLevel || 'beginner',
      strugglingAreas: user.strugglingAreas || [],
      personality: userPersonality
    };

    // Generate AI response using Hugging Face with personality
    const aiResponse = await AITutorService.generateResponse(
      initialMessage,
      context,
      sessionType,
      [],
      userPersonality
    );

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