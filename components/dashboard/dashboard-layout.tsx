"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"

interface DashboardLayoutProps {
  children: ReactNode
  electionToken?: string
  userRole?: string
}

export function DashboardLayout({ children, electionToken, userRole }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar
          electionToken={electionToken}
          userRole={userRole}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 lg:ml-64">
          <Header electionToken={electionToken} userRole={userRole} onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
