import { jsPDF } from "jspdf"

const INK = [15, 44, 58] as const
const CYAN = [79, 195, 224] as const
const GOLD = [245, 194, 66] as const
const NAVY = [12, 58, 74] as const
const PAGE_W = 210
const PAGE_H = 297
const FOOTER_H = 26
const CONTENT_BOTTOM = PAGE_H - FOOTER_H - 4
const SLOGAN = "Modern, safe, and efficient elections."
const CONTACT = "mubas-see@gmail.com"

export interface PosterCandidate {
  name: string
  image?: string
  votes: number
  isWinner: boolean
}

export interface PosterPosition {
  title: string
  order?: number
  candidates: PosterCandidate[]
}

interface Person {
  name: string
  role: string
  portrait: string
}

interface LoadedImage {
  data: string
  width: number
  height: number
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image()
    const timer = window.setTimeout(() => resolve(null), 8000)
    image.crossOrigin = "anonymous"
    image.onload = () => {
      window.clearTimeout(timer)
      resolve(image)
    }
    image.onerror = () => {
      window.clearTimeout(timer)
      resolve(null)
    }
    image.src = src
  })
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || "")
  return letters.join("") || "?"
}

function drawInitials(size: number, name: string) {
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext("2d")
  if (!context) return ""
  context.beginPath()
  context.arc(size / 2, size / 2, size / 2 - 10, 0, Math.PI * 2)
  context.fillStyle = "#4fc3e0"
  context.fill()
  context.fillStyle = "#ffffff"
  context.font = `700 ${Math.round(size * 0.32)}px Helvetica, Arial, sans-serif`
  context.textAlign = "center"
  context.textBaseline = "middle"
  context.fillText(initials(name), size / 2, size / 2 + 2)
  context.beginPath()
  context.arc(size / 2, size / 2, size / 2 - 6, 0, Math.PI * 2)
  context.strokeStyle = "#f5c242"
  context.lineWidth = 12
  context.stroke()
  return canvas.toDataURL("image/png")
}

async function circlePortrait(src: string | undefined, name: string) {
  const size = 360
  const fallback = drawInitials(size, name)
  if (!src) return fallback
  const image = await loadImage(src)
  if (!image) return fallback
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext("2d")
  if (!context) return fallback
  context.beginPath()
  context.arc(size / 2, size / 2, size / 2 - 10, 0, Math.PI * 2)
  context.closePath()
  context.save()
  context.clip()
  const scale = Math.max(size / image.width, size / image.height)
  const width = image.width * scale
  const height = image.height * scale
  context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height)
  context.restore()
  context.beginPath()
  context.arc(size / 2, size / 2, size / 2 - 6, 0, Math.PI * 2)
  context.strokeStyle = "#f5c242"
  context.lineWidth = 12
  context.stroke()
  try {
    return canvas.toDataURL("image/png")
  } catch {
    return fallback
  }
}

async function loadLogo(src: string): Promise<LoadedImage | null> {
  const image = await loadImage(src)
  if (!image) return null
  const canvas = document.createElement("canvas")
  canvas.width = image.width
  canvas.height = image.height
  const context = canvas.getContext("2d")
  if (!context) return null
  context.drawImage(image, 0, 0)
  try {
    return { data: canvas.toDataURL("image/png"), width: image.width, height: image.height }
  } catch {
    return null
  }
}

function fit(image: LoadedImage, maxWidth: number, maxHeight: number) {
  const ratio = image.width / image.height
  let width = maxWidth
  let height = width / ratio
  if (height > maxHeight) {
    height = maxHeight
    width = height * ratio
  }
  return { width, height }
}

function electedPeople(positions: PosterPosition[]) {
  return [...positions]
    .sort((left, right) => (left.order ?? 0) - (right.order ?? 0))
    .map((position) => ({
      title: position.title,
      winners: position.candidates.filter((candidate) => candidate.isWinner && candidate.votes > 0),
    }))
    .filter((position) => position.winners.length > 0)
}

