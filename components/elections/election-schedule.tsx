import { electionEnd, electionStart, formatElectionDateTime } from "@/lib/election-schedule"

export function ElectionSchedule({
  election,
  className = "text-sm text-gray-600 space-y-0.5",
}: {
  election: { startDate?: unknown; endDate?: unknown; startTime?: unknown; endTime?: unknown }
  className?: string
}) {
  return (
    <div className={className}>
      <p>Starts {formatElectionDateTime(electionStart(election))}</p>
      <p>Ends {formatElectionDateTime(electionEnd(election))}</p>
    </div>
  )
}
