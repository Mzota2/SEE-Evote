"use client"

import { JoinElectionPanel } from "@/components/elections/join-election-panel"

export default function JoinElectionPage({ params }: { params: { electionToken: string } }) {
  return <JoinElectionPanel token={params.electionToken} />
}
