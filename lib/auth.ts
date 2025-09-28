import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
  signInAnonymously,
} from "firebase/auth"
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore"
import { auth, db } from "./firebase"
import type { User, VoterID } from "./types"

export const signUp = async (email: string, password: string, userData: Partial<User>) => {
  try {
    if (!auth || !db) {
      throw new Error("Firebase services not initialized. Please check your configuration.")
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    const newUser: User = {
      id: user.uid,
      email: user.email!,
      name: userData.name || "",
      createdAt: new Date(),
      ...userData,
    }

    await setDoc(doc(db, "users", user.uid), newUser)
    return { user: newUser, error: null }
  } catch (error: any) {
    console.error("Sign up error:", error)
    return { user: null, error: error.message || "Failed to create account" }
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    if (!auth || !db) {
      throw new Error("Firebase services not initialized. Please check your configuration.")
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid))

    if (userDoc.exists()) {
      return { user: userDoc.data() as User, error: null }
    } else {
      throw new Error("User data not found")
    }
  } catch (error: any) {
    console.error("Sign in error:", error)
    return { user: null, error: error.message || "Failed to sign in" }
  }
}

export const voteTokenSignIn = async (votingID: string, electionToken: string) => {
  try {
    if (!auth || !db) {
      throw new Error("Firebase services not initialized. Please check your configuration.")
    }

    // First, verify the voting ID exists and matches the election token
    const voterIDQuery = query(
      collection(db, "voterIDs"),
      where("token", "==", votingID),
      where("electionToken", "==", electionToken),
      where("isUsed", "==", false),
    )

    const voterIDSnapshot = await getDocs(voterIDQuery)

    if (voterIDSnapshot.empty) {
      return { success: false, error: "Invalid Voting ID or Election Token, or this ID has already been used" }
    }

    const voterIDDoc = voterIDSnapshot.docs[0]
    const voterIDData = voterIDDoc.data() as VoterID

    // Check if the voting ID has expired
    const now = new Date()
    const expiresAt = new Date(voterIDData.expiresAt)
    if (now > expiresAt) {
      return { success: false, error: "This Voting ID has expired" }
    }

    // Sign in anonymously
    const userCredential = await signInAnonymously(auth)
    const firebaseUser = userCredential.user

    if (!firebaseUser) {
      return { success: false, error: "Failed to create anonymous session" }
    }

    // Create a temporary user record for the anonymous voter
    const anonymousUser: User = {
      id: firebaseUser.uid,
      email: `anonymous-${votingID}@voter.temp`,
      name: `Voter ${votingID}`,
      birthday: new Date(),
      contactNumber: "",
      address: {
        province: "",
        barangay: "",
        city: "",
      },
      organizationId: voterIDData.organizationId,
      createdAt: new Date(),
      isActive: true,
    }

    // Save the anonymous user
    await setDoc(doc(db, "users", firebaseUser.uid), anonymousUser)

    // Create a voter role for this anonymous user
    await addDoc(collection(db, "roles"), {
      userId: firebaseUser.uid,
      electionId: voterIDData.electionId,
      electionToken: voterIDData.electionToken,
      organizationId: voterIDData.organizationId,
      role: "voter",
      status: "approved",
      createdAt: serverTimestamp(),
    })

    // Mark the voting ID as used
    await updateDoc(doc(db, "voterIDs", voterIDDoc.id), {
      isUsed: true,
      votedAt: serverTimestamp(),
      usedBy: firebaseUser.uid,
    })

    return {
      success: true,
      user: anonymousUser,
      error: null,
      electionToken: voterIDData.electionToken,
      electionId: voterIDData.electionId,
    }
  } catch (error: any) {
    console.error("Anonymous sign in error:", error)
    return { success: false, error: error.message || "Failed to sign in anonymously" }
  }
}

export const signOut = async () => {
  try {
    await firebaseSignOut(auth)
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
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
