import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
import Notification from "../models/Notification.js";

export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.id;
    const currentUser = req.user;

    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, 
        { _id: { $nin: currentUser.friends } }, 
        { isOnboarded: true },
      ],
    });
    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("Error in getRecommendedUsers controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate("friends", "fullName profilePic nativeLanguage learningLanguage");

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error in getMyFriends controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    if (myId === recipientId) {
      return res.status(400).json({ message: "You can't send friend request to yourself" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    if (recipient.friends.includes(myId)) {
      return res.status(400).json({ message: "You are already friends with this user" });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "A friend request already exists between you and this user" });
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    // Create notification for the recipient
    await Notification.create({
      recipient: recipientId,
      sender: myId,
      type: 'friend_request',
      entityId: friendRequest._id,
      entityModel: 'FriendRequest',
      message: `${req.user.fullName} sent you a friend request`
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Error in sendFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId)
      .populate('sender', 'fullName');

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to accept this request" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    // Create notification for the sender
    await Notification.create({
      recipient: friendRequest.sender,
      sender: friendRequest.recipient,
      type: 'friend_accept',
      entityId: friendRequest._id,
      entityModel: 'FriendRequest',
      message: `${req.user.fullName} accepted your friend request`
    });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.log("Error in acceptFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getFriendRequests(req, res) {
  try {
    const incomingReqs = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");

    const acceptedReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", "fullName profilePic");

    res.status(200).json({ incomingReqs, acceptedReqs });
  } catch (error) {
    console.log("Error in getPendingFriendRequests controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getOutgoingFriendReqs(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage");

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.log("Error in getOutgoingFriendReqs controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Search users
export async function searchUsers(req, res) {
  try {
    const { query } = req.query;
    const userId = req.user._id;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ message: "Search query must be at least 2 characters" });
    }

    const searchRegex = new RegExp(query, 'i');
    
    const users = await User.find({
      $and: [
        { _id: { $ne: userId } },
        { isOnboarded: true },
        { _id: { $nin: req.user.blockedUsers } },
        {
          $or: [
            { fullName: searchRegex },
            { email: searchRegex },
            { bio: searchRegex }
          ]
        }
      ]
    })
    .select('fullName email profilePic bio nativeLanguage learningLanguage location isVerified')
    .limit(20);

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error in searchUsers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get user profile
export async function getUserProfile(req, res) {
  try {
    const { userId } = req.params;
    const requesterId = req.user._id;

    const user = await User.findById(userId)
      .select('-password')
      .populate('friends', 'fullName profilePic')
      .populate('followers', 'fullName profilePic')
      .populate('following', 'fullName profilePic');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if blocked
    if (user.blockedUsers.includes(requesterId) || req.user.blockedUsers.includes(userId)) {
      return res.status(403).json({ message: "User not available" });
    }

    // Check privacy settings
    const isFriend = user.friends.some(f => f._id.toString() === requesterId.toString());
    const isSelf = userId === requesterId.toString();

    if (!isSelf && user.privacySettings.profileVisibility === 'private') {
      return res.status(403).json({ message: "This profile is private" });
    }

    if (!isSelf && user.privacySettings.profileVisibility === 'friends' && !isFriend) {
      // Return limited info for non-friends
      const limitedUser = {
        _id: user._id,
        fullName: user.fullName,
        profilePic: user.profilePic,
        isVerified: user.isVerified,
        isPrivate: true
      };
      return res.status(200).json({ success: true, user: limitedUser });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Update user profile
export async function updateUserProfile(req, res) {
  try {
    const userId = req.user._id;
    const allowedUpdates = [
      'fullName', 'bio', 'profilePic', 'location', 
      'nativeLanguage', 'learningLanguage', 'interests',
      'socialLinks', 'privacySettings'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Follow a user
export async function followUser(req, res) {
  try {
    const { userId } = req.params;
    const followerId = req.user._id;

    if (userId === followerId.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already following
    if (req.user.following.includes(userId)) {
      return res.status(400).json({ message: "You are already following this user" });
    }

    // Update both users
    await User.findByIdAndUpdate(followerId, {
      $addToSet: { following: userId }
    });

    await User.findByIdAndUpdate(userId, {
      $addToSet: { followers: followerId }
    });

    // Create notification
    await Notification.create({
      recipient: userId,
      sender: followerId,
      type: 'follow',
      entityId: followerId,
      entityModel: 'User',
      message: `${req.user.fullName} started following you`
    });

    res.status(200).json({ success: true, message: "User followed successfully" });
  } catch (error) {
    console.error("Error in followUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Unfollow a user
export async function unfollowUser(req, res) {
  try {
    const { userId } = req.params;
    const followerId = req.user._id;

    // Update both users
    await User.findByIdAndUpdate(followerId, {
      $pull: { following: userId }
    });

    await User.findByIdAndUpdate(userId, {
      $pull: { followers: followerId }
    });

    res.status(200).json({ success: true, message: "User unfollowed successfully" });
  } catch (error) {
    console.error("Error in unfollowUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Block a user
export async function blockUser(req, res) {
  try {
    const { userId } = req.params;
    const blockerId = req.user._id;

    if (userId === blockerId.toString()) {
      return res.status(400).json({ message: "You cannot block yourself" });
    }

    const userToBlock = await User.findById(userId);
    if (!userToBlock) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add to blocked users
    await User.findByIdAndUpdate(blockerId, {
      $addToSet: { blockedUsers: userId },
      $pull: { friends: userId, following: userId, followers: userId }
    });

    // Remove from their friends/following/followers
    await User.findByIdAndUpdate(userId, {
      $pull: { friends: blockerId, following: blockerId, followers: blockerId }
    });

    res.status(200).json({ success: true, message: "User blocked successfully" });
  } catch (error) {
    console.error("Error in blockUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Unblock a user
export async function unblockUser(req, res) {
  try {
    const { userId } = req.params;
    const blockerId = req.user._id;

    await User.findByIdAndUpdate(blockerId, {
      $pull: { blockedUsers: userId }
    });

    res.status(200).json({ success: true, message: "User unblocked successfully" });
  } catch (error) {
    console.error("Error in unblockUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Update online status
export async function updateOnlineStatus(req, res) {
  try {
    const userId = req.user._id;
    const { isOnline } = req.body;

    await User.findByIdAndUpdate(userId, {
      isOnline,
      lastSeen: new Date()
    });

    res.status(200).json({ success: true, message: "Online status updated" });
  } catch (error) {
    console.error("Error in updateOnlineStatus:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}