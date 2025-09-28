"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Election } from "@/lib/types"
import { Calendar, Clock } from "lucide-react"

interface OngoingElectionsProps {
  elections: Election[]
  loading: boolean
}

export function OngoingElections({ elections, loading }: OngoingElectionsProps) {
  const ongoingElections = elections.filter((election) => election.status === "ongoing")

  if (loading) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Ongoing Elections</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Ongoing Elections</h2>

      {ongoingElections.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No ongoing elections at the moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ongoingElections.map((election) => (
            <div key={election.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{election.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Ends: {new Date(election.endTime).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" className="bg-ivote-primary hover:bg-ivote-primary/90">
                    Vote now
                  </Button>
                  <div className="w-16 h-16 bg-ivote-primary/10 rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 bg-ivote-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">VOTE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
