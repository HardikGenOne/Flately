import { io, type Socket } from 'socket.io-client'
import { runtimeConfig } from '@/config/runtimeConfig'
import type { ChatMessage } from '@/types'
import { readPersistedSession } from '../auth/auth.storage'

type ClientToServerEvents = {
  joinRoom: (roomId: string) => void
  sendMessage: (payload: {
    conversationId: string
    content: string
  }) => void
}

type ServerToClientEvents = {
  message: (payload: ChatMessage) => void
  error: (payload: {code: string, message?: string}) => void
}

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null

export function getChatSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (!socket) {
    const session = readPersistedSession();
    // Assuming the access token would be read from an interceptor
    socket = io(runtimeConfig.socketUrl, {
      transports: ['websocket'],
      auth: {
         token: session?.accessToken || ''
      }
    })
  }

  return socket
}

export function updateSocketToken(token: string) {
    if (socket) {
        socket.auth = { token };
        socket.disconnect().connect();
    }
}
