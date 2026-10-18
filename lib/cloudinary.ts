export async function uploadImageToCloudinary(file: File, folder = "see-evote") {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error("Picture upload is not available right now. You can continue without a picture.")
  }

  const body = new FormData()
  body.append("file", file)
  body.append("upload_preset", uploadPreset)
  body.append("folder", folder)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body,
  })

  const data = await response.json()
  if (!response.ok || !data.secure_url) {
    throw new Error("We could not upload that picture. Try a smaller image, or continue without one.")
  }

  return data.secure_url as string
}
