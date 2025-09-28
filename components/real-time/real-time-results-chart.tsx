"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRealTimeResults } from "@/hooks/use-real-time-results"
import { BarChart3 } from "lucide-react"

interface RealTimeResultsChartProps {
  electionId: string
  positionId?: string
}

export function RealTimeResultsChart({ electionId, positionId }: RealTimeResultsChartProps) {
  const { results, loading, error } = useRealTimeResults(electionId)

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-red-600">Error loading results: {error}</p>
        </div>
      </Card>
    )
  }

  const positions = Object.keys(results)
  const targetPosition = positionId || positions[0]
  const positionResults = results[targetPosition] || {}
  const candidates = Object.values(positionResults).sort((a, b) => b.votes - a.votes)

  if (candidates.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No voting data available yet</p>
        </div>
      </Card>
    )
  }

  const maxVotes = Math.max(...candidates.map((c) => c.votes), 1)
  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0)

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {targetPosition?.replace(/([A-Z])/g, " $1").trim() || "Election Results"}
          </h3>
          <p className="text-sm text-gray-600">{totalVotes} total votes</p>
        </div>
        <Badge className="bg-green-100 text-green-800 animate-pulse">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
          LIVE
        </Badge>
      </div>

      <div className="space-y-6">
        {candidates.map((candidateData, index) => (
          <div key={candidateData.candidate.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                    index === 0 ? "bg-ivote-primary" : index === 1 ? "bg-ivote-secondary" : "bg-gray-400"
                  }`}
                >
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{candidateData.candidate.name}</p>
                  <p className="text-sm text-gray-500">{candidateData.candidate.department}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-800">{candidateData.votes}</p>
                <p className="text-sm text-gray-500">{candidateData.percentage.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
