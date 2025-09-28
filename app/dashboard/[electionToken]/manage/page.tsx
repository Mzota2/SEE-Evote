"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getElectionByToken,
  getUserRoles,
  getElectionPositions,
  getElectionCandidates,
  getDetailedVoteResults,
} from "@/lib/database"
import type { Election, Role, Position, Candidate } from "@/lib/types"
import {
  Settings,
  Users,
  Vote,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  FileText,
  Shield,
} from "lucide-react"
import Link from "next/link"

export default function ElectionManagePage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading } = useAuth()
  const electionToken = params.electionToken as string

  const [election, setElection] = useState<Election | null>(null)
  const [userRole, setUserRole] = useState<Role | null>(null)
  const [positions, setPositions] = useState<Position[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [voteResults, setVoteResults] = useState<any>(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        const [electionResult, rolesResult] = await Promise.all([
          getElectionByToken(electionToken),
          getUserRoles(user.id),
        ])

        if (electionResult.election) {
          setElection(electionResult.election)

          // Fetch additional data
          const [positionsResult, candidatesResult, resultsResult] = await Promise.all([
            getElectionPositions(electionResult.election.id),
            getElectionCandidates(electionResult.election.id),
            getDetailedVoteResults(electionResult.election.id),
          ])

          setPositions(positionsResult.positions)
          setCandidates(candidatesResult.candidates)
          setVoteResults(resultsResult)
        }

        const adminRole = rolesResult.roles.find(
          (role) => role.electionToken === electionToken && role.role === "admin",
        )
        setUserRole(adminRole || null)

        if (!adminRole) {
          router.push(`/dashboard/${electionToken}`)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoadingData(false)
      }
    }

    if (!loading && user) {
      fetchData()
    }
  }, [user, loading, electionToken, router])

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ivote-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading election management...</p>
        </div>
      </div>
    )
  }

  if (!election || !userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to manage this election.</p>
        </div>
      </div>
    )
  }

  const getElectionStatusColor = (status: string) => {
    switch (status) {
      case "ongoing":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar electionToken={electionToken} userRole={userRole.role} />

      <div className="flex-1 ml-64">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Settings className="w-8 h-8 text-ivote-primary" />
                  <h1 className="text-3xl font-bold text-gray-800">Election Management</h1>
                </div>
                <p className="text-gray-600">Comprehensive overview and management of your election</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/dashboard/${electionToken}/settings`}>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </Link>
                <Link href={`/dashboard/${electionToken}`}>
                  <Button className="bg-ivote-primary hover:bg-ivote-primary/90">
                    <Calendar className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Election Status Card */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Election Status</h2>
                  <Badge className={getElectionStatusColor(election.status)}>{election.status}</Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-700 mb-1">Election Title</h3>
                      <p className="text-gray-900">{election.title}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700 mb-1">Description</h3>
                      <p className="text-gray-600">{election.description}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700 mb-1">Organization</h3>
                      <p className="text-gray-900 font-mono">{election.organizationId}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-700 mb-1">Election Period</h3>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(election.startDate).toLocaleDateString()} -{" "}
                          {new Date(election.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700 mb-1">Approval Status</h3>
                      <div className="flex items-center gap-2">
                        {election.approval === "approved" ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-600" />
                        )}
                        <Badge variant={election.approval === "approved" ? "default" : "secondary"}>
                          {election.approval}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700 mb-1">Results Visibility</h3>
                      <div className="flex items-center gap-2">
                        {election.resultsVisible ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-600" />
                        )}
                        <span className="text-gray-600">
                          {election.resultsVisible ? "Visible to voters" : "Hidden from voters"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Quick Stats */}
              <div className="grid md:grid-cols-4 gap-6">
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Vote className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{positions.length}</h3>
                      <p className="text-gray-600">Positions</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{candidates.length}</h3>
                      <p className="text-gray-600">Candidates</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{voteResults?.totalVotes || 0}</h3>
                      <p className="text-gray-600">Votes Cast</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">0%</h3>
                      <p className="text-gray-600">Turnout</p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Positions</h3>
                    <Link href={`/dashboard/${electionToken}/positions`}>
                      <Button size="sm" variant="outline">
                        Manage
                      </Button>
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {positions.length > 0 ? (
                      positions.slice(0, 5).map((position) => (
                        <div key={position.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-800">{position.title}</span>
                          <Badge variant="secondary">
                            {candidates.filter((c) => c.positionId === position.id).length} candidates
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No positions created yet</p>
                    )}
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Recent Candidates</h3>
                    <Link href={`/dashboard/${electionToken}/candidates`}>
                      <Button size="sm" variant="outline">
                        Manage
                      </Button>
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {candidates.length > 0 ? (
                      candidates.slice(0, 5).map((candidate) => (
                        <div key={candidate.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{candidate.name}</p>
                            <p className="text-xs text-gray-500">
                              {positions.find((p) => p.id === candidate.positionId)?.title}
                            </p>
                          </div>
                          <Badge variant={candidate.status === "active" ? "default" : "secondary"}>
                            {candidate.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No candidates added yet</p>
                    )}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Election Analytics</h3>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Detailed analytics will be available once voting begins</p>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="actions" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link href={`/dashboard/${electionToken}/positions`} className="block">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Vote className="w-4 h-4 mr-2" />
                        Manage Positions
                      </Button>
                    </Link>
                    <Link href={`/dashboard/${electionToken}/candidates`} className="block">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Users className="w-4 h-4 mr-2" />
                        Manage Candidates
                      </Button>
                    </Link>
                    <Link href={`/dashboard/${electionToken}/results`} className="block">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Results
                      </Button>
                    </Link>
                    <Link href={`/dashboard/${electionToken}/logs`} className="block">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <FileText className="w-4 h-4 mr-2" />
                        Activity Logs
                      </Button>
                    </Link>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">System Actions</h3>
                  <div className="space-y-3">
                    <Link href={`/dashboard/${electionToken}/settings`} className="block">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Settings className="w-4 h-4 mr-2" />
                        Election Settings
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-start bg-transparent" disabled>
                      <Shield className="w-4 h-4 mr-2" />
                      Security Audit (Coming Soon)
                    </Button>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
