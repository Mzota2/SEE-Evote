"use client"

import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Calendar() {
  const currentDate = new Date()
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long" })
  const year = currentDate.getFullYear()

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Calendar</h2>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-medium">{monthName}</span>
            <Button variant="ghost" size="sm">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-sm text-gray-600">This Month</div>
        </div>

        <div className="bg-ivote-primary text-white rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">22</div>
          <div className="text-sm">December</div>
          <div className="text-xs mt-1">President Student Council</div>
        </div>

        <div className="text-center text-sm text-gray-600">
          <div>Today</div>
          <div>Next week</div>
        </div>
      </div>
    </Card>
  )
}
