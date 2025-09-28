"use client"

import { Card } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { User } from "lucide-react"

export function UserProfile() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-gray-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">{user.name}</h3>
          <p className="text-sm text-gray-600 capitalize">{user.role}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>
    </Card>
  )
}
