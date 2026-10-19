import { checkUserSuperAdminRole, ensureRequesterAdmin, getElectionByToken, getUserRoles } from "@/lib/database"
import type { Election, Role } from "@/lib/types"
import { electionTokensMatch } from "@/lib/utils"

export function canManageElection(role?: Pick<Role, "role" | "status"> | null): role is Role {
  return !!role && role.status === "approved" && (role.role === "admin" || role.role === "superAdmin")
}

export async function openElection(userId: string, electionToken: string) {
  const { election, error } = await getElectionByToken(electionToken)
  if (!election) {
    return { election: null as Election | null, role: null as Role | null, error: error || "We could not find this election." }
  }

  await ensureRequesterAdmin(userId, election)
  const [{ roles, error: rolesError }, isSuperAdmin] = await Promise.all([
    getUserRoles(userId),
    checkUserSuperAdminRole(userId),
  ])

  if (rolesError) {
    return { election, role: null as Role | null, error: "We could not open this election. Please try again." }
  }

  if (isSuperAdmin) {
    const role: Role = {
      id: `superadmin-${election.id}`,
      userId,
      electionId: election.id,
      electionToken: election.electionToken,
      organizationId: election.organizationId,
      role: "superAdmin",
      status: "approved",
      createdAt: new Date(),
    }
    return { election, role, error: null }
  }

  const matching = roles.filter(
    (role) => electionTokensMatch(role.electionToken, election.electionToken) || role.electionId === election.id,
  )

  if (election.createdBy === userId) {
    const rejectedAdmin = matching.find((role) => role.role === "admin" && role.status === "rejected")
    if (!rejectedAdmin) {
      const admin = matching.find((role) => role.role === "admin")
      if (admin) return { election, role: { ...admin, status: "approved" }, error: null }
      const role: Role = {
        id: `requester-${election.id}`,
        userId,
        electionId: election.id,
        electionToken: election.electionToken,
        organizationId: election.organizationId,
        role: "admin",
        status: "approved",
        createdAt: new Date(),
      }
      return { election, role, error: null }
    }
  }

  const admin = matching.find((role) => role.role === "admin" && role.status === "approved")
  if (admin) return { election, role: admin, error: null }

  const own = matching.find((role) => role.role === "voter") || matching[0] || null
  return { election, role: own, error: null }
}
