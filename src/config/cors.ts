import { CorsOptions } from 'cors';
import { env } from './env';

// No credentials/cookies exchanged — auth is header-based (Authorization: Bearer)
// so the same API can be consumed by web and mobile clients alike.
export const corsOptions: CorsOptions = {
  origin: env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
