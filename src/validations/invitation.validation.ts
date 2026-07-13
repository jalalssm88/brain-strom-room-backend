import { body, param } from 'express-validator';

export const invitationTokenValidation = [
  param('token').notEmpty().withMessage('Invitation token is required'),
];

export const respondInvitationValidation = [
  body('invitationId').isInt({ min: 1 }).withMessage('Invalid invitation ID'),
  body('action').isIn(['accept', 'decline']).withMessage('Action must be accept or decline'),
];
