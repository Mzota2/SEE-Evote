export interface User {
  id: string
  email: string
  name: string
  birthday: Date
  contactNumber: string
  address?: {
    region?: string
    street?: string
    city?: string
  }
  createdAt: Date
  profileImage?: string
  isActive: boolean
  agreeToTerms:boolean
}

export interface Role {
  id: string
  userId: string
  electionId: string
  electionToken: string
  organizationId: string
  role: "superAdmin" | "admin" | "voter"
  status: "pending" | "approved" | "rejected"
  createdAt: Date
  approvedBy?: string
  approvedAt?: Date
}

export interface Election {
  id: string
  title: string
  description: string
  organizationId: string
  electionToken: string
  startTime: Date
  endTime: Date
  startDate:Date
  endDate:Date
  createdBy: string
  status: "pending" | "ongoing" | "closed"
  approval: 'pending' | 'approved' | 'rejected',
  resultsVisible:boolean
  totalVoters?:number
  createdAt: Date
  approvedBy?: string
  approvedAt?: Date
  
}

export interface Position {
  id: string
  electionId: string
  title: string
  description?: string
  maxVotes: number
  maxCandidates: number
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface Candidate {
  id: string
  electionId: string
  positionId: string
  description: string
  status: 'active' | 'inactive' | 'pending'
  name: string
  department?: string
  age?: number
  image?: string
  platform?: string
  createdAt: Date
  updatedAt: Date
}

export interface Vote {
  id: string
  voterId: string
  electionId: string
  electionToken: string
  positionId: string
  candidateId: string
  timestamp: Date
  organizationId: string
}

export interface VoterID{
  id:string
  token:string
  isUsed:boolean
  votedAt:Date
  electionId:string
  organizationId:string
  electionToken:string
  passkey:string
  expiresAt:Date
  timestamp:Date
}

export interface Organization {
  id: string
  name: string
  displayName: string
  createdBy: string
  isActive: boolean
  createdAt: Date
  status: "pending" | "active" | "suspended"
}

export interface ElectionRequest {
  id: string
  title: string
  description: string
  organizationId: string
  organizationName: string
  requestedBy: string
  status: "pending" | "approved" | "rejected"
  createdAt: Date
  reviewedBy?: string
  reviewedAt?: Date
  reviewNotes?: string
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  electionId?: string
  electionToken?: string
  organizationId: string
  timestamp: Date
  details?: Record<string, any>
  ipAddress?: string
}


export interface AuditLogWithUser{
  id: string
  userId: string
  name:string
  action: string
  electionId?: string
  electionToken?: string
  organizationId: string
  timestamp: Date
  details?: Record<string, any>
  ipAddress?: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  isRead: boolean
  electionId?: string
  electionToken?: string
  createdAt: Date
}

export interface VotingStats {
  electionId: string
  electionToken: string
  totalRegisteredVoters: number
  totalVotes: number
  totalCandidates: number
  totalPositions: number
  voterTurnout: number
  lastUpdated: Date
}

export interface ElectionResults {
  electionId: string
  electionToken: string
  positionId: string
  positionTitle: string
  candidates: {
    candidateId: string
    candidateName: string
    voteCount: number
    percentage: number
  }[]
  totalVotes: number
  generatedAt: Date
}

export interface JoinElectionData {
  electionToken: string
  role: "voter"
}

export interface CreateElectionData {
  title: string
  description: string
  organizationId: string
  organizationName: string
  startTime: Date
  endTime: Date
}
