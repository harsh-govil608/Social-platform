import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router";
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon, BellIcon, MessageSquareIcon } from "lucide-react";
import FriendCard from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import EnhancedFeed from "../components/EnhancedFeed";
import EnhancedCreatePost from "../components/EnhancedCreatePost";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
  });

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-base-100">
      <div className="container mx-auto max-w-7xl">
        {/* Welcome Section */}
        <div className="hero bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl mb-8 p-8">
          <div className="hero-content text-center">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold mb-4">
                Welcome to <span className="text-primary">Streamify</span>
              </h1>
              <p className="text-lg opacity-80 mb-6">
                Connect with language learners worldwide and practice together
              </p>
              <div className="stats stats-horizontal shadow bg-base-200">
                <div className="stat">
                  <div className="stat-figure text-primary">
                    <UsersIcon className="w-8 h-8" />
                  </div>
                  <div className="stat-title">Friends</div>
                  <div className="stat-value text-primary">{friends.length}</div>
                  <div className="stat-desc">Active connections</div>
                </div>
                <div className="stat">
                  <div className="stat-figure text-secondary">
                    <UserPlusIcon className="w-8 h-8" />
                  </div>
                  <div className="stat-title">Discover</div>
                  <div className="stat-value text-secondary">{recommendedUsers.length}</div>
                  <div className="stat-desc">New people to meet</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/friends" className="card bg-primary text-primary-content shadow-xl hover:shadow-2xl transition-all">
            <div className="card-body items-center text-center">
              <UsersIcon className="w-12 h-12 mb-2" />
              <h2 className="card-title">My Friends</h2>
              <p>Chat and practice together</p>
            </div>
          </Link>
          <Link to="/notifications" className="card bg-secondary text-secondary-content shadow-xl hover:shadow-2xl transition-all">
            <div className="card-body items-center text-center">
              <BellIcon className="w-12 h-12 mb-2" />
              <h2 className="card-title">Notifications</h2>
              <p>Friend requests & updates</p>
            </div>
          </Link>
          <Link to="/language-journey" className="card bg-accent text-accent-content shadow-xl hover:shadow-2xl transition-all">
            <div className="card-body items-center text-center">
              <MessageSquareIcon className="w-12 h-12 mb-2" />
              <h2 className="card-title">Start Learning</h2>
              <p>Begin your language journey</p>
            </div>
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Feed */}
          <div className="lg:col-span-2">
            <EnhancedCreatePost />
            <EnhancedFeed />
          </div>

          {/* Right Column - Friends and Recommendations */}
          <div className="space-y-6">
            {/* Friends Section */}
            <section className="card bg-base-100 shadow-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Your Friends</h3>
                <Link to="/friends" className="text-sm text-primary hover:underline">
                  See all
                </Link>
              </div>

              {loadingFriends ? (
                <div className="flex justify-center py-4">
                  <span className="loading loading-spinner loading-sm" />
                </div>
              ) : friends.length === 0 ? (
                <p className="text-sm opacity-70 text-center py-4">No friends yet</p>
              ) : (
                <div className="space-y-3">
                  {friends.slice(0, 5).map((friend) => (
                    <div key={friend._id} className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-10 rounded-full">
                          <img src={friend.profilePic} alt={friend.fullName} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{friend.fullName}</p>
                        <p className="text-xs opacity-70">
                          {friend.nativeLanguage} → {friend.learningLanguage}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Recommended Users Section */}
            <section className="card bg-base-100 shadow-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Discover People</h3>
                <Link to="/friends" className="text-sm text-primary hover:underline">
                  See all
                </Link>
              </div>

              {loadingUsers ? (
                <div className="flex justify-center py-4">
                  <span className="loading loading-spinner loading-sm" />
                </div>
              ) : recommendedUsers.length === 0 ? (
                <p className="text-sm opacity-70 text-center py-4">No recommendations available</p>
              ) : (
                <div className="space-y-3">
                  {recommendedUsers.slice(0, 3).map((user) => {
                    const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

                    return (
                      <div key={user._id} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="w-10 rounded-full">
                              <img src={user.profilePic} alt={user.fullName} />
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{user.fullName}</p>
                            <p className="text-xs opacity-70">
                              {user.nativeLanguage} → {user.learningLanguage}
                            </p>
                          </div>
                        </div>
                        <button
                          className={`btn btn-xs ${hasRequestBeenSent ? "btn-disabled" : "btn-primary"}`}
                          onClick={() => sendRequestMutation(user._id)}
                          disabled={hasRequestBeenSent || isPending}
                        >
                          {hasRequestBeenSent ? "Sent" : "Add"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div> {/* end space-y-6 */}
        </div> {/* end grid */}
      </div> {/* end container */}
  </div>
  );
};

export default HomePage;