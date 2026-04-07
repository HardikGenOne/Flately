export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  start: '/start',
  authCallback: '/auth/callback',
  appRoot: '/app',
  appOnboarding: '/app/onboarding',
  appDiscover: '/app/discover',
  appMatches: '/app/matches',
  appChat: '/app/chat',
  appProfile: '/app/profile',
} as const

export const AUTH_SOURCE = {
  questionnaire: 'questionnaire',
} as const

export const AUTH_REASON = {
  sessionExpired: 'session-expired',
} as const

export const APP_CHILD_ROUTE_SEGMENTS = {
  onboarding: 'onboarding',
  discover: 'discover',
  matches: 'matches',
  chat: 'chat/:matchId?',
  profile: 'profile',
} as const

type SidebarRoutePath =
  | typeof ROUTES.appRoot
  | typeof ROUTES.appDiscover
  | typeof ROUTES.appMatches
  | typeof ROUTES.appChat
  | typeof ROUTES.appProfile

export type SidebarNavItem = {
  label: string
  path: SidebarRoutePath
}

export const SIDEBAR_NAV_ITEMS: readonly SidebarNavItem[] = [
  { label: 'Dashboard', path: ROUTES.appRoot },
  { label: 'Discovery', path: ROUTES.appDiscover },
  { label: 'Matches', path: ROUTES.appMatches },
  { label: 'Chat', path: ROUTES.appChat },
  { label: 'Profile', path: ROUTES.appProfile },
]

type QueryValue = string | number | boolean | null | undefined

export function buildPathWithQuery(path: string, query: Record<string, QueryValue>): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) {
      continue
    }

    params.set(key, String(value))
  }

  const queryString = params.toString()
  return queryString ? `${path}?${queryString}` : path
}

export function buildAppChatPath(matchId?: string): string {
  if (!matchId) {
    return ROUTES.appChat
  }

  return `${ROUTES.appChat}/${matchId}`
}
