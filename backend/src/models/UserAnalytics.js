import mongoose from "mongoose";

const userAnalyticsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // Registration and retention tracking
    registrationDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    firstLoginDate: {
      type: Date,
    },
    lastActiveDate: {
      type: Date,
    },
    // Retention metrics
    day1Retention: {
      returned: {
        type: Boolean,
        default: false,
      },
      returnDate: Date,
    },
    day7Retention: {
      returned: {
        type: Boolean,
        default: false,
      },
      returnDate: Date,
    },
    // Streak tracking
    streakData: {
      currentStreak: {
        type: Number,
        default: 0,
      },
      longestStreak: {
        type: Number,
        default: 0,
      },
      totalDaysCompleted: {
        type: Number,
        default: 0,
      },
      lastStreakDate: Date,
      streakHistory: [
        {
          date: Date,
          completed: Boolean,
          taskType: String,
        },
      ],
    },
    // Session tracking
    sessions: [
      {
        startTime: {
          type: Date,
          required: true,
        },
        endTime: Date,
        duration: Number, // in seconds
        activitiesPerformed: [String], // e.g., ['daily_task', 'vocabulary', 'ai_tutor']
      },
    ],
    // Aggregated session metrics
    totalSessions: {
      type: Number,
      default: 0,
    },
    totalTimeSpent: {
      type: Number,
      default: 0, // in seconds
    },
    averageSessionDuration: {
      type: Number,
      default: 0, // in seconds
    },
    // Daily task completion metrics
    dailyTaskStats: {
      totalAttempts: {
        type: Number,
        default: 0,
      },
      totalCompletions: {
        type: Number,
        default: 0,
      },
      completionRate: {
        type: Number,
        default: 0, // percentage
      },
      lastCompletionDate: Date,
    },
    // Learning progress
    learningMetrics: {
      vocabularyWordsLearned: {
        type: Number,
        default: 0,
      },
      aiTutorSessionsCompleted: {
        type: Number,
        default: 0,
      },
      partnerConversationsCompleted: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries (user:1 index already created by unique:true on the field)
userAnalyticsSchema.index({ registrationDate: 1 });
userAnalyticsSchema.index({ "day1Retention.returned": 1 });
userAnalyticsSchema.index({ "day7Retention.returned": 1 });
userAnalyticsSchema.index({ lastActiveDate: -1 });

// Method to start a new session
userAnalyticsSchema.methods.startSession = function () {
  const session = {
    startTime: new Date(),
    activitiesPerformed: [],
  };
  this.sessions.push(session);
  return this.sessions[this.sessions.length - 1];
};

// Method to end the current session
userAnalyticsSchema.methods.endSession = function () {
  const lastSession = this.sessions[this.sessions.length - 1];
  if (lastSession && !lastSession.endTime) {
    lastSession.endTime = new Date();
    lastSession.duration = Math.floor(
      (lastSession.endTime - lastSession.startTime) / 1000
    );

    // Update aggregated metrics
    this.totalSessions = this.sessions.length;
    this.totalTimeSpent += lastSession.duration;
    this.averageSessionDuration = Math.floor(
      this.totalTimeSpent / this.totalSessions
    );
  }
  return lastSession;
};

// Method to track activity in current session
userAnalyticsSchema.methods.trackActivity = function (activityType) {
  const lastSession = this.sessions[this.sessions.length - 1];
  if (lastSession && !lastSession.endTime) {
    if (!lastSession.activitiesPerformed.includes(activityType)) {
      lastSession.activitiesPerformed.push(activityType);
    }
  }
};

// Method to update streak
userAnalyticsSchema.methods.updateStreak = function (completed = true) {
  const today = new Date().setHours(0, 0, 0, 0);

  if (completed) {
    this.streakData.lastStreakDate = new Date();
    this.streakData.currentStreak += 1;
    this.streakData.totalDaysCompleted += 1;

    if (this.streakData.currentStreak > this.streakData.longestStreak) {
      this.streakData.longestStreak = this.streakData.currentStreak;
    }

    this.streakData.streakHistory.push({
      date: new Date(),
      completed: true,
    });
  }

  return this.streakData.currentStreak;
};

// Method to check and update retention
userAnalyticsSchema.methods.checkRetention = function () {
  const now = Date.now();
  const registrationTime = this.registrationDate.getTime();
  const dayInMs = 24 * 60 * 60 * 1000;

  // Check Day 1 retention (24-48 hours after registration)
  if (!this.day1Retention.returned) {
    const timeSinceRegistration = now - registrationTime;
    if (timeSinceRegistration >= dayInMs && timeSinceRegistration <= dayInMs * 2) {
      this.day1Retention.returned = true;
      this.day1Retention.returnDate = new Date();
    }
  }

  // Check Day 7 retention (7-8 days after registration)
  if (!this.day7Retention.returned) {
    const timeSinceRegistration = now - registrationTime;
    if (
      timeSinceRegistration >= dayInMs * 7 &&
      timeSinceRegistration <= dayInMs * 8
    ) {
      this.day7Retention.returned = true;
      this.day7Retention.returnDate = new Date();
    }
  }
};

// Static method to get retention statistics
userAnalyticsSchema.statics.getRetentionStats = async function () {
  const totalUsers = await this.countDocuments();
  const day1Returned = await this.countDocuments({ "day1Retention.returned": true });
  const day7Returned = await this.countDocuments({ "day7Retention.returned": true });

  return {
    totalUsers,
    day1Retention: {
      count: day1Returned,
      rate: totalUsers > 0 ? (day1Returned / totalUsers) * 100 : 0,
    },
    day7Retention: {
      count: day7Returned,
      rate: totalUsers > 0 ? (day7Returned / totalUsers) * 100 : 0,
    },
  };
};

// Static method to get daily streak completion stats
userAnalyticsSchema.statics.getStreakStats = async function () {
  const result = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        avgCurrentStreak: { $avg: "$streakData.currentStreak" },
        avgLongestStreak: { $avg: "$streakData.longestStreak" },
        totalDaysCompleted: { $sum: "$streakData.totalDaysCompleted" },
        usersWithActiveStreak: {
          $sum: {
            $cond: [{ $gt: ["$streakData.currentStreak", 0] }, 1, 0],
          },
        },
      },
    },
  ]);

  return result[0] || {
    totalUsers: 0,
    avgCurrentStreak: 0,
    avgLongestStreak: 0,
    totalDaysCompleted: 0,
    usersWithActiveStreak: 0,
  };
};

// Static method to get session duration stats
userAnalyticsSchema.statics.getSessionStats = async function () {
  const result = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        avgSessionDuration: { $avg: "$averageSessionDuration" },
        totalSessions: { $sum: "$totalSessions" },
        totalTimeSpent: { $sum: "$totalTimeSpent" },
      },
    },
  ]);

  return result[0] || {
    totalUsers: 0,
    avgSessionDuration: 0,
    totalSessions: 0,
    totalTimeSpent: 0,
  };
};

const UserAnalytics = mongoose.model("UserAnalytics", userAnalyticsSchema);

export default UserAnalytics;
