import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Heart, MessageCircle, Share2, MoreVertical, Send, Bookmark,
  Flag, Globe, Users, Lock, VolumeX, Volume2,
  ChevronLeft, ChevronRight, Link2, Hash, Pencil, Trash2,
  CheckCircle2, X, Loader2,
} from 'lucide-react';
import { getFeedPosts, toggleLikePost, commentOnPost, sharePost, deletePost, editPost } from '../lib/api';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import useAuthUser from '../hooks/useAuthUser';
import { useNavigate } from 'react-router';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') ?? '';

// ─── Bookmarks (localStorage) ────────────────────────────────────────────────

const BK_KEY = 'langpal_bookmarks';
const getBookmarks = () => { try { return JSON.parse(localStorage.getItem(BK_KEY) || '[]'); } catch { return []; } };
const toggleBookmark = (postId) => {
  const bk = getBookmarks();
  const idx = bk.indexOf(postId);
  if (idx === -1) bk.push(postId); else bk.splice(idx, 1);
  localStorage.setItem(BK_KEY, JSON.stringify(bk));
  return idx === -1; // true = added
};

// ─── Visibility icon ──────────────────────────────────────────────────────────

const VisIcon = ({ vis }) => {
  if (vis === 'friends') return <Users className="size-3" />;
  if (vis === 'private') return <Lock className="size-3" />;
  return <Globe className="size-3" />;
};

// ─── Image Carousel ───────────────────────────────────────────────────────────

