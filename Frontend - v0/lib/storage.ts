const STORAGE_KEY = "examprep_subjects"
const CURRENT_KEY = "examprep_current_subject"

export interface Lecture {
  id: string
  filename: string
  size: number
  uploadedAt: string
  status: "Processing" | "Processed" | "Failed"
  extractedText?: string
}

export interface Paper {
  id: string
  filename: string
  size: number
  uploadedAt: string
  status: "Processing" | "Ready" | "Failed" | "Analyzed"
  extractedText?: string
}

export interface Chapter {
  number: number
  title: string
  sourceFiles: string[]
}

export interface Subject {
  id: string
  name: string
  lectures: Lecture[]
  papers: Paper[]
  chapters: Chapter[]
  analysis: Record<string, unknown> | null
}

function readSubjects(): Subject[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeSubjects(subjects: Subject[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects))
}

export function getSubjects(): Subject[] {
  return readSubjects()
}

export function saveSubject(data: { name: string }): Subject {
  const subjects = readSubjects()
  const subject: Subject = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    name: data.name,
    lectures: [],
    papers: [],
    chapters: [],
    analysis: null,
  }
  subjects.push(subject)
  writeSubjects(subjects)
  return subject
}

export function deleteSubject(id: string): Subject[] {
  const subjects = readSubjects().filter((s) => s.id !== id)
  writeSubjects(subjects)
  if (getCurrentSubjectId() === id) {
    localStorage.removeItem(CURRENT_KEY)
  }
  return subjects
}

export function updateSubject(
  id: string,
  updates: Partial<Omit<Subject, "id">>
): Subject {
  const subjects = readSubjects()
  const index = subjects.findIndex((s) => s.id === id)
  if (index === -1) throw new Error(`Subject ${id} not found`)
  subjects[index] = { ...subjects[index], ...updates }
  writeSubjects(subjects)
  return subjects[index]
}

function getCurrentSubjectId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(CURRENT_KEY)
}

export function getCurrentSubject(): Subject | null {
  const id = getCurrentSubjectId()
  if (!id) return null
  return readSubjects().find((s) => s.id === id) ?? null
}

export function setCurrentSubject(id: string): void {
  localStorage.setItem(CURRENT_KEY, id)
}
