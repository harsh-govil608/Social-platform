import LearningProgress from '../models/LearningProgress.js';
import User from '../models/User.js';
import UserActivity from '../models/UserActivity.js';
import PronunciationPhrase from '../models/PronunciationPhrase.js';
import { seedPronunciationPhrases } from '../lib/seedPhrases.js';

// Helper function to update XP and Coins in both LearningProgress and UserActivity
const updateUserXPAndCoins = async (userId, xpAmount, coinsAmount = 0) => {
  try {
    let userActivity = await UserActivity.findOne({ user: userId });

    if (!userActivity) {
      userActivity = await UserActivity.create({
        user: userId,
        gamification: {
          level: 1,
          xp: xpAmount,
          coins: coinsAmount
        },
        metrics: {},
        streaks: {}
      });
    } else {
      userActivity.gamification.xp = (userActivity.gamification.xp || 0) + xpAmount;
      userActivity.gamification.coins = (userActivity.gamification.coins || 0) + coinsAmount;
      const newLevel = Math.floor(userActivity.gamification.xp / 1000) + 1;
      if (newLevel > userActivity.gamification.level) {
        userActivity.gamification.level = newLevel;
      }
      await userActivity.save();
    }

    return userActivity;
  } catch (error) {
    console.error('Error updating user XP and Coins:', error);
    throw error;
  }
};

