"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getPendingElectionRequests,
  approveElectionRequest,
  rejectElectionRequest,
  checkUserSuperAdminRole,
  getAllElections,
  getAllUsers,
  getAllOrganizations,
} from "@/lib/database"
import type { Election, User, Organization } from "@/lib/types"
import { Clock, CheckCircle, XCircle, Calendar, Building, UserIcon, Users, Vote, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export default function SuperAdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [checkingRole, setCheckingRole] = useState(true)
  const [pendingRequests, setPendingRequests] = useState<Election[]>([])
  const [allElections, setAllElections] = useState<Election[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [positions, setPositions] = useState<any[]>([])
  const [selectedVotes, setSelectedVotes] = useState<any>({})
  const [submittingVotes, setSubmittingVotes] = useState<any>({})

  useEffect(() => {
    const checkSuperAdminAccess = async () => {
      if (!loading && user) {
        const hasAccess = await checkUserSuperAdminRole(user.id)
        setIsSuperAdmin(hasAccess)
        setCheckingRole(false)

        if (!hasAccess) {
          router.push("/dashboard")
        }
      } else if (!loading && !user) {
        router.push("/login")
      }
    }

    checkSuperAdminAccess()
  }, [user, loading, router])

  useEffect(() => {
    const fetchAllData = async () => {
      if (isSuperAdmin && user) {
        try {
          const [pendingResult, electionsResult, usersResult, orgsResult] = await Promise.all([
            getPendingElectionRequests(),
            getAllElections(),
            getAllUsers(),
            getAllOrganizations(),
          ])

          setPendingRequests(pendingResult.elections)
          setAllElections(electionsResult.elections)
          setAllUsers(usersResult.users)
          setAllOrganizations(orgsResult.organizations)
        } catch (error) {
          console.error("Error fetching data:", error)
          toast({
            title: "Error",
            description: "Failed to load dashboard data",
            variant: "destructive",
          })
        } finally {
          setLoadingData(false)
        }
      }
    }

    fetchAllData()
  }, [isSuperAdmin, user, toast])

  const handleApprove = async (electionId: string) => {
    if (!user) return

    setProcessingId(electionId)
    try {
      const result = await approveElectionRequest(electionId, user.id)
      if (result.success) {
        toast({
          title: "Election Approved",
          description: "The election request has been approved and the admin has been notified.",
        })
        setPendingRequests((prev) => prev.filter((req) => req.id !== electionId))
      } else {
        toast({
          title: "Approval Failed",
          description: result.error || "Failed to approve the election request.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    }
    setProcessingId(null)
  }

  const handleReject = async (electionId: string, reason: string) => {
    if (!user) return

    setProcessingId(electionId)
    try {
      const result = await rejectElectionRequest(electionId, user.id, reason)
      if (result.success) {
        toast({
          title: "Election Rejected",
          description: "The election request has been rejected and the admin has been notified.",
        })
        setPendingRequests((prev) => prev.filter((req) => req.id !== electionId))
      } else {
        toast({
          title: "Rejection Failed",
          description: result.error || "Failed to reject the election request.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    }
    setProcessingId(null)
  }

  const getCandidatesForPosition = (positionId: string) => {
    // Placeholder function to get candidates for a position
    return []
  }

  const hasVotedForPosition = (positionId: string) => {
    // Placeholder function to check if user has voted for a position
    return false
  }

  const handleVoteSubmit = async (positionId: string) => {
    // Placeholder function to handle vote submission
    setSubmittingVotes((prev) => ({ ...prev, [positionId]: true }))
    setTimeout(() => {
      setSubmittingVotes((prev) => ({ ...prev, [positionId]: false }))
    }, 2000)
  }

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ivote-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have SuperAdmin permissions to access this page.</p>
          <Link href="/dashboard">
            <Button className="bg-ivote-primary hover:bg-ivote-primary/90">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-ivote-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">i</span>
            </div>
            <span className="text-2xl font-bold text-gray-800">VOTE</span>
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-ivote-primary" />
            <h1 className="text-3xl font-bold text-gray-800">Super Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">System-wide administration and management</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{pendingRequests.length}</h3>
                <p className="text-gray-600">Pending Requests</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Vote className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{allElections.length}</h3>
                <p className="text-gray-600">Total Elections</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{allUsers.length}</h3>
                <p className="text-gray-600">Total Users</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Building className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{allOrganizations.length}</h3>
                <p className="text-gray-600">Organizations</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pending Requests</TabsTrigger>
            <TabsTrigger value="elections">All Elections</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="organizations">Organizations</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Pending Election Requests</h2>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {pendingRequests.length} Pending
              </Badge>
            </div>

            {loadingData ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-ivote-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading pending requests...</p>
              </div>
            ) : pendingRequests.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">No Pending Requests</h3>
                  <p className="text-gray-600">All election requests have been processed.</p>
                </div>
              </Card>
            ) : (
              <div className="grid gap-6">
                {pendingRequests.map((request) => (
                  <Card key={request.id} className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-semibold text-gray-800">{request.title}</h3>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending Approval
                            </Badge>
                          </div>
                          <p className="text-gray-600">{request.description}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 py-4 border-t border-b">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Organization</p>
                            <p className="text-sm text-gray-600">{request.organizationId}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Duration</p>
                            <p className="text-sm text-gray-600">
                              {new Date(request.startDate).toLocaleDateString()} -{" "}
                              {new Date(request.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Token</p>
                            <p className="text-sm text-gray-600 font-mono">{request.electionToken}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button
                          onClick={() => handleApprove(request.id)}
                          disabled={processingId === request.id}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {processingId === request.id ? "Approving..." : "Approve"}
                        </Button>
                        <Button
                          onClick={() => handleReject(request.id, "Request rejected by super admin")}
                          disabled={processingId === request.id}
                          variant="destructive"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          {processingId === request.id ? "Rejecting..." : "Reject"}
                        </Button>
                        <div className="text-sm text-gray-500">
                          Requested on {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="elections" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">All Elections</h2>
            {loadingData ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-ivote-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading elections...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {allElections.map((election) => (
                  <Card key={election.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">{election.title}</h3>
                        <p className="text-sm text-gray-600">{election.organizationId}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            election.approval === "approved"
                              ? "default"
                              : election.approval === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {election.approval}
                        </Badge>
                        <span className="text-sm text-gray-500">{election.electionToken}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">System Users</h2>
            {loadingData ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-ivote-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading users...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {allUsers.map((user) => (
                  <Card key={user.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <span className="text-sm text-gray-500">{user.organizationId || "No Org"}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="organizations" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Organizations</h2>
            {loadingData ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-ivote-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading organizations...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {allOrganizations.map((org) => (
                  <Card key={org.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">{org.displayName || org.name}</h3>
                        <p className="text-sm text-gray-600">ID: {org.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            org.status === "active" ? "default" : org.status === "pending" ? "secondary" : "destructive"
                          }
                        >
                          {org.status}
                        </Badge>
                        <span className="text-sm text-gray-500">{new Date(org.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Voting Section */}
        <div className="space-y-8 mt-12">
          {positions.map((position) => {
            const positionCandidates = getCandidatesForPosition(position.id)
            const hasVoted = hasVotedForPosition(position.id)
            const isSubmitting = submittingVotes[position.id]

            return (
              <Card key={position.id} className="p-6">
                <div className="space-y-6">
                  {/* Position Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-bold text-gray-800">{position.title}</h2>
                        {hasVoted ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Voted
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Vote className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                      {position.description && <p className="text-gray-600">{position.description}</p>}
                    </div>
                  </div>

                  {/* Candidates */}
                  {hasVoted ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">You have already voted for this position</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        Your vote has been recorded securely and cannot be changed.
                      </p>
                    </div>
                  ) : positionCandidates.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                      <p className="text-gray-600">No candidates available for this position yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <RadioGroup
                        value={selectedVotes[position.id] || ""}
                        onValueChange={(value) => setSelectedVotes((prev) => ({ ...prev, [position.id]: value }))}
                      >
                        <div className="grid gap-4">
                          {positionCandidates.map((candidate) => (
                            <div
                              key={candidate.id}
                              className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50"
                            >
                              <RadioGroupItem value={candidate.id} id={candidate.id} className="mt-1" />
                              <Label htmlFor={candidate.id} className="flex-1 cursor-pointer">
                                <div className="space-y-2">
                                  {/* Candidate Image */}
                                  <div className="w-[200px] mr-auto h-[200px] rounded-md mx-auto overflow-hidden bg-gray-200">
                                    <Image
                                      src={candidate.image || "/placeholder.svg"}
                                      alt={candidate.name}
                                      width={200}
                                      height={200}
                                      className="w-full rounded-md h-full object-cover"
                                    />
                                  </div>
                                  <h3 className="font-semibold text-gray-800">{candidate.name}</h3>
                                  {candidate.description && (
                                    <p className="text-sm text-gray-600">{candidate.description}</p>
                                  )}
                                  {candidate.platform && (
                                    <div className="bg-gray-50 p-3 rounded">
                                      <p className="text-xs font-medium text-gray-700 mb-1">Platform:</p>
                                      <p className="text-sm text-gray-600">{candidate.platform}</p>
                                    </div>
                                  )}
                                </div>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>

                      {/* Vote Button */}
                      <div className="flex justify-end pt-4 border-t">
                        <Button
                          onClick={() => handleVoteSubmit(position.id)}
                          disabled={!selectedVotes[position.id] || isSubmitting}
                          className="bg-ivote-primary hover:bg-ivote-primary/90"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Casting Vote...
                            </>
                          ) : (
                            <>
                              <Vote className="w-4 h-4 mr-2" />
                              Cast Vote
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
