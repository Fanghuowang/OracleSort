const SUBJECTS_KEY = "examprep_subjects"
const CURRENT_SUBJECT_KEY = "examprep_current_subject"

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function getSubjects() {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(SUBJECTS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveSubject(subject) {
  const subjects = getSubjects()
  const existing = subjects.findIndex((s) => s.id === subject.id)
  if (existing >= 0) {
    subjects[existing] = subject
  } else {
    subject.id = subject.id || generateId()
    subject.createdAt = subject.createdAt || new Date().toISOString()
    subject.lectures = subject.lectures || []
    subject.papers = subject.papers || []
    subject.chapters = subject.chapters || []
    subject.analysis = subject.analysis || null
    subjects.push(subject)
  }
  localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects))
  return subject
}

export function deleteSubject(id) {
  const subjects = getSubjects().filter((s) => s.id !== id)
  localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects))
  if (getCurrentSubjectId() === id) {
    localStorage.removeItem(CURRENT_SUBJECT_KEY)
  }
  return subjects
}

export function updateSubject(id, data) {
  const subjects = getSubjects()
  const index = subjects.findIndex((s) => s.id === id)
  if (index < 0) return null
  subjects[index] = { ...subjects[index], ...data, id, updatedAt: new Date().toISOString() }
  localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects))
  return subjects[index]
}

export function getSubjectById(id) {
  return getSubjects().find((s) => s.id === id) || null
}

export function getCurrentSubjectId() {
  if (typeof window === "undefined") return null
  return localStorage.getItem(CURRENT_SUBJECT_KEY)
}

export function getCurrentSubject() {
  const id = getCurrentSubjectId()
  return id ? getSubjectById(id) : null
}

export function setCurrentSubject(id) {
  if (id) {
    localStorage.setItem(CURRENT_SUBJECT_KEY, id)
  } else {
    localStorage.removeItem(CURRENT_SUBJECT_KEY)
  }
}
