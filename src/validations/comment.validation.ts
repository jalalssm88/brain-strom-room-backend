import { body, param } from 'express-validator';

export const listCommentsValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid workspace ID'),
  param('noteId').isInt({ min: 1 }).withMessage('Invalid note ID'),
];

export const createCommentValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid workspace ID'),
  param('noteId').isInt({ min: 1 }).withMessage('Invalid note ID'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 2000 })
    .withMessage('Message must be at most 2000 characters'),
];

export const updateCommentValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid workspace ID'),
  param('noteId').isInt({ min: 1 }).withMessage('Invalid note ID'),
  param('commentId').isInt({ min: 1 }).withMessage('Invalid comment ID'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 2000 })
    .withMessage('Message must be at most 2000 characters'),
];

export const commentIdParamValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid workspace ID'),
  param('noteId').isInt({ min: 1 }).withMessage('Invalid note ID'),
  param('commentId').isInt({ min: 1 }).withMessage('Invalid comment ID'),
];
