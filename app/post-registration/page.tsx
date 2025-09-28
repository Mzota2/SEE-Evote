"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { joinElectionByToken, requestElectionWorkspace, checkOrganizationExists } from "@/lib/database"
import { useAuth } from "@/hooks/use-auth"
import { ArrowRight, Vote, Settings } from "lucide-react"
import Logo from "@/components/Logo/Logo"

export default function PostRegistrationPage() {
  const [selectedOption, setSelectedOption] = useState<"join" | "create" | null>(null)
  const [loading, setLoading] = useState(false)
  const [organizationSuggestions, setOrganizationSuggestions] = useState<string[]>([])
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  // Join Election Form State
  const [joinForm, setJoinForm] = useState({
    electionToken: "",
  })

  // Create Workspace Form State
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    organizationId: "",
    totalVoters: "",
    startDate: "",
    endDate: "",
  })

  const handleJoinElection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const result = await joinElectionByToken(user.id, joinForm.electionToken)
      if (result.success) {
        toast({
          title: "Successfully Joined Election",
          description: "You can now participate in the election.",
        })
        router.push(`/dashboard/${joinForm.electionToken}`)
      } else {
        toast({
          title: "Failed to Join Election",
          description: result.error || "Invalid election token or election not found.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const result = await requestElectionWorkspace(user.id, {
        title: createForm.title,
        description: createForm.description,
        organizationId: createForm.organizationId.toUpperCase(),
        startDate: new Date(createForm.startDate),
        endDate: new Date(createForm.endDate),
      })

      if (result.success) {
        toast({
          title: "Workspace Request Submitted",
          description: "Your request has been submitted for admin approval. You will be notified via email.",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Failed to Submit Request",
          description: result.error || "An error occurred while submitting your request.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const handleOrganizationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    setCreateForm((prev) => ({ ...prev, organizationId: value }))

    if (value.length >= 2) {
      try {
        const suggestions = await checkOrganizationExists(value)
        setOrganizationSuggestions(suggestions)
      } catch (error) {
        console.error("Error checking organization:", error)
      }
    } else {
      setOrganizationSuggestions([])
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to continue</p>
          <Link href="/login">
            <Button className="bg-ivote-primary hover:bg-ivote-primary/90">Go to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Logo/>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to SEE-Evote!</h1>
          <p className="text-gray-600">Choose how you'd like to get started</p>
        </div>

        {!selectedOption && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Join Election Option */}
            <Card
              className="p-8 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-ivote-primary"
              onClick={() => setSelectedOption("join")}
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-ivote-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Vote className="w-8 h-8 text-ivote-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Join an Election</h3>
                <p className="text-gray-600">
                  Have an election token? Join an existing election as a voter and participate in the democratic
                  process.
                </p>
                <div className="flex items-center justify-center text-ivote-primary font-medium">
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </Card>

            {/* Create Workspace Option */}
            <Card
              className="p-8 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-ivote-secondary"
              onClick={() => setSelectedOption("create")}
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-ivote-secondary/10 rounded-full flex items-center justify-center mx-auto">
                  <Settings className="w-8 h-8 text-ivote-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Create Election Workspace</h3>
                <p className="text-gray-600">
                  Request to create and manage your own election workspace for your organization.
                </p>
                <div className="flex items-center justify-center text-ivote-secondary font-medium">
                  <span>Request Access</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Join Election Form */}
        {selectedOption === "join" && (
          <Card className="p-8 max-w-2xl mx-auto">
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-ivote-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Vote className="w-8 h-8 text-ivote-primary" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Join an Election</h2>
                <p className="text-gray-600">Enter your election token to join as a voter</p>
              </div>

              <form onSubmit={handleJoinElection} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="electionToken">Election Token</Label>
                  <Input
                    id="electionToken"
                    value={joinForm.electionToken}
                    onChange={(e) => setJoinForm((prev) => ({ ...prev, electionToken: e.target.value }))}
                    placeholder="Enter your election token"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setSelectedOption(null)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-ivote-primary hover:bg-ivote-primary/90"
                  >
                    {loading ? "Joining..." : "Join Election"}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        )}

        {/* Create Workspace Form */}
        {selectedOption === "create" && (
          <Card className="p-8 max-w-2xl mx-auto">
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-ivote-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-ivote-secondary" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Request Election Workspace</h2>
                <p className="text-gray-600">Submit a request to create and manage your own election</p>
              </div>

              <form onSubmit={handleCreateWorkspace} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Election Title</Label>
                  <Input
                    id="title"
                    value={createForm.title}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Student Council Elections 2024"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={createForm.description}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the purpose and scope of this election"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizationId">Organization ID</Label>
                  <Input
                    id="organizationId"
                    value={createForm.organizationId}
                    onChange={handleOrganizationChange}
                    placeholder="Enter organization name (will be converted to uppercase)"
                    required
                  />
                  {organizationSuggestions.length > 0 && (
                    <div className="bg-gray-50 border rounded-md p-2">
                      <p className="text-sm text-gray-600 mb-2">Existing organizations:</p>
                      <div className="flex flex-wrap gap-2">
                        {organizationSuggestions.map((org) => (
                          <Button
                            key={org}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setCreateForm((prev) => ({ ...prev, organizationId: org }))}
                          >
                            {org}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={createForm.startDate}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, startDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={createForm.endDate}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, endDate: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="totalVoters">Expected Number of Voters</Label>
                    <Input
                      id="totalVoters"
                      type="number"
                      min={1}
                      value={createForm.totalVoters}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, totalVoters:( e.target.value)}))}
                      required
                    />
                  </div>

                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setSelectedOption(null)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-ivote-secondary hover:bg-ivote-secondary/90"
                  >
                    {loading ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
