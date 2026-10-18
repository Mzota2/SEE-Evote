"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestOrganisationEmailChange, readVerifiedEmail, signOut } from "@/lib/auth"
import { restoreOrganisationMembership } from "@/lib/database"
import { isOrganizationMemberEmail, orgEmailHint } from "@/lib/org-email"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

interface OrgEmailRecoveryProps {
  domain: string
  onRestored: () => void
}

export function OrgEmailRecovery({ domain, onRestored }: OrgEmailRecoveryProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const example = orgEmailHint(domain)

  const handleSend = async () => {
    if (!isOrganizationMemberEmail(email, domain)) {
      toast({
        title: "Organisation email required",
        description: `Use an email like ${example}.`,
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const { error } = await requestOrganisationEmailChange(email)
    if (error) {
      toast({ title: "Could not update email", description: error, variant: "destructive" })
    } else {
      setSent(true)
      toast({
        title: "Verification sent",
        description: "Open the link sent to your new email, then confirm it here.",
      })
    }
    setLoading(false)
  }

  const handleConfirm = async () => {
    if (!user) return
    setLoading(true)
    const verified = await readVerifiedEmail()
    if (verified.error || !verified.email) {
      toast({
        title: "Email not updated yet",
        description: verified.error || "Open the verification link, then try again.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    const result = await restoreOrganisationMembership(user.id, verified.email, domain)
    if (result.error || result.restored === 0) {
      toast({
        title: "Email not accepted yet",
        description: result.error || `Use an organisation email like ${example}, or create a new account with that email.`,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Email verified",
        description: "Your organisation email is confirmed and your membership is restored.",
      })
      onRestored()
    }
    setLoading(false)
  }

  const handleNewAccount = async () => {
    await signOut()
    router.push("/register")
  }

  return (
    <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
      <p className="text-sm text-amber-900">
        This election now requires an organisation email such as <span className="font-medium">{example}</span>. Your
        current email no longer has access.
      </p>
      {user?.authProvider === "google" ? (
        <p className="text-sm text-amber-900">
          This account is signed in with Google, so the email cannot be changed here. Register a new account with your
          organisation email.
        </p>
      ) : (
      <div className="space-y-2">
        <Label htmlFor={`org-email-${domain}`} className="text-xs">
          Organisation email
        </Label>
        <Input
          id={`org-email-${domain}`}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={example}
        />
        <Button type="button" className="w-full" disabled={loading} onClick={handleSend}>
          {loading ? "Please wait..." : "Send a confirmation email"}
        </Button>
        {sent && (
          <Button type="button" variant="outline" className="w-full" disabled={loading} onClick={handleConfirm}>
            I opened the confirmation link
          </Button>
        )}
      </div>
      )}
      <Button type="button" variant="ghost" className="w-full text-amber-900" onClick={handleNewAccount}>
        Sign up a different account
      </Button>
    </div>
  )
}
