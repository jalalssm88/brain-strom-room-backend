import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/AppError';
import { verifyAccessToken } from '../utils/jwt';

// Header-based auth only (Authorization: Bearer <token>) — no cookies —
// so the same API works for web and mobile clients.
const extractAccessToken = (req: Request): string | undefined => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return undefined;
};

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const token = extractAccessToken(req);
    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    const payload = verifyAccessToken(token);
    req.userId = payload.userId;
    next();
  } catch (error) {
    next(error);
  }
};
