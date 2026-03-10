import Notification from "../models/Notification.js";
import { log } from '../lib/logger.js';

// Get user's notifications
export async function getNotifications(req, res) {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({
            recipient: userId
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('sender', 'fullName profilePic');

        const totalNotifications = await Notification.countDocuments({
            recipient: userId
        });

        const unreadCount = await Notification.countDocuments({
            recipient: userId,
            isRead: false
        });

        res.status(200).json({
            success: true,
            notifications,
            unreadCount,
            pagination: {
                page,
                limit,
                totalNotifications,
                totalPages: Math.ceil(totalNotifications / limit)
            }
        });
    } catch (error) {
        log.error("Error in getNotifications:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Mark notification as read
export async function markNotificationAsRead(req, res) {
    try {
        const { notificationId } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, recipient: userId },
            { isRead: true, readAt: new Date() },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({ success: true, notification });
    } catch (error) {
        log.error("Error in markNotificationAsRead:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(req, res) {
    try {
        const userId = req.user._id;

        await Notification.updateMany(
            { recipient: userId, isRead: false },
            { isRead: true, readAt: new Date() }
        );

        res.status(200).json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
        log.error("Error in markAllNotificationsAsRead:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Delete a notification
export async function deleteNotification(req, res) {
    try {
        const { notificationId } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            recipient: userId
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({ success: true, message: "Notification deleted" });
    } catch (error) {
        log.error("Error in deleteNotification:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Get unread notification count
export async function getUnreadCount(req, res) {
    try {
        const userId = req.user._id;

        const unreadCount = await Notification.countDocuments({
            recipient: userId,
            isRead: false
        });

        res.status(200).json({ success: true, unreadCount });
    } catch (error) {
        log.error("Error in getUnreadCount:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}