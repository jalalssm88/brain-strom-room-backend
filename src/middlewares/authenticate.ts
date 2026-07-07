import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/AppError';

/**
 * JWT authentication middleware — shell for Phase 0.
 * Full implementation in Phase 1.
 */
export const authenticate = (_req: Request, _res: Response, next: NextFunction): void => {
  next(new UnauthorizedError('Authentication not configured — implement in Phase 1'));
};
