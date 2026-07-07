/**
 * JWT utilities — implemented in Phase 1.
 * Services use this module; controllers must not sign tokens directly.
 */

export const signAccessToken = (_payload: Record<string, unknown>): string => {
  throw new Error('JWT not configured — implement in Phase 1');
};

export const signRefreshToken = (_payload: Record<string, unknown>): string => {
  throw new Error('JWT not configured — implement in Phase 1');
};

export const verifyAccessToken = (_token: string): Record<string, unknown> => {
  throw new Error('JWT not configured — implement in Phase 1');
};

export const verifyRefreshToken = (_token: string): Record<string, unknown> => {
  throw new Error('JWT not configured — implement in Phase 1');
};
