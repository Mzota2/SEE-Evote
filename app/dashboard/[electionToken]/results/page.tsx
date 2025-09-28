"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  getElectionByToken,
  getUserRoles,
  getElectionPositions,
  getElectionCandidates,
  getVoteResults,
  approveElectionResults,
  disapproveElectionResults,
} from "@/lib/database"
import type { Election, Role, Position, Candidate } from "@/lib/types"
import { BarChart3, Trophy, Users, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ResultsPageProps {
  params: {
    electionToken: string
  }
}

interface CandidateResult {
  candidate: Candidate
  votes: number
  percentage: number
  isWinner: boolean
}

interface PositionResult {
  position: Position
  candidates: CandidateResult[]
  totalVotes: number
}

export default function ResultsPage({ params }: ResultsPageProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [election, setElection] = useState<Election | null>(null)
  const [userRole, setUserRole] = useState<Role | null>(null)
  const [positions, setPositions] = useState<Position[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [results, setResults] = useState<Record<string, Record<string, number>>>({})
  const [positionResults, setPositionResults] = useState<PositionResult[]>([])
  const [totalVotes, setTotalVotes] = useState(0)
  const [loadingData, setLoadingData] = useState(true)
  const [loadingResultsApproval, setLoadingResultsApproval] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const fetchData = async () => {
      if (!user) return

      try {
        const { election: fetchedElection } = await getElectionByToken(params.electionToken)
        const { roles } = await getUserRoles(user.id)
        const relevantRole = roles.find(
          (role) => role.electionToken === params.electionToken && role.status === "approved",
        )

        if (!fetchedElection || !relevantRole) {
          router.push("/dashboard")
          return
        }

        setElection(fetchedElection)
        setUserRole(relevantRole)

        const { positions: fetchedPositions } = await getElectionPositions(fetchedElection.id)
        const { candidates: fetchedCandidates } = await getElectionCandidates(fetchedElection.id)
        const { results: fetchedResults, totalVotes: fetchedTotalVotes } = await getVoteResults(fetchedElection.id)

        setPositions(fetchedPositions)
        setCandidates(fetchedCandidates)
        setResults(fetchedResults)
        setTotalVotes(fetchedTotalVotes)

        // Process results for display
        const processedResults:PositionResult[] = fetchedPositions.map((position) => {
          const positionCandidates = fetchedCandidates.filter(
            (c) => c.positionId === position.id && c.status === "active",
          )
          const positionVotes = ((fetchedResults  as Record<string, Record<string, number>>)[position.id]) || {};
          const positionTotalVotes = Object.values(positionVotes).reduce((sum, votes) => sum + votes, 0) as number;

          const candidateResults: CandidateResult[] = positionCandidates.map((candidate) => {
            const votes = positionVotes[candidate.id] || 0
            const percentage = positionTotalVotes > 0 ? (votes / positionTotalVotes) * 100 : 0
            return {
              candidate,
              votes,
              percentage,
              isWinner: false, // Will be set below
            }
          })

          // Sort by votes and mark winners
          candidateResults.sort((a, b) => b.votes - a.votes)
          if (candidateResults.length > 0 && candidateResults[0].votes > 0) {
            const maxVotes = candidateResults[0].votes
            candidateResults.forEach((result) => {
              if (result.votes === maxVotes) {
                result.isWinner = true
              }
            })
          }

          return {
            position,
            candidates: candidateResults,
            totalVotes: Number(positionTotalVotes),
          }
        })

        setPositionResults(processedResults)
        setLoadingData(false)
      } catch (err) {
        router.push("/dashboard")
      }
    }
  useEffect(() => {
    fetchData()
  }, [user, params.electionToken, router])

  const isElectionEnded = () => {
    if (!election) return false
    return new Date() > new Date(election.endDate)
  }

  const handleApproveResults = async()=>{
    try {
      setLoadingResultsApproval(true);
      if(!user || !election) return;
      await approveElectionResults(election.id, user.id);
      await fetchData();
      
    } catch (error) {
      console.error("Error approving election results:", error);
    }finally{
      setLoadingResultsApproval(false);
    }
  }

  const handleDisapproveResults = async()=>{
    try {
      setLoadingResultsApproval(true);
      if(!user || !election) return;
      await disapproveElectionResults(election.id, user.id);
      await fetchData();
    } catch (error) {
      console.error("Error disapproving election results:", error);
    }finally{
      setLoadingResultsApproval(false);
    }
  }

  const getElectionStatus = () => {
    if (!election) return "Unknown"
    const now = new Date()
    const startDate = new Date(election.startDate)
    const endDate = new Date(election.endDate)

    if (now < startDate) return "Not Started"
    if (now > endDate) return "Ended"
    return "Active"
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ivote-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    )
  }

  if (!election || !userRole) {
    return null
  }

  const electionStatus = getElectionStatus()
  const showFullResults = (election.resultsVisible || userRole.role === "admin") && (isElectionEnded() || userRole.role === "admin")
  console.log(election.resultsVisible);
  return (
    <DashboardLayout electionToken={params.electionToken} userRole={userRole.role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Election Results</h1>
          <p className="text-gray-600">{election.title}</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge
              variant="secondary"
              className={
                electionStatus === "Active"
                  ? "bg-green-100 text-green-800"
                  : electionStatus === "Ended"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
              }
            >
              {electionStatus === "Active" && <Clock className="w-3 h-3 mr-1" />}
              {electionStatus === "Ended" && <CheckCircle className="w-3 h-3 mr-1" />}
              {electionStatus}
            </Badge>
            <span className="text-sm text-gray-500">
              {electionStatus === "Ended"
                ? `Ended ${new Date(election.endDate).toLocaleDateString()}`
                : `Ends ${new Date(election.endDate).toLocaleDateString()}`}
            </span>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{totalVotes}</div>
            <p className="text-sm text-gray-600">Total Votes Cast</p>
          </Card>
          <Card className="p-6 text-center">
            <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{positions.length}</div>
            <p className="text-sm text-gray-600">Positions</p>
          </Card>
          <Card className="p-6 text-center">
            <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">
              {positionResults.filter((pr) => pr.candidates.some((c) => c.isWinner)).length}
            </div>
            <p className="text-sm text-gray-600">Decided Positions</p>
          </Card>
        </div>

        {/* Results Disclaimer */}
        {!showFullResults && (
          <Card className="p-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-800">Preliminary Results</h3>
                <p className="text-sm text-yellow-700">
                  Full results will be available after the election ends on{" "}
                  {new Date(election.endDate).toLocaleDateString()}. Current results may not reflect all votes cast.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Position Results */}
        {showFullResults && (<div className="space-y-8">
          {positionResults.map((positionResult) => (
            <Card key={positionResult.position.id} className="p-6">
              <div className="space-y-6">
                {/* Position Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{positionResult.position.title}</h2>
                    {positionResult.position.description && (
                      <p className="text-gray-600">{positionResult.position.description}</p>
                    )}
                  </div>
                  <Badge variant="secondary">
                    {positionResult.totalVotes} vote{positionResult.totalVotes !== 1 ? "s" : ""}
                  </Badge>
                </div>

                {/* Candidates Results */}
                {positionResult.candidates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No candidates for this position</p>
                  </div>
                ) : positionResult.totalVotes === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No votes cast for this position yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {positionResult.candidates.map((candidateResult, index) => (
                      <div key={candidateResult.candidate.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                              <h3 className="font-semibold text-gray-800">{candidateResult.candidate.name}</h3>
                              {candidateResult.isWinner && showFullResults && (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  <Trophy className="w-3 h-3 mr-1" />
                                  Winner
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-800">
                              {showFullResults ? candidateResult.votes : "•••"} votes
                            </div>
                            <div className="text-sm text-gray-600">
                              {showFullResults ? `${candidateResult.percentage.toFixed(1)}%` : "•••%"}
                            </div>
                          </div>
                        </div>

                        <Progress value={showFullResults ? candidateResult.percentage : 0} className="h-2" />

                        {candidateResult.candidate.description && (
                          <p className="text-sm text-gray-600 ml-8">{candidateResult.candidate.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>)}

        {/* APPROVE/DISAPPROVE RESULTS SECTION ADMIN */}
        {
          showFullResults && userRole.role === "admin" && (
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Admin Access: Full Results Available</h3>
                <p className="text-sm text-green-700">
                As an admin, you can view the full election results even before the election ends.
                </p>
                <p className="font-semibold text-green-800">{election.resultsVisible ? "You have successfully approved the results, they are available to the public": "You have not approved the results yet"}</p>
              </div>
              </div>
              <div className="flex gap-4 mt-2">
              <Button
                type="button"
                className="px-4 py-2 cursor-pointer bg-green-600 text-white rounded hover:bg-green-700 transition"
                onClick={handleApproveResults}
                disabled={election.resultsVisible}
              >
                {!loadingResultsApproval ? "Approve Results": election.resultsVisible? "Approved":"Approving..."}
              </Button>
              <Button
                type="button"
                className="px-4 py-2 cursor-pointer bg-red-600 text-white rounded hover:bg-red-700 transition"
                onClick={handleDisapproveResults}
                disabled={!election.resultsVisible}
              >
                {!loadingResultsApproval ? "Disapprove Results": election.resultsVisible? "Disapproving...":"Disapprove Results"}
              </Button>
              </div>
              
            </Card>
          )
        }

    

        {/* Final Results Message */}
        {showFullResults && isElectionEnded() && userRole.role !== "admin" && (
          <Card className="p-6 bg-blue-50 border-blue-200 text-center">
            <CheckCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-blue-800 mb-2">Election Complete</h3>
            <p className="text-blue-700">
              The election has ended and all results are final. Thank you to everyone who participated in{" "}
              {election.title}.
            </p>
          </Card>
        )}

        
      </div>
    </DashboardLayout>
  )
}
