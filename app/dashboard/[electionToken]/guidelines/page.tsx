"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { getUserRoles } from "@/lib/database"
import type { Role } from "@/lib/types"

interface ElectionDashboardPageProps {
  params: {
    electionToken: string
  }
}
export default function GuidelinesPage({ params }: ElectionDashboardPageProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [userRole, setUserRole] = useState<Role | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return
      try {
        // Fetch user roles to verify access
        const { roles } = await getUserRoles(user.id)
        const relevantRole = roles.find(
          (role) => role.electionToken === params.electionToken && role.status === "approved",
        )

        if (!relevantRole) {
          setError("You don't have access to this election")
          setLoadingData(false)
          return
        }

        setUserRole(relevantRole)
        setLoadingData(false)
      } catch (err) {
        setError("Failed to load election data")
        setLoadingData(false)
      }
    }

    fetchUserRole()
  }, [user, params.electionToken])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ivote-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const guidelines = [
    "Before voting, take the time to research the candidates and issues on the ballot.",
    "Make sure you are eligible to vote in the election.",
    "Make sure you understand the voting procedure for the online voting system.",
    "Read the instructions carefully before voting.",
    "Make sure you understand the candidates and their positions on the issues.",
    "Choose your candidate carefully.",
    "If you are unsure of how to vote, ask a friend or relative for help.",
    "Double check your choices before submitting your votes.",
    "Make sure you have a secure connection when voting.",
    "Keep your vote private. Do not share your vote with anyone.",
    "Make sure you understand the deadlines for the election.",
    "Follow the voting guidelines set by your local election office.",
    "Report any problems or concerns you may have about the voting process.",
    "Thank you for participating in democracy!",
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">VOTERS GUIDELINE</h1>
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">{user.name}</p>
                <p className="text-sm text-gray-600 capitalize">{userRole?.role}</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Guidelines List */}
            <div className="space-y-4">
              {guidelines.map((guideline, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-ivote-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{guideline}</p>
                </div>
              ))}
            </div>

            {/* Illustration */}
            <div className="flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-48 h-48 bg-gradient-to-br from-ivote-primary to-ivote-secondary rounded-lg flex items-center justify-center mx-auto">
                  <div className="text-white text-6xl">🗳️</div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-800">For help information</h3>
                  <p className="text-gray-600">Please contact: see-evote@email.com</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
