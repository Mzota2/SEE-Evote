"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Role, type User } from "@/lib/types"
import { UserIcon, Mail, Phone, MapPin, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { approveVoter, disapproveVoter, getCastedVotes, getVoterRole } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"

interface VotersListProps {
  voters: User[]
  loading: boolean
  onVotersUpdate: (voters: User[]) => void
  electionToken: string
}

export function VotersList({ voters, loading, onVotersUpdate, electionToken }: VotersListProps) {
  const { toast } = useToast()
  const [showManage, setShowManage] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState<User | null>(null);
  const [voterRoles, setVoterRoles] = useState<Role[]>([]);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set())
  const [rolesReady, setRolesReady] = useState(false)
  const [filter, setFilter] = useState<"not-voted" | "voted" | "admins">("not-voted")

  const handleApprove = async (voterId: string) => {
    try {
      if (!voterId || !electionToken) return;
      const result = await approveVoter(voterId, electionToken)
      if (result.error) {
        toast({
          title: "Cannot approve",
          description: result.error,
          variant: "destructive",
        })
        return
      }
      await fetchVoterRoles();
      setShowManage(false)
      console.log("approved how many times");
    } catch (error) {
      console.log(error);
    }
  }

  const handleDisapprove = async (voterId: string) => {
    try {
      if (!voterId || !electionToken) return;
      await disapproveVoter(voterId, electionToken)
      await fetchVoterRoles();
      setShowManage(false)
    } catch (error) {
      console.log(error);
    }
  }
 const fetchVoterRoles = async () => {
      if (!electionToken) return;
      setRolesReady(false)
      try {
      const [rolesResults, votesResult] = await Promise.all([
        voters?.length
          ? Promise.all(
              voters.map(async (voter) => {
                const { roles: fetchedRoles } = await getVoterRole(voter.id, electionToken);
                return fetchedRoles[0]
              }),
            )
          : Promise.resolve([]),
        getCastedVotes(electionToken),
      ])
      setVoterRoles(rolesResults.filter((role): role is Role => Boolean(role?.id)))
      setVotedIds(new Set((votesResult.votes || []).map((vote) => vote.voterId)))
      } catch (error) {
      console.log(error);
      } finally {
        setRolesReady(true)
      }
    };
  useEffect(()=>{
   
    fetchVoterRoles();
  }, [electionToken, voters])

  // Modal close on outside click
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (showManage && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowManage(false);
        setSelectedVoter(null);
      }
    }
    if (showManage) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showManage]);

  if (loading || !rolesReady) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </Card>
    )
  }

  if (voters.length === 0) {
    return (
      <Card className="p-12 text-center">
        <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">No Voters Yet</h3>
        <p className="text-gray-600">Voters will appear here once they register</p>
      </Card>
    )
  }

  const roleFor = (userId: string) => voterRoles.find((role) => role.userId === userId)
  const admins = voters.filter((person) => {
    const role = roleFor(person.id)?.role
    return role === "admin" || role === "superAdmin"
  })
  const actualVoters = voters.filter((person) => roleFor(person.id)?.role === "voter")
  const votedVoters = actualVoters.filter((person) => votedIds.has(person.id))
  const waitingVoters = actualVoters.filter((person) => !votedIds.has(person.id))

  const renderPerson = (voter: User, canManage: boolean) => {
    const role = roleFor(voter.id)
    return (
      <Card key={voter.id} className="p-4 sm:p-6 relative">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
              <UserIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div className="space-y-1 min-w-0">
              <h3 className="font-semibold text-gray-800 truncate">{voter.name}</h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                <div className="flex items-center gap-1 min-w-0">
                  <Mail className="w-3 h-3 shrink-0" />
                  <span className="truncate">{voter.email}</span>
                </div>
                {voter.contactNumber && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span>{voter.contactNumber}</span>
                  </div>
                )}
                {voter.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>
                      {voter.address.city}, {voter.address.region}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-400">
                Registered: {new Date(voter.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            <Badge className="bg-blue-100 text-blue-800 capitalize">{role?.role || "voter"}</Badge>
            {role?.revokedReason === "organisation_email" ? (
              <Badge className="bg-red-100 text-red-800">Revoked — wrong email</Badge>
            ) : role?.status === "approved" ? (
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            ) : role?.status === "rejected" ? (
              <Badge className="bg-yellow-100 text-yellow-800">Rejected</Badge>
            ) : (
              <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
            )}
            {canManage ? (
              <Button
                onClick={() => {
                  setShowManage(true);
                  setSelectedVoter(voter);
                }}
                variant="outline"
                size="sm"
              >
                Manage
              </Button>
            ) : null}
          </div>
        </div>
      </Card>
    )
  }

  const filters = [
    { id: "not-voted" as const, label: "Not voted", count: waitingVoters.length, description: "Voters who are registered and still have not voted." },
    { id: "voted" as const, label: "Voted", count: votedVoters.length, description: "Voters with at least one vote recorded." },
    { id: "admins" as const, label: "Admins", count: admins.length, description: "People who manage this election." },
  ]
  const activeFilter = filters.find((item) => item.id === filter) || filters[0]
  const visiblePeople = filter === "admins" ? admins : filter === "voted" ? votedVoters : waitingVoters

  return (
    <div className="space-y-4 relative">
      <div className="grid grid-cols-3 gap-2">
        {filters.map((item) => {
          const selected = item.id === filter
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`inline-flex min-w-0 items-center justify-center rounded-full border px-2 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
                selected
                  ? "border-ivote-primary bg-ivote-primary text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="truncate">{item.label}</span>
              <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] sm:ml-2 sm:px-2 sm:text-xs ${selected ? "bg-white/20" : "bg-gray-100 text-gray-600"}`}>
                {item.count}
              </span>
            </button>
          )
        })}
      </div>
      <p className="text-sm text-gray-600">{activeFilter.description}</p>
      {visiblePeople.length === 0 ? (
        <Card className="p-6 text-sm text-gray-500">No one in this group yet.</Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {visiblePeople.map((person) => renderPerson(person, filter !== "admins"))}
        </div>
      )}

      {/* Modal for ManageVoters */}
      {showManage && selectedVoter  && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div ref={modalRef} className="bg-white rounded-lg shadow-lg p-5 sm:p-8 w-full max-w-md relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => { setShowManage(false); setSelectedVoter(null); }}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Manage Voter</h2>
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <UserIcon className="w-6 h-6 text-gray-600" />
                <span className="font-medium">{selectedVoter.name}</span>
              </div>
              <div className="text-sm text-gray-500">{selectedVoter.email}</div>
              <div className="text-xs text-gray-400">
                Registered: {new Date(selectedVoter.createdAt).toLocaleDateString()}
              </div>
            </div>
            <ManageVoters
              handleApprove={() => handleApprove(selectedVoter.id)}
              handleDisapprove={() => handleDisapprove(selectedVoter.id)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// approve and disapprove voters component
interface ManageVotersProps {
  handleApprove: () => void;
  handleDisapprove: () => void;
}
export const ManageVoters = ({ handleApprove, handleDisapprove }: ManageVotersProps) => {
  return (
    <div>
      <p className="text-gray-700 mb-4">Approve or disapprove voters to only allow eligible voters to vote</p>
      <div className="flex items-center gap-2">
        <Button className="bg-green-600 text-white" onClick={handleApprove} variant="outline" size="sm">
          Approve
        </Button>
        <Button className="bg-red-600 text-white" onClick={handleDisapprove} variant="outline" size="sm">
          Disapprove
        </Button>
      </div>
    </div>
  )
}