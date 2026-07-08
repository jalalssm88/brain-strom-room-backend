import { AuthProvider, User } from '@prisma/client';
import { prisma } from '../config/database';

export interface CreateUserData {
  fullName: string;
  email: string;
  passwordHash: string;
  provider?: AuthProvider;
}

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
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
}

export const userRepository = new UserRepository();
