export const DEFAULT_ORG_DOMAIN = "mubas.ac.mw"
export const ORG_EMAIL_EXAMPLE = "bece22-echirambo@mubas.ac.mw"

export interface ParsedOrgEmail {
  program: string
  year: string
  name: string
  domain: string
  email: string
}

/** Organisation emails look like bece22-echirambo@mubas.ac.mw */
export function parseOrganizationEmail(email: string): ParsedOrgEmail | null {
  const trimmed = email.trim().toLowerCase()
  const match = trimmed.match(/^([a-z]+)(\d{2})-([a-z0-9._-]+)@([a-z0-9.-]+\.[a-z]{2,})$/)
  if (!match) return null

  return {
    program: match[1],
    year: match[2],
    name: match[3],
    domain: match[4],
    email: trimmed,
  }
}

const DOMAIN_PATTERN = /^[a-z0-9.-]+\.[a-z]{2,}$/

/** Accept one domain, a comma-separated list, or an array. Invalid entries are dropped. */
export function parseOrganizationDomains(value?: string | string[] | null): string[] {
  const parts = Array.isArray(value) ? value : String(value || "").split(/[,;\n]+/)
  const domains = parts
    .map((part) => part.trim().toLowerCase().replace(/^@/, ""))
    .filter((part) => DOMAIN_PATTERN.test(part))
  return [...new Set(domains)]
}

export function electionOrganizationDomains(election?: {
  organizationDomain?: string | null
  organizationDomains?: string[] | null
} | null): string[] {
  const fromList = parseOrganizationDomains(election?.organizationDomains)
  if (fromList.length) return fromList
  const fromText = parseOrganizationDomains(election?.organizationDomain)
  return fromText.length ? fromText : [DEFAULT_ORG_DOMAIN]
}

export function isOrganizationMemberEmail(email: string, domain: string | string[] = DEFAULT_ORG_DOMAIN) {
  const parsed = parseOrganizationEmail(email)
  if (!parsed) return false
  const allowed = parseOrganizationDomains(domain)
  return (allowed.length ? allowed : [DEFAULT_ORG_DOMAIN]).includes(parsed.domain)
}

export function orgEmailHint(domain: string | string[] = DEFAULT_ORG_DOMAIN) {
  const allowed = parseOrganizationDomains(domain)
  return `bece22-yourname@${allowed[0] || DEFAULT_ORG_DOMAIN}`
}

export function orgEmailExamples(domain: string | string[] = DEFAULT_ORG_DOMAIN) {
  const allowed = parseOrganizationDomains(domain)
  const domains = allowed.length ? allowed : [DEFAULT_ORG_DOMAIN]
  return domains.map((item) => `bece22-yourname@${item}`).join(" or ")
}
