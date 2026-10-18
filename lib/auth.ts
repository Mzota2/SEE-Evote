import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  verifyBeforeUpdateEmail,
  reload,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { nanoid } from "nanoid"
import { auth, db } from "./firebase"
import { parseOrganizationEmail } from "./org-email"
import { omitUndefined } from "./utils"
import { toFriendlyMessage } from "./user-messages"
import type { User } from "./types"

const buildUserRecord = (id: string, email: string, name: string, provider: "password" | "google"): User => {
  const parsed = parseOrganizationEmail(email)

  return omitUndefined({
    id,
    email,
    name,
    voterId: `SEE-${nanoid(8).toUpperCase()}`,
    createdAt: new Date(),
    isActive: true,
    agreeToTerms: true,
    authProvider: provider,
    program: parsed?.program,
    intakeYear: parsed?.year,
    orgLocalName: parsed?.name,
    organizationDomain: parsed?.domain,
  })
}

export const signUp = async (email: string, password: string, name: string) => {
  try {
    if (!auth || !db) {
      return { user: null, error: "We could not start registration. Refresh the page and try again." }
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const newUser = buildUserRecord(userCredential.user.uid, email, name.trim(), "password")

    await setDoc(doc(db, "users", userCredential.user.uid), omitUndefined(newUser as unknown as Record<string, unknown>))
    return { user: newUser, error: null }
  } catch (error: any) {
    console.error("Sign up error:", error)
    return { user: null, error: toFriendlyMessage(error, "We could not create your account. Please try again.") }
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    if (!auth || !db) {
      return { user: null, error: "We could not sign you in. Refresh the page and try again." }
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid))

    if (userDoc.exists()) {
      return { user: userDoc.data() as User, error: null }
    }

    throw new Error("We could not find your account details. Try signing up again.")
  } catch (error: any) {
    console.error("Sign in error:", error)
    return { user: null, error: toFriendlyMessage(error, "We could not sign you in. Please try again.") }
  }
}

export const signInWithGoogle = async (intent: "login" | "signup") => {
  try {
    if (!auth || !db) {
      return { user: null, error: "We could not sign you in. Refresh the page and try again." }
    }

    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: "select_account" })
    const credential = await signInWithPopup(auth, provider)
    const firebaseUser = credential.user
    const email = firebaseUser.email

    if (!email) {
      await firebaseSignOut(auth)
      return { user: null, error: "Google did not share an email address. Try another account." }
    }

    const userRef = doc(db, "users", firebaseUser.uid)
    const existing = await getDoc(userRef)

    if (intent === "login" && !existing.exists()) {
      await firebaseSignOut(auth)
      return { user: null, error: "No account was found for this Google email. Create an account first." }
    }

    if (existing.exists()) {
      return { user: existing.data() as User, error: null }
    }

    const newUser = buildUserRecord(
      firebaseUser.uid,
      email,
      firebaseUser.displayName || email.split("@")[0],
      "google",
    )
    await setDoc(userRef, omitUndefined(newUser as unknown as Record<string, unknown>))
    return { user: newUser, error: null }
  } catch (error: any) {
    console.error("Google sign in error:", error)
    return { user: null, error: toFriendlyMessage(error, "Google sign-in did not finish. Please try again.") }
  }
}

export const resetPassword = async (email: string) => {
  try {
    if (!auth) {
      return { error: "We could not send the reset email. Please try again." }
    }

    await sendPasswordResetEmail(auth, email.trim())
    return { error: null }
  } catch (error: any) {
    return { error: toFriendlyMessage(error, "We could not send the reset email. Please try again.") }
  }
}

export const requestOrganisationEmailChange = async (newEmail: string) => {
  try {
    const current = auth.currentUser
    if (!current) {
      return { error: "Sign in again before changing your email." }
    }

    const usesPassword = current.providerData.some((provider) => provider.providerId === "password")
    if (!usesPassword) {
      return {
        error: "This account uses Google, so its email cannot be changed here. Sign out and register a new account with your organisation email.",
      }
    }

    await verifyBeforeUpdateEmail(current, newEmail.trim().toLowerCase())
    return { error: null }
  } catch (error: any) {
    return { error: toFriendlyMessage(error, "We could not send the verification email.") }
  }
}

export const readVerifiedEmail = async () => {
  const current = auth.currentUser
  if (!current) {
    return { email: "", error: "Sign in again to confirm your new email." }
  }

  await reload(current)
  return { email: current.email || "", error: null }
}

export const signOut = async () => {
  try {
    await firebaseSignOut(auth)
    return { error: null }
  } catch (error: any) {
    return { error: toFriendlyMessage(error, "We could not sign you out. Please try again.") }
  }
}

export const getCurrentUser = async (): Promise<User | null> => {
  return new Promise((resolve) => {
    if (!auth || !db) {
      console.error("Firebase services not initialized")
      resolve(null)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      unsubscribe()
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          if (userDoc.exists()) {
            resolve(userDoc.data() as User)
          } else {
            resolve(null)
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          resolve(null)
        }
      } else {
        resolve(null)
      }
    })
  })
}
