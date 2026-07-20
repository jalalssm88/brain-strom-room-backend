import { Socket } from 'socket.io';
import { verifyAccessToken } from '../../utils/jwt';
import { userRepository } from '../../repositories/user.repository';

export interface AuthenticatedSocketData {
  userId: number;
  email: string;
  fullName: string;
  avatar: string | null;
}

export type AuthenticatedSocket = Socket & {
  data: AuthenticatedSocketData;
};

export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void,
): Promise<void> => {
  try {
    const token =
      (socket.handshake.auth?.token as string | undefined) ||
      (socket.handshake.headers.authorization?.startsWith('Bearer ')
        ? socket.handshake.headers.authorization.slice(7)
        : undefined);

    if (!token) {
      next(new Error('Authentication required'));
      return;
    }

    const payload = verifyAccessToken(token);
    const user = await userRepository.findById(payload.userId);
    if (!user) {
      next(new Error('User not found'));
      return;
    }

    socket.data = {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      avatar: user.avatar,
    } satisfies AuthenticatedSocketData;

    next();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Authentication failed';
    next(new Error(message));
  }
};
