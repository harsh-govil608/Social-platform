import mongoose from 'mongoose';

const analyticsEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  eventType: {
    type: String,
    required: true,
    enum: [
      // User events
      'user_signup',
      'user_login',
      'user_logout',
      'profile_update',
      'profile_view',

      // Content events
      'post_create',
      'post_view',
      'post_like',
      'post_comment',
      'post_share',

      // Social events
      'friend_request_sent',
      'friend_request_accepted',
      'user_follow',
      'user_unfollow',

      // Engagement events
      'message_sent',
      'video_call_started',
      'language_practice_started',
      'ai_tutor_interaction',

      // Monetization events
      'subscription_started',
      'subscription_renewed',
      'subscription_cancelled',
      'payment_completed',

      // Learning events
      'lesson_started',
      'lesson_completed',
      'achievement_unlocked',
      'challenge_completed',
    ],
  },
  eventData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  metadata: {
    userAgent: String,
    ip: String,
    platform: String,
    referrer: String,
  },
  sessionId: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
});

// Indexes for efficient querying
analyticsEventSchema.index({ userId: 1, eventType: 1 });
analyticsEventSchema.index({ eventType: 1, timestamp: -1 });
analyticsEventSchema.index({ userId: 1, timestamp: -1 });

const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);

// Daily aggregated statistics
const dailyStatsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  stats: {
    totalUsers: Number,
    activeUsers: Number,
    newUsers: Number,
    totalPosts: Number,
    totalComments: Number,
    totalLikes: Number,
    totalShares: Number,
    totalMessages: Number,
    revenue: Number,
    newSubscriptions: Number,
    activeSubscriptions: Number,
    cancelledSubscriptions: Number,
  },
  topEvents: [{
    eventType: String,
    count: Number,
  }],
});

dailyStatsSchema.index({ date: -1 });

const DailyStats = mongoose.model('DailyStats', dailyStatsSchema);

export { AnalyticsEvent, DailyStats };
