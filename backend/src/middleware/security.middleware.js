import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Check if in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

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
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5001' // Allow same-origin requests
    ].filter(Boolean);

    const isAllowed = !origin || allowedOrigins.some(allowed => origin?.startsWith(allowed));

    if (!isAllowed) {
      console.warn('Blocked request with suspicious origin:', origin);
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
    console.warn('⚠️ Suspicious activity detected:', {
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
