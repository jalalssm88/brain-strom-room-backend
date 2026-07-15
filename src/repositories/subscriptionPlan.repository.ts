import { SubscriptionPlan } from '../prisma';
import { prisma } from '../config/database';
import { PLAN_NAMES } from '../constants/subscription';
import { WORKSPACE_LIMITS } from '../constants';

export class SubscriptionPlanRepository {
  async findByName(name: string): Promise<SubscriptionPlan | null> {
    return prisma.subscriptionPlan.findUnique({ where: { name } });
  }

  async findFreePlan(): Promise<SubscriptionPlan> {
    const existing = await this.findByName(PLAN_NAMES.FREE);
    if (existing) return existing;

    return prisma.subscriptionPlan.create({
      data: {
        name: PLAN_NAMES.FREE,
        priceMonthly: 0,
        workspaceLimit: WORKSPACE_LIMITS.FREE,
        features: {},
      },
    });
  }
}

export const subscriptionPlanRepository = new SubscriptionPlanRepository();
