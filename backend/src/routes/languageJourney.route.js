import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
  getLearningProgress,
  updateLearningProgress,
  completeLesson,
  getDailyChallenges,
  completeDailyChallenge,
  getSuggestedPartners,
  updateLearningPath,
  addVocabularyWord,
  getAchievements,
  recordPracticeSession,
  getPronunciationPhrases,
  completePronunciationPhrase,
  getPracticeStats
} from '../controllers/languageJourney.controller.js';

const router = express.Router();

// Learning Progress
router.get('/progress', protectRoute, getLearningProgress);
router.put('/progress', protectRoute, updateLearningProgress);

// Video Lessons
router.post('/lessons/complete', protectRoute, completeLesson);

// Daily Challenges
router.get('/challenges/daily', protectRoute, getDailyChallenges);
router.post('/challenges/complete', protectRoute, completeDailyChallenge);

// Language Partners
router.get('/partners/suggested', protectRoute, getSuggestedPartners);

// Learning Paths
router.put('/paths/update', protectRoute, updateLearningPath);

// Vocabulary
router.post('/vocabulary/add', protectRoute, addVocabularyWord);

// Achievements
router.get('/achievements', protectRoute, getAchievements);

// Practice Sessions
router.post('/practice/record', protectRoute, recordPracticeSession);

// Pronunciation Practice
router.get('/pronunciation/phrases', protectRoute, getPronunciationPhrases);
router.post('/pronunciation/complete', protectRoute, completePronunciationPhrase);
router.get('/practice/stats', protectRoute, getPracticeStats);

export default router;