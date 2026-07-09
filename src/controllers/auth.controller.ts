import { Request, Response } from 'express';
import { asyncHandler } from '../helpers/asyncHandler';
import { authService } from '../services/auth.service';
import { LoginDto, SignupDto, ForgotPasswordDto, ResetPasswordDto } from '../types/auth.types';

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
}

export const authController = new AuthController();
