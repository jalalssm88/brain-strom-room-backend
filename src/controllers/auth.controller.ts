import { Request, Response } from 'express';
import { asyncHandler } from '../helpers/asyncHandler';
import { env } from '../config/env';
import { getGoogleAuthUrl } from '../config/google';
import { authService } from '../services/auth.service';
import { googleAuthService } from '../services/googleAuth.service';
import { signOAuthState, verifyOAuthState } from '../utils/oauthState';
import { LoginDto, SignupDto, ForgotPasswordDto, ResetPasswordDto } from '../types/auth.types';

const redirectToLoginWithError = (res: Response, errorCode: string): void => {
  res.redirect(`${env.FRONTEND_URL}/login?error=${errorCode}`);
};

export class AuthController {
  signup = asyncHandler(async (req: Request, res: Response) => {
    const dto: SignupDto = {
      fullName: req.body.fullName,
      email: req.body.email,
      password: req.body.password,
    };

    const result = await authService.signup(dto);

    res.status(201).json({
      success: true,
      data: result,
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const dto: LoginDto = {
      email: req.body.email,
      password: req.body.password,
    };

    const result = await authService.login(dto);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken as string;
    await authService.logout(refreshToken);

    res.status(200).json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken as string;
    const result = await authService.refresh(refreshToken);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  me = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getCurrentUser(req.userId!);

    res.status(200).json({
      success: true,
      data: { user },
    });
  });

  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.verifyEmail(req.body.token as string);

    res.status(200).json({
      success: true,
      data: { user, message: 'Email verified successfully' },
    });
  });

  resendVerification = asyncHandler(async (req: Request, res: Response) => {
    await authService.resendVerificationEmail(req.userId!);

    res.status(200).json({
      success: true,
      data: { message: 'Verification email sent' },
    });
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const dto: ForgotPasswordDto = { email: req.body.email };
    await authService.forgotPassword(dto);

    res.status(200).json({
      success: true,
      data: { message: 'If an account exists for that email, a reset link has been sent' },
    });
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const dto: ResetPasswordDto = {
      token: req.body.token,
      password: req.body.password,
    };
    await authService.resetPassword(dto);

    res.status(200).json({
      success: true,
      data: { message: 'Password reset successfully' },
    });
  });

  googleRedirect = asyncHandler(async (_req: Request, res: Response) => {
    googleAuthService.assertConfigured();
    const state = signOAuthState();
    const authUrl = getGoogleAuthUrl(state);
    res.redirect(authUrl);
  });

  googleCallback = asyncHandler(async (req: Request, res: Response) => {
    const oauthError = req.query.error as string | undefined;
    const code = req.query.code as string | undefined;
    const state = req.query.state as string | undefined;

    if (oauthError) {
      redirectToLoginWithError(res, 'google_auth_denied');
      return;
    }

    if (!code || !state) {
      redirectToLoginWithError(res, 'google_auth_failed');
      return;
    }

    try {
      verifyOAuthState(state);
      const profile = await googleAuthService.getProfileFromCode(code);
      const result = await authService.googleAuth(profile);

      const params = new URLSearchParams({
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      });

      res.redirect(`${env.FRONTEND_URL}/auth/callback?${params.toString()}`);
    } catch {
      redirectToLoginWithError(res, 'google_auth_failed');
    }
  });
}

export const authController = new AuthController();
