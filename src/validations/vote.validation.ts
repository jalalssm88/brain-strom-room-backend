import { param } from 'express-validator';

export const noteVotesValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid workspace ID'),
  param('noteId').isInt({ min: 1 }).withMessage('Invalid note ID'),
];
