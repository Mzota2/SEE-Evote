"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createElection } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"
import type { User, Election } from "@/lib/types"
import { Plus, X } from "lucide-react"

interface CreateElectionModalProps {
  isOpen: boolean
  onClose: () => void
  onElectionCreated: (election: Election) => void
  user: User
}

export function CreateElectionModal({ isOpen, onClose, onElectionCreated, user }: CreateElectionModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    positions: [""],
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePositionChange = (index: number, value: string) => {
    const newPositions = [...formData.positions]
    newPositions[index] = value
    setFormData((prev) => ({ ...prev, positions: newPositions }))
  }

  const addPosition = () => {
    setFormData((prev) => ({ ...prev, positions: [...prev.positions, ""] }))
  }

  const removePosition = (index: number) => {
    if (formData.positions.length > 1) {
      const newPositions = formData.positions.filter((_, i) => i !== index)
      setFormData((prev) => ({ ...prev, positions: newPositions }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`)

      if (endDateTime <= startDateTime) {
        throw new Error("End date must be after start date")
      }

      const validPositions = formData.positions.filter((pos) => pos.trim() !== "")
      if (validPositions.length === 0) {
        throw new Error("At least one position is required")
      }

      const electionData = {
        title: formData.title,
        description: formData.description,
        startTime: startDateTime,
        endTime: endDateTime,
        createdBy: user.id,
        organizationId: user.organizationId || "default",
        status: "pending" as const,
        electionToken: Math.random().toString(36).substring(2, 15),
        positions: validPositions.map((title, index) => ({
          id: `pos_${index + 1}`,
          title,
          description: "",
          maxVotes: 1,
          candidates: [],
        })),
      }

      const { id, error } = await createElection(electionData)

      if (error) {
        throw new Error(error)
      }

      const newElection: Election = {
        id: id!,
        ...electionData,
        createdAt: new Date(),
      }

      onElectionCreated(newElection)

      toast({
        title: "Election Created",
        description: "Election has been created successfully",
      })

      // Reset form
      setFormData({
        title: "",
        description: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        positions: [""],
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Election</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="title">Election Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Student Council Elections 2024"
                required
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Brief description of the election"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Positions</Label>
              <Button type="button" onClick={addPosition} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Position
              </Button>
            </div>

            <div className="space-y-2">
              {formData.positions.map((position, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={position}
                    onChange={(e) => handlePositionChange(index, e.target.value)}
                    placeholder={`Position ${index + 1} (e.g., President)`}
                    required
                  />
                  {formData.positions.length > 1 && (
                    <Button type="button" onClick={() => removePosition(index)} variant="outline" size="sm">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-ivote-primary hover:bg-ivote-primary/90">
              {loading ? "Creating..." : "Create Election"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
