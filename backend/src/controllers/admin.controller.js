import User from '../models/User.js';
import Post from '../models/Post.js';
import Subscription from '../models/Subscription.js';
import { log } from '../lib/logger.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();

    // Get active users (online or active in last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({
      lastSeen: { $gte: oneDayAgo },
    });

    // Get subscription stats
    const activeSubscriptions = await Subscription.countDocuments({
      status: 'active',
    });

    // Get revenue for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyRevenue = await Subscription.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
          status: 'active',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    // Get total posts
    const totalPosts = await Post.countDocuments();

    // Get recent activity (simplified)
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName createdAt');

    const recentActivity = recentUsers.map(user => ({
      type: `New user: ${user.fullName}`,
      time: user.createdAt.toLocaleString(),
    }));

    // Get top performers (users with most posts or engagement)
    const topPerformers = await User.aggregate([
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'user',
          as: 'posts',
        },
      },
      {
        $addFields: {
          postCount: { $size: '$posts' },
        },
      },
      {
        $sort: { postCount: -1 },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          name: '$fullName',
          points: '$postCount',
        },
      },
    ]);

    res.json({
      totalUsers,
      activeUsers,
      activeSessions: activeUsers,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      activeSubscriptions,
      totalPosts,
      reportedIssues: 0, // Implement reporting system
      recentActivity,
      topPerformers,
    });
  } catch (error) {
    log.error('Error in getDashboardStats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;

    const query = search
      ? {
          $or: [
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    log.error('Error in getAllUsers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: `User ${isActive ? 'activated' : 'suspended'} successfully`,
      user,
    });
  } catch (error) {
    log.error('Error in updateUserStatus:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getRevenueAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const match = {};
    if (startDate && endDate) {
      match.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const revenueByPlan = await Subscription.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$planType',
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = await Subscription.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    res.json({
      revenueByPlan,
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch (error) {
    log.error('Error in getRevenueAnalytics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getContentReports = async (req, res) => {
  try {
    // Implement content reporting system
    // This is a placeholder
    res.json({
      reports: [],
      message: 'Content reporting system to be implemented',
    });
  } catch (error) {
    log.error('Error in getContentReports:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updatePlatformSettings = async (req, res) => {
  try {
    // Implement platform settings storage
    // This could be stored in a Settings model or configuration file
    res.json({
      message: 'Settings updated successfully',
    });
  } catch (error) {
    log.error('Error in updatePlatformSettings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
