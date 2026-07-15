import { PasswordResetToken } from '../prisma';
import { prisma } from '../config/database';

export interface CreatePasswordResetTokenData {
  email: string;
  tokenHash: string;
  expiresAt: Date;
}

export class PasswordResetTokenRepository {
  async create(data: CreatePasswordResetTokenData): Promise<PasswordResetToken> {
    return prisma.passwordResetToken.create({ data });
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
    return prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  }

  async deleteById(id: number): Promise<void> {
    await prisma.passwordResetToken.delete({ where: { id } });
  }

  async deleteByEmail(email: string): Promise<void> {
    await prisma.passwordResetToken.deleteMany({ where: { email: email.toLowerCase() } });
  }
}

export const passwordResetTokenRepository = new PasswordResetTokenRepository();
