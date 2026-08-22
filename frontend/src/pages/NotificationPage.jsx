import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link } from "react-router";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  acceptFriendRequest,
} from "../lib/api";
import {
  BellIcon,
  HeartIcon,
  MessageCircleIcon,
  Share2Icon,
  UserCheckIcon,
  UserPlusIcon,
  UserIcon,
  CheckCheckIcon,
} from "lucide-react";
import NoNotificationsFound from "../components/NoNotificationsFound";
import { formatDistanceToNow } from "date-fns";

const TYPE_CONFIG = {
  friend_request: { icon: UserPlusIcon, color: "text-primary", label: "Friend Request" },
  friend_accept: { icon: UserCheckIcon, color: "text-success", label: "New Connection" },
  post_like: { icon: HeartIcon, color: "text-error", label: "Liked your post" },
  post_comment: { icon: MessageCircleIcon, color: "text-info", label: "Commented on your post" },
  post_share: { icon: Share2Icon, color: "text-secondary", label: "Shared your post" },
  follow: { icon: UserIcon, color: "text-accent", label: "Started following you" },
  message: { icon: MessageCircleIcon, color: "text-primary", label: "Sent you a message" },
  mention: { icon: BellIcon, color: "text-warning", label: "Mentioned you" },
};

const NotificationsPage = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(1, 50),
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
    },
  });

  const { mutate: markOneRead } = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
    },
  });

  const { mutate: acceptRequest, isPending: isAccepting } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: (_, requestId) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["recommendedUsers"] });
    },
  });

  // Mark all as read when page mounts
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
  }, [queryClient]);

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <BellIcon className="h-7 w-7 text-primary" />
            Notifications
            {unreadCount > 0 && (
              <span className="badge badge-primary">{unreadCount} new</span>
            )}
          </h1>
          {unreadCount > 0 && (
            <button
              className="btn btn-ghost btn-sm gap-2"
              onClick={() => markAllRead()}
            >
              <CheckCheckIcon className="h-4 w-4" />
              Mark all read
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : notifications.length === 0 ? (
          <NoNotificationsFound />
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => {
              const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.message;
              const Icon = config.icon;
              const isFriendRequest = notif.type === "friend_request";

              return (
                <div
                  key={notif._id}
                  className={`card shadow-sm transition-all cursor-pointer ${
                    notif.isRead ? "bg-base-200" : "bg-base-200 border-l-4 border-primary"
                  }`}
                  onClick={() => !notif.isRead && markOneRead(notif._id)}
                >
                  <div className="card-body p-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="avatar shrink-0">
                        <div className="w-11 h-11 rounded-full">
                          <img
                            src={notif.sender?.profilePic || "/avatar.png"}
                            alt={notif.sender?.fullName}
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Icon className={`h-4 w-4 shrink-0 ${config.color}`} />
                          <p className="text-sm">
                            <span className="font-semibold">{notif.sender?.fullName}</span>{" "}
                            {notif.message.replace(notif.sender?.fullName, "").trim()}
                          </p>
                        </div>
                        <p className="text-xs opacity-50 mt-0.5">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                        </p>
                      </div>

                      {/* Action or unread dot */}
                      <div className="shrink-0">
                        {isFriendRequest && !notif.isRead ? (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              acceptRequest(notif.entityId);
                              markOneRead(notif._id);
                            }}
                            disabled={isAccepting}
                          >
                            Accept
                          </button>
                        ) : !notif.isRead ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-primary block" />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