// Get user's learning progress
export async function getLearningProgress(req, res) {
  try {
    const userId = req.user._id;
    
    let progress = await LearningProgress.findOne({ user: userId })
      .populate('languagePartners.partnerId', 'fullName profilePic nativeLanguage learningLanguage');
    
    if (!progress) {
      // Create new progress record for user
      progress = await LearningProgress.create({ user: userId });
    }
    
    // Update streak if needed
    progress.updateStreak();
    await progress.save();
    
    res.status(200).json(progress);
  } catch (error) {
    console.error('Error fetching learning progress:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Update learning progress (generic update)
export async function updateLearningProgress(req, res) {
  try {
    const userId = req.user._id;
    const updates = req.body;
    
    let progress = await LearningProgress.findOne({ user: userId });
    
    if (!progress) {
      progress = await LearningProgress.create({ user: userId });
    }
    
    // Update fields
    Object.keys(updates).forEach(key => {
      if (key !== 'user' && key !== '_id') {
        progress[key] = updates[key];
      }
    });
    
    progress.updateStreak();
    await progress.save();
    
    res.status(200).json(progress);
  } catch (error) {
    console.error('Error updating learning progress:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Complete a video lesson
export async function completeLesson(req, res) {
  try {
    const userId = req.user._id;
    const { lessonId, xpEarned = 50 } = req.body;
    
    let progress = await LearningProgress.findOne({ user: userId });
    
    if (!progress) {
      progress = await LearningProgress.create({ user: userId });
    }
    
    // Check if lesson already completed
    const alreadyCompleted = progress.completedLessons.some(
      lesson => lesson.lessonId === lessonId
    );
    
    if (alreadyCompleted) {
      return res.status(200).json({ 
        message: 'Lesson already completed',
        progress 
      });
    }
    
    // Add completed lesson
    progress.completedLessons.push({
      lessonId,
      completedAt: new Date(),
      xpEarned
    });

    // Add XP and Coins and check for level up
    const coinsEarned = Math.round(xpEarned / 5);
    const xpResult = progress.addXP(xpEarned);

    // Update streak
    progress.updateStreak();

    await progress.save();

    // IMPORTANT: Also update UserActivity XP and Coins for leaderboard/dashboard
    await updateUserXPAndCoins(userId, xpEarned, coinsEarned);

    res.status(200).json({
      message: 'Lesson completed successfully',
      xpResult,
      coinsEarned,
      progress
    });
  } catch (error) {
    console.error('Error completing lesson:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Get daily challenges
export async function getDailyChallenges(req, res) {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let progress = await LearningProgress.findOne({ user: userId });
    
    if (!progress) {
      progress = await LearningProgress.create({ user: userId });
    }
    
    // Check if we have challenges for today
    const todaysChallenges = progress.dailyChallenges.filter(challenge => {
      const challengeDate = new Date(challenge.date);
      challengeDate.setHours(0, 0, 0, 0);
      return challengeDate.getTime() === today.getTime();
    });
    
    if (todaysChallenges.length === 0) {
      // Generate new daily challenges
      const challenges = [
        {
          challengeId: 'chat-5min',
          title: '5-Minute Conversation',
          completed: false,
          xpEarned: 100,
          date: today
        },
        {
          challengeId: 'learn-10-words',
          title: 'Learn 10 New Words',
          completed: false,
          xpEarned: 50,
          date: today
        },
        {
          challengeId: 'watch-lesson',
          title: 'Watch & Learn',
          completed: false,
          xpEarned: 75,
          date: today
        }
      ];
      
      progress.dailyChallenges.push(...challenges);
      await progress.save();
      
      return res.status(200).json(challenges);
    }
    
    res.status(200).json(todaysChallenges);
  } catch (error) {
    console.error('Error fetching daily challenges:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Complete a daily challenge
export async function completeDailyChallenge(req, res) {
  try {
    const userId = req.user._id;
    const { challengeId } = req.body;
    
    let progress = await LearningProgress.findOne({ user: userId });
    
    if (!progress) {
      progress = await LearningProgress.create({ user: userId });
    }
    
    // Find and update the challenge
    const challenge = progress.dailyChallenges.find(
      c => c.challengeId === challengeId && !c.completed
    );
    
    if (!challenge) {
      return res.status(400).json({ message: 'Challenge not found or already completed' });
    }
    
    challenge.completed = true;
    challenge.completedAt = new Date();

    // Add XP and Coins
    const coinsEarned = Math.round(challenge.xpEarned / 5);
    const xpResult = progress.addXP(challenge.xpEarned);

    // Update streak
    progress.updateStreak();

    await progress.save();

    // IMPORTANT: Also update UserActivity XP and Coins for leaderboard/dashboard
    await updateUserXPAndCoins(userId, challenge.xpEarned, coinsEarned);

    res.status(200).json({
      message: 'Challenge completed successfully',
      xpResult,
      coinsEarned,
      progress
    });
  } catch (error) {
    console.error('Error completing daily challenge:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Get suggested language partners
export async function getSuggestedPartners(req, res) {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find users who:
    // 1. Native language matches user's learning language
    // 2. Learning language matches user's native language
    // 3. Not the current user
    const partners = await User.find({
      _id: { $ne: userId },
      nativeLanguage: user.learningLanguage,
      learningLanguage: user.nativeLanguage,
      isOnboarded: true
    })
    .select('fullName profilePic nativeLanguage learningLanguage location isOnline')
    .limit(10);
    
    // Get learning progress for each partner to show session counts
    const partnersWithStats = await Promise.all(partners.map(async (partner) => {
      const partnerProgress = await LearningProgress.findOne({ user: partner._id });
      
      return {
        ...partner.toObject(),
        sessionsCompleted: partnerProgress?.conversationsCompleted || 0,
        rating: 4.5 + Math.random() * 0.5 // Mock rating for now
      };
    }));
    
    res.status(200).json(partnersWithStats);
  } catch (error) {
    console.error('Error fetching suggested partners:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Update learning path progress
export async function updateLearningPath(req, res) {
  try {
    const userId = req.user._id;
    const { pathName, progress, completedModules } = req.body;
    
    let learningProgress = await LearningProgress.findOne({ user: userId });
    
    if (!learningProgress) {
      learningProgress = await LearningProgress.create({ user: userId });
    }
    
    // Find or create learning path
    let path = learningProgress.learningPaths.find(p => p.pathName === pathName);
    
    if (!path) {
      learningProgress.learningPaths.push({
        pathName,
        progress: progress || 0,
        totalModules: req.body.totalModules || 10,
        completedModules: completedModules || 0,
        startedAt: new Date()
      });
    } else {
      path.progress = progress || path.progress;
      path.completedModules = completedModules || path.completedModules;

      if (path.progress >= 100 && !path.completedAt) {
        path.completedAt = new Date();

        // Award XP and Coins for completing path
        const xpResult = learningProgress.addXP(500);
        const coinsEarned = 100; // Bonus coins for path completion

        // IMPORTANT: Also update UserActivity XP and Coins for leaderboard/dashboard
        await updateUserXPAndCoins(userId, 500, coinsEarned);
      }
    }
    
    learningProgress.updateStreak();
    await learningProgress.save();
    
    res.status(200).json(learningProgress);
  } catch (error) {
    console.error('Error updating learning path:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Add vocabulary word
export async function addVocabularyWord(req, res) {
  try {
    const userId = req.user._id;
    const { word, translation, language } = req.body;
    
    if (!word || !translation) {
      return res.status(400).json({ message: 'Word and translation are required' });
    }
    
    let progress = await LearningProgress.findOne({ user: userId });
    
    if (!progress) {
      progress = await LearningProgress.create({ user: userId });
    }
    
    // Check if word already exists
    const existingWord = progress.vocabulary.find(v => 
      v.word.toLowerCase() === word.toLowerCase() && 
      v.language === language
    );
    
    if (existingWord) {
      return res.status(400).json({ message: 'Word already in vocabulary' });
    }
    
    // Add new word
    progress.vocabulary.push({
      word,
      translation,
      language: language || req.user.learningLanguage,
      learnedAt: new Date(),
      reviewCount: 0
    });
    
    progress.wordsLearned = progress.vocabulary.length;

    // Add XP and Coins for learning new word
    const xpResult = progress.addXP(5);
    const coinsEarned = 1; // 1 coin per new word

    progress.updateStreak();
    await progress.save();

    // IMPORTANT: Also update UserActivity XP and Coins for leaderboard/dashboard
    await updateUserXPAndCoins(userId, 5, coinsEarned);

    res.status(200).json({
      message: 'Word added to vocabulary',
      xpResult,
      coinsEarned,
      progress
    });
  } catch (error) {
    console.error('Error adding vocabulary word:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Record practice session
export async function recordPracticeSession(req, res) {
  try {
    const userId = req.user._id;
    const { type, score, duration, details } = req.body;
    
    let progress = await LearningProgress.findOne({ user: userId });
    
    if (!progress) {
      progress = await LearningProgress.create({ user: userId });
    }
    
    // Update study time
    progress.totalStudyTime += duration || 5;
    
    // Add XP and Coins based on practice type and score
    let xpEarned = 0;
    let coinsEarned = 0;
    if (type === 'pronunciation') {
      xpEarned = Math.round(score / 10);
      coinsEarned = Math.round(score / 50);
    } else if (type === 'grammar') {
      xpEarned = Math.round(score / 5);
      coinsEarned = Math.round(score / 25);
    } else if (type === 'conversation') {
      xpEarned = Math.round(score / 5);
      coinsEarned = Math.round(score / 25);
    }

    const xpResult = progress.addXP(xpEarned);

    // Update streak
    progress.updateStreak();

    // Track conversation if it's a speaking practice
    if (type === 'pronunciation' && details?.phrasesCompleted > 0) {
      progress.conversationsCompleted += 1;
    }

    await progress.save();

    // IMPORTANT: Also update UserActivity XP and Coins for leaderboard/dashboard
    await updateUserXPAndCoins(userId, xpEarned, coinsEarned);

    res.status(200).json({
      message: 'Practice session recorded',
      xpResult,
      coinsEarned,
      progress
    });
  } catch (error) {
    console.error('Error recording practice session:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Get pronunciation phrases
export async function getPronunciationPhrases(req, res) {
  try {
    const { difficulty, category, limit = 10 } = req.query;
    const userId = req.user._id;
    
    // Build query
    const query = { active: true };
    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;
    
    // Get user's progress to find completed phrases
    let progress = await LearningProgress.findOne({ user: userId });
    const completedPhraseIds = progress?.completedPhrases || [];
    
    // Fetch phrases
    let phrases = await PronunciationPhrase.find(query)
      .sort({ order: 1, createdAt: 1 })
      .limit(parseInt(limit));
    
    // If no phrases exist, seed the database
    if (phrases.length === 0) {
      console.log('No phrases found, seeding database...');
      await seedPronunciationPhrases();
      phrases = await PronunciationPhrase.find(query)
        .sort({ order: 1, createdAt: 1 })
        .limit(parseInt(limit));
    }
    
    // Mark completed phrases
    const phrasesWithProgress = phrases.map(phrase => ({
      ...phrase.toObject(),
      completed: completedPhraseIds.includes(phrase._id.toString())
    }));
    
    res.status(200).json(phrasesWithProgress);
  } catch (error) {
    console.error('Error fetching pronunciation phrases:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Record phrase completion
export async function completePronunciationPhrase(req, res) {
  try {
    const userId = req.user._id;
    const { phraseId, score, accuracy } = req.body;
    
    let progress = await LearningProgress.findOne({ user: userId });
    
    if (!progress) {
      progress = await LearningProgress.create({ user: userId });
    }
    
    // Initialize completedPhrases if it doesn't exist
    if (!progress.completedPhrases) {
      progress.completedPhrases = [];
    }
    
    // Add phrase to completed list if not already there
    if (!progress.completedPhrases.includes(phraseId)) {
      progress.completedPhrases.push(phraseId);
    }
    
    // Add to practice history
    if (!progress.practiceHistory) {
      progress.practiceHistory = [];
    }
    
    progress.practiceHistory.push({
      type: 'pronunciation',
      phraseId,
      score,
      accuracy,
      completedAt: new Date()
    });
    
    // Keep only last 100 practice items
    if (progress.practiceHistory.length > 100) {
      progress.practiceHistory = progress.practiceHistory.slice(-100);
    }
    
    // Update streak
    progress.updateStreak();
    
    await progress.save();
    
    res.status(200).json({
      message: 'Phrase completion recorded',
      completedPhrases: progress.completedPhrases.length,
      progress
    });
  } catch (error) {
    console.error('Error recording phrase completion:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Get practice statistics
export async function getPracticeStats(req, res) {
  try {
    const userId = req.user._id;
    
    let progress = await LearningProgress.findOne({ user: userId });
    
    if (!progress) {
      return res.status(200).json({
        totalPhrasesPracticed: 0,
        averageAccuracy: 0,
        favoriteCategory: null,
        recentPractice: []
      });
    }
    
    const practiceHistory = progress.practiceHistory || [];
    const pronunciationHistory = practiceHistory.filter(p => p.type === 'pronunciation');
    
    // Calculate stats
    const totalPhrasesPracticed = progress.completedPhrases?.length || 0;
    const averageAccuracy = pronunciationHistory.length > 0
      ? pronunciationHistory.reduce((sum, p) => sum + (p.accuracy || 0), 0) / pronunciationHistory.length
      : 0;
    
    // Get recent practice (last 5)
    const recentPractice = pronunciationHistory.slice(-5).reverse();
    
    res.status(200).json({
      totalPhrasesPracticed,
      averageAccuracy: Math.round(averageAccuracy),
      completedPhrases: progress.completedPhrases || [],
      recentPractice
    });
  } catch (error) {
    console.error('Error fetching practice stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Get achievements
export async function getAchievements(req, res) {
  try {
    const userId = req.user._id;
    
    let progress = await LearningProgress.findOne({ user: userId });
    
    if (!progress) {
      progress = await LearningProgress.create({ user: userId });
    }
    
    // Define all achievements
    const allAchievements = [
      { 
        id: 'first-steps', 
        name: 'First Steps', 
        icon: '🎯', 
        description: 'Complete first lesson',
        condition: () => progress.completedLessons.length >= 1
      },
      { 
        id: 'week-warrior', 
        name: 'Week Warrior', 
        icon: '🔥', 
        description: '7-day streak',
        condition: () => progress.currentStreak >= 7
      },
      { 
        id: 'social-butterfly', 
        name: 'Social Butterfly', 
        icon: '🦋', 
        description: 'Chat with 10 partners',
        condition: () => progress.conversationsCompleted >= 10
      },
      { 
        id: 'vocabulary-master', 
        name: 'Vocabulary Master', 
        icon: '📚', 
        description: 'Learn 500 words',
        condition: () => progress.wordsLearned >= 500
      },
      { 
        id: 'fluent-speaker', 
        name: 'Fluent Speaker', 
        icon: '🌟', 
        description: 'Complete advanced path',
        condition: () => progress.learningPaths.some(p => 
          p.pathName === 'Business Professional' && p.progress >= 100
        )
      }
    ];
    
    // Check and unlock achievements
    const achievements = allAchievements.map(achievement => {
      const unlocked = achievement.condition();
      const existingAchievement = progress.achievements.find(a => a.achievementId === achievement.id);
      
      if (unlocked && !existingAchievement) {
        // Unlock new achievement
        progress.achievements.push({
          achievementId: achievement.id,
          name: achievement.name,
          unlockedAt: new Date(),
          icon: achievement.icon
        });
      }
      
      return {
        id: achievement.id,
        name: achievement.name,
        icon: achievement.icon,
        description: achievement.description,
        unlocked: unlocked || !!existingAchievement,
        unlockedAt: existingAchievement?.unlockedAt
      };
    });
    
    await progress.save();
    
    res.status(200).json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}