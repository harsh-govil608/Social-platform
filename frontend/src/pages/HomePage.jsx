import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import {
  Flame,
  BookOpen,
  MessageCircle,
  ChevronRight,
  CheckCircle2,
  Clock,
  Sparkles
} from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import { getUserFriends } from "../lib/api";
import { axiosInstance } from "../lib/axios";

const HomePage = () => {
  const { authUser } = useAuthUser();

  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: activity } = useQuery({
    queryKey: ["todayActivity"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/activity/today");
        return res.data;
      } catch {
        return { lessonCompleted: false, practiceCompleted: false };
      }
    },
  });

  const streak = authUser?.streak || 0;
  const lessonDone = activity?.lessonCompleted || false;
  const practiceDone = activity?.practiceCompleted || false;
  const allDone = lessonDone && practiceDone;

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-base-100">
      <div className="container mx-auto max-w-2xl">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">
            Hey, {authUser?.fullName?.split(' ')[0]}!
          </h1>
          <p className="text-base-content/70">
            {allDone
              ? "Amazing work today! Come back tomorrow."
              : "Complete your daily practice to keep your streak."}
          </p>
        </div>

        {/* Streak Card */}
        <div className="card bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 mb-8">
          <div className="card-body py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-orange-500 p-4 rounded-2xl">
                  <Flame className="size-8 text-white" />
                </div>
                <div>
                  <p className="text-4xl font-bold text-orange-500">{streak}</p>
                  <p className="text-sm opacity-70">day streak</p>
                </div>
              </div>
              {!allDone && (
                <div className="text-right">
                  <p className="text-sm font-medium">Today's goal</p>
                  <p className="text-xs opacity-70">Learn + Practice</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Daily Tasks */}
        <h2 className="font-semibold text-lg mb-4">Today's Tasks</h2>
        <div className="space-y-4 mb-8">
          {/* Learn Task */}
          <Link
            to="/language-journey"
            className={`card transition-all ${
              lessonDone
                ? "bg-success/10 border-success/30 border"
                : "bg-base-200 hover:bg-base-300"
            }`}
          >
            <div className="card-body p-5 flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                  lessonDone ? "bg-success/20" : "bg-primary/10"
                }`}>
                  {lessonDone ? (
                    <CheckCircle2 className="size-7 text-success" />
                  ) : (
                    <BookOpen className="size-7 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {lessonDone ? "Lesson Complete!" : "Today's Lesson"}
                  </h3>
                  <p className="text-sm opacity-70">
                    {lessonDone
                      ? "Great job learning today"
                      : `Learn new ${authUser?.learningLanguage || "words"} vocabulary`}
                  </p>
                </div>
              </div>
              {!lessonDone && <ChevronRight className="size-5 opacity-50" />}
            </div>
          </Link>

          {/* Practice Task */}
          <Link
            to="/practice"
            className={`card transition-all ${
              practiceDone
                ? "bg-success/10 border-success/30 border"
                : "bg-base-200 hover:bg-base-300"
            }`}
          >
            <div className="card-body p-5 flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                  practiceDone ? "bg-success/20" : "bg-secondary/10"
                }`}>
                  {practiceDone ? (
                    <CheckCircle2 className="size-7 text-success" />
                  ) : (
                    <MessageCircle className="size-7 text-secondary" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {practiceDone ? "Practice Complete!" : "Practice Speaking"}
                  </h3>
                  <p className="text-sm opacity-70">
                    {practiceDone
                      ? "You practiced with someone today"
                      : friends.length > 0
                        ? `Chat with one of your ${friends.length} friends`
                        : "5-minute conversation practice"}
                  </p>
                </div>
              </div>
              {!practiceDone && <ChevronRight className="size-5 opacity-50" />}
            </div>
          </Link>
        </div>

        {/* Status Message */}
        {allDone ? (
          <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content mb-8">
            <div className="card-body items-center text-center py-8">
              <Sparkles className="size-12 mb-2" />
              <h3 className="text-xl font-bold">All done for today!</h3>
              <p className="opacity-90">
                Your streak is safe. See you tomorrow!
              </p>
            </div>
          </div>
        ) : (
          <div className="alert bg-base-200 mb-8">
            <Clock className="size-5" />
            <div>
              <p className="font-medium">
                {!lessonDone && !practiceDone
                  ? "Complete both tasks to keep your streak"
                  : lessonDone
                    ? "One more to go! Practice with someone"
                    : "One more to go! Complete today's lesson"}
              </p>
            </div>
          </div>
        )}

        {/* Quick Practice with Friends */}
        {friends.length > 0 && !practiceDone && (
          <div>
            <h2 className="font-semibold text-lg mb-4">Practice Partners</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {friends.slice(0, 4).map((friend) => (
                <Link
                  key={friend._id}
                  to={`/chat/${friend._id}`}
                  className="flex flex-col items-center gap-2 min-w-fit"
                >
                  <div className="avatar online">
                    <div className="w-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                      <img src={friend.profilePic} alt={friend.fullName} />
                    </div>
                  </div>
                  <span className="text-sm font-medium">
                    {friend.fullName.split(' ')[0]}
                  </span>
                </Link>
              ))}
              <Link
                to="/practice"
                className="flex flex-col items-center justify-center gap-2 min-w-fit"
              >
                <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center">
                  <ChevronRight className="size-6 opacity-50" />
                </div>
                <span className="text-sm opacity-70">See all</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
