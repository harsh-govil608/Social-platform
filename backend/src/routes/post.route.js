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
    editPost,
    sharePost
} from "../controllers/post.controller.js";
import { validateCreatePost, validatePostId, validateComment } from "../validators/post.validator.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 description: Post text content
 *               visibility:
 *                 type: string
 *                 enum: [public, friends, private]
 *                 default: public
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Up to 5 images
 *               videos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Up to 2 videos
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 post:
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 */
// Post CRUD operations with media upload
router.post("/", 
    uploadFields([
        { name: 'images', maxCount: 5 },
        { name: 'videos', maxCount: 2 }
    ]),
    handleUploadError,
    validateCreatePost,
    createPost
);

/**
 * @swagger
 * /api/posts/feed:
 *   get:
 *     summary: Get paginated feed posts
 *     tags: [Posts]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Posts per page
 *     responses:
 *       200:
 *         description: Feed posts returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *                 hasMore:
 *                   type: boolean
 *       401:
 *         description: Not authenticated
 */
router.get("/", getFeedPosts); // Default route for getting posts
router.get("/feed", getFeedPosts);
router.get("/user/:userId", getUserPosts);
router.delete("/:postId", deletePost);
router.patch("/:postId", validatePostId, editPost);

// Post interactions
router.post("/:postId/like", validatePostId, toggleLikePost);
router.post("/:postId/comment", validatePostId, validateComment, commentOnPost);
router.post("/:postId/share", validatePostId, sharePost);

export default router;
