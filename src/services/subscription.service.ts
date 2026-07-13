import { subscriptionPlanRepository } from '../repositories/subscriptionPlan.repository';
import { userSubscriptionRepository } from '../repositories/userSubscription.repository';

export class SubscriptionService {
  async ensureFreeSubscription(userId: number): Promise<void> {
    const existing = await userSubscriptionRepository.findByUserId(userId);
    if (existing) return;

    const freePlan = await subscriptionPlanRepository.findFreePlan();
    await userSubscriptionRepository.create({
      userId,
      planId: freePlan.id,
    });
  }

  async getWorkspaceLimit(userId: number): Promise<number | null> {
    await this.ensureFreeSubscription(userId);

    const subscription = await userSubscriptionRepository.findByUserId(userId);
    return subscription?.plan.workspaceLimit ?? null;
  }
}

export const subscriptionService = new SubscriptionService();
