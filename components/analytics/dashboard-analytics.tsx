"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Users, Vote, Clock, CheckCircle, AlertCircle } from "lucide-react"
import type { Role } from "@/lib/types"

interface DashboardAnalyticsProps {
  roles: Role[]
}

interface ElectionStats {
  name: string
  status: string
  votes: number
  positions: number
  candidates: number
  daysRemaining: number
}

export function DashboardAnalytics({ roles }: DashboardAnalyticsProps) {
  // Process roles data for analytics
  const activeElections = roles.filter((role) => role.status === "approved")
  const pendingElections = roles.filter((role) => role.status === "pending")
  const adminRoles = roles.filter((role) => role.role === "admin")
  const voterRoles = roles.filter((role) => role.role === "voter")

  // Mock election stats (in real app, this would come from database)
  const electionStats: ElectionStats[] = activeElections.map((role) => ({
    name: role.electionToken,
    status: "active",
    votes: Math.floor(Math.random() * 500), // Mock data
    positions: Math.floor(Math.random() * 10) + 1,
    candidates: Math.floor(Math.random() * 20) + 5,
    daysRemaining: Math.floor(Math.random() * 30),
  }))

  // Activity trends (mock data)
  const activityTrends = [
    { date: "2024-01", elections: 2, votes: 150 },
    { date: "2024-02", elections: 3, votes: 280 },
    { date: "2024-03", elections: 1, votes: 120 },
    { date: "2024-04", elections: 4, votes: 450 },
    { date: "2024-05", elections: 2, votes: 320 },
    { date: "2024-06", elections: 3, votes: 380 },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-red-100 text-red-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Vote className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{roles.length}</h3>
              <p className="text-gray-600">Total Elections</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{activeElections.length}</h3>
              <p className="text-gray-600">Active Elections</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{pendingElections.length}</h3>
              <p className="text-gray-600">Pending Approval</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{adminRoles.length}</h3>
              <p className="text-gray-600">Admin Roles</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Election Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Election Activity Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="elections" stroke="#3B82F6" name="Elections" strokeWidth={2} />
              <Line type="monotone" dataKey="votes" stroke="#10B981" name="Total Votes" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Role Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Role Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Admin Roles</span>
                <span className="text-sm text-gray-600">{adminRoles.length}</span>
              </div>
              <Progress value={(adminRoles.length / roles.length) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Voter Roles</span>
                <span className="text-sm text-gray-600">{voterRoles.length}</span>
              </div>
              <Progress value={(voterRoles.length / roles.length) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Active Elections</span>
                <span className="text-sm text-gray-600">{activeElections.length}</span>
              </div>
              <Progress value={(activeElections.length / roles.length) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Pending Elections</span>
                <span className="text-sm text-gray-600">{pendingElections.length}</span>
              </div>
              <Progress value={(pendingElections.length / roles.length) * 100} className="h-2" />
            </div>
          </div>
        </Card>
      </div>

      {/* Election Details Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Election Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Election Token</th>
                <th className="text-center py-2">Role</th>
                <th className="text-center py-2">Status</th>
                <th className="text-center py-2">Organization</th>
                <th className="text-center py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="border-b">
                  <td className="py-2 font-mono text-xs">{role.electionToken}</td>
                  <td className="text-center py-2">
                    <Badge variant="secondary" className="capitalize">
                      {role.role}
                    </Badge>
                  </td>
                  <td className="text-center py-2">
                    <div className="flex items-center justify-center gap-1">
                      {getStatusIcon(role.status)}
                      <Badge className={getStatusColor(role.status)}>{role.status}</Badge>
                    </div>
                  </td>
                  <td className="text-center py-2 text-xs">{role.organizationId}</td>
                  <td className="text-center py-2 text-xs">
                    {new Date().toLocaleDateString()} {/* Mock date */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
