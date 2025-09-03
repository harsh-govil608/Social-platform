import { generateStreamToken } from "../lib/stream.js";
import User from "../models/User.js";

export async function getStreamToken(req, res) {
  try {
    const token = generateStreamToken(req.user.id);

    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get chat-eligible users (friends + based on privacy settings)
export async function getChatUsers(req, res) {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
      .populate('friends', 'fullName profilePic isOnline lastSeen privacySettings');

    // Filter friends based on their message privacy settings
    const chatEligibleFriends = user.friends.filter(friend => {
      const allowsMessages = friend.privacySettings.allowMessages;
      return allowsMessages === 'everyone' || allowsMessages === 'friends';
    });

    res.status(200).json({ success: true, users: chatEligibleFriends });
  } catch (error) {
    console.error("Error in getChatUsers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Check if user can message another user
export async function canMessage(req, res) {
  try {
    const { recipientId } = req.params;
    const senderId = req.user._id;

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if blocked
    if (recipient.blockedUsers.includes(senderId) || req.user.blockedUsers.includes(recipientId)) {
      return res.status(403).json({ canMessage: false, reason: "User blocked" });
    }

    // Check privacy settings
    const isFriend = recipient.friends.includes(senderId);
    const allowsMessages = recipient.privacySettings.allowMessages;

    if (allowsMessages === 'none') {
      return res.status(403).json({ canMessage: false, reason: "User does not accept messages" });
    }

    if (allowsMessages === 'friends' && !isFriend) {
      return res.status(403).json({ canMessage: false, reason: "Only friends can message this user" });
    }

    res.status(200).json({ canMessage: true });
  } catch (error) {
    console.error("Error in canMessage:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}