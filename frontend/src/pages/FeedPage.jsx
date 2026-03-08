import { Link } from "react-router";
import { Users, Trophy, Zap, BookOpen, Flame, TrendingUp, MessageCircle } from "lucide-react";
import EnhancedCreatePost from "../components/EnhancedCreatePost";
import EnhancedFeed from "../components/EnhancedFeed";
import useAuthUser from "../hooks/useAuthUser";

const UserCard = ({ user }) => (
  <div className="card bg-base-100 shadow-md border border-base-300">
    <div className="card-body p-5">
      <div className="h-14 -mx-5 -mt-5 rounded-t-2xl bg-gradient-to-r from-primary/30 to-secondary/30 mb-10 relative">
        <div className="absolute -bottom-8 left-4">
          <div className="avatar">
            <div className="w-16 rounded-full ring-4 ring-base-100">
              <img src={user?.profilePic} alt={user?.fullName} />
            </div>
          </div>
        </div>
      </div>
      <div>
        <p className="font-bold text-lg leading-tight">{user?.fullName}</p>
        <p className="text-sm text-base-content/50 capitalize">{user?.learningLanguage || "Language learner"}</p>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-2">
        {[
          { label: "Streak", value: `${user?.streak || 0}d`, icon: Flame, color: "text-orange-500" },
          { label: "XP",     value: user?.xp || 0,           icon: Zap,   color: "text-yellow-500" },
          { label: "Level",  value: user?.level || 1,         icon: Trophy, color: "text-primary" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="text-center">
            <Icon className={`size-4 ${color} mx-auto mb-0.5`} />
            <p className="font-bold text-sm">{value}</p>
            <p className="text-xs text-base-content/40">{label}</p>
          </div>
        ))}
      </div>
      <Link to="/profile" className="btn btn-sm btn-outline w-full mt-2">View Profile</Link>
    </div>
  </div>
);

const QuickLinks = () => (
  <div className="card bg-base-100 shadow-md border border-base-300">
    <div className="card-body p-5">
      <h3 className="font-bold text-xs uppercase tracking-widest text-base-content/40 mb-3">Quick Links</h3>
      <div className="space-y-0.5">
        {[
          { to: "/daily-task",    icon: BookOpen,      label: "Daily Vocabulary", color: "text-blue-500"   },
          { to: "/ai-tutor",      icon: MessageCircle, label: "AI Tutor",         color: "text-purple-500" },
          { to: "/leaderboard",   icon: Trophy,        label: "Leaderboard",      color: "text-yellow-500" },
          { to: "/find-partners", icon: Users,         label: "Find Partners",    color: "text-green-500"  },
          { to: "/progress",      icon: TrendingUp,    label: "My Progress",      color: "text-primary"    },
        ].map(({ to, icon: Icon, label, color }) => (
          <Link key={to} to={to}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-base-200 transition-colors group">
            <Icon className={`size-4 ${color} shrink-0`} />
            <span className="text-sm font-medium group-hover:text-primary transition-colors">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  </div>
);

const FeedPage = () => {
  const { authUser } = useAuthUser();
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-5">
          <EnhancedCreatePost />
          <EnhancedFeed />
        </div>
        <div className="hidden lg:flex flex-col gap-5 sticky top-20">
          <UserCard user={authUser} />
          <QuickLinks />
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
