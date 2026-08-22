import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  startConversation,
  sendMessage,
  getHint,
  getSessionHistory,
  getConversationStats
} from "../controllers/conversationEnhanced.controller.js";

const router = express.Router();

// All routes are protected
router.use(protectRoute);

// Start new conversation session
router.post("/start", startConversation);

// Send message and get response
router.post("/message", sendMessage);

// Get hints for current conversation
router.get("/hint/:sessionId", getHint);

// Get session history
router.get("/session/:sessionId", getSessionHistory);

// Get user statistics
router.get("/stats", getConversationStats);

export default router;