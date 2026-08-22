/**
 * Winston Logger Configuration
 *
 * Structured logging for production environments
 * Install: npm install winston
 */

import winston from 'winston';
import path from 'path';

const { combine, timestamp, json, errors, colorize, printf, simple } = winston.format;

// Custom format for development (human-readable)
const devFormat = printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
});

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    format: combine(
        errors({ stack: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
    ),
    defaultMeta: {
        service: 'skillforge-api',
        environment: process.env.NODE_ENV || 'development'
    },
    transports: []
});

// Production: JSON logs to files
if (process.env.NODE_ENV === 'production') {
    // Combined log (all levels)
    logger.add(new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'combined.log'),
        format: json(),
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
        tailable: true
    }));

    // Error log (errors only)
    logger.add(new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'error.log'),
        level: 'error',
        format: json(),
        maxsize: 10 * 1024 * 1024,
        maxFiles: 5,
        tailable: true
    }));

    // Console output in production (for container logs)
    logger.add(new winston.transports.Console({
        format: json()
    }));
} else {
    // Development: colorized console output
    logger.add(new winston.transports.Console({
        format: combine(
            colorize(),
            timestamp({ format: 'HH:mm:ss' }),
            devFormat
        )
    }));
}

// Helper methods for structured logging
export const log = {
    // Standard log levels
    error: (message, meta = {}) => logger.error(message, meta),
    warn: (message, meta = {}) => logger.warn(message, meta),
    info: (message, meta = {}) => logger.info(message, meta),
    debug: (message, meta = {}) => logger.debug(message, meta),

    // HTTP request logging
    http: (req, res, responseTime) => {
        logger.info('HTTP Request', {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            userId: req.user?._id?.toString()
        });
    },

    // Error with request context
    requestError: (err, req) => {
        logger.error('Request Error', {
            error: err.message,
            stack: err.stack,
            method: req?.method,
            url: req?.originalUrl,
            userId: req?.user?._id?.toString(),
            body: process.env.NODE_ENV !== 'production' ? req?.body : undefined
        });
    },

    // Database operations
    db: (operation, collection, duration, success = true) => {
        logger.info('Database Operation', {
            operation,
            collection,
            duration: `${duration}ms`,
            success
        });
    },

    // Authentication events
    auth: (event, userId, meta = {}) => {
        logger.info('Auth Event', {
            event,
            userId: userId?.toString(),
            ...meta
        });
    },

    // Performance metrics
    performance: (metric, value, meta = {}) => {
        logger.info('Performance Metric', {
            metric,
            value,
            ...meta
        });
    },

    // Security events
    security: (event, meta = {}) => {
        logger.warn('Security Event', {
            event,
            ...meta
        });
    },

    // Business events
    business: (event, meta = {}) => {
        logger.info('Business Event', {
            event,
            ...meta
        });
    }
};

// Stream for Morgan HTTP logger integration
export const morganStream = {
    write: (message) => {
        logger.http(message.trim());
    }
};

// Express error handler middleware
export const errorLogger = (err, req, res, next) => {
    log.requestError(err, req);
    next(err);
};

// Request logging middleware
export const requestLogger = (req, res, next) => {
    const startTime = Date.now();

    // Log when response finishes
    res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        log.http(req, res, responseTime);
    });

    next();
};

export default logger;
