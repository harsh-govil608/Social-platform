import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import UserActivity from "../models/UserActivity.js";

const router = express.Router();

// Initialize or get user activity
router.get("/init", protectRoute, async (req, res) => {
  try {
    const userId = req.user._id;
    
    let activity = await UserActivity.findOne({ userId });
    
    if (!activity) {
      activity = await UserActivity.create({
        userId,
        dailySessions: [],
        weeklyStats: [],
        currentSession: {
          loginTime: new Date(),
          lastActivityTime: new Date(),
          isActive: true
        }
      });
    } else {
      // Start new session
      await activity.startSession();
    }
    
    res.json(activity);
  } catch (error) {
    console.error("Error initializing activity:", error);
    res.status(500).json({ message: "Failed to initialize activity tracking" });
  }
});

// Log activity
router.post("/log", protectRoute, async (req, res) => {
  try {
    const userId = req.user._id;
    const { activityType, details } = req.body;
    
    let activity = await UserActivity.findOne({ userId });
    
    if (!activity) {
      activity = await UserActivity.create({ userId });
    }
    
    await activity.logActivity(activityType, details);
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error logging activity:", error);
    res.status(500).json({ message: "Failed to log activity" });
  }
});

// End session
router.post("/end-session", protectRoute, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const activity = await UserActivity.findOne({ userId });
    
    if (activity) {
      await activity.endSession();
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error ending session:", error);
    res.status(500).json({ message: "Failed to end session" });
  }
});

// Get daily stats
router.get("/daily", protectRoute, async (req, res) => {
  try {
    const userId = req.user._id;
    const { date } = req.query;
    
    const activity = await UserActivity.findOne({ userId });
    
    if (!activity) {
      return res.json({
        totalTimeSpent: 0,
        activities: [],
        completedChallenges: []
      });
    }
    
    const targetDate = date ? new Date(date).toDateString() : new Date().toDateString();
    const daySession = activity.dailySessions.find(s => 
      new Date(s.date).toDateString() === targetDate
    );
    
    res.json(daySession || {
      totalTimeSpent: 0,
      activities: [],
      completedChallenges: []
    });
  } catch (error) {
    console.error("Error fetching daily stats:", error);
    res.status(500).json({ message: "Failed to fetch daily stats" });
  }
});

// Get weekly stats
router.get("/weekly", protectRoute, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const activity = await UserActivity.findOne({ userId });
    
    if (!activity) {
      return res.json({
        totalTimeSpent: 0,
        averageDailyTime: 0,
        activitiesBreakdown: {},
        totalXP: 0,
        totalCoins: 0,
        dailyData: []
      });
    }
    
    const weeklyStats = activity.calculateWeeklyStats();
    
    // Get daily breakdown for the week
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    weekStart.setHours(0, 0, 0, 0);
    
    const dailyData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dateStr = date.toDateString();
      
      const session = activity.dailySessions.find(s => 
        new Date(s.date).toDateString() === dateStr
      );
      
      dailyData.push({
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
        date: date.toISOString().split('T')[0],
        timeSpent: session?.totalTimeSpent || 0,
        xpEarned: session?.completedChallenges?.reduce((sum, c) => sum + (c.xpEarned || 0), 0) || 0,
        activities: session?.activities?.length || 0
      });
    }
    
    res.json({
      ...weeklyStats,
      dailyData
    });
  } catch (error) {
    console.error("Error fetching weekly stats:", error);
    res.status(500).json({ message: "Failed to fetch weekly stats" });
  }
});

// Get monthly stats
router.get("/monthly", protectRoute, async (req, res) => {
  try {
    const userId = req.user._id;
    const { month, year } = req.query;
    
    const activity = await UserActivity.findOne({ userId });
    
    if (!activity) {
      return res.json({
        totalTimeSpent: 0,
        totalXPEarned: 0,
        totalCoinsEarned: 0,
        activeDays: 0,
        longestStreak: 0
      });
    }
    
    const targetMonth = month ? parseInt(month) : new Date().getMonth();
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    
    const monthSessions = activity.dailySessions.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate.getMonth() === targetMonth && 
             sessionDate.getFullYear() === targetYear;
    });
    
    const stats = {
      totalTimeSpent: 0,
      totalXPEarned: 0,
      totalCoinsEarned: 0,
      activeDays: monthSessions.length,
      activitiesCount: {},
      dailyAverageTime: 0
    };
    
    monthSessions.forEach(session => {
      stats.totalTimeSpent += session.totalTimeSpent || 0;
      stats.totalXPEarned += session.completedChallenges?.reduce((sum, c) => sum + (c.xpEarned || 0), 0) || 0;
      stats.totalCoinsEarned += session.completedChallenges?.reduce((sum, c) => sum + (c.coinsEarned || 0), 0) || 0;
      
      session.activities?.forEach(activity => {
        if (!stats.activitiesCount[activity.type]) {
          stats.activitiesCount[activity.type] = 0;
        }
        stats.activitiesCount[activity.type]++;
      });
    });
    
    stats.dailyAverageTime = stats.activeDays > 0 ? 
      Math.round(stats.totalTimeSpent / stats.activeDays) : 0;
    
    res.json(stats);
  } catch (error) {
    console.error("Error fetching monthly stats:", error);
    res.status(500).json({ message: "Failed to fetch monthly stats" });
  }
});

