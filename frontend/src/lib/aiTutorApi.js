import { axiosInstance } from './axios';

// Start a new AI tutor session
export const startAITutorSession = async (sessionType, initialMessage) => {
  const response = await axiosInstance.post('/ai-tutor/start-session', {
    sessionType,
    initialMessage
  });
  return response.data;
};

// Continue conversation in existing session
export const continueAITutorSession = async (sessionId, message, codeSnippet = null, problemContext = null) => {
  const response = await axiosInstance.post(`/ai-tutor/continue-session/${sessionId}`, {
    message,
    codeSnippet,
    problemContext
  });
  return response.data;
};

// Get user's AI tutor sessions
export const getAITutorSessions = async () => {
  const response = await axiosInstance.get('/ai-tutor/sessions');
  return response.data;
};

// Get specific session with full conversation
export const getAITutorSession = async (sessionId) => {
  const response = await axiosInstance.get(`/ai-tutor/sessions/${sessionId}`);
  return response.data;
};

// Rate AI tutor session
export const rateAITutorSession = async (sessionId, rating, feedback) => {
  const response = await axiosInstance.post(`/ai-tutor/rate-session/${sessionId}`, {
    rating,
    feedback
  });
  return response.data;
};

// Get AI tutor analytics
export const getAITutorAnalytics = async () => {
  const response = await axiosInstance.get('/ai-tutor/analytics');
  return response.data;
};