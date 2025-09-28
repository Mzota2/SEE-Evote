"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { voteTokenSignIn } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { Vote, ArrowLeft, Shield, CheckCircle } from "lucide-react"
import Image from "next/image"

export default function AnonymousSignInPage() {
  const [votingID, setVotingID] = useState("")
  const [electionToken, setElectionToken] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await voteTokenSignIn(votingID, electionToken)
      console.log(result.error)
      if (result?.success) {
        toast({
          title: "Anonymous Login Successful",
          description: "Welcome! You can now cast your vote securely and anonymously.",
        })
        // Redirect to the specific election dashboard
        router.push(`/dashboard/${electionToken}`)
      } else {
        toast({
          title: "Login Failed",
          description: result?.error || "Invalid Voting ID or Election Token",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
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
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-see-evote-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-see-evote-primary" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Anonymous Voter Login</h1>
              <p className="text-sm sm:text-base text-gray-600">
                Enter your credentials to cast your vote securely and anonymously
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="votingID" className="text-sm sm:text-base">
                  Voting ID
                </Label>
                <Input
                  id="votingID"
                  type="text"
                  value={votingID}
                  onChange={(e) => setVotingID(e.target.value)}
                  placeholder="Enter your Voting ID"
                  required
                  className="w-full font-mono text-sm sm:text-base py-2 sm:py-3"
                />
                <p className="text-xs text-gray-500">
                  Your unique 8-character Voting ID provided by the election administrator
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="electionToken" className="text-sm sm:text-base">
                  Election Token
                </Label>
                <Input
                  id="electionToken"
                  type="text"
                  value={electionToken}
                  onChange={(e) => setElectionToken(e.target.value)}
                  placeholder="Enter Election Token"
                  required
                  className="w-full font-mono text-sm sm:text-base py-2 sm:py-3"
                />
                <p className="text-xs text-gray-500">
                  The election token for the specific election you want to vote in
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading || !votingID || !electionToken}
                className="w-full bg-ivote-primary hover:bg-ivote-primary/90 active:bg-primary/90 text-white text-sm sm:text-base py-2 sm:py-3"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Verifying Credentials...
                  </>
                ) : (
                  <>
                    <Vote className="w-4 h-4 mr-2" />
                    SIGN IN TO VOTE
                  </>
                )}
              </Button>
            </form>

            <div className="text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <Link
                href="/login"
                className="inline-flex items-center text-see-evote-primary hover:underline font-medium text-sm sm:text-base"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Regular Login
              </Link>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-green-800 mb-2 text-sm sm:text-base">Anonymous & Secure Voting</h3>
                  <ul className="text-xs sm:text-sm text-green-700 space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 flex-shrink-0" />
                      Your identity remains completely anonymous
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 flex-shrink-0" />
                      One-time use Voting ID ensures election integrity
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 flex-shrink-0" />
                      Secure authentication without personal data
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <h3 className="font-medium text-blue-800 mb-2 text-sm sm:text-base">How to Vote:</h3>
              <ol className="text-xs sm:text-sm text-blue-700 space-y-1">
                <li>1. Get your unique Voting ID from your election administrator</li>
                <li>2. Enter the Election Token for your specific election</li>
                <li>3. Sign in anonymously to maintain voting privacy</li>
                <li>4. Cast your vote for your preferred candidates</li>
                <li>5. Your Voting ID will be marked as used to prevent duplicate voting</li>
              </ol>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
