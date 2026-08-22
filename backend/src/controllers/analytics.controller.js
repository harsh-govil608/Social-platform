import UserAnalytics from "../models/UserAnalytics.js";
import User from "../models/User.js";
import { log } from '../lib/logger.js';

// Initialize analytics for a new user
export const initializeUserAnalytics = async (userId) => {
  try {
    const existingAnalytics = await UserAnalytics.findOne({ user: userId });
    if (existingAnalytics) {
      return existingAnalytics;
    }

    const analytics = await UserAnalytics.create({
      user: userId,
      registrationDate: new Date(),
      firstLoginDate: new Date(),
    });

    return analytics;
  } catch (error) {
    log.error("Error initializing user analytics:", error);
    throw error;
  }
};

// Track user session start
export const startSession = async (req, res) => {
  try {
    const userId = req.user._id;

    let analytics = await UserAnalytics.findOne({ user: userId });
    if (!analytics) {
      analytics = await initializeUserAnalytics(userId);
    }

    // Check and update retention
    analytics.checkRetention();
    analytics.lastActiveDate = new Date();

    // Start new session
    analytics.startSession();
    await analytics.save();

    res.status(200).json({
      success: true,
      message: "Session started",
      sessionId: analytics.sessions[analytics.sessions.length - 1]._id,
    });
  } catch (error) {
    log.error("Error starting session:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to start session",
      error: error.message,
    });
  }
};

// Track user session end
export const endSession = async (req, res) => {
  try {
    const userId = req.user._id;

    const analytics = await UserAnalytics.findOne({ user: userId });
    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: "Analytics not found",
      });
    }

    analytics.endSession();
    await analytics.save();

    const lastSession = analytics.sessions[analytics.sessions.length - 1];
    res.status(200).json({
      success: true,
      message: "Session ended",
      duration: lastSession?.duration || 0,
    });
  } catch (error) {
    log.error("Error ending session:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to end session",
      error: error.message,
    });
  }
};

// Track activity in current session
export const trackActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    const { activityType } = req.body;

    if (!activityType) {
      return res.status(400).json({
        success: false,
        message: "Activity type is required",
      });
    }

    const analytics = await UserAnalytics.findOne({ user: userId });
    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: "Analytics not found",
      });
    }

    // Ensure there's an active session before tracking
    if (!analytics.sessions || analytics.sessions.length === 0) {
      analytics.startSession();
    }
    analytics.trackActivity(activityType);
    await analytics.save();

    res.status(200).json({
      success: true,
      message: "Activity tracked",
    });
  } catch (error) {
    log.error("Error tracking activity:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to track activity",
      error: error.message,
    });
  }
};

// Update daily task completion
export const updateDailyTaskCompletion = async (req, res) => {
  try {
    const userId = req.user._id;
    const { completed } = req.body;

    const analytics = await UserAnalytics.findOne({ user: userId });
    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: "Analytics not found",
      });
    }

    analytics.dailyTaskStats.totalAttempts += 1;

    if (completed) {
      analytics.dailyTaskStats.totalCompletions += 1;
      analytics.dailyTaskStats.lastCompletionDate = new Date();

      // Update streak
      analytics.updateStreak(true);
    }

    // Calculate completion rate
    analytics.dailyTaskStats.completionRate =
      (analytics.dailyTaskStats.totalCompletions /
        analytics.dailyTaskStats.totalAttempts) *
      100;

    await analytics.save();

    res.status(200).json({
      success: true,
      message: "Daily task completion updated",
      streak: analytics.streakData.currentStreak,
    });
  } catch (error) {
    log.error("Error updating daily task completion:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update daily task completion",
      error: error.message,
    });
  }
};

// Get user's personal analytics
export const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const analytics = await UserAnalytics.findOne({ user: userId });
    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: "Analytics not found",
      });
    }

    res.status(200).json({
      success: true,
      analytics: {
        registrationDate: analytics.registrationDate,
        totalSessions: analytics.totalSessions,
        totalTimeSpent: analytics.totalTimeSpent,
        averageSessionDuration: analytics.averageSessionDuration,
        streak: {
          current: analytics.streakData.currentStreak,
          longest: analytics.streakData.longestStreak,
          totalDaysCompleted: analytics.streakData.totalDaysCompleted,
        },
        dailyTaskStats: analytics.dailyTaskStats,
        learningMetrics: analytics.learningMetrics,
      },
    });
  } catch (error) {
    log.error("Error getting user analytics:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: error.message,
    });
  }
};

// Get platform-wide analytics (admin only)
export const getPlatformAnalytics = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const retentionStats = await UserAnalytics.getRetentionStats();
    const streakStats = await UserAnalytics.getStreakStats();
    const sessionStats = await UserAnalytics.getSessionStats();

    res.status(200).json({
      success: true,
      analytics: {
        retention: retentionStats,
        streaks: streakStats,
        sessions: sessionStats,
      },
    });
  } catch (error) {
    log.error("Error getting platform analytics:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch platform analytics",
      error: error.message,
    });
  }
};

// Get retention cohort analysis (admin only)
export const getRetentionCohorts = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const { startDate, endDate } = req.query;

    const matchQuery = {};
    if (startDate || endDate) {
      matchQuery.registrationDate = {};
      if (startDate) matchQuery.registrationDate.$gte = new Date(startDate);
      if (endDate) matchQuery.registrationDate.$lte = new Date(endDate);
    }

    const cohorts = await UserAnalytics.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: "$registrationDate" },
            month: { $month: "$registrationDate" },
          },
          totalUsers: { $sum: 1 },
          day1Retained: {
            $sum: { $cond: ["$day1Retention.returned", 1, 0] },
          },
          day7Retained: {
            $sum: { $cond: ["$day7Retention.returned", 1, 0] },
          },
          avgStreak: { $avg: "$streakData.currentStreak" },
        },
      },
      {
        $project: {
          _id: 1,
          totalUsers: 1,
          day1Retained: 1,
          day7Retained: 1,
          day1RetentionRate: {
            $multiply: [{ $divide: ["$day1Retained", "$totalUsers"] }, 100],
          },
          day7RetentionRate: {
            $multiply: [{ $divide: ["$day7Retained", "$totalUsers"] }, 100],
          },
          avgStreak: 1,
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]);

    res.status(200).json({
      success: true,
      cohorts,
    });
  } catch (error) {
    log.error("Error getting retention cohorts:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cohorts",
      error: error.message,
    });
  }
};

export { initializeUserAnalytics as default };
