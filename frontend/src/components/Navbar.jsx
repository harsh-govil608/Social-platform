import { Link, useLocation } from "react-router";
import { BellIcon, LogOutIcon, Zap, UserIcon, Flame } from "lucide-react";
import ThemeSelector from "./ThemeSelector.jsx";
import useLogout from "../hooks/useLogout";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getUnreadNotificationCount } from "../lib/api";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");

  const { logoutMutation } = useLogout();

  // Get notification count
  const { data: notificationData } = useQuery({
    queryKey: ["unreadNotifications"],
    queryFn: getUnreadNotificationCount,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const notificationCount = notificationData?.unreadCount || 0;
  const streak = authUser?.streak || 0;

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end w-full">
          {/* LOGO - ONLY IN THE CHAT PAGE or mobile */}
          {(isChatPage || true) && (
            <div className="pl-5 lg:hidden">
              <Link to="/" className="flex items-center gap-2">
                <Zap className="size-7 text-primary" />
                <span className="text-xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                  LangPal
                </span>
              </Link>
            </div>
          )}

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