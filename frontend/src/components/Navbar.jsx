import { Link, useLocation } from "react-router";
import { BellIcon, LogOutIcon, Zap, UserIcon, Flame } from "lucide-react";
import ThemeSelector from "./ThemeSelector.jsx";
import useLogout from "../hooks/useLogout";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUnreadNotificationCount } from "../lib/api";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");
  const queryClient = useQueryClient();

  const { logoutMutation } = useLogout();

  // Local extra count from real-time socket (resets when user visits /notifications)
  const [socketCount, setSocketCount] = useState(0);
  const isOnNotificationsPage = location.pathname === "/notifications";

  // Reset socket count when user visits notifications page
  useEffect(() => {
    if (isOnNotificationsPage) setSocketCount(0);
  }, [isOnNotificationsPage]);

  // Connect to socket for real-time notification badge
  useEffect(() => {
    if (!authUser?._id) return;

    const socketUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace("/api", "")
      : "http://localhost:5001";

    const socket = io(socketUrl, { withCredentials: true });

    socket.on("connect", () => {
      socket.emit("join-notifications", authUser._id);
    });

    socket.on("new-notification", () => {
      setSocketCount((c) => c + 1);
      // Also invalidate the query so count stays in sync
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
    });

    return () => socket.disconnect();
  }, [authUser?._id, queryClient]);

  // Get notification count from server (initial load + polling fallback)
  const { data: notificationData } = useQuery({
    queryKey: ["unreadNotifications"],
    queryFn: getUnreadNotificationCount,
    refetchInterval: 60000,
  });

  const baseCount = notificationData?.unreadCount || 0;
  const notificationCount = isOnNotificationsPage ? 0 : baseCount;
  const streak = authUser?.streak || 0;

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end w-full">
          {/* LOGO - visible on mobile (sidebar hidden) */}
          <div className="pl-5 lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <Zap className="size-7 text-primary" />
              <span className="text-xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                LangPal
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            {/* Streak indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 rounded-full">
              <Flame className="size-5 text-orange-500" />
              <span className="font-bold text-orange-500">{streak}</span>
            </div>

            {/* Notifications with badge */}
            <Link to="/notifications" className="btn btn-ghost btn-circle relative">
              <BellIcon className="h-6 w-6 text-base-content opacity-70" />
              {notificationCount > 0 && (
                <div className="badge badge-primary badge-sm absolute -top-1 -right-1">
                  {notificationCount}
                </div>
              )}
            </Link>

            {/* Theme Selector */}
            <ThemeSelector />

            {/* User Dropdown */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-9 rounded-full">
                  <img src={authUser?.profilePic} alt="User Avatar" rel="noreferrer" />
                </div>
              </div>
              <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-200 rounded-box w-52">
                <li className="menu-title">
                  <span>{authUser?.fullName}</span>
                </li>
                <li>
                  <Link to="/profile" className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    Profile
                  </Link>
                </li>
                <div className="divider my-1"></div>
                <li>
                  <button onClick={logoutMutation} className="flex items-center gap-2 text-error">
                    <LogOutIcon className="h-4 w-4" />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;