"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  getElectionByToken,
  getUserRoles,
  getElectionPositions,
  getElectionCandidates,
  castVote,
  getUserVotes,
  updateElection,
} from "@/lib/database"
import type { Election, Role, Position, Candidate, Vote } from "@/lib/types"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { VotingSection } from "@/components/voting/voting-section"

interface VotePageProps {
  params: {
    electionToken: string
  }
}

export default function VotePage({ params }: VotePageProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [election, setElection] = useState<Election | null>(null)
  const [userRole, setUserRole] = useState<Role | null>(null)
  const [positions, setPositions] = useState<Position[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [userVotes, setUserVotes] = useState<Vote[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({})
  const [submittingVotes, setSubmittingVotes] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        const { election: fetchedElection } = await getElectionByToken(params.electionToken)
        const { roles } = await getUserRoles(user.id)
        console.log("roles", roles)
        const relevantRole = roles.find(
          (role) => role.electionToken === params.electionToken && role.status === "approved",
        )

        if (!fetchedElection || !relevantRole) {
          router.push("/dashboard")
          return
        }

        // Check if election is active and within voting period
        const now = new Date()
        const startDate = new Date(fetchedElection.startDate)
        const endDate = new Date(fetchedElection.endDate)

        if (fetchedElection.status === "closed" && !(now < startDate || now > endDate)) {
          if (fetchedElection.id) {
            await updateElection(fetchedElection.id, {
              ...fetchedElection,
              status: "ongoing",
            })
          }
        } else if (fetchedElection.status === "closed" && (now < startDate || now > endDate)) {
          router.push(`/dashboard/${params.electionToken}`)
          return
        } else if (fetchedElection.status === "ongoing" && (now < startDate || now > endDate)) {
          //check election status, if it is within the dates update status to ongoing
          if (fetchedElection.id) {
            await updateElection(fetchedElection.id, {
              ...fetchedElection,
              status: "closed",
            })
          }

          router.push(`/dashboard/${params.electionToken}`)
          return
        }

        //check election status, if it is within the dates update status to ongoing
        else if (fetchedElection.status === "pending" && !(now < startDate || now > endDate)) {
          if (fetchedElection.id) {
            await updateElection(fetchedElection.id, {
              ...fetchedElection,
              status: "ongoing",
            })
          }
        } else if (fetchedElection.status === "pending" && (now < startDate || now > endDate)) {
          if (fetchedElection.id) {
            await updateElection(fetchedElection.id, {
              ...fetchedElection,
              status: "closed",
            })
            router.push(`/dashboard/${params.electionToken}`)
            return
          }
        }

        setElection(fetchedElection)
        setUserRole(relevantRole)

        const { positions: fetchedPositions } = await getElectionPositions(fetchedElection.id)
        const { candidates: fetchedCandidates } = await getElectionCandidates(fetchedElection.id)
        const { votes: fetchedUserVotes } = await getUserVotes(user.id, fetchedElection.id)

        console.log("fetched user votes", fetchedUserVotes)
        setPositions(fetchedPositions)
        setCandidates(fetchedCandidates)
        setUserVotes(fetchedUserVotes)
        setLoadingData(false)
      } catch (err) {
        router.push("/dashboard")
      }
    }

    fetchData()
  }, [user, params.electionToken, router])

  const getCandidatesForPosition = (positionId: string) => {
    return candidates.filter((c) => c.positionId === positionId && c.status === "active")
  }

  const hasVotedForPosition = (positionId: string) => {
    return userVotes.some((vote) => vote.positionId === positionId)
  }

  const handleVoteSubmit = async (positionId: string) => {
    if (!user || !election || !selectedVotes[positionId]) return

    setSubmittingVotes((prev) => ({ ...prev, [positionId]: true }))

    try {
      const result = await castVote({
        voterId: user.id,
        electionId: election.id,
        positionId,
        candidateId: selectedVotes[positionId],
        organizationId: election.organizationId,
      })

      if (result.success) {
        toast({
          title: "Vote Cast Successfully",
          description: "Your vote has been recorded securely.",
        })

        // Refresh user votes
        const { votes: updatedUserVotes } = await getUserVotes(user.id, election.id)
        console.log(updatedUserVotes)
        setUserVotes(updatedUserVotes)

        // Clear selection for this position
        setSelectedVotes((prev) => {
          const updated = { ...prev }
          delete updated[positionId]
          return updated
        })
      } else {
        toast({
          title: "Vote Failed",
          description: result.error || "Failed to cast your vote. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while casting your vote.",
        variant: "destructive",
      })
    }

    setSubmittingVotes((prev) => ({ ...prev, [positionId]: false }))
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ivote-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading voting interface...</p>
        </div>
      </div>
    )
  }

  if (!election || !userRole) {
    return null
  }

  // Check if user is a voter
  if (userRole.role !== "voter") {
    return (
      <DashboardLayout electionToken={params.electionToken} userRole={userRole.role}>
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Restricted</h2>
          <p className="text-gray-600">Only registered voters can access the voting interface.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout electionToken={params.electionToken} userRole={userRole.role}>
      <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Cast Your Vote</h1>
          <p className="text-sm sm:text-base text-gray-600">Make your voice heard in {election.title}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Clock className="w-3 h-3 mr-1" />
              Voting Open
            </Badge>
            <span className="text-xs sm:text-sm text-gray-500">
              Until {new Date(election.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Voting Progress */}
        <Card className="p-4 sm:p-6 bg-blue-50 border-blue-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div>
              <h3 className="font-semibold text-blue-800 text-sm sm:text-base">Voting Progress</h3>
              <p className="text-xs sm:text-sm text-blue-600">
                {userVotes.length} of {positions.length} positions voted
              </p>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-xl sm:text-2xl font-bold text-blue-800">
                {Math.round((userVotes.length / positions.length) * 100)}%
              </div>
              <p className="text-xs text-blue-600">Complete</p>
            </div>
          </div>
          <div className="mt-3 bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(userVotes.length / positions.length) * 100}%` }}
            />
          </div>
        </Card>

        {/* Positions and Voting */}
        <VotingSection
          election={election}
          positions={positions}
          userVotes={userVotes}
          setUserVotes={setUserVotes}
          getCandidatesForPosition={getCandidatesForPosition}
        />

        {/* Completion Message */}
        {userVotes.length === positions.length && (
          <Card className="p-4 sm:p-6 bg-green-50 border-green-200 text-center">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-2">Voting Complete!</h3>
            <p className="text-sm sm:text-base text-green-700">
              You have successfully cast your votes for all positions. Thank you for participating in {election.title}.
            </p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
