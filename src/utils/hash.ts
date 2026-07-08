import bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { BCRYPT_ROUNDS } from '../constants/auth';

export const hashPassword = async (plain: string): Promise<string> => {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
};

export const comparePassword = async (plain: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(plain, hash);
};

export const hashToken = (token: string): string => {
  return createHash('sha256').update(token).digest('hex');
};
