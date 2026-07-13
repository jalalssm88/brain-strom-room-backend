import { query } from 'express-validator';
import { MAX_PAGE_LIMIT } from '../constants';

export const paginationValidation = [
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('offset must be a non-negative integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: MAX_PAGE_LIMIT })
    .withMessage(`limit must be between 1 and ${MAX_PAGE_LIMIT}`)
    .toInt(),
];
