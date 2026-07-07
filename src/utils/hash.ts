/**
 * Password hashing utilities — implemented in Phase 1.
 */

export const hashPassword = async (_plain: string): Promise<string> => {
  throw new Error('Hashing not configured — implement in Phase 1');
};

export const comparePassword = async (_plain: string, _hash: string): Promise<boolean> => {
  throw new Error('Hashing not configured — implement in Phase 1');
};
