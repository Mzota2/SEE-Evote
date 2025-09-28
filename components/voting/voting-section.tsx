"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CandidateCard } from "./candidate-card"
import { CandidateModal } from "./candidate-modal"
import { castVote, getUserVotes } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"
import type { Election, Candidate, Position, Vote } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { VoteIcon, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface VotingSectionProps {
  election: Election
  positions: Position[]
  getCandidatesForPosition: (positionId: string) => Candidate[]
  userVotes: Vote[]
  setUserVotes: (votes: Vote[]) => void
}

export function VotingSection({
  election,
  positions,
  getCandidatesForPosition,
  userVotes,
  setUserVotes,
}: VotingSectionProps) {
  const [selectedCandidates, setSelectedCandidates] = useState<Record<string, string>>({})
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submittingVotes, setSubmittingVotes] = useState<Record<string, boolean>>({})
  const { toast } = useToast()
  const { user } = useAuth()

  const handleCandidateSelect = (positionId: string, candidateId: string) => {
    setSelectedCandidates((prev) => ({
      ...prev,
      [positionId]: candidateId,
    }))
  }

  const handleViewDetails = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setIsModalOpen(true)
  }

  const handleSubmitVotes = async () => {
    const selectedCount = Object.keys(selectedCandidates).length
    if (selectedCount === 0) {
      toast({
        title: "No Votes Selected",
        description: "Please select at least one candidate before submitting.",
        variant: "destructive",
      })
      return
    }
    setSubmitting(true)

    try {
      if (!user || !election) return
      for (const [positionId, candidateId] of Object.entries(selectedCandidates)) {
        const { success, error } = await castVote({
          voterId: user.id,
          electionId: election.id,
          positionId,
          candidateId,
          organizationId: election.organizationId,
        })

        if (!success && error) {
          throw new Error(error)
        }
      }

      toast({
        title: "Votes Submitted Successfully",
        description: `You have successfully voted for ${selectedCount} position(s).`,
      })

      setSelectedCandidates({})
      const { votes: updatedUserVotes } = await getUserVotes(user.id, election.id)
      console.log(updatedUserVotes)
      setUserVotes(updatedUserVotes)
    } catch (error: any) {
      toast({
        title: "Vote Submission Failed",
        description: error.message || "An error occurred while submitting your votes.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const hasVotedForPosition = (positionId: string) => {
    console.log("user votes", userVotes)
    console.log("positionId", positionId)
    return userVotes.some((vote) => vote.positionId === positionId)
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {positions.map((position, index) => {
        const positionCandidates = getCandidatesForPosition(position.id)
        const hasVoted = hasVotedForPosition(position.id)

        return (
          <Card key={position.id} className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-2">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">{position.title}</h2>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <p className="text-sm text-gray-600">You can only vote for one candidate</p>
                    {hasVoted ? (
                      <Badge className="bg-green-100 text-green-800 w-fit">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Voted
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="w-fit">
                        <VoteIcon className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
                {position.description && <p className="text-sm sm:text-base text-gray-600">{position.description}</p>}
              </div>
            </div>

            {hasVoted ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-sm sm:text-base">You have already voted for this position</span>
                </div>
                <p className="text-xs sm:text-sm text-green-700 mt-1">
                  Your vote has been recorded securely and cannot be changed.
                </p>
              </div>
            ) : positionCandidates.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center mt-4">
                <p className="text-sm sm:text-base text-gray-600">No candidates available for this position yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4">
                {positionCandidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    isSelected={selectedCandidates[position.id] === candidate.id}
                    onSelect={() => handleCandidateSelect(position.id, candidate.id)}
                    onViewDetails={() => handleViewDetails(candidate)}
                  />
                ))}
              </div>
            )}
          </Card>
        )
      })}

      <div className="text-center py-4 sm:py-6 px-4">
        <p className="text-sm sm:text-base text-gray-600 mb-4">
          Double-check your choices before submitting your votes.
        </p>
        <Button
          onClick={handleSubmitVotes}
          disabled={submitting || Object.keys(selectedCandidates).length !== positions.length}
          size="lg"
          className="bg-see-evote-primary hover:bg-see-evote-primary/90 text-white px-8 sm:px-12 py-3 w-full sm:w-auto text-sm sm:text-base"
        >
          {submitting ? "SUBMITTING VOTE..." : "SUBMIT VOTE"}
        </Button>
      </div>

      <CandidateModal candidate={selectedCandidate} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
