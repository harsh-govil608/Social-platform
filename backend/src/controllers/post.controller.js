import Post from "../models/Post.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { deleteUploadedFiles, generateVideoThumbnail } from "../middleware/upload.middleware.js";

// Create a new post with media uploads
export async function createPost(req, res) {
    try {
        const { content, visibility } = req.body;
        const userId = req.user._id;

        if (!content || content.trim().length === 0) {
            // Clean up uploaded files if content is missing
            if (req.files) deleteUploadedFiles(req.files);
            return res.status(400).json({ message: "Post content is required" });
        }

        // Process uploaded files
        const images = [];
        const videos = [];
        
        if (req.files) {
            if (req.files.images) {
                req.files.images.forEach(file => {
                    images.push(`/uploads/images/${file.filename}`);
                });
            }
            
            if (req.files.videos) {
                for (const file of req.files.videos) {
                    const videoUrl = `/uploads/videos/${file.filename}`;
                    const thumbnail = await generateVideoThumbnail(file.path);
                    videos.push({
                        url: videoUrl,
                        thumbnail: thumbnail,
                        duration: null // Can be extracted using ffmpeg in production
                    });
                }
            }
        }

        const newPost = await Post.create({
            author: userId,
            content: content.trim(),
            images: images,
            videos: videos,
            visibility: visibility || 'public'
        });

        const populatedPost = await Post.findById(newPost._id)
            .populate('author', 'fullName profilePic isVerified');

        res.status(201).json({ success: true, post: populatedPost });
    } catch (error) {
        // Clean up uploaded files on error
        if (req.files) deleteUploadedFiles(req.files);
        console.error("Error in createPost:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Get feed posts (from friends and self)
export async function getFeedPosts(req, res) {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get user's friends and self
        const user = await User.findById(userId).select('friends');
        const feedUserIds = [...user.friends, userId];

        const posts = await Post.find({
            author: { $in: feedUserIds },
            isDeleted: false,
            $or: [
                { visibility: 'public' },
                { visibility: 'friends', author: { $in: feedUserIds } },
                { author: userId }
            ]
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'fullName profilePic isVerified')
            .populate('likes', 'fullName profilePic')
            .populate('comments.user', 'fullName profilePic');

        const totalPosts = await Post.countDocuments({
            author: { $in: feedUserIds },
            isDeleted: false
        });

        res.status(200).json({
            success: true,
            posts,
            pagination: {
                page,
                limit,
                totalPosts,
                totalPages: Math.ceil(totalPosts / limit)
            }
        });
    } catch (error) {
        console.error("Error in getFeedPosts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Get user's posts
export async function getUserPosts(req, res) {
    try {
        const { userId } = req.params;
        const requesterId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Check if requester can view posts
        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check privacy settings
        const isFriend = targetUser.friends.includes(requesterId);
        const isSelf = userId === requesterId.toString();

        let visibilityFilter = { isDeleted: false };
        if (!isSelf) {
            if (targetUser.privacySettings.profileVisibility === 'private') {
                return res.status(403).json({ message: "This profile is private" });
            } else if (targetUser.privacySettings.profileVisibility === 'friends' && !isFriend) {
                return res.status(403).json({ message: "Only friends can view this profile" });
            }
            visibilityFilter.visibility = isFriend ? { $in: ['public', 'friends'] } : 'public';
        }

        const posts = await Post.find({
            author: userId,
            ...visibilityFilter
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'fullName profilePic isVerified')
            .populate('likes', 'fullName profilePic')
            .populate('comments.user', 'fullName profilePic');

        const totalPosts = await Post.countDocuments({
            author: userId,
            ...visibilityFilter
        });

        res.status(200).json({
            success: true,
            posts,
            pagination: {
                page,
                limit,
                totalPosts,
                totalPages: Math.ceil(totalPosts / limit)
            }
        });
    } catch (error) {
        console.error("Error in getUserPosts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Like/Unlike a post
export async function toggleLikePost(req, res) {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const isLiked = post.likes.includes(userId);

        if (isLiked) {
            // Unlike
            post.likes = post.likes.filter(id => id.toString() !== userId.toString());
        } else {
            // Like
            post.likes.push(userId);

            // Create notification for post owner (if not self-like)
            if (post.author.toString() !== userId.toString()) {
                await Notification.create({
                    recipient: post.author,
                    sender: userId,
                    type: 'post_like',
                    entityId: postId,
                    entityModel: 'Post',
                    message: `${req.user.fullName} liked your post`
                });
            }
        }

        await post.save();

        const updatedPost = await Post.findById(postId)
            .populate('author', 'fullName profilePic isVerified')
            .populate('likes', 'fullName profilePic');

        res.status(200).json({
            success: true,
            post: updatedPost,
            isLiked: !isLiked
        });
    } catch (error) {
        console.error("Error in toggleLikePost:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Comment on a post
export async function commentOnPost(req, res) {
    try {
        const { postId } = req.params;
        const { text } = req.body;
        const userId = req.user._id;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ message: "Comment text is required" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comment = {
            user: userId,
            text: text.trim(),
            createdAt: new Date()
        };

        post.comments.push(comment);
        await post.save();

        // Create notification for post owner (if not self-comment)
        if (post.author.toString() !== userId.toString()) {
            await Notification.create({
                recipient: post.author,
                sender: userId,
                type: 'post_comment',
                entityId: postId,
                entityModel: 'Post',
                message: `${req.user.fullName} commented on your post`
            });
        }

        const updatedPost = await Post.findById(postId)
            .populate('author', 'fullName profilePic isVerified')
            .populate('comments.user', 'fullName profilePic');

        res.status(201).json({
            success: true,
            post: updatedPost
        });
    } catch (error) {
        console.error("Error in commentOnPost:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Delete a post
export async function deletePost(req, res) {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.author.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only delete your own posts" });
        }

        post.isDeleted = true;
        await post.save();

        res.status(200).json({ success: true, message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error in deletePost:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Share a post
export async function sharePost(req, res) {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const alreadyShared = post.shares.some(share => share.user.toString() === userId.toString());
        if (alreadyShared) {
            return res.status(400).json({ message: "You have already shared this post" });
        }

        post.shares.push({
            user: userId,
            sharedAt: new Date()
        });
        await post.save();

        // Create notification for post owner (if not self-share)
        if (post.author.toString() !== userId.toString()) {
            await Notification.create({
                recipient: post.author,
                sender: userId,
                type: 'post_share',
                entityId: postId,
                entityModel: 'Post',
                message: `${req.user.fullName} shared your post`
            });
        }

        res.status(200).json({ success: true, message: "Post shared successfully" });
    } catch (error) {
        console.error("Error in sharePost:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}