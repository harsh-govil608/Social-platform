import { AnalyticsEvent, DailyStats } from '../models/Analytics.js';
import { log } from './logger.js';

/**
 * Track an analytics event
 * @param {string} userId - The user ID
 * @param {string} eventType - Type of event
 * @param {object} eventData - Additional event data
 * @param {object} req - Express request object (optional)
 */
export const trackEvent = async (userId, eventType, eventData = {}, req = null) => {
  try {
    const metadata = {};

    if (req) {
      metadata.userAgent = req.headers['user-agent'];
      metadata.ip = req.ip || req.connection.remoteAddress;
      metadata.referrer = req.headers.referer || req.headers.referrer;
      metadata.platform = detectPlatform(req.headers['user-agent']);
    }

    await AnalyticsEvent.create({
      userId,
      eventType,
      eventData,
      metadata,
      sessionId: req?.sessionID || generateSessionId(),
      timestamp: new Date(),
    });

    log.info(`📊 Analytics: ${eventType} tracked for user ${userId}`);
  } catch (error) {
    // Don't throw error to avoid breaking the main application flow
    log.error('Error tracking analytics event:', error);
  }
};

/**
 * Get user analytics
 * @param {string} userId - The user ID
 * @param {Date} startDate - Start date for analytics
 * @param {Date} endDate - End date for analytics
 */
export const getUserAnalytics = async (userId, startDate, endDate) => {
  try {
    const events = await AnalyticsEvent.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          timestamp: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const totalEvents = await AnalyticsEvent.countDocuments({
      userId,
      timestamp: { $gte: startDate, $lte: endDate },
    });

    return {
      totalEvents,
      eventsByType: events,
    };
  } catch (error) {
    log.error('Error getting user analytics:', error);
    throw error;
  }
};

/**
 * Get platform-wide analytics
 */
export const getPlatformAnalytics = async (startDate, endDate) => {
  try {
    const eventStats = await AnalyticsEvent.aggregate([
      {
        $match: {
          timestamp: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            eventType: '$eventType',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.date',
          events: {
            $push: {
              eventType: '$_id.eventType',
              count: '$count',
            },
          },
          totalEvents: { $sum: '$count' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return eventStats;
  } catch (error) {
    log.error('Error getting platform analytics:', error);
    throw error;
  }
};

/**
 * Get revenue analytics
 */
export const getRevenueAnalytics = async (startDate, endDate) => {
  try {
    const revenueEvents = await AnalyticsEvent.aggregate([
      {
        $match: {
          eventType: { $in: ['payment_completed', 'subscription_started', 'subscription_renewed'] },
          timestamp: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            eventType: '$eventType',
          },
          revenue: { $sum: '$eventData.amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.date': 1 },
      },
    ]);

    return revenueEvents;
  } catch (error) {
    log.error('Error getting revenue analytics:', error);
    throw error;
  }
};

/**
 * Generate daily statistics (run via cron job)
 */
export const generateDailyStats = async (date = new Date()) => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const topEvents = await AnalyticsEvent.aggregate([
      {
        $match: {
          timestamp: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          _id: 0,
          eventType: '$_id',
          count: 1,
        },
      },
    ]);

    // Calculate other stats here (users, posts, revenue, etc.)
    // This is a simplified version

    await DailyStats.findOneAndUpdate(
      { date: startOfDay },
      {
        date: startOfDay,
        topEvents,
        stats: {
          // Add calculated stats here
        },
      },
      { upsert: true, new: true }
    );

    log.info(`✅ Daily stats generated for ${date.toDateString()}`);
  } catch (error) {
    log.error('Error generating daily stats:', error);
    throw error;
  }
};

// Helper functions
function detectPlatform(userAgent) {
  if (!userAgent) return 'unknown';

  if (/mobile/i.test(userAgent)) return 'mobile';
  if (/tablet/i.test(userAgent)) return 'tablet';
  return 'desktop';
}

function generateSessionId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default {
  trackEvent,
  getUserAnalytics,
  getPlatformAnalytics,
  getRevenueAnalytics,
  generateDailyStats,
};
