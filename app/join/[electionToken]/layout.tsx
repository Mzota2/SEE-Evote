import type { Metadata, ReactNode } from "next"
import { getPublicElection } from "@/lib/public-election"

export async function generateMetadata({ params }: { params: { electionToken: string } }): Promise<Metadata> {
  const election = await getPublicElection(params.electionToken)
  const title = election ? `Join ${election.title}` : "Join an election"
  const description = election?.description
    ? election.description.slice(0, 180)
    : "Open this invitation, confirm that you want to join, then wait for the organiser to approve your voting rights."

  const image = election?.backgroundImage

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: image ? [{ url: image, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default function JoinElectionLayout({ children }: { children: ReactNode }) {
  return children
}
