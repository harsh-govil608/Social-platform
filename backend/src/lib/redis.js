// Install ioredis with: npm install ioredis
// import Redis from 'ioredis';

/**
 * Redis cache implementation for performance optimization
 *
 * Install: npm install ioredis
 *
 * Uncomment the code below after installing ioredis
 */

/*
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

export default redis;
*/

// Mock Redis client for development without Redis
class MockRedis {
  constructor() {
    this.store = new Map();
    console.log('⚠️  Using mock Redis (in-memory). Install Redis and ioredis for production.');
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
    }

    this.store.set(key, item);
    return 'OK';
  }

  async del(key) {
    return this.store.delete(key) ? 1 : 0;
  }

  async exists(key) {
    return this.store.has(key) ? 1 : 0;
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
}

const redis = new MockRedis();

export default redis;

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
    console.error('Cache error:', error);
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
      console.log(`🗑️  Invalidated ${keys.length} cache keys matching: ${pattern}`);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
};

/**
 * Clear all cache
 */
export const clearAllCache = async () => {
  try {
    await redis.flushall();
    console.log('🗑️  All cache cleared');
  } catch (error) {
    console.error('Cache clear error:', error);
  }
};
