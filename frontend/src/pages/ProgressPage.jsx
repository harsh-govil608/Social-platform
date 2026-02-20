import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import {
  Flame,
  Calendar,
  MessageCircle,
  Target,
  ChevronRight,
  CheckCircle2,
  Clock
} from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import { axiosInstance } from "../lib/axios";

const ProgressPage = () => {
  const { authUser } = useAuthUser();

  // Fetch user activity/progress
  const { data: activity, isLoading } = useQuery({
    queryKey: ["userActivity"],
    queryFn: async () => {
      const res = await axiosInstance.get("/activity/stats");
      return res.data;
    },
  });

  const streak = authUser?.streak || 0;
  const todayPracticed = activity?.todayPracticed || false;

  // Generate last 7 days for streak calendar
  // Mark days completed based on streak count backward from today
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const daysAgo = 6 - i; // 6 = oldest, 0 = today

    // If today is practiced, streak covers today + (streak-1) previous days
    // If not, streak covers yesterday + (streak-1) previous days
    let completed = false;
    if (todayPracticed) {
      completed = daysAgo < streak;
    } else {
      completed = daysAgo > 0 && daysAgo <= streak;
    }

    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      completed,
    };
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-base-100">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Progress</h1>
          <p className="text-base-content/70">
            Keep practicing daily to maintain your streak
          </p>
        </div>

        {/* Main Streak Card */}
        <div className="card bg-gradient-to-br from-orange-500 to-red-600 text-white mb-8">
          <div className="card-body items-center text-center py-12">
            <Flame className="size-20 mb-4 animate-pulse" />
            <h2 className="text-6xl font-bold mb-2">{streak}</h2>
            <p className="text-xl opacity-90">Day Streak</p>
            {streak > 0 && (
              <p className="text-sm opacity-75 mt-2">
                Keep it up! Practice today to continue.
              </p>
            )}
          </div>
        </div>

        {/* Weekly Calendar */}
        <div className="card bg-base-200 mb-8">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">
              <Calendar className="size-5" />
              This Week
            </h3>
            <div className="flex justify-between">
              {last7Days.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span className="text-xs opacity-70">{day.day}</span>
                  <div
                    className={`size-10 rounded-full flex items-center justify-center ${
                      day.completed
                        ? "bg-orange-500 text-white"
                        : "bg-base-300"
                    }`}
                  >
                    {day.completed ? (
                      <CheckCircle2 className="size-5" />
                    ) : (
                      <span className="text-sm">{day.date}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Today's Status */}
        <div className={`card mb-8 ${todayPracticed ? 'bg-success/10 border-success/30' : 'bg-warning/10 border-warning/30'} border`}>
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {todayPracticed ? (
                  <CheckCircle2 className="size-10 text-success" />
                ) : (
                  <Clock className="size-10 text-warning" />
                )}
                <div>
                  <h3 className="font-semibold text-lg">
                    {todayPracticed ? "Great job today!" : "Practice to keep your streak"}
                  </h3>
                  <p className="text-sm opacity-70">
                    {todayPracticed
                      ? "You've practiced today. Come back tomorrow!"
                      : "5 minutes with a real person counts"}
                  </p>
                </div>
              </div>
              {!todayPracticed && (
                <Link to="/practice" className="btn btn-warning">
                  Practice Now
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <h3 className="font-semibold text-lg mb-4">Ways to Practice</h3>
        <div className="space-y-3">
          <Link
            to="/practice"
            className="card bg-base-200 hover:bg-base-300 transition-colors cursor-pointer"
          >
            <div className="card-body p-4 flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <MessageCircle className="size-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Chat with a Friend</h4>
                  <p className="text-sm opacity-70">Practice writing in your target language</p>
                </div>
              </div>
              <ChevronRight className="size-5 opacity-50" />
            </div>
          </Link>

          <Link
            to="/conversation-practice"
            className="card bg-base-200 hover:bg-base-300 transition-colors cursor-pointer"
          >
            <div className="card-body p-4 flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-secondary/10 p-3 rounded-xl">
                  <Target className="size-6 text-secondary" />
                </div>
                <div>
                  <h4 className="font-semibold">5-Minute Scenario</h4>
                  <p className="text-sm opacity-70">Quick AI conversation practice</p>
                </div>
              </div>
              <ChevronRight className="size-5 opacity-50" />
            </div>
          </Link>
        </div>

        {/* Simple Stats */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : (
          <div className="mt-8">
            <h3 className="font-semibold text-lg mb-4">All Time</h3>
            <div className="stats stats-vertical sm:stats-horizontal shadow w-full bg-base-200">
              <div className="stat">
                <div className="stat-title">Best Streak</div>
                <div className="stat-value text-orange-500">{activity?.bestStreak || streak}</div>
                <div className="stat-desc">days</div>
              </div>
              <div className="stat">
                <div className="stat-title">Practice Sessions</div>
                <div className="stat-value text-primary">{activity?.totalSessions || 0}</div>
                <div className="stat-desc">completed</div>
              </div>
              <div className="stat">
                <div className="stat-title">Words Learned</div>
                <div className="stat-value text-secondary">{activity?.wordsLearned || 0}</div>
                <div className="stat-desc">new words</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressPage;
