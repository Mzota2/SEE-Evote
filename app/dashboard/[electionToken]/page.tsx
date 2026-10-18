"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { VoterDashboard } from "@/components/dashboard/voter-dashboard"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { VoterWaiting } from "@/components/elections/voter-waiting"
import { deleteAllLogs, deleteAllVoterIDs, getActionLogsWithUsers, getCastedVotes, getElectionByToken, getElectionCandidates, getElectionPositions, getRegisteredVoters, getUserRoles, updateElection } from "@/lib/database"
import { electionTokensMatch } from "@/lib/utils"
import { electionPhase } from "@/lib/election-schedule"
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
  const [access, setAccess] = useState<"ready" | "waiting" | "rejected" | "review" | "missing">("ready")

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
          // setError("Positions not found or access denied")
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
          // setError("Candidates not found or access denied")
          setLoadingData(false)
          return
        }
        setCandidates(fetchedCandidates)

      } catch (err) {
        setError("Failed to load candidates data")
        setLoadingData(false)
      }
    }

    // const fetchAuditLogs = async(electionId:string)=>{
    //   if (!user) return

    //   try {
    //     // Fetch election data
    //     const {logs: fetchedLogs, error: logsError } = await getActionLogsWithUsers(electionId);
    //     if (logsError) {
    //       console.log(logsError);
    //       setError("Failed to load audit logs")
    //       setLoadingData(false)
    //       return
    //     }
    //     setAuditLogs(fetchedLogs)

    //   } catch (err) {
    //     setError("Failed to load audit logs")
    //     setLoadingData(false)
    //   }
    // }

    const fetchElectionData = async () => {
      if (!user) return

      try {
        // Fetch election data
        const { election: fetchedElection, error: electionError } = await getElectionByToken(params.electionToken)
        
        if (electionError || !fetchedElection) {
          setError("We could not find this election.")
          setLoadingData(false)
          return
        }

        const { roles, error: rolesError } = await getUserRoles(user.id)
        if (rolesError) {
          setError("We could not open this election. Please try again.")
          setLoadingData(false)
          return
        }
        const relevantRole = roles.find((role) => electionTokensMatch(role.electionToken, params.electionToken))

        if (!relevantRole) {
          setElection(fetchedElection)
          setAccess("missing")
          setLoadingData(false)
          return
        }

        const phase = electionPhase(fetchedElection)
        const nextStatus = phase === "active" ? "ongoing" : phase === "ended" ? "closed" : "pending"
        if (fetchedElection.id && fetchedElection.status !== nextStatus) {
          await updateElection(fetchedElection.id, { status: nextStatus })
        }
        setElection({ ...fetchedElection, status: nextStatus })
        setUserRole(relevantRole)

        if (relevantRole.status === "pending" && relevantRole.role === "voter") {
          setAccess("waiting")
          setLoadingData(false)
          return
        }

        if (relevantRole.status === "rejected" && relevantRole.role === "voter") {
          setAccess("rejected")
          setLoadingData(false)
          return
        }

        if (relevantRole.status !== "approved") {
          setAccess("review")
          setLoadingData(false)
          return
        }

        const { voters: fetchedRegisteredVotes } = await getRegisteredVoters(fetchedElection.id)
        const { votes: fetchedVotes } = await getCastedVotes(fetchedElection.id)
        setRegisteredVoters(fetchedRegisteredVotes?.length ? fetchedRegisteredVotes : [])
        setCastedVotes(fetchedVotes)
        setAccess("ready")
        setLoadingData(false)
        await fetchCandidatesData(fetchedElection.id);
        await fetchPositionsData(fetchedElection.id);
        // await fetchAuditLogs(fetchedElection.id);

      } catch (err) {
        setError("We could not open this election. Please try again.")
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

  if ((access === "waiting" || access === "rejected") && election) {
    return <VoterWaiting election={election} rejected={access === "rejected"} />
  }

  if (access === "review" && election) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-3">
          <h2 className="text-xl font-semibold text-gray-800">This election is still being reviewed</h2>
          <p className="text-gray-600">You can manage it after it has been approved.</p>
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

  if (access === "missing" && election) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-3">
          <h2 className="text-xl font-semibold text-gray-800">You have not joined yet</h2>
          <p className="text-gray-600">Open the invitation and confirm that you want to join. You can vote after the organiser approves your voting rights.</p>
          <button
            onClick={() => router.push(`/join/${encodeURIComponent(params.electionToken)}`)}
            className="bg-ivote-primary text-white px-4 py-2 rounded hover:bg-ivote-primary/90"
          >
            Open the invitation
          </button>
        </div>
      </div>
    )
  }

  if (error || !election || !userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Election unavailable</h2>
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
