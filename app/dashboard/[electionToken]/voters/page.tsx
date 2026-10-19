"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { VotersList } from "@/components/admin/voters-list"
import { getUsersByOrganization } from "@/lib/database"
import { canManageElection, openElection } from "@/lib/election-access"
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
        const { role: relevantRole, error: accessError } = await openElection(user.id, params.electionToken)

        if (!canManageElection(relevantRole)) {
          setError(accessError || "You don't have access to manage voters for this election")
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
        console.log(userRole.organizationId);
        const { users: fetchedUsers, error } = await getUsersByOrganization(userRole.organizationId)
        console.log('voters',fetchedUsers)
        console.log(error);
        setVoters(fetchedUsers)
        setLoadingVoters(false)
      }
    }

    fetchVoters()
  }, [user, userRole])

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ivote-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !user || !canManageElection(userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <h2 className="text-xl font-semibold text-gray-800">Voters are unavailable</h2>
          <p className="text-gray-600">{error || "You cannot manage voters for this election."}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-ivote-primary text-white px-4 py-2 rounded hover:bg-ivote-primary/90"
          >
            Back to your elections
          </button>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout electionToken={params.electionToken} userRole={userRole.role}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Voters Management</h1>
          <p className="text-gray-600">Administrators are listed separately from voters who have voted and voters who have not.</p>
        </div>

        <VotersList
          electionToken={userRole.electionId}
          voters={voters}
          loading={loadingVoters}
          onVotersUpdate={setVoters}
          canAssignRoles={userRole.role === "superAdmin"}
        />
      </div>
    </DashboardLayout>
  )
}
