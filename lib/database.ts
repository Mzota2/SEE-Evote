import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore"
import { db, supabase } from "./firebase"
import type { Election, Vote, Organization, User, Role, Position, Candidate, AuditLogWithUser, VoterID } from "./types"
import { nanoid } from "nanoid"

// Election Management
export const createElection = async (electionData: Omit<Election, "id" | "createdAt" | "approval">) => {
  try {
    const docRef = await addDoc(collection(db, "elections"), {
      ...electionData,
      createdAt: serverTimestamp(),
      approval: "pending",
      resultsVisible: false,
    })
    return { id: docRef.id, error: null }
  } catch (error: any) {
    return { id: null, error: error.message }
  }
}

export const getElections = async (organizationId?: string) => {
  try {
    let q = query(collection(db, "elections"), orderBy("createdAt", "desc"))

    if (organizationId) {
      q = query(
        collection(db, "elections"),
        where("organizationId", "==", organizationId),
        orderBy("createdAt", "desc"),
      )
    }

    const querySnapshot = await getDocs(q)
    const elections = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data()?.startDate?.toDate().toISOString(),
      endDate: doc.data()?.endDate?.toDate().toISOString(),
    })) as Election[]

    console.log(elections)

    return { elections, error: null }
  } catch (error: any) {
    return { elections: [], error: error.message }
  }
}

// Update Election

