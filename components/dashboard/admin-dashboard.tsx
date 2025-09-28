"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { AuditLogWithUser, Candidate, Election, Position, Role, Vote as VoteType } from "@/lib/types"
import { Users, Calendar, Vote, Settings, BarChart, FileText, TrendingUp } from "lucide-react"
import Link from "next/link"

interface AdminDashboardProps {
  election: Election
  userRole: Role
  candidates: Candidate[]
  positions: Position[]
  logs: AuditLogWithUser[]
  registeredVoters:Role[]
  castedVotes:VoteType[]
}

export function AdminDashboard({ election, userRole, positions, candidates, logs, registeredVoters, castedVotes}: AdminDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Election Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">{election.title}</h1>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Admin
              </Badge>
            </div>
            <p className="text-gray-600">{election.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(election.startDate).toLocaleDateString()} -{" "}
                  {new Date(election.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{election.organizationId}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/${userRole.electionToken}/manage`}>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Manage Election
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-5 gap-4">
        <Link href={`/dashboard/${userRole.electionToken}/positions`}>
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-center space-y-2">
              <Vote className="w-8 h-8 text-ivote-primary mx-auto" />
              <h3 className="font-medium text-gray-800">Positions</h3>
              <p className="text-sm text-gray-600">Manage positions</p>
            </div>
          </Card>
        </Link>

        <Link href={`/dashboard/${userRole.electionToken}/candidates`}>
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-center space-y-2">
              <Users className="w-8 h-8 text-ivote-secondary mx-auto" />
              <h3 className="font-medium text-gray-800">Candidates</h3>
              <p className="text-sm text-gray-600">Manage candidates</p>
            </div>
          </Card>
        </Link>

        <Link href={`/dashboard/${userRole.electionToken}/results`}>
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-center space-y-2">
              <BarChart className="w-8 h-8 text-green-600 mx-auto" />
              <h3 className="font-medium text-gray-800">Results</h3>
              <p className="text-sm text-gray-600">View & manage results</p>
            </div>
          </Card>
        </Link>

        <Link href={`/dashboard/${userRole.electionToken}/analytics`}>
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-center space-y-2">
              <TrendingUp className="w-8 h-8 text-blue-600 mx-auto" />
              <h3 className="font-medium text-gray-800">Analytics</h3>
              <p className="text-sm text-gray-600">View detailed analytics</p>
            </div>
          </Card>
        </Link>

        <Link href={`/dashboard/${userRole.electionToken}/logs`}>
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-center space-y-2">
              <FileText className="w-8 h-8 text-purple-600 mx-auto" />
              <h3 className="font-medium text-gray-800">Activity Logs</h3>
              <p className="text-sm text-gray-600">View election logs</p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Election Statistics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{registeredVoters?.length}</h3>
              <p className="text-gray-600">Total Voters</p>
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
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{candidates?.length || 0}</h3>
              <p className="text-gray-600">Candidates</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <BarChart className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{castedVotes?.length}</h3>
              <p className="text-gray-600">Votes Cast</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
        {logs && logs.length > 0 ? (
          <ul className="space-y-4">
            {logs.map((log) => (
              <li key={log.id} className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-gray-700">{log.action}</p>
                  <span className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                  {/* {log.details} */}
                  <div className="text-xs text-gray-500">By: {log.name || "Unknown User"}</div>
                </div>
                <div className="ml-auto">
                  <Badge className="bg-gray-100 text-gray-800">{log.electionToken}</Badge>
                </div>
                <div className="ml-auto">
                  <Badge className="bg-gray-100 text-gray-800">{log.electionId}</Badge>
                </div>
                <div className="ml-auto">
                  <Badge className="bg-gray-100 text-gray-800">{log.organizationId}</Badge>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No recent activity to display</p>
          </div>
        )}
      </Card>
    </div>
  )
}
