import { body } from 'express-validator';
import { handleValidationErrors } from './auth.validator.js';

export const validateCompleteAIPractice = [
  body('sessionId').optional().isString().withMessage('sessionId must be a string'),
  handleValidationErrors,
];

export const validatePartnerInteraction = [
  body('accepted').isBoolean().withMessage('accepted must be a boolean'),
  body('durationSeconds').optional().isInt({ min: 0 }).withMessage('durationSeconds must be a non-negative integer'),
  handleValidationErrors,
];

export const validateConversationStart = [
  body('scenario')
    .optional()
    .isIn([
      'at-the-cafe', 'at-the-restaurant', 'at-the-airport', 'shopping-adventure',
      'job-interview', 'friendly-debate', 'medical-appointment', 'tech-support',
      'gym-trainer', 'travel-planning', 'cooking-class', 'real-estate',
    ])
    .withMessage('scenario must be a valid conversation scenario'),
  body('languageLevel')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('languageLevel must be beginner, intermediate, or advanced'),
  handleValidationErrors,
];

export const validateAddCustomVocab = [
  body('word')
    .notEmpty()
    .withMessage('word is required')
    .isLength({ max: 100 })
    .withMessage('word must be at most 100 characters'),
  body('translation').notEmpty().withMessage('translation is required'),
  body('language').notEmpty().withMessage('language is required'),
  handleValidationErrors,
];

export const validateMatchRequest = [
  body('targetLanguage').notEmpty().withMessage('targetLanguage is required'),
  body('availability').optional().isArray().withMessage('availability must be an array'),
  handleValidationErrors,
];
