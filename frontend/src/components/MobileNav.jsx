import { Link, useLocation } from "react-router";
import { CalendarCheck, MessageCircle, Newspaper, Trophy, User } from "lucide-react";

const MobileNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: '/daily-task', icon: CalendarCheck, label: 'Daily' },
    { path: '/feed', icon: Newspaper, label: 'Feed' },
    { path: '/practice', icon: MessageCircle, label: 'Practice' },
    { path: '/leaderboard', icon: Trophy, label: 'Ranks' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  // Hide on chat and call pages
  if (currentPath.startsWith('/chat') || currentPath.startsWith('/call')) {
    return null;
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-base-200 border-t border-base-300 z-30">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 ${
                isActive ? 'text-primary' : 'text-base-content/60'
              }`}
            >
              <Icon className={`size-6 ${isActive ? 'text-primary' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
