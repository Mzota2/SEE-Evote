"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { signIn } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { user, error } = await signIn(email, password)

    if (error) {
      toast({
        title: "Login Failed",
        description: error,
        variant: "destructive",
      })
    } else if (user) {
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      })
      router.push("/dashboard")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 sm:mb-6">
            <Image
              width={100}
              height={100}
              src="/see-evote-logo-transparent.png"
              alt="SEE-Evote Logo"
              className="h-10 sm:h-12 w-auto"
            />
          </Link>
        </div>

        <Card className="p-6 sm:p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Welcome Back!</h1>
              <p className="text-sm sm:text-base text-gray-600">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm sm:text-base">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full text-sm sm:text-base py-2 sm:py-3"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm sm:text-base">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full text-sm sm:text-base py-2 sm:py-3"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-ivote-primary hover:bg-ivote-primary/90 active:bg-primary/90 text-white text-sm sm:text-base py-2 sm:py-3"
              >
                {loading ? "Signing In..." : "SIGN IN"}
              </Button>
            </form>

            <div className="text-center space-y-2">
              <p className="text-sm sm:text-base text-gray-600">
                Don't have an account?{" "}
                <Link href="/register" className="text-see-evote-primary hover:underline font-medium">
                  Sign up here
                </Link>
              </p>

              <Link
                href="/ano-signin"
                className="text-see-evote-primary hover:underline font-medium text-sm sm:text-base"
              >
                Anonymous Sign In
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
