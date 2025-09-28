"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Vote, Candidate } from "@/lib/types"

interface RealTimeResults {
  [positionId: string]: {
    [candidateId: string]: {
      candidate: Candidate
      votes: number
      percentage: number
    }
  }
}

interface VotingStats {
  totalVotes: number
  totalRegisteredVoters: number
  turnoutPercentage: number
  lastUpdated: Date
}

export const useRealTimeResults = (electionId: string) => {
  const [results, setResults] = useState<RealTimeResults>({})
  const [stats, setStats] = useState<VotingStats>({
    totalVotes: 0,
    totalRegisteredVoters: 0,
    turnoutPercentage: 0,
    lastUpdated: new Date(),
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!electionId) return

    const votesQuery = query(collection(db, "votes"), where("electionId", "==", electionId))

    // Set up real-time listener for votes
    const unsubscribe = onSnapshot(
      votesQuery,
      async (snapshot) => {
        try {
          const votes = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Vote[]

          // Get election details to fetch candidates
          const electionDoc = await getDoc(doc(db, "elections", electionId))
          if (!electionDoc.exists()) {
            throw new Error("Election not found")
          }

          const electionData = electionDoc.data()
          const positions = electionData.positions || []

          // Process votes and calculate results
          const processedResults: RealTimeResults = {}

          positions.forEach((position: any) => {
            processedResults[position.id] = {}

            // Initialize candidates with 0 votes
            position.candidates?.forEach((candidate: Candidate) => {
              processedResults[position.id][candidate.id] = {
                candidate,
                votes: 0,
                percentage: 0,
              }
            })
          })

          // Count votes
          votes.forEach((vote) => {
            if (processedResults[vote.positionId] && processedResults[vote.positionId][vote.candidateId]) {
              processedResults[vote.positionId][vote.candidateId].votes++
            }
          })

          // Calculate percentages
          Object.keys(processedResults).forEach((positionId) => {
            const positionVotes = Object.values(processedResults[positionId])
            const totalPositionVotes = positionVotes.reduce((sum, candidate) => sum + candidate.votes, 0)

            Object.keys(processedResults[positionId]).forEach((candidateId) => {
              if (totalPositionVotes > 0) {
                processedResults[positionId][candidateId].percentage =
                  (processedResults[positionId][candidateId].votes / totalPositionVotes) * 100
              }
            })
          })

          setResults(processedResults)

          // Update stats
          setStats({
            totalVotes: votes.length,
            totalRegisteredVoters: 400, // This would come from user count in real implementation
            turnoutPercentage: (votes.length / 400) * 100,
            lastUpdated: new Date(),
          })

          setLoading(false)
        } catch (err: any) {
          setError(err.message)
          setLoading(false)
        }
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [electionId])

  return { results, stats, loading, error }
}
