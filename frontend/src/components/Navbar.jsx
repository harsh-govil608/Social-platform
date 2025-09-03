import { Link, useLocation } from "react-router";
import { BellIcon, LogOutIcon, ShipWheelIcon, UserIcon, SettingsIcon, HomeIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector.jsx";
import SearchBar from "./SearchBar.jsx";
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

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end w-full">
          {/* LOGO - ONLY IN THE CHAT PAGE */}
          {isChatPage && (
            <div className="pl-5">
              <Link to="/" className="flex items-center gap-2.5">
                <ShipWheelIcon className="size-9 text-primary" />
                <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
                  Streamify
                </span>
              </Link>
            </div>
          )}

          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            {/* Search Bar - Hidden on mobile */}
            <div className="hidden lg:block">
              <SearchBar />
            </div>

            {/* Quick navigation for mobile */}
            {!isChatPage && (
              <Link to="/" className="btn btn-ghost btn-circle lg:hidden">
                <HomeIcon className="h-5 w-5" />
              </Link>
            )}

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
                <li>
                  <a className="flex items-center gap-2">
                    <SettingsIcon className="h-4 w-4" />
                    Settings
                  </a>
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