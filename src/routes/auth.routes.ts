import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import {
  signupValidation,
  loginValidation,
  refreshTokenValidation,
  verifyEmailValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from '../validations/auth.validation';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

router.post('/signup', validate(signupValidation), authController.signup);
router.post('/login', validate(loginValidation), authController.login);
router.post('/logout', validate(refreshTokenValidation), authController.logout);
router.post('/refresh', validate(refreshTokenValidation), authController.refresh);
router.post('/verify-email', validate(verifyEmailValidation), authController.verifyEmail);
router.post('/forgot-password', validate(forgotPasswordValidation), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordValidation), authController.resetPassword);
router.post('/resend-verification', authenticate, authController.resendVerification);
router.get('/google', authController.googleRedirect);
router.get('/google/callback', authController.googleCallback);
router.get('/me', authenticate, authController.me);

export default router;
