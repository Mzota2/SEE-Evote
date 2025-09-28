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
import { Badge } from "@/components/ui/badge"
import {
  getElectionByToken,
  getUserRoles,
  getElectionPositions,
  addPosition,
  updatePosition,
  deletePosition,
} from "@/lib/database"
import type { Election, Role, Position } from "@/lib/types"
import { Plus, Edit, Trash2, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PositionsPageProps {
  params: {
    electionToken: string
  }
}

export default function PositionsPage({ params }: PositionsPageProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [election, setElection] = useState<Election | null>(null)
  const [userRole, setUserRole] = useState<Role | null>(null)
  const [positions, setPositions] = useState<Position[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    maxCandidates: 1,
  })

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
        setPositions(fetchedPositions)
        setLoadingData(false)
      } catch (err) {
        router.push("/dashboard")
      }
    }

    fetchData()
  }, [user, params.electionToken, router])

  const handleAddPosition = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!election) return

    const result = await addPosition(election.id, formData)
    if (result.success) {
      toast({
        title: "Position Added",
        description: "The position has been successfully added.",
      })
      const { positions: updatedPositions } = await getElectionPositions(election.id)
      setPositions(updatedPositions)
      setShowAddForm(false)
      setFormData({ title: "", description: "", maxCandidates: 1 })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to add position.",
        variant: "destructive",
      })
    }
  }

  const handleUpdatePosition = async (positionId: string, data: Partial<Position>) => {
    const result = await updatePosition(positionId, data)
    if (result.success) {
      toast({
        title: "Position Updated",
        description: "The position has been successfully updated.",
      })
      const { positions: updatedPositions } = await getElectionPositions(election!.id)
      setPositions(updatedPositions)
      setEditingId(null)
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update position.",
        variant: "destructive",
      })
    }
  }

  const handleDeletePosition = async (positionId: string) => {
    if (!confirm("Are you sure you want to delete this position? This action cannot be undone.")) return

    const result = await deletePosition(positionId)
    if (result.success) {
      toast({
        title: "Position Deleted",
        description: "The position has been successfully deleted.",
      })
      setPositions(positions.filter((p) => p.id !== positionId))
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete position.",
        variant: "destructive",
      })
    }
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ivote-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading positions...</p>
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
            <h1 className="text-2xl font-bold text-gray-800">Manage Positions</h1>
            <p className="text-gray-600">Add and manage positions for {election.title}</p>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="bg-ivote-primary hover:bg-ivote-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Position
          </Button>
        </div>

        {/* Add Position Form */}
        {showAddForm && (
          <Card className="p-6">
            <form onSubmit={handleAddPosition} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Add New Position</h3>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Position Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., President, Vice President"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxCandidates">Max Candidates</Label>
                  <Input
                    id="maxCandidates"
                    type="number"
                    min="1"
                    value={formData.maxCandidates}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, maxCandidates: Number.parseInt(e.target.value) }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the responsibilities and requirements for this position"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-ivote-primary hover:bg-ivote-primary/90">
                  <Save className="w-4 h-4 mr-2" />
                  Add Position
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Positions List */}
        <div className="space-y-4">
          {positions.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">No Positions Yet</h3>
                <p className="text-gray-600">Add your first position to get started with the election setup.</p>
              </div>
            </Card>
          ) : (
            positions.map((position) => (
              <Card key={position.id} className="p-6">
                {editingId === position.id ? (
                  <EditPositionForm
                    position={position}
                    onSave={(data) => handleUpdatePosition(position.id, data)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-800">{position.title}</h3>
                        <Badge variant="secondary">
                          Max {position.maxCandidates} candidate{position.maxCandidates !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      {position.description && <p className="text-gray-600">{position.description}</p>}
                      <p className="text-sm text-gray-500">
                        Created on {new Date(position.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingId(position.id)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePosition(position.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

function EditPositionForm({
  position,
  onSave,
  onCancel,
}: {
  position: Position
  onSave: (data: Partial<Position>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    title: position.title,
    description: position.description || "",
    maxCandidates: position.maxCandidates,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-title">Position Title</Label>
          <Input
            id="edit-title"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-maxCandidates">Max Candidates</Label>
          <Input
            id="edit-maxCandidates"
            type="number"
            min="1"
            value={formData.maxCandidates}
            onChange={(e) => setFormData((prev) => ({ ...prev, maxCandidates: Number.parseInt(e.target.value) }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-description">Description</Label>
        <Textarea
          id="edit-description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm" className="bg-ivote-primary hover:bg-ivote-primary/90">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
