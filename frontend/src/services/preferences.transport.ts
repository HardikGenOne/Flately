import type { Preference } from '@/types'
import { apiRequest } from '@/services/api'

type PreferencePayload = Omit<
  Preference,
  'id' | 'userId' | 'createdAt' | 'updatedAt'
>

export class PreferencesTransport {
  getMyPreferences(): Promise<Preference | null> {
    return apiRequest<Preference | null>({
      method: 'GET',
      url: '/preferences/me',
    })
  }

  saveMyPreferences(payload: PreferencePayload): Promise<Preference> {
    return apiRequest<Preference>({
      method: 'POST',
      url: '/preferences/me',
      data: payload,
    })
  }
}

const preferencesTransport = new PreferencesTransport()

export function getMyPreferences(): Promise<Preference | null> {
  return preferencesTransport.getMyPreferences()
}

export function saveMyPreferences(payload: PreferencePayload): Promise<Preference> {
  return preferencesTransport.saveMyPreferences(payload)
}
