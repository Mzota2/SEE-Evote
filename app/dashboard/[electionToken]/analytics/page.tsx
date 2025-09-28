"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ElectionAnalytics } from "@/components/analytics/election-analytics"
import {
  getElectionByToken,
  getUserRoles,
  getElectionPositions,
  getElectionCandidates,
  getVoteResults,
  getActionLogsWithUsers,
} from "@/lib/database"
import type { Election, Role, Position, Candidate, AuditLogWithUser } from "@/lib/types"

interface AnalyticsPageProps {
  params: {
    electionToken: string
  }
}

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [election, setElection] = useState<Election | null>(null)
  const [userRole, setUserRole] = useState<Role | null>(null)
  const [positions, setPositions] = useState<Position[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [results, setResults] = useState<Record<string, Record<string, number>>>({})
  const [totalVotes, setTotalVotes] = useState(0)
  const [auditLogs, setAuditLogs] = useState<AuditLogWithUser[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Fetch election data
        const { election: fetchedElection, error: electionError } = await getElectionByToken(params.electionToken)
        if (electionError || !fetchedElection) {
          setError("Election not found or access denied")
          setLoadingData(false)
          return
        }

        // Verify user access
        const { roles } = await getUserRoles(user.id)
        const relevantRole = roles.find(
          (role) => role.electionToken === params.electionToken && role.status === "approved",
        )

        if (!relevantRole || relevantRole.role !== "admin") {
          setError("You don't have admin access to view analytics for this election")
          setLoadingData(false)
          return
        }

        setElection(fetchedElection)
        setUserRole(relevantRole)

        // Fetch all related data
        const [positionsResult, candidatesResult, resultsResult, logsResult] = await Promise.all([
          getElectionPositions(fetchedElection.id),
          getElectionCandidates(fetchedElection.id),
          getVoteResults(fetchedElection.id),
          getActionLogsWithUsers(fetchedElection.id),
        ])

        setPositions(positionsResult.positions)
        setCandidates(candidatesResult.candidates)
        setResults(resultsResult.results)
        setTotalVotes(resultsResult.totalVotes)
        setAuditLogs(logsResult.logs)
        setLoadingData(false)
      } catch (err) {
        setError("Failed to load analytics data")
        setLoadingData(false)
      }
    }

    fetchData()
  }, [user, params.electionToken, router])

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ivote-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error || !election || !userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">{error || "Unable to access analytics"}</p>
          <button
            onClick={() => router.push(`/dashboard/${params.electionToken}`)}
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
      <ElectionAnalytics
        election={election}
        positions={positions}
        candidates={candidates}
        results={results}
        totalVotes={totalVotes}
        auditLogs={auditLogs}
      />
    </DashboardLayout>
  )
}
