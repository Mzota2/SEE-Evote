"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { VotersList } from "@/components/admin/voters-list"
import { getUserRoles, getUsersByOrganization } from "@/lib/database"
import type { Role, User } from "@/lib/types"

interface ElectionDashboardPageProps {
  params: {
    electionToken: string
  }
}
export default function VotersPage({ params }: ElectionDashboardPageProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [userRole, setUserRole] = useState<Role | null>(null)
  const [loadingData, setLoadingData] =useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voters, setVoters] = useState<User[]>([])
  const [loadingVoters, setLoadingVoters] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  useEffect(() => {


    const fetchUserRole = async () => {
      if (!user) return
      try {
        // Fetch user roles to verify access
        const { roles } = await getUserRoles(user.id)
        const relevantRole = roles.find(
          (role) => (role.electionToken === params.electionToken) && (role.status === "approved"),
        )

        if (!relevantRole) {
          setError("You don't have access to this election")
          setLoadingData(false)
          return
        }

        setUserRole(relevantRole)
        setLoadingData(false)

      } catch (err) {
        setError("Failed to load election data")
        setLoadingData(false)
      }
    }

    fetchUserRole()
  }, [user, params.electionToken])


  useEffect(() => {
    const fetchVoters = async () => {
      if (user && (userRole?.role === "admin" || userRole?.role === "superAdmin")) {
        const { users: fetchedUsers, error } = await getUsersByOrganization(userRole.organizationId)
        console.log('voters',fetchedUsers)
        console.log(error);
        setVoters(fetchedUsers.filter((u) => u.id !== user.id))
        setLoadingVoters(false)
      }
    }

    fetchVoters()
  }, [user, userRole])

  if (loading || !user || (userRole?.role !== "admin" && userRole?.role !== "superAdmin")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ivote-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Voters Management</h1>
          <p className="text-gray-600">Manage registered voters and their permissions</p>
        </div>

        <VotersList voters={voters} loading={loadingVoters} onVotersUpdate={setVoters} />
      </div>
    </DashboardLayout>
  )
}
