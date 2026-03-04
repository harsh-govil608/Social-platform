import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { log } from '../lib/logger.js';

// Check if in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

// In-memory per-user AI request tracker
const userAIRequests = new Map();

/**
 * Per-user AI rate limiter middleware.
 * Limits authenticated users to maxRequests per windowMs regardless of IP.
 * Falls through (no block) for unauthenticated requests — IP limiter handles those.
 */
export const perUserAILimiter = (maxRequests = 20, windowMs = 60 * 60 * 1000) => {
  return (req, res, next) => {
    if (isDevelopment) return next();

    // Extract userId from JWT cookie (auth middleware sets req.user)
    const userId = req.user?._id?.toString();
    if (!userId) return next(); // Not authenticated, handled by IP limiter

    const now = Date.now();
    const key = userId;

    if (!userAIRequests.has(key)) {
      userAIRequests.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    const record = userAIRequests.get(key);

    if (now > record.resetAt) {
      record.count = 1;
      record.resetAt = now + windowMs;
      return next();
    }

    if (record.count >= maxRequests) {
      const retryAfterSecs = Math.ceil((record.resetAt - now) / 1000);
      return res.status(429).json({
        message: `AI request limit reached. Try again in ${Math.ceil(retryAfterSecs / 60)} minutes.`,
        retryAfter: retryAfterSecs,
      });
    }

    record.count++;
    next();
  };
};

// Clean up stale user AI records every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of userAIRequests.entries()) {
    if (now > record.resetAt) userAIRequests.delete(key);
  }
}, 10 * 60 * 1000);

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100, // Much higher limit in development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDevelopment // Skip rate limiting in development if needed
});

// Strict rate limiter for authentication routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 100 : 5, // More lenient in development
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true
});

// AI feature rate limiter (prevents abuse of OpenAI API)
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isDevelopment ? 100 : 10, // Much higher in development
  message: 'Too many AI requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false
});

// Subscription webhook rate limiter (less strict)
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute (Stripe sends many events)
  message: 'Webhook rate limit exceeded',
  standardHeaders: true,
  legacyHeaders: false
});

// File upload rate limiter
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  message: 'Too many file uploads, please try again later.'
});

// Helmet configuration for security headers
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Needed for React dev
      connectSrc: ["'self'", "https://api.stripe.com", "wss:", "ws:"],
      frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false, // Needed for some external resources
  crossOriginResourcePolicy: { policy: "cross-origin" } // Needed for CORS
});

// Validate request body sizes
export const validateBodySize = (req, res, next) => {
  const contentLength = req.headers['content-length'];

  if (contentLength) {
    const sizeInMB = parseInt(contentLength) / (1024 * 1024);

    // Different limits for different routes
    if (req.path.includes('/upload')) {
      if (sizeInMB > 10) {
        return res.status(413).json({ message: 'File too large. Maximum size is 10MB' });
      }
    } else {
      if (sizeInMB > 1) {
        return res.status(413).json({ message: 'Request body too large. Maximum size is 1MB' });
      }
    }
  }

  next();
};

// Sanitize user input to prevent XSS
export const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        // Remove <script> tags and other dangerous patterns
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
};

// CSRF token validation (for production)
export const csrfProtection = (req, res, next) => {
  // Skip CSRF for webhooks and API-only routes
  if (req.path.includes('/webhook') || req.path.includes('/api/health')) {
    return next();
  }

  // Skip CSRF check in development
  if (isDevelopment) {
    return next();
  }

  // In production, implement proper CSRF token validation
  // For now, just validate that requests have proper origin
  const origin = req.headers.origin || req.headers.referer;

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.CORS_ORIGIN,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5001'
    ].filter(Boolean);

    const isAllowed = !origin || allowedOrigins.some(allowed => origin?.startsWith(allowed));

    if (!isAllowed) {
      log.warn('Blocked request with suspicious origin:', origin);
      return res.status(403).json({ message: 'Invalid origin' });
    }
  }

  next();
};

// Log suspicious activity
export const logSuspiciousActivity = (req, res, next) => {
  const suspiciousPatterns = [
    /\.\.\//g, // Path traversal
    /<script>/gi, // XSS attempts
    /union.*select/gi, // SQL injection
    /exec\(/gi, // Command injection
    /eval\(/gi // Code injection
  ];

  const checkString = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params
  });

  const suspicious = suspiciousPatterns.some(pattern => pattern.test(checkString));

  if (suspicious) {
    log.warn('⚠️ Suspicious activity detected:', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      userAgent: req.headers['user-agent']
    });

    // In production, you might want to:
    // 1. Block the request
    // 2. Log to a security monitoring service
    // 3. Notify admins
    // 4. Temporarily ban the IP

    // For now, just log and continue
  }

  next();
};

// IP-based rate limiting (in-memory, use Redis in production)
const ipAttempts = new Map();

export const ipRateLimiter = (maxAttempts, windowMs) => {
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();

    if (!ipAttempts.has(ip)) {
      ipAttempts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const attempts = ipAttempts.get(ip);

    if (now > attempts.resetTime) {
      attempts.count = 1;
      attempts.resetTime = now + windowMs;
      return next();
    }

    if (attempts.count >= maxAttempts) {
      return res.status(429).json({
        message: 'Too many requests from this IP',
        retryAfter: Math.ceil((attempts.resetTime - now) / 1000)
      });
    }

    attempts.count++;
    next();
  };
};

// Clean up old IP attempts periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, attempts] of ipAttempts.entries()) {
    if (now > attempts.resetTime) {
      ipAttempts.delete(ip);
    }
  }
}, 60000); // Clean up every minute

// Chat creation rate limiter (prevent spam)
export const chatCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDevelopment ? 100 : 10, // 10 new chats per hour in production
  message: 'Too many chat conversations created. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});

// Message sending rate limiter
export const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isDevelopment ? 1000 : 30, // 30 messages per minute in production
  message: 'Too many messages sent. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false
});

// Daily task rate limiter (prevent abuse)
export const dailyTaskLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: isDevelopment ? 100 : 3, // 3 task attempts per day in production
  message: 'Daily task limit reached. Try again tomorrow.',
  standardHeaders: true,
  legacyHeaders: false
});

// Login rate limiter (more strict for security)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 50 : 5, // 5 attempts per 15 minutes in production
  message: 'Too many login attempts. Please try again after 15 minutes.',
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false
});

// Signup rate limiter
export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDevelopment ? 50 : 3, // 3 signups per hour per IP
  message: 'Too many accounts created from this IP. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// AI tutor specific limiter (stricter than general AI)
export const aiTutorLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isDevelopment ? 100 : 5, // 5 AI tutor calls per minute
  message: 'Too many AI tutor requests. Please wait a moment.',
  standardHeaders: true,
  legacyHeaders: false
});

// Vocabulary practice rate limiter
export const vocabularyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isDevelopment ? 100 : 20, // 20 vocabulary requests per minute
  message: 'Too many vocabulary requests. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false
});
