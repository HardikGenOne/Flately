import type { OpenChatResponse } from '@/types'
import { apiRequest } from '@/services/api'

export class ChatTransport {
  openChat(matchId: string): Promise<OpenChatResponse> {
    return apiRequest<OpenChatResponse>({
      method: 'GET',
      url: `/chat/${matchId}`,
    })
  }
}

const chatTransport = new ChatTransport()

export function openChat(matchId: string): Promise<OpenChatResponse> {
  return chatTransport.openChat(matchId)
}
