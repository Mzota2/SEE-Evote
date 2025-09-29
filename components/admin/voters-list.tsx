"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Role, type User } from "@/lib/types"
import { UserIcon, Mail, Phone, MapPin, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { approveVoter, disapproveVoter, getVoterRole } from "@/lib/database"

interface VotersListProps {
  voters: User[]
  loading: boolean
  onVotersUpdate: (voters: User[]) => void
  electionToken: string
}

export function VotersList({ voters, loading, onVotersUpdate, electionToken }: VotersListProps) {
  const [showManage, setShowManage] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState<User | null>(null);
  const [voterRole, setVoterRole] = useState<Role | null>(null);

  const handleApprove = async (voterId: string) => {
    try {
      if (!voterId || !electionToken) return;
      await approveVoter(voterId, electionToken)
      await handlegetVoterRoles(voterId);
      setShowManage(false)
    } catch (error) {
      console.log(error);
    }
  }

  const handlegetVoterRoles = async (voterId: string) => {
    try {
      if (!voterId || !electionToken) return;
      const { roles: fetchedRoles } = await getVoterRole(voterId, electionToken)
      setVoterRole(fetchedRoles[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const handleDisapprove = async (voterId: string) => {
    try {
      if (!voterId || !electionToken) return;
      await disapproveVoter(voterId, electionToken)
      await handlegetVoterRoles(voterId);
      setShowManage(false)
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (selectedVoter) {
      handlegetVoterRoles(selectedVoter.id)
    }
  }, [selectedVoter, electionToken])

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

  if (loading) {
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

  return (
    <div className="space-y-4 relative">
      {voters.map((voter) => {
        const role = voterRole; // fallback if you have role in voter
        return (
          <Card key={voter.id} className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-gray-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-gray-800">{voter.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      <span>{voter.email}</span>
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
              <div className="flex items-center gap-2">
                {
                  role?.status === 'approved' ?
                    <Badge className="bg-green-100 text-green-800">Active</Badge> :
                    role?.status === 'rejected' ?
                      <Badge className="bg-yellow-100 text-yellow-800">Rejected</Badge> :
                      <Badge className="bg-yellow-100 text-green-800">Pending</Badge>
                }
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
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
              </div>
            </div>
          </Card>
        )
      })}

      {/* Modal for ManageVoters */}
      {showManage && selectedVoter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10">
          <div ref={modalRef} className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
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