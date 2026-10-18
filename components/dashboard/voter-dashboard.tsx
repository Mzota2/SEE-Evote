"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Candidate, Election, Position, Role } from "@/lib/types"
import { Users, Calendar, Vote, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import { displayElectionToken } from "@/lib/utils"
import { ElectionSchedule } from "@/components/elections/election-schedule"
import { electionEnd, electionPhase, electionStart, formatElectionDateTime } from "@/lib/election-schedule"

interface VoterDashboardProps {
  election: Election
  userRole: Role
  candidates:Candidate[]
  positions: Position[]
  registeredVoters:Role[]
}

export function VoterDashboard({ election, userRole, candidates, positions, registeredVoters }: VoterDashboardProps) {
  const [electionStatus, setElectionStatus] = useState<"upcoming" | "active" | "ended">("upcoming")

  useEffect(() => {
    setElectionStatus(electionPhase(election))
  }, [election])

  const getStatusBadge = () => {
    switch (electionStatus) {
      case "upcoming":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Upcoming
          </Badge>
        )
      case "active":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Active
          </Badge>
        )
      case "ended":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Ended
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Election Header */}
      <Card className="overflow-hidden">
        <div
          className="aspect-video w-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: election.backgroundImage
              ? `linear-gradient(180deg, rgba(15,23,42,0.05), rgba(15,23,42,0.35)), url(${election.backgroundImage})`
              : "linear-gradient(135deg, #4fc3e0, #f5c242)",
          }}
        />
        <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">{election.title}</h1>
              {getStatusBadge()}
            </div>
            <p className="text-gray-600">{election.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-start gap-1">
                <Calendar className="w-4 h-4 mt-0.5" />
                <ElectionSchedule election={election} className="text-sm text-gray-500 space-y-0.5" />
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{election.organizationId}</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </Card>

      {/* Election Statistics */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{registeredVoters?.length}</h3>
              <p className="text-gray-600">Registered Voters</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Vote className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{positions?.length || 0}</h3>
              <p className="text-gray-600">Positions</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{candidates?.length || 0}</h3>
              <p className="text-gray-600">Candidates</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Voting Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Voting</h2>

          {electionStatus === "upcoming" && (
            <div className="text-center py-8">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Election Not Started</h3>
              <p className="text-gray-600">
                Voting starts {formatElectionDateTime(electionStart(election))} and ends{" "}
                {formatElectionDateTime(electionEnd(election))}.
              </p>
            </div>
          )}

          {electionStatus === "active" && (
            <div className="text-center py-8">
              <Vote className="w-16 h-16 text-ivote-primary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Ready to Vote</h3>
              <p className="text-gray-600 mb-4">
                Voting is open until {formatElectionDateTime(electionEnd(election))}. You can only vote once per position.
              </p>
              <Link href={`/dashboard/${userRole.electionToken}/vote`}>
                <Button className="bg-ivote-primary hover:bg-ivote-primary/90">Cast Your Vote</Button>
              </Link>
            </div>
          )}

          {electionStatus === "ended" && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Election Ended</h3>
              <p className="text-gray-600">This election ended {formatElectionDateTime(electionEnd(election))}.</p>
              {election.resultsVisible && (
                <Link href={`/dashboard/${userRole.electionToken}/results`}>
                  <Button variant="outline" className="mt-4 bg-transparent">
                    View Results
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Election Information */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Election Information</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700">Organization</h3>
            <p className="text-gray-600">{election.organizationId}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Election Token</h3>
            <p className="text-gray-600 font-mono text-sm bg-gray-50 p-2 rounded">{displayElectionToken(election.electionToken)}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Your Role</h3>
            <p className="text-gray-600 capitalize">{userRole.role}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
