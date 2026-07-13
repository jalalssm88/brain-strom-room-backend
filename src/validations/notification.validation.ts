import { param } from 'express-validator';
import { paginationValidation } from './pagination.validation';

export const listNotificationsValidation = [...paginationValidation];

export const notificationIdValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid notification ID'),
];
