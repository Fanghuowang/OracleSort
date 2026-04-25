const DEFAULT_BASE_URL = "https://api.ilmu.ai/anthropic"
const DEFAULT_MODEL = "ilmu-glm-5.1"

function getConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_AUTH_TOKEN || "",
    baseUrl: process.env.NEXT_PUBLIC_ANTHROPIC_BASE_URL || DEFAULT_BASE_URL,
    model: process.env.NEXT_PUBLIC_ANTHROPIC_MODEL || DEFAULT_MODEL,
  }
}

export async function callILMU(messages) {
  const { apiKey, baseUrl, model } = getConfig()

  if (!apiKey) {
    throw new Error("API key not configured. Set NEXT_PUBLIC_ANTHROPIC_AUTH_TOKEN in .env.local")
  }

  const res = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages,
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error")
    throw new Error(`API error (${res.status}): ${text}`)
  }

  const data = await res.json()
  return data.content?.[0]?.text || ""
}

export async function extractChapters(text, apiKey) {
  const messages = [
    {
      role: "user",
      content: `Analyze the following lecture material and identify all chapters/units/topics. Return a JSON array of objects with "chapterNumber" (integer) and "chapterName" (string) fields only. No explanation, just the JSON array.\n\nLecture content:\n${text.slice(0, 30000)}`,
    },
  ]

  const response = await callILMU(messages)
  try {
    const match = response.match(/\[[\s\S]*\]/)
    if (match) return JSON.parse(match[0])
  } catch {}
  return []
}

export async function matchQuestionsToChapters(questionsText, chapterData, apiKey) {
  const chapterList = chapterData.map((c) => `Chapter ${c.chapterNumber}: ${c.chapterName}`).join("\n")

  const messages = [
    {
      role: "user",
      content: `You are an exam analysis assistant. Given past exam questions and a list of chapters, match each question to its relevant chapter and classify it.

Chapters:
${chapterList}

Questions:
${questionsText.slice(0, 30000)}

Return a JSON object with this exact structure:
{
  "matchedQuestions": [
    {
      "question": "the question text",
      "chapter": "Chapter Name",
      "chapterNumber": 1,
      "type": "MCQ|Short Answer|Essay|True/False",
      "year": "extracted year or null",
      "source": "document name if identifiable"
    }
  ],
  "chapterFrequency": {
    "1": 5,
    "2": 3
  },
  "summary": {
    "totalQuestions": 10,
    "chaptersCovered": 5,
    "papersAnalyzed": 1
  }
}

Return ONLY the JSON, no explanation.`,
    },
  ]

  const response = await callILMU(messages)
  try {
    const match = response.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
  } catch {}
  return null
}

export async function generatePredictions(analysisData, apiKey) {
  const messages = [
    {
      role: "user",
      content: `Based on the following exam analysis data, generate predictions for the upcoming exam.

Analysis data:
${JSON.stringify(analysisData, null, 2).slice(0, 20000)}

Return a JSON object with this exact structure:
{
  "highPriority": [
    {
      "chapter": "Chapter Name",
      "chapterNumber": 1,
      "occurrence": 85,
      "predictedType": "Essay",
      "reasoning": "This chapter appeared in 85% of past papers..."
    }
  ],
  "mediumPriority": [...],
  "lowPriority": [...],
  "overallInsight": "Brief overall exam prediction summary"
}

Return ONLY the JSON, no explanation.`,
    },
  ]

  const response = await callILMU(messages)
  try {
    const match = response.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
  } catch {}
  return null
}
