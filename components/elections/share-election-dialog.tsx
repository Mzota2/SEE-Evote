"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { electionJoinPath } from "@/lib/utils"
import type { Election } from "@/lib/types"
import { Copy, Share2 } from "lucide-react"

function formatDate(value?: Date | string) {
  if (!value) return "Date not set"
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return "Date not set"
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
}

async function buildShareImage(election: Election) {
  const canvas = document.createElement("canvas")
  canvas.width = 1200
  canvas.height = 630
  const context = canvas.getContext("2d")
  if (!context) return null

  const paintCard = () => {
    context.fillStyle = "rgba(15, 23, 42, 0.62)"
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = "#ffffff"
    context.font = "600 28px sans-serif"
    context.fillText((election.organizationId || "SEE-Evote").toUpperCase(), 64, 390)
    context.font = "700 64px sans-serif"
    const title = election.title.length > 42 ? `${election.title.slice(0, 39)}...` : election.title
    context.fillText(title, 64, 470)
    context.font = "32px sans-serif"
    context.fillText(`${formatDate(election.startDate)} – ${formatDate(election.endDate)}`, 64, 530)
    context.fillText("Join on SEE-Evote", 64, 580)
  }

  if (election.backgroundImage) {
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const picture = new Image()
        picture.crossOrigin = "anonymous"
        picture.onload = () => resolve(picture)
        picture.onerror = () => reject(new Error("picture"))
        picture.src = election.backgroundImage || ""
      })
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
    } catch {
      const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, "#0f4c75")
      gradient.addColorStop(1, "#f5c242")
      context.fillStyle = gradient
      context.fillRect(0, 0, canvas.width, canvas.height)
    }
  } else {
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, "#0f4c75")
    gradient.addColorStop(1, "#f5c242")
    context.fillStyle = gradient
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  paintCard()
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
  return blob
}

export function ShareElectionDialog({ election }: { election: Election }) {
  const { toast } = useToast()
  const [sharing, setSharing] = useState(false)
  const path = electionJoinPath(election.electionToken)
  const link = typeof window === "undefined" ? path : `${window.location.origin}${path}`
  const message = `Join ${election.title}. Open the link and confirm. You can vote after the organiser approves you.`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link)
      toast({ title: "Link copied", description: "Send it to voters so they can confirm joining." })
    } catch {
      toast({ title: "Could not copy", description: "Select the link and copy it yourself.", variant: "destructive" })
    }
  }

  const openShare = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer,width=640,height=720")
  }

  const shareImage = async () => {
    setSharing(true)
    try {
      const blob = await buildShareImage(election)
      const file = blob ? new File([blob], "election-invite.png", { type: "image/png" }) : null
      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: election.title, text: message, url: link })
        return
      }
      if (navigator.share) {
        await navigator.share({ title: election.title, text: message, url: link })
        return
      }
      if (blob) {
        const download = document.createElement("a")
        download.href = URL.createObjectURL(blob)
        download.download = "election-invite.png"
        download.click()
        URL.revokeObjectURL(download.href)
        toast({ title: "Picture saved", description: "Post the picture with the copied link." })
        return
      }
      await copyLink()
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return
      toast({ title: "Could not share", description: "Copy the link and send it instead.", variant: "destructive" })
    } finally {
      setSharing(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-ivote-primary hover:bg-ivote-primary/90">
          <Share2 className="w-4 h-4 mr-2" />
          Share with voters
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Share this election</DialogTitle>
          <DialogDescription>
            Voters open the link, see this invitation, and confirm they want to join. They can vote after you approve them.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-hidden rounded-xl border">
          <div
            className="aspect-video w-full bg-cover bg-center"
            style={{
              backgroundImage: election.backgroundImage
                ? `linear-gradient(180deg, rgba(15,23,42,0.05), rgba(15,23,42,0.62)), url(${election.backgroundImage})`
                : "linear-gradient(135deg, #0f4c75, #4fc3e0 55%, #f5c242)",
            }}
          />
          <div className="p-4 space-y-1">
            <p className="text-xs uppercase tracking-wide text-gray-500">{election.organizationId}</p>
            <h3 className="text-lg font-semibold text-gray-800">{election.title}</h3>
            <p className="text-sm text-gray-600">
              {formatDate(election.startDate)} – {formatDate(election.endDate)}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm break-all text-gray-700">{link}</div>

        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" onClick={copyLink}>
            <Copy className="w-4 h-4 mr-2" />
            Copy link
          </Button>
          <Button type="button" onClick={shareImage} disabled={sharing} className="bg-ivote-primary hover:bg-ivote-primary/90">
            {sharing ? "Preparing..." : "Share picture"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => openShare(`https://wa.me/?text=${encodeURIComponent(`${message} ${link}`)}`)}
          >
            WhatsApp
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`)}
          >
            Facebook
          </Button>
          <Button
            type="button"
            variant="outline"
            className="col-span-2"
            onClick={() =>
              openShare(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(link)}`)
            }
          >
            X
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
