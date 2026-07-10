import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      /** Set by authenticate middleware */
      userId?: number;
    }
  }
}

export {};
