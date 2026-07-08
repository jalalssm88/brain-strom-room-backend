import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import {
  signupValidation,
  loginValidation,
  refreshTokenValidation,
} from '../validations/auth.validation';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

router.post('/signup', validate(signupValidation), authController.signup);
router.post('/login', validate(loginValidation), authController.login);
router.post('/logout', validate(refreshTokenValidation), authController.logout);
router.post('/refresh', validate(refreshTokenValidation), authController.refresh);
router.get('/me', authenticate, authController.me);

export default router;
