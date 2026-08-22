import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import {
  BookOpen,
  MessageCircle,
  ChevronRight,
  Flame,
  Brain,
  Sparkles,
} from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import { axiosInstance } from "../lib/axios";

const PracticePage = () => {
  const { authUser } = useAuthUser();

  const { data: vocabStats } = useQuery({
    queryKey: ["vocabStats"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/vocabulary/due-reviews-limited");
        return res.data;
      } catch {
        return { dueCount: 0 };
      }
    },
  });

  const dueReviews = vocabStats?.dueCount || vocabStats?.words?.length || 0;

  const practiceOptions = [
    {
      title: "Vocabulary Review",
      description: `Spaced repetition flashcards${dueReviews > 0 ? ` - ${dueReviews} due` : ""}`,
      icon: BookOpen,
      path: "/vocabulary",
      color: "primary",
      badge: dueReviews > 0 ? `${dueReviews} due` : null,
    },
    {
      title: "AI Tutor",
      description: "Get corrections and suggestions from your AI coach",
      icon: Brain,
      path: "/ai-tutor",
      color: "secondary",
    },
    {
      title: "Conversation Practice",
      description: "5-minute guided scenario with AI",
      icon: MessageCircle,
      path: "/conversation-practice",
      color: "accent",
    },
  ];

  const colorClasses = {
    primary: { bg: "bg-primary/10", text: "text-primary" },
    secondary: { bg: "bg-secondary/10", text: "text-secondary" },
    accent: { bg: "bg-accent/10", text: "text-accent" },
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-base-100">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Practice</h1>
          <p className="text-base-content/70">
            Sharpen your {authUser?.learningLanguage || "language"} skills
          </p>
        </div>

        {/* Quick AI Practice CTA */}
        <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content mb-8">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="card-title text-2xl mb-2">
                  <Sparkles className="size-6" />
                  Quick AI Practice
                </h2>
                <p className="opacity-90">
                  5-minute conversation to warm up
                </p>
              </div>
              <Link
                to="/conversation-practice"
                className="btn btn-lg bg-white/20 hover:bg-white/30 border-0"
              >
                Start
                <ChevronRight className="size-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Streak Reminder */}
        <div className="alert bg-orange-500/10 border-orange-500/30 mb-6">
          <Flame className="size-6 text-orange-500" />
          <div>
            <p className="font-semibold">
              {authUser?.streak || 0} day streak
            </p>
            <p className="text-sm opacity-70">Practice daily to keep it alive</p>
          </div>
        </div>

        {/* Practice Options */}
        <h2 className="font-semibold text-lg mb-4">All Practice Activities</h2>
        <div className="space-y-3">
          {practiceOptions.map((option) => {
            const Icon = option.icon;
            const colors = colorClasses[option.color] || colorClasses.primary;
            return (
              <Link
                key={option.path}
                to={option.path}
                className="card bg-base-200 hover:bg-base-300 transition-colors"
              >
                <div className="card-body p-4 flex-row items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`${colors.bg} p-3 rounded-xl`}>
                      <Icon className={`size-6 ${colors.text}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{option.title}</h3>
                        {option.badge && (
                          <span className="badge badge-primary badge-sm">
                            {option.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm opacity-70">{option.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="size-5 opacity-50" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PracticePage;
