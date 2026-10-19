"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { AuditLogWithUser, Candidate, Election, Position, Role, Vote as VoteType } from "@/lib/types"
import { Users, Calendar, Vote, Settings, BarChart, FileText, TrendingUp, UserCheck } from "lucide-react"
import Link from "next/link"
import { ShareElectionDialog } from "@/components/elections/share-election-dialog"
import { displayElectionToken } from "@/lib/utils"
import { ElectionSchedule } from "@/components/elections/election-schedule"
import { Progress } from "@/components/ui/progress"

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
  const approvedVoters = (registeredVoters || []).filter((voter) => voter.role === "voter" && voter.status === "approved")
  const votedIds = new Set((castedVotes || []).map((vote) => vote.voterId))
  const votedCount = approvedVoters.filter((voter) => votedIds.has(voter.userId)).length
  const turnout = approvedVoters.length ? Math.round((votedCount / approvedVoters.length) * 100) : 0
  const waitingCount = Math.max(approvedVoters.length - votedCount, 0)

  return (
    <div className="space-y-6">
      {/* Election Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">{election.title}</h1>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {userRole.role === "superAdmin" ? "Super admin" : "Admin"}
              </Badge>
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
          <div className="flex flex-wrap gap-2">
            <ShareElectionDialog election={election} />
            <Link href={`/dashboard/${userRole.electionToken}/manage`}>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Manage Election
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {election.approval && election.approval !== "approved" ? (
        <Card className="p-5 border-amber-200 bg-amber-50">
          <h2 className="font-semibold text-amber-900">Voters cannot join yet</h2>
          <p className="text-sm text-amber-800 mt-1">
            You can set up positions, candidates, and settings now. People can join after a reviewer approves this election.
          </p>
        </Card>
      ) : null}

      <Card className="p-5 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Voting progress</h2>
            <p className="text-sm text-gray-600">
              {votedCount} of {approvedVoters.length} approved voters have voted. {waitingCount} still have not.
            </p>
          </div>
          <p className="text-2xl font-bold text-gray-800">{turnout}%</p>
        </div>
        <Progress value={turnout} className="h-2" />
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-gray-500">Joined</p>
            <p className="text-lg font-semibold text-gray-800">{(registeredVoters || []).filter((voter) => voter.role === "voter").length}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-gray-500">Approved</p>
            <p className="text-lg font-semibold text-gray-800">{approvedVoters.length}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-gray-500">Voted</p>
            <p className="text-lg font-semibold text-gray-800">{votedCount}</p>
          </div>
        </div>
      </Card>

      <Card className="p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Invite voters</h2>
          <p className="text-sm text-gray-600">
            Share a link that already includes the election code. Voters confirm joining, then wait for you to approve their voting rights.
          </p>
        </div>
        <ShareElectionDialog election={election} />
      </Card>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href={`/dashboard/${userRole.electionToken}/voters`}>
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-center space-y-2">
              <UserCheck className="w-8 h-8 text-ivote-primary mx-auto" />
              <h3 className="font-medium text-gray-800">Voters</h3>
              <p className="text-sm text-gray-600">Roles and turnout</p>
            </div>
          </Card>
        </Link>

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
          <ul className="space-y-4 h-[300px] overflow-y-auto">
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
                  <Badge className="bg-gray-100 text-gray-800">{displayElectionToken(log.electionToken)}</Badge>
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
