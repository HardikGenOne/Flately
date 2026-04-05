// @ts-nocheck
import { Outlet } from 'react-router-dom'

import { AppSidebar } from '../components/layout/AppSidebar'

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-surface-50 text-slate-900">
      {/* Sidebar */}
      <AppSidebar />
      
      {/* Main Content */}
      <main className="flex min-h-screen min-w-0 flex-1 bg-canvas">
        <Outlet />
      </main>
    </div>
  )
}