import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserFriends, getRecommendedUsers, sendFriendRequest, getFriendRequests, acceptFriendRequest } from "../lib/api";
import FriendCard from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import PageLoader from "../components/PageLoader";
import VideoChat from "../components/VideoChat";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { Video, UserCheck } from "lucide-react";

const FriendsPage = () => {
  const [activeTab, setActiveTab] = useState("friends");
  const [selectedFriendForCall, setSelectedFriendForCall] = useState(null);
  const queryClient = useQueryClient();

  // Fetch user's friends
  const {
    data: friends,
    isLoading: friendsLoading,
    error: friendsError,
  } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  // Fetch pending incoming friend requests
  const { data: friendRequestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });
  const incomingRequests = friendRequestsData?.incomingReqs || [];

  // Fetch recommended users
  const {
    data: recommendedUsers,
    isLoading: recommendedLoading,
    error: recommendedError,
    refetch: refetchRecommended,
  } = useQuery({
    queryKey: ["recommendedUsers"],
    queryFn: getRecommendedUsers,
  });

  const { mutate: acceptRequest, isPending: isAccepting } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      toast.success("Friend request accepted!");
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["recommendedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => toast.error("Failed to accept request"),
  });

  const handleSendFriendRequest = async (userId) => {
    try {
      await sendFriendRequest(userId);
      toast.success("Friend request sent!");
      refetchRecommended();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send friend request");
    }
  };

  const handleStartVideoCall = (friend) => {
    setSelectedFriendForCall(friend);
  };

  const handleCloseVideoCall = () => {
    setSelectedFriendForCall(null);
  };

  if (friendsLoading || recommendedLoading || requestsLoading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Friends</h1>
        <p className="text-base-content/70">
          Connect with language learners from around the world
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="tabs tabs-boxed mb-6 w-fit">
        <button
          className={`tab ${activeTab === "friends" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("friends")}
        >
          My Friends ({friends?.length || 0})
        </button>
        <button
          className={`tab ${activeTab === "requests" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("requests")}
        >
          Requests
          {incomingRequests.length > 0 && (
            <span className="badge badge-primary badge-sm ml-1">{incomingRequests.length}</span>
          )}
        </button>
        <button
          className={`tab ${activeTab === "discover" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("discover")}
        >
          Discover People
        </button>
      </div>

      {/* Friends Tab */}
      {activeTab === "friends" && (
        <div>
          {friendsError && (
            <div className="alert alert-error mb-4">
              <span>Failed to load friends</span>
            </div>
          )}
          
          {friends && friends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {friends.map((friend) => (
                <div key={friend._id} className="card bg-base-200 hover:shadow-md transition-shadow">
                  <div className="card-body p-4">
                    {/* USER INFO */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="avatar size-12">
                        <img src={friend.profilePic} alt={friend.fullName} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold truncate">{friend.fullName}</h3>
                        <p className="text-sm text-base-content/70">{friend.nativeLanguage} → {friend.learningLanguage}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="badge badge-secondary text-xs">
                        Native: {friend.nativeLanguage}
                      </span>
                      <span className="badge badge-outline text-xs">
                        Learning: {friend.learningLanguage}
                      </span>
                    </div>

                    <div className="text-sm text-base-content/70 mb-3">
                      <p className="truncate">{friend.bio}</p>
                      <p className="text-xs mt-1">📍 {friend.location}</p>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStartVideoCall(friend)}
                        className="btn btn-primary btn-sm flex-1 gap-1"
                        title="Start video call"
                      >
                        <Video className="w-4 h-4" />
                        Video Call
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        title="Send message"
                      >
                        💬
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <NoFriendsFound />
          )}
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === "requests" && (
        <div>
          {incomingRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold mb-2">No pending requests</h3>
              <p className="text-base-content/70">You have no incoming friend requests.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {incomingRequests.map((req) => (
                <div key={req._id} className="card bg-base-200 hover:shadow-md transition-shadow">
                  <div className="card-body p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="avatar size-12">
                        <img src={req.sender.profilePic || "/avatar.png"} alt={req.sender.fullName} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold truncate">{req.sender.fullName}</h3>
                        <p className="text-sm text-base-content/70">
                          {req.sender.nativeLanguage} → {req.sender.learningLanguage}
                        </p>
                      </div>
                    </div>
                    <button
                      className="btn btn-primary btn-sm w-full gap-1"
                      onClick={() => acceptRequest(req._id)}
                      disabled={isAccepting}
                    >
                      <UserCheck className="w-4 h-4" />
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Discover Tab */}
      {activeTab === "discover" && (
        <div>
          {recommendedError && (
            <div className="alert alert-error mb-4">
              <span>Failed to load recommended users</span>
            </div>
          )}
          
          {recommendedUsers && recommendedUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {recommendedUsers.map((user) => (
                <div key={user._id} className="card bg-base-200 hover:shadow-md transition-shadow">
                  <div className="card-body p-4">
                    {/* USER INFO */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="avatar size-12">
                        <img src={user.profilePic} alt={user.fullName} />
                      </div>
                      <h3 className="font-semibold truncate">{user.fullName}</h3>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="badge badge-secondary text-xs">
                        Native: {user.nativeLanguage}
                      </span>
                      <span className="badge badge-outline text-xs">
                        Learning: {user.learningLanguage}
                      </span>
                    </div>

                    <div className="text-sm text-base-content/70 mb-3">
                      <p className="truncate">{user.bio}</p>
                      <p className="text-xs mt-1">📍 {user.location}</p>
                    </div>

                    <button
                      onClick={() => handleSendFriendRequest(user._id)}
                      className="btn btn-primary btn-sm w-full"
                    >
                      Send Friend Request
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No recommendations available</h3>
              <p className="text-base-content/70">
                Check back later for new people to connect with!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Video Chat Modal */}
      {selectedFriendForCall && (
        <VideoChat 
          friend={selectedFriendForCall} 
          onClose={handleCloseVideoCall} 
        />
      )}
    </div>
  );
};

export default FriendsPage;
