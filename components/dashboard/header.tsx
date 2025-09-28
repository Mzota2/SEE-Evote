"use client"

import { HelpCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { GlobalSearch } from "@/components/search/global-search"
import Link from "next/link"

interface HeaderProps {
  electionToken?: string
  userRole?: string
}

export function Header({ electionToken, userRole }: HeaderProps) {
  const { user } = useAuth()

  return (
    <header className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Back button and Search */}
        <div className="flex items-center gap-4 flex-1 max-w-md">
          {electionToken && (
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
          )}
          <GlobalSearch />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Election Token Display */}
          {electionToken && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
              <span className="text-xs text-gray-600">Election:</span>
              <span className="text-xs font-mono text-gray-800">{electionToken}</span>
            </div>
          )}

          <NotificationCenter />
          <Button variant="ghost" size="sm">
            <HelpCircle className="w-5 h-5" />
          </Button>
          {user && (
            <Link href={`/dashboard/${electionToken}/profile`} className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="hidden md:block">
                <span className="font-medium text-gray-800">{user.name.split(" ")[0]}</span>
                {userRole && <p className="text-xs text-gray-600 capitalize">{userRole}</p>}
              </div>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
