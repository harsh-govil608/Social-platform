import DailyChallenge from "../models/dailyChallenge.model.js";
import Vocabulary from "../models/vocabulary.model.js";
import LearningVideo from "../models/learningVideo.model.js";
import LearningProgress from "../models/LearningProgress.js";
import User from "../models/User.js";
import UserActivity from "../models/UserActivity.js";

// Helper function to update XP and Coins in both LearningProgress and UserActivity
const updateUserXPAndCoins = async (userId, xpAmount, coinsAmount = 0) => {
  try {
    // Update or create UserActivity
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
      // Add XP and Coins to UserActivity
      userActivity.gamification.xp = (userActivity.gamification.xp || 0) + xpAmount;
      userActivity.gamification.coins = (userActivity.gamification.coins || 0) + coinsAmount;

      // Update level based on XP (1000 XP per level)
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

// Get or create learning progress for user
export const getLearningProgress = async (req, res) => {
  try {
    // Return mock progress for unauthenticated users
    if (!req.user) {
      return res.status(200).json({
        language: "spanish",
        level: "beginner",
        xp: 0,
        streak: 0,
        vocabulary: { mastered: [], learning: [], totalWords: 0 },
        dailyChallenges: { completed: [] },
        videos: { watched: [] }
      });
    }
    
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    let progress = await LearningProgress.findOne({ user: userId });
    
    if (!progress) {
      // Create new progress record
      progress = await LearningProgress.create({
        user: userId,
        totalXP: 0,
        currentLevel: 1,
        currentStreak: 0
      });
    }
    
    // Update streak if needed
    progress.updateStreak();
    await progress.save();
    
    res.status(200).json(progress);
  } catch (error) {
    console.error("Error fetching learning progress:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get daily challenges
export const getDailyChallenges = async (req, res) => {
  try {
    // For testing without authentication
    let language = "spanish";
    let level = "beginner";
    
    if (req.user) {
      const userId = req.user._id;
      const user = await User.findById(userId);
      language = user.learningLanguage || "spanish";
      
      console.log("Fetching challenges for user:", userId, "language:", language);
      
      // Get user's progress to determine level
      const progress = await LearningProgress.findOne({ user: userId });
      level = progress?.level || "beginner";
    } else {
      console.log("Fetching challenges without authentication - using defaults");
    }
    
    console.log("User level:", level);
    
    // Get ALL challenges for the language to show variety
    const allChallenges = await DailyChallenge.find({ 
      language, 
      isActive: true 
    });
    
    console.log("Total challenges in DB for", language, ":", allChallenges.length);
    
    // Return all available challenges (frontend will handle display)
    const challenges = allChallenges;
    
    console.log("Returning challenges:", challenges.length);
    
    if (!req.user) {
      // Return challenges without completion status for unauthenticated users
      const challengesData = challenges.map(challenge => ({
        ...challenge.toObject(),
        isCompleted: false
      }));
      return res.status(200).json(challengesData);
    }
    
    // Check which challenges are already completed today
    const progress = await LearningProgress.findOne({ user: req.user._id });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const completedToday = progress?.dailyChallenges?.completed?.filter(c => {
      const completedDate = new Date(c.completedAt);
      completedDate.setHours(0, 0, 0, 0);
      return completedDate.getTime() === today.getTime();
    }) || [];
    
    const challengesWithStatus = challenges.map(challenge => ({
      ...challenge.toObject(),
      isCompleted: completedToday.some(c => c.challengeId === challenge._id.toString())
    }));
    
    res.status(200).json(challengesWithStatus);
  } catch (error) {
    console.error("Error fetching daily challenges:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Complete a daily challenge
export const completeDailyChallenge = async (req, res) => {
  try {
    const userId = req.user._id;
    const { challengeId, score, timeSpent } = req.body;

    let progress = await LearningProgress.findOne({ user: userId });
    if (!progress) {
      // Create new progress if it doesn't exist
      progress = await LearningProgress.create({
        user: userId,
        totalXP: 0,
        currentLevel: 1,
        dailyChallenges: { completed: [] }
      });
    }

    const challenge = await DailyChallenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    // Calculate XP and Coins earned based on score
    const xpEarned = Math.floor((score / 100) * challenge.xpReward);
    const coinsEarned = Math.floor((score / 100) * (challenge.coins || Math.round(challenge.xpReward / 5)));

    // Add to completed challenges - Initialize if needed
    if (!progress.dailyChallenges) {
      progress.dailyChallenges = { completed: [] };
    }
    if (!progress.dailyChallenges.completed) {
      progress.dailyChallenges.completed = [];
    }

    progress.dailyChallenges.completed.push({
      challengeId,
      completedAt: new Date(),
      score,
      xpEarned,
      coinsEarned
    });

    // Update XP
    const xpResult = progress.addXP(xpEarned);

    // Update streak
    progress.updateStreak();

    await progress.save();

    // IMPORTANT: Also update UserActivity XP and Coins for leaderboard/dashboard
    await updateUserXPAndCoins(userId, xpEarned, coinsEarned);

    res.status(200).json({
      xpEarned,
      coinsEarned,
      totalXP: progress.totalXP,
      newTotalXP: progress.totalXP,
      currentLevel: progress.currentLevel,
      newLevel: progress.currentLevel,
      streak: progress.currentStreak,
      newStreak: progress.currentStreak
    });
  } catch (error) {
    console.error("Error completing challenge:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get daily vocabulary words
export const getDailyVocabulary = async (req, res) => {
  try {
    let language = "spanish";
    let level = "beginner";
    
    if (req.user) {
      const userId = req.user._id;
      const user = await User.findById(userId);
      language = user.learningLanguage || "spanish";
      
      const progress = await LearningProgress.findOne({ user: userId });
      level = progress?.level || "beginner";
    }
    
    // Get 10 random words for the day
    const words = await Vocabulary.getDailyWords(language, level, [], 10);
    
    res.status(200).json(words);
  } catch (error) {
    console.error("Error fetching daily vocabulary:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Master vocabulary words
export const masterVocabulary = async (req, res) => {
  try {
    const userId = req.user._id;
    const { words, timeSpent, accuracy } = req.body;
    
    const progress = await LearningProgress.findOne({ user: userId });
    if (!progress) {
      return res.status(404).json({ message: "Learning progress not found" });
    }
    
    // Add mastered words
    const masteredWords = words.filter(w => w.mastered).map(w => ({
      word: w.word,
      translation: w.translation,
      masteredAt: new Date(),
      category: w.category
    }));
    
    progress.vocabulary.mastered.push(...masteredWords);
    progress.vocabulary.totalWords += masteredWords.length;

    // Calculate XP and Coins based on performance
    const xpEarned = Math.floor(masteredWords.length * 10 * (accuracy / 100));
    const coinsEarned = Math.floor(masteredWords.length * 2 * (accuracy / 100)); // 2 coins per word
    progress.addXP(xpEarned);

    await progress.save();

    // IMPORTANT: Also update UserActivity XP and Coins for leaderboard/dashboard
    await updateUserXPAndCoins(userId, xpEarned, coinsEarned);

    res.status(200).json({
      masteredCount: masteredWords.length,
      xpEarned,
      coinsEarned,
      newTotalXP: progress.totalXP
    });
  } catch (error) {
    console.error("Error mastering vocabulary:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get learning videos
export const getLearningVideos = async (req, res) => {
  try {
    let language = "spanish";
    let level = "beginner";
    let isPremium = false;
    let progress = null;
    
    if (req.user) {
      const userId = req.user._id;
      const user = await User.findById(userId);
      language = user.learningLanguage || "spanish";
      
      progress = await LearningProgress.findOne({ user: userId });
      level = progress?.level || "beginner";
      
      // Check if user is premium (you can implement your own logic)
      isPremium = user.isPremium || false;
    }
    
    const { category } = req.query;
    const categories = category ? [category] : [];
    const videos = await LearningVideo.getVideosForUser(language, level, isPremium, categories);
    
    // Add watched status
    const videosWithStatus = videos.map(video => {
      const watched = progress?.videos?.watched?.find(
        w => w.videoId === video._id.toString()
      );
      return {
        ...video.toObject(),
        hasWatched: !!watched,
        watchProgress: watched?.progress || 0
      };
    });
    
    res.status(200).json(videosWithStatus);
  } catch (error) {
    console.error("Error fetching learning videos:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Complete video watching
export const completeVideo = async (req, res) => {
  try {
    const userId = req.user._id;
    const { videoId, watchProgress, completed } = req.body;
    
    const progress = await LearningProgress.findOne({ user: userId });
    if (!progress) {
      return res.status(404).json({ message: "Learning progress not found" });
    }
    
    const video = await LearningVideo.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    
    // Update video watch history
    const existingWatch = progress.videos.watched.find(
      w => w.videoId === videoId
    );
    
    if (existingWatch) {
      existingWatch.progress = watchProgress;
      existingWatch.completed = completed;
    } else {
      progress.videos.watched.push({
        videoId,
        title: video.title,
        watchedAt: new Date(),
        progress: watchProgress,
        completed
      });
      progress.videos.totalWatched += 1;
    }
    
    // Award XP and Coins if completed
    let xpEarned = 0;
    let coinsEarned = 0;
    if (completed && (!existingWatch || !existingWatch.completed)) {
      xpEarned = video.xpReward;
      coinsEarned = Math.round(video.xpReward / 5); // Coins = XP / 5
      progress.addXP(xpEarned);

      // IMPORTANT: Also update UserActivity XP and Coins for leaderboard/dashboard
      await updateUserXPAndCoins(userId, xpEarned, coinsEarned);
    }

    // Update video view count
    await video.incrementViewCount();

    await progress.save();

    res.status(200).json({
      xpEarned,
      coinsEarned,
      newTotalXP: progress.totalXP
    });
  } catch (error) {
    console.error("Error completing video:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get weekly stats
export const getWeeklyStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const progress = await LearningProgress.findOne({ user: userId });
    
    if (!progress) {
      return res.status(404).json({ message: "Learning progress not found" });
    }
    
    // Get stats for the current week
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);
    
    const weekStats = progress.weeklyStats.days.filter(day => 
      new Date(day.date) >= weekStart
    );
    
    const totalXP = weekStats.reduce((sum, day) => sum + day.xpEarned, 0);
    const totalMinutes = weekStats.reduce((sum, day) => sum + day.minutesLearned, 0);
    const totalWords = weekStats.reduce((sum, day) => sum + day.wordsLearned, 0);
    
    res.status(200).json({
      days: weekStats,
      totalXP,
      totalMinutes,
      totalWords,
      weeklyGoal: progress.weeklyStats.weeklyGoal,
      goalProgress: (totalXP / progress.weeklyStats.weeklyGoal) * 100
    });
  } catch (error) {
    console.error("Error fetching weekly stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get learning stats
export const getLearningStats = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(200).json({
        totalXP: 0,
        streak: 0,
        level: "beginner",
        wordsLearned: 0,
        minutesLearned: 0,
        challengesCompleted: 0
      });
    }

    const userId = req.user._id;
    const progress = await LearningProgress.findOne({ user: userId });

    if (!progress) {
      return res.status(200).json({
        totalXP: 0,
        streak: 0,
        level: "beginner",
        wordsLearned: 0,
        minutesLearned: 0,
        challengesCompleted: 0
      });
    }

    res.status(200).json({
      totalXP: progress.totalXP,
      streak: progress.currentStreak,
      level: progress.currentLevel,
      wordsLearned: progress.vocabulary?.length || 0,
      minutesLearned: (progress.conversations?.totalMinutes || 0) + (progress.videos?.totalMinutes || 0),
      challengesCompleted: progress.dailyChallenges?.length || 0
    });
  } catch (error) {
    console.error("Error fetching learning stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const { timeframe = "week", limit = 10 } = req.query;

    // Get top users by XP - Use 'user' field from LearningProgress schema
    const topUsers = await LearningProgress.find()
      .sort({ totalXP: -1 })
      .limit(parseInt(limit))
      .populate("user", "fullName profilePic username");

    const leaderboard = topUsers.map((progress, index) => ({
      rank: index + 1,
      fullName: progress.user?.fullName || "Unknown",
      profilePic: progress.user?.profilePic || null,
      username: progress.user?.username || null,
      userId: progress.user?._id || null,
      totalXP: progress.totalXP,
      level: progress.currentLevel,
      currentStreak: progress.currentStreak
    })).filter(entry => entry.userId !== null); // Filter out entries with no user data

    res.status(200).json({
      leaderboard,
      totalUsers: leaderboard.length,
      currentUserRank: null // Will be calculated if needed
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get subscription status (mock for now)
export const getSubscriptionStatus = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(200).json({
        isPremium: false,
        plan: "free",
        expiresAt: null,
        features: {
          dailyChallenges: true,
          vocabulary: true,
          videos: true,
          conversations: true,
          maxVideosPerDay: 3,
          maxConversationsPerDay: 1
        }
      });
    }

    const userId = req.user._id;

    // For now, return a mock subscription status
    // You can implement real subscription logic later
    res.status(200).json({
      isPremium: false,
      plan: "free",
      expiresAt: null,
      features: {
        dailyChallenges: true,
        vocabulary: true,
        videos: true,
        conversations: true,
        maxVideosPerDay: 3,
        maxConversationsPerDay: 1
      }
    });
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Upgrade subscription (mock for now)
export const upgradeSubscription = async (req, res) => {
  try {
    const { plan, paymentMethod } = req.body;
    
    // Mock implementation - you can add real payment processing later
    res.status(200).json({
      success: true,
      message: "Subscription upgraded successfully",
      subscription: {
        isPremium: true,
        plan: plan,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    });
  } catch (error) {
    console.error("Error upgrading subscription:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};