// Get online status and current session info
router.get("/status", protectRoute, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const activity = await UserActivity.findOne({ userId });
    
    if (!activity || !activity.currentSession?.isActive) {
      return res.json({
        isOnline: false,
        sessionDuration: 0,
        currentActivity: null
      });
    }
    
    const sessionDuration = Math.round(
      (new Date() - activity.currentSession.loginTime) / (1000 * 60)
    );
    
    res.json({
      isOnline: true,
      sessionDuration,
      currentActivity: activity.currentSession.currentActivity,
      loginTime: activity.currentSession.loginTime,
      lastActivityTime: activity.currentSession.lastActivityTime
    });
  } catch (error) {
    console.error("Error fetching status:", error);
    res.status(500).json({ message: "Failed to fetch status" });
  }
});

// Get achievements
router.get("/achievements", protectRoute, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const activity = await UserActivity.findOne({ userId });
    
    const achievements = activity?.achievements || [];
    
    // Define possible achievements
    const allAchievements = [
      {
        id: 'first_story',
        name: 'Storyteller',
        description: 'Write your first story',
        icon: '📝',
        xpReward: 50,
        coinReward: 10
      },
      {
        id: 'perfect_rating',
        name: 'Perfectionist',
        description: 'Get a perfect 10/10 rating',
        icon: '⭐',
        xpReward: 100,
        coinReward: 20
      },
      {
        id: 'week_streak',
        name: 'Dedicated Learner',
        description: 'Study for 7 days in a row',
        icon: '🔥',
        xpReward: 150,
        coinReward: 30
      },
      {
        id: 'social_butterfly',
        name: 'Social Butterfly',
        description: 'Rate 10 stories from other users',
        icon: '🦋',
        xpReward: 75,
        coinReward: 15
      },
      {
        id: 'time_warrior',
        name: 'Time Warrior',
        description: 'Study for 100 hours total',
        icon: '⚔️',
        xpReward: 500,
        coinReward: 100
      }
    ];
    
    // Mark earned achievements
    const achievementsWithStatus = allAchievements.map(achievement => {
      const earned = achievements.find(a => a.id === achievement.id);
      return {
        ...achievement,
        earned: !!earned,
        earnedAt: earned?.earnedAt
      };
    });
    
    res.json(achievementsWithStatus);
  } catch (error) {
    console.error("Error fetching achievements:", error);
    res.status(500).json({ message: "Failed to fetch achievements" });
  }
});

// Get time tracking dashboard data
router.get("/dashboard", protectRoute, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const activity = await UserActivity.findOne({ userId });
    
    if (!activity) {
      return res.json({
        todayTime: 0,
        weekTime: 0,
        monthTime: 0,
        currentStreak: 0,
        totalXP: 0,
        isOnline: false
      });
    }
    
    // Today's time
    const today = new Date().toDateString();
    const todaySession = activity.dailySessions.find(s => 
      new Date(s.date).toDateString() === today
    );
    const todayTime = todaySession?.totalTimeSpent || 0;
    
    // This week's time
    const weekStats = activity.calculateWeeklyStats();
    const weekTime = weekStats.totalTimeSpent;
    
    // This month's time
    const now = new Date();
    const monthSessions = activity.dailySessions.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate.getMonth() === now.getMonth() && 
             sessionDate.getFullYear() === now.getFullYear();
    });
    const monthTime = monthSessions.reduce((sum, s) => sum + (s.totalTimeSpent || 0), 0);
    
    // Calculate streak
    let currentStreak = 0;
    const sortedSessions = [...activity.dailySessions]
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    for (let i = 0; i < sortedSessions.length; i++) {
      const sessionDate = new Date(sortedSessions[i].date);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (sessionDate.toDateString() === expectedDate.toDateString()) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    res.json({
      todayTime,
      weekTime,
      monthTime,
      currentStreak,
      isOnline: activity.currentSession?.isActive || false,
      sessionStartTime: activity.currentSession?.loginTime,
      lastActivityTime: activity.currentSession?.lastActivityTime,
      totalXP: activity.gamification?.xp || 0,
      totalCoins: activity.gamification?.coins || 0,
      level: activity.gamification?.level || 1
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
});

export default router;