import DailyTask from "../models/DailyTask.js";
import User from "../models/User.js";
import Vocabulary from "../models/vocabulary.model.js";
import UserAnalytics from "../models/UserAnalytics.js";

// Get today's task for the authenticated user
export const getTodayTask = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("getTodayTask called for user:", userId);

    let todayTask = await DailyTask.getTodayTask(userId);
    console.log("Existing task found:", !!todayTask, todayTask?._id, "status:", todayTask?.status);

    // If no task exists, create one
    if (!todayTask) {
      // Determine task type based on user's learning preferences or rotation
      const taskType = await determineTaskType(userId);
      console.log("Creating new task, type:", taskType);
      todayTask = await DailyTask.createDailyTask(userId, taskType);
      console.log("Task created:", todayTask._id);
    }

    // Populate content if needed
    await populateTaskContent(todayTask);

    const currentStep = todayTask.getCurrentStep();
    console.log("Returning task, currentStep:", currentStep, "completedSteps:", JSON.stringify(todayTask.completedSteps));

    res.status(200).json({
      success: true,
      task: todayTask,
      currentStep,
    });
  } catch (error) {
    console.error("Error in getTodayTask:", error.message, error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to fetch today's task",
      error: error.message,
    });
  }
};

// Start the daily task
export const startTask = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("startTask called for user:", userId);
    const todayTask = await DailyTask.getTodayTask(userId);
    console.log("startTask - task found:", !!todayTask, "taskStarted:", todayTask?.completedSteps?.taskStarted);

    if (!todayTask) {
      return res.status(404).json({
        success: false,
        message: "No task found for today",
      });
    }

    if (todayTask.completedSteps.taskStarted) {
      return res.status(400).json({
        success: false,
        message: "Task already started",
      });
    }

    todayTask.completedSteps.taskStarted = true;
    todayTask.status = "in_progress";
    console.log("startTask - saving task...");
    await todayTask.save();
    console.log("startTask - task saved successfully");

    res.status(200).json({
      success: true,
      message: "Task started successfully",
      task: todayTask,
      currentStep: todayTask.getCurrentStep(),
    });
  } catch (error) {
    console.error("Error in startTask:", error.message, error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to start task",
      error: error.message,
    });
  }
};

// Complete AI practice step
export const completeAIPractice = async (req, res) => {
  try {
    const userId = req.user._id;
    const { feedback, corrections, timeSpent, score } = req.body;

    const todayTask = await DailyTask.getTodayTask(userId);

    if (!todayTask) {
      return res.status(404).json({
        success: false,
        message: "No task found for today",
      });
    }

    if (!todayTask.completedSteps.taskStarted) {
      return res.status(400).json({
        success: false,
        message: "Task must be started first",
      });
    }

    if (todayTask.completedSteps.aiPracticeCompleted) {
      return res.status(400).json({
        success: false,
        message: "AI practice already completed",
      });
    }

    todayTask.completedSteps.aiPracticeCompleted = true;
    if (!todayTask.result) todayTask.result = {};
    todayTask.result.feedback = feedback;
    todayTask.result.aiCorrections = corrections || [];
    todayTask.result.timeSpent = timeSpent;
    todayTask.result.score = score;

    await todayTask.save();

    res.status(200).json({
      success: true,
      message: "AI practice completed successfully",
      task: todayTask,
      currentStep: todayTask.getCurrentStep(),
    });
  } catch (error) {
    console.error("Error in completeAIPractice:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to complete AI practice",
      error: error.message,
    });
  }
};

// Offer partner interaction
export const offerPartnerInteraction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { accepted, durationSeconds } = req.body;

    const todayTask = await DailyTask.getTodayTask(userId);

    if (!todayTask) {
      return res.status(404).json({
        success: false,
        message: "No task found for today",
      });
    }

    if (!todayTask.completedSteps.aiPracticeCompleted) {
      return res.status(400).json({
        success: false,
        message: "AI practice must be completed first",
      });
    }

    todayTask.completedSteps.partnerInteractionOffered = true;

    if (accepted) {
      todayTask.completedSteps.partnerInteractionCompleted = true;
      if (durationSeconds) {
        todayTask.result = todayTask.result || {};
        todayTask.result.partnerDurationSeconds = durationSeconds;
      }
    }

    await todayTask.save();

    res.status(200).json({
      success: true,
      message: accepted
        ? "Partner interaction accepted"
        : "Partner interaction declined",
      task: todayTask,
      currentStep: todayTask.getCurrentStep(),
    });
  } catch (error) {
    console.error("Error in offerPartnerInteraction:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to process partner interaction",
      error: error.message,
    });
  }
};

