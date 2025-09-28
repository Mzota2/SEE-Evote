"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { signOut } from "@/lib/auth"
import { cn } from "@/lib/utils"
import {
  Home,
  Vote,
  BookOpen,
  Settings,
  LogOut,
  User,
  Users,
  Calendar,
  BarChart3,
  Shield,
  UserCheck,
  X,
} from "lucide-react"
import Logo from "../Logo/Logo"

interface SidebarProps {
  electionToken?: string
  userRole?: string
  isOpen?: boolean
  onClose?: () => void
}

const getNavigation = (userRole: string, electionToken?: string) => {
  const baseNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    // { name: "Profile", href: "/profile", icon: User },
    // { name: "Settings", href: "/settings", icon: Settings },
  ]

  // If we're in an election-specific dashboard
  if (electionToken) {
    const electionBase = `/dashboard/${electionToken}`

    if (userRole === "admin") {
      return [
        ...baseNavigation,
        { name: "Election Overview", href: electionBase, icon: Calendar },
        { name: "Positions", href: `${electionBase}/positions`, icon: Vote },
        { name: "Candidates", href: `${electionBase}/candidates`, icon: Users },
        { name: "Voters", href: `${electionBase}/voters`, icon: UserCheck },
        { name: "Results", href: `${electionBase}/results`, icon: BarChart3 },
        // { name: "Activity Logs", href: `${electionBase}/logs`, icon: FileText },
        { name: "Election Settings", href: `${electionBase}/settings`, icon: Settings },
      ]
    } else {
      // Voter navigation
      return [
        ...baseNavigation,
        { name: "Election Info", href: electionBase, icon: Calendar },
        { name: "Cast Vote", href: `${electionBase}/vote`, icon: Vote },
        { name: "Voting Guidelines", href: `${electionBase}/guidelines`, icon: BookOpen },
        { name: "Results", href: `${electionBase}/results`, icon: BarChart3 },
      ]
    }
  }

  // Global dashboard navigation (no specific election)
  return baseNavigation
}

export function Sidebar({ electionToken, userRole, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()

  const navigation = user ? getNavigation(userRole as string, electionToken) : []

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Close Button */}
          <div className="flex items-center justify-between p-6 border-b">
            <Logo />
            {onClose && (
              <button onClick={onClose} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* User Profile */}
          {user && (
            <div className="p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  {userRole === "admin" || userRole === "superAdmin" ? (
                    <Shield className="w-6 h-6 text-gray-600" />
                  ) : (
                    <User className="w-6 h-6 text-gray-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-800 truncate">{user.name}</p>
                  <p className="text-sm text-gray-600 capitalize">{userRole}</p>
                  {electionToken && <p className="text-xs text-gray-500 font-mono truncate">{electionToken}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href} onClick={onClose}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      isActive ? "bg-ivote-primary text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-800",
                    )}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start gap-3 text-gray-600 hover:text-gray-800"
            >
              <LogOut className="w-5 h-5" />
              Log out
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
