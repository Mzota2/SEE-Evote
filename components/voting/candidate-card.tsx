"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Candidate } from "@/lib/types"
import { User } from "lucide-react"

interface CandidateCardProps {
  candidate: Candidate
  isSelected: boolean
  onSelect: () => void
  onViewDetails: () => void
}

export function CandidateCard({ candidate, isSelected, onSelect, onViewDetails }: CandidateCardProps) {
  return (
    <Card
      className={`p-4 sm:p-6 text-center transition-all ${isSelected ? "ring-2 ring-ivote-primabg-ivote-primary bg-ivote-primary/5" : "hover:shadow-lg"}`}
    >
      <div className="space-y-3 sm:space-y-4">
        {/* Candidate Image */}
        <div className="w-80 h-80 sm:w-32 sm:h-32 mx-auto rounded-full overflow-hidden bg-gray-200 border-4 border-b-ivote-secondary">
          {candidate.image ? (
            <img
              src={candidate.image || "/placeholder.svg"}
              alt={candidate.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
            </div>
          )}
        </div>

        {/* Candidate Info */}
        <div className="space-y-1 sm:space-y-2">
          <h3 className="font-bold text-gray-800 text-sm sm:text-base">{candidate.name}</h3>
          <p className="text-xs sm:text-sm text-gray-600">{candidate.department}</p>
          {candidate.age && <p className="text-xs sm:text-sm text-gray-500">{candidate.age} years old</p>}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={onSelect}
            className={`w-full text-sm sm:text-base py-2 sm:py-3 ${
              isSelected
                ? "bg-ivote-primary text-white"
                : "bg-ivote-primary hover:bg-ivote-primary/90 text-white"
            }`}
          >
            {isSelected ? "SELECTED" : "VOTE"}
          </Button>
          <Button
            onClick={onViewDetails}
            variant="outline"
            className="w-full border-ivote-primabg-ivote-primary text-ivote-primabg-ivote-primary hover:bg-ivote-primary hover:text-white bg-transparent text-sm sm:text-base py-2 sm:py-3"
          >
            View Details
          </Button>
        </div>
      </div>
    </Card>
  )
}
