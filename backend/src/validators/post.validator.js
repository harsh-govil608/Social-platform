import { body, param } from 'express-validator';
import { handleValidationErrors } from './auth.validator.js';

export const validateCreatePost = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Post content is required')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Post content must be between 1 and 5000 characters'),

  body('visibility')
    .optional()
    .isIn(['public', 'friends', 'private'])
    .withMessage('Visibility must be one of: public, friends, private'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((value) => {
      if (value.length > 10) {
        throw new Error('Maximum 10 tags allowed');
      }
      return true;
    }),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),

  handleValidationErrors,
];

export const validatePostId = [
  param('postId')
    .notEmpty()
    .withMessage('Post ID is required')
    .isMongoId()
    .withMessage('Invalid post ID format'),

  handleValidationErrors,
];

export const validateComment = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Comment text is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),

  handleValidationErrors,
];
