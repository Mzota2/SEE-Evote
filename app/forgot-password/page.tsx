"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { resetPassword } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await resetPassword(email)
    if (error) {
      toast({
        title: "Could not send the reset email",
        description: error,
        variant: "destructive",
      })
    } else {
      setSent(true)
      toast({
        title: "Check your email",
        description: "We sent a password reset link.",
      })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/">
            <Image
              width={140}
              height={140}
              src="/see-evote-logo-transparent.png"
              alt="SEE-Evote Logo"
              className="h-16 w-auto mx-auto"
            />
          </Link>
        </div>
        <Card className="p-8 bg-white/90 border-0 shadow-xl space-y-5">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-800">Forgot password</h1>
            <p className="text-sm text-gray-600">Enter the email on your account and we will send a reset link.</p>
          </div>

          {sent ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-gray-700">
                If an account exists for <span className="font-medium">{email}</span>, a reset email is on its way.
                Check your spam folder if it does not arrive.
              </p>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                className="w-full"
                onClick={handleSubmit}
              >
                {loading ? "Sending..." : "Resend reset link"}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@mubas.ac.mw"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-ivote-primary hover:bg-ivote-primary/90 text-white">
                {loading ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          )}

          <p className="text-center text-sm">
            <Link href="/login" className="text-see-evote-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
