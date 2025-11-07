import express from 'express';
import mongoose from 'mongoose';
import redis from '../lib/redis.js';

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
