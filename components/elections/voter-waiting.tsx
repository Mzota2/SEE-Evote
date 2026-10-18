"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Election } from "@/lib/types"
import { Clock } from "lucide-react"

export function VoterWaiting({ election, rejected = false }: { election: Election; rejected?: boolean }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-amber-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <Card className="overflow-hidden shadow-xl border-0">
          <div
            className="aspect-video w-full bg-cover bg-center"
            style={{
              backgroundImage: election.backgroundImage
                ? `linear-gradient(180deg, rgba(15,23,42,0.05), rgba(15,23,42,0.5)), url(${election.backgroundImage})`
                : "linear-gradient(135deg, #4fc3e0, #f5c242)",
            }}
          />
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-800 font-semibold">
              <Clock className="w-5 h-5" />
              {rejected ? "Voting rights not approved" : "Waiting for approval"}
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{election.title}</h1>
            {rejected ? (
              <p className="text-gray-700">
                You joined this election, but the organiser did not approve your voting rights. You cannot open the ballot.
              </p>
            ) : (
              <p className="text-gray-700">
                You have joined this election. You are not locked out — your request is waiting. You can vote only after
                the organiser approves your voting rights.
              </p>
            )}
            <p className="text-sm text-gray-500">
              The organiser reviews new voters from the voters list. Check back here after they approve you.
            </p>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                Back to your elections
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
