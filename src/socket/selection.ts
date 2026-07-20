import { colorForUserId } from './selectionColors';

export interface NoteSelection {
  userId: number;
  fullName: string;
  noteId: number;
  color: string;
}

/** workspaceId → (userId → selection) */
const selectionsByWorkspace = new Map<number, Map<number, NoteSelection>>();

export const selectionStore = {
  set(
    workspaceId: number,
    userId: number,
    fullName: string,
    noteId: number | null,
  ): NoteSelection | { userId: number; noteId: null } {
    let room = selectionsByWorkspace.get(workspaceId);
    if (!room) {
      room = new Map();
      selectionsByWorkspace.set(workspaceId, room);
    }

    if (noteId == null) {
      room.delete(userId);
      if (room.size === 0) selectionsByWorkspace.delete(workspaceId);
      return { userId, noteId: null };
    }

    const selection: NoteSelection = {
      userId,
      fullName,
      noteId,
      color: colorForUserId(userId),
    };
    room.set(userId, selection);
    return selection;
  },

  clearUser(workspaceId: number, userId: number): void {
    const room = selectionsByWorkspace.get(workspaceId);
    if (!room) return;
    room.delete(userId);
    if (room.size === 0) selectionsByWorkspace.delete(workspaceId);
  },

  clearUserEverywhere(userId: number): number[] {
    const affected: number[] = [];
    for (const [workspaceId, room] of selectionsByWorkspace.entries()) {
      if (!room.has(userId)) continue;
      room.delete(userId);
      affected.push(workspaceId);
      if (room.size === 0) selectionsByWorkspace.delete(workspaceId);
    }
    return affected;
  },

  list(workspaceId: number): NoteSelection[] {
    const room = selectionsByWorkspace.get(workspaceId);
    if (!room) return [];
    return Array.from(room.values());
  },
};
