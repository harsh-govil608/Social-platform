import { log } from './logger.js';
/**
 * Redis cache implementation for performance optimization
 * Uses ioredis when REDIS_URL is configured, otherwise falls back to in-memory mock
 *
 * Install: npm install ioredis
 */

let redis;
let isRealRedis = false;

// Try to use real Redis if REDIS_URL is configured and not a placeholder
if (process.env.REDIS_URL && !process.env.REDIS_URL.includes('your_upstash')) {
  try {
    const Redis = (await import('ioredis')).default;

    redis = new Redis(process.env.REDIS_URL, {
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    // Test connection
    await redis.connect();
    isRealRedis = true;
    log.info('✅ Connected to Redis');

    redis.on('error', (err) => {
      log.error('❌ Redis connection error:', err);
    });

    redis.on('reconnecting', () => {
      log.info('🔄 Redis reconnecting...');
    });

  } catch (error) {
    log.warn('⚠️  Redis connection failed, falling back to in-memory cache:', error.message);
    redis = null;
  }
}

// Mock Redis client for development without Redis
class MockRedis {
  constructor() {
    this.store = new Map();
    this.cleanupInterval = setInterval(() => this._cleanup(), 60000); // Cleanup every minute
    log.info('⚠️  Using mock Redis (in-memory). Set REDIS_URL for production caching.');
  }

  _cleanup() {
    const now = Date.now();
    for (const [key, item] of this.store.entries()) {
      if (item.expiry && now > item.expiry) {
        this.store.delete(key);
      }
    }
  }

  async get(key) {
    const item = this.store.get(key);
    if (!item) return null;

    // Check expiration
    if (item.expiry && Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  async set(key, value, expiryMode, time) {
    const item = { value };

    if (expiryMode === 'EX') {
      item.expiry = Date.now() + time * 1000;
    } else if (expiryMode === 'PX') {
      item.expiry = Date.now() + time;
    }

    this.store.set(key, item);
    return 'OK';
  }

  async setex(key, seconds, value) {
    return this.set(key, value, 'EX', seconds);
  }

  async del(...keys) {
    let count = 0;
    for (const key of keys) {
      if (this.store.delete(key)) count++;
    }
    return count;
  }

  async exists(...keys) {
    let count = 0;
    for (const key of keys) {
      if (this.store.has(key)) count++;
    }
    return count;
  }

  async flushall() {
    this.store.clear();
    return 'OK';
  }

  async keys(pattern) {
    // Simple pattern matching (only supports * wildcard)
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return Array.from(this.store.keys()).filter(key => regex.test(key));
  }

  async incr(key) {
    const item = this.store.get(key);
    const newValue = item ? parseInt(item.value, 10) + 1 : 1;
    this.store.set(key, { value: String(newValue), expiry: item?.expiry });
    return newValue;
  }

  async expire(key, seconds) {
    const item = this.store.get(key);
    if (!item) return 0;
    item.expiry = Date.now() + seconds * 1000;
    return 1;
  }

  async ttl(key) {
    const item = this.store.get(key);
    if (!item) return -2;
    if (!item.expiry) return -1;
    const remaining = Math.ceil((item.expiry - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }

  async ping() {
    return 'PONG';
  }

  // Cleanup on process exit
  destroy() {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Use mock if real Redis isn't available
if (!redis) {
  redis = new MockRedis();
}

export default redis;
export const usingRealRedis = () => isRealRedis;

/**
 * Cache helper functions
 */

/**
 * Get or set cached data
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Function to fetch data if not cached
 * @param {number} ttl - Time to live in seconds (default: 5 minutes)
 */
export const getOrSetCache = async (key, fetchFn, ttl = 300) => {
  try {
    // Try to get from cache
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch fresh data
    const data = await fetchFn();

    // Store in cache
    await redis.set(key, JSON.stringify(data), 'EX', ttl);

    return data;
  } catch (error) {
    log.error('Cache error:', error);
    // Fall back to fetching data without cache
    return await fetchFn();
  }
};

/**
 * Invalidate cache by pattern
 * @param {string} pattern - Cache key pattern (e.g., 'user:*')
 */
export const invalidateCache = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await Promise.all(keys.map(key => redis.del(key)));
      log.info(`🗑️  Invalidated ${keys.length} cache keys matching: ${pattern}`);
    }
  } catch (error) {
    log.error('Cache invalidation error:', error);
  }
};

/**
 * Clear all cache
 */
export const clearAllCache = async () => {
  try {
    await redis.flushall();
    log.info('🗑️  All cache cleared');
  } catch (error) {
    log.error('Cache clear error:', error);
  }
};

/**
 * Rate limiting helper
 * @param {string} key - Rate limit key (e.g., 'ratelimit:ip:192.168.1.1')
 * @param {number} limit - Max requests allowed
 * @param {number} windowSeconds - Time window in seconds
 * @returns {Object} { allowed: boolean, remaining: number, resetIn: number }
 */
export const checkRateLimit = async (key, limit, windowSeconds) => {
  try {
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }

    const ttl = await redis.ttl(key);

    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
      resetIn: ttl > 0 ? ttl : windowSeconds
    };
  } catch (error) {
    log.error('Rate limit check error:', error);
    // Fail open - allow the request if cache fails
    return { allowed: true, remaining: limit, resetIn: windowSeconds };
  }
};
