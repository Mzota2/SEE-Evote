"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { VoterDashboard } from "@/components/dashboard/voter-dashboard"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { getActionLogsWithUsers, getCastedVotes, getElectionByToken, getElectionCandidates, getElectionPositions, getRegisteredVoters, getUserRoles } from "@/lib/database"
import type { AuditLog, AuditLogWithUser, Candidate, Election, Position, Role, Vote } from "@/lib/types"

interface ElectionDashboardPageProps {
  params: {
    electionToken: string
  }
}

export default function ElectionDashboardPage({ params }: ElectionDashboardPageProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [election, setElection] = useState<Election | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLogWithUser[]>([])
  const [userRole, setUserRole] = useState<Role | null>(null)
  const [registeredVoters, setRegisteredVoters] = useState<Role[]>([])
  const [castedVotes, setCastedVotes] = useState<Vote[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchPositionsData = async(electionId:string)=>{
      if (!user) return

      try {
        // Fetch election data

        const { positions: fetchedPositions, error: positionsError } = await getElectionPositions(electionId);
        if (positionsError) {
          setError("Positions not found or access denied")
          setLoadingData(false)
          return
        }
        setPositions(fetchedPositions)

      } catch (err) {
        setError("Failed to load positions data")
        setLoadingData(false)
      }
    }
    const fetchCandidatesData = async(electionId:string)=>{
      if (!user) return

      try {
        // Fetch election data

        const { candidates: fetchedCandidates, error: candidatesError } = await getElectionCandidates(electionId);
        if (candidatesError) {
          console.log(candidatesError);
          setError("Candidates not found or access denied")
          setLoadingData(false)
          return
        }
        setCandidates(fetchedCandidates)

      } catch (err) {
        setError("Failed to load candidates data")
        setLoadingData(false)
      }
    }

    const fetchAuditLogs = async(electionId:string)=>{
      if (!user) return

      try {
        // Fetch election data
        const {logs: fetchedLogs, error: logsError } = await getActionLogsWithUsers(electionId);
        if (logsError) {
          console.log(logsError);
          setError("Failed to load audit logs")
          setLoadingData(false)
          return
        }
        setAuditLogs(fetchedLogs)

      } catch (err) {
        setError("Failed to load audit logs")
        setLoadingData(false)
      }
    }

    const fetchElectionData = async () => {
      if (!user) return

      try {
        // Fetch election data
        const { election: fetchedElection, error: electionError } = await getElectionByToken(params.electionToken)
        if(fetchedElection){
          const {voters:fetchedRegisteredVotes} = await getRegisteredVoters(fetchedElection.id);
          const {votes:fetchedVotes} = await getCastedVotes(fetchedElection?.id);
          setRegisteredVoters(fetchedRegisteredVotes?.length ? fetchedRegisteredVotes : []);
          setCastedVotes(fetchedVotes);
        }
        if (electionError || !fetchedElection) {
          setError("Election not found or access denied")
          setLoadingData(false)
          return
        }

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

        setElection(fetchedElection)
        setUserRole(relevantRole)
        setLoadingData(false);
        await fetchCandidatesData(fetchedElection.id);
        await fetchPositionsData(fetchedElection.id);
        await fetchAuditLogs(fetchedElection.id);

      } catch (err) {
        setError("Failed to load election data")
        console.log(err);
        console.log(error)
        setLoadingData(false)
      }
    }

    fetchElectionData()
  }, [user, params.electionToken])

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ivote-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading election dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !election || !userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">{error || "Unable to access this election"}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-ivote-primary text-white px-4 py-2 rounded hover:bg-ivote-primary/90"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout electionToken={params.electionToken} userRole={userRole.role}>
      {userRole.role === "admin" ? (
        <AdminDashboard registeredVoters={registeredVoters} castedVotes={castedVotes} logs={auditLogs} positions={positions} candidates={candidates} election={election} userRole={userRole} />
      ) : (
        <VoterDashboard registeredVoters={registeredVoters} positions={positions} candidates={candidates} election={election} userRole={userRole} />
      )}
    </DashboardLayout>
  )
}
