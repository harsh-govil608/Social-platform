import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, MessageCircle, Share2, MoreVertical, Send } from 'lucide-react';
import { getFeedPosts, toggleLikePost, commentOnPost, sharePost, deletePost } from '../lib/api';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const PostCard = ({ post, onDelete }) => {
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState('');
  // Local optimistic state so comment count updates instantly
  const [localCommentCount, setLocalCommentCount] = useState(post.comments.length);
  const [localComments, setLocalComments] = useState(post.comments);
  const queryClient = useQueryClient();

  // Sync local state when server data arrives
  if (post.comments.length !== localCommentCount && !commentText) {
    setLocalCommentCount(post.comments.length);
    setLocalComments(post.comments);
  }

  const { mutate: likeMutation } = useMutation({
    mutationFn: () => toggleLikePost(post._id),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['feedPosts']);
      toast.success(data.isLiked ? 'Post liked!' : 'Post unliked');
    },
  });

  const { mutate: commentMutation } = useMutation({
    mutationFn: (text) => commentOnPost(post._id, text),
    onSuccess: () => {
      queryClient.invalidateQueries(['feedPosts']);
      setCommentText('');
      setShowCommentBox(false);
      toast.success('Comment added!');
    },
    onError: () => {
      // Revert optimistic update
      setLocalCommentCount(post.comments.length);
      setLocalComments(post.comments);
      toast.error('Failed to add comment');
    },
  });

  const { mutate: shareMutation } = useMutation({
    mutationFn: () => sharePost(post._id),
    onSuccess: () => {
      queryClient.invalidateQueries(['feedPosts']);
      toast.success('Post shared!');
    },
  });

  const handleComment = () => {
    if (!commentText.trim()) return;
    // Optimistically update count and comment list immediately
    const optimisticComment = {
      _id: `temp-${Date.now()}`,
      user: { fullName: 'You', profilePic: '' },
      text: commentText,
      createdAt: new Date().toISOString(),
    };
    setLocalCommentCount((c) => c + 1);
    setLocalComments((prev) => [...prev, optimisticComment]);
    commentMutation(commentText);
  };

  return (
    <div className="card bg-base-100 shadow-xl mb-6">
      <div className="card-body">
        {/* Post Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-12 rounded-full">
                <img src={post.author.profilePic} alt={post.author.fullName} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{post.author.fullName}</h3>
                {post.author.isVerified && (
                  <span className="badge badge-primary badge-xs">Verified</span>
                )}
              </div>
              <p className="text-sm opacity-60">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-sm btn-circle">
              <MoreVertical className="w-4 h-4" />
            </label>
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
              {onDelete && (
                <li>
                  <button onClick={() => onDelete(post._id)}>Delete Post</button>
                </li>
              )}
              <li>
                <button>Report</button>
              </li>
            </ul>
          </div>
        </div>

        {/* Post Content */}
        <p className="mb-4">{post.content}</p>

        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {post.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Post image ${index + 1}`}
                className="rounded-lg w-full h-48 object-cover"
              />
            ))}
          </div>
        )}

        {/* Post Stats */}
        <div className="flex items-center gap-6 text-sm opacity-70 mb-4">
          <span>{post.likes.length} likes</span>
          <span>{localCommentCount} comments</span>
          <span>{post.shares.length} shares</span>
        </div>

        {/* Post Actions */}
        <div className="flex items-center justify-between border-t border-b py-2">
          <button
            onClick={() => likeMutation()}
            className={`btn btn-ghost btn-sm gap-2 ${
              post.likes.some(like => like._id === post.currentUserId) ? 'text-primary' : ''
            }`}
          >
            <Heart className="w-4 h-4" />
            Like
          </button>
          <button
            onClick={() => setShowCommentBox(!showCommentBox)}
            className="btn btn-ghost btn-sm gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Comment
          </button>
          <button onClick={() => shareMutation()} className="btn btn-ghost btn-sm gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        {/* Comment Box */}
        {showCommentBox && (
          <div className="flex gap-2 mt-4">
            <input
              type="text"
              placeholder="Write a comment..."
              className="input input-bordered flex-1"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleComment()}
            />
            <button onClick={handleComment} className="btn btn-primary btn-circle">
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Comments Section */}
        {localComments.length > 0 && (
          <div className="mt-4 space-y-3">
            {localComments.slice(0, 3).map((comment) => (
              <div key={comment._id} className="flex gap-3">
                <div className="avatar">
                  <div className="w-8 rounded-full">
                    <img src={comment.user?.profilePic || ''} alt={comment.user?.fullName} />
                  </div>
                </div>
                <div className="flex-1 bg-base-200 rounded-lg p-3">
                  <p className="font-semibold text-sm">{comment.user?.fullName}</p>
                  <p className="text-sm">{comment.text}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
            {localComments.length > 3 && (
              <button className="text-sm text-primary hover:underline">
                View all {localCommentCount} comments
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Feed = () => {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['feedPosts', page],
    queryFn: () => getFeedPosts(page),
    keepPreviousData: true,
  });

  const { mutate: deletePostMutation } = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries(['feedPosts']);
      toast.success('Post deleted successfully');
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error loading feed: {error.message}</span>
      </div>
    );
  }

  const { posts = [], pagination } = data || {};

  if (posts.length === 0) {
    return (
      <div className="card bg-base-200 p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
        <p className="opacity-70">
          Start following people or create your first post to see content here!
        </p>
      </div>
    );
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          onDelete={post.isOwner ? deletePostMutation : null}
        />
      ))}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            className="btn btn-sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="flex items-center px-4">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            className="btn btn-sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page === pagination.totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Feed;