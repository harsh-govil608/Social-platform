import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/admin.middleware.js';
import {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getRevenueAnalytics,
  getContentReports,
  updatePlatformSettings
} from '../controllers/admin.controller.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protectRoute, isAdmin);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// User Management
router.get('/users', getAllUsers);
router.patch('/users/:userId/status', updateUserStatus);

// Revenue Analytics
router.get('/revenue/analytics', getRevenueAnalytics);

// Content Moderation
router.get('/content/reports', getContentReports);

// Settings
router.patch('/settings', updatePlatformSettings);

export default router;
