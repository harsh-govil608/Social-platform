import express from 'express';
import mongoose from 'mongoose';
import redis, { usingRealRedis } from '../lib/redis.js';

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Detailed health check with dependencies
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Detailed health status
 */
router.get('/detailed', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {},
    system: {},
  };

  // Check MongoDB
  try {
    const dbState = mongoose.connection.readyState;
    health.services.mongodb = {
      status: dbState === 1 ? 'connected' : 'disconnected',
      state: ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState],
    };
  } catch (error) {
    health.services.mongodb = {
      status: 'error',
      error: error.message,
    };
    health.status = 'degraded';
  }

  // Check Redis
  try {
    await redis.set('health_check', 'ok', 'EX', 10);
    const redisCheck = await redis.get('health_check');
    health.services.redis = {
      status: redisCheck === 'ok' ? 'connected' : 'error',
    };
  } catch (error) {
    health.services.redis = {
      status: 'error',
      error: error.message,
    };
    health.status = 'degraded';
  }

  // System metrics
  health.system = {
    memory: {
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100) + '%',
    },
    cpu: {
      usage: process.cpuUsage(),
    },
    platform: process.platform,
    nodeVersion: process.version,
  };

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness probe for Kubernetes/Docker
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready to accept traffic
 *       503:
 *         description: Service is not ready
 */
router.get('/ready', async (req, res) => {
  // Check if all critical services are ready
  const isMongoReady = mongoose.connection.readyState === 1;

  if (isMongoReady) {
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      reason: 'Database not connected',
    });
  }
});

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness probe for Kubernetes/Docker
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is alive
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @swagger
 * /health/dependencies:
 *   get:
 *     summary: Check all external dependencies
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: All dependencies healthy
 *       503:
 *         description: One or more dependencies unhealthy
 */
router.get('/dependencies', async (req, res) => {
  const dependencies = {
    timestamp: new Date().toISOString(),
    overall: 'healthy',
    checks: {}
  };

  // Check MongoDB
  try {
    const startTime = Date.now();
    const dbState = mongoose.connection.readyState;
    const latency = Date.now() - startTime;

    dependencies.checks.mongodb = {
      status: dbState === 1 ? 'healthy' : 'unhealthy',
      latency: `${latency}ms`,
      state: ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState]
    };

    if (dbState !== 1) dependencies.overall = 'unhealthy';
  } catch (error) {
    dependencies.checks.mongodb = {
      status: 'unhealthy',
      error: error.message
    };
    dependencies.overall = 'unhealthy';
  }

  // Check Redis
  try {
    const startTime = Date.now();
    await redis.ping();
    const latency = Date.now() - startTime;

    dependencies.checks.redis = {
      status: 'healthy',
      latency: `${latency}ms`,
      type: usingRealRedis() ? 'redis' : 'in-memory-mock'
    };
  } catch (error) {
    dependencies.checks.redis = {
      status: 'degraded', // Not critical
      error: error.message,
      type: 'unavailable'
    };
    // Redis is not critical, don't mark overall as unhealthy
  }

  // Check Stream Chat API (if configured)
  if (process.env.STREAM_API_KEY) {
    dependencies.checks.streamChat = {
      status: 'configured',
      note: 'API key present'
    };
  } else {
    dependencies.checks.streamChat = {
      status: 'not_configured'
    };
  }

  // Check Stripe (if configured)
  if (process.env.STRIPE_SECRET_KEY) {
    dependencies.checks.stripe = {
      status: 'configured',
      note: 'API key present'
    };
  } else {
    dependencies.checks.stripe = {
      status: 'not_configured'
    };
  }

  // Check AI Service (Hugging Face)
  if (process.env.HF_TOKEN) {
    dependencies.checks.aiService = {
      status: 'configured',
      provider: 'huggingface',
      note: 'Token present'
    };
  } else if (process.env.OPENAI_API_KEY) {
    dependencies.checks.aiService = {
      status: 'configured',
      provider: 'openai',
      note: 'API key present'
    };
  } else {
    dependencies.checks.aiService = {
      status: 'not_configured'
    };
  }

  // Check Email Service
  if (process.env.EMAIL_HOST || process.env.SENDGRID_API_KEY) {
    dependencies.checks.email = {
      status: 'configured',
      provider: process.env.SENDGRID_API_KEY ? 'sendgrid' : 'smtp'
    };
  } else {
    dependencies.checks.email = {
      status: 'not_configured',
      note: 'Using console logging'
    };
  }

  // Check Sentry (if configured)
  if (process.env.SENTRY_DSN) {
    dependencies.checks.sentry = {
      status: 'configured'
    };
  } else {
    dependencies.checks.sentry = {
      status: 'not_configured'
    };
  }

  const statusCode = dependencies.overall === 'healthy' ? 200 : 503;
  res.status(statusCode).json(dependencies);
});

/**
 * @swagger
 * /health/metrics:
 *   get:
 *     summary: Application metrics
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      process: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
      },
      database: {
        collections: [],
      },
    };

    // Get database statistics
    if (mongoose.connection.readyState === 1) {
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();

      for (const collection of collections) {
        try {
          const stats = await db.collection(collection.name).stats();
          metrics.database.collections.push({
            name: collection.name,
            count: stats.count || 0,
            size: stats.size || 0,
            avgObjSize: stats.avgObjSize || 0,
          });
        } catch (err) {
          // Skip collections that don't support stats
        }
      }
    }

    res.json(metrics);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to gather metrics',
      message: error.message,
    });
  }
});

export default router;
