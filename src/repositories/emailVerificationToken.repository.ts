import { EmailVerificationToken } from '@prisma/client';
import { prisma } from '../config/database';

export interface CreateEmailVerificationTokenData {
  email: string;
  tokenHash: string;
  expiresAt: Date;
}

export class EmailVerificationTokenRepository {
  async create(data: CreateEmailVerificationTokenData): Promise<EmailVerificationToken> {
    return prisma.emailVerificationToken.create({ data });
  }

  async findByTokenHash(tokenHash: string): Promise<EmailVerificationToken | null> {
    return prisma.emailVerificationToken.findUnique({ where: { tokenHash } });
  }

  async deleteById(id: number): Promise<void> {
    await prisma.emailVerificationToken.delete({ where: { id } });
  }

  async deleteByEmail(email: string): Promise<void> {
    await prisma.emailVerificationToken.deleteMany({ where: { email: email.toLowerCase() } });
  }
}

export const emailVerificationTokenRepository = new EmailVerificationTokenRepository();
