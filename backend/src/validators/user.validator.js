import { body, param, query } from 'express-validator';
import { handleValidationErrors } from './auth.validator.js';

export const validateUpdateProfile = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must not exceed 100 characters'),

  body('nativeLanguage')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Native language must be between 2 and 50 characters'),

  body('learningLanguage')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Learning language must be between 2 and 50 characters'),

  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array')
    .custom((value) => {
      if (value.length > 20) {
        throw new Error('Maximum 20 interests allowed');
      }
      return true;
    }),

  body('interests.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each interest must be between 1 and 50 characters'),

  handleValidationErrors,
];

export const validateUserId = [
  param('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID format'),

  handleValidationErrors,
];

export const validateSearchQuery = [
  query('query')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  handleValidationErrors,
];
