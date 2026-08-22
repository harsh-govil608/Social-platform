import { axiosInstance } from './axios';

// Submit a story
export const submitStory = async (storyData) => {
  const response = await axiosInstance.post('/stories/submit', storyData);
  return response.data;
};

// Get user's stories
export const getMyStories = async (page = 1, limit = 10) => {
  const response = await axiosInstance.get('/stories/my-stories', {
    params: { page, limit }
  });
  return response.data;
};

// Get public stories for review
export const getPublicStories = async (params = {}) => {
  const response = await axiosInstance.get('/stories/public', { params });
  return response.data;
};

// Rate a story
export const rateStory = async (storyId, rating) => {
  const response = await axiosInstance.post(`/stories/${storyId}/rate`, rating);
  return response.data;
};

// Like/unlike a story
export const toggleStoryLike = async (storyId) => {
  const response = await axiosInstance.post(`/stories/${storyId}/like`);
  return response.data;
};

// Get story details
export const getStoryDetails = async (storyId) => {
  const response = await axiosInstance.get(`/stories/${storyId}`);
  return response.data;
};

// Get leaderboard
export const getStoryLeaderboard = async (period = 'week', limit = 10) => {
  const response = await axiosInstance.get('/stories/leaderboard/top', {
    params: { period, limit }
  });
  return response.data;
};