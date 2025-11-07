import User from '../models/User.js';
import Post from '../models/Post.js';
import { AnalyticsEvent } from '../models/Analytics.js';
import Subscription from '../models/Subscription.js';
import { sendEmail } from '../lib/email.js';

/**
 * Export user data (GDPR compliance)
 */
export const exportUserData = async (req, res) => {
  try {
    const userId = req.user._id;

    // Gather all user data
    const user = await User.findById(userId).select('-password').lean();
    const posts = await Post.find({ user: userId }).lean();
    const analyticsEvents = await AnalyticsEvent.find({ userId }).lean();
    const subscriptions = await Subscription.find({ userId }).lean();

    // Compile data export
    const exportData = {
      exportDate: new Date().toISOString(),
      personal: {
        fullName: user.fullName,
        email: user.email,
        bio: user.bio,
        profilePic: user.profilePic,
        location: user.location,
        nativeLanguage: user.nativeLanguage,
        learningLanguage: user.learningLanguage,
        interests: user.interests,
        socialLinks: user.socialLinks,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      social: {
        friends: user.friends,
        followers: user.followers,
        following: user.following,
        blockedUsers: user.blockedUsers,
      },
      privacy: user.privacySettings,
      content: {
        posts: posts.map(post => ({
          content: post.content,
          visibility: post.visibility,
          likes: post.likes.length,
          comments: post.comments.length,
          createdAt: post.createdAt,
        })),
        totalPosts: posts.length,
      },
      activity: {
        totalEvents: analyticsEvents.length,
        recentEvents: analyticsEvents.slice(-100).map(event => ({
          type: event.eventType,
          timestamp: event.timestamp,
        })),
      },
      subscriptions: subscriptions.map(sub => ({
        planType: sub.planType,
        status: sub.status,
        amount: sub.amount,
        createdAt: sub.createdAt,
        currentPeriodEnd: sub.currentPeriodEnd,
      })),
    };

    // Send as JSON file
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="user-data-${userId}-${Date.now()}.json"`
    );

    res.json(exportData);

    console.log(`✅ User data exported for user: ${userId}`);
  } catch (error) {
    console.error('Error exporting user data:', error);
    res.status(500).json({ message: 'Failed to export user data' });
  }
};

/**
 * Request account deletion (GDPR right to be forgotten)
 */
export const requestAccountDeletion = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Mark user for deletion (30-day grace period)
    user.deletionRequested = true;
    user.deletionRequestedAt = new Date();
    await user.save();

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: 'Account Deletion Request Received',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Account Deletion Request</h1>
          <p>Hi ${user.fullName},</p>
          <p>We received your request to delete your account.</p>
          <p><strong>Your account will be permanently deleted in 30 days.</strong></p>
          <p>If you change your mind, you can cancel this request by logging in before the deletion date.</p>
          <p style="color: #666; margin-top: 30px;">
            Deletion scheduled for: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
          </p>
        </div>
      `,
      text: `Your account deletion has been scheduled for 30 days from now. You can cancel by logging in.`,
    });

    res.json({
      message: 'Account deletion scheduled',
      deletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    console.log(`⚠️  Account deletion requested for user: ${userId}`);
  } catch (error) {
    console.error('Error requesting account deletion:', error);
    res.status(500).json({ message: 'Failed to process deletion request' });
  }
};

/**
 * Cancel account deletion request
 */
export const cancelAccountDeletion = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.deletionRequested) {
      return res.status(400).json({
        message: 'No active deletion request found',
      });
    }

    // Cancel deletion
    user.deletionRequested = false;
    user.deletionRequestedAt = null;
    await user.save();

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: 'Account Deletion Cancelled',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Deletion Cancelled</h1>
          <p>Hi ${user.fullName},</p>
          <p>Your account deletion request has been cancelled.</p>
          <p>Your account is now active and all your data is preserved.</p>
        </div>
      `,
      text: 'Your account deletion has been cancelled. Your account is now active.',
    });

    res.json({
      message: 'Account deletion cancelled',
    });

    console.log(`✅ Account deletion cancelled for user: ${userId}`);
  } catch (error) {
    console.error('Error cancelling account deletion:', error);
    res.status(500).json({ message: 'Failed to cancel deletion' });
  }
};

/**
 * Actually delete user account and all data
 * This should be run by a cron job for users past the 30-day grace period
 */
export const deleteUserAccount = async (userId) => {
  try {
    // Delete user posts
    await Post.deleteMany({ user: userId });

    // Delete analytics events
    await AnalyticsEvent.deleteMany({ userId });

    // Delete subscriptions
    await Subscription.deleteMany({ userId });

    // Remove user from other users' friends/followers lists
    await User.updateMany(
      { $or: [{ friends: userId }, { followers: userId }, { following: userId }] },
      {
        $pull: {
          friends: userId,
          followers: userId,
          following: userId,
        },
      }
    );

    // Delete the user
    await User.findByIdAndDelete(userId);

    console.log(`✅ User account permanently deleted: ${userId}`);

    return { success: true };
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error;
  }
};

/**
 * Process pending deletions (run via cron job)
 */
export const processPendingDeletions = async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const usersToDelete = await User.find({
      deletionRequested: true,
      deletionRequestedAt: { $lte: thirtyDaysAgo },
    });

    console.log(`📋 Processing ${usersToDelete.length} pending account deletions...`);

    for (const user of usersToDelete) {
      await deleteUserAccount(user._id);
    }

    console.log(`✅ Processed ${usersToDelete.length} account deletions`);

    return { deleted: usersToDelete.length };
  } catch (error) {
    console.error('Error processing pending deletions:', error);
    throw error;
  }
};

export default {
  exportUserData,
  requestAccountDeletion,
  cancelAccountDeletion,
  deleteUserAccount,
  processPendingDeletions,
};
