import { AuthProvider, User } from '../prisma';
import { prisma } from '../config/database';

export interface CreateUserData {
  fullName: string;
  email: string;
  passwordHash: string;
  provider?: AuthProvider;
}

export interface CreateOAuthUserData {
  fullName: string;
  email: string;
  provider: AuthProvider;
  providerId: string;
  avatar?: string | null;
  emailVerified?: Date;
}

export interface LinkGoogleAccountData {
  providerId: string;
  avatar?: string | null;
  fullName?: string;
}

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByProvider(provider: AuthProvider, providerId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: {
        provider_providerId: { provider, providerId },
      },
    });
  }

  async findByProviderId(providerId: string): Promise<User | null> {
    return prisma.user.findFirst({ where: { providerId } });
  }

  async create(data: CreateUserData): Promise<User> {
    return prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        provider: data.provider ?? AuthProvider.LOCAL,
      },
    });
  }

  async createOAuthUser(data: CreateOAuthUserData): Promise<User> {
    return prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        provider: data.provider,
        providerId: data.providerId,
        avatar: data.avatar ?? null,
        emailVerified: data.emailVerified ?? new Date(),
        passwordHash: null,
      },
    });
  }

  async linkGoogleAccount(id: number, data: LinkGoogleAccountData): Promise<User> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    return prisma.user.update({
      where: { id },
      data: {
        providerId: data.providerId,
        emailVerified: user.emailVerified ?? new Date(),
        avatar: user.avatar ?? data.avatar ?? null,
        fullName: data.fullName ?? user.fullName,
      },
    });
  }

  async updateOAuthProfile(
    id: number,
    data: { fullName?: string; avatar?: string | null },
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        ...(data.fullName ? { fullName: data.fullName } : {}),
        ...(data.avatar ? { avatar: data.avatar } : {}),
      },
    });
  }

  async updateProfile(
    id: number,
    data: { fullName: string; avatar?: string | null },
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        fullName: data.fullName,
        ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
      },
    });
  }

  async markEmailVerified(id: number): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { emailVerified: new Date() },
    });
  }

  async updatePasswordHash(id: number, passwordHash: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }
}

export const userRepository = new UserRepository();
