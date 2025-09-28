"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { jsPDF } from "jspdf"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
  Area,
  AreaChart,
} from "recharts"
import { Users, Download, FileText, BarChart3, PieChartIcon, Activity } from "lucide-react"
import type { Election, Position, Candidate, AuditLogWithUser } from "@/lib/types"

interface ElectionAnalyticsProps {
  election: Election
  positions: Position[]
  candidates: Candidate[]
  results: Record<string, Record<string, number>>
  totalVotes: number
  auditLogs: AuditLogWithUser[]
}

interface AnalyticsData {
  positionName: string
  totalVotes: number
  candidates: number
  turnout: number
}

interface CandidateAnalytics {
  name: string
  votes: number
  percentage: number
  position: string
}

interface VotingTrend {
  date: string
  votes: number
  cumulative: number
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"]

export function ElectionAnalytics({
  election,
  positions,
  candidates,
  results,
  totalVotes,
  auditLogs,
}: ElectionAnalyticsProps) {
  // Process analytics data
  // Analytics data for each position and candidate distribution
  const analyticsData: AnalyticsData[] = positions.map((position) => {
    const positionCandidates = candidates.filter((c) => c.positionId === position.id)
    const positionVotes = results[position.id] || {}
    const positionTotalVotes = Object.values(positionVotes).reduce((sum, votes) => sum + votes, 0)
    const totalEligibleVoters = election?.totalVoters || 100 // Default to 100 if not available
    return {
      positionName: position.title,
      totalVotes: positionTotalVotes,
      candidates: positionCandidates.length,
      turnout: (positionTotalVotes / totalEligibleVoters),
    }
  })

  // Candidate distribution data for each position (for pie chart)
  const candidateDistributionByPosition: Record<string, { name: string; value: number; percentage: number }[]> = {}
  positions.forEach((position) => {
    const positionCandidates = candidates.filter((c) => c.positionId === position.id)
    const positionVotes = results[position.id] || {}
    const positionTotalVotes = Object.values(positionVotes).reduce((sum, votes) => sum + votes, 0)
    candidateDistributionByPosition[position.id] = positionCandidates.map((candidate) => {
      const votes = positionVotes[candidate.id] || 0
      const percentage = positionTotalVotes > 0 ? (votes / positionTotalVotes) * 100 : 0
      return {
        name: candidate.name,
        value: votes,
        percentage: Number(percentage.toFixed(2)),
      }
    })
  })

  // Top candidates across all positions
  const topCandidates: CandidateAnalytics[] = []
  positions.forEach((position) => {
    const positionCandidates = candidates.filter((c) => c.positionId === position.id)
    const positionVotes = results[position.id] || {}

    positionCandidates.forEach((candidate) => {
      const votes = positionVotes[candidate.id] || 0
      const positionTotal = Object.values(positionVotes).reduce((sum, v) => sum + v, 0)
      const percentage = positionTotal > 0 ? (votes / positionTotal) * 100 : 0

      topCandidates.push({
        name: candidate.name,
        votes,
        percentage,
        position: position.title,
      })
    })
  })

  // Sort by votes and take top 10
  // Group candidates by position and sort by votes within each position
  const candidatesByPosition: Record<string, CandidateAnalytics[]> = {}
  positions.forEach((position) => {
    candidatesByPosition[position.title] = topCandidates
      .filter((c) => c.position === position.title)
      .sort((a, b) => b.votes - a.votes)
  })

  // Build topCandidatesData: for each position, include all candidates with the highest votes (handle ties)
  const topCandidatesData: CandidateAnalytics[] = []
  positions.forEach((position) => {
    const candidates = candidatesByPosition[position.title]
    if (candidates.length === 0) return
    const maxVotes = candidates[0].votes
    const topForPosition = candidates.filter((c) => c.votes === maxVotes)
    topCandidatesData.push(...topForPosition)
  })

  // Voting trends (mock data based on audit logs)
  const votingTrends: VotingTrend[] = []
  const voteActions = auditLogs.filter((log) => log.action === "VOTE_CAST")

  // Group votes by date
  const votesByDate: Record<string, number> = {}
  voteActions.forEach((log) => {
    const date = new Date(log.timestamp).toLocaleDateString()
    votesByDate[date] = (votesByDate[date] || 0) + 1
  })

  let cumulative = 0
  Object.entries(votesByDate).forEach(([date, votes]) => {
    cumulative += votes
    votingTrends.push({
      date,
      votes,
      cumulative,
    })
  })

  // Export functions
  const exportToCSV = () => {
    const csvData = [
      ["Position", "Candidate", "Votes", "Percentage"],
      ...topCandidates.map((candidate) => [
        candidate.position,
        candidate.name,
        candidate.votes.toString(),
        candidate.percentage.toFixed(2) + "%",
      ]),
    ]

    const csvContent = csvData.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${election.title}-analytics.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // const exportToPDF = () => {
  //     const doc = new jsPDF();
  //     doc.setFontSize(18);
  //     doc.text("Election Analytics", 14, 18);
  //     doc.setFontSize(12);
  //     doc.text(`Election: ${election.title}`, 14, 28);
  //     doc.text(`Token: ${election.electionToken}`, 14, 36);
  //     doc.text(`Start Date: ${election.startDate}`, 14, 44);
  //     doc.text(`End Date: ${election.endDate}`, 14, 52);

  //     doc.setFontSize(14);
  //     doc.text("Key Metrics", 14, 64);
  //     doc.setFontSize(12);
  //     doc.text(`Total Votes: ${totalVotes}`, 14, 72);
  //     doc.text(`Positions: ${positions.length}`, 14, 80);
  //     doc.text(`Candidates: ${candidates.length}`, 14, 88);
  //     doc.text(
  //       `Avg Turnout: ${
  //         totalVotes > 0 ? Math.round((totalVotes / (positions.length * 100)) * 100) : 0
  //       }%`,
  //       14,
  //       96
  //     );

  //     doc.setFontSize(14);
  //     doc.text("Top Candidates", 14, 110);
  //     doc.setFontSize(12);
  //     topCandidatesData.forEach((candidate, i) => {
  //       doc.text(
  //         `${i + 1}. ${candidate.name} (${candidate.position}) - ${candidate.votes} votes (${candidate.percentage.toFixed(1)}%)`,
  //         14,
  //         118 + i * 8
  //       );
  //     });

  //     let y = 118 + topCandidatesData.length * 8 + 10;
  //     doc.setFontSize(14);
  //     doc.text("Votes by Position", 14, y);
  //     doc.setFontSize(12);
  //     analyticsData.forEach((pos, i) => {
  //       doc.text(
  //         `${pos.positionName}: ${pos.totalVotes} votes, ${pos.candidates} candidates, Turnout: ${(pos.turnout * 100).toFixed(1)}%`,
  //         14,
  //         y + 8 + i * 8
  //       );
  //     });

  //     y = y + 8 + analyticsData.length * 8 + 10;
  //     doc.setFontSize(14);
  //     doc.text("Voting Trends", 14, y);
  //     doc.setFontSize(12);
  //     votingTrends.forEach((trend, i) => {
  //       doc.text(
  //         `${trend.date}: ${trend.votes} votes, Cumulative: ${trend.cumulative}`,
  //         14,
  //         y + 8 + i * 8
  //       );
  //     });

  //     doc.save(`${election.title}-analytics.pdf`);
    
  // }
  const exportChartsToPDF = async (doc: jsPDF, yStart: number) => {
    // Pie charts for each position
    for (let i = 0; i < positions.length; i++) {
      const position = positions[i]
      const positionCandidates = candidates.filter((c) => c.positionId === position.id)
      const positionVotes = results[position.id] || {}
      const pieData = positionCandidates.map((candidate) => ({
        name: candidate.name,
        value: positionVotes[candidate.id] || 0,
      }))
      // Create a canvas for the pie chart
      const canvas = document.createElement("canvas")
      canvas.width = 200
      canvas.height = 200
      const ctx = canvas.getContext("2d")
      if (ctx) {
        // Draw pie chart manually
        let total = pieData.reduce((sum, d) => sum + d.value, 0)
        let startAngle = 0
        pieData.forEach((d, idx) => {
          const sliceAngle = (d.value / (total || 1)) * 2 * Math.PI
          ctx.beginPath()
          ctx.moveTo(100, 100)
          ctx.arc(100, 100, 80, startAngle, startAngle + sliceAngle)
          ctx.closePath()
          ctx.fillStyle = COLORS[idx % COLORS.length]
          ctx.fill()
          startAngle += sliceAngle
        })
        // Add legend
        ctx.font = "12px Arial"
        pieData.forEach((d, idx) => {
          ctx.fillStyle = COLORS[idx % COLORS.length]
          ctx.fillRect(10, 170 + idx * 15, 10, 10)
          ctx.fillStyle = "#333"
          ctx.fillText(`${d.name}: ${d.value} votes`, 25, 180 + idx * 15)
        })
      }
      const imgData = canvas.toDataURL("image/png")
      doc.setFontSize(12)
      doc.text(`Position: ${position.title}`, 14, yStart)
      doc.addImage(imgData, "PNG", 14, yStart + 4, 60, 60)
      yStart += 70 + positionCandidates.length * 5
    }

    // Voting Trend chart
    if (votingTrends.length > 0) {
      // Create a canvas for the voting trend chart
      const canvas = document.createElement("canvas")
      canvas.width = 400
      canvas.height = 150
      const ctx = canvas.getContext("2d")
      if (ctx) {
        // Draw axes
        ctx.strokeStyle = "#ccc"
        ctx.beginPath()
        ctx.moveTo(40, 120)
        ctx.lineTo(380, 120)
        ctx.moveTo(40, 20)
        ctx.lineTo(40, 120)
        ctx.stroke()
        // Draw cumulative votes line
        ctx.strokeStyle = "#F59E0B"
        ctx.beginPath()
        votingTrends.forEach((trend, idx) => {
          const x = 40 + (idx * (340 / (votingTrends.length - 1 || 1)))
          const y = 120 - (trend.cumulative / Math.max(...votingTrends.map(t => t.cumulative)) * 100)
          if (idx === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.stroke()
        // Draw daily votes bars
        ctx.fillStyle = "#EF4444"
        votingTrends.forEach((trend, idx) => {
          const x = 40 + (idx * (340 / (votingTrends.length - 1 || 1)))
          const barHeight = (trend.votes / Math.max(...votingTrends.map(t => t.votes)) * 100)
          ctx.fillRect(x - 5, 120 - barHeight, 10, barHeight)
        })
        // Add labels
        ctx.font = "10px Arial"
        votingTrends.forEach((trend, idx) => {
          const x = 40 + (idx * (340 / (votingTrends.length - 1 || 1)))
          ctx.fillStyle = "#333"
          ctx.fillText(trend.date, x - 10, 135)
        })
      }
      const imgData = canvas.toDataURL("image/png")
      doc.setFontSize(12)
      doc.text("Voting Trend", 14, yStart)
      doc.addImage(imgData, "PNG", 14, yStart + 4, 120, 50)
      yStart += 60
    }
    return yStart
  }

  const exportToPDF = async () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Election Analytics", 14, 18);
    doc.setFontSize(12);
    doc.text(`Election: ${election.title}`, 14, 28);
    doc.text(`Token: ${election.electionToken}`, 14, 36);
    doc.text(`Start Date: ${election.startDate}`, 14, 44);
    doc.text(`End Date: ${election.endDate}`, 14, 52);

    doc.setFontSize(14);
    doc.text("Key Metrics", 14, 64);
    doc.setFontSize(12);
    doc.text(`Total Votes: ${totalVotes}`, 14, 72);
    doc.text(`Positions: ${positions.length}`, 14, 80);
    doc.text(`Candidates: ${candidates.length}`, 14, 88);
    doc.text(
      `Avg Turnout: ${
        totalVotes > 0 ? Math.round((totalVotes / (positions.length * 100)) * 100) : 0
      }%`,
      14,
      96
    );

    doc.setFontSize(14);
    doc.text("Top Candidates", 14, 110);
    doc.setFontSize(12);
    topCandidatesData.forEach((candidate, i) => {
      doc.text(
        `${i + 1}. ${candidate.name} (${candidate.position}) - ${candidate.votes} votes (${candidate.percentage.toFixed(1)}%)`,
        14,
        118 + i * 8
      );
    });

    let y = 118 + topCandidatesData.length * 8 + 10;
    doc.setFontSize(14);
    doc.text("Votes by Position", 14, y);
    doc.setFontSize(12);
    analyticsData.forEach((pos, i) => {
      doc.text(
        `${pos.positionName}: ${pos.totalVotes} votes, ${pos.candidates} candidates, Turnout: ${(pos.turnout * 100).toFixed(1)}%`,
        14,
        y + 8 + i * 8
      );
    });

    y = y + 8 + analyticsData.length * 8 + 10;
    doc.setFontSize(14);
    doc.text("Voting Trends", 14, y);
    doc.setFontSize(12);
    votingTrends.forEach((trend, i) => {
      doc.text(
        `${trend.date}: ${trend.votes} votes, Cumulative: ${trend.cumulative}`,
        14,
        y + 8 + i * 8
      );
    });

    // Add charts
    // y = y + 8 + votingTrends.length * 8 + 10;
    // doc.setFontSize(14);
    // doc.text("Charts", 14, y);
    // y += 6;
    // await exportChartsToPDF(doc, y);

    doc.save(`${election.title}-analytics.pdf`);
  }

  const exportToJSON = () => {
    const exportData = {
      election: {
        title: election.title,
        token: election.electionToken,
        startDate: election.startDate,
        endDate: election.endDate,
      },
      analytics: {
        totalVotes,
        positions: analyticsData,
        topCandidates: topCandidatesData,
        votingTrends,
      },
      timestamp: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${election.title}-analytics.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header with Export Options */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Election Analytics</h2>
            <p className="text-gray-600">{election.title}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button onClick={exportToJSON} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              JSON
            </Button>
            <Button onClick={exportToPDF} variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{totalVotes}</div>
            <p className="text-sm text-gray-600">Total Votes</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{positions.length}</div>
            <p className="text-sm text-gray-600">Positions</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{candidates.length}</div>
            <p className="text-sm text-gray-600">Candidates</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {totalVotes > 0 ? Math.round((totalVotes / (positions.length * (election?.totalVoters))) * 100) : 0}%
            </div>
            <p className="text-sm text-gray-600">Avg Turnout</p>
          </div>
        </div>
      </Card>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Votes by Position */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Votes by Position</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="positionName" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalVotes" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Candidates */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">Top Candidates</h3>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {topCandidatesData.map((candidate, index) => (
              <div key={`${candidate.name}-${candidate.position}`} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-800">{candidate.name}</span>
                    <span className="text-sm text-gray-600">{candidate.votes} votes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {candidate.position}
                    </Badge>
                    <Progress value={candidate.percentage} className="flex-1 h-2" />
                    <span className="text-xs text-gray-500">{candidate.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Candidate Distribution by Position */}
        {positions.map((position, idx) => (
          <Card key={position.id} className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold">
          {position.title} Vote Distribution
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
          <Pie
            data={candidateDistributionByPosition[position.id]}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name}: ${percentage}%`}
            outerRadius={80}
            dataKey="value"
          >
            {candidateDistributionByPosition[position.id].map((entry, i) => (
              <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string, props: any) =>
              [`${value} votes (${props.payload.percentage}%)`, name]
            }
          />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex flex-wrap gap-2">
              {candidateDistributionByPosition[position.id].map((candidate, i) => (
          <Badge
            key={candidate.name}
            style={{
              backgroundColor: COLORS[i % COLORS.length],
              color: "#fff",
            }}
            className="text-xs"
          >
            {candidate.name}: {candidate.value} votes ({candidate.percentage}%)
          </Badge>
              ))}
            </div>
          </Card>
        ))}

        {/* Voting Trends */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold">Voting Activity</h3>
          </div>
          {votingTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={votingTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="cumulative" stroke="#F59E0B" fill="#FEF3C7" name="Cumulative Votes" />
                <Line type="monotone" dataKey="votes" stroke="#EF4444" name="Daily Votes" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No voting activity data available</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Detailed Statistics */}
      <Card className="p-6">

        <h3 className="text-lg font-semibold mb-4">Detailed Position Statistics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Position</th>
                <th className="text-center py-2">Candidates</th>
                <th className="text-center py-2">Total Votes</th>
                <th className="text-center py-2">Avg Votes/Candidate</th>
                <th className="text-center py-2">Competition Level</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.map((position, index) => {
                const avgVotes = position.candidates > 0 ? position.totalVotes / position.candidates : 0
                const competitionLevel = position.candidates > 3 ? "High" : position.candidates > 1 ? "Medium" : "Low"

                return (
                  <tr key={index} className="border-b">
                    <td className="py-2 font-medium">{position.positionName}</td>
                    <td className="text-center py-2">{position.candidates}</td>
                    <td className="text-center py-2">{position.totalVotes}</td>
                    <td className="text-center py-2">{avgVotes.toFixed(1)}</td>
                    <td className="text-center py-2">
                      <Badge
                        variant="secondary"
                        className={
                          competitionLevel === "High"
                            ? "bg-red-100 text-red-800"
                            : competitionLevel === "Medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }
                      >
                        {competitionLevel}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
