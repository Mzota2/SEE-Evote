"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AnonymousSignInRemovedPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/login")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
      Anonymous sign-in is no longer available. Taking you to login...
    </div>
  )
}
