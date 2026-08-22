import { body } from 'express-validator';
import { handleValidationErrors } from './auth.validator.js';

export const validateCreateSubscription = [
  body('planType')
    .notEmpty()
    .withMessage('Plan type is required')
    .isIn(['basic', 'pro', 'enterprise'])
    .withMessage('Plan type must be one of: basic, pro, enterprise'),

  body('paymentMethodId')
    .optional()
    .isString()
    .withMessage('Payment method ID must be a string'),

  handleValidationErrors,
];

export const validateCancelSubscription = [
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Cancellation reason must not exceed 500 characters'),

  body('feedback')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Feedback must not exceed 1000 characters'),

  handleValidationErrors,
];
