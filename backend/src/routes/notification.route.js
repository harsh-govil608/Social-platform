import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getUnreadCount
} from "../controllers/notification.controller.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/:notificationId/read", markNotificationAsRead);
router.patch("/mark-all-read", markAllNotificationsAsRead);
router.delete("/:notificationId", deleteNotification);

export default router;