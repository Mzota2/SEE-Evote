"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRealTimeResults } from "@/hooks/use-real-time-results"
import { TrendingUp, Users, Vote, Clock } from "lucide-react"

interface LiveVotingStatsProps {
  electionId: string
}

export function LiveVotingStats({ electionId }: LiveVotingStatsProps) {
  const { stats, loading } = useRealTimeResults(electionId)

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-ivote-primary/10 rounded-lg flex items-center justify-center">
            <Vote className="w-6 h-6 text-ivote-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-gray-800">{stats.totalVotes}</p>
              <Badge className="bg-green-100 text-green-800 animate-pulse">LIVE</Badge>
            </div>
            <p className="text-sm text-gray-600">Total Votes Cast</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{stats.totalRegisteredVoters}</p>
            <p className="text-sm text-gray-600">Registered Voters</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{stats.turnoutPercentage.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Voter Turnout</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{stats.lastUpdated.toLocaleTimeString()}</p>
            <p className="text-sm text-gray-600">Last Updated</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
