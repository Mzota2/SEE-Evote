import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Only allow in-app paths, so a shared link can return people to the join page. */
export function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return null
  return value
}

export function electionJoinPath(token: string) {
  return `/join/${encodeURIComponent(token)}`
}

/** Compare election codes after decoding and removing spaces, so "My Org" matches "My%20Org". */
export function electionTokensMatch(left?: string | null, right?: string | null) {
  if (!left || !right) return false
  return compactElectionToken(left) === compactElectionToken(right)
}

function compactElectionToken(value: string) {
  let token = value
  try {
    token = decodeURIComponent(value)
  } catch {
    token = value
  }
  return token.replace(/\s+/g, "")
}

/** Firestore rejects undefined field values. Drop them before every write. */
export function omitUndefined<T extends Record<string, unknown>>(data: T): T {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)) as T
}
