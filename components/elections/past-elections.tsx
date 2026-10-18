"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getElections } from "@/lib/database"
import type { Election } from "@/lib/types"
import { Calendar, History } from "lucide-react"
import { ElectionSchedule } from "@/components/elections/election-schedule"
import { electionPhase } from "@/lib/election-schedule"

function isPastElection(election: Election) {
  return electionPhase(election) === "ended"
}

export function PastElections() {
  const [elections, setElections] = useState<Election[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { elections: fetched } = await getElections()
      setElections(fetched.filter(isPastElection))
      setLoading(false)
    }
    load()
  }, [])

  return (
    <section className="mt-16 md:mt-20 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm text-ivote-primary shadow-sm">
          <History className="h-4 w-4" />
          Archive
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Past elections</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Closed elections stay on record so voters can revisit what was decided.
        </p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-8">
          {[0, 1].map((item) => (
            <div key={item} className="aspect-video rounded-2xl bg-white/70 animate-pulse" />
          ))}
        </div>
      ) : elections.length === 0 ? (
        <Card className="p-10 text-center bg-white/80">
          <History className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-gray-500">No past elections to show yet.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {elections.map((election) => (
            <Card key={election.id} className="overflow-hidden border-0 shadow-lg bg-white">
              <div
                className="aspect-video w-full bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: election.backgroundImage
                    ? `linear-gradient(180deg, rgba(15,23,42,0.08), rgba(15,23,42,0.45)), url(${election.backgroundImage})`
                    : "linear-gradient(135deg, #4fc3e0, #f5c242)",
                }}
              />
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-gray-800 line-clamp-2">{election.title}</h3>
                  <Badge variant="secondary">Closed</Badge>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{election.description}</p>
                <div className="flex items-start gap-2 text-xs text-gray-500">
                  <Calendar className="h-3.5 w-3.5 mt-0.5" />
                  <ElectionSchedule election={election} className="text-xs text-gray-500 space-y-0.5" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
