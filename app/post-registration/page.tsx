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
import { uploadImageToCloudinary } from "@/lib/cloudinary"
import { DEFAULT_ORG_DOMAIN } from "@/lib/org-email"
import { toFriendlyMessage } from "@/lib/user-messages"
import { Switch } from "@/components/ui/switch"

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
    orgMembersOnly: false,
    organizationDomain: DEFAULT_ORG_DOMAIN,
  })
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null)

  const handleJoinElection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const result = await joinElectionByToken(user.id, joinForm.electionToken)
      if (result.success) {
        toast({
          title: "You have joined",
          description: "The organiser still needs to approve your voting rights before you can vote.",
        })
        router.push(`/dashboard/${joinForm.electionToken}`)
      } else {
        toast({
          title: "Could not join",
          description: toFriendlyMessage(result.error, "Check the election code and try again."),
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Could not join",
        description: toFriendlyMessage(error, "Please try again."),
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
      let backgroundImage = ""
      if (backgroundFile) {
        backgroundImage = await uploadImageToCloudinary(backgroundFile, "see-evote/elections")
      }

      const result = await requestElectionWorkspace(user.id, {
        title: createForm.title,
        description: createForm.description,
        organizationId: createForm.organizationId.toUpperCase(),
        totalVoters: createForm.totalVoters,
        startDate: new Date(createForm.startDate),
        endDate: new Date(createForm.endDate),
        orgMembersOnly: createForm.orgMembersOnly,
        organizationDomain: createForm.organizationDomain.trim().toLowerCase(),
        backgroundImage,
      })

      if (result.success) {
        toast({
          title: "Election submitted",
          description: "A reviewer will approve it before voters can join.",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Could not submit",
          description: toFriendlyMessage(result.error, "Please check the details and try again."),
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Could not submit",
        description: toFriendlyMessage(error, "Please try again."),
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
          {user.voterId && (
            <p className="mt-3 inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
              Your voter ID is <span className="ml-2 font-mono text-ivote-primary">{user.voterId}</span>
            </p>
          )}
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
                  Have an election code? Join an existing election and cast your vote.
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
                <h3 className="text-xl font-semibold text-gray-800">Create an election</h3>
                <p className="text-gray-600">
                  Set up an election for your organisation. A reviewer will approve it before people can join.
                </p>
                <div className="flex items-center justify-center text-ivote-secondary font-medium">
                  <span>Get started</span>
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
                <p className="text-gray-600">Enter the election code from your organiser</p>
              </div>

              <form onSubmit={handleJoinElection} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="electionToken">Election code</Label>
                  <Input
                    id="electionToken"
                    value={joinForm.electionToken}
                    onChange={(e) => setJoinForm((prev) => ({ ...prev, electionToken: e.target.value }))}
                    placeholder="Paste the election code"
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

                <div className="space-y-2">
                  <Label htmlFor="background">Election background picture</Label>
                  <Input
                    id="background"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBackgroundFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-gray-500">A wide photo looks best on the election card. You can skip this.</p>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label>Organisation members only</Label>
                    <p className="text-sm text-gray-600">Require an organisation email such as bece22-name@{createForm.organizationDomain}</p>
                  </div>
                  <Switch
                    checked={createForm.orgMembersOnly}
                    onCheckedChange={(checked) => setCreateForm((prev) => ({ ...prev, orgMembersOnly: checked }))}
                  />
                </div>

                {createForm.orgMembersOnly && (
                  <div className="space-y-2">
                    <Label htmlFor="organizationDomain">Organisation email domain</Label>
                    <Input
                      id="organizationDomain"
                      value={createForm.organizationDomain}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, organizationDomain: e.target.value }))}
                      placeholder="mubas.ac.mw"
                    />
                  </div>
                )}

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
