import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import {
  Flame,
  CalendarCheck,
  MessageCircle,
  ChevronRight,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  Users,
  Brain,
  Star,
} from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import { getUserFriends } from "../lib/api";
import { axiosInstance } from "../lib/axios";
import { getWordOfDay, getEnglishWordOfDay } from "../lib/learningApi";

const HomePage = () => {
  const { authUser } = useAuthUser();

  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: todayTask } = useQuery({
    queryKey: ["todayTask"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/daily-task/today");
        return res.data;
      } catch {
        return { task: null, currentStep: "taskStart" };
      }
    },
  });

  const { data: wordOfDay } = useQuery({
    queryKey: ["wordOfDay"],
    queryFn: getWordOfDay,
  });

  const { data: englishWOTD, isLoading: englishWOTDLoading } = useQuery({
    queryKey: ["englishWordOfDay"],
    queryFn: getEnglishWordOfDay,
    staleTime: 1000 * 60 * 60, // 1 hour — word changes once a day
  });

  const streak = authUser?.streak || 0;
  const taskCompleted = todayTask?.task?.status === "completed";
  const taskStep = todayTask?.currentStep || "taskStart";
  const wotdCompleted = wordOfDay?.alreadyCompleted;

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-base-100">
      <div className="container mx-auto max-w-2xl">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">
            Hey, {authUser?.fullName?.split(' ')[0]}!
          </h1>
          <p className="text-base-content/70">
            {taskCompleted
              ? "Amazing work today! Come back tomorrow."
              : "Did you show up today? Complete your daily task."}
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
              {!taskCompleted && (
                <div className="text-right">
                  <p className="text-sm font-medium">Today's goal</p>
                  <p className="text-xs opacity-70">Just 10 minutes</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Word of the Day — English (Merriam-Webster) */}
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <BookOpen className="size-5 text-secondary" />
          Word of the Day
        </h2>
        {englishWOTDLoading ? (
          <div className="card bg-gradient-to-r from-secondary/10 to-accent/10 border border-secondary/20 mb-4 animate-pulse">
            <div className="card-body p-5">
              <div className="h-4 bg-base-300 rounded w-1/4 mb-3" />
              <div className="h-6 bg-base-300 rounded w-1/3 mb-2" />
              <div className="h-3 bg-base-300 rounded w-3/4" />
            </div>
          </div>
        ) : (
          <div className="card bg-gradient-to-r from-secondary/10 to-accent/10 border border-secondary/30 mb-4">
            <div className="card-body p-5">
              <div className="flex items-start gap-4">
                <div className="bg-secondary/20 p-3 rounded-2xl shrink-0">
                  <BookOpen className="size-7 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="font-bold text-2xl text-secondary leading-tight">
                      {englishWOTD?.word?.word || "—"}
                    </p>
                    {englishWOTD?.word?.pronunciation && (
                      <span className="text-sm text-base-content/50 font-mono">
                        /{englishWOTD.word.pronunciation}/
                      </span>
                    )}
                    {englishWOTD?.word?.partOfSpeech && (
                      <span className="badge badge-ghost badge-sm italic">
                        {englishWOTD.word.partOfSpeech}
                      </span>
                    )}
                  </div>
                  {englishWOTD?.word?.definition && (
                    <p className="text-sm text-base-content/70 mt-1 leading-relaxed line-clamp-3">
                      {englishWOTD.word.definition}
                    </p>
                  )}
                  {englishWOTD?.word?.example && (
                    <p className="text-xs text-base-content/50 mt-2 italic">
                      "{englishWOTD.word.example}"
                    </p>
                  )}
                  <p className="text-xs text-base-content/30 mt-2">
                    Source: Merriam-Webster
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Language Practice Word — Write a sentence for XP */}
        {wordOfDay?.word && (
          <Link
            to="/word-of-day"
            className={`card transition-all mb-8 ${
              wotdCompleted
                ? "bg-success/10 border border-success/30"
                : "bg-base-200 border border-base-300 hover:border-secondary/40"
            }`}
          >
            <div className="card-body p-4 flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${wotdCompleted ? "bg-success/20" : "bg-secondary/10"}`}>
                  {wotdCompleted ? (
                    <CheckCircle2 className="size-5 text-success" />
                  ) : (
                    <Star className="size-5 text-secondary" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm">{wordOfDay.word.word}</p>
                  <p className="text-xs text-base-content/50">{wordOfDay.word.translation}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {wotdCompleted ? (
                  <span className="badge badge-success badge-sm">+{wordOfDay.completion?.xpAwarded || 20} XP</span>
                ) : (
                  <span className="text-xs text-base-content/40">Write a sentence → +20 XP</span>
                )}
                {!wotdCompleted && <ChevronRight className="size-5 text-base-content/30" />}
              </div>
            </div>
          </Link>
        )}

        {/* Daily Task - Primary CTA */}
        <h2 className="font-semibold text-lg mb-4">Today's Task</h2>
        <Link
          to="/daily-task"
          className={`card transition-all mb-6 ${
            taskCompleted
              ? "bg-success/10 border-success/30 border"
              : "bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 hover:border-primary/60"
          }`}
        >
          <div className="card-body p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${
                  taskCompleted ? "bg-success/20" : "bg-primary/20"
                }`}>
                  {taskCompleted ? (
                    <CheckCircle2 className="size-8 text-success" />
                  ) : (
                    <CalendarCheck className="size-8 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-xl">
                    {taskCompleted ? "Completed!" : "Start Daily Task"}
                  </h3>
                  <p className="text-sm opacity-70">
                    {taskCompleted
                      ? "You showed up today. Streak is safe!"
                      : taskStep === "taskStart"
                        ? "5-10 minute guided practice"
                        : `Continue from: ${taskStep === "aiPractice" ? "AI Practice" : taskStep === "partnerOffer" ? "Partner Step" : "Finish Up"}`}
                  </p>
                </div>
              </div>
              {!taskCompleted && <ChevronRight className="size-6 text-primary" />}
            </div>
          </div>
        </Link>

        {/* Quick Actions */}
        <h2 className="font-semibold text-lg mb-4">Quick Actions</h2>
        <div className="space-y-3 mb-8">
          <Link
            to="/vocabulary"
            className="card bg-base-200 hover:bg-base-300 transition-colors"
          >
            <div className="card-body p-4 flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-secondary/10 p-3 rounded-xl">
                  <BookOpen className="size-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold">Vocabulary Review</h3>
                  <p className="text-sm opacity-70">Spaced repetition flashcards</p>
                </div>
              </div>
              <ChevronRight className="size-5 opacity-50" />
            </div>
          </Link>

          <Link
            to="/ai-tutor"
            className="card bg-base-200 hover:bg-base-300 transition-colors"
          >
            <div className="card-body p-4 flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-accent/10 p-3 rounded-xl">
                  <Brain className="size-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Tutor</h3>
                  <p className="text-sm opacity-70">Get corrections & suggestions</p>
                </div>
              </div>
              <ChevronRight className="size-5 opacity-50" />
            </div>
          </Link>

          <Link
            to="/conversation-practice"
            className="card bg-base-200 hover:bg-base-300 transition-colors"
          >
            <div className="card-body p-4 flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-info/10 p-3 rounded-xl">
                  <MessageCircle className="size-6 text-info" />
                </div>
                <div>
                  <h3 className="font-semibold">Conversation Practice</h3>
                  <p className="text-sm opacity-70">5-minute AI scenario</p>
                </div>
              </div>
              <ChevronRight className="size-5 opacity-50" />
            </div>
          </Link>

          <Link
            to="/find-partners"
            className="card bg-base-200 hover:bg-base-300 transition-colors"
          >
            <div className="card-body p-4 flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <Users className="size-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Find a Partner</h3>
                  <p className="text-sm opacity-70">
                    {friends.length > 0
                      ? `${friends.length} friends available`
                      : "Connect with learners"}
                  </p>
                </div>
              </div>
              <ChevronRight className="size-5 opacity-50" />
            </div>
          </Link>

        </div>

        {/* Status Message */}
        {taskCompleted ? (
          <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content">
            <div className="card-body items-center text-center py-8">
              <Sparkles className="size-12 mb-2" />
              <h3 className="text-xl font-bold">All done for today!</h3>
              <p className="opacity-90">
                Your streak is safe. See you tomorrow!
              </p>
            </div>
          </div>
        ) : (
          <div className="alert bg-base-200">
            <Clock className="size-5" />
            <div>
              <p className="font-medium">
                Complete your daily task to keep your streak
              </p>
              <p className="text-sm opacity-70">Just 10 minutes. You can do it!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
