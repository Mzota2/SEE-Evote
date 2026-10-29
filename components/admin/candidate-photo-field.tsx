"use client"

import { useEffect, useRef, useState } from "react"
import Cropper, { type Area, type Point } from "react-easy-crop"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

const ACCEPTED_PHOTO_TYPES = new Set(["image/jpeg", "image/jpg", "image/pjpeg", "image/png", "image/x-png"])

function isAcceptedPhoto(file: File) {
  const type = file.type.toLowerCase()
  if (ACCEPTED_PHOTO_TYPES.has(type)) return true
  return /\.(jpe?g|png)$/i.test(file.name)
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = document.createElement("img")
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Could not read that image."))
    image.src = src
  })
}

function isSquare(width: number, height: number) {
  if (!width || !height) return false
  return Math.min(width, height) / Math.max(width, height) >= 0.98
}

async function cropImageToSquare(src: string, area: Area, originalName: string) {
  const image = await loadImage(src)
  const output = Math.max(320, Math.min(800, Math.round(area.width)))
  const canvas = document.createElement("canvas")
  canvas.width = output
  canvas.height = output
  const context = canvas.getContext("2d")
  if (!context) throw new Error("Could not crop that image.")
  context.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, output, output)
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92))
  if (!blob) throw new Error("Could not crop that image.")
  const base = originalName.replace(/\.[^.]+$/, "") || "candidate"
  return new File([blob], `${base}.jpg`, { type: "image/jpeg" })
}

export function CandidatePhotoField({
  id,
  previewUrl,
  onFile,
}: {
  id: string
  previewUrl: string | null
  onFile: (file: File) => void
}) {
  const { toast } = useToast()
  const sourceUrlRef = useRef<string | null>(null)
  const [open, setOpen] = useState(false)
  const [sourceUrl, setSourceUrl] = useState<string | null>(null)
  const [sourceName, setSourceName] = useState("candidate")
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    return () => {
      if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current)
    }
  }, [])

  const clearSource = () => {
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current)
    sourceUrlRef.current = null
    setSourceUrl(null)
    setCroppedArea(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
  }

  const closeCrop = () => {
    setOpen(false)
    setSaving(false)
    clearSource()
  }

  const handleFile = async (file: File | null) => {
    if (!file) return
    if (!isAcceptedPhoto(file)) {
      toast({
        title: "Choose a photo",
        description: "Use a JPG, JPEG, or PNG image.",
        variant: "destructive",
      })
      return
    }

    const url = URL.createObjectURL(file)
    try {
      const image = await loadImage(url)
      if (isSquare(image.naturalWidth, image.naturalHeight)) {
        URL.revokeObjectURL(url)
        onFile(file)
        return
      }
      if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current)
      sourceUrlRef.current = url
      setSourceName(file.name)
      setSourceUrl(url)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppedArea(null)
      setOpen(true)
    } catch {
      URL.revokeObjectURL(url)
      toast({
        title: "Could not open that photo",
        description: "Try a JPG or PNG image.",
        variant: "destructive",
      })
    }
  }

  const applyCrop = async () => {
    if (!sourceUrl || !croppedArea) return
    setSaving(true)
    try {
      const file = await cropImageToSquare(sourceUrl, croppedArea, sourceName)
      onFile(file)
      closeCrop()
    } catch {
      setSaving(false)
      toast({
        title: "Could not crop that photo",
        description: "Try again, or choose a different image.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Candidate Photo</Label>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="h-32 w-32 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100 sm:h-[200px] sm:w-[200px]">
          {previewUrl ? (
            <Image
              height={200}
              width={200}
              src={previewUrl}
              alt="Preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2zm16 0l-4.586 4.586a2 2 0 01-2.828 0L7 7" />
              </svg>
            </span>
          )}
        </div>
        <div className="w-full min-w-0 space-y-1 sm:w-auto">
          <Input
            id={id}
            type="file"
            accept="image/jpeg,image/png,.jpg,.jpeg,.png"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null
              event.target.value = ""
              handleFile(file)
            }}
            className="w-full max-w-full sm:w-fit"
          />
          <p className="text-xs text-gray-500">JPG, JPEG, and PNG photos are accepted. Square photos upload as they are. Wider or taller photos open a crop.</p>
        </div>
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next && !saving) closeCrop()
        }}
      >
        <DialogContent className="max-h-[90vh] w-[calc(100%-1.5rem)] max-w-lg gap-3 overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Crop candidate photo</DialogTitle>
            <DialogDescription>
              Drag the photo and use zoom so the face sits inside the circle. The saved image is square.
            </DialogDescription>
          </DialogHeader>
          <div className="relative h-64 w-full overflow-hidden rounded-md bg-neutral-900 sm:h-80">
            {sourceUrl ? (
              <Cropper
                image={sourceUrl}
                crop={crop}
                zoom={zoom}
                rotation={0}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropAreaChange={(_, pixels) => {
                  if (pixels.width < 1 || pixels.height < 1) return
                  setCroppedArea((current) => current ?? pixels)
                }}
                onCropComplete={(_, pixels) => {
                  if (pixels.width < 1 || pixels.height < 1) return
                  setCroppedArea(pixels)
                }}
              />
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-zoom`}>Zoom</Label>
            <Slider
              id={`${id}-zoom`}
              value={[zoom]}
              min={1}
              max={3}
              step={0.01}
              onValueChange={(value) => setZoom(value[0] ?? 1)}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={closeCrop} disabled={saving}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-ivote-primary hover:bg-ivote-primary/90"
              onClick={applyCrop}
              disabled={saving || !croppedArea}
            >
              {saving ? "Saving crop..." : "Use crop"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
