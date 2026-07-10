import { OAuth2Client } from 'google-auth-library';
import { env } from './env';
import { GOOGLE_OAUTH_SCOPES } from '../constants/google';

export const isGoogleOAuthConfigured = (): boolean => {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_CALLBACK_URL);
};

export const createGoogleOAuthClient = (): OAuth2Client => {
  if (!isGoogleOAuthConfigured()) {
    throw new Error('Google OAuth is not configured');
  }

  return new OAuth2Client(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_CALLBACK_URL,
  );
};

export const getGoogleAuthUrl = (state: string): string => {
  const client = createGoogleOAuthClient();

  return client.generateAuthUrl({
    access_type: 'online',
    scope: GOOGLE_OAUTH_SCOPES,
    state,
    prompt: 'select_account',
  });
};
