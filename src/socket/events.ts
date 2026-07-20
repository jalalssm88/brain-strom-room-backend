/**
 * Socket.IO event name constants.
 */
export const SOCKET_EVENTS = {
  WORKSPACE_JOIN: 'workspace:join',
  WORKSPACE_LEAVE: 'workspace:leave',
  NOTE_CREATE: 'note:create',
  NOTE_UPDATE: 'note:update',
  NOTE_DELETE: 'note:delete',
  COMMENT_CREATE: 'comment:create',
  COMMENT_UPDATE: 'comment:update',
  COMMENT_DELETE: 'comment:delete',
  VOTE_TOGGLE: 'vote:toggle',
  SELECTION_UPDATE: 'selection:update',
  CHAT_MESSAGE: 'chat:message',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  WEBRTC_OFFER: 'webrtc:offer',
  WEBRTC_ANSWER: 'webrtc:answer',
  WEBRTC_ICE: 'webrtc:ice',
} as const;

export const SOCKET_BROADCAST_EVENTS = {
  NOTE_CREATED: 'note:created',
  NOTE_UPDATED: 'note:updated',
  NOTE_DELETED: 'note:deleted',
  COMMENT_CREATED: 'comment:created',
  COMMENT_UPDATED: 'comment:updated',
  COMMENT_DELETED: 'comment:deleted',
  VOTE_CREATED: 'vote:created',
  VOTE_DELETED: 'vote:deleted',
  NOTIFICATION_NEW: 'notification:new',
  PRESENCE_UPDATE: 'presence:update',
  SELECTION_UPDATE: 'selection:update',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
} as const;
