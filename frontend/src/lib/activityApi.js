import { axiosInstance } from './axios';

// Initialize activity tracking
export const initActivity = async () => {
  const response = await axiosInstance.get('/activity/init');
  return response.data;
};

// Log activity
export const logActivity = async (activityType, details = {}) => {
  const response = await axiosInstance.post('/activity/log', {
    activityType,
    details
  });
  return response.data;
};

// End session
export const endSession = async () => {
  const response = await axiosInstance.post('/activity/end-session');
  return response.data;
};

// Get daily stats
export const getDailyStats = async (date) => {
  const response = await axiosInstance.get('/activity/daily', {
    params: { date }
  });
  return response.data;
};

// Get weekly stats
export const getWeeklyStats = async () => {
  const response = await axiosInstance.get('/activity/weekly');
  return response.data;
};

// Get monthly stats
export const getMonthlyStats = async (month, year) => {
  const response = await axiosInstance.get('/activity/monthly', {
    params: { month, year }
  });
  return response.data;
};

// Get online status
export const getActivityStatus = async () => {
  const response = await axiosInstance.get('/activity/status');
  return response.data;
};

// Get achievements
export const getAchievements = async () => {
  const response = await axiosInstance.get('/activity/achievements');
  return response.data;
};

// Get dashboard data
export const getActivityDashboard = async () => {
  const response = await axiosInstance.get('/activity/dashboard');
  return response.data;
};