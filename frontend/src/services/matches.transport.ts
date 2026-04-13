import type { Match } from '@/types'
import { apiRequest } from '@/services/api'

export class MatchesTransport {
  getMyMatches(): Promise<Match[]> {
    return apiRequest<Match[]>({
      method: 'GET',
      url: '/matches/me',
    })
  }

  connectWithUser(toUserId: string): Promise<{ success: boolean; matched: boolean }> {
    return apiRequest<{ success: boolean; matched: boolean }>({
      method: 'POST',
      url: `/matches/connect/${toUserId}`,
    })
  }
}

const matchesTransport = new MatchesTransport()

export function getMyMatches(): Promise<Match[]> {
  return matchesTransport.getMyMatches()
}

export function connectWithUser(toUserId: string): Promise<{ success: boolean; matched: boolean }> {
  return matchesTransport.connectWithUser(toUserId)
}
