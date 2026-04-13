import type { Profile } from '@/types'
import { apiRequest } from '@/services/api'

type ProfilePayload = Partial<
  Omit<
    Profile,
    'id' | 'userId' | 'onboardingCompleted' | 'createdAt' | 'updatedAt'
  > & {
    onboardingCompleted: boolean
  }
>

export class ProfileTransport {
  getMyProfile(): Promise<Profile | null> {
    return apiRequest<Profile | null>({
      method: 'GET',
      url: '/profiles/me',
    })
  }

  saveMyProfile(payload: ProfilePayload): Promise<Profile> {
    return apiRequest<Profile>({
      method: 'POST',
      url: '/profiles/me',
      data: payload,
    })
  }
}

const profileTransport = new ProfileTransport()

export function getMyProfile(): Promise<Profile | null> {
  return profileTransport.getMyProfile()
}

export function saveMyProfile(payload: ProfilePayload): Promise<Profile> {
  return profileTransport.saveMyProfile(payload)
}
