import { RefreshToken } from '@prisma/client';
import { prisma } from '../config/database';

export interface CreateRefreshTokenData {
  userId: number;
  tokenHash: string;
  expiresAt: Date;
}

export class RefreshTokenRepository {
  async create(data: CreateRefreshTokenData): Promise<RefreshToken> {
    return prisma.refreshToken.create({ data });
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({ where: { tokenHash } });
  }

  async deleteByTokenHash(tokenHash: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { tokenHash } });
  }

  async deleteById(id: number): Promise<void> {
    await prisma.refreshToken.delete({ where: { id } });
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
