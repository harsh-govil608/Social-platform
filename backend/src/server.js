import express from 'express';
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Existing routes
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";
import languageJourneyRoutes from "./routes/languageJourney.route.js";
// import conversationRoutes from "./routes/conversation.route.js"; // Beta: disabled
import conversationPracticeRoutes from "./routes/conversationPractice.route.js";
import learningRoutes from "./routes/learning.route.js";
// import codingRoutes from "./routes/coding.route.js"; // Beta: disabled
// import storyRoutes from "./routes/story.route.js"; // Beta: disabled
import activityRoutes from "./routes/activity.route.js";
// import dsaRoutes from "./routes/dsa.route.js"; // Beta: disabled
import aiTutorRoutes from "./routes/aiTutor.route.js";
import spacedRepetitionRoutes from "./routes/spacedRepetition.route.js";
// import contestRoutes from "./routes/contest.route.js"; // Beta: disabled
// import certificateRoutes from "./routes/certificate.route.js"; // Beta: disabled
import matchingRoutes from "./routes/matching.route.js";
import dailyTaskRoutes from "./routes/dailyTask.route.js";
import analyticsRoutes from "./routes/analytics.route.js";

import gamificationRoutes from "./routes/gamification.route.js";
import adminRoutes from "./routes/admin.route.js";
import subscriptionRoutes from "./routes/subscription.route.js";
import referralRoutes from "./routes/referral.route.js";
import organizationRoutes from "./routes/organization.route.js";
// import docsRoutes from "./routes/docs.route.js";
import healthRoutes from "./routes/health.route.js";
import gdprRoutes from "./routes/gdpr.route.js";

// Security middleware
import {
  helmetConfig,
  apiLimiter,
  authLimiter,
  aiLimiter,
  sanitizeInput,
  csrfProtection,
  logSuspiciousActivity,
  validateBodySize,
  chatCreationLimiter,
  messageLimiter,
  dailyTaskLimiter,
  loginLimiter,
  signupLimiter,
  aiTutorLimiter,
  vocabularyLimiter,
  perUserAILimiter
} from "./middleware/security.middleware.js";

// Database & utilities
import mongoose from "mongoose";
import { connectDB } from "./lib/db.js";
import { initializeAchievements } from "./controllers/gamification.controller.js";
import { initSentry, sentryRequestHandler, sentryTracingHandler, sentryErrorHandler } from "./lib/sentry.js";
import { performanceMonitoring, requestIdMiddleware, memoryMonitoring } from "./middleware/performance.middleware.js";
import { log } from "./lib/logger.js";
import { initSocketService } from "./lib/socketService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Sentry first (before creating Express app)
const app = express();
initSentry(app);

