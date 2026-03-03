import redis, { getOrSetCache, invalidateCache } from '../lib/redis.js';
import { log } from '../lib/logger.js';

/**
 * Middleware to cache GET requests
 * @param {number} ttl - Time to live in seconds
 * @param {Function} keyGenerator - Optional function to generate cache key
 */
export const cacheMiddleware = (ttl = 300, keyGenerator = null) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = keyGenerator
        ? keyGenerator(req)
        : `cache:${req.originalUrl}`;

      // Try to get from cache
      const cached = await redis.get(cacheKey);

      if (cached) {
        log.info(`✅ Cache hit: ${cacheKey}`);
        return res.json(JSON.parse(cached));
      }

      // Cache miss - continue to route handler
      log.info(`❌ Cache miss: ${cacheKey}`);

      // Store original res.json
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = function (data) {
        // Cache the response
        redis.set(cacheKey, JSON.stringify(data), 'EX', ttl).catch(err => {
          log.error('Error caching response:', err);
        });

        // Call original json method
        return originalJson(data);
      };

      next();
    } catch (error) {
      log.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Middleware to invalidate cache on mutations
 * @param {string|Function} pattern - Cache pattern to invalidate
 */
export const invalidateCacheMiddleware = (pattern) => {
  return async (req, res, next) => {
    // Store original send method
    const originalSend = res.send.bind(res);

    // Override send method
    res.send = function (data) {
      // Only invalidate on successful responses (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const cachePattern = typeof pattern === 'function' ? pattern(req) : pattern;
        invalidateCache(cachePattern).catch(err => {
          log.error('Error invalidating cache:', err);
        });
      }

      // Call original send method
      return originalSend(data);
    };

    next();
  };
};

/**
 * Cache user data
 */
export const cacheUser = (userId, userData, ttl = 600) => {
  return redis.set(`user:${userId}`, JSON.stringify(userData), 'EX', ttl);
};

/**
 * Get cached user data
 */
export const getCachedUser = async (userId) => {
  const cached = await redis.get(`user:${userId}`);
  return cached ? JSON.parse(cached) : null;
};

/**
 * Invalidate user cache
 */
export const invalidateUserCache = (userId) => {
  return invalidateCache(`user:${userId}*`);
};

/**
 * Cache posts
 */
export const cachePosts = (key, posts, ttl = 300) => {
  return redis.set(`posts:${key}`, JSON.stringify(posts), 'EX', ttl);
};

/**
 * Get cached posts
 */
export const getCachedPosts = async (key) => {
  const cached = await redis.get(`posts:${key}`);
  return cached ? JSON.parse(cached) : null;
};

/**
 * Invalidate posts cache
 */
export const invalidatePostsCache = () => {
  return invalidateCache('posts:*');
};

export default {
  cacheMiddleware,
  invalidateCacheMiddleware,
  cacheUser,
  getCachedUser,
  invalidateUserCache,
  cachePosts,
  getCachedPosts,
  invalidatePostsCache,
};
