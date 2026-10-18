const CODE_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "An account with this email already exists. Sign in instead.",
  "auth/invalid-credential": "That email or password is not correct.",
  "auth/wrong-password": "That email or password is not correct.",
  "auth/user-not-found": "We could not find an account with that email.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/weak-password": "Use a password with at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Wait a few minutes and try again.",
  "auth/popup-closed-by-user": "Sign-in was closed before it finished.",
  "auth/cancelled-popup-request": "Sign-in was closed before it finished.",
  "auth/popup-blocked": "Your browser blocked the sign-in window. Allow pop-ups and try again.",
  "auth/operation-not-allowed": "Google sign-in is not available right now. Use your email and password instead.",
  "auth/unauthorized-domain": "Google sign-in is not available on this website yet.",
  "auth/network-request-failed": "Check your internet connection and try again.",
  "auth/requires-recent-login": "Sign out, sign in again, then try updating your email.",
  "auth/user-disabled": "This account has been disabled. Contact the election organiser.",
}

export function toFriendlyMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code || "") : ""
  if (code && CODE_MESSAGES[code]) return CODE_MESSAGES[code]

  const raw = typeof error === "string" ? error : error instanceof Error ? error.message : ""
  const message = raw.toLowerCase()

  if (!raw) return fallback
  if (message.includes("email-already-in-use")) return CODE_MESSAGES["auth/email-already-in-use"]
  if (message.includes("invalid-credential") || message.includes("wrong-password")) return CODE_MESSAGES["auth/invalid-credential"]
  if (message.includes("weak-password")) return CODE_MESSAGES["auth/weak-password"]
  if (message.includes("too-many-requests")) return CODE_MESSAGES["auth/too-many-requests"]
  if (message.includes("popup-closed")) return CODE_MESSAGES["auth/popup-closed-by-user"]
  if (message.includes("network")) return CODE_MESSAGES["auth/network-request-failed"]
  if (message.includes("insufficient permission") || message.includes("permission")) {
    return "We could not complete that step. Please try again."
  }
  if (
    message.includes("firebase") ||
    message.includes("firestore") ||
    message.includes("cloudinary") ||
    message.includes("index") ||
    message.includes("auth/")
  ) {
    return fallback
  }
  if (raw.length > 180) return fallback
  return raw
}
