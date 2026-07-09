import { randomBytes } from 'crypto';

export const generateSecureToken = (): string => {
  return randomBytes(32).toString('hex');
};
