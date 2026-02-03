import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router";
import {
  MessageCircle,
  Video,
  Users,
  Clock,
  Flame,
  ChevronRight,
  UserPlus,
  Globe
} from "lucide-react";
import { getUserFriends, getRecommendedUsers, sendFriendRequest } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";

const PracticePage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("friends");

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { mutate: sendRequest, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
    },
  });

  // Filter users learning your native language (potential practice partners)
  const practicePartners = recommendedUsers.filter(
    user => user.learningLanguage === authUser?.nativeLanguage
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-base-100">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Practice Speaking</h1>
          <p className="text-base-content/70">
            Practice with real people to keep your streak alive
          </p>
        </div>

        {/* Quick Practice CTA */}
        <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content mb-8">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="card-title text-2xl mb-2">5-Minute Practice</h2>
                <p className="opacity-90">
                  Quick conversation practice with AI to warm up
                </p>
              </div>
              <Link
                to="/conversation-practice"
                className="btn btn-lg bg-white/20 hover:bg-white/30 border-0"
              >
                Start Now
                <ChevronRight className="size-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Streak Reminder */}
        <div className="alert bg-orange-500/10 border-orange-500/30 mb-6">
          <Flame className="size-6 text-orange-500" />
          <div>
            <p className="font-semibold">Keep your {authUser?.streak || 0} day streak!</p>
            <p className="text-sm opacity-70">Practice at least 5 minutes today with someone</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed mb-6 bg-base-200">
          <button
            className={`tab flex-1 ${activeTab === "friends" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("friends")}
          >
            <Users className="size-4 mr-2" />
            Friends ({friends.length})
          </button>
          <button
            className={`tab flex-1 ${activeTab === "find" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("find")}
          >
            <Globe className="size-4 mr-2" />
            Find Partners
          </button>
        </div>

        {/* Friends Tab */}
        {activeTab === "friends" && (
          <div className="space-y-4">
            {loadingFriends ? (
              <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg" />
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-12">
                <Users className="size-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-semibold mb-2">No friends yet</h3>
                <p className="text-base-content/70 mb-4">
                  Find practice partners to start learning together
                </p>
                <button
                  onClick={() => setActiveTab("find")}
                  className="btn btn-primary"
                >
                  Find Partners
                </button>
              </div>
            ) : (
              friends.map((friend) => (
                <div
                  key={friend._id}
                  className="card bg-base-200 hover:bg-base-300 transition-colors"
                >
                  <div className="card-body p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="avatar online">
                          <div className="w-14 rounded-full">
                            <img src={friend.profilePic} alt={friend.fullName} />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{friend.fullName}</h3>
                          <p className="text-sm text-base-content/70">
                            Speaks {friend.nativeLanguage} | Learning {friend.learningLanguage}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to={`/chat/${friend._id}`}
                          className="btn btn-primary btn-sm"
                        >
                          <MessageCircle className="size-4" />
                          Chat
                        </Link>
                        <Link
                          to={`/call/${friend._id}`}
                          className="btn btn-secondary btn-sm"
                        >
                          <Video className="size-4" />
                          Call
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Find Partners Tab */}
        {activeTab === "find" && (
          <div className="space-y-4">
            {practicePartners.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="badge badge-primary">Perfect Match</span>
                  They're learning {authUser?.nativeLanguage}!
                </h3>
                {practicePartners.map((user) => (
                  <div
                    key={user._id}
                    className="card bg-primary/10 border border-primary/30 mb-3"
                  >
                    <div className="card-body p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="avatar">
                            <div className="w-14 rounded-full">
                              <img src={user.profilePic} alt={user.fullName} />
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{user.fullName}</h3>
                            <p className="text-sm text-base-content/70">
                              Speaks {user.nativeLanguage} | Learning {user.learningLanguage}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => sendRequest(user._id)}
                          disabled={isPending}
                          className="btn btn-primary btn-sm"
                        >
                          <UserPlus className="size-4" />
                          Add Friend
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {loadingUsers ? (
              <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg" />
              </div>
            ) : recommendedUsers.length === 0 ? (
              <div className="text-center py-12">
                <Globe className="size-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-base-content/70">
                  Check back later for more practice partners
                </p>
              </div>
            ) : (
              <>
                <h3 className="font-semibold mb-3">Other Learners</h3>
                {recommendedUsers
                  .filter(u => !practicePartners.includes(u))
                  .map((user) => (
                    <div
                      key={user._id}
                      className="card bg-base-200 hover:bg-base-300 transition-colors"
                    >
                      <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="avatar">
                              <div className="w-14 rounded-full">
                                <img src={user.profilePic} alt={user.fullName} />
                              </div>
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{user.fullName}</h3>
                              <p className="text-sm text-base-content/70">
                                Speaks {user.nativeLanguage} | Learning {user.learningLanguage}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => sendRequest(user._id)}
                            disabled={isPending}
                            className="btn btn-outline btn-sm"
                          >
                            <UserPlus className="size-4" />
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticePage;