// Validate required environment variables
const requiredEnvVars = ['PORT', 'MONGO_URI', 'JWT_SECRET_KEY', 'STREAM_API_KEY', 'STREAM_API_SECRET'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        log.error(`Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}

const PORT= process.env.PORT;

// Create HTTP server and Socket.io instance
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN
            ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
            : ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"],
        credentials: true
    }
});

// Sentry request handler (must be first)
app.use(sentryRequestHandler());
app.use(sentryTracingHandler());

// Performance monitoring
app.use(requestIdMiddleware);
app.use(performanceMonitoring({
  slowRequestThreshold: 1000,
  logSlowRequests: true,
  trackAllRequests: process.env.NODE_ENV === 'development',
}));

// Security middleware (apply early)
app.use(helmetConfig);
app.use(logSuspiciousActivity);
app.use(validateBodySize);

// Health check endpoints (no rate limiting for monitoring)
app.use("/api/health", healthRoutes);

// Test endpoint (placed early to debug)
app.get("/api/test", (req, res) => {
    res.json({ message: "Test endpoint works!" });
});

app.set('trust proxy', 1);
app.use(express.json());
app.use(cookieParser());

// Configure CORS - use environment variable for allowed origins
const getAllowedOrigins = () => {
    if (process.env.CORS_ORIGIN) {
        // Support comma-separated origins in production
        return process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
    }
    // Default to localhost ports in development
    return ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'];
};

const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = getAllowedOrigins();
        // Allow requests with no origin (like mobile apps or curl requests in dev)
        if (!origin && process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['set-cookie']
};

app.use(cors(corsOptions));
app.use(sanitizeInput);
app.use(csrfProtection);

// Serve uploaded files
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));

// API Documentation (Swagger) - Beta: disabled
// app.use("/api/docs", docsRoutes);

// API Routes - Existing features
app.use("/api/auth", loginLimiter, authRoutes);
app.use("/api/users", apiLimiter, userRoutes);
app.use("/api/chat", messageLimiter, chatRoutes);
app.use("/api/posts", apiLimiter, postRoutes);
app.use("/api/notifications", apiLimiter, notificationRoutes);
app.use("/api/language-journey", aiLimiter, languageJourneyRoutes);
// app.use("/api/conversations", aiLimiter, conversationRoutes); // Beta: disabled
app.use("/api/conversation-practice", aiLimiter, perUserAILimiter(20, 60 * 60 * 1000), conversationPracticeRoutes);
app.use("/api/learning", aiLimiter, learningRoutes);
// app.use("/api/coding", aiLimiter, codingRoutes); // Beta: disabled
// app.use("/api/stories", apiLimiter, storyRoutes); // Beta: disabled
app.use("/api/activity", apiLimiter, activityRoutes);
// app.use("/api/dsa", aiLimiter, dsaRoutes); // Beta: disabled
app.use("/api/ai-tutor", aiTutorLimiter, perUserAILimiter(30, 60 * 60 * 1000), aiTutorRoutes);
app.use("/api/vocabulary", vocabularyLimiter, spacedRepetitionRoutes);
// app.use("/api/contests", apiLimiter, contestRoutes); // Beta: disabled
// app.use("/api/certificates", apiLimiter, certificateRoutes); // Beta: disabled
app.use("/api/matching", apiLimiter, matchingRoutes);
app.use("/api/daily-task", dailyTaskLimiter, dailyTaskRoutes);
app.use("/api/analytics", apiLimiter, analyticsRoutes);

// B2B routes
app.use("/api/referral", apiLimiter, referralRoutes);
app.use("/api/organization", apiLimiter, organizationRoutes);

app.use("/api/gamification", apiLimiter, gamificationRoutes);
app.use("/api/subscription", subscriptionRoutes); // webhook needs raw body, no apiLimiter wrapper
// Admin routes
app.use("/api/admin", apiLimiter, adminRoutes);

// GDPR routes
app.use("/api/gdpr", apiLimiter, gdprRoutes);

// Serve static files from the React app build
const frontendBuildPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendBuildPath, {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// Sentry error handler (must be before other error handlers)
app.use(sentryErrorHandler());

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ message: 'API route not found' });
    }
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// Initialize socket service so controllers can emit notifications
initSocketService(io);

// Socket.io connection handling
io.on('connection', (socket) => {
    log.debug('New client connected', { socketId: socket.id });

    // Join user to their notification room
    socket.on('join-notifications', (userId) => {
        socket.join(`notification-${userId}`);
        log.debug('User joined notification room', { userId });
    });

    // Join user to their conversation room (for AI practice streaming)
    socket.on('join-conversation', (userId) => {
        socket.join(`conversation-${userId}`);
        log.debug('User joined conversation room', { userId });
    });

    socket.on('disconnect', () => {
        log.debug('Client disconnected', { socketId: socket.id });
    });
});

server.listen(PORT, async () => {
    log.info(`Server with Socket.io is running on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    });

    await connectDB();

    // Start memory monitoring
    memoryMonitoring();

    // Seed default achievements (safe to run on every startup - uses upsert)
    try {
        await initializeAchievements();
        log.info('Gamification achievements seeded');
    } catch (error) {
        log.error('Failed to seed achievements', { error: error.message });
    }

    log.info('API ready', {
        endpoints: ['/api/auth', '/api/users', '/api/chat', '/api/posts', '/api/notifications',
            '/api/daily-task', '/api/learning', '/api/ai-tutor', '/api/conversation-practice',
            '/api/vocabulary', '/api/matching', '/api/activity', '/api/analytics', '/api/admin', '/api/health'],
    });
});

const shutdown = async (signal) => {
    log.info(`${signal} received — starting graceful shutdown`);
    server.close(async () => {
        log.info('HTTP server closed');
        await mongoose.connection.close(false);
        log.info('MongoDB connection closed');
        process.exit(0);
    });
    setTimeout(() => {
        log.error('Forceful shutdown after timeout');
        process.exit(1);
    }, 10_000);
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
