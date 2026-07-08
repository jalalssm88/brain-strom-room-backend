import { Request, Response } from 'express';
import { asyncHandler } from '../helpers/asyncHandler';
import { authService } from '../services/auth.service';
import { LoginDto, SignupDto } from '../types/auth.types';

// Tokens are returned in the JSON body (not cookies) so the same REST API
// can be consumed by both the web client and future mobile apps.
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
}

export const authController = new AuthController();
