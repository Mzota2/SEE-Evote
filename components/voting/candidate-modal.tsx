"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Candidate } from "@/lib/types"
import { User, X } from "lucide-react"

interface CandidateModalProps {
  candidate: Candidate | null
  isOpen: boolean
  onClose: () => void
}

export function CandidateModal({ candidate, isOpen, onClose }: CandidateModalProps) {
  if (!candidate) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-gray-800">Vote for {candidate.name}</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Candidate Header */}
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {candidate.image ? (
                <img
                  src={candidate.image || "/placeholder.svg"}
                  alt={candidate.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <h2 className="text-2xl font-bold text-gray-800">{candidate.name}</h2>
              <p className="text-lg text-gray-600">{candidate.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <span>🎓</span>
                  <span>{candidate.department}</span>
                </div>
                {candidate.age && (
                  <div className="flex items-center gap-1">
                    <span>👤</span>
                    <span>{candidate.age} years old</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Campaign Platform */}
          {candidate.platform && candidate.platform.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Campaign Platform</h3>
              {/* <div className="space-y-3">
                {candidate.platform.map((point, index) => (
                  <div key={index} className="flex gap-3">
                    <span className="text-ivote-primary font-bold text-lg">{index + 1}.</span>
                    <p className="text-gray-700 leading-relaxed">{point}</p>
                  </div>
                ))}
              </div> */}
            </div>
          )}

          {/* Vote Button */}
          <div className="pt-4 border-t">
            <Button onClick={onClose} className="w-full bg-ivote-primary hover:bg-ivote-primary/90 text-white py-3">
              VOTE
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
