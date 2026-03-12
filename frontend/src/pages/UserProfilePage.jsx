import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserProfile,
  getUserPosts,
  followUser,
  unfollowUser,
  sendFriendRequest,
  blockUser,
  unblockUser,
} from '../lib/api';
import { axiosInstance } from '../lib/axios';
import {
  MapPin,
  Calendar,
  Globe,
  Users,
  UserPlus,
  UserMinus,
  Ban,
  MessageCircle,
  MoreVertical,
  BookOpen,
  Star,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import Feed from '../components/Feed';
import useAuthUser from '../hooks/useAuthUser';

const UserProfilePage = () => {
  const { userId } = useParams();
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('posts');

  const isOwnProfile = authUser?._id === userId;

  // Fetch user profile
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => getUserProfile(userId),
    enabled: !!userId,
  });

  const user = profileData?.user;

  // Fetch user posts
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['userPosts', userId],
    queryFn: () => getUserPosts(userId),
    enabled: !!userId && activeTab === 'posts',
  });

  // Mutations
  const { mutate: followMutation } = useMutation({
    mutationFn: followUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile', userId]);
      toast.success('User followed successfully');
    },
  });

  const { mutate: unfollowMutation } = useMutation({
    mutationFn: unfollowUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile', userId]);
      toast.success('User unfollowed successfully');
    },
  });

  const { mutate: sendFriendRequestMutation } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile', userId]);
      toast.success('Friend request sent');
    },
  });

  const { mutate: blockMutation } = useMutation({
    mutationFn: blockUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile', userId]);
      toast.success('User blocked');
    },
  });

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-8">
        <div className="alert alert-error">
          <span>User not found or profile is private</span>
        </div>
      </div>
    );
  }

  const isFollowing = user.followers?.some(f => f._id?.toString() === authUser?._id?.toString());
  const isFriend = user.friends?.some(f => f._id?.toString() === authUser?._id?.toString());
  const canSeeVocabulary = isOwnProfile || isFriend;

  // Fetch vocabulary (only when tab is active and user has access)
  const { data: vocabularyData, isLoading: vocabLoading } = useQuery({
    queryKey: ['userVocabulary', userId],
    queryFn: () => axiosInstance.get(`/vocabulary/user/${userId}`).then(r => r.data),
    enabled: !!userId && activeTab === 'vocabulary' && canSeeVocabulary,
  });

  return (
    <div className="container mx-auto max-w-6xl p-4">
      {/* Profile Header */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="avatar">
              <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img src={user.profilePic} alt={user.fullName} />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{user.fullName}</h1>
                {user.isVerified && (
                  <span className="badge badge-primary">Verified</span>
                )}
              </div>

              {user.bio && (
                <p className="text-base-content/70 mb-4">{user.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm">
                {user.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
                </div>
                {user.isOnline !== undefined && (
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-success' : 'bg-base-content/30'}`} />
                    <span>{user.isOnline ? 'Online' : `Last seen ${formatDistanceToNow(new Date(user.lastSeen), { addSuffix: true })}`}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="stats stats-horizontal shadow mt-4">
                <div className="stat px-4 py-2">
                  <div className="stat-title text-xs">Friends</div>
                  <div className="stat-value text-lg">{user.friends?.length || 0}</div>
                </div>
                <div className="stat px-4 py-2">
                  <div className="stat-title text-xs">Followers</div>
                  <div className="stat-value text-lg">{user.followers?.length || 0}</div>
                </div>
                <div className="stat px-4 py-2">
                  <div className="stat-title text-xs">Following</div>
                  <div className="stat-value text-lg">{user.following?.length || 0}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {!isOwnProfile && (
              <div className="flex flex-col gap-2">
                {isFriend ? (
                  <Link to={`/chat/${userId}`} className="btn btn-primary">
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </Link>
                ) : (
                  <button
                    onClick={() => sendFriendRequestMutation(userId)}
                    className="btn btn-primary"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add Friend
                  </button>
                )}

                {isFollowing ? (
                  <button
                    onClick={() => unfollowMutation(userId)}
                    className="btn btn-outline"
                  >
                    <UserMinus className="w-4 h-4" />
                    Unfollow
                  </button>
                ) : (
                  <button
                    onClick={() => followMutation(userId)}
                    className="btn btn-outline"
                  >
                    <UserPlus className="w-4 h-4" />
                    Follow
                  </button>
                )}

                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-ghost btn-sm">
                    <MoreVertical className="w-4 h-4" />
                  </label>
                  <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li>
                      <button onClick={() => blockMutation(userId)} className="text-error">
                        <Ban className="w-4 h-4" />
                        Block User
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Languages */}
      {(user.nativeLanguage || user.learningLanguage) && (
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title mb-4">Languages</h2>
            <div className="flex flex-wrap gap-3">
              {user.nativeLanguage && (
                <div className="badge badge-lg badge-primary">
                  Native: {user.nativeLanguage}
                </div>
              )}
              {user.learningLanguage && (
                <div className="badge badge-lg badge-secondary">
                  Learning: {user.learningLanguage}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interests */}
      {user.interests && user.interests.length > 0 && (
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title mb-4">Interests</h2>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest, index) => (
                <span key={index} className="badge badge-outline">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-6">
        <button
          className={`tab ${activeTab === 'posts' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </button>
        <button
          className={`tab ${activeTab === 'friends' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          Friends
        </button>
        <button
          className={`tab ${activeTab === 'followers' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('followers')}
        >
          Followers
        </button>
        {canSeeVocabulary && (
          <button
            className={`tab ${activeTab === 'vocabulary' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('vocabulary')}
          >
            <BookOpen className="w-4 h-4 mr-1" />
            Vocabulary
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'posts' && (
          <div>
            {postsLoading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : postsData?.posts?.length > 0 ? (
              <div>
                {postsData.posts.map(post => (
                  <div key={post._id} className="mb-4">
                    {/* You can create a PostCard component or reuse Feed component logic */}
                    <div className="card bg-base-100 shadow-xl">
                      <div className="card-body">
                        <p>{post.content}</p>
                        <div className="text-sm opacity-60">
                          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 opacity-60">
                No posts yet
              </div>
            )}
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.friends?.map(friend => (
              <Link
                key={friend._id}
                to={`/profile/${friend._id}`}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
              >
                <div className="card-body flex-row items-center gap-3">
                  <div className="avatar">
                    <div className="w-12 rounded-full">
                      <img src={friend.profilePic} alt={friend.fullName} />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">{friend.fullName}</p>
                  </div>
                </div>
              </Link>
            ))}
            {(!user.friends || user.friends.length === 0) && (
              <div className="col-span-full text-center py-8 opacity-60">
                No friends yet
              </div>
            )}
          </div>
        )}

        {activeTab === 'followers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.followers?.map(follower => (
              <Link
                key={follower._id}
                to={`/profile/${follower._id}`}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
              >
                <div className="card-body flex-row items-center gap-3">
                  <div className="avatar">
                    <div className="w-12 rounded-full">
                      <img src={follower.profilePic} alt={follower.fullName} />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">{follower.fullName}</p>
                  </div>
                </div>
              </Link>
            ))}
            {(!user.followers || user.followers.length === 0) && (
              <div className="col-span-full text-center py-8 opacity-60">
                No followers yet
              </div>
            )}
          </div>
        )}

        {activeTab === 'vocabulary' && canSeeVocabulary && (
          <div>
            {vocabLoading ? (
              <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : vocabularyData?.words?.length > 0 ? (
              <div>
                {/* Stats bar */}
                <div className="stats shadow w-full mb-6">
                  <div className="stat">
                    <div className="stat-figure text-primary">
                      <BookOpen className="w-8 h-8" />
                    </div>
                    <div className="stat-title">Total Words</div>
                    <div className="stat-value text-primary">{vocabularyData.words.length}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-figure text-success">
                      <Star className="w-8 h-8" />
                    </div>
                    <div className="stat-title">Mastered</div>
                    <div className="stat-value text-success">
                      {vocabularyData.words.filter(w => w.repetitions >= 5).length}
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-figure text-warning">
                      <Clock className="w-8 h-8" />
                    </div>
                    <div className="stat-title">Due Today</div>
                    <div className="stat-value text-warning">
                      {vocabularyData.words.filter(w => new Date(w.nextReviewDate) <= new Date()).length}
                    </div>
                  </div>
                </div>

                {/* Word list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {vocabularyData.words.map(word => {
                    const isMastered = word.repetitions >= 5;
                    const isDue = new Date(word.nextReviewDate) <= new Date();
                    return (
                      <div key={word._id} className="card bg-base-100 shadow border border-base-200 hover:border-primary transition-colors">
                        <div className="card-body p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-lg truncate">{word.word}</span>
                                {word.pronunciation && (
                                  <span className="text-xs text-base-content/50 italic">/{word.pronunciation}/</span>
                                )}
                              </div>
                              <p className="text-base-content/70 text-sm">{word.translation}</p>
                              {word.exampleSentence && (
                                <p className="text-xs text-base-content/50 mt-1 italic line-clamp-1">"{word.exampleSentence}"</p>
                              )}
                              <div className="flex items-center gap-2 mt-2 text-xs text-base-content/40">
                                <span>{word.sourceLanguage} → {word.targetLanguage}</span>
                                {word.category && word.category !== 'general' && (
                                  <span className="badge badge-xs badge-ghost">{word.category}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              {isMastered ? (
                                <span className="badge badge-success badge-sm gap-1">
                                  <Star className="w-3 h-3" /> Mastered
                                </span>
                              ) : isDue ? (
                                <span className="badge badge-warning badge-sm gap-1">
                                  <Clock className="w-3 h-3" /> Due
                                </span>
                              ) : (
                                <span className="badge badge-ghost badge-sm">Learning</span>
                              )}
                              <span className="text-xs text-base-content/40">×{word.repetitions || 0} reviews</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto opacity-20 mb-4" />
                <p className="text-base-content/50">
                  {isOwnProfile ? "You haven't added any vocabulary words yet." : `${user.fullName} hasn't added any vocabulary words yet.`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;