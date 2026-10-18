"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  approveElectionRequest,
  rejectElectionRequest,
  checkUserSuperAdminRole,
  getAllElections,
  getAllUsers,
  getAllOrganizations,
} from "@/lib/database"
import { toFriendlyMessage } from "@/lib/user-messages"
import { displayElectionToken } from "@/lib/utils"
import type { Election, User, Organization } from "@/lib/types"
import { Clock, CheckCircle, XCircle, Calendar, Building, Copy, Users, Vote, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

function formatDate(value?: Date | string) {
  if (!value) return "Not set"
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return "Not set"
  return date.toLocaleDateString()
}

function needsDecision(election: Election) {
  return !election.approval || election.approval === "pending"
}

export default function SuperAdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [checkingRole, setCheckingRole] = useState(true)
  const [allElections, setAllElections] = useState<Election[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({})

  const pendingRequests = allElections.filter(needsDecision)

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
          const [electionsResult, usersResult, orgsResult] = await Promise.all([
            getAllElections(),
            getAllUsers(),
            getAllOrganizations(),
          ])

          setAllElections(electionsResult.elections)
          setAllUsers(usersResult.users)
          setAllOrganizations(orgsResult.organizations)

          if (electionsResult.error) {
            toast({
              title: "Could not load elections",
              description: toFriendlyMessage(electionsResult.error, "Refresh the page and try again."),
              variant: "destructive",
            })
          }
        } catch (error) {
          toast({
            title: "Could not load the dashboard",
            description: "Refresh the page and try again.",
            variant: "destructive",
          })
        } finally {
          setLoadingData(false)
        }
      }
    }

    fetchAllData()
  }, [isSuperAdmin, user, toast])

  const markElection = (electionId: string, approval: Election["approval"]) => {
    setAllElections((prev) => prev.map((election) => (election.id === electionId ? { ...election, approval } : election)))
  }

  const handleApprove = async (electionId: string) => {
    if (!user) return

    setProcessingId(electionId)
    try {
      const result = await approveElectionRequest(electionId, user.id)
      if (result.success) {
        markElection(electionId, "approved")
        toast({
          title: "Election approved",
          description: "Voters can now join with the election code.",
        })
      } else {
        toast({
          title: "Could not approve",
          description: toFriendlyMessage(result.error, "Please try again."),
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Could not approve",
        description: toFriendlyMessage(error, "Please try again."),
        variant: "destructive",
      })
    }
    setProcessingId(null)
  }

  const handleReject = async (electionId: string) => {
    if (!user) return
    const reason = (rejectReasons[electionId] || "").trim()
    if (!reason) {
      toast({
        title: "Add a reason",
        description: "Tell the organiser what needs to change before you reject the election.",
        variant: "destructive",
      })
      return
    }

    setProcessingId(electionId)
    try {
      const result = await rejectElectionRequest(electionId, user.id, reason)
      if (result.success) {
        markElection(electionId, "rejected")
        setRejectReasons((prev) => ({ ...prev, [electionId]: "" }))
        toast({
          title: "Election rejected",
          description: "The organiser will see your reason.",
        })
      } else {
        toast({
          title: "Could not reject",
          description: toFriendlyMessage(result.error, "Please try again."),
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Could not reject",
        description: toFriendlyMessage(error, "Please try again."),
        variant: "destructive",
      })
    }
    setProcessingId(null)
  }

  const copyToken = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token)
      toast({ title: "Code copied", description: "The election code is ready to share." })
    } catch {
      toast({
        title: "Could not copy",
        description: "Select the code and copy it yourself.",
        variant: "destructive",
      })
    }
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
          <h2 className="text-xl font-semibold text-gray-800 mb-2">This page is for reviewers only</h2>
          <p className="text-gray-600 mb-4">Your account cannot approve or reject elections.</p>
          <Link href="/dashboard">
            <Button className="bg-ivote-primary hover:bg-ivote-primary/90">Back to your elections</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-4">
            <Image
              width={160}
              height={64}
              src="/see-evote-logo-transparent.png"
              alt="SEE-Evote"
              className="h-14 w-auto"
            />
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-ivote-primary" />
            <h1 className="text-3xl font-bold text-gray-800">Review elections</h1>
          </div>
          <p className="text-gray-600">Approve an election so people can join, or send it back with a short reason.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{pendingRequests.length}</h3>
                <p className="text-gray-600">Waiting for review</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Vote className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{allElections.length}</h3>
                <p className="text-gray-600">All elections</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{allUsers.length}</h3>
                <p className="text-gray-600">People</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Building className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{allOrganizations.length}</h3>
                <p className="text-gray-600">Organisations</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="pending">Waiting ({pendingRequests.length})</TabsTrigger>
            <TabsTrigger value="elections">All elections</TabsTrigger>
            <TabsTrigger value="users">People</TabsTrigger>
            <TabsTrigger value="organizations">Organisations</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {loadingData ? (
              <Card className="p-8 text-center text-gray-600">Loading elections...</Card>
            ) : pendingRequests.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-gray-800">Nothing is waiting</h3>
                <p className="text-gray-600 mt-1">Every election has already been approved or rejected.</p>
              </Card>
            ) : (
              pendingRequests.map((election) => (
                <ElectionReviewCard
                  key={election.id}
                  election={election}
                  busy={processingId === election.id}
                  reason={rejectReasons[election.id] || ""}
                  onReasonChange={(value) => setRejectReasons((prev) => ({ ...prev, [election.id]: value }))}
                  onApprove={() => handleApprove(election.id)}
                  onReject={() => handleReject(election.id)}
                  onCopy={() => copyToken(election.electionToken)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="elections" className="space-y-4">
            {loadingData ? (
              <Card className="p-8 text-center text-gray-600">Loading elections...</Card>
            ) : allElections.length === 0 ? (
              <Card className="p-8 text-center text-gray-600">No elections have been created yet.</Card>
            ) : (
              allElections.map((election) => (
                <ElectionReviewCard
                  key={election.id}
                  election={election}
                  busy={processingId === election.id}
                  reason={rejectReasons[election.id] || ""}
                  onReasonChange={(value) => setRejectReasons((prev) => ({ ...prev, [election.id]: value }))}
                  onApprove={() => handleApprove(election.id)}
                  onReject={() => handleReject(election.id)}
                  onCopy={() => copyToken(election.electionToken)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            {loadingData ? (
              <Card className="p-8 text-center text-gray-600">Loading people...</Card>
            ) : (
              allUsers.map((person) => (
                <Card key={person.id} className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-800">{person.name}</h3>
                      <p className="text-sm text-gray-600">{person.email}</p>
                    </div>
                    <Badge variant={person.isActive ? "default" : "secondary"}>
                      {person.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="organizations" className="space-y-4">
            {loadingData ? (
              <Card className="p-8 text-center text-gray-600">Loading organisations...</Card>
            ) : (
              allOrganizations.map((org) => (
                <Card key={org.id} className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-800">{org.displayName || org.name}</h3>
                      <p className="text-sm text-gray-600">{org.name}</p>
                    </div>
                    <Badge variant={org.status === "active" ? "default" : "secondary"}>{org.status}</Badge>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function ElectionReviewCard({
  election,
  busy,
  reason,
  onReasonChange,
  onApprove,
  onReject,
  onCopy,
}: {
  election: Election
  busy: boolean
  reason: string
  onReasonChange: (value: string) => void
  onApprove: () => void
  onReject: () => void
  onCopy: () => void
}) {
  const waiting = needsDecision(election)

  return (
    <Card className="overflow-hidden">
      {election.backgroundImage ? (
        <div
          className="aspect-video w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${election.backgroundImage})` }}
        />
      ) : null}
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-gray-800">{election.title}</h3>
            <p className="text-gray-600">{election.description}</p>
          </div>
          <Badge
            variant={election.approval === "approved" ? "default" : election.approval === "rejected" ? "destructive" : "secondary"}
            className={waiting ? "bg-yellow-100 text-yellow-800" : undefined}
          >
            {election.approval === "approved" ? "Approved" : election.approval === "rejected" ? "Rejected" : "Waiting"}
          </Badge>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <Building className="w-4 h-4 mt-0.5 text-gray-500" />
            <div>
              <p className="font-medium text-gray-700">Organisation</p>
              <p className="text-gray-600">{election.organizationId}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 mt-0.5 text-gray-500" />
            <div>
              <p className="font-medium text-gray-700">Voting dates</p>
              <p className="text-gray-600">
                {formatDate(election.startDate)} – {formatDate(election.endDate)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 mt-0.5 text-gray-500" />
            <div>
              <p className="font-medium text-gray-700">Expected voters</p>
              <p className="text-gray-600">{election.totalVoters || "Not set"}</p>
              {election.orgMembersOnly ? <p className="text-gray-500">Organisation members only</p> : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
          <span className="text-sm text-gray-500">Election code</span>
          <span className="font-mono text-sm text-gray-800">{displayElectionToken(election.electionToken)}</span>
          <Button type="button" variant="ghost" size="sm" onClick={onCopy}>
            <Copy className="w-4 h-4 mr-1" />
            Copy
          </Button>
          <span className="text-sm text-gray-500 ml-auto">Submitted {formatDate(election.createdAt)}</span>
        </div>

        {election.approval === "rejected" && election.rejectionReason ? (
          <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">Reason: {election.rejectionReason}</p>
        ) : null}

        {waiting ? (
          <div className="space-y-3 border-t pt-4">
            <Textarea
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              placeholder="Reason for the organiser, if you are rejecting this election"
              rows={2}
            />
            <div className="flex flex-wrap gap-3">
              <Button onClick={onApprove} disabled={busy} className="bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle className="w-4 h-4 mr-2" />
                {busy ? "Saving..." : "Approve"}
              </Button>
              <Button onClick={onReject} disabled={busy} variant="destructive">
                <XCircle className="w-4 h-4 mr-2" />
                {busy ? "Saving..." : "Reject"}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  )
}
