import { ORG_EMAIL_EXAMPLE } from "@/lib/org-email"

export function OrgEmailHint({ tone = "muted" }: { tone?: "muted" | "light" }) {
  const text = tone === "light" ? "text-white/80" : "text-gray-500"

  return (
    <p className={`text-xs leading-relaxed ${text}`}>
      Use an organisation email when an election is limited to organisation members
    </p>
  )
}
