const SELECTION_COLORS = [
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
] as const;

export const colorForUserId = (userId: number): string =>
  SELECTION_COLORS[Math.abs(userId) % SELECTION_COLORS.length];
