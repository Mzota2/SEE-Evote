"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/auth/password-input"
import { GoogleAuthButton } from "@/components/auth/google-auth-button"
import { OrgEmailHint } from "@/components/auth/org-email-hint"
import { signIn, signInWithGoogle } from "@/lib/auth"
import { safeNextPath } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = safeNextPath(searchParams.get("next"))
  const { toast } = useToast()

  const finishSignIn = (error: string | null, hasUser: boolean) => {
    if (error) {
      toast({
        title: "Could not sign in",
        description: error,
        variant: "destructive",
      })
      return
    }

    if (hasUser) {
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      })
      router.push(nextPath || "/dashboard")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { user, error } = await signIn(email, password)
    finishSignIn(error, !!user)
    setLoading(false)
  }

  const handleGoogle = async () => {
    setLoading(true)
    const { user, error } = await signInWithGoogle("login")
    finishSignIn(error, !!user)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-amber-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image
              width={140}
              height={140}
              src="/see-evote-logo-transparent.png"
              alt="SEE-Evote Logo"
              className="h-16 w-auto"
            />
          </Link>
        </div>

        <Card className="p-6 sm:p-8 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-gray-800">Welcome back</h1>
              <p className="text-sm text-gray-600">Sign in to vote or manage an election</p>
            </div>

            <GoogleAuthButton
              label={loading ? "Please wait..." : "Login with Google"}
              onClick={handleGoogle}
              disabled={loading}
              className="w-full"
            />

            <div className="flex items-center gap-3 text-xs text-gray-400">
              <div className="h-px flex-1 bg-gray-200" />
              or use email
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="bece22-yourname@mubas.ac.mw"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-xs text-see-evote-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-ivote-primary hover:bg-ivote-primary/90 text-white">
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <OrgEmailHint />

            <p className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link href={nextPath ? `/register?next=${encodeURIComponent(nextPath)}` : "/register"} className="text-see-evote-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
