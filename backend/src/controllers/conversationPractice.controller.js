import conversationAI from '../services/conversationAI.service.js';
import LearningProgress from '../models/LearningProgress.js';

// Start a new conversation practice session
export async function startConversation(req, res) {
  try {
    const userId = req.user._id;
    const { scenario = 'at-the-cafe', languageLevel = 'intermediate' } = req.body;
    
    // Check if user already has an active conversation
    if (conversationAI.hasActiveConversation(userId.toString())) {
      return res.status(400).json({
        message: 'You already have an active conversation. Please end it before starting a new one.'
      });
    }
    
    // Start new conversation
    const conversationData = await conversationAI.startConversation(
      userId.toString(),
      scenario,
      languageLevel
    );
    
    res.status(200).json({
      success: true,
      ...conversationData
    });
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({ message: 'Failed to start conversation' });
  }
}

// Send a message in the conversation
export async function sendMessage(req, res) {
  try {
    const userId = req.user._id;
    const { message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }
    
    // Process message and get AI response
    const response = await conversationAI.processMessage(userId.toString(), message);
    
    if (response.error) {
      return res.status(400).json({ message: response.error });
    }
    
    res.status(200).json({
      success: true,
      ...response
    });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ message: 'Failed to process message' });
  }
}

// End conversation and get summary
export async function endConversation(req, res) {
  try {
    const userId = req.user._id;
    
    // End conversation and get summary
    const summary = await conversationAI.endConversation(userId.toString());
    
    if (!summary) {
      return res.status(404).json({ message: 'No active conversation found' });
    }
    
    // Update user's learning progress
    let progress = await LearningProgress.findOne({ user: userId });
    
    if (!progress) {
      progress = await LearningProgress.create({ user: userId });
    }
    
    // Update conversation statistics
    progress.conversationsCompleted += 1;
    progress.totalStudyTime += Math.floor(summary.duration / 60); // Convert to minutes
    
    // Add XP based on performance
    const xpEarned = Math.floor(summary.averageScore * 1.5); // 1.5x multiplier for score
    const xpResult = progress.addXP(xpEarned);
    
    // Check if this completes a daily challenge
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysChallenge = progress.dailyChallenges.find(challenge => {
      const challengeDate = new Date(challenge.date);
      challengeDate.setHours(0, 0, 0, 0);
      return challengeDate.getTime() === today.getTime() && 
             challenge.challengeId === 'chat-5min' && 
             !challenge.completed;
    });
    
    if (todaysChallenge && summary.duration >= 300) { // 5 minutes = 300 seconds
      todaysChallenge.completed = true;
      todaysChallenge.completedAt = new Date();
      progress.addXP(todaysChallenge.xpEarned);
    }
    
    // Update streak
    progress.updateStreak();
    
    await progress.save();
    
    res.status(200).json({
      success: true,
      summary,
      xpEarned,
      xpResult,
      challengeCompleted: todaysChallenge?.completed || false
    });
  } catch (error) {
    console.error('Error ending conversation:', error);
    res.status(500).json({ message: 'Failed to end conversation' });
  }
}

// Get conversation status
export async function getConversationStatus(req, res) {
  try {
    const userId = req.user._id;
    
    const status = conversationAI.getConversationStatus(userId.toString());
    
    if (!status) {
      return res.status(200).json({
        hasActiveConversation: false
      });
    }
    
    res.status(200).json({
      hasActiveConversation: true,
      ...status
    });
  } catch (error) {
    console.error('Error getting conversation status:', error);
    res.status(500).json({ message: 'Failed to get conversation status' });
  }
}

