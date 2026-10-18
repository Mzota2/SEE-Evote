"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { getElectionByToken, getUserRoles, joinElectionByToken } from "@/lib/database"
import { toFriendlyMessage } from "@/lib/user-messages"
import { electionJoinPath, electionTokensMatch } from "@/lib/utils"
import type { Election, Role } from "@/lib/types"
import { Clock, CheckCircle } from "lucide-react"
import Logo from "@/components/Logo/Logo"

function formatDate(value?: Date | string) {
  if (!value) return "Date not set"
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return "Date not set"
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
}

export function JoinElectionPanel({ token }: { token: string }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [election, setElection] = useState<Election | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [loadingElection, setLoadingElection] = useState(true)
  const [joining, setJoining] = useState(false)
  const [missing, setMissing] = useState(false)
  const next = electionJoinPath(token)

  useEffect(() => {
    const load = async () => {
      const { election: fetched } = await getElectionByToken(token)
      if (!fetched) {
        setMissing(true)
        setLoadingElection(false)
        return
      }
      setElection(fetched)
      if (user) {
        const { roles } = await getUserRoles(user.id)
        setRole(roles.find((item) => electionTokensMatch(item.electionToken, fetched.electionToken)) || null)
      }
      setLoadingElection(false)
    }
    if (!loading) load()
  }, [token, user, loading])

  const handleJoin = async () => {
    if (!user || !election) return
    setJoining(true)
    const result = await joinElectionByToken(user.id, election.electionToken)
    setJoining(false)
    if (result.success || ("alreadyJoined" in result && result.alreadyJoined)) {
      const approved = "roleStatus" in result && result.roleStatus === "approved"
      toast({
        title: "alreadyJoined" in result && result.alreadyJoined ? "You have already joined" : "Request sent",
        description: approved
          ? "Your voting rights are already approved."
          : "The organiser still needs to approve your voting rights before you can vote.",
      })
      router.push(`/dashboard/${encodeURIComponent(election.electionToken)}`)
      return
    }
    toast({
      title: "Could not join",
      description: toFriendlyMessage(result.error, "Please try again."),
      variant: "destructive",
    })
  }

  if (loading || loadingElection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-amber-50">
        <p className="text-gray-600">Loading election...</p>
      </div>
    )
  }

  if (missing || !election) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-amber-50 p-6">
        <Card className="max-w-md p-8 text-center space-y-3">
          <h1 className="text-xl font-semibold text-gray-800">Election not found</h1>
          <p className="text-gray-600">This link does not match an election. Ask the organiser for a new link.</p>
          <Link href="/">
            <Button className="bg-ivote-primary hover:bg-ivote-primary/90">Go to SEE-Evote</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const waiting = role?.status === "pending"
  const approved = role?.status === "approved"
  const rejected = role?.status === "rejected"
  const closedForJoining = !!election.approval && election.approval !== "approved"

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-amber-50 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="text-center">
          <Logo />
        </div>
        <Card className="overflow-hidden shadow-xl border-0">
          <div
            className="aspect-video w-full bg-cover bg-center"
            style={{
              backgroundImage: election.backgroundImage
                ? `linear-gradient(180deg, rgba(15,23,42,0.05), rgba(15,23,42,0.55)), url(${election.backgroundImage})`
                : "linear-gradient(135deg, #4fc3e0, #f5c242)",
            }}
          />
          <div className="p-6 space-y-4">
            <p className="text-sm font-medium text-ivote-primary">{election.organizationId}</p>
            <h1 className="text-2xl font-bold text-gray-800">{election.title}</h1>
            {election.description ? <p className="text-gray-600">{election.description}</p> : null}
            <p className="text-sm text-gray-500">
              {formatDate(election.startDate)} – {formatDate(election.endDate)}
            </p>

            {waiting ? (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-semibold">
                  <Clock className="w-5 h-5" />
                  Waiting for approval
                </div>
                <p className="text-sm text-amber-900">
                  You have joined this election. You cannot vote yet. The organiser needs to approve your voting rights first.
                </p>
              </div>
            ) : null}

            {approved ? (
              <div className="rounded-xl bg-green-50 border border-green-200 p-4 space-y-2">
                <div className="flex items-center gap-2 text-green-800 font-semibold">
                  <CheckCircle className="w-5 h-5" />
                  You can vote
                </div>
                <p className="text-sm text-green-800">The organiser has approved your voting rights.</p>
              </div>
            ) : null}

            {rejected ? (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-800">The organiser did not approve your voting rights for this election.</p>
              </div>
            ) : null}

            {!role && !closedForJoining ? (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                <p className="text-sm text-amber-950">
                  Joining sends a request. You will be able to vote only after the organiser approves your voting rights.
                </p>
              </div>
            ) : null}

            {closedForJoining ? (
              <p className="text-sm text-gray-600">This election is not open for joining yet.</p>
            ) : null}

            {approved ? (
              <Link href={`/dashboard/${encodeURIComponent(election.electionToken)}`}>
                <Button className="w-full bg-ivote-primary hover:bg-ivote-primary/90">Open the election</Button>
              </Link>
            ) : waiting ? (
              <Link href={`/dashboard/${encodeURIComponent(election.electionToken)}`}>
                <Button variant="outline" className="w-full">
                  See your request
                </Button>
              </Link>
            ) : user && !closedForJoining && !rejected ? (
              <Button onClick={handleJoin} disabled={joining} className="w-full bg-ivote-primary hover:bg-ivote-primary/90">
                {joining ? "Sending request..." : "Confirm and join"}
              </Button>
            ) : !user ? (
              <div className="grid gap-3">
                <Link href={`/login?next=${encodeURIComponent(next)}`}>
                  <Button className="w-full bg-ivote-primary hover:bg-ivote-primary/90">Sign in to join</Button>
                </Link>
                <Link href={`/register?next=${encodeURIComponent(next)}`}>
                  <Button variant="outline" className="w-full">
                    Create an account
                  </Button>
                </Link>
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  )
}
