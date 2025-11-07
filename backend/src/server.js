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
import conversationRoutes from "./routes/conversation.route.js";
import conversationPracticeRoutes from "./routes/conversationPractice.route.js";
import learningRoutes from "./routes/learning.route.js";
import codingRoutes from "./routes/coding.route.js";
import storyRoutes from "./routes/story.route.js";
import activityRoutes from "./routes/activity.route.js";
import dsaRoutes from "./routes/dsa.route.js";
import aiTutorRoutes from "./routes/aiTutor.route.js";

// New monetization & B2B routes
import subscriptionRoutes from "./routes/subscription.route.js";
import gamificationRoutes from "./routes/gamification.route.js";
import referralRoutes from "./routes/referral.route.js";
import organizationRoutes from "./routes/organization.route.js";
import adminRoutes from "./routes/admin.route.js";
import docsRoutes from "./routes/docs.route.js";
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
  validateBodySize
} from "./middleware/security.middleware.js";

// Database & utilities
import { connectDB } from "./lib/db.js";
import { initializeAchievements } from "./controllers/gamification.controller.js";
import { initSentry, sentryRequestHandler, sentryTracingHandler, sentryErrorHandler } from "./lib/sentry.js";
import { performanceMonitoring, requestIdMiddleware, memoryMonitoring } from "./middleware/performance.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Sentry first (before creating Express app)
const app = express();
initSentry(app);

// Validate required environment variables
const requiredEnvVars = ['PORT', 'MONGO_URI', 'JWT_SECRET_KEY', 'STREAM_API_KEY', 'STREAM_API_SECRET'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}

const PORT= process.env.PORT;

// Create HTTP server and Socket.io instance
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"],
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

app.use(express.json());
app.use(cookieParser());

// Configure CORS - simplified for combined setup
const corsOptions = {
    origin: true, // Allow all origins for now
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

// API Documentation (Swagger)
app.use("/api/docs", docsRoutes);

// API Routes - Existing features
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", apiLimiter, userRoutes);
app.use("/api/chat", apiLimiter, chatRoutes);
app.use("/api/posts", apiLimiter, postRoutes);
app.use("/api/notifications", apiLimiter, notificationRoutes);
app.use("/api/language-journey", aiLimiter, languageJourneyRoutes);
app.use("/api/conversations", aiLimiter, conversationRoutes);
app.use("/api/conversation-practice", aiLimiter, conversationPracticeRoutes);
app.use("/api/learning", aiLimiter, learningRoutes);
app.use("/api/coding", aiLimiter, codingRoutes);
app.use("/api/stories", apiLimiter, storyRoutes);
app.use("/api/activity", apiLimiter, activityRoutes);
app.use("/api/dsa", aiLimiter, dsaRoutes);
app.use("/api/ai-tutor", aiLimiter, aiTutorRoutes);

// Monetization & B2B routes
app.use("/api/subscription", apiLimiter, subscriptionRoutes);
app.use("/api/gamification", apiLimiter, gamificationRoutes);
app.use("/api/referral", apiLimiter, referralRoutes);
app.use("/api/organization", apiLimiter, organizationRoutes);

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

// Socket.io connection handling for real-time conversation
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // Join user to their personal room
    socket.on('join-conversation', (userId) => {
        socket.join(`conversation-${userId}`);
        console.log(`User ${userId} joined conversation room`);
    });
    
    // Handle real-time message streaming
    socket.on('conversation-message', async (data) => {
        const { userId, message } = data;
        // Emit back to the specific user's room
        io.to(`conversation-${userId}`).emit('ai-response-chunk', {
            chunk: 'Processing...'
        });
    });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

server.listen(PORT, async () => {
    console.log(`\n🚀 Server with Socket.io is running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);

    await connectDB();

    // Start memory monitoring
    memoryMonitoring();

    // Initialize achievements on startup
    try {
        await initializeAchievements();
        console.log('✅ Gamification system initialized\n');
    } catch (error) {
        console.error('❌ Failed to initialize achievements:', error);
    }

    console.log('📦 Available API endpoints:');
    console.log('   - /api/auth - Authentication');
    console.log('   - /api/users - User management');
    console.log('   - /api/posts - Social posts');
    console.log('   - /api/subscription - Premium subscriptions');
    console.log('   - /api/gamification - Achievements & leaderboards');
    console.log('   - /api/referral - Referral program');
    console.log('   - /api/organization - B2B/White-label');
    console.log('   - /api/ai-tutor - AI tutoring');
    console.log('   - /api/dsa - DSA problems');
    console.log('   - /api/coding - Coding challenges');
    console.log('   - /api/conversation-practice - Language learning');
    console.log('   - /api/health - Health check\n');
});