export const updateElection = async (electionId: string, electionData: Partial<Election>) => {
  try {
    const electionRef = doc(db, "elections", electionId)
    await updateDoc(electionRef, electionData)
    return { election: electionData, error: null }
  } catch (error: any) {
    return { election: {}, error: error.message }
  }
}
// Voting Functions
export const castVote = async (voteData: Omit<Vote, "id" | "timestamp" | "electionToken">) => {
  try {
    // Check if user has already voted for this position
    const existingVoteQuery = query(
      collection(db, "votes"),
      where("voterId", "==", voteData.voterId),
      where("electionId", "==", voteData.electionId),
      where("positionId", "==", voteData.positionId),
    )

    const existingVotes = await getDocs(existingVoteQuery)

    if (!existingVotes.empty) {
      return { success: false, error: "You have already voted for this position" }
    }

    const docRef = await addDoc(collection(db, "votes"), {
      ...voteData,
      timestamp: serverTimestamp(),
    })

    // Log the vote action
    await logAction(voteData.voterId, "VOTE_CAST", voteData.electionId, voteData.organizationId, {
      actionAt:serverTimestamp()
    })

    return { success: true, voteId: docRef.id, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const getCastedVotes = async (electionId: string) => {
  try {
    const votesQuery = query(collection(db, "votes"), where("electionId", "==", electionId))    
    const votesSnapshot = await getDocs(votesQuery)
    const votes = votesSnapshot.docs.map((doc) => doc.data() as Vote)
    return { votes, error: null }
  } catch (error: any) {
    return { votes: [], error: error.message }
  }
}

export const getVoteResults = async (electionId: string) => {
  try {
    const votesQuery = query(collection(db, "votes"), where("electionId", "==", electionId))

    const votesSnapshot = await getDocs(votesQuery)
    const votes = votesSnapshot.docs.map((doc) => doc.data() as Vote)

    // Group votes by position and candidate
    const results = votes.reduce(
      (acc, vote) => {
        if (!acc[vote.positionId]) {
          acc[vote.positionId] = {}
        }
        if (!acc[vote.positionId][vote.candidateId]) {
          acc[vote.positionId][vote.candidateId] = 0
        }
        acc[vote.positionId][vote.candidateId]++
        return acc
      },
      {} as Record<string, Record<string, number>>,
    )

    return { results, totalVotes: votes.length, error: null }
  } catch (error: any) {
    return { results: {}, totalVotes: 0, error: error.message }
  }
}

// Get User Votes
export const getUserVotes = async (userId: string, electionId: string) => {
  try {
    console.log(electionId, userId);
    const votesQuery = query(
      collection(db, "votes"),
      where("voterId", "==", userId),
      where("electionId", "==", electionId),
      orderBy("timestamp", "desc")
    )

    const votesSnapshot = await getDocs(votesQuery)
    const votes = votesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Vote[]
    console.log("votes", votes);
    return { votes, error: null }
  } catch (error: any) {
    return { votes: [], error: error.message }
  }
}

export const getRegisteredVoters = async(electionId: string) => {
  try {
    const votesQuery = query(collection(db, "roles"), where("electionId", "==", electionId), where("role", "==", "voter"))
    const votesSnapshot = await getDocs(votesQuery)
    const voters = votesSnapshot.docs.map((doc) => doc.data() as Role)
    return {voters, error: null }
  } catch (error: any) {
    return { voterIds: [], error: error.message }
  }
}
// Enhanced Vote Results with candidate information
export const getDetailedVoteResults = async (electionId: string) => {
  try {
    const votesQuery = query(collection(db, "votes"), where("electionId", "==", electionId))
    const candidatesQuery = query(collection(db, "candidates"), where("electionId", "==", electionId))
    const positionsQuery = query(collection(db, "positions"), where("electionId", "==", electionId))

    const [votesSnapshot, candidatesSnapshot, positionsSnapshot] = await Promise.all([
      getDocs(votesQuery),
      getDocs(candidatesQuery),
      getDocs(positionsQuery),
    ])

    const votes = votesSnapshot.docs.map((doc) => doc.data() as Vote)
    const candidates = candidatesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Candidate[]
    const positions = positionsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Position[]

    // Group votes by position and candidate
    const results = votes.reduce(
      (acc, vote) => {
        if (!acc[vote.positionId]) {
          acc[vote.positionId] = {}
        }
        if (!acc[vote.positionId][vote.candidateId]) {
          acc[vote.positionId][vote.candidateId] = 0
        }
        acc[vote.positionId][vote.candidateId]++
        return acc
      },
      {} as Record<string, Record<string, number>>,
    )

    return {
      results,
      totalVotes: votes.length,
      candidates,
      positions,
      error: null,
    }
  } catch (error: any) {
    return {
      results: {},
      totalVotes: 0,
      candidates: [],
      positions: [],
      error: error.message,
    }
  }
}

// Organization Management
export const createOrganization = async (orgData: Omit<Organization, "id" | "createdAt">) => {
  try {
    const docRef = await addDoc(collection(db, "organizations"), {
      ...orgData,
      createdAt: serverTimestamp(),
    })
    return { id: docRef.id, error: null }
  } catch (error: any) {
    return { id: null, error: error.message }
  }
}

// Audit Logging
export const logAction = async (
  userId: string,
  action: string,
  electionId?: string,
  organizationId?: string,
  details?: Record<string, any>,
) => {
  try {
    await addDoc(collection(db, "auditLogs"), {
      userId,
      action,
      electionId,
      organizationId,
      details,
      timestamp: serverTimestamp(),
    })
  } catch (error) {
    console.log(error);
    console.error("Failed to log action:", error)
  }
}

export const getActionLogsWithUsers = async (electionId: string) => {
  try {
    const logsQuery = query(collection(db, "auditLogs"), where("electionId", "==", electionId), orderBy("timestamp", "desc"))
    const logsSnapshot = await getDocs(logsQuery)
    const userIds = logsSnapshot.docs.map((doc) => doc.data().userId)

    const usersQuery = query(collection(db, "users"), where("id", "in", userIds))
    const usersSnapshot = await getDocs(usersQuery)
    const logs = logsSnapshot.docs.map((doc) => {
      const user = usersSnapshot.docs.find((userDoc) => userDoc.id === doc.data().userId)
      return {
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
        name: user ? user.data().name : null,
      }
    }) as AuditLogWithUser[]
    return { logs, error: null }
  } catch (error: any) {
    return { logs: [], error: error.message }
  }
}

// User Management
export const getUsersByOrganization = async (organizationId: string) => {
  try {
    const usersQuery = query(collection(db, "users"), where("organizationId", "==", organizationId))

    const usersSnapshot = await getDocs(usersQuery)
    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate()
    })) as User[]

    return { users, error: null }
  } catch (error: any) {
    return { users: [], error: error.message }
  }
}

