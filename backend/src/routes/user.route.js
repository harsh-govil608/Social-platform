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

const router = express.Router();

router.use(protectRoute);

// User discovery and search
router.get("/", getRecommendedUsers);
router.get("/search", searchUsers);

// Profile management
router.get("/profile/:userId", getUserProfile);
router.patch("/profile", updateUserProfile);

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