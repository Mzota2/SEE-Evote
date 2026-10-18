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

export function isOrganizationMemberEmail(email: string, domain = DEFAULT_ORG_DOMAIN) {
  const parsed = parseOrganizationEmail(email)
  return !!parsed && parsed.domain === domain.trim().toLowerCase()
}

export function orgEmailHint(domain = DEFAULT_ORG_DOMAIN) {
  return `bece22-yourname@${domain.trim().toLowerCase() || DEFAULT_ORG_DOMAIN}`
}
