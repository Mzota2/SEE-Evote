"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { Election } from "@/lib/types"
import { BarChart3, TrendingUp, Users, Vote } from "lucide-react"

interface ResultsOverviewProps {
  elections: Election[]
  loading: boolean
}

export function ResultsOverview({ elections, loading }: ResultsOverviewProps) {
  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  const totalElections = elections.length
  const ongoingElections = elections.filter((e) => e.status === "ongoing").length
  const completedElections = elections.filter((e) => e.status === "closed").length
  const pendingElections = elections.filter((e) => e.status === "pending").length

  // Mock data for demonstration
  const mockResults = [
    {
      election: "President Student Council",
      totalVotes: 342,
      turnout: 85,
      winner: "Felisa Monteverde",
      winnerVotes: 156,
      status: "ongoing",
    },
    {
      election: "Vice President Student Council",
      totalVotes: 298,
      turnout: 74,
      winner: "Carolina Labasan",
      winnerVotes: 134,
      status: "ongoing",
    },
    {
      election: "Secretary Student Council",
      totalVotes: 267,
      turnout: 66,
      winner: "Elle Cojuangco",
      winnerVotes: 145,
      status: "closed",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-ivote-primary/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-ivote-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalElections}</p>
              <p className="text-sm text-gray-600">Total Elections</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{ongoingElections}</p>
              <p className="text-sm text-gray-600">Ongoing</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{completedElections}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Vote className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{pendingElections}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Election Results */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Election Results</h2>

        {mockResults.map((result, index) => (
          <Card key={index} className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-800">{result.election}</h3>
                <Badge
                  className={result.status === "ongoing" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                >
                  {result.status}
                </Badge>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Leading Candidate</span>
                    <span className="font-medium">{result.winnerVotes} votes</span>
                  </div>
                  <p className="font-medium text-gray-800">{result.winner}</p>
                  <Progress value={(result.winnerVotes / result.totalVotes) * 100} className="h-2" />
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">{result.totalVotes}</p>
                  <p className="text-sm text-gray-600">Total Votes</p>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">{result.turnout}%</p>
                  <p className="text-sm text-gray-600">Voter Turnout</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
