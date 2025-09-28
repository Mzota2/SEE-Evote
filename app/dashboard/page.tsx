"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getUserRoles } from "@/lib/database"
import { DashboardAnalytics } from "@/components/analytics/dashboard-analytics"
import type { Role } from "@/lib/types"
import { Vote, Settings, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react"
import Link from "next/link"
import Logo from "@/components/Logo/Logo"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [roles, setRoles] = useState<Role[]>([])
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [showAnalytics, setShowAnalytics] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (user) {
        const { roles: fetchedRoles } = await getUserRoles(user.id)
        setRoles(fetchedRoles)
        setLoadingRoles(false)
      }
    }

    fetchUserRoles()
  }, [user])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ivote-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Active"
      case "pending":
        return "Pending Approval"
      case "rejected":
        return "Rejected"
      default:
        return "Unknown"
    }
  }

  const getRoleIcon = (role: string) => {
    return role === "admin" ? <Settings className="w-5 h-5" /> : <Vote className="w-5 h-5" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Logo />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Hello, {user.name.split(" ")[0]}!</h1>
          <p className="text-gray-600">Welcome to your SEE-Evote Dashboard</p>
        </div>

        {loadingRoles ? (
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-ivote-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your elections...</p>
          </div>
        ) : roles.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Vote className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">No Elections Found</h3>
              <p className="text-gray-600">
                You haven't joined any elections yet. Join an election or request to create one.
              </p>
              <Link href="/post-registration">
                <Button className="bg-ivote-primary hover:bg-ivote-primary/90">Join or Create Election</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Your Elections</h2>
              <Button
                onClick={() => setShowAnalytics(!showAnalytics)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                {showAnalytics ? "Hide Analytics" : "Show Analytics"}
              </Button>
            </div>

            {showAnalytics && <DashboardAnalytics roles={roles} />}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((role) => (
                <Card key={role.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(role.role)}
                        <span className="font-medium text-gray-800 capitalize">{role.role}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(role.status)}
                        <span className="text-sm text-gray-600">{getStatusText(role.status)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-800">Election Token</h3>
                      <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">{role.electionToken}</p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700">Organization</h4>
                      <p className="text-sm text-gray-600">{role.organizationId}</p>
                    </div>

                    {role.status === "approved" ? (
                      <Link href={`/dashboard/${role.electionToken}`}>
                        <Button className="w-full bg-ivote-primary hover:bg-ivote-primary/90">Enter Dashboard</Button>
                      </Link>
                    ) : role.status === "pending" ? (
                      <Button disabled className="w-full">
                        Awaiting Approval
                      </Button>
                    ) : role.status === "rejected" ? (
                      <Button disabled className="w-full bg-red-500">
                        {" "}
                        Rejected
                      </Button>
                    ) : (
                      <Button disabled className="w-full">
                        Inactive
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-6 bg-gradient-to-r from-ivote-primary/10 to-ivote-secondary/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Need to join another election?</h3>
                  <p className="text-gray-600">Join additional elections or request to create a new workspace.</p>
                </div>
                <Link href="/post-registration">
                  <Button
                    variant="outline"
                    className="border-ivote-primary text-ivote-primary hover:bg-ivote-primary hover:text-white bg-transparent"
                  >
                    Join/Create Election
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
