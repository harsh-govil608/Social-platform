import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};
export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    console.log("Error in getAuthUser:", error);
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  return response.data;
};

export async function getUserFriends() {
  const response = await axiosInstance.get("/users/friends");
  return response.data;
}

export async function getRecommendedUsers() {
  const response = await axiosInstance.get("/users");
  return response.data;
}

export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get("/users/outgoing-friend-requests");
  return response.data;
}

export async function sendFriendRequest(userId) {
  const response = await axiosInstance.post(`/users/friend-request/${userId}`);
  return response.data;
}

export async function getFriendRequests() {
  const response = await axiosInstance.get("/users/friend-requests");
  return response.data;
}

export async function acceptFriendRequest(requestId) {
  const response = await axiosInstance.post(`/users/friend-request/${requestId}/accept`);
  return response.data;
}

export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
}

// User Profile APIs
export async function searchUsers(query) {
  const response = await axiosInstance.get("/users/search", { params: { query } });
  return response.data;
}

export async function getUserProfile(userId) {
  const response = await axiosInstance.get(`/users/profile/${userId}`);
  return response.data;
}

export async function updateUserProfile(profileData) {
  const response = await axiosInstance.patch("/users/profile", profileData);
  return response.data;
}

// Follow/Unfollow APIs
export async function followUser(userId) {
  const response = await axiosInstance.post(`/users/follow/${userId}`);
  return response.data;
}

export async function unfollowUser(userId) {
  const response = await axiosInstance.delete(`/users/follow/${userId}`);
  return response.data;
}

// Block/Unblock APIs
export async function blockUser(userId) {
  const response = await axiosInstance.post(`/users/block/${userId}`);
  return response.data;
}

export async function unblockUser(userId) {
  const response = await axiosInstance.delete(`/users/block/${userId}`);
  return response.data;
}

// Status API
export async function updateOnlineStatus(isOnline) {
  const response = await axiosInstance.patch("/users/status", { isOnline });
  return response.data;
}

// Post APIs
export async function createPost(postData) {
  const response = await axiosInstance.post("/posts", postData);
  return response.data;
}

export async function getFeedPosts(page = 1, limit = 10) {
  const response = await axiosInstance.get("/posts/feed", { params: { page, limit } });
  return response.data;
}

export async function getUserPosts(userId, page = 1, limit = 10) {
  const response = await axiosInstance.get(`/posts/user/${userId}`, { params: { page, limit } });
  return response.data;
}

export async function toggleLikePost(postId) {
  const response = await axiosInstance.post(`/posts/${postId}/like`);
  return response.data;
}

export async function commentOnPost(postId, text) {
  const response = await axiosInstance.post(`/posts/${postId}/comment`, { text });
  return response.data;
}

export async function deletePost(postId) {
  const response = await axiosInstance.delete(`/posts/${postId}`);
  return response.data;
}

export async function sharePost(postId) {
  const response = await axiosInstance.post(`/posts/${postId}/share`);
  return response.data;
}

// Notification APIs
export async function getNotifications(page = 1, limit = 20) {
  const response = await axiosInstance.get("/notifications", { params: { page, limit } });
  return response.data;
}

export async function markNotificationAsRead(notificationId) {
  const response = await axiosInstance.patch(`/notifications/${notificationId}/read`);
  return response.data;
}

export async function markAllNotificationsAsRead() {
  const response = await axiosInstance.patch("/notifications/mark-all-read");
  return response.data;
}

export async function deleteNotification(notificationId) {
  const response = await axiosInstance.delete(`/notifications/${notificationId}`);
  return response.data;
}

export async function getUnreadNotificationCount() {
  const response = await axiosInstance.get("/notifications/unread-count");
  return response.data;
}

// Chat APIs
export async function getChatUsers() {
  const response = await axiosInstance.get("/chat/users");
  return response.data;
}

export async function canMessageUser(recipientId) {
  const response = await axiosInstance.get(`/chat/can-message/${recipientId}`);
  return response.data;
}

// Language Journey APIs
export async function getLearningProgress() {
  const response = await axiosInstance.get("/language-journey/progress");
  return response.data;
}

export async function updateLearningProgress(updates) {
  const response = await axiosInstance.put("/language-journey/progress", updates);
  return response.data;
}

export async function completeLesson(lessonId, xpEarned) {
  const response = await axiosInstance.post("/language-journey/lessons/complete", { lessonId, xpEarned });
  return response.data;
}

export async function getDailyChallenges() {
  const response = await axiosInstance.get("/language-journey/challenges/daily");
  return response.data;
}

export async function completeDailyChallenge(challengeId) {
  const response = await axiosInstance.post("/language-journey/challenges/complete", { challengeId });
  return response.data;
}

export async function getSuggestedPartners() {
  const response = await axiosInstance.get("/language-journey/partners/suggested");
  return response.data;
}

export async function updateLearningPath(pathData) {
  const response = await axiosInstance.put("/language-journey/paths/update", pathData);
  return response.data;
}

export async function addVocabularyWord(word, translation, language) {
  const response = await axiosInstance.post("/language-journey/vocabulary/add", { word, translation, language });
  return response.data;
}

export async function getAchievements() {
  const response = await axiosInstance.get("/language-journey/achievements");
  return response.data;
}

export async function recordPracticeSession(type, score, duration, details) {
  const response = await axiosInstance.post("/language-journey/practice/record", { 
    type, 
    score, 
    duration, 
    details 
  });
  return response.data;
}

export async function getPronunciationPhrases(difficulty, category, limit = 20) {
  const response = await axiosInstance.get("/language-journey/pronunciation/phrases", {
    params: { difficulty, category, limit }
  });
  return response.data;
}

export async function completePronunciationPhrase(phraseId, score, accuracy) {
  const response = await axiosInstance.post("/language-journey/pronunciation/complete", {
    phraseId,
    score,
    accuracy
  });
  return response.data;
}

export async function getPracticeStats() {
  const response = await axiosInstance.get("/language-journey/practice/stats");
  return response.data;
}

// Organization APIs
export async function createOrganization(data) {
  const response = await axiosInstance.post("/organization/create", data);
  return response.data;
}

export async function getOrganization(slug) {
  const response = await axiosInstance.get(`/organization/${slug}`);
  return response.data;
}

export async function getUserOrganizations() {
  const response = await axiosInstance.get("/organization/my-organizations");
  return response.data;
}

export async function inviteOrgMember(slug, email, role = 'member') {
  const response = await axiosInstance.post(`/organization/${slug}/invite`, { email, role });
  return response.data;
}

export async function bulkInviteOrgMembers(slug, emails, role = 'member') {
  const response = await axiosInstance.post(`/organization/${slug}/invite/bulk`, { emails, role });
  return response.data;
}

export async function getOrgBranding(slug) {
  const response = await axiosInstance.get(`/organization/${slug}/branding`);
  return response.data;
}

export async function getOrgAnalytics(slug) {
  const response = await axiosInstance.get(`/organization/${slug}/analytics`);
  return response.data;
}

export async function createOrgCheckout(slug, tier, seats) {
  const response = await axiosInstance.post(`/organization/${slug}/subscription/checkout`, { tier, seats });
  return response.data;
}