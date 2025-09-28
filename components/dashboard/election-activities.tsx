"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ElectionActivities() {
  const activities = [
    {
      id: 1,
      title: "President Student Council",
      status: "ongoing",
      date: "12/22/2022",
    },
    {
      id: 2,
      title: "Vice President Student Council",
      status: "pending",
      date: "Pending",
    },
    {
      id: 3,
      title: "Secretary Student Council",
      status: "concluded",
      date: "Concluded",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ongoing":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "concluded":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Election Activities</h2>

      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  activity.status === "ongoing"
                    ? "bg-green-500"
                    : activity.status === "pending"
                      ? "bg-yellow-500"
                      : "bg-gray-500"
                }`}
              ></div>
              <span className="text-sm text-gray-700">{activity.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(activity.status)}>{activity.status}</Badge>
              <span className="text-xs text-gray-500">{activity.date}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
