"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { PasswordInput } from "@/components/auth/password-input"
import { GoogleAuthButton } from "@/components/auth/google-auth-button"
import { OrgEmailHint } from "@/components/auth/org-email-hint"
import { signUp, signInWithGoogle } from "@/lib/auth"
import { safeNextPath } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function RegisterPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = safeNextPath(searchParams.get("next"))
  const { toast } = useToast()

  const goNext = (voterId?: string) => {
    toast({
      title: "Registration successful",
      description: voterId ? `Your voter ID is ${voterId}` : "Welcome to SEE-Evote.",
    })
    router.push(nextPath || "/post-registration")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Type the same password in both boxes.",
        variant: "destructive",
      })
      return
    }

    if (!agreeToTerms) {
      toast({
        title: "Agree to the terms first",
        description: "Tick the box to accept the terms before creating your account.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const { user, error } = await signUp(email, password, fullName)
    if (error) {
      toast({
        title: "Could not create your account",
        description: error,
        variant: "destructive",
      })
    } else if (user) {
      goNext(user.voterId)
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    if (!agreeToTerms) {
      toast({
        title: "Agree to the terms first",
        description: "Tick the box to accept the terms before continuing with Google.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const { user, error } = await signInWithGoogle("signup")
    if (error) {
      toast({
        title: "Could not sign up with Google",
        description: error,
        variant: "destructive",
      })
    } else if (user) {
      goNext(user.voterId)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-amber-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg">
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
              <h1 className="text-2xl font-bold text-gray-800">Create your voter account</h1>
              <p className="text-sm text-gray-600">
                Your voter ID is created automatically. You only need your name and email.
              </p>
            </div>

            <GoogleAuthButton
              label={loading ? "Please wait..." : "Sign up with Google"}
              onClick={handleGoogle}
              disabled={loading}
              className="w-full"
            />
            <OrgEmailHint />

            <div className="flex items-center gap-3 text-xs text-gray-400">
              <div className="h-px flex-1 bg-gray-200" />
              or register with email
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Emmanuel Chirambo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
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
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <PasswordInput
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  minLength={6}
                />
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                  className="mt-1"
                />
                <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed font-normal">
                  I agree to SEE-Evote&apos;s{" "}
                  <Link href="/terms" className="text-see-evote-primary underline">
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-see-evote-primary underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-ivote-primary hover:bg-ivote-primary/90 text-white">
                {loading ? "Creating account..." : "Register"}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href={nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login"} className="text-see-evote-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
