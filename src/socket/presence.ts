export interface PresenceUser {
  userId: number;
  fullName: string;
  avatar: string | null;
}

/** workspaceId → (socketId → presence user) */
const presenceByWorkspace = new Map<number, Map<string, PresenceUser>>();

export const presenceStore = {
  add(workspaceId: number, socketId: string, user: PresenceUser): PresenceUser[] {
    let room = presenceByWorkspace.get(workspaceId);
    if (!room) {
      room = new Map();
      presenceByWorkspace.set(workspaceId, room);
    }
    room.set(socketId, user);
    return this.list(workspaceId);
  },

  remove(workspaceId: number, socketId: string): PresenceUser[] {
    const room = presenceByWorkspace.get(workspaceId);
    if (!room) return [];
    room.delete(socketId);
    if (room.size === 0) {
      presenceByWorkspace.delete(workspaceId);
      return [];
    }
    return this.list(workspaceId);
  },

  removeSocket(socketId: string): Array<{ workspaceId: number; users: PresenceUser[] }> {
    const affected: Array<{ workspaceId: number; users: PresenceUser[] }> = [];

    for (const [workspaceId, room] of presenceByWorkspace.entries()) {
      if (!room.has(socketId)) continue;
      room.delete(socketId);
      if (room.size === 0) {
        presenceByWorkspace.delete(workspaceId);
        affected.push({ workspaceId, users: [] });
      } else {
        affected.push({ workspaceId, users: this.list(workspaceId) });
      }
    }

    return affected;
  },

  list(workspaceId: number): PresenceUser[] {
    const room = presenceByWorkspace.get(workspaceId);
    if (!room) return [];

    const byUserId = new Map<number, PresenceUser>();
    for (const user of room.values()) {
      byUserId.set(user.userId, user);
    }
    return Array.from(byUserId.values());
  },

  getWorkspacesForSocket(socketId: string): number[] {
    const ids: number[] = [];
    for (const [workspaceId, room] of presenceByWorkspace.entries()) {
      if (room.has(socketId)) ids.push(workspaceId);
    }
    return ids;
  },
};
