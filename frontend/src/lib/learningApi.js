import { axiosInstance } from "./axios";

// Daily Challenges API
export const getDailyChallenges = async () => {
  try {
    console.log("Calling challenges API...");
    const res = await axiosInstance.get("/learning/challenges/daily");
    console.log("Challenges response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error fetching challenges:", error.response?.data || error.message);
    throw error;
  }
};

export const completeDailyChallenge = async (challengeData) => {
  const res = await axiosInstance.post("/learning/challenges/complete", challengeData);
  return res.data;
};

// 5-Minute Conversation API
export const startConversationSession = async (scenario, language) => {
  const res = await axiosInstance.post("/learning/conversation/start", {
    scenario,
    language
  });
  return res.data;
};

export const sendConversationMessage = async (sessionId, message) => {
  const res = await axiosInstance.post("/learning/conversation/message", {
    sessionId,
    message
  });
  return res.data;
};

export const completeConversationSession = async (sessionId, stats) => {
  const res = await axiosInstance.post("/learning/conversation/complete", {
    sessionId,
    stats
  });
  return res.data;
};

// Learn 10 Words API
export const getDailyWords = async () => {
  const res = await axiosInstance.get("/learning/vocabulary/daily");
  return res.data;
};

export const saveMasteredWords = async (wordData) => {
  const res = await axiosInstance.post("/learning/vocabulary/master", wordData);
  return res.data;
};

// Watch and Learn API
export const getVideoLibrary = async (category = null, level = null) => {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (level) params.append('level', level);
  
  const res = await axiosInstance.get(`/learning/videos?${params}`);
  return res.data;
};

export const completeVideo = async (videoData) => {
  const res = await axiosInstance.post("/learning/videos/complete", videoData);
  return res.data;
};

// Subscription API
export const getSubscriptionStatus = async () => {
  const res = await axiosInstance.get("/learning/subscription/status");
  return res.data;
};

export const upgradeSubscription = async (plan, paymentMethod) => {
  const res = await axiosInstance.post("/learning/subscription/upgrade", {
    plan,
    paymentMethod
  });
  return res.data;
};

// Learning Progress API
export const getLearningProgress = async () => {
  const res = await axiosInstance.get("/learning/progress");
  return res.data;
};

export const getLearningStats = async () => {
  const res = await axiosInstance.get("/learning/stats");
  return res.data;
};

export const getWeeklyStats = async () => {
  const res = await axiosInstance.get("/learning/stats/weekly");
  return res.data;
};

export const getAchievements = async () => {
  const res = await axiosInstance.get("/learning/achievements");
  return res.data;
};

export const updateLearningPreferences = async (preferences) => {
  const res = await axiosInstance.put("/learning/preferences", preferences);
  return res.data;
};

export const getLeaderboard = async (period = 'week', limit = 10) => {
  const res = await axiosInstance.get("/learning/leaderboard", {
    params: { period, limit }
  });
  return res.data;
};

// Word of the Day API
export const getWordOfDay = async () => {
  const res = await axiosInstance.get("/word-of-day/today");
  return res.data;
};

export const submitWordOfDaySentence = async (userSentence, wordId) => {
  const res = await axiosInstance.post("/word-of-day/submit", { userSentence, wordId });
  return res.data;
};

export const getEnglishWordOfDay = async () => {
  const res = await axiosInstance.get("/word-of-day/english");
  return res.data;
};