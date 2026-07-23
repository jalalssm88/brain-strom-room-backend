import { param, query } from 'express-validator';

export const listChatMessagesValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid workspace ID'),
  query('cursor')
    .optional()
    .isInt({ min: 1 })
    .withMessage('cursor must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100'),
];
