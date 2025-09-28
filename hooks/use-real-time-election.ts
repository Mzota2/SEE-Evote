"use client"

import { useState, useEffect } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Election } from "@/lib/types"

export const useRealTimeElection = (electionId: string) => {
  const [election, setElection] = useState<Election | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!electionId) return

    const unsubscribe = onSnapshot(
      doc(db, "elections", electionId),
      (doc) => {
        if (doc.exists()) {
          setElection({
            id: doc.id,
            ...doc.data(),
          } as Election)
        } else {
          setError("Election not found")
        }
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [electionId])

  return { election, loading, error }
}
