import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { uploadFields, handleUploadError } from "../middleware/upload.middleware.js";
import {
    createPost,
    getFeedPosts,
    getUserPosts,
    toggleLikePost,
    commentOnPost,
    deletePost,
    sharePost
} from "../controllers/post.controller.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Post CRUD operations with media upload
router.post("/", 
    uploadFields([
        { name: 'images', maxCount: 5 },
        { name: 'videos', maxCount: 2 }
    ]),
    handleUploadError,
    createPost
);
router.get("/", getFeedPosts); // Default route for getting posts
router.get("/feed", getFeedPosts);
router.get("/user/:userId", getUserPosts);
router.delete("/:postId", deletePost);

// Post interactions
router.post("/:postId/like", toggleLikePost);
router.post("/:postId/comment", commentOnPost);
router.post("/:postId/share", sharePost);

export default router;