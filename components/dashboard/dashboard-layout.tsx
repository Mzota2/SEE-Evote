"use client"

import type { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"

interface DashboardLayoutProps {
  children: ReactNode
  electionToken?: string
  userRole?: string
}

export function DashboardLayout({ children, electionToken, userRole }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar electionToken={electionToken} userRole={userRole} />
        <div className="flex-1 ml-64">
          <Header electionToken={electionToken} userRole={userRole} />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
