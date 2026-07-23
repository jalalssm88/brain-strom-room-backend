import { MemberRole } from '../prisma';
import { ForbiddenError, BadRequestError } from '../errors/AppError';
import { chatMessageRepository, ChatMessageWithSender } from '../repositories/chatMessage.repository';
import {
  ChatHistoryResult,
  ChatMessageResponse,
  SendChatMessageDto,
} from '../types/chat.types';

const DEFAULT_CHAT_LIMIT = 30;
const MAX_CHAT_LIMIT = 100;

const toChatMessageResponse = (row: ChatMessageWithSender): ChatMessageResponse => ({
  id: row.id,
  workspaceId: row.workspaceId,
  senderId: row.senderId,
  senderName: row.sender.fullName,
  senderAvatar: row.sender.avatar,
  type: row.type,
  message: row.message,
  createdAt: row.createdAt.toISOString(),
});

const canSendChat = (role: MemberRole): boolean =>
  role === MemberRole.ADMIN || role === MemberRole.EDITOR;

export class ChatService {
  async listMessages(
    workspaceId: number,
    options: { cursor?: number; limit?: number },
  ): Promise<ChatHistoryResult> {
    const requested = options.limit ?? DEFAULT_CHAT_LIMIT;
    const limit = Math.min(Math.max(requested, 1), MAX_CHAT_LIMIT);

    const rows = await chatMessageRepository.findByWorkspaceCursor(
      workspaceId,
      limit + 1,
      options.cursor,
    );
    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    page.reverse();

    return {
      messages: page.map(toChatMessageResponse),
      nextCursor: hasMore && page.length > 0 ? page[0].id : null,
      hasMore,
    };
  }

  async sendMessage(
    workspaceId: number,
    userId: number,
    role: MemberRole,
    dto: SendChatMessageDto,
  ): Promise<ChatMessageResponse> {
    if (!canSendChat(role)) {
      throw new ForbiddenError('Viewers cannot send chat messages');
    }

    const message = dto.message?.trim();
    if (!message) {
      throw new BadRequestError('Message is required');
    }
    if (message.length > 2000) {
      throw new BadRequestError('Message must be at most 2000 characters');
    }

    const row = await chatMessageRepository.create(workspaceId, userId, message);
    return toChatMessageResponse(row);
  }
}

export const chatService = new ChatService();
