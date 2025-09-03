import mongoose from 'mongoose';

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  dailySessions: [{
    date: {
      type: Date,
      required: true
    },
    loginTime: Date,
    logoutTime: Date,
    totalTimeSpent: Number, // in minutes
    activities: [{
      type: {
        type: String,
        enum: ['learning', 'chatting', 'posting', 'coding', 'video_watching', 'vocabulary', 'conversation_practice', 'story_writing']
      },
      startTime: Date,
      endTime: Date,
      duration: Number, // in minutes
      details: mongoose.Schema.Types.Mixed
    }],
    completedChallenges: [{
      challengeType: String,
      xpEarned: Number,
      coinsEarned: Number,
      completedAt: Date
    }],
    wordsLearned: Number,
    storiesWritten: Number,
    postsCreated: Number,
    messagessSent: Number,
    videosWatched: Number,
    codeSubmissions: Number
  }],
  weeklyStats: [{
    weekStartDate: Date,
    weekEndDate: Date,
    totalTimeSpent: Number, // in minutes
    averageDailyTime: Number,
    mostActiveDay: String,
    peakHours: [Number], // array of hours (0-23)
    activitiesBreakdown: {
      learning: Number,
      chatting: Number,
      posting: Number,
      coding: Number,
      video_watching: Number,
      vocabulary: Number,
      conversation_practice: Number,
      story_writing: Number
    },
    achievements: [{
      type: String,
      description: String,
      earnedAt: Date
    }],
    totalXP: Number,
    totalCoins: Number
  }],
  monthlyStats: {
    totalTimeSpent: Number,
    averageWeeklyTime: Number,
    longestSession: {
      date: Date,
      duration: Number
    },
    mostProductiveWeek: Date,
    totalXPEarned: Number,
    totalCoinsEarned: Number
  },
  currentSession: {
    loginTime: Date,
    lastActivityTime: Date,
    currentActivity: String,
    isActive: Boolean
  },
  achievements: [{
    id: String,
    name: String,
    description: String,
    icon: String,
    earnedAt: Date,
    xpReward: Number,
    coinReward: Number
  }],
  milestones: {
    firstStory: Date,
    first10Stories: Date,
    first100Hours: Date,
    first1000XP: Date,
    firstPerfectRating: Date
  }
}, { timestamps: true });

// Methods
userActivitySchema.methods.startSession = function() {
  this.currentSession = {
    loginTime: new Date(),
    lastActivityTime: new Date(),
    isActive: true
  };
  return this.save();
};

userActivitySchema.methods.endSession = function() {
  if (!this.currentSession.isActive) return;
  
  const today = new Date().toDateString();
  let todaySession = this.dailySessions.find(s => 
    new Date(s.date).toDateString() === today
  );
  
  if (!todaySession) {
    todaySession = {
      date: new Date(),
      loginTime: this.currentSession.loginTime,
      logoutTime: new Date(),
      totalTimeSpent: 0,
      activities: []
    };
    this.dailySessions.push(todaySession);
  } else {
    todaySession.logoutTime = new Date();
  }
  
  const sessionDuration = (new Date() - this.currentSession.loginTime) / (1000 * 60);
  todaySession.totalTimeSpent += sessionDuration;
  
  this.currentSession.isActive = false;
  return this.save();
};

userActivitySchema.methods.logActivity = function(activityType, details = {}) {
  const today = new Date().toDateString();
  let todaySession = this.dailySessions.find(s => 
    new Date(s.date).toDateString() === today
  );
  
  if (!todaySession) {
    todaySession = {
      date: new Date(),
      activities: [],
      totalTimeSpent: 0
    };
    this.dailySessions.push(todaySession);
  }
  
  const activity = {
    type: activityType,
    startTime: new Date(),
    details
  };
  
  todaySession.activities.push(activity);
  this.currentSession.lastActivityTime = new Date();
  this.currentSession.currentActivity = activityType;
  
  return this.save();
};

// Calculate weekly stats
userActivitySchema.methods.calculateWeeklyStats = function() {
  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  const weekSessions = this.dailySessions.filter(s => {
    const sessionDate = new Date(s.date);
    return sessionDate >= weekStart && sessionDate <= weekEnd;
  });
  
  const stats = {
    weekStartDate: weekStart,
    weekEndDate: weekEnd,
    totalTimeSpent: 0,
    activitiesBreakdown: {},
    totalXP: 0,
    totalCoins: 0
  };
  
  weekSessions.forEach(session => {
    stats.totalTimeSpent += session.totalTimeSpent || 0;
    stats.totalXP += session.completedChallenges?.reduce((sum, c) => sum + (c.xpEarned || 0), 0) || 0;
    stats.totalCoins += session.completedChallenges?.reduce((sum, c) => sum + (c.coinsEarned || 0), 0) || 0;
    
    session.activities?.forEach(activity => {
      if (!stats.activitiesBreakdown[activity.type]) {
        stats.activitiesBreakdown[activity.type] = 0;
      }
      stats.activitiesBreakdown[activity.type] += activity.duration || 0;
    });
  });
  
  stats.averageDailyTime = weekSessions.length > 0 ? stats.totalTimeSpent / weekSessions.length : 0;
  
  return stats;
};

// Index for queries
userActivitySchema.index({ userId: 1 });
userActivitySchema.index({ 'dailySessions.date': -1 });
userActivitySchema.index({ 'currentSession.isActive': 1 });

const UserActivity = mongoose.model('UserActivity', userActivitySchema);
export default UserActivity;