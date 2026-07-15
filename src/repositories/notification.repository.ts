import { Notification } from '../prisma';
import { prisma } from '../config/database';
import { CreateNotificationData } from '../types/notification.types';

export class NotificationRepository {
  async create(data: CreateNotificationData): Promise<Notification> {
    return prisma.notification.create({ data });
  }

  async findByUserId(userId: number, offset: number, limit: number): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });
  }

  async countByUserId(userId: number): Promise<number> {
    return prisma.notification.count({ where: { userId } });
  }

  async countUnreadByUserId(userId: number): Promise<number> {
    return prisma.notification.count({ where: { userId, isRead: false } });
  }

  async findByIdAndUserId(id: number, userId: number): Promise<Notification | null> {
    return prisma.notification.findFirst({ where: { id, userId } });
  }

  async markAsRead(id: number, userId: number): Promise<Notification | null> {
    const notification = await this.findByIdAndUserId(id, userId);
    if (!notification) return null;

    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: number): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}

export const notificationRepository = new NotificationRepository();
