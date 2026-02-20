import mongoose from "mongoose";

const dailyVocabularySessionSchema = new mongoose.Schema(
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
    // Daily limits
    maxNewWords: {
      type: Number,
      default: 5, // Maximum new words per day
    },
    maxReviews: {
      type: Number,
      default: 20, // Maximum reviews per day
    },
    // Progress tracking
    newWordsLearned: {
      type: Number,
      default: 0,
    },
    reviewsCompleted: {
      type: Number,
      default: 0,
    },
    correctReviews: {
      type: Number,
      default: 0,
    },
    // Word IDs reviewed today
    reviewedWords: [
      {
        wordId: mongoose.Schema.Types.ObjectId,
        quality: Number,
        timestamp: Date,
      },
    ],
    // Session stats
    totalTimeSpent: {
      type: Number,
      default: 0, // in seconds
    },
    sessionStarted: Date,
    sessionEnded: Date,
    // Status
    isComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes
dailyVocabularySessionSchema.index({ user: 1, date: -1 });
dailyVocabularySessionSchema.index({ user: 1, isComplete: 1 });

// Check if user has reached daily limit
dailyVocabularySessionSchema.methods.hasReachedLimit = function () {
  return (
    this.reviewsCompleted >= this.maxReviews &&
    this.newWordsLearned >= this.maxNewWords
  );
};

// Check if user can add more new words
dailyVocabularySessionSchema.methods.canAddNewWords = function () {
  return this.newWordsLearned < this.maxNewWords;
};

// Check if user can do more reviews
dailyVocabularySessionSchema.methods.canDoReviews = function () {
  return this.reviewsCompleted < this.maxReviews;
};

// Get remaining capacity
dailyVocabularySessionSchema.methods.getRemainingCapacity = function () {
  return {
    newWords: Math.max(0, this.maxNewWords - this.newWordsLearned),
    reviews: Math.max(0, this.maxReviews - this.reviewsCompleted),
  };
};

// Calculate completion percentage
dailyVocabularySessionSchema.methods.getCompletionPercentage = function () {
  const reviewProgress = (this.reviewsCompleted / this.maxReviews) * 100;
  const newWordProgress = (this.newWordsLearned / this.maxNewWords) * 100;
  return Math.round((reviewProgress + newWordProgress) / 2);
};

// Static method to get or create today's session
dailyVocabularySessionSchema.statics.getTodaySession = async function (
  userId,
  maxNewWords = 5,
  maxReviews = 20
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let session = await this.findOne({ user: userId, date: today });

  if (!session) {
    session = await this.create({
      user: userId,
      date: today,
      maxNewWords,
      maxReviews,
      sessionStarted: new Date(),
    });
  }

  return session;
};

// Static method to get user's streak
dailyVocabularySessionSchema.statics.getUserStreak = async function (userId) {
  const sessions = await this.find({
    user: userId,
    reviewsCompleted: { $gt: 0 },
  })
    .sort({ date: -1 })
    .limit(365);

  let streak = 0;
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  let yesterday = todayDate.getTime() - 24 * 60 * 60 * 1000;

  for (const session of sessions) {
    const sessionDate = new Date(session.date).setHours(0, 0, 0, 0);

    if (sessionDate === yesterday) {
      streak++;
      yesterday -= 24 * 60 * 60 * 1000;
    } else {
      break;
    }
  }

  return streak;
};

// Static method to get weekly stats
dailyVocabularySessionSchema.statics.getWeeklyStats = async function (userId) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const sessions = await this.find({
    user: userId,
    date: { $gte: sevenDaysAgo },
  }).sort({ date: 1 });

  return sessions.map((session) => ({
    date: session.date,
    reviewsCompleted: session.reviewsCompleted,
    newWordsLearned: session.newWordsLearned,
    correctReviews: session.correctReviews,
    accuracy:
      session.reviewsCompleted > 0
        ? Math.round((session.correctReviews / session.reviewsCompleted) * 100)
        : 0,
  }));
};

const DailyVocabularySession = mongoose.model(
  "DailyVocabularySession",
  dailyVocabularySessionSchema
);

export default DailyVocabularySession;
