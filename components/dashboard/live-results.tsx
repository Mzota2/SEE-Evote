"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRealTimeResults } from "@/hooks/use-real-time-results"

// Mock election ID - in real app this would come from props or context
const MOCK_ELECTION_ID = "election_1"

export function LiveResults() {
  const { results, stats, loading, error } = useRealTimeResults(MOCK_ELECTION_ID)
  const [selectedPositionIndex, setSelectedPositionIndex] = useState(0)

  const positions = Object.keys(results)
  const currentPosition = positions[selectedPositionIndex]
  const currentResults = currentPosition ? results[currentPosition] : {}

  const nextPosition = () => {
    setSelectedPositionIndex((prev) => (prev + 1) % positions.length)
  }

  const prevPosition = () => {
    setSelectedPositionIndex((prev) => (prev - 1 + positions.length) % positions.length)
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="w-4 h-4 animate-spin text-ivote-primary" />
          <h2 className="text-lg font-semibold text-gray-800">Loading Live Results...</h2>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Live Results</h2>
        <div className="text-center py-8">
          <p className="text-red-600">Error loading results: {error}</p>
        </div>
      </Card>
    )
  }

  if (positions.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Live Results</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">No election data available</p>
        </div>
      </Card>
    )
  }

  const candidatesArray = Object.values(currentResults).sort((a, b) => b.votes - a.votes)
  const maxVotes = Math.max(...candidatesArray.map((c) => c.votes), 1)

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-800">Live Results</h2>
          <Badge className="bg-green-100 text-green-800 animate-pulse">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
            LIVE
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={prevPosition} disabled={positions.length <= 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600 min-w-[150px] text-center">
            {currentPosition?.replace(/([A-Z])/g, " $1").trim() || "No Position"}
          </span>
          <Button variant="ghost" size="sm" onClick={nextPosition} disabled={positions.length <= 1}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {candidatesArray.map((candidateData, index) => (
          <div key={candidateData.candidate.id} className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    index === 0
                      ? "bg-yellow-500"
                      : index === 1
                        ? "bg-gray-400"
                        : index === 2
                          ? "bg-orange-600"
                          : "bg-gray-300"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="text-gray-700 font-medium">{candidateData.candidate.name}</span>
              </div>
              <div className="text-right">
                <span className="text-gray-800 font-semibold">{candidateData.votes} votes</span>
                <span className="text-gray-500 ml-2">({candidateData.percentage.toFixed(1)}%)</span>
              </div>
            </div>
            <Progress value={(candidateData.votes / maxVotes) * 100} className="h-3" />
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="text-2xl font-bold text-gray-800">{stats.totalVotes}</div>
            <div className="text-gray-500">Total Votes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{stats.totalRegisteredVoters}</div>
            <div className="text-gray-500">Registered Voters</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{stats.turnoutPercentage.toFixed(1)}%</div>
            <div className="text-gray-500">Turnout</div>
          </div>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">Last updated: {stats.lastUpdated.toLocaleTimeString()}</p>
      </div>
    </Card>
  )
}