// Post-Registration Flow Functions
// Join Election by Token
export const joinElectionByToken = async (userId: string, electionToken: string) => {
  try {
    // Find election by token
    const electionQuery = query(
      collection(db, "elections"),
      where("electionToken", "==", electionToken),
      where("approval", "==", "approved"),
    )

    const electionSnapshot = await getDocs(electionQuery)

    if (electionSnapshot.empty) {
      return { success: false, error: "Invalid election token or election not found" }
    }

    const electionDoc = electionSnapshot.docs[0]
    const election = { id: electionDoc.id, ...electionDoc.data() } as Election

    // Check if user already has a role in this election
    const existingRoleQuery = query(
      collection(db, "roles"),
      where("userId", "==", userId),
      where("electionId", "==", election.id),
    )

    const existingRoleSnapshot = await getDocs(existingRoleQuery)

    if (!existingRoleSnapshot.empty) {
      return { success: false, error: "You are already registered for this election" }
    }

    // Create voter role
    await addDoc(collection(db, "roles"), {
      userId,
      electionId: election.id,
      electionToken,
      organizationId: election.organizationId,
      role: "voter",
      status: "approved",
      createdAt: serverTimestamp(),
    })

    // Log the action
    await logAction(userId, "JOIN_ELECTION", election.id, election.organizationId, {
      electionToken,
      electionTitle: election.title,
    })

    return { success: true, election }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Request Election Workspace
export const requestElectionWorkspace = async (
  userId: string,
  workspaceData: {
    title: string
    description: string
    organizationId: string
    startDate: Date
    endDate: Date
  },
) => {
  try {
    // Check if organization exists, create if not
    let organizationDoc = null
    const orgQuery = query(collection(db, "organizations"), where("organizationId", "==", workspaceData.organizationId))

    const orgSnapshot = await getDocs(orgQuery)

    if (orgSnapshot.empty) {
      // Create new organization
      const orgDocRef = await addDoc(collection(db, "organizations"), {
        organizationId: workspaceData.organizationId,
        name: workspaceData.organizationId,
        description: `Organization for ${workspaceData.organizationId}`,
        status: "active",
        createdAt: serverTimestamp(),
      })
      organizationDoc = { id: orgDocRef.id }
    } else {
      organizationDoc = { id: orgSnapshot.docs[0].id }
    }

    // Generate unique election token
    const electionToken = `${workspaceData.organizationId}-${Date.now()}`

    // Create election request
    const electionDocRef = await addDoc(collection(db, "elections"), {
      title: workspaceData.title,
      description: workspaceData.description,
      organizationId: workspaceData.organizationId,
      electionToken,
      startDate: workspaceData.startDate,
      endDate: workspaceData.endDate,
      status: "pending",
      createdBy: userId,
      approval: "pending",
      createdAt: serverTimestamp(),
      positions: [],
      candidates: [],
    })

    // Create pending admin role
    await addDoc(collection(db, "roles"), {
      userId,
      electionId: electionDocRef.id,
      electionToken,
      organizationId: workspaceData.organizationId,
      role: "admin",
      status: "pending",
      createdAt: serverTimestamp(),
    })

    // Log the action
    await logAction(userId, "REQUEST_WORKSPACE", electionDocRef.id, workspaceData.organizationId, {
      electionTitle: workspaceData.title,
      electionToken,
    })

    return { success: true, electionId: electionDocRef.id, electionToken }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Check Organization Exists
export const checkOrganizationExists = async (searchTerm: string): Promise<string[]> => {
  try {
    const orgQuery = query(
      collection(db, "organizations"),
      where("organizationId", ">=", searchTerm),
      where("organizationId", "<=", searchTerm + "\uf8ff"),
    )

    const orgSnapshot = await getDocs(orgQuery)
    const organizations = orgSnapshot.docs.map((doc) => doc.data().organizationId as string)

    return organizations.slice(0, 5) // Return max 5 suggestions
  } catch (error) {
    console.error("Error checking organizations:", error)
    return []
  }
}

// Get User Roles
export const getUserRoles = async (userId: string) => {
  try {
    const rolesQuery = query(collection(db, "roles"), where("userId", "==", userId), orderBy("createdAt", "desc"))
    const rolesSnapshot = await getDocs(rolesQuery)
    const roles = rolesSnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      } as Role
    })
    return { roles, error: null }
  } catch (error: any) {
    return { roles: [], error: error.message }
  }
}

// Get Election by Token
export const getElectionByToken = async (electionToken: string) => {
  try {
    //remove percentage % if the token contains it, it may confuse the system since a space is also a %
    const electionQuery = query(collection(db, "elections"), where("electionToken", "==", electionToken))

    const electionSnapshot = await getDocs(electionQuery)
    console.log(electionSnapshot.empty);
    if (electionSnapshot.empty) {
      return { election: null, error: "Election not found" }
    }

    const electionDoc = electionSnapshot.docs[0]
    console.log(electionDoc.data())
    const election = {
      id: electionDoc.id,
      ...electionDoc.data(),
      startDate:electionDoc?.data()?.startDate?.toDate(),
      endDate:electionDoc?.data()?.endDate?.toDate()
    } as Election

    console.log(election)
    return { election, error: null }
  } catch (error: any) {
    console.log(error);
    return { election: null, error: error.message }
  }
}

// Approve Election Request (Super Admin function)
export const approveElectionRequest = async (electionId: string, superAdminId: string) => {
  try {
    // Update election status
    await updateDoc(doc(db, "elections", electionId), {
      approval: "approved",
      approvedBy: superAdminId,
      approvedAt: serverTimestamp(),
    })

    // Update admin role status
    const roleQuery = query(
      collection(db, "roles"),
      where("electionId", "==", electionId),
      where("role", "==", "admin"),
      where("status", "==", "pending"),
    )

    const roleSnapshot = await getDocs(roleQuery)

    for (const roleDoc of roleSnapshot.docs) {
      await updateDoc(doc(db, "roles", roleDoc.id), {
        status: "approved",
        approvedBy: superAdminId,
        approvedAt: serverTimestamp(),
      })

      // Send notification to the admin
      await sendNotification(roleDoc.data().userId, "ELECTION_APPROVED", {
        electionTitle: "Your election request has been approved",
        electionToken: roleDoc.data().electionToken,
      })
    }

    // Log the action
    await logAction(superAdminId, "APPROVE_ELECTION", electionId, undefined, {
      electionId,
    })

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Approve Elections Results
export const approveElectionResults = async (electionId: string, adminId: string) => {
  try {
    // Update election to make results visible
    await updateDoc(doc(db, "elections", electionId), {
      resultsVisible: true,
      approvedBy: adminId,
      approvedAt: serverTimestamp(),
    })

    // Log the action
    await logAction(adminId, "APPROVE_RESULTS", electionId, undefined, {
      electionId,
    })

    return { error: null, success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const disapproveElectionResults = async (electionId: string, adminId: string) => {
  try {
    // Update election to hide results
    await updateDoc(doc(db, "elections", electionId), {
      resultsVisible: false,
      approvedBy: adminId,
      approvedAt: serverTimestamp(),
    })

    // Log the action
    await logAction(adminId, "DISAPPROVE_RESULTS", electionId, undefined, {
      electionId,
    })

    return { error: null, success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Get Pending Election Requests (Super Admin function)
export const getPendingElectionRequests = async () => {
  try {
    const electionQuery = query(
      collection(db, "elections"),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc"),
    )

    const electionSnapshot = await getDocs(electionQuery)
    const elections = electionSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Election[]

    return { elections, error: null }
  } catch (error: any) {
    return { elections: [], error: error.message }
  }
}

// Reject Election Request (Super Admin function)
export const rejectElectionRequest = async (electionId: string, superAdminId: string, reason: string) => {
  try {
    // Update election status
    await updateDoc(doc(db, "elections", electionId), {
      status: "rejected",
      rejectedBy: superAdminId,
      rejectedAt: serverTimestamp(),
      rejectionReason: reason,
    })

    // Update admin role status
    const roleQuery = query(
      collection(db, "roles"),
      where("electionId", "==", electionId),
      where("role", "==", "admin"),
      where("status", "==", "pending"),
    )

    const roleSnapshot = await getDocs(roleQuery)

    for (const roleDoc of roleSnapshot.docs) {
      await updateDoc(doc(db, "roles", roleDoc.id), {
        status: "rejected",
        rejectedBy: superAdminId,
        rejectedAt: serverTimestamp(),
        rejectionReason: reason,
      })

      // Send notification to the admin
      await sendNotification(roleDoc.data().userId, "ELECTION_REJECTED", {
        electionTitle: "Your election request has been rejected",
        reason,
      })
    }

    // Log the action
    await logAction(superAdminId, "REJECT_ELECTION", electionId, undefined, {
      electionId,
      reason,
    })

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Send Notification (Email placeholder)
export const sendNotification = async (
  userId: string,
  type: "ELECTION_APPROVED" | "ELECTION_REJECTED",
  data: {
    electionTitle: string
    electionToken?: string
    reason?: string
  },
) => {
  try {
    // Store notification in database for now
    // In a real implementation, this would integrate with an email service
    await addDoc(collection(db, "notifications"), {
      userId,
      type,
      data,
      read: false,
      createdAt: serverTimestamp(),
    })

    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    console.log(`Notification sent to user ${userId}:`, { type, data })

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Get User Notifications
export const getUserNotifications = async (userId: string) => {
  try {
    const notificationQuery = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    )

    const notificationSnapshot = await getDocs(notificationQuery)
    const notifications = notificationSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return { notifications, error: null }
  } catch (error: any) {
    return { notifications: [], error: error.message }
  }
}

// Position Management
export const getElectionPositions = async (electionId: string) => {
  try {
    const positionsQuery = query(
      collection(db, "positions"),
      where("electionId", "==", electionId),
      orderBy("createdAt", "asc"),
    )

    const positionsSnapshot = await getDocs(positionsQuery)
    const positions = positionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      updatedAt: doc.data()?.updatedAt?.toDate().toISOString(),
      createdAt: doc.data()?.createdAt?.toDate().toISOString(),
    })) as Position[]

    console.log(positions)
    return { positions, error: null }
  } catch (error: any) {
    return { positions: [], error: error.message }
  }
}

export const addPosition = async (
  electionId: string,
  positionData: {
    title: string
    description: string
    maxCandidates: number
  },
) => {
  try {
    const docRef = await addDoc(collection(db, "positions"), {
      ...positionData,
      electionId,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    })

    return { success: true, positionId: docRef.id }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const updatePosition = async (positionId: string, updateData: Partial<Position>) => {
  try {
    await updateDoc(doc(db, "positions", positionId), {
      ...updateData,
      updatedAt: serverTimestamp(),
    })

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const deletePosition = async (positionId: string) => {
  try {
    // Check if there are candidates for this position
    const candidatesQuery = query(collection(db, "candidates"), where("positionId", "==", positionId))
    const candidatesSnapshot = await getDocs(candidatesQuery)

    if (!candidatesSnapshot.empty) {
      return { success: false, error: "Cannot delete position with existing candidates" }
    }

    await updateDoc(doc(db, "positions", positionId), {
      status: "deleted",
      deletedAt: serverTimestamp(),
    })

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Candidate Management
export const getElectionCandidates = async (electionId: string) => {
  try {
    const candidatesQuery = query(
      collection(db, "candidates"),
      where("electionId", "==", electionId),
      where("status", "!=", "deleted"),
      orderBy("status"),
      orderBy("createdAt", "asc"),
    )

    const candidatesSnapshot = await getDocs(candidatesQuery)
    const candidates = candidatesSnapshot.docs.map((doc) => ({
      id: doc.id,
      createdAt: doc.data()?.createdAt?.toDate().toISOString(),
      updatedAt: doc.data()?.updatedAt?.toDate().toISOString(),
      ...doc.data(),
    })) as Candidate[]

    return { candidates, error: null }
  } catch (error: any) {
    return { candidates: [], error: error.message }
  }
}

export const addCandidate = async (
  electionId: string,
  candidateData: Omit<Candidate, "id" | "createdAt" | "updatedAt" | "status" | "electionId">,
  imageData: File,
) => {
  try {
    // Check if position exists and has space for more candidates
    console.log(candidateData.positionId)
    const positionQuery = doc(db, "positions", candidateData.positionId)
    const positionSnapshot = await getDoc(positionQuery)

    if (!positionSnapshot.exists()) {
      return { success: false, error: "Position not found" }
    }

    const position = positionSnapshot.data() as Position

    // Count existing candidates for this position
    const existingCandidatesQuery = query(
      collection(db, "candidates"),
      where("positionId", "==", candidateData.positionId),
      where("status", "!=", "deleted"),
    )
    const existingCandidatesSnapshot = await getDocs(existingCandidatesQuery)

    if (existingCandidatesSnapshot.size >= position.maxCandidates) {
      return { success: false, error: `Maximum ${position.maxCandidates} candidates allowed for this position` }
    }

    const docRef = await addDoc(collection(db, "candidates"), {
      ...candidateData,
      electionId,
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    // Upload candidate photo if provided to supabase
    // Upload to Supabase
    if (imageData) {
      const filename = `candidate-${docRef.id}-${imageData.name}`
      const { data, error } = await supabase.storage.from("see-evote").upload(filename, imageData)

      console.log(data)
      if (error) {
        console.error(error)
        console.log(error)
        return { success: false, error: "Error Uploading Image", candidateId: docRef.id }
      }

      // Get public URL
      const { data: publicUrl } = supabase.storage.from("see-evote").getPublicUrl(data.path)

      // Save in Firebase
      await updateDoc(doc(db, "candidates", docRef.id), {
        image: publicUrl.publicUrl,
        updatedAt: serverTimestamp(),
      })
      return { success: true, error: null, candidateId: docRef.id }
    }

    return { success: true, error: null, candidateId: docRef.id }
  } catch (error: any) {
    console.log(error)
    return { success: false, error: error.message, candidateId: null }
  }
}

export const updateCandidate = async (candidateId: string, updateData: Partial<Candidate>, imageData: File) => {
  try {
    // Upload to Supabase
    if (imageData) {
      const filename = `candidate-${candidateId}-${imageData.name}`
      const { data, error } = await supabase.storage.from("see-evote").upload(filename, imageData)

      if (error) {
        console.error(error)
        return { success: false, error: "Error Uploading Image", candidateId }
      }

      // Get public URL
      const { data: publicUrl } = supabase.storage.from("see-evote").getPublicUrl(data.path)
      console.log('updateData',updateData)
      await updateDoc(doc(db, "candidates", candidateId), {
        ...updateData,
        image: publicUrl.publicUrl,
        updatedAt: serverTimestamp(),
      })
      return { error: null, success: true, candidateId }
    }

    await updateDoc(doc(db, "candidates", candidateId), {
        ...updateData,
        updatedAt: serverTimestamp(),
    })

    return { error: null, success: true, candidateId }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const deleteCandidate = async (candidateId: string) => {
  try {
    await updateDoc(doc(db, "candidates", candidateId), {
      status: "deleted",
      deletedAt: serverTimestamp(),
    })

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// MANAGEMENT

export const checkUserSuperAdminRole = async (userId: string): Promise<boolean> => {
  try {
    const rolesQuery = query(
      collection(db, "roles"),
      where("userId", "==", userId),
      where("role", "==", "superAdmin"),
      where("status", "==", "approved"),
    )

    const rolesSnapshot = await getDocs(rolesQuery)
    return !rolesSnapshot.empty
  } catch (error) {
    console.error("Error checking superAdmin role:", error)
    return false
  }
}

export const assignSuperAdminRole = async (userId: string, assignedBy?: string) => {
  try {
    // Check if user already has superAdmin role
    const existingSuperAdmin = await checkUserSuperAdminRole(userId)
    if (existingSuperAdmin) {
      return { success: false, error: "User already has superAdmin role" }
    }

    // Create superAdmin role (system-wide, not tied to specific election)
    await addDoc(collection(db, "roles"), {
      userId,
      electionId: "SYSTEM", // Special identifier for system-wide roles
      electionToken: "SYSTEM",
      organizationId: "SYSTEM",
      role: "superAdmin",
      status: "approved",
      createdAt: serverTimestamp(),
      approvedBy: assignedBy || "SYSTEM",
      approvedAt: serverTimestamp(),
    })

    // Log the action
    await logAction(assignedBy || "SYSTEM", "ASSIGN_SUPERADMIN", undefined, "SYSTEM", {
      targetUserId: userId,
    })

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const getAllElections = async () => {
  try {
    const electionsQuery = query(collection(db, "elections"), orderBy("createdAt", "desc"))

    const electionsSnapshot = await getDocs(electionsQuery)
    const elections = electionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data()?.startDate?.toDate().toISOString(),
      endDate: doc.data()?.endDate?.toDate().toISOString(),
      createdAt: doc.data()?.createdAt?.toDate().toISOString(),
    })) as Election[]

    return { elections, error: null }
  } catch (error: any) {
    return { elections: [], error: error.message }
  }
}

export const getAllUsers = async () => {
  try {
    const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"))

    const usersSnapshot = await getDocs(usersQuery)
    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate().toISOString(),
    })) as User[]

    return { users, error: null }
  } catch (error: any) {
    return { users: [], error: error.message }
  }
}

export const getAllOrganizations = async () => {
  try {
    const orgsQuery = query(collection(db, "organizations"), orderBy("createdAt", "desc"))

    const orgsSnapshot = await getDocs(orgsQuery)
    const organizations = orgsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate().toISOString(),
    })) as Organization[]

    return { organizations, error: null }
  } catch (error: any) {
    return { organizations: [], error: error.message }
  }
}

export const generateElectionVoterIDs = async (electionData: Partial<Election>, voterCount: number) => {
  try {
    // automatically generator voter IDs
    if (electionData.electionToken && electionData.endDate && electionData.organizationId && electionData.id) {
      const voterIDs = []

      for (let i = 0; i < voterCount; i++) {
        const newVoter = {
          electionId: electionData.id,
          organizationId: electionData.organizationId,
          electionToken: electionData.electionToken,
          passkey: electionData.electionToken,
          isUsed: false,
          token: nanoid(8),
          expiresAt: electionData.endDate,
          timestamp: serverTimestamp(),
        }

        const docRef = await addDoc(collection(db, "voterIDs"), newVoter)
        voterIDs.push({ id: docRef.id, ...newVoter })
      }

      return { success: true, error: null, voterIDs }
    }

    return { success: false, error: "Missing required election data" }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const getGeneratedVoterIDs = async (electionId: string) => {
  try {
    const q = query(collection(db, "voterIDs"), where("electionId", "==", electionId), orderBy("timestamp", "desc"))
    const querySnapshot = await getDocs(q)
    const voterIDs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data()?.timestamp?.toDate().toISOString(),
      expiresAt: doc.data()?.expiresAt?.toDate ? doc.data().expiresAt.toDate().toISOString() : doc.data().expiresAt,
      votedAt: doc.data()?.votedAt?.toDate().toISOString(),
    })) as VoterID[]
    console.log('voterIDs', voterIDs);
    return { voterIDs, error: null }
  } catch (error: any) {
    return { voterIDs: [], error: error.message }
  }
}

// Profile Management
export const updateUserProfile = async (userId: string, profileData: Partial<User>) => {
  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp(),
    })

    // Log the action
    await logAction(userId, "UPDATE_PROFILE", undefined, profileData.organizationId, {
      updatedFields: Object.keys(profileData),
    })

    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Notification Management
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    await updateDoc(doc(db, "notifications", notificationId), {
      isRead: true,
      readAt: serverTimestamp(),
    })
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: "info" | "success" | "warning" | "error" = "info",
  electionId?: string,
  electionToken?: string,
) => {
  try {
    await addDoc(collection(db, "notifications"), {
      userId,
      title,
      message,
      type,
      isRead: false,
      electionId,
      electionToken,
      createdAt: serverTimestamp(),
    })
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Global Search Functionality
export const globalSearch = async (searchQuery: string, userId: string) => {
  try {
    const results: any[] = []
    const searchTerm = searchQuery.toLowerCase()

    // Search Elections
    const electionsQuery = query(collection(db, "elections"), where("approval", "==", "approved"))
    const electionsSnapshot = await getDocs(electionsQuery)

    electionsSnapshot.docs.forEach((doc) => {
      const election = { id: doc.id, ...doc.data() } as Election
      if (
        election.title.toLowerCase().includes(searchTerm) ||
        election.description.toLowerCase().includes(searchTerm) ||
        election.electionToken.toLowerCase().includes(searchTerm)
      ) {
        results.push({
          id: election.id,
          type: "election",
          title: election.title,
          subtitle: `Token: ${election.electionToken}`,
          description: election.description,
          electionToken: election.electionToken,
          metadata: { status: election.status },
        })
      }
    })

    // Search Candidates
    const candidatesQuery = query(collection(db, "candidates"), where("status", "==", "active"))
    const candidatesSnapshot = await getDocs(candidatesQuery)

    candidatesSnapshot.docs.forEach((doc) => {
      const candidate = { id: doc.id, ...doc.data() } as Candidate
      if (
        candidate.name.toLowerCase().includes(searchTerm) ||
        candidate.description?.toLowerCase().includes(searchTerm) ||
        candidate.department?.toLowerCase().includes(searchTerm)
      ) {
        results.push({
          id: candidate.id,
          type: "candidate",
          title: candidate.name,
          subtitle: candidate.department || "Candidate",
          description: candidate.description,
          electionToken: candidate.electionId, // This would need to be resolved to token
          metadata: { age: candidate.age },
        })
      }
    })

    // Search Positions
    const positionsQuery = query(collection(db, "positions"))
    const positionsSnapshot = await getDocs(positionsQuery)

    positionsSnapshot.docs.forEach((doc) => {
      const position = { id: doc.id, ...doc.data() } as Position
      if (
        position.title.toLowerCase().includes(searchTerm) ||
        position.description?.toLowerCase().includes(searchTerm)
      ) {
        results.push({
          id: position.id,
          type: "position",
          title: position.title,
          subtitle: "Election Position",
          description: position.description,
          electionToken: position.electionId, // This would need to be resolved to token
          metadata: { maxCandidates: position.maxCandidates },
        })
      }
    })

    // Search Users (limited to same organization for privacy)
    const usersQuery = query(collection(db, "users"))
    const usersSnapshot = await getDocs(usersQuery)

    usersSnapshot.docs.forEach((doc) => {
      const user = { id: doc.id, ...doc.data() } as User
      if (user.name.toLowerCase().includes(searchTerm) || user.email.toLowerCase().includes(searchTerm)) {
        results.push({
          id: user.id,
          type: "user",
          title: user.name,
          subtitle: user.email,
          description: `${user.address?.city}, ${user.address?.region}`,
          metadata: { isActive: user.isActive },
        })
      }
    })

    // Sort results by relevance (exact matches first, then partial matches)
    results.sort((a, b) => {
      const aExact = a.title.toLowerCase() === searchTerm
      const bExact = b.title.toLowerCase() === searchTerm
      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1
      return a.title.localeCompare(b.title)
    })

    return { results: results.slice(0, 20), error: null } // Limit to 20 results
  } catch (error: any) {
    return { results: [], error: error.message }
  }
}
