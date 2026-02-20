import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { CheckCircle, Clock, User, Trophy, ArrowRight, Loader, Timer } from "lucide-react";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

const MIN_PARTNER_DURATION = 5 * 60; // 5 minutes in seconds

const DailyTaskPage = () => {
  const [task, setTask] = useState(null);
  const [currentStep, setCurrentStep] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [streak, setStreak] = useState(0);
  const [partnerTimer, setPartnerTimer] = useState(0);
  const [partnerTimerActive, setPartnerTimerActive] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTodayTask();
  }, []);

  useEffect(() => {
    // Track time spent on task
    if (startTime && currentStep === "aiPractice") {
      const interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [startTime, currentStep]);

  useEffect(() => {
    // Track partner interaction timer (5-minute minimum)
    if (partnerTimerActive) {
      const interval = setInterval(() => {
        setPartnerTimer((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [partnerTimerActive]);

  const fetchTodayTask = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/daily-task/today");
      setTask(response.data.task);
      setCurrentStep(response.data.currentStep);
    } catch (error) {
      console.error("Error fetching today's task:", error);
      toast.error("Failed to load today's task");
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async () => {
    try {
      setActionLoading(true);
      const response = await axiosInstance.post("/daily-task/start");
      setTask(response.data.task);
      setCurrentStep(response.data.currentStep);
      setStartTime(Date.now());
      toast.success("Task started! Let's begin!");
    } catch (error) {
      console.error("Error starting task:", error);
      toast.error(error.response?.data?.message || "Failed to start task");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteAIPractice = async () => {
    if (!userAnswer.trim()) {
      toast.error("Please provide an answer first");
      return;
    }

    try {
      setActionLoading(true);
      const response = await axiosInstance.post("/daily-task/complete-ai-practice", {
        feedback: "Practice completed",
        corrections: [],
        timeSpent,
        score: 80, // This would be calculated based on actual performance
      });
      setTask(response.data.task);
      setCurrentStep(response.data.currentStep);
      toast.success("Great work! Moving to next step...");
    } catch (error) {
      console.error("Error completing AI practice:", error);
      toast.error(error.response?.data?.message || "Failed to complete practice");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePartnerInteraction = async (accepted) => {
    if (accepted && partnerTimer < MIN_PARTNER_DURATION) {
      // Start the timer - user needs to practice for 5 minutes
      setPartnerTimerActive(true);
      toast.success("Timer started! Practice for at least 5 minutes.");
      return;
    }

    try {
      setActionLoading(true);
      setPartnerTimerActive(false);

      const response = await axiosInstance.post("/daily-task/partner-interaction", {
        accepted,
        durationSeconds: partnerTimer,
      });
      setTask(response.data.task);
      setCurrentStep(response.data.currentStep);

      if (accepted) {
        toast.success("Partner practice completed!");
      } else {
        toast.success("No problem! Let's finish up.");
      }
    } catch (error) {
      console.error("Error handling partner interaction:", error);
      toast.error(error.response?.data?.message || "Failed to process");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteTask = async () => {
    try {
      setActionLoading(true);
      const response = await axiosInstance.post("/daily-task/complete");
      setTask(response.data.task);
      setCurrentStep("completed");
      setStreak(response.data.streak);
      setShowCelebration(true);
      toast.success("🎉 Daily task completed!");
    } catch (error) {
      console.error("Error completing task:", error);
      toast.error(error.response?.data?.message || "Failed to complete task");
    } finally {
      setActionLoading(false);
    }
  };

  const renderTaskContent = () => {
    if (!task) return null;

    switch (task.taskType) {
      case "vocabulary":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Today's Vocabulary Practice</h3>
            <p className="text-sm opacity-70">Learn 5 new words</p>
            {task.content?.words?.length > 0 ? (
              <div className="space-y-3">
                {task.content.words.map((word, index) => (
                  <div key={index} className="p-4 bg-base-200 rounded-lg">
                    <div className="font-bold text-lg">{word.word}</div>
                    <div className="text-sm opacity-70">{word.translation}</div>
                    {word.example && (
                      <div className="text-sm mt-2 italic">"{word.example}"</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm opacity-70">Loading vocabulary words...</p>
            )}
          </div>
        );

      case "grammar":
      case "conversation":
      case "reading":
      case "listening":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Today's {task.taskType} Practice</h3>
            <p className="text-sm opacity-70">Complete this {task.taskType} exercise</p>
            <div className="p-4 bg-base-200 rounded-lg">
              <p>Practice content will be loaded here based on your level</p>
            </div>
          </div>
        );

      default:
        return <p>Task content not available</p>;
    }
  };

  const renderStep = () => {
    if (showCelebration) {
      return (
        <div className="text-center space-y-6 animate-fade-in">
          <div className="text-6xl">🎉</div>
          <h2 className="text-3xl font-bold">Congratulations!</h2>
          <p className="text-xl">You completed today's learning task!</p>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-primary">
                <Trophy size={32} />
              </div>
              <div className="stat-title">Current Streak</div>
              <div className="stat-value text-primary">{streak} days</div>
              <div className="stat-desc">Keep it up!</div>
            </div>
          </div>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </div>
      );
    }

    switch (currentStep) {
      case "taskStart":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="text-4xl">📚</div>
              <h2 className="text-2xl font-bold">Ready for Today's Learning?</h2>
              <p className="opacity-70">Just 10 minutes to maintain your streak</p>
            </div>

            {renderTaskContent()}

            <div className="flex justify-center mt-6">
              <button
                className="btn btn-primary btn-lg gap-2"
                onClick={handleStartTask}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Loader className="animate-spin" size={20} />
                ) : (
                  <>
                    Start Learning <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        );

      case "aiPractice":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">AI-Guided Practice</h2>
              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} />
                <span>{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, "0")}</span>
              </div>
            </div>

            {renderTaskContent()}

            <div className="form-control">
              <label className="label">
                <span className="label-text">Your Answer/Practice</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-32"
                placeholder="Type your answer or practice here..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
              />
            </div>

            <button
              className="btn btn-primary w-full gap-2"
              onClick={handleCompleteAIPractice}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                <>
                  Submit Practice <CheckCircle size={20} />
                </>
              )}
            </button>
          </div>
        );

      case "partnerOffer":
        const partnerMinutes = Math.floor(partnerTimer / 60);
        const partnerSeconds = partnerTimer % 60;
        const partnerMeetsMinimum = partnerTimer >= MIN_PARTNER_DURATION;

        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <User size={48} className="mx-auto text-primary" />
              <h2 className="text-2xl font-bold">Practice with a Partner?</h2>
              <p className="opacity-70">
                {partnerTimerActive
                  ? "Timer is running! Chat with your partner now."
                  : "Optional: Connect with a learning partner (min. 5 minutes)"}
              </p>
            </div>

            {/* Partner interaction timer */}
            {partnerTimerActive && (
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Timer size={20} className={partnerMeetsMinimum ? "text-success" : "text-warning"} />
                  <span className={`text-3xl font-mono font-bold ${partnerMeetsMinimum ? "text-success" : ""}`}>
                    {partnerMinutes}:{partnerSeconds.toString().padStart(2, "0")}
                  </span>
                </div>
                {!partnerMeetsMinimum && (
                  <p className="text-sm text-warning">
                    {Math.ceil((MIN_PARTNER_DURATION - partnerTimer) / 60)} min remaining to meet minimum
                  </p>
                )}
                {partnerMeetsMinimum && (
                  <p className="text-sm text-success font-medium">
                    Minimum met! You can complete now.
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                className="btn btn-outline btn-lg"
                onClick={() => {
                  setPartnerTimerActive(false);
                  handlePartnerInteraction(false);
                }}
                disabled={actionLoading}
              >
                Skip for Now
              </button>
              {partnerTimerActive ? (
                <button
                  className="btn btn-success btn-lg gap-2"
                  onClick={() => handlePartnerInteraction(true)}
                  disabled={actionLoading || !partnerMeetsMinimum}
                >
                  {actionLoading ? (
                    <Loader className="animate-spin" size={20} />
                  ) : (
                    <>
                      Complete <CheckCircle size={20} />
                    </>
                  )}
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-lg gap-2"
                  onClick={() => handlePartnerInteraction(true)}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader className="animate-spin" size={20} />
                  ) : (
                    <>
                      Start Practice <User size={20} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        );

      case "streakUpdate":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <Trophy size={48} className="mx-auto text-warning" />
              <h2 className="text-2xl font-bold">Almost Done!</h2>
              <p className="opacity-70">Complete your daily task and update your streak</p>
            </div>

            <div className="stats shadow w-full">
              <div className="stat">
                <div className="stat-title">Time Spent</div>
                <div className="stat-value text-sm">{Math.floor(timeSpent / 60)} minutes</div>
              </div>
              <div className="stat">
                <div className="stat-title">Task Type</div>
                <div className="stat-value text-sm capitalize">{task.taskType}</div>
              </div>
            </div>

            <button
              className="btn btn-success btn-lg w-full gap-2"
              onClick={handleCompleteTask}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                <>
                  Complete & Update Streak <Trophy size={20} />
                </>
              )}
            </button>
          </div>
        );

      default:
        return <div>Loading...</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Progress Indicator */}
          <div className="mb-6">
            <ul className="steps steps-horizontal w-full">
              <li className={`step ${currentStep !== "taskStart" ? "step-primary" : ""}`}>
                Start
              </li>
              <li
                className={`step ${
                  ["aiPractice", "partnerOffer", "streakUpdate", "completed"].includes(
                    currentStep
                  )
                    ? "step-primary"
                    : ""
                }`}
              >
                Practice
              </li>
              <li
                className={`step ${
                  ["partnerOffer", "streakUpdate", "completed"].includes(currentStep)
                    ? "step-primary"
                    : ""
                }`}
              >
                Partner
              </li>
              <li
                className={`step ${
                  ["streakUpdate", "completed"].includes(currentStep) ? "step-primary" : ""
                }`}
              >
                Complete
              </li>
            </ul>
          </div>

          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default DailyTaskPage;
