export interface CommentResponse {
  id: number;
  noteId: number;
  userId: number;
  message: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentDto {
  message: string;
}

export interface UpdateCommentDto {
  message: string;
}
