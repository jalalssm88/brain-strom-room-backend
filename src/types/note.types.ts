export interface NoteResponse {
  id: number;
  workspaceId: number;
  createdById: number;
  title: string;
  content: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  authorName: string;
  voteCount: number;
  commentCount: number;
  hasVoted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteDto {
  title: string;
  content?: string;
  color?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface UpdateNoteDto {
  title?: string;
  content?: string;
  color?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}
