import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/app/AppLayout'
import { ProtectedRoute } from '@/app/ProtectedRoute'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { GoogleAuthCallbackPage } from '@/pages/GoogleAuthCallbackPage'
import { PreAuthQuestionnairePage } from '@/features/preauth/PreAuthQuestionnairePage'
import { OnboardingPage } from '@/features/onboarding/OnboardingPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { DiscoveryPage } from '@/features/discovery/DiscoveryPage'
import { MatchesPage } from '@/features/matches/MatchesPage'
import { ChatPage } from '@/features/chat/ChatPage'
import { ProfileEditorPage } from '@/features/profile/ProfileEditorPage'
import { APP_CHILD_ROUTE_SEGMENTS, ROUTES } from '@/app/routes'

export const router = createBrowserRouter([
  {
    path: ROUTES.home,
    element: <LandingPage />,
  },
  {
    path: ROUTES.login,
    element: <LoginPage />,
  },
  {
    path: ROUTES.signup,
    element: <SignupPage />,
  },
  {
    path: ROUTES.start,
    element: <PreAuthQuestionnairePage />,
  },
  {
    path: ROUTES.authCallback,
    element: <GoogleAuthCallbackPage />,
  },
  {
    path: ROUTES.appRoot,
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: APP_CHILD_ROUTE_SEGMENTS.onboarding,
        element: (
          <ProtectedRoute allowIncompleteProfile>
            <OnboardingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: APP_CHILD_ROUTE_SEGMENTS.discover,
        element: (
          <ProtectedRoute>
            <DiscoveryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: APP_CHILD_ROUTE_SEGMENTS.matches,
        element: (
          <ProtectedRoute>
            <MatchesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: APP_CHILD_ROUTE_SEGMENTS.chat,
        element: (
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        ),
      },
      {
        path: APP_CHILD_ROUTE_SEGMENTS.profile,
        element: (
          <ProtectedRoute>
            <ProfileEditorPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.home} replace />,
  },
])