// Update streak and complete the daily flow
export const updateStreakAndComplete = async (req, res) => {
  try {
    const userId = req.user._id;

    const todayTask = await DailyTask.getTodayTask(userId);

    if (!todayTask) {
      return res.status(404).json({
        success: false,
        message: "No task found for today",
      });
    }

    if (!todayTask.completedSteps.aiPracticeCompleted) {
      return res.status(400).json({
        success: false,
        message: "AI practice must be completed first",
      });
    }

    // Update user's streak
    const user = await User.findById(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();

    const lastPractice = user.lastPracticeDate
      ? new Date(user.lastPracticeDate)
      : null;
    const lastPracticeDay = lastPractice
      ? new Date(lastPractice.getFullYear(), lastPractice.getMonth(), lastPractice.getDate()).getTime()
      : null;

    if (!lastPracticeDay || lastPracticeDay < todayMs) {
      const yesterdayMs = todayMs - 24 * 60 * 60 * 1000;
      if (lastPracticeDay === yesterdayMs) {
        user.streak = (user.streak || 0) + 1;
      } else {
        user.streak = 1; // Reset streak (first time or gap)
      }

      if (user.streak > (user.bestStreak || 0)) {
        user.bestStreak = user.streak;
      }

      user.lastPracticeDate = new Date();
      await user.save();
    }

    // Mark task as completed
    todayTask.completedSteps.streakUpdated = true;
    todayTask.status = "completed";
    todayTask.streakContribution = true;

    await todayTask.save();

    // Update analytics
    try {
      let analytics = await UserAnalytics.findOne({ user: userId });
      if (!analytics) {
        analytics = await UserAnalytics.create({
          user: userId,
          registrationDate: user.createdAt || new Date(),
        });
      }

      analytics.dailyTaskStats.totalCompletions += 1;
      analytics.dailyTaskStats.lastCompletionDate = new Date();
      analytics.updateStreak(true);

      if (analytics.dailyTaskStats.totalAttempts > 0) {
        analytics.dailyTaskStats.completionRate =
          (analytics.dailyTaskStats.totalCompletions /
            analytics.dailyTaskStats.totalAttempts) *
          100;
      }

      await analytics.save();
    } catch (analyticsError) {
      console.error("Error updating analytics:", analyticsError);
      // Don't fail the request if analytics update fails
    }

    res.status(200).json({
      success: true,
      message: "Daily task completed! Streak updated.",
      task: todayTask,
      streak: user.streak,
      showCelebration: true,
    });
  } catch (error) {
    console.error("Error in updateStreakAndComplete:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to complete task",
      error: error.message,
    });
  }
};

// Get task history
export const getTaskHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 30 } = req.query;

    const tasks = await DailyTask.find({ user: userId })
      .sort({ date: -1 })
      .limit(parseInt(limit));

    // Calculate stats
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const totalTasks = tasks.length;
    const completionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    res.status(200).json({
      success: true,
      tasks,
      stats: {
        completedTasks,
        totalTasks,
        completionRate: completionRate.toFixed(1),
      },
    });
  } catch (error) {
    console.error("Error in getTaskHistory:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch task history",
      error: error.message,
    });
  }
};

// Helper function to determine task type for the day
async function determineTaskType(userId) {
  // Get user's learning preferences
  const user = await User.findById(userId);

  // Simple rotation logic - can be enhanced with user preferences
  const taskTypes = ["vocabulary", "grammar", "conversation", "reading", "listening"];
  const dayOfYear = Math.floor(
    (new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  );

  return taskTypes[dayOfYear % taskTypes.length];
}

// Helper function to populate task content
async function populateTaskContent(task) {
  if (task.taskType === "vocabulary" && task.content?.words?.length === 0) {
    // Fetch vocabulary words for the user's language
    const user = await User.findById(task.user);
    const language = user?.learningLanguage || "spanish";

    const vocabularyWords = await Vocabulary.find({
      language,
      isActive: true,
    })
      .limit(5);

    if (vocabularyWords.length > 0) {
      task.content.words = vocabularyWords.map((w) => ({
        word: w.word,
        translation: w.translation,
        example: w.exampleSentence,
      }));
      await task.save();
    }
  }

  return task;
}