// Get available conversation scenarios
export async function getScenarios(req, res) {
  try {
    const scenarios = [
      // Beginner Level
      {
        id: 'at-the-cafe',
        title: 'At the Café',
        description: 'Practice ordering coffee and food, making small talk with the barista',
        difficulty: 'beginner',
        estimatedTime: '5-10 minutes',
        skills: ['Ordering', 'Polite requests', 'Small talk'],
        icon: '☕',
        aiPersona: 'Friendly barista'
      },
      {
        id: 'shopping-adventure',
        title: 'Shopping Adventure',
        description: 'Get fashion advice and shop for clothes with an enthusiastic boutique assistant',
        difficulty: 'beginner',
        estimatedTime: '5-10 minutes',
        skills: ['Shopping vocabulary', 'Expressing preferences', 'Making decisions'],
        icon: '🛍️',
        aiPersona: 'Maya - Fashion enthusiast'
      },
      {
        id: 'travel-planning',
        title: 'Travel Planning',
        description: 'Plan your dream vacation with an experienced travel agent',
        difficulty: 'beginner',
        estimatedTime: '5-10 minutes',
        skills: ['Travel vocabulary', 'Asking questions', 'Making plans'],
        icon: '✈️',
        aiPersona: 'Sofia - World traveler'
      },
      
      // Intermediate Level
      {
        id: 'at-the-restaurant',
        title: 'Fine Dining',
        description: 'Experience upscale dining with menu recommendations and wine pairing',
        difficulty: 'intermediate',
        estimatedTime: '10-15 minutes',
        skills: ['Food vocabulary', 'Formal language', 'Special requests'],
        icon: '🍽️',
        aiPersona: 'Professional waiter'
      },
      {
        id: 'job-interview',
        title: 'Job Interview',
        description: 'Practice interviewing for a software developer position at a tech company',
        difficulty: 'intermediate',
        estimatedTime: '10-15 minutes',
        skills: ['Professional language', 'Self-presentation', 'Asking questions'],
        icon: '💼',
        aiPersona: 'Robert Chen - Hiring manager'
      },
      {
        id: 'medical-appointment',
        title: 'Doctor\'s Visit',
        description: 'Discuss health concerns with a caring family physician',
        difficulty: 'intermediate',
        estimatedTime: '10-15 minutes',
        skills: ['Medical vocabulary', 'Describing symptoms', 'Understanding advice'],
        icon: '🏥',
        aiPersona: 'Dr. Sarah Martinez'
      },
      {
        id: 'tech-support',
        title: 'Tech Support Call',
        description: 'Get help solving computer problems with a patient support specialist',
        difficulty: 'intermediate',
        estimatedTime: '10-15 minutes',
        skills: ['Technical vocabulary', 'Following instructions', 'Problem description'],
        icon: '💻',
        aiPersona: 'Jamie - Tech specialist'
      },
      
      // Advanced Level
      {
        id: 'friendly-debate',
        title: 'Friendly Debate',
        description: 'Engage in an intellectual debate about AI and creativity with a witty student',
        difficulty: 'advanced',
        estimatedTime: '15-20 minutes',
        skills: ['Argumentation', 'Complex ideas', 'Persuasion'],
        icon: '🎭',
        aiPersona: 'Alex - University student'
      },
      {
        id: 'gym-trainer',
        title: 'Personal Training',
        description: 'Work out with an energetic personal trainer who motivates and guides you',
        difficulty: 'advanced',
        estimatedTime: '10-15 minutes',
        skills: ['Fitness vocabulary', 'Following instructions', 'Expressing difficulty'],
        icon: '💪',
        aiPersona: 'Marcus - Fitness enthusiast'
      },
      {
        id: 'cooking-class',
        title: 'Italian Cooking Class',
        description: 'Learn to cook authentic Italian cuisine with Chef Isabella',
        difficulty: 'advanced',
        estimatedTime: '15-20 minutes',
        skills: ['Cooking vocabulary', 'Following recipes', 'Asking for clarification'],
        icon: '👨‍🍳',
        aiPersona: 'Chef Isabella'
      },
      {
        id: 'real-estate',
        title: 'House Hunting',
        description: 'Tour properties and negotiate with an honest real estate agent',
        difficulty: 'advanced',
        estimatedTime: '15-20 minutes',
        skills: ['Property vocabulary', 'Negotiation', 'Asking detailed questions'],
        icon: '🏠',
        aiPersona: 'David Kim - Realtor'
      },
      {
        id: 'at-the-airport',
        title: 'Airport Check-in',
        description: 'Navigate check-in, security, and boarding procedures',
        difficulty: 'intermediate',
        estimatedTime: '10-15 minutes',
        skills: ['Travel vocabulary', 'Following instructions', 'Problem solving'],
        icon: '🛫',
        aiPersona: 'Airline staff'
      }
    ];
    
    res.status(200).json(scenarios);
  } catch (error) {
    console.error('Error getting scenarios:', error);
    res.status(500).json({ message: 'Failed to get scenarios' });
  }
}