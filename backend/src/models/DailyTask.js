import mongoose from "mongoose";

const dailyTaskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      },
    },
    taskType: {
      type: String,
      enum: ["vocabulary", "grammar", "conversation", "reading", "listening"],
      required: true,
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    estimatedDuration: {
      type: Number, // in minutes
      default: 10,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "skipped"],
      default: "pending",
    },
    completedSteps: {
      taskStarted: {
        type: Boolean,
        default: false,
      },
      taskStartedAt: Date,
      aiPracticeCompleted: {
        type: Boolean,
        default: false,
      },
      aiPracticeCompletedAt: Date,
      partnerInteractionOffered: {
        type: Boolean,
        default: false,
      },
      partnerInteractionCompleted: {
        type: Boolean,
        default: false,
      },
      streakUpdated: {
        type: Boolean,
        default: false,
      },
      streakUpdatedAt: Date,
    },
    result: {
      score: Number,
      feedback: String,
      aiCorrections: [String],
      timeSpent: Number, // in seconds
      mistakesMade: Number,
    },
    streakContribution: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
dailyTaskSchema.index({ user: 1, date: -1 });
dailyTaskSchema.index({ user: 1, status: 1 });

// Method to check if all required steps are completed
dailyTaskSchema.methods.isFullyCompleted = function () {
  return (
    this.completedSteps.taskStarted &&
    this.completedSteps.aiPracticeCompleted &&
    this.completedSteps.streakUpdated
  );
};

// Method to get current step
dailyTaskSchema.methods.getCurrentStep = function () {
  if (!this.completedSteps.taskStarted) return "taskStart";
  if (!this.completedSteps.aiPracticeCompleted) return "aiPractice";
  if (!this.completedSteps.partnerInteractionOffered) return "partnerOffer";
  if (!this.completedSteps.streakUpdated) return "streakUpdate";
  return "completed";
};

// Static method to get today's task for a user
dailyTaskSchema.statics.getTodayTask = async function (userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return this.findOne({ user: userId, date: today });
};

// Static method to create daily task for user
dailyTaskSchema.statics.createDailyTask = async function (userId, taskType) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if task already exists for today
  const existingTask = await this.findOne({ user: userId, date: today });
  if (existingTask) {
    return existingTask;
  }

  // Generate content based on task type (this will be enhanced with actual content generation)
  const content = await generateTaskContent(taskType, userId);

  return this.create({
    user: userId,
    date: today,
    taskType,
    content,
    status: "pending",
  });
};

// Helper function to generate task content (to be implemented based on task type)
async function generateTaskContent(taskType, userId) {
  // This will be enhanced with actual logic to fetch appropriate content
  const contentTemplates = {
    vocabulary: {
      type: "vocabulary",
      words: [],
      targetCount: 5,
    },
    grammar: {
      type: "grammar",
      rule: "",
      exercises: [],
    },
    conversation: {
      type: "conversation",
      scenario: "",
      prompts: [],
    },
    reading: {
      type: "reading",
      passage: "",
      questions: [],
    },
    listening: {
      type: "listening",
      audioUrl: "",
      questions: [],
    },
  };

  return contentTemplates[taskType] || contentTemplates.vocabulary;
}

const DailyTask = mongoose.model("DailyTask", dailyTaskSchema);

export default DailyTask;