const ImageCarousel = ({ images }) => {
  const [idx, setIdx] = useState(0);
  if (!images?.length) return null;
  if (images.length === 1)
    return (
      <img src={`${API_BASE}${images[0]}`} alt="post"
        className="w-full max-h-96 object-cover rounded-xl cursor-pointer"
        onClick={() => window.open(`${API_BASE}${images[0]}`, '_blank')} />
    );
  return (
    <div className="relative rounded-xl overflow-hidden">
      <img src={`${API_BASE}${images[idx]}`} alt={`img ${idx + 1}`}
        className="w-full h-80 object-cover" />
      <button className="absolute left-2 top-1/2 -translate-y-1/2 btn btn-circle btn-sm bg-black/50 border-0 text-white"
        onClick={() => setIdx(i => (i - 1 + images.length) % images.length)}>
        <ChevronLeft className="size-4" />
      </button>
      <button className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-circle btn-sm bg-black/50 border-0 text-white"
        onClick={() => setIdx(i => (i + 1) % images.length)}>
        <ChevronRight className="size-4" />
      </button>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`} />
        ))}
      </div>
      <div className="absolute top-2 right-2 badge bg-black/50 text-white border-0 text-xs">
        {idx + 1}/{images.length}
      </div>
    </div>
  );
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────

const EditModal = ({ post, onClose, onSave }) => {
  const [content, setContent] = useState(post.content);
  const [visibility, setVisibility] = useState(post.visibility);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try { await onSave(content, visibility); onClose(); }
    catch { /* handled in parent */ }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="card bg-base-100 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="card-body gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Edit Post</h3>
            <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}><X className="size-4" /></button>
          </div>
          <textarea
            className="textarea textarea-bordered w-full min-h-32 resize-none"
            value={content} onChange={e => setContent(e.target.value)} maxLength={1000} />
          <div className="text-xs text-right text-base-content/40">{1000 - content.length} chars left</div>
          <select className="select select-bordered select-sm w-fit"
            value={visibility} onChange={e => setVisibility(e.target.value)}>
            <option value="public">🌍 Public</option>
            <option value="friends">👥 Friends</option>
            <option value="private">🔒 Only me</option>
          </select>
          <div className="flex gap-3 justify-end">
            <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary btn-sm gap-2" onClick={handleSave} disabled={saving || !content.trim()}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />} Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Post Card ────────────────────────────────────────────────────────────────

const reactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

const PostCard = ({ post, currentUserId }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [expandedComments, setExpandedComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(() => getBookmarks().includes(post._id));
  const [showEditModal, setShowEditModal] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [localLiked, setLocalLiked] = useState(
    post.likes?.some(l => (l._id || l) === currentUserId)
  );
  const [localLikeCount, setLocalLikeCount] = useState(post.likes?.length || 0);
  const [localComments, setLocalComments] = useState(post.comments || []);
  const reactionTimer = useRef(null);

  const isOwner = post.author._id === currentUserId;

  const { mutate: likeMut } = useMutation({
    mutationFn: () => toggleLikePost(post._id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feedPosts'] }),
  });

  const { mutate: commentMut, isPending: isCommenting } = useMutation({
    mutationFn: (text) => commentOnPost(post._id, text),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['feedPosts'] });
      setLocalComments(data.post?.comments || localComments);
      setCommentText('');
    },
  });

  const { mutate: shareMut } = useMutation({
    mutationFn: () => sharePost(post._id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['feedPosts'] }); toast.success('Shared in app!'); },
  });

  const { mutate: deleteMut } = useMutation({
    mutationFn: () => deletePost(post._id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['feedPosts'] }); toast.success('Post deleted'); },
  });

  const { mutate: editMut } = useMutation({
    mutationFn: ({ content, visibility }) => editPost(post._id, { content, visibility }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['feedPosts'] }); toast.success('Post updated!'); },
  });

  const handleLike = (reaction) => {
    setLocalLiked(v => !v);
    setLocalLikeCount(c => localLiked ? c - 1 : c + 1);
    likeMut();
    setShowReactions(false);
    if (reaction) toast(`Reacted with ${reaction}`, { duration: 1000 });
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    const optimistic = {
      _id: Date.now().toString(),
      user: { _id: currentUserId, fullName: 'You', profilePic: '' },
      text: commentText,
      createdAt: new Date().toISOString(),
    };
    setLocalComments(prev => [...prev, optimistic]);
    setExpandedComments(true);
    commentMut(commentText);
  };

  const handleShare = (platform) => {
    const url = `${window.location.origin}/post/${post._id}`;
    const text = post.content.slice(0, 100);
    if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
    else if (platform === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`);
    else if (platform === 'copy') { navigator.clipboard.writeText(url); toast.success('Link copied!'); }
    else shareMut();
  };

  const handleBookmark = () => {
    const added = toggleBookmark(post._id);
    setIsBookmarked(added);
    toast(added ? '🔖 Saved to bookmarks' : 'Removed from bookmarks', { duration: 1500 });
  };

  const visibleComments = expandedComments ? localComments : localComments.slice(0, 2);
  const hiddenCount = localComments.length - 2;

  return (
    <>
      {showEditModal && (
        <EditModal
          post={post}
          onClose={() => setShowEditModal(false)}
          onSave={(content, visibility) => new Promise((res, rej) =>
            editMut({ content, visibility }, { onSuccess: res, onError: rej })
          )}
        />
      )}

      <div className="card bg-base-100 shadow-md hover:shadow-lg border border-base-300 transition-shadow duration-200">
        <div className="card-body p-5 gap-0">

          {/* ── Header ── */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigate(`/profile/${post.author._id}`)}>
              <div className="avatar">
                <div className="w-11 rounded-full ring-2 ring-primary/20 ring-offset-base-100 ring-offset-1 group-hover:ring-primary transition-all">
                  <img src={post.author.profilePic} alt={post.author.fullName} />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-sm group-hover:text-primary transition-colors">{post.author.fullName}</p>
                  {post.author.isVerified && (
                    <span className="bg-primary text-primary-content text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">✓</span>
                  )}
                  {post.mood && <span className="text-base" title={post.mood}>{
                    { Happy:'😊', Sad:'😔', Angry:'😡', Tired:'😴', Thoughtful:'🤔', Celebrating:'🎉', Loved:'😍', Grateful:'🤗' }[post.mood] || ''
                  }</span>}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-base-content/50">
                  <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5 capitalize">
                    <VisIcon vis={post.visibility} />{post.visibility}
                  </span>
                </div>
              </div>
            </div>

            {/* Dropdown */}
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-xs btn-circle">
                <MoreVertical className="size-4" />
              </label>
              <ul tabIndex={0} className="dropdown-content z-20 menu p-2 shadow-xl bg-base-100 rounded-2xl w-48 border border-base-300 text-sm">
                {isOwner && (
                  <>
                    <li><button className="gap-2" onClick={() => setShowEditModal(true)}>
                      <Pencil className="size-4 text-primary" /> Edit Post
                    </button></li>
                    <li><button className="gap-2 text-error" onClick={() => {
                      if (confirm('Delete this post?')) deleteMut();
                    }}>
                      <Trash2 className="size-4" /> Delete
                    </button></li>
                    <li className="menu-title border-t border-base-300 mt-1 pt-1" />
                  </>
                )}
                <li><button className="gap-2" onClick={handleBookmark}>
                  <Bookmark className={`size-4 ${isBookmarked ? 'fill-current text-primary' : ''}`} />
                  {isBookmarked ? 'Remove Bookmark' : 'Save Post'}
                </button></li>
                <li><button className="gap-2 opacity-60" onClick={() => toast('Report sent', { duration: 1500 })}>
                  <Flag className="size-4" /> Report
                </button></li>
              </ul>
            </div>
          </div>

          {/* ── Content ── */}
          <div className="mb-4">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {post.tags.map((tag, i) => (
                  <span key={i} className="badge badge-ghost badge-sm gap-1 cursor-pointer hover:badge-primary transition-colors">
                    <Hash className="size-3" />{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Media ── */}
          {post.images?.length > 0 && (
            <div className="mb-4"><ImageCarousel images={post.images} /></div>
          )}
          {post.videos?.length > 0 && (
            <div className="mb-4 space-y-2">
              {post.videos.map((video, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden bg-black">
                  <video className="w-full max-h-80" controls muted={isMuted} poster={video.thumbnail}>
                    <source src={`${API_BASE}${video.url}`} type="video/mp4" />
                  </video>
                  <button className="absolute top-2 right-2 btn btn-xs btn-circle bg-black/60 border-0 text-white"
                    onClick={() => setIsMuted(m => !m)}>
                    {isMuted ? <VolumeX className="size-3" /> : <Volume2 className="size-3" />}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── Stats row ── */}
          <div className="flex items-center justify-between text-xs text-base-content/50 mb-3">
            <div className="flex items-center gap-3">
              <span>{localLikeCount > 0 && `${localLikeCount} ${localLikeCount === 1 ? 'like' : 'likes'}`}</span>
              {localComments.length > 0 && (
                <button className="hover:underline" onClick={() => setExpandedComments(v => !v)}>
                  {localComments.length} comments
                </button>
              )}
              {post.shares?.length > 0 && <span>{post.shares.length} shares</span>}
            </div>
          </div>

          <div className="border-t border-base-300 my-1" />

          {/* ── Action buttons ── */}
          <div className="flex items-center gap-1 py-1">
            {/* Like with reaction hover */}
            <div className="relative flex-1"
              onMouseEnter={() => { clearTimeout(reactionTimer.current); setShowReactions(true); }}
              onMouseLeave={() => { reactionTimer.current = setTimeout(() => setShowReactions(false), 300); }}>
              {showReactions && (
                <div className="absolute bottom-full mb-2 left-0 bg-base-100 shadow-2xl rounded-full px-3 py-2 flex gap-2 border border-base-300 z-10"
                  onMouseEnter={() => clearTimeout(reactionTimer.current)}
                  onMouseLeave={() => reactionTimer.current = setTimeout(() => setShowReactions(false), 300)}>
                  {reactions.map(r => (
                    <button key={r} className="text-xl hover:scale-125 transition-transform"
                      onClick={() => handleLike(r)}>{r}</button>
                  ))}
                </div>
              )}
              <button
                onClick={() => handleLike()}
                className={`btn btn-ghost btn-sm w-full gap-2 transition-all ${localLiked ? 'text-error' : ''}`}>
                <Heart className={`size-4 transition-transform ${localLiked ? 'fill-current scale-110' : ''}`} />
                <span className="text-xs">{localLiked ? 'Liked' : 'Like'}</span>
              </button>
            </div>

            <button
              onClick={() => setShowCommentBox(v => !v)}
              className={`btn btn-ghost btn-sm flex-1 gap-2 ${showCommentBox ? 'text-primary' : ''}`}>
              <MessageCircle className="size-4" />
              <span className="text-xs">Comment</span>
            </button>

            {/* Share dropdown */}
            <div className="dropdown dropdown-top dropdown-end flex-1">
              <label tabIndex={0} className="btn btn-ghost btn-sm w-full gap-2">
                <Share2 className="size-4" />
                <span className="text-xs">Share</span>
              </label>
              <ul tabIndex={0} className="dropdown-content z-10 menu p-2 shadow-xl bg-base-100 rounded-2xl w-48 border border-base-300 text-sm mb-2">
                <li><button onClick={() => handleShare('app')}>📲 Share in App</button></li>
                <li><button onClick={() => handleShare('twitter')}>🐦 Twitter / X</button></li>
                <li><button onClick={() => handleShare('whatsapp')}>💬 WhatsApp</button></li>
                <li><button className="gap-2" onClick={() => handleShare('copy')}>
                  <Link2 className="size-4" />Copy Link
                </button></li>
              </ul>
            </div>
          </div>

          {/* ── Comment box ── */}
          {showCommentBox && (
            <div className="mt-3 pt-3 border-t border-base-300">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <textarea
                    placeholder="Write a comment…"
                    className="textarea textarea-bordered textarea-sm w-full resize-none pr-10 min-h-[44px]"
                    rows={1}
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(); } }}
                  />
                  <button
                    className="absolute right-2 bottom-2 btn btn-ghost btn-xs btn-circle text-primary"
                    onClick={handleComment}
                    disabled={!commentText.trim() || isCommenting}>
                    {isCommenting ? <Loader2 className="size-3 animate-spin" /> : <Send className="size-3" />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-base-content/30 mt-1">Enter to send · Shift+Enter for new line</p>
            </div>
          )}

          {/* ── Comments list ── */}
          {localComments.length > 0 && (
            <div className="mt-4 space-y-3">
              {visibleComments.map((comment) => (
                <div key={comment._id} className="flex gap-2.5">
                  <div className="avatar shrink-0">
                    <div className="w-7 h-7 rounded-full bg-base-300">
                      {comment.user?.profilePic && <img src={comment.user.profilePic} alt="" />}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-base-200 rounded-2xl rounded-tl-sm px-3 py-2">
                      <p className="text-xs font-bold mb-0.5">{comment.user?.fullName || 'User'}</p>
                      <p className="text-sm">{comment.text}</p>
                    </div>
                    <p className="text-xs text-base-content/40 mt-1 ml-2">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
              {hiddenCount > 0 && !expandedComments && (
                <button className="text-xs text-primary font-semibold hover:underline ml-9"
                  onClick={() => setExpandedComments(true)}>
                  View {hiddenCount} more comment{hiddenCount > 1 ? 's' : ''}
                </button>
              )}
              {expandedComments && localComments.length > 2 && (
                <button className="text-xs text-base-content/40 hover:underline ml-9"
                  onClick={() => setExpandedComments(false)}>
                  Show less
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ─── Skeleton loader ──────────────────────────────────────────────────────────

const Skeleton = () => (
  <div className="card bg-base-100 shadow-md border border-base-300">
    <div className="card-body p-5">
      <div className="animate-pulse space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-base-300 rounded-full" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3.5 bg-base-300 rounded w-32" />
            <div className="h-3 bg-base-300 rounded w-24" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-base-300 rounded w-full" />
          <div className="h-3 bg-base-300 rounded w-5/6" />
          <div className="h-3 bg-base-300 rounded w-4/6" />
        </div>
        <div className="h-48 bg-base-300 rounded-xl" />
      </div>
    </div>
  </div>
);

// ─── Main Feed ────────────────────────────────────────────────────────────────

const FILTERS = [
  { id: 'all',      label: 'All',      emoji: '🌐' },
  { id: 'trending', label: 'Trending', emoji: '🔥' },
  { id: 'recent',   label: 'Recent',   emoji: '🕐' },
];

const EnhancedFeed = () => {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();
  const { authUser } = useAuthUser();

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['feedPosts', page],
    queryFn: () => getFeedPosts(page, 10),
    keepPreviousData: true,
    staleTime: 30_000,
  });

  const { posts: rawPosts = [], pagination } = data || {};

  // Client-side filter/sort
  const posts = (() => {
    if (filter === 'trending') return [...rawPosts].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
    if (filter === 'recent')   return [...rawPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return rawPosts;
  })();

  if (isLoading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} />)}</div>;

  if (error) return (
    <div className="alert alert-error rounded-2xl">
      <span>Error loading feed</span>
      <button className="btn btn-sm btn-ghost" onClick={() => queryClient.invalidateQueries({ queryKey: ['feedPosts'] })}>
        Retry
      </button>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Filter tabs */}
      <div className="flex gap-2 bg-base-100 p-1 rounded-2xl border border-base-300 shadow-sm">
        {FILTERS.map(f => (
          <button key={f.id}
            className={`flex-1 btn btn-sm rounded-xl gap-1.5 transition-all ${filter === f.id
              ? 'btn-primary shadow-md'
              : 'btn-ghost text-base-content/60 hover:text-base-content'}`}
            onClick={() => setFilter(f.id)}>
            <span>{f.emoji}</span>
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="card bg-base-200 border border-base-300 text-center p-10">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-bold mb-2">No posts yet</h3>
          <p className="text-base-content/60 text-sm">
            Follow people or create your first post to see content here!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard key={post._id} post={post} currentUserId={authUser?._id} />
          ))}
        </div>
      )}

      {isFetching && (
        <div className="flex justify-center py-4">
          <Loader2 className="animate-spin size-6 text-primary" />
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="join">
            <button className="join-item btn btn-sm" disabled={page === 1}
              onClick={() => setPage(p => p - 1)}>«</button>
            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => (
              <button key={i + 1}
                className={`join-item btn btn-sm ${page === i + 1 ? 'btn-primary' : ''}`}
                onClick={() => setPage(i + 1)}>{i + 1}</button>
            ))}
            <button className="join-item btn btn-sm" disabled={page === pagination.totalPages}
              onClick={() => setPage(p => p + 1)}>»</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedFeed;
