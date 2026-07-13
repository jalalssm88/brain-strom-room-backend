import { body, param, query } from 'express-validator';
import { WorkspaceTab } from '../types/workspace.types';

const workspaceTabs: WorkspaceTab[] = ['owned', 'shared', 'pending'];

export const listWorkspacesValidation = [
  query('tab')
    .optional()
    .isIn(workspaceTabs)
    .withMessage('tab must be one of: owned, shared, pending'),
];

export const createWorkspaceValidation = [
  body('name').trim().notEmpty().withMessage('Workspace name is required').isLength({ max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
];

export const updateWorkspaceValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid workspace ID'),
  body('name').trim().notEmpty().withMessage('Workspace name is required').isLength({ max: 100 }),
];

export const workspaceIdParamValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid workspace ID'),
];

export const inviteMemberValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid workspace ID'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail({ gmail_remove_dots: false }),
  body('role').isIn(['EDITOR', 'VIEWER']).withMessage('Role must be EDITOR or VIEWER'),
];

export const removeMemberValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid workspace ID'),
  param('userId').isInt({ min: 1 }).withMessage('Invalid user ID'),
];
