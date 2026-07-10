import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from '../errors/AppError';
import { GOOGLE_OAUTH_STATE_EXPIRES_IN } from '../constants/google';

interface OAuthStatePayload {
  purpose: 'google_oauth';
  nonce: string;
}

export const signOAuthState = (): string => {
  const payload: OAuthStatePayload = {
    purpose: 'google_oauth',
    nonce: randomUUID(),
  };

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: GOOGLE_OAUTH_STATE_EXPIRES_IN,
  });
};

export const verifyOAuthState = (state: string): void => {
  try {
    const payload = jwt.verify(state, env.JWT_ACCESS_SECRET) as OAuthStatePayload;
    if (payload.purpose !== 'google_oauth') {
      throw new UnauthorizedError('Invalid OAuth state');
    }
  } catch {
    throw new UnauthorizedError('Invalid or expired OAuth state');
  }
};
