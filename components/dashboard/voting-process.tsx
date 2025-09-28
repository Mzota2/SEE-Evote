"use client"

import { Card } from "@/components/ui/card"

export function VotingProcess() {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Voting Process</h2>

      <div className="space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-ivote-primary rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-white text-2xl font-bold">362</span>
          </div>
          <p className="text-sm text-gray-600">Total number of registered voters</p>
        </div>

        <div className="text-center">
          <div className="w-20 h-20 bg-ivote-secondary rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-white text-2xl font-bold">344</span>
          </div>
          <p className="text-sm text-gray-600">Total number of votes</p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-gray-600 text-xl font-bold">3</span>
          </div>
          <p className="text-sm text-gray-600">Total number of registered candidates</p>
        </div>
      </div>
    </Card>
  )
}
