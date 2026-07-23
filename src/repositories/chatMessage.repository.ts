import { ChatMessage } from '../prisma';
import { prisma } from '../config/database';

export type ChatMessageWithSender = ChatMessage & {
  sender: { id: number; fullName: string; avatar: string | null };
};

export class ChatMessageRepository {
  async create(workspaceId: number, senderId: number, message: string): Promise<ChatMessageWithSender> {
    return prisma.chatMessage.create({
      data: {
        workspaceId,
        senderId,
        message,
      },
      include: {
        sender: {
          select: { id: true, fullName: true, avatar: true },
        },
      },
    });
  }

  async findByWorkspaceCursor(
    workspaceId: number,
    limit: number,
    cursor?: number,
  ): Promise<ChatMessageWithSender[]> {
    return prisma.chatMessage.findMany({
      where: {
        workspaceId,
        ...(cursor ? { id: { lt: cursor } } : {}),
      },
      orderBy: { id: 'desc' },
      take: limit,
      include: {
        sender: {
          select: { id: true, fullName: true, avatar: true },
        },
      },
    });
  }
}

export const chatMessageRepository = new ChatMessageRepository();
