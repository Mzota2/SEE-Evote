"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  getElectionByToken,
  getUserRoles,
  getElectionPositions,
  getElectionCandidates,
  addCandidate,
  updateCandidate,
  deleteCandidate,
} from "@/lib/database"
import type { Election, Role, Position, Candidate } from "@/lib/types"
import { Plus, Edit, Trash2, Save, X, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface CandidatesPageProps {
  params: {
    electionToken: string
  }
}

export default function CandidatesPage({ params }: CandidatesPageProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [election, setElection] = useState<Election | null>(null)
  const [userRole, setUserRole] = useState<Role | null>(null)
  const [positions, setPositions] = useState<Position[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    positionId: "",
    platform: ""
  })

  let [imagePreview, setImagePreview] = useState<string | null>(null);
  let [imageData, setImageData] = useState<File | null>(null);

  useEffect(() => {
    if (imageData) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(imageData as Blob);
    } else {
      setImagePreview(null);
    }
  }, [imageData]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        const { election: fetchedElection } = await getElectionByToken(params.electionToken)
        const { roles } = await getUserRoles(user.id)
        const relevantRole = roles.find(
          (role) => role.electionToken === params.electionToken && role.status === "approved" && role.role === "admin",
        )

        if (!fetchedElection || !relevantRole) {
          router.push("/dashboard")
          return
        }

        setElection(fetchedElection)
        setUserRole(relevantRole)

        const { positions: fetchedPositions } = await getElectionPositions(fetchedElection.id)
        const { candidates: fetchedCandidates } = await getElectionCandidates(fetchedElection.id)

        setPositions(fetchedPositions)
        setCandidates(fetchedCandidates)
        setLoadingData(false)
      } catch (err) {
        router.push("/dashboard")
      }
    }

    fetchData()
  }, [user, params.electionToken, router])

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!election) return
      const result = await addCandidate(election.id, formData, imageData as File );
      console.log(result.error)
      if (result.success) {
        toast({
          title: "Candidate Added",
          description: "The candidate has been successfully added.",
        })
        const { candidates: updatedCandidates } = await getElectionCandidates(election.id)
        setCandidates(updatedCandidates)
        setShowAddForm(false)
        setFormData({ name: "", description: "", positionId: "", platform: "" })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add candidate.",
          variant: "destructive",
        })
      }

  } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add candidate.",
        variant: "destructive",
      });
      console.log(error);
  }

  }

  const handleUpdateCandidate = async (candidateId: string, data: Partial<Candidate>, imageData:File) => {
    const result = await updateCandidate(candidateId, data, imageData)
    if (result.success) {
      toast({
        title: "Candidate Updated",
        description: "The candidate has been successfully updated.",
      })
      const { candidates: updatedCandidates } = await getElectionCandidates(election!.id)
      setCandidates(updatedCandidates)
      setEditingId(null)
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update candidate.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCandidate = async (candidateId: string) => {
    if (!confirm("Are you sure you want to delete this candidate? This action cannot be undone.")) return

    const result = await deleteCandidate(candidateId)
    if (result.success) {
      toast({
        title: "Candidate Deleted",
        description: "The candidate has been successfully deleted.",
      })
      setCandidates(candidates.filter((c) => c.id !== candidateId))
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete candidate.",
        variant: "destructive",
      })
    }
  }

  const getPositionTitle = (positionId: string) => {
    const position = positions.find((p) => p.id === positionId)
    return position?.title || "Unknown Position"
  }

  const getCandidatesByPosition = (positionId: string) => {
    return candidates.filter((c) => c.positionId === positionId)
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ivote-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading candidates...</p>
        </div>
      </div>
    )
  }

  if (!election || !userRole) {
    return null
  }

  return (
    <DashboardLayout electionToken={params.electionToken} userRole={userRole.role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manage Candidates</h1>
            <p className="text-gray-600">Add and manage candidates for {election.title}</p>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-ivote-primary hover:bg-ivote-primary/90"
            disabled={positions.length === 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Candidate
          </Button>
        </div>

        {positions.length === 0 && (
          <Card className="p-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium text-yellow-800">No Positions Available</h3>
                <p className="text-sm text-yellow-700">You need to create positions before adding candidates.</p>
              </div>
            </div>
          </Card>
        )}

        {/* Add Candidate Form */}
        {showAddForm && (
          <Card className="p-6">
            <form onSubmit={handleAddCandidate} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Add New Candidate</h3>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
               <div className="space-y-2">
                  <Label htmlFor="image">Candidate Photo</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-[200px] h-[200px] rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                      {imagePreview ? (
                        <Image
                          height={200}
                          width={200}
                          src={imagePreview}
                          alt="Preview"
                          className="object-cover w-full h-full !rounded-full"
                        />
                      ) : (
                        <span className="text-gray-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-8 h-8"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2zm16 0l-4.586 4.586a2 2 0 01-2.828 0L7 7"
                            />
                          </svg>
                        </span>
                      )}
                    </div>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageData(() => (e.target.files ? e.target.files[0] : null))}
                      className="w-fit"
                    />
                  </div>
                </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Candidate Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Full name of the candidate"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Candidate Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Full name of the candidate"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Select
                    value={formData.positionId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, positionId: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((position) => (
                        <SelectItem key={position.id} value={position.id}>
                          {position.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the candidate"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform">Platform/Agenda</Label>
                <Textarea
                  id="platform"
                  value={formData.platform}
                  onChange={(e) => setFormData((prev) => ({ ...prev, platform: e.target.value }))}
                  placeholder="Candidate's platform, goals, and agenda"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-ivote-primary hover:bg-ivote-primary/90">
                  <Save className="w-4 h-4 mr-2" />
                  Add Candidate
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Candidates by Position */}
        <div className="space-y-6">
          {positions.map((position) => {
            const positionCandidates = getCandidatesByPosition(position.id)
            return (
              <div key={position.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">{position.title}</h2>
                  <Badge variant="secondary">
                    {positionCandidates.length} / {position.maxCandidates} candidates
                  </Badge>
                </div>

                {positionCandidates.length === 0 ? (
                  <Card className="p-6 text-center border-dashed">
                    <div className="space-y-2">
                      <User className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="text-gray-600">No candidates for this position yet</p>
                    </div>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4">
                    {positionCandidates.map((candidate) => (
                      <Card key={candidate.id} className="p-4">
                        {editingId === candidate.id ? (
                          <EditCandidateForm
                            candidate={candidate}
                            positions={positions}
                            onSave={(data, image) => handleUpdateCandidate(candidate.id, data, image)}
                            onCancel={() => setEditingId(null)}
                          />
                        ) : (
                          <div className="space-y-3">
                             {/* photo */}
                              <div>
                                <Image
                                  width={500}
                                  height={500}
                                  src={candidate.image?candidate.image:"/placeholder.svg"}
                                  alt={candidate.name}
                                  className="w-full h-[400px] object-cover"
                                />
                              </div>
                            <div className="flex items-start justify-between">
                             
                              <div>
                                <h3 className="font-semibold text-gray-800">{candidate.name}</h3>
                                {candidate.description && (
                                  <p className="text-sm text-gray-600">{candidate.description}</p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button variant="outline" size="sm" onClick={() => setEditingId(candidate.id)}>
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteCandidate(candidate.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            {candidate.platform && (
                              <div>
                                <p className="text-xs font-medium text-gray-700 mb-1">Platform:</p>
                                <p className="text-sm text-gray-600">{candidate.platform}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}

function EditCandidateForm({
  candidate,
  positions,
  onSave,
  onCancel
}: {
  candidate: Candidate
  positions: Position[]
  onSave: (data: Partial<Candidate>, imageData:File) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: candidate.name,
    description: candidate.description || "",
    positionId: candidate.positionId,
    platform: candidate.platform || "",
  })

  const [imageData, setImageData] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData, imageData as File)
  }

   useEffect(() => {
    if (imageData) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(imageData as Blob);
    } 
    else if(candidate.image) {
      setImagePreview(candidate.image)
    }
    else {
      setImagePreview(null);
    }
  }, [imageData, candidate.image]);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
       <div className="space-y-2">
                  <Label htmlFor="image">Candidate Photo</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-[200px] h-[200px] rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                      {imagePreview ? (
                        <Image
                          height={200}
                          width={200}
                          src={imagePreview}
                          alt="Preview"
                          className="object-cover w-full h-full !rounded-full"
                        />
                      ) : (
                        <span className="text-gray-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-8 h-8"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2zm16 0l-4.586 4.586a2 2 0 01-2.828 0L7 7"
                            />
                          </svg>
                        </span>
                      )}
                    </div>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageData(() => (e.target.files ? e.target.files[0] : null))}
                      className="w-fit"
                    />
                  </div>
                </div>

      <div className="space-y-2">
        <Label htmlFor="edit-name">Name</Label>
        <Input
          id="edit-name"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-position">Position</Label>
        <Select
          value={formData.positionId}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, positionId: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {positions.map((position) => (
              <SelectItem key={position.id} value={position.id}>
                {position.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-description">Description</Label>
        <Textarea
          id="edit-description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-platform">Platform</Label>
        <Textarea
          id="edit-platform"
          value={formData.platform}
          onChange={(e) => setFormData((prev) => ({ ...prev, platform: e.target.value }))}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm" className="bg-ivote-primary hover:bg-ivote-primary/90">
          <Save className="w-3 h-3 mr-1" />
          Save
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
