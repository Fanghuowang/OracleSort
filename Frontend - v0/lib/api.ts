import type { Chapter } from "./storage"

const PROXY_URL = "/api/proxy"

async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch(PROXY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      max_tokens: 4096,
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  })

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }

  const data = await res.json()

  if (data.error) {
    throw new Error(typeof data.error === "string" ? data.error : data.error.message || "API error")
  }

  const text = data.choices?.[0]?.message?.content
  if (!text) {
    throw new Error("API returned empty response")
  }

  return text
}

function parseJSON<T>(response: string): T | null {
  try {
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    return JSON.parse(cleaned)
  } catch {
    return null
  }
}

function parseChapters(response: string, fallbackFiles: string[] = []): Chapter[] {
  const parsed = parseJSON<unknown[]>(response)
  if (!Array.isArray(parsed)) return []
  return parsed.map((c: Record<string, unknown>, i: number) => ({
    number: typeof c.number === "number" ? c.number : i + 1,
    title: String(c.title || `Chapter ${i + 1}`),
    sourceFiles: Array.isArray(c.sourceFiles) ? c.sourceFiles : [...fallbackFiles],
  }))
}

interface ExistingLecture {
  filename: string
  extractedText?: string
}

export async function extractChapters(
  text: string,
  filename: string,
  existingLectures: ExistingLecture[] = []
): Promise<Chapter[]> {
  const hasMultipleFiles = existingLectures.length > 0

  const systemPrompt = `You detect lecture chapters from PDFs. Return ONLY a JSON array. Each element: {"number": int, "title": string, "sourceFiles": [string]}. No explanation, no markdown fences.

Rules: If multiple files, group related sub-chapters by filename+content. If one file with headings, extract them. If one file no headings, split into 3-8 thematic chapters.`

  let userPrompt: string

  if (hasMultipleFiles) {
    const fileList = [...existingLectures, { filename }].map((f) => f.filename).join(", ")
    const existingTexts = existingLectures
      .map((l) => `${l.filename}: ${(l.extractedText || "").slice(0, 2000)}`)
      .join("\n")
    userPrompt = `Files: ${fileList}\n\nNew file ${filename} content:\n${text.slice(0, 6000)}\n\nPrevious excerpts:\n${existingTexts}\n\nReturn JSON array of chapters.`
  } else {
    userPrompt = `Detect chapters in this lecture (${filename}):\n\n${text.slice(0, 8000)}\n\nReturn JSON array.`
  }

  const response = await callAI(systemPrompt, userPrompt)
  return parseChapters(response, [filename])
}

export interface MatchedQuestion {
  id: string
  text: string
  type: "mcq" | "short_answer" | "essay" | "image_based"
  options?: string[]
  imageDescription?: string
  chapterNumber: number
  sourceDocument: string
  marks?: number
}

export interface MatchResult {
  matchedQuestions: MatchedQuestion[]
  chapterCounts: Record<number, number>
}

export async function matchQuestionsToChapters(
  questionsText: string,
  chapters: { number: number; title: string }[]
): Promise<MatchResult | null> {
  const chapterList = chapters
    .map((c) => `${c.number}. ${c.title}`)
    .join("\n")

  const systemPrompt = `Extract exam questions and match each to a chapter. Return ONLY a JSON array. Each element: {"id":"q1","text":"question","type":"mcq|short_answer|essay|image_based","chapterNumber":1,"sourceDocument":"filename"}. For MCQs add "options":[]. No explanation, no markdown fences.`

  const userPrompt = `Chapters:\n${chapterList}\n\nPapers:\n${questionsText.slice(0, 8000)}\n\nExtract questions and match to chapters. Return JSON array.`

  const response = await callAI(systemPrompt, userPrompt)

  const parsed = parseJSON<unknown[]>(response)
  if (!Array.isArray(parsed)) return null

  const matchedQuestions: MatchedQuestion[] = parsed.map(
    (q: Record<string, unknown>, i: number) => ({
      id: String(q.id || `q${i + 1}`),
      text: String(q.text || ""),
      type: (["mcq", "short_answer", "essay", "image_based"].includes(q.type as string)
        ? q.type
        : "short_answer") as MatchedQuestion["type"],
      ...(Array.isArray(q.options) ? { options: q.options.map(String) } : {}),
      ...(q.imageDescription ? { imageDescription: String(q.imageDescription) } : {}),
      chapterNumber: typeof q.chapterNumber === "number" ? q.chapterNumber : 1,
      sourceDocument: String(q.sourceDocument || "Unknown"),
      ...(typeof q.marks === "number" ? { marks: q.marks } : {}),
    })
  )

  const chapterCounts: Record<number, number> = {}
  for (const q of matchedQuestions) {
    chapterCounts[q.chapterNumber] = (chapterCounts[q.chapterNumber] || 0) + 1
  }

  return { matchedQuestions, chapterCounts }
}

export interface Prediction {
  chapterNumber: number
  chapterTitle: string
  probability: number
  reason: string
}

export interface PredictionResult {
  predictions: Prediction[]
  summary: string
}

export async function generatePredictions(
  matchResult: MatchResult
): Promise<PredictionResult | null> {
  const chapterCounts = Object.entries(matchResult.chapterCounts)
    .map(([num, count]) => `Chapter ${num}: ${count} questions`)
    .join("\n")

  const systemPrompt = `Predict which chapters are most likely in the next exam. Return ONLY a JSON object: {"predictions":[{"chapterNumber":1,"chapterTitle":"name","probability":0.8,"reason":"why"}],"summary":"study advice"}. Sort by probability desc. No explanation, no markdown fences.`

  const userPrompt = `Question counts:\n${chapterCounts}\nTotal questions: ${matchResult.matchedQuestions.length}\n\nReturn predictions JSON.`

  const response = await callAI(systemPrompt, userPrompt)

  const parsed = parseJSON<{ predictions?: unknown[]; summary?: string }>(response)
  if (!parsed?.predictions || !Array.isArray(parsed.predictions)) return null

  return {
    predictions: parsed.predictions.map((p: Record<string, unknown>) => ({
      chapterNumber: typeof p.chapterNumber === "number" ? p.chapterNumber : 1,
      chapterTitle: String(p.chapterTitle || `Chapter ${p.chapterNumber}`),
      probability: typeof p.probability === "number" ? p.probability : 0.5,
      reason: String(p.reason || ""),
    })),
    summary: String(parsed.summary || ""),
  }
}
