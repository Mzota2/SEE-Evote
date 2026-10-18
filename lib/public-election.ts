export interface PublicElection {
  id: string
  title: string
  description: string
  organizationId: string
  electionToken: string
  backgroundImage?: string
  approval?: string
  startDate?: string
  endDate?: string
}

type FirestoreValue = {
  stringValue?: string
  integerValue?: string
  doubleValue?: number
  booleanValue?: boolean
  timestampValue?: string
}

function readString(value?: FirestoreValue) {
  return value?.stringValue || ""
}

export async function getPublicElection(electionToken: string): Promise<PublicElection | null> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  if (!projectId || !apiKey) return null

  let token = electionToken
  try {
    token = decodeURIComponent(electionToken)
  } catch {
    token = electionToken
  }
  token = token.trim()
  if (!token) return null

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/%28default%29/documents:runQuery?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "elections" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "electionToken" },
              op: "EQUAL",
              value: { stringValue: token },
            },
          },
          limit: 1,
        },
      }),
      next: { revalidate: 60 },
    },
  )

  if (!response.ok) return null
  const rows = (await response.json()) as Array<{ document?: { name?: string; fields?: Record<string, FirestoreValue> } }>
  const document = rows.find((row) => row.document?.fields)?.document
  if (!document?.fields) return null

  const fields = document.fields
  const id = document.name?.split("/").pop() || ""
  const backgroundImage = readString(fields.backgroundImage)

  return {
    id,
    title: readString(fields.title) || "Election",
    description: readString(fields.description),
    organizationId: readString(fields.organizationId),
    electionToken: readString(fields.electionToken) || token,
    backgroundImage: backgroundImage || undefined,
    approval: readString(fields.approval) || undefined,
    startDate: fields.startDate?.timestampValue,
    endDate: fields.endDate?.timestampValue,
  }
}
