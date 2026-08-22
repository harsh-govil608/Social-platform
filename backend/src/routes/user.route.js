import express from "express";
import {protectRoute} from "../middleware/auth.middleware.js";
import {
    getMyFriends,
    getRecommendedUsers,
    sendFriendRequest,
    getOutgoingFriendReqs,
    acceptFriendRequest,
    getFriendRequests,
    searchUsers,
    getUserProfile,
    updateUserProfile,
    followUser,
    unfollowUser,
    blockUser,
    unblockUser,
    updateOnlineStatus
} from "../controllers/user.controller.js";
import { uploadSingle, handleUploadError, processUpload } from "../middleware/upload.middleware.js";
import User from "../models/User.js";
import { validateUpdateProfile, validateSearchQuery } from "../validators/user.validator.js";

const router = express.Router();

router.use(protectRoute);

// User discovery and search
router.get("/", getRecommendedUsers);
router.get("/search", validateSearchQuery, searchUsers);

// Profile management
router.get("/profile/:userId", getUserProfile);
router.patch("/profile", validateUpdateProfile, updateUserProfile);
router.post(
  "/profile-pic",
  uploadSingle("profilePic"),
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });
      const url = await processUpload(req.file, {
        folder: "streamify/profile-pics",
        public_id: `user-${req.user._id}`,
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
          { quality: "auto", fetch_format: "auto" },
        ],
      });
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { profilePic: url },
        { new: true }
      );
      res.status(200).json({ success: true, profilePic: updatedUser.profilePic });
    } catch (error) {
      console.error("Profile pic upload error:", error);
      res.status(500).json({ message: "Failed to upload profile picture" });
    }
  }
);

// Friends and connections
router.get("/friends", getMyFriends);
router.post("/friend-request/:id", sendFriendRequest);
router.post("/friend-request/:id/accept", acceptFriendRequest);
router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendReqs);

// Following system
router.post("/follow/:userId", followUser);
router.delete("/follow/:userId", unfollowUser);

// Blocking
router.post("/block/:userId", blockUser);
router.delete("/block/:userId", unblockUser);

// Status
router.patch("/status", updateOnlineStatus);

export default router;