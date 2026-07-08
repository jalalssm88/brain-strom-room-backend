import { randomUUID } from 'crypto';
import { User } from '@prisma/client';
import { ConflictError, UnauthorizedError } from '../errors/AppError';
import { userRepository } from '../repositories/user.repository';
import { refreshTokenRepository } from '../repositories/refreshToken.repository';
import { hashPassword, comparePassword, hashToken } from '../utils/hash';
import { signAccessToken, signRefreshToken, verifyRefreshToken, getRefreshTokenExpiry } from '../utils/jwt';
import {
  AuthResult,
  AuthUserResponse,
  AuthTokens,
  LoginDto,
  SignupDto,
} from '../types/auth.types';

const toAuthUserResponse = (user: User): AuthUserResponse => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  avatar: user.avatar,
  provider: user.provider,
  emailVerified: user.emailVerified?.toISOString() ?? null,
  createdAt: user.createdAt.toISOString(),
});

export class AuthService {
  private async issueTokens(user: User): Promise<AuthTokens> {
    const tokenId = randomUUID();
    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id, tokenId });
    const tokenHash = hashToken(refreshToken);

    await refreshTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt: getRefreshTokenExpiry(),
    });

    return { accessToken, refreshToken };
  }

  async signup(dto: SignupDto): Promise<AuthResult> {
    const existing = await userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await hashPassword(dto.password);
    const user = await userRepository.create({
      fullName: dto.fullName.trim(),
      email: dto.email,
      passwordHash,
    });

    const tokens = await this.issueTokens(user);
    return { user: toAuthUserResponse(user), tokens };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await userRepository.findByEmail(dto.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const valid = await comparePassword(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = await this.issueTokens(user);
    return { user: toAuthUserResponse(user), tokens };
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;

    try {
      verifyRefreshToken(refreshToken);
      const tokenHash = hashToken(refreshToken);
      await refreshTokenRepository.deleteByTokenHash(tokenHash);
    } catch {
      // Token already invalid — treat logout as success
    }
  }

  async refresh(refreshToken: string): Promise<AuthResult> {
    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);

    const stored = await refreshTokenRepository.findByTokenHash(tokenHash);
    if (!stored || stored.expiresAt < new Date()) {
      if (stored) {
        await refreshTokenRepository.deleteById(stored.id);
      }
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await userRepository.findById(payload.userId);
    if (!user) {
      await refreshTokenRepository.deleteById(stored.id);
      throw new UnauthorizedError('User not found');
    }

    await refreshTokenRepository.deleteById(stored.id);
    const tokens = await this.issueTokens(user);

    return { user: toAuthUserResponse(user), tokens };
  }

  async getCurrentUser(userId: number): Promise<AuthUserResponse> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    return toAuthUserResponse(user);
  }
}

export const authService = new AuthService();
