export interface VoteResponse {
  id: number;
  noteId: number;
  userId: number;
  userName: string;
  createdAt: string;
}

export interface VotesSummaryResponse {
  votes: VoteResponse[];
  count: number;
  hasVoted: boolean;
}

export interface VoteToggleResponse {
  voted: boolean;
  count: number;
}
