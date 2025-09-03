import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreVertical, 
  Send,
  Bookmark,
  Flag,
  Eye,
  ThumbsUp,
  Laugh,
  HeartIcon,
  Frown,
  Globe,
  Users,
  Lock,
  Play,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Download,
  Link2,
  Hash
} from 'lucide-react';
import { getFeedPosts, toggleLikePost, commentOnPost, sharePost, deletePost } from '../lib/api';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import useAuthUser from '../hooks/useAuthUser';

const reactions = [
  { emoji: '👍', name: 'like', color: 'primary' },
  { emoji: '❤️', name: 'love', color: 'error' },
  { emoji: '😂', name: 'haha', color: 'warning' },
  { emoji: '😮', name: 'wow', color: 'info' },
  { emoji: '😢', name: 'sad', color: 'accent' },
  { emoji: '😡', name: 'angry', color: 'secondary' }
];

const PostCard = ({ post, currentUserId }) => {
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showReactions, setShowReactions] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [expandedComments, setExpandedComments] = useState(false);
  
  const queryClient = useQueryClient();
  const isOwner = post.author._id === currentUserId;

  const { mutate: likeMutation } = useMutation({
    mutationFn: () => toggleLikePost(post._id),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['feedPosts']);
    },
  });

  const { mutate: commentMutation, isPending: isCommenting } = useMutation({
    mutationFn: (text) => commentOnPost(post._id, text),
    onSuccess: () => {
      queryClient.invalidateQueries(['feedPosts']);
      setCommentText('');
      toast.success('Comment added!');
    },
  });

  const { mutate: shareMutation } = useMutation({
    mutationFn: () => sharePost(post._id),
    onSuccess: () => {
      queryClient.invalidateQueries(['feedPosts']);
      toast.success('Post shared!');
    },
  });

  const { mutate: deletePostMutation } = useMutation({
    mutationFn: () => deletePost(post._id),
    onSuccess: () => {
      queryClient.invalidateQueries(['feedPosts']);
      toast.success('Post deleted');
    },
  });

  const handleComment = () => {
    if (commentText.trim()) {
      commentMutation(commentText);
    }
  };

  const handleReaction = (reaction) => {
    likeMutation();
    setShowReactions(false);
    toast.success(`Reacted with ${reaction.emoji}`);
  };

  const handleShare = (platform) => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    const text = post.content.substring(0, 100);
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + postUrl)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(postUrl);
        toast.success('Link copied to clipboard!');
        break;
      default:
        shareMutation();
    }
    setShowShareMenu(false);
  };

  const visibilityIcon = {
    public: <Globe className="w-3 h-3" />,
    friends: <Users className="w-3 h-3" />,
    private: <Lock className="w-3 h-3" />
  };

  const userReacted = post.likes?.some(like => like._id === currentUserId);

  return (
    <div className="card bg-base-100 shadow-xl mb-6 hover:shadow-2xl transition-shadow">
      <div className="card-body p-4 sm:p-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="avatar cursor-pointer hover:scale-105 transition-transform">
              <div className="w-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img src={post.author.profilePic} alt={post.author.fullName} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold hover:underline cursor-pointer">
                  {post.author.fullName}
                </h3>
                {post.author.isVerified && (
                  <span className="badge badge-primary badge-xs">✓</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm opacity-60">
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  {visibilityIcon[post.visibility]}
                  {post.visibility}
                </span>
              </div>
            </div>
          </div>
          
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-sm btn-circle">
              <MoreVertical className="w-4 h-4" />
            </label>
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-300">
              {isOwner && (
                <>
                  <li>
                    <button className="text-error" onClick={() => deletePostMutation()}>
                      Delete Post
                    </button>
                  </li>
                  <li>
                    <button>Edit Post</button>
                  </li>
                </>
              )}
              <li>
                <button onClick={() => setIsBookmarked(!isBookmarked)}>
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  {isBookmarked ? 'Remove Bookmark' : 'Save Post'}
                </button>
              </li>
              <li>
                <button>
                  <Flag className="w-4 h-4" />
                  Report
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-base whitespace-pre-wrap">{post.content}</p>
          
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {post.tags.map((tag, index) => (
                <span key={index} className="badge badge-ghost gap-1 cursor-pointer hover:badge-primary">
                  <Hash className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <div className="mb-4 -mx-6 sm:mx-0">
            {post.images.length === 1 ? (
              <img
                src={`http://localhost:5001${post.images[0]}`}
                alt="Post content"
                className="w-full rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => window.open(`http://localhost:5001${post.images[0]}`, '_blank')}
              />
            ) : (
              <div className="relative">
                <div className="carousel w-full rounded-lg">
                  <img
                    src={`http://localhost:5001${post.images[currentImageIndex]}`}
                    alt={`Image ${currentImageIndex + 1}`}
                    className="w-full h-96 object-cover"
                  />
                </div>
                {post.images.length > 1 && (
                  <>
                    <button
                      className="absolute left-2 top-1/2 -translate-y-1/2 btn btn-circle btn-sm bg-black/50 text-white border-0"
                      onClick={() => setCurrentImageIndex((prev) => 
                        prev === 0 ? post.images.length - 1 : prev - 1
                      )}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-circle btn-sm bg-black/50 text-white border-0"
                      onClick={() => setCurrentImageIndex((prev) => 
                        (prev + 1) % post.images.length
                      )}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {post.images.map((_, idx) => (
                        <button
                          key={idx}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                          }`}
                          onClick={() => setCurrentImageIndex(idx)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Post Videos */}
        {post.videos && post.videos.length > 0 && (
          <div className="mb-4 space-y-2">
            {post.videos.map((video, index) => (
              <div key={index} className="relative rounded-lg overflow-hidden bg-black">
                <video
                  className="w-full max-h-96"
                  controls
                  muted={isMuted}
                  poster={video.thumbnail}
                >
                  <source src={`http://localhost:5001${video.url}`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <button
                  className="absolute top-2 right-2 btn btn-circle btn-sm bg-black/50 text-white border-0"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Post Stats */}
        <div className="flex items-center justify-between text-sm opacity-70 mb-3">
          <div className="flex items-center gap-4">
            <button className="hover:underline cursor-pointer">
              {post.likes.length} reactions
            </button>
            <button 
              className="hover:underline cursor-pointer"
              onClick={() => setExpandedComments(!expandedComments)}
            >
              {post.comments.length} comments
            </button>
            <span>{post.shares?.length || 0} shares</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>{post.views || Math.floor(Math.random() * 1000)} views</span>
          </div>
        </div>

        <div className="divider my-2"></div>

        {/* Post Actions */}
        <div className="flex items-center justify-between relative">
          {/* Reactions */}
          <div className="relative">
            <button
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setTimeout(() => setShowReactions(false), 300)}
              onClick={() => likeMutation()}
              className={`btn btn-ghost btn-sm gap-2 ${userReacted ? 'text-primary' : ''}`}
            >
              <Heart className={`w-4 h-4 ${userReacted ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">React</span>
            </button>
            
            {showReactions && (
              <div 
                className="absolute bottom-full mb-2 left-0 bg-base-100 rounded-full shadow-xl p-2 flex gap-1 border border-base-300"
                onMouseEnter={() => setShowReactions(true)}
                onMouseLeave={() => setShowReactions(false)}
              >
                {reactions.map((reaction) => (
                  <button
                    key={reaction.name}
                    className="text-2xl hover:scale-125 transition-transform"
                    onClick={() => handleReaction(reaction)}
                  >
                    {reaction.emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowCommentBox(!showCommentBox)}
            className="btn btn-ghost btn-sm gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Comment</span>
          </button>

          {/* Share Menu */}
          <div className="dropdown dropdown-top dropdown-end">
            <label 
              tabIndex={0} 
              className="btn btn-ghost btn-sm gap-2"
              onClick={() => setShowShareMenu(!showShareMenu)}
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </label>
            {showShareMenu && (
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 mb-2 border border-base-300">
                <li><button onClick={() => handleShare('facebook')}>Share to Facebook</button></li>
                <li><button onClick={() => handleShare('twitter')}>Share to Twitter</button></li>
                <li><button onClick={() => handleShare('whatsapp')}>Share to WhatsApp</button></li>
                <li><button onClick={() => handleShare('copy')}>
                  <Link2 className="w-4 h-4" />
                  Copy Link
                </button></li>
                <li><button onClick={() => handleShare('app')}>Share in App</button></li>
              </ul>
            )}
          </div>
        </div>

        {/* Comment Box */}
        {showCommentBox && (
          <div className="mt-4">
            <div className="flex gap-2">
              <div className="avatar">
                <div className="w-8 rounded-full">
                  <img src={currentUserId?.profilePic || '/default-avatar.png'} alt="You" />
                </div>
              </div>
              <div className="flex-1">
                <textarea
                  placeholder="Write a comment..."
                  className="textarea textarea-bordered w-full resize-none"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleComment()}
                  rows="2"
                />
                <div className="flex justify-end mt-2">
                  <button 
                    onClick={handleComment} 
                    className="btn btn-primary btn-sm"
                    disabled={!commentText.trim() || isCommenting}
                  >
                    {isCommenting ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Post
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comments Section */}
        {post.comments.length > 0 && (
          <div className="mt-4 space-y-3">
            {post.comments.slice(0, expandedComments ? undefined : 2).map((comment) => (
              <div key={comment._id} className="flex gap-3">
                <div className="avatar">
                  <div className="w-8 rounded-full">
                    <img src={comment.user.profilePic} alt={comment.user.fullName} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-base-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{comment.user.fullName}</p>
                      {comment.user.isVerified && (
                        <span className="badge badge-primary badge-xs">✓</span>
                      )}
                    </div>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1 ml-3 text-xs opacity-60">
                    <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                    <button className="hover:underline">Like</button>
                    <button className="hover:underline">Reply</button>
                  </div>
                </div>
              </div>
            ))}
            
            {post.comments.length > 2 && !expandedComments && (
              <button 
                className="text-sm text-primary hover:underline ml-11"
                onClick={() => setExpandedComments(true)}
              >
                View {post.comments.length - 2} more comments
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const EnhancedFeed = () => {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();
  const { authUser } = useAuthUser();

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['feedPosts', page, filter],
    queryFn: () => getFeedPosts(page),
    keepPreviousData: true,
  });

  const filters = [
    { id: 'all', label: 'All Posts', icon: Globe },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'trending', label: 'Trending', icon: '🔥' },
    { id: 'recent', label: 'Recent', icon: '🕐' }
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-base-300 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-base-300 rounded w-32"></div>
                    <div className="h-3 bg-base-300 rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-base-300 rounded w-full"></div>
                  <div className="h-4 bg-base-300 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error loading feed: {error.message}</span>
        <button className="btn btn-sm" onClick={() => queryClient.invalidateQueries(['feedPosts'])}>
          Retry
        </button>
      </div>
    );
  }

  const { posts = [], pagination } = data || {};

  if (posts.length === 0) {
    return (
      <div className="card bg-base-200 p-8 text-center">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
        <p className="opacity-70 mb-4">
          Start following people or create your first post to see content here!
        </p>
        <button className="btn btn-primary mx-auto">
          Find Friends
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Tabs */}
      <div className="tabs tabs-boxed mb-6">
        {filters.map(f => (
          <button
            key={f.id}
            className={`tab gap-2 ${filter === f.id ? 'tab-active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {typeof f.icon === 'string' ? (
              <span>{f.icon}</span>
            ) : (
              <f.icon className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{f.label}</span>
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            currentUserId={authUser?._id}
          />
        ))}
      </div>

      {/* Loading More Indicator */}
      {isFetching && (
        <div className="flex justify-center py-4">
          <span className="loading loading-spinner loading-md"></span>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <div className="join">
            <button
              className="join-item btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              «
            </button>
            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  className={`join-item btn ${page === pageNum ? 'btn-active' : ''}`}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              className="join-item btn"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedFeed;