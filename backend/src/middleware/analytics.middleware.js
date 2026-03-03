import { trackEvent } from '../lib/analytics.js';
import { log } from '../lib/logger.js';

/**
 * Middleware to automatically track certain events
 */
export const trackAnalytics = (eventType) => {
  return async (req, res, next) => {
    // Store original send method
    const originalSend = res.send;

    // Override send method to track after successful response
    res.send = function (data) {
      // Only track on successful responses (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const eventData = {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
        };

        // Add relevant data based on event type
        if (eventType === 'post_create') {
          eventData.contentLength = req.body?.content?.length || 0;
          eventData.hasMedia = !!(req.files?.images || req.files?.videos);
        }

        trackEvent(req.user._id, eventType, eventData, req).catch(err => {
          log.error('Analytics tracking error:', err);
        });
      }

      // Call original send method
      return originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Track page views
 */
export const trackPageView = async (req, res, next) => {
  if (req.user) {
    const eventData = {
      page: req.path,
      query: req.query,
    };

    await trackEvent(req.user._id, 'profile_view', eventData, req).catch(err => {
      log.error('Page view tracking error:', err);
    });
  }

  next();
};

export default {
  trackAnalytics,
  trackPageView,
};
