export interface ChatMessageResponse {
  id: number;
  workspaceId: number;
  senderId: number;
  senderName: string;
  senderAvatar: string | null;
  type: string;
  message: string;
  createdAt: string;
}

export interface SendChatMessageDto {
  message: string;
}

export interface ChatHistoryResult {
  messages: ChatMessageResponse[];
  nextCursor: number | null;
  hasMore: boolean;
}
