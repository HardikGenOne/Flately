import type { AuthSession, User } from '@/types'
import { apiRequest } from '@/services/api'
import { runtimeConfig } from '@/config/runtimeConfig'

type Credentials = {
  email: string
  password: string
}

export class AuthTransport {
  signInWithPassword(payload: Credentials): Promise<AuthSession> {
    return apiRequest<AuthSession>({
      method: 'POST',
      url: '/auth/login',
      data: payload,
    })
  }

  signUpWithPassword(payload: Credentials & { name?: string }): Promise<AuthSession> {
    return apiRequest<AuthSession>({
      method: 'POST',
      url: '/auth/signup',
      data: payload,
    })
  }

  getGoogleAuthStartUrl(source?: string): string {
    const url = new URL('/auth/google/start', runtimeConfig.apiBaseUrl)

    if (source) {
      url.searchParams.set('source', source)
    }

    if (typeof window !== 'undefined' && window.location?.origin) {
      const origin = window.location.origin
      url.searchParams.set('origin', origin)
      url.searchParams.set('redirectOrigin', origin)
    }

    return url.toString()
  }

  exchangeGoogleAuthCode(code: string): Promise<AuthSession> {
    return apiRequest<AuthSession>({
      method: 'GET',
      url: '/auth/google/exchange',
      params: {
        code,
      },
    })
  }

  getCurrentUser(): Promise<User> {
    return apiRequest<User>({
      method: 'GET',
      url: '/users/me',
    })
  }
}

const authTransport = new AuthTransport()

export function signInWithPassword(payload: Credentials): Promise<AuthSession> {
  return authTransport.signInWithPassword(payload)
}

export function signUpWithPassword(payload: Credentials & { name?: string }): Promise<AuthSession> {
  return authTransport.signUpWithPassword(payload)
}

export function getGoogleAuthStartUrl(source?: string): string {
  return authTransport.getGoogleAuthStartUrl(source)
}

export function exchangeGoogleAuthCode(code: string): Promise<AuthSession> {
  return authTransport.exchangeGoogleAuthCode(code)
}

export function getCurrentUser(): Promise<User> {
  return authTransport.getCurrentUser()
}
