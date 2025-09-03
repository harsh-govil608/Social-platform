import express from 'express';
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
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
import { connectDB } from "./lib/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate required environment variables
const requiredEnvVars = ['PORT', 'MONGO_URI', 'JWT_SECRET_KEY', 'STREAM_API_KEY', 'STREAM_API_SECRET'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}

const app= express();
const PORT= process.env.PORT;

// Create HTTP server and Socket.io instance
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"],
        credentials: true
    }
});

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

// Serve uploaded files
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));

// API Routes
app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/chat",chatRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/language-journey", languageJourneyRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/conversation-practice", conversationPracticeRoutes);
app.use("/api/learning", learningRoutes);
app.use("/api/coding", codingRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/dsa", dsaRoutes);
app.use("/api/ai-tutor", aiTutorRoutes);

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

server.listen(PORT, () => {
    console.log(`Server with Socket.io is running on port ${PORT}`);
    connectDB();
})