function drawFooter(doc: jsPDF) {
  doc.setFillColor(...GOLD)
  doc.rect(0, PAGE_H - FOOTER_H - 1.6, PAGE_W, 1.6, "F")
  doc.setFillColor(...NAVY)
  doc.rect(0, PAGE_H - FOOTER_H, PAGE_W, FOOTER_H, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.setTextColor(255, 255, 255)
  doc.text("SEE-Evote", 14, PAGE_H - 16)
  doc.setFont("helvetica", "italic")
  doc.setFontSize(9)
  doc.setTextColor(...GOLD)
  doc.text(SLOGAN, 14, PAGE_H - 9)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.text(CONTACT, PAGE_W - 14, PAGE_H - 12, { align: "right" })
}

function drawPerson(doc: jsPDF, person: Person, x: number, y: number, diameter: number) {
  doc.addImage(person.portrait, "PNG", x, y, diameter, diameter)
  const center = x + diameter / 2
  const textWidth = diameter + 8
  let textY = y + diameter + 5
  doc.setFont("helvetica", "bold")
  doc.setFontSize(diameter > 34 ? 11 : 8)
  doc.setTextColor(...INK)
  const nameLines = doc.splitTextToSize(person.name, textWidth).slice(0, 2) as string[]
  nameLines.forEach((line) => {
    doc.text(line, center, textY, { align: "center" })
    textY += diameter > 34 ? 4.4 : 3.3
  })
  doc.setFontSize(diameter > 34 ? 8 : 6.5)
  doc.setTextColor(...CYAN)
  const roleLines = doc.splitTextToSize(person.role.toUpperCase(), textWidth).slice(0, diameter > 34 ? 2 : 1) as string[]
  roleLines.forEach((line) => {
    doc.text(line, center, textY, { align: "center" })
    textY += 3.1
  })
}

function rowHeight(diameter: number) {
  return diameter + 20
}

function drawRow(doc: jsPDF, people: Person[], y: number, diameter: number) {
  const gap = 8
  const total = people.length * diameter + Math.max(0, people.length - 1) * gap
  let x = (PAGE_W - total) / 2
  people.forEach((person) => {
    drawPerson(doc, person, x, y, diameter)
    x += diameter + gap
  })
  return y + rowHeight(diameter)
}

function drawDivider(doc: jsPDF, label: string, y: number) {
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(...INK)
  const width = doc.getTextWidth(label)
  doc.setDrawColor(...CYAN)
  doc.setLineWidth(0.35)
  doc.line(24, y, 105 - width / 2 - 4, y)
  doc.line(105 + width / 2 + 4, y, PAGE_W - 24, y)
  doc.text(label, 105, y + 1.2, { align: "center" })
  return y + 8
}

export async function downloadResultsPoster({
  electionTitle,
  organizationName,
  organizationLogo,
  positions,
}: {
  electionTitle: string
  organizationName?: string
  organizationLogo?: string
  positions: PosterPosition[]
}) {
  const ordered = electedPeople(positions)
  const featuredSource = ordered[0]
  const restSource = ordered.slice(1)
  const toPeople = async (title: string, winners: PosterCandidate[]): Promise<Person[]> =>
    Promise.all(
      winners.map(async (winner) => ({
        name: winner.name,
        role: title,
        portrait: await circlePortrait(winner.image, winner.name),
      })),
    )

  const [featured, rest, organisation, brand] = await Promise.all([
    featuredSource ? toPeople(featuredSource.title, featuredSource.winners) : Promise.resolve([] as Person[]),
    Promise.all(restSource.map((position) => toPeople(position.title, position.winners))).then((groups) => groups.flat()),
    organizationLogo ? loadLogo(organizationLogo) : Promise.resolve(null),
    loadLogo("/see-evote-logo-transparent.png"),
  ])

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  let pageOpen = false

  const openPage = (compact: boolean) => {
    if (pageOpen) {
      drawFooter(doc)
      doc.addPage()
    }
    pageOpen = true
    doc.setFillColor(255, 255, 255)
    doc.rect(0, 0, PAGE_W, PAGE_H, "F")

    if (organisation) {
      const box = fit(organisation, 32, 20)
      doc.addImage(organisation.data, "PNG", 14, 12, box.width, box.height)
    } else if (organizationName) {
      doc.setFont("helvetica", "bold")
      doc.setFontSize(9)
      doc.setTextColor(...CYAN)
      const lines = doc.splitTextToSize(organizationName, 46) as string[]
      lines.slice(0, 3).forEach((line, index) => doc.text(line, 14, 16 + index * 4))
    }

    if (brand) {
      const box = fit(brand, 52, 18)
      doc.addImage(brand.data, "PNG", PAGE_W - 14 - box.width, 12, box.width, box.height)
    }

    if (compact) {
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.setTextColor(...INK)
      const lines = doc.splitTextToSize(electionTitle.toUpperCase(), 120) as string[]
      doc.text(lines[0] || electionTitle, 105, 38, { align: "center" })
      return 48
    }

    let y = 42
    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.setTextColor(...INK)
    const titleLines = doc.splitTextToSize(electionTitle.toUpperCase(), 160) as string[]
    titleLines.slice(0, 3).forEach((line) => {
      doc.text(line, 105, y, { align: "center" })
      y += 8
    })
    if (organizationName) {
      doc.setFontSize(10)
      doc.setTextColor(...CYAN)
      doc.text(organizationName.toUpperCase(), 105, y, { align: "center" })
      y += 6
    }
    doc.setDrawColor(...GOLD)
    doc.setLineWidth(0.8)
    doc.line(78, y, 132, y)
    return y + 10
  }

  let y = openPage(false)
  const continuePage = (needed: number) => {
    if (y + needed <= CONTENT_BOTTOM) return
    y = openPage(true)
  }

  if (featured.length === 0 && rest.length === 0) {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)
    doc.setTextColor(...INK)
    doc.text("Winners will appear here once votes have been cast.", 105, y + 20, { align: "center" })
    drawFooter(doc)
    const emptyName = electionTitle.replace(/[^\w\s-]/g, "").trim() || "election-results"
    doc.save(`${emptyName}-results.pdf`)
    return
  }

  if (featured.length > 0) {
    const diameter = featured.length === 1 ? 42 : 32
    continuePage(rowHeight(diameter))
    y = drawRow(doc, featured, y, diameter)
  }

  if (rest.length > 0) {
    const lead = rest.slice(0, 5)
    const members = rest.slice(5)
    continuePage(rowHeight(28))
    y = drawRow(doc, lead, y, 28)
    if (members.length > 0) {
      continuePage(12)
      y = drawDivider(doc, "ELECTED MEMBERS", y)
      for (let index = 0; index < members.length; index += 5) {
        const row = members.slice(index, index + 5)
        continuePage(rowHeight(24))
        y = drawRow(doc, row, y, 24)
      }
    }
  }

  drawFooter(doc)
  const fileName = electionTitle.replace(/[^\w\s-]/g, "").trim() || "election-results"
  doc.save(`${fileName}-results.pdf`)
}
