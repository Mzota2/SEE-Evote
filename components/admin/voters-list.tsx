"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { User } from "@/lib/types"
import { UserIcon, Mail, Phone, MapPin } from "lucide-react"

interface VotersListProps {
  voters: User[]
  loading: boolean
  onVotersUpdate: (voters: User[]) => void
}

export function VotersList({ voters, loading, onVotersUpdate }: VotersListProps) {
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
    <div className="space-y-4">
      {voters.map((voter) => (
        <Card key={voter.id} className="p-6">
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
              <Badge className="bg-green-100 text-green-800">Active</Badge>
              <Button variant="outline" size="sm">
                View Profile
              </Button>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
