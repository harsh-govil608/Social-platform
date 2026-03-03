import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
  startConversation,
  sendMessage,
  endConversation,
  getConversationStatus,
  getScenarios
} from '../controllers/conversationPractice.controller.js';
import { validateConversationStart } from '../validators/learning.validator.js';

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Conversation practice routes
router.get('/scenarios', getScenarios);
router.get('/status', getConversationStatus);
router.post('/start', validateConversationStart, startConversation);
router.post('/message', sendMessage);
router.post('/end', endConversation);

export default router;