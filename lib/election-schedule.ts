export type ElectionPhase = "upcoming" | "active" | "ended"

type TimedElection = {
  startDate?: unknown
  endDate?: unknown
  startTime?: unknown
  endTime?: unknown
}

function toDate(value: unknown): Date | null {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof value === "object" && value !== null && "toDate" in value && typeof (value as { toDate?: unknown }).toDate === "function") {
    const date = (value as { toDate: () => Date }).toDate()
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null
  }
  const date = new Date(value as string | number)
  return Number.isNaN(date.getTime()) ? null : date
}

export function electionStart(election: TimedElection) {
  return toDate(election.startDate) || toDate(election.startTime)
}

export function electionEnd(election: TimedElection) {
  return toDate(election.endDate) || toDate(election.endTime)
}

/** Voting opens at the start instant and closes when the end instant is reached. */
export function electionPhase(election: TimedElection, now = new Date()): ElectionPhase {
  const start = electionStart(election)
  const end = electionEnd(election)
  if (!start || !end) return "upcoming"
  if (now < start) return "upcoming"
  if (now >= end) return "ended"
  return "active"
}

export function electionScheduleLabel(election: TimedElection) {
  const phase = electionPhase(election)
  if (phase === "active") return "Ongoing"
  if (phase === "ended") return "Ended"
  return "Not started"
}

export function formatElectionDateTime(value: unknown) {
  const date = toDate(value)
  if (!date) return "Not set"
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function toDateTimeLocalValue(value: unknown) {
  const date = toDate(value)
  if (!date) return ""
  const pad = (part: number) => String(part).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
