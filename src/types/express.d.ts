import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      /** Set by authenticate middleware (Phase 1+) */
      userId?: number;
    }
  }
}

export {};
