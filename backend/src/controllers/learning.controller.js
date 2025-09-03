import DailyChallenge from "../models/dailyChallenge.model.js";
import Vocabulary from "../models/vocabulary.model.js";
import LearningVideo from "../models/learningVideo.model.js";
import LearningProgress from "../models/learningProgress.model.js";
import User from "../models/User.js";

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
    
    let progress = await LearningProgress.findOne({ userId });
    
    if (!progress) {
      // Create new progress record
      progress = await LearningProgress.create({
        userId,
        language: user.learningLanguage || "spanish",
        level: "beginner",
        xp: 0,
        streak: 0
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
      const progress = await LearningProgress.findOne({ userId });
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
    const progress = await LearningProgress.findOne({ userId: req.user._id });
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
    
    const progress = await LearningProgress.findOne({ userId });
    if (!progress) {
      return res.status(404).json({ message: "Learning progress not found" });
    }
    
    const challenge = await DailyChallenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }
    
    // Calculate XP earned based on score
    const xpEarned = Math.floor((score / 100) * challenge.xpReward);
    
    // Add to completed challenges
    progress.dailyChallenges.completed.push({
      challengeId,
      completedAt: new Date(),
      score,
      xpEarned
    });
    
    // Update XP
    progress.addXP(xpEarned);
    
    // Update streak
    progress.updateStreak();
    
    await progress.save();
    
    res.status(200).json({
      xpEarned,
      newTotalXP: progress.xp,
      newStreak: progress.streak,
      newLevel: progress.level
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
      
      const progress = await LearningProgress.findOne({ userId });
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
    
    const progress = await LearningProgress.findOne({ userId });
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
    
    // Calculate XP based on performance
    const xpEarned = Math.floor(masteredWords.length * 10 * (accuracy / 100));
    progress.addXP(xpEarned);
    
    await progress.save();
    
    res.status(200).json({
      masteredCount: masteredWords.length,
      xpEarned,
      newTotalXP: progress.xp
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
      
      progress = await LearningProgress.findOne({ userId });
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
    
    const progress = await LearningProgress.findOne({ userId });
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
    
    // Award XP if completed
    let xpEarned = 0;
    if (completed && (!existingWatch || !existingWatch.completed)) {
      xpEarned = video.xpReward;
      progress.addXP(xpEarned);
    }
    
    // Update video view count
    await video.incrementViewCount();
    
    await progress.save();
    
    res.status(200).json({
      xpEarned,
      newTotalXP: progress.xp
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
    const progress = await LearningProgress.findOne({ userId });
    
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
    const userId = req.user._id;
    const progress = await LearningProgress.findOne({ userId });
    
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
      totalXP: progress.xp,
      streak: progress.streak,
      level: progress.level,
      wordsLearned: progress.vocabulary.totalWords,
      minutesLearned: progress.conversations.totalMinutes + progress.videos.totalMinutes,
      challengesCompleted: progress.dailyChallenges.completed.length
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
    
    // For now, return top users by XP
    const topUsers = await LearningProgress.find()
      .sort({ xp: -1 })
      .limit(parseInt(limit))
      .populate("userId", "fullName profilePicture");
    
    const leaderboard = topUsers.map((progress, index) => ({
      rank: index + 1,
      user: {
        id: progress.userId._id,
        name: progress.userId.fullName,
        avatar: progress.userId.profilePicture
      },
      xp: progress.xp,
      level: progress.level,
      streak: progress.streak
    }));
    
    res.status(200).json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get subscription status (mock for now)
export const getSubscriptionStatus = async (req, res) => {
  try {
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