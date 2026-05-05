import type { Match } from '@/types'
import { apiRequest } from '@/services/api'

export class MatchesTransport {
  getMyMatches(): Promise<Match[]> {
    return apiRequest<Match[]>({
      method: 'GET',
      url: '/matches/me',
    })
  }
}

const matchesTransport = new MatchesTransport()

export function getMyMatches(): Promise<Match[]> {
  return matchesTransport.getMyMatches()
}
