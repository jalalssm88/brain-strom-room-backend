import { param } from 'express-validator';

export const notificationIdValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid notification ID'),
];
