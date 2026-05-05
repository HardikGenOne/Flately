import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import env from '../config/env';

export interface AuthenticatedSocket extends Socket {
  userId: string;
}

export function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void
): void {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers?.authorization?.replace('Bearer ', '');

  if (!token) {
    return next(new Error('SOCKET_UNAUTHORIZED'));
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string };
    (socket as AuthenticatedSocket).userId = payload.sub;
    next();
  } catch {
    next(new Error('SOCKET_TOKEN_INVALID'));
  }
}
