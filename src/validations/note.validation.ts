import { body, param } from 'express-validator';

const optionalHexColor = body('color')
  .optional()
  .isString()
  .matches(/^#[0-9A-Fa-f]{6}$/)
  .withMessage('color must be a hex value like #FDE68A');

const optionalPosition = (field: string) =>
  body(field).optional().isFloat({ min: -100000, max: 100000 }).toFloat();

const optionalSize = (field: string) =>
  body(field).optional().isFloat({ min: 80, max: 800 }).toFloat();

export const listNotesValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid workspace ID'),
];

export const createNoteValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid workspace ID'),
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 120 }),
  body('content').optional().isString().isLength({ max: 5000 }),
  optionalHexColor,
  optionalPosition('x'),
  optionalPosition('y'),
  optionalSize('width'),
  optionalSize('height'),
];

export const updateNoteValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid workspace ID'),
  param('noteId').isInt({ min: 1 }).withMessage('Invalid note ID'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty').isLength({ max: 120 }),
  body('content').optional().isString().isLength({ max: 5000 }),
  optionalHexColor,
  optionalPosition('x'),
  optionalPosition('y'),
  optionalSize('width'),
  optionalSize('height'),
];

export const noteIdParamValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid workspace ID'),
  param('noteId').isInt({ min: 1 }).withMessage('Invalid note ID'),
];
