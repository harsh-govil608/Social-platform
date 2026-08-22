import { captureMessage } from '../lib/sentry.js';
import { log } from '../lib/logger.js';

/**
 * Performance monitoring middleware
 * Tracks response times and logs slow requests
 */
export const performanceMonitoring = (options = {}) => {
  const {
    slowRequestThreshold = 1000, // ms
    logSlowRequests = true,
    trackAllRequests = false,
  } = options;

  return (req, res, next) => {
    const startTime = Date.now();

    // Store original end function
    const originalEnd = res.end;

    // Override end function to measure time
    res.end = function (...args) {
      const duration = Date.now() - startTime;

      // Add duration to response headers (useful for debugging)
      // Only set header if headers haven't been sent yet
      if (!res.headersSent) {
        try {
          res.setHeader('X-Response-Time', `${duration}ms`);
        } catch (e) {
          // Ignore header errors for streamed responses
        }
      }

      // Log slow requests
      if (duration > slowRequestThreshold && logSlowRequests) {
        log.warn(`⚠️  Slow request detected: ${req.method} ${req.path} - ${duration}ms`);

        // Send to Sentry
        if (process.env.NODE_ENV === 'production') {
          captureMessage(`Slow request: ${req.method} ${req.path}`, {
            level: 'warning',
            extra: {
              duration,
              method: req.method,
              path: req.path,
              query: req.query,
              statusCode: res.statusCode,
            },
          });
        }
      }

      // Track all requests if enabled
      if (trackAllRequests) {
        log.info(`${req.method} ${req.path} - ${duration}ms - ${res.statusCode}`);
      }

      // Store metrics for potential aggregation
      if (req.user) {
        // Could be stored in Redis or analytics database
        storeRequestMetric({
          userId: req.user._id,
          method: req.method,
          path: req.path,
          duration,
          statusCode: res.statusCode,
          timestamp: new Date(),
        });
      }

      // Call original end function
      return originalEnd.apply(this, args);
    };

    next();
  };
};

/**
 * Store request metrics (simplified - can be extended)
 */
const requestMetrics = [];
const MAX_METRICS = 1000;

function storeRequestMetric(metric) {
  requestMetrics.push(metric);

  // Keep only last 1000 metrics in memory
  if (requestMetrics.length > MAX_METRICS) {
    requestMetrics.shift();
  }
}

/**
 * Get request metrics for analysis
 */
export const getRequestMetrics = () => {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  // Filter metrics from last hour
  const recentMetrics = requestMetrics.filter(
    m => m.timestamp.getTime() > oneHourAgo
  );

  // Calculate statistics
  const durations = recentMetrics.map(m => m.duration);
  const avgDuration = durations.length > 0
    ? durations.reduce((a, b) => a + b, 0) / durations.length
    : 0;
  const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;
  const minDuration = durations.length > 0 ? Math.min(...durations) : 0;

  // Group by endpoint
  const endpointStats = {};
  recentMetrics.forEach(m => {
    const key = `${m.method} ${m.path}`;
    if (!endpointStats[key]) {
      endpointStats[key] = {
        count: 0,
        totalDuration: 0,
        maxDuration: 0,
        minDuration: Infinity,
      };
    }
    endpointStats[key].count++;
    endpointStats[key].totalDuration += m.duration;
    endpointStats[key].maxDuration = Math.max(endpointStats[key].maxDuration, m.duration);
    endpointStats[key].minDuration = Math.min(endpointStats[key].minDuration, m.duration);
  });

  // Calculate averages
  Object.keys(endpointStats).forEach(key => {
    endpointStats[key].avgDuration =
      endpointStats[key].totalDuration / endpointStats[key].count;
  });

  return {
    totalRequests: recentMetrics.length,
    avgDuration: Math.round(avgDuration),
    maxDuration,
    minDuration,
    endpointStats,
    timeRange: 'last 1 hour',
  };
};

/**
 * Middleware to add request ID for tracing
 */
export const requestIdMiddleware = (req, res, next) => {
  // Generate unique request ID
  req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Add to response headers
  res.setHeader('X-Request-ID', req.id);

  next();
};

/**
 * Memory usage monitoring
 */
export const memoryMonitoring = () => {
  const checkInterval = 60000; // Check every minute

  setInterval(() => {
    const usage = process.memoryUsage();
    const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
    const heapPercentage = Math.round((usage.heapUsed / usage.heapTotal) * 100);

    // Warn if memory usage is high
    if (heapPercentage > 90) {
      log.warn(
        `⚠️  High memory usage: ${heapUsedMB}MB / ${heapTotalMB}MB (${heapPercentage}%)`
      );

      if (process.env.NODE_ENV === 'production') {
        captureMessage('High memory usage', {
          level: 'warning',
          extra: {
            heapUsed: heapUsedMB,
            heapTotal: heapTotalMB,
            percentage: heapPercentage,
          },
        });
      }
    }
  }, checkInterval);
};

/**
 * Database query performance tracking
 */
export const trackQueryPerformance = (model, operation, duration) => {
  const threshold = 100; // ms

  if (duration > threshold) {
    log.warn(
      `⚠️  Slow database query: ${model}.${operation} - ${duration}ms`
    );
  }
};

export default {
  performanceMonitoring,
  requestIdMiddleware,
  memoryMonitoring,
  getRequestMetrics,
  trackQueryPerformance,
};
