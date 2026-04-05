// @ts-nocheck
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "./AppLayout";

import Landing from "../pages/Landing";
import NotFound from "../pages/NotFound";

// Import all page components
import DashboardPage from "../features/dashboard/DashboardPage";
import MatchesPage from "../features/matches/MatchesPage";
import DiscoveryPage from "../features/discovery/DiscoveryPage";
import OnboardingPage from "../features/onboarding/OnboardingPage";
import ChatPage from "../features/chat/ChatPage";

const PlaceholderPage = ({ title, subtitle }) => (
    <section className="p-6">
        <div className="rounded-lg border border-neutral-border bg-white p-6">
            <h1 className="text-xl font-bold text-slate-900">{title}</h1>
            <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
        </div>
    </section>
);

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Landing />
    },
    {
        element: <AppLayout />,
        children: [
            {
                path: "/app",
                element: (
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "/app/onboarding",
                element: (
                    <ProtectedRoute>
                        <OnboardingPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "/app/discover",
                element: (
                    <ProtectedRoute>
                        <DiscoveryPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "/app/matches",
                element: (
                    <ProtectedRoute>
                        <MatchesPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "/app/chat/:matchId?",
                element: (
                    <ProtectedRoute>
                        <ChatPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "/app/calendar",
                element: (
                    <ProtectedRoute>
                        <PlaceholderPage
                            title="Calendar"
                            subtitle="Calendar is available as a placeholder in Design-0 and will be expanded in a follow-up UI phase."
                        />
                    </ProtectedRoute>
                )
            },
            {
                path: "/app/filters",
                element: (
                    <ProtectedRoute>
                        <PlaceholderPage
                            title="Filters"
                            subtitle="Filters is available as a placeholder in Design-0 and will be expanded in a follow-up UI phase."
                        />
                    </ProtectedRoute>
                )
            },
            {
                path: "/app/settings",
                element: (
                    <ProtectedRoute>
                        <PlaceholderPage
                            title="Settings"
                            subtitle="Settings is available as a placeholder in Design-0 and will be expanded in a follow-up UI phase."
                        />
                    </ProtectedRoute>
                )
            }
        ]
    },
    {
        path: "*",
        element: <NotFound />
    }
]);