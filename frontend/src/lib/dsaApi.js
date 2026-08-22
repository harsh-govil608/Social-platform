import { axiosInstance } from './axios';

// Initialize problems in database
export const initProblems = async () => {
  const response = await axiosInstance.post('/dsa/init-problems');
  return response.data;
};

// Get all problems with filters
export const getProblems = async (params = {}) => {
  const response = await axiosInstance.get('/dsa/problems', { params });
  return response.data;
};

// Get single problem details
export const getProblemDetails = async (problemId) => {
  const response = await axiosInstance.get(`/dsa/problems/${problemId}`);
  return response.data;
};

// Submit solution
export const submitSolution = async (problemId, code, language) => {
  const response = await axiosInstance.post('/dsa/submit', {
    problemId,
    code,
    language
  });
  return response.data;
};

// Run code without submitting
export const runCode = async (problemId, code, language) => {
  const response = await axiosInstance.post('/dsa/run', {
    problemId,
    code,
    language
  });
  return response.data;
};

// Get user's problem solving stats
export const getDSAStats = async () => {
  const response = await axiosInstance.get('/dsa/stats');
  return response.data;
};