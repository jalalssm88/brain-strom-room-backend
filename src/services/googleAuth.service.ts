import { env } from '../config/env';
import { BadRequestError } from '../errors/AppError';
import { createGoogleOAuthClient, isGoogleOAuthConfigured } from '../config/google';
import { GoogleProfile } from '../types/google.types';

export class GoogleAuthService {
  assertConfigured(): void {
    if (!isGoogleOAuthConfigured()) {
      throw new BadRequestError('Google OAuth is not configured on the server');
    }
  }

  async getProfileFromCode(code: string): Promise<GoogleProfile> {
    this.assertConfigured();

    const client = createGoogleOAuthClient();
    const { tokens } = await client.getToken(code);

    if (!tokens.id_token) {
      throw new BadRequestError('Google did not return an ID token');
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) {
      throw new BadRequestError('Google profile is missing required fields');
    }

    if (!payload.email_verified) {
      throw new BadRequestError('Google email is not verified');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name ?? payload.email.split('@')[0],
      picture: payload.picture,
      emailVerified: true,
    };
  }
}

export const googleAuthService = new GoogleAuthService();
