import { body } from 'express-validator';

const emailField = () =>
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail({ gmail_remove_dots: false });

const passwordField = () =>
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Za-z]/)
    .withMessage('Password must contain at least one letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number');

export const signupValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ max: 100 }),
  emailField(),
  passwordField(),
];

export const loginValidation = [
  emailField(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const refreshTokenValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];

export const verifyEmailValidation = [
  body('token').notEmpty().withMessage('Verification token is required'),
];

export const forgotPasswordValidation = [
  emailField(),
];

export const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  passwordField(),
];
