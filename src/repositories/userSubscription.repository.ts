import { UserSubscription, SubscriptionStatus } from '@prisma/client';
import { prisma } from '../config/database';

export interface CreateUserSubscriptionData {
  userId: number;
  planId: number;
  status?: SubscriptionStatus;
}

export type UserSubscriptionWithPlan = UserSubscription & {
  plan: { name: string; workspaceLimit: number | null };
};

export class UserSubscriptionRepository {
  async findByUserId(userId: number): Promise<UserSubscriptionWithPlan | null> {
    return prisma.userSubscription.findUnique({
      where: { userId },
      include: {
        plan: {
          select: { name: true, workspaceLimit: true },
        },
      },
    });
  }

  async create(data: CreateUserSubscriptionData): Promise<UserSubscription> {
    return prisma.userSubscription.create({
      data: {
        userId: data.userId,
        planId: data.planId,
        status: data.status,
      },
    });
  }
}

export const userSubscriptionRepository = new UserSubscriptionRepository();
