import { AuthProvider, User } from '../prisma';
import { BadRequestError, ConflictError, UnauthorizedError } from '../errors/AppError';
import { EMAIL_VERIFICATION_EXPIRES_HOURS, PASSWORD_RESET_EXPIRES_HOURS } from '../constants/auth';
import { userRepository } from '../repositories/user.repository';
import { refreshTokenRepository } from '../repositories/refreshToken.repository';
import { emailVerificationTokenRepository } from '../repositories/emailVerificationToken.repository';
import { passwordResetTokenRepository } from '../repositories/passwordResetToken.repository';
import { emailService } from './email.service';
import { googleAuthService } from './googleAuth.service';
import { subscriptionService } from './subscription.service';
import { userSubscriptionRepository } from '../repositories/userSubscription.repository';
import { hashPassword, comparePassword, hashToken } from '../utils/hash';
import { generateSecureToken } from '../utils/token';
import { signAccessToken, signRefreshToken, verifyRefreshToken, getRefreshTokenExpiry } from '../utils/jwt';
import { randomUUID } from 'crypto';
import {
  AuthResult,
  AuthUserResponse,
  AuthTokens,
  LoginDto,
  SignupDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '../types/auth.types';
import { GoogleProfile } from '../types/google.types';

const userResponse = (user: User): AuthUserResponse => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  avatar: user.avatar,
  provider: user.provider,
  emailVerified: user.emailVerified?.toISOString() ?? null,
  createdAt: user.createdAt.toISOString(),
});

const getEmailVerificationExpiry = (): Date => {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + EMAIL_VERIFICATION_EXPIRES_HOURS);
  return expiresAt;
};

const getPasswordResetExpiry = (): Date => {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + PASSWORD_RESET_EXPIRES_HOURS);
  return expiresAt;
};

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

  private async sendVerificationEmail(email: string): Promise<void> {
    const token = generateSecureToken();
    const tokenHash = hashToken(token);

    await emailVerificationTokenRepository.deleteByEmail(email);
    await emailVerificationTokenRepository.create({
      email: email.toLowerCase(),
      tokenHash,
      expiresAt: getEmailVerificationExpiry(),
    });

    await emailService.sendVerificationEmail(email, token);
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

    await this.sendVerificationEmail(user.email);
    await subscriptionService.ensureFreeSubscription(user.id);

    const tokens = await this.issueTokens(user);
    return { user: userResponse(user), tokens };
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
    return { user: userResponse(user), tokens };
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

    return { user: userResponse(user), tokens };
  }

  async getCurrentUser(userId: number): Promise<AuthUserResponse> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    await subscriptionService.ensureFreeSubscription(userId);
    const subscription = await userSubscriptionRepository.findByUserId(userId);

    return {
      ...userResponse(user),
      subscription: subscription
        ? {
            planName: subscription.plan.name,
            status: subscription.status,
            workspaceLimit: subscription.plan.workspaceLimit,
          }
        : null,
    };
  }

  async verifyEmail(token: string): Promise<AuthUserResponse> {
    const tokenHash = hashToken(token);
    const stored = await emailVerificationTokenRepository.findByTokenHash(tokenHash);

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) {
        await emailVerificationTokenRepository.deleteById(stored.id);
      }
      throw new BadRequestError('Invalid or expired verification token');
    }

    const user = await userRepository.findByEmail(stored.email);
    if (!user) {
      await emailVerificationTokenRepository.deleteById(stored.id);
      throw new BadRequestError('Invalid or expired verification token');
    }

    if (user.emailVerified) {
      await emailVerificationTokenRepository.deleteById(stored.id);
      return userResponse(user);
    }

    const updatedUser = await userRepository.markEmailVerified(user.id);
    await emailVerificationTokenRepository.deleteById(stored.id);

    return userResponse(updatedUser);
  }

  async resendVerificationEmail(userId: number): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (user.provider !== AuthProvider.LOCAL) {
      throw new BadRequestError('Email verification is not required for this account');
    }

    if (user.emailVerified) {
      throw new BadRequestError('Email is already verified');
    }

    await this.sendVerificationEmail(user.email);
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await userRepository.findByEmail(dto.email);

    // Always succeed silently to avoid leaking whether the email exists
    if (!user || !user.passwordHash || user.provider !== AuthProvider.LOCAL) {
      return;
    }

    const token = generateSecureToken();
    const tokenHash = hashToken(token);

    await passwordResetTokenRepository.deleteByEmail(user.email);
    await passwordResetTokenRepository.create({
      email: user.email,
      tokenHash,
      expiresAt: getPasswordResetExpiry(),
    });

    await emailService.sendPasswordResetEmail(user.email, token);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const tokenHash = hashToken(dto.token);
    const stored = await passwordResetTokenRepository.findByTokenHash(tokenHash);

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) {
        await passwordResetTokenRepository.deleteById(stored.id);
      }
      throw new BadRequestError('Invalid or expired reset token');
    }

    const user = await userRepository.findByEmail(stored.email);
    if (!user || !user.passwordHash) {
      await passwordResetTokenRepository.deleteById(stored.id);
      throw new BadRequestError('Invalid or expired reset token');
    }

    const passwordHash = await hashPassword(dto.password);
    await userRepository.updatePasswordHash(user.id, passwordHash);
    await passwordResetTokenRepository.deleteById(stored.id);
    await refreshTokenRepository.deleteAllByUserId(user.id);
  }

  async googleAuth(profile: GoogleProfile): Promise<AuthResult> {
    googleAuthService.assertConfigured();

    const email = profile.email.toLowerCase();
    let user =
      (await userRepository.findByProvider(AuthProvider.GOOGLE, profile.sub)) ??
      (await userRepository.findByProviderId(profile.sub));

    if (!user) {
      const existingByEmail = await userRepository.findByEmail(email);

      if (existingByEmail) {
        if (existingByEmail.providerId && existingByEmail.providerId !== profile.sub) {
          throw new ConflictError('This email is linked to a different Google account');
        }

        user = await userRepository.linkGoogleAccount(existingByEmail.id, {
          providerId: profile.sub,
          avatar: profile.picture,
          fullName: profile.name,
        });
      } else {
        user = await userRepository.createOAuthUser({
          fullName: profile.name,
          email,
          provider: AuthProvider.GOOGLE,
          providerId: profile.sub,
          avatar: profile.picture,
        });
        await subscriptionService.ensureFreeSubscription(user.id);
      }
    } else {
      user = await userRepository.updateOAuthProfile(user.id, {
        fullName: profile.name,
        avatar: profile.picture,
      });
    }

    const tokens = await this.issueTokens(user);
    return { user: userResponse(user), tokens };
  }
}

export const authService = new AuthService();
