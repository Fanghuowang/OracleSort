"use client"

import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Plus, X, FolderOpen, BookOpen, FileText, Trash2, ChevronRight } from "lucide-react"
import { ThemeProvider } from "@/components/theme-provider"
import { FloatingShapes } from "@/components/floating-shapes"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ProcessingOverlay } from "@/components/processing-overlay"
import { Footer } from "@/components/footer"
import { Dashboard } from "@/components/Dashboard"
import { Predictions } from "@/components/Predictions"
import { ReferencePanel } from "@/components/ReferencePanel"
import { DocumentList } from "@/components/DocumentList"
import { ChapterGrid } from "@/components/ChapterGrid"
import { ExportModal } from "@/components/ExportModal"
import { ChatBox } from "@/components/ChatBox"
import { LoadingOverlay } from "@/components/LoadingOverlay"
import { UploadCard } from "@/components/upload-card"
import {
  getSubjects,
  saveSubject,
  deleteSubject,
  getCurrentSubject,
  setCurrentSubject,
  updateSubject,
} from "@/lib/storage"
import { extractPDFText } from "@/lib/pdf"
import { extractChapters, matchQuestionsToChapters, generatePredictions } from "@/lib/api"

function OracleSortApp() {
  const [subjects, setSubjects] = useState([])
  const [currentSubject, setCurrentSubjectState] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState("")
  const [lectureFile, setLectureFile] = useState(null)
  const [questionsFile, setQuestionsFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzeStep, setAnalyzeStep] = useState(0)
  const [showDashboard, setShowDashboard] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportMode, setExportMode] = useState("separate")
  const [referenceData, setReferenceData] = useState<{ chapter: number; questions: import("@/lib/api").MatchedQuestion[] } | null>(null)
  const [processingStatus, setProcessingStatus] = useState("")

  useEffect(() => {
    const loaded = getSubjects()
    setSubjects(loaded)
    const current = getCurrentSubject()
    if (current) {
      setCurrentSubjectState(current)
      if (current.analysis) setShowDashboard(true)
    }
  }, [])

  const refreshSubjects = useCallback(() => {
    const loaded = getSubjects()
    setSubjects(loaded)
    if (currentSubject) {
      const fresh = loaded.find((s) => s.id === currentSubject.id)
      setCurrentSubjectState(fresh || null)
      if (fresh?.analysis) setShowDashboard(true)
    }
  }, [currentSubject])

  const handleCreateSubject = useCallback(() => {
    if (!newSubjectName.trim()) return
    const subject = saveSubject({ name: newSubjectName.trim() })
    setCurrentSubject(subject.id)
    setSubjects(getSubjects())
    setCurrentSubjectState(subject)
    setNewSubjectName("")
    setShowCreateModal(false)
  }, [newSubjectName])

  const handleSelectSubject = useCallback((subject) => {
    setCurrentSubject(subject.id)
    setCurrentSubjectState(subject)
    setShowDashboard(!!subject.analysis)
  }, [])

  const handleDeleteSubject = useCallback(
    (id) => {
      const remaining = deleteSubject(id)
      setSubjects(remaining)
      if (currentSubject?.id === id) {
        setCurrentSubjectState(null)
        setShowDashboard(false)
      }
    },
    [currentSubject]
  )

  const handleLectureUpload = useCallback(
    async (file) => {
      if (!currentSubject || !file) return
      const lectureEntry = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        filename: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        status: "Processing" as const,
        extractedText: "",
      }
      const updated = updateSubject(currentSubject.id, {
        lectures: [...(currentSubject.lectures || []), lectureEntry],
      })
      setCurrentSubjectState(updated)
      setSubjects(getSubjects())

      try {
        const text = await extractPDFText(file)
        const fresh = getSubjects().find((s) => s.id === currentSubject.id)
        if (!fresh) return
        const existingLectures = fresh.lectures
          .filter((l) => l.id !== lectureEntry.id && l.extractedText)
          .map((l) => ({ filename: l.filename, extractedText: l.extractedText }))
        const chapters = await extractChapters(text, file.name, existingLectures)
        const freshAgain = getSubjects().find((s) => s.id === currentSubject.id)
        if (!freshAgain) return
        const finalLectures = freshAgain.lectures.map((l) =>
          l.id === lectureEntry.id ? { ...l, status: "Processed" as const, extractedText: text } : l
        )
        const finalUpdated = updateSubject(currentSubject.id, {
          lectures: finalLectures,
          chapters: chapters.length > 0 ? chapters : freshAgain.chapters || [],
        })
        setCurrentSubjectState(finalUpdated)
        setSubjects(getSubjects())
      } catch {
        const fresh = getSubjects().find((s) => s.id === currentSubject.id)
        if (!fresh) return
        const finalLectures = fresh.lectures.map((l) =>
          l.id === lectureEntry.id ? { ...l, status: "Failed" as const } : l
        )
        const finalUpdated = updateSubject(currentSubject.id, { lectures: finalLectures })
        setCurrentSubjectState(finalUpdated)
        setSubjects(getSubjects())
      }
    },
    [currentSubject]
  )

  const handleBatchLectureUpload = useCallback(
    async (files: File[]) => {
      if (!currentSubject || files.length === 0) return
      const entries = files.map((file) => ({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        filename: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        status: "Processing" as const,
        extractedText: "",
      }))
      const updated = updateSubject(currentSubject.id, {
        lectures: [...(currentSubject.lectures || []), ...entries],
      })
      setCurrentSubjectState(updated)
      setSubjects(getSubjects())

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const entryId = entries[i].id
        try {
          const text = await extractPDFText(file)
          const fresh = getSubjects().find((s) => s.id === currentSubject.id)
          if (!fresh) break
          const existingLectures = fresh.lectures
            .filter((l) => l.id !== entryId && l.extractedText)
            .map((l) => ({ filename: l.filename, extractedText: l.extractedText }))
          const chapters = await extractChapters(text, file.name, existingLectures)
          const newLectures = fresh.lectures.map((l) =>
            l.id === entryId ? { ...l, status: "Processed" as const, extractedText: text } : l
          )
          const finalUpdated = updateSubject(currentSubject.id, {
            lectures: newLectures,
            chapters: chapters.length > 0 ? chapters : fresh.chapters || [],
          })
          setCurrentSubjectState(finalUpdated)
          setSubjects(getSubjects())
        } catch {
          const fresh = getSubjects().find((s) => s.id === currentSubject.id)
          if (!fresh) break
          const newLectures = fresh.lectures.map((l) =>
            l.id === entryId ? { ...l, status: "Failed" as const } : l
          )
          const finalUpdated = updateSubject(currentSubject.id, { lectures: newLectures })
          setCurrentSubjectState(finalUpdated)
          setSubjects(getSubjects())
        }
      }
    },
    [currentSubject]
  )

  const handlePaperUpload = useCallback(
    async (file) => {
      if (!currentSubject || !file) return
      const paperEntry = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
        filename: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        status: "Processing" as const,
        extractedText: "",
      }
      const updated = updateSubject(currentSubject.id, {
        papers: [...(currentSubject.papers || []), paperEntry],
      })
      setCurrentSubjectState(updated)
      setSubjects(getSubjects())

      try {
        const text = await extractPDFText(file)
        const fresh = getSubjects().find((s) => s.id === currentSubject.id)
        if (!fresh) return
        const newPapers = fresh.papers.map((p) =>
          p.id === paperEntry.id ? { ...p, extractedText: text, status: "Ready" as const } : p
        )
        const finalUpdated = updateSubject(currentSubject.id, { papers: newPapers })
        setCurrentSubjectState(finalUpdated)
        setSubjects(getSubjects())
      } catch {
        const fresh = getSubjects().find((s) => s.id === currentSubject.id)
        if (!fresh) return
        const newPapers = fresh.papers.map((p) =>
          p.id === paperEntry.id ? { ...p, status: "Failed" as const } : p
        )
        const finalUpdated = updateSubject(currentSubject.id, { papers: newPapers })
        setCurrentSubjectState(finalUpdated)
        setSubjects(getSubjects())
      }
    },
    [currentSubject]
  )

  const handleBatchPaperUpload = useCallback(
    async (files: File[]) => {
      if (!currentSubject || files.length === 0) return
      const newPapers = files.map((file) => ({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
        filename: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        status: "Processing" as const,
        extractedText: "",
      }))
      const updated = updateSubject(currentSubject.id, {
        papers: [...(currentSubject.papers || []), ...newPapers],
      })
      setCurrentSubjectState(updated)
      setSubjects(getSubjects())

      for (let i = 0; i < files.length; i++) {
        try {
          const text = await extractPDFText(files[i])
          const fresh = getSubjects().find((s) => s.id === currentSubject.id)
          if (!fresh) break
          const newPaperList = fresh.papers.map((p) =>
            p.id === newPapers[i].id ? { ...p, extractedText: text, status: "Ready" as const } : p
          )
          const finalUpdated = updateSubject(currentSubject.id, { papers: newPaperList })
          setCurrentSubjectState(finalUpdated)
          setSubjects(getSubjects())
        } catch {
          const fresh = getSubjects().find((s) => s.id === currentSubject.id)
          if (!fresh) break
          const newPaperList = fresh.papers.map((p) =>
            p.id === newPapers[i].id ? { ...p, status: "Failed" as const } : p
          )
          const finalUpdated = updateSubject(currentSubject.id, { papers: newPaperList })
          setCurrentSubjectState(finalUpdated)
          setSubjects(getSubjects())
        }
      }
    },
    [currentSubject]
  )

  const handleAnalyzeAll = useCallback(async () => {
    const fresh = getSubjects().find((s) => s.id === currentSubject?.id)
    if (!fresh?.papers?.length || !fresh?.chapters?.length) return
    setIsAnalyzing(true)
    setAnalyzeStep(0)

    let matchResult: import("@/lib/api").MatchResult | null = null
    let predictions: import("@/lib/api").PredictionResult | null = null

    try {
      // Step 1: Extracting — gather text from all papers
      setAnalyzeStep(0)
      const allQuestionsText = fresh.papers
        .map((p) => `--- From: ${p.filename} ---\n${(p.extractedText || "").slice(0, 4000)}`)
        .join("\n\n")

      if (!allQuestionsText.trim()) {
        setIsAnalyzing(false)
        return
      }

      // Step 2: Matching — match questions to chapters
      setAnalyzeStep(1)
      try {
        matchResult = await matchQuestionsToChapters(allQuestionsText, fresh.chapters)
      } catch {
        // Matching step failed — continue with empty results
      }

      // Step 3: Analyzing — generate predictions
      setAnalyzeStep(2)
      if (matchResult) {
        try {
          predictions = await generatePredictions(matchResult)
        } catch {
          // Predictions step failed — continue without predictions
        }
      }

      // Step 4: Generating — save results (even if partial)
      setAnalyzeStep(3)
      const analysisData = {
        matchedQuestions: matchResult?.matchedQuestions || [],
        chapterCounts: matchResult?.chapterCounts || {},
        predictions,
      }

      const latest = getSubjects().find((s) => s.id === fresh.id)
      const updated = updateSubject(fresh.id, {
        analysis: analysisData,
        papers: (latest || fresh).papers.map((p) => ({ ...p, status: "Analyzed" as const })),
      })
      setCurrentSubjectState(updated)
      setSubjects(getSubjects())

      await new Promise((r) => setTimeout(r, 800))
      setIsAnalyzing(false)
      setShowDashboard(true)
    } catch {
      // Save partial results even on failure
      if (matchResult || predictions) {
        const latest = getSubjects().find((s) => s.id === fresh.id)
        const updated = updateSubject(fresh.id, {
          analysis: {
            matchedQuestions: matchResult?.matchedQuestions || [],
            chapterCounts: matchResult?.chapterCounts || {},
            predictions,
          },
          papers: (latest || fresh).papers.map((p) => ({ ...p, status: "Analyzed" as const })),
        })
        setCurrentSubjectState(updated)
        setSubjects(getSubjects())
        setShowDashboard(true)
      }
      setIsAnalyzing(false)
    }
  }, [currentSubject])

  const handleDeleteLecture = useCallback(
    (lectureId: string) => {
      if (!currentSubject) return
      const updated = updateSubject(currentSubject.id, {
        lectures: currentSubject.lectures.filter((l) => l.id !== lectureId),
      })
      setCurrentSubjectState(updated)
      setSubjects(getSubjects())
    },
    [currentSubject]
  )

  const handleDeletePaper = useCallback(
    (paperId: string) => {
      if (!currentSubject) return
      const updated = updateSubject(currentSubject.id, {
        papers: currentSubject.papers.filter((p) => p.id !== paperId),
      })
      setCurrentSubjectState(updated)
      setSubjects(getSubjects())
    },
    [currentSubject]
  )

  const handleReset = useCallback(() => {
    setLectureFile(null)
    setQuestionsFile(null)
    setIsProcessing(false)
    setShowDashboard(false)
  }, [])

  const hasPapers = currentSubject?.papers?.length > 0
  const hasChapters = currentSubject?.chapters?.length > 0
  const canAnalyze = hasPapers && hasChapters && !isAnalyzing

  return (
    <div className="relative min-h-screen">
      <div className="grain-overlay" />
      <FloatingShapes />

      <Header
        onReset={handleReset}
        showReset={!!currentSubject && (showDashboard || hasPapers)}
      />

      <main className="relative z-10">
        <HeroSection />

        {/* Subject bar */}
        <section className="px-6 pb-4 md:px-12">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-medium tracking-tight text-foreground">
                Subjects
              </h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium tracking-wide text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
                Create Subject
              </button>
            </div>

            {subjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
                <FolderOpen className="h-10 w-10 text-muted-foreground/40" strokeWidth={1.5} />
                <p className="mt-3 text-sm text-muted-foreground">Create your first subject</p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  Organize your study materials by subject
                </p>
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {subjects.map((subject, i) => {
                  const isActive = currentSubject?.id === subject.id
                  return (
                    <motion.div
                      key={subject.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`group relative flex-shrink-0 cursor-pointer rounded-xl border px-4 py-3 transition-all ${
                        isActive
                          ? "border-primary/40 bg-accent shadow-sm"
                          : "border-border bg-card hover:border-muted-foreground/30"
                      }`}
                      onClick={() => handleSelectSubject(subject)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <BookOpen className="h-4 w-4" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{subject.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {subject.lectures?.length || 0} lectures · {subject.papers?.length || 0}{" "}
                            papers
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteSubject(subject.id)
                        }}
                        className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive/10 text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* Upload section - only show when subject selected and no dashboard */}
        {currentSubject && !showDashboard && (
          <section className="px-6 pb-12 md:px-12">
            <div className="mx-auto max-w-4xl">
              <div className="mb-4 flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{currentSubject.name}</span>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <UploadCard
                    type="lecture"
                    file={lectureFile}
                    onFileChange={(file) => {
                      setLectureFile(file)
                      if (file) handleLectureUpload(file)
                    }}
                    onFilesChange={(files) => {
                      handleBatchLectureUpload(files)
                    }}
                    index={0}
                  />
                  {/* Uploaded lectures list */}
                  {currentSubject.lectures?.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {currentSubject.lectures.map((lec) => (
                        <div
                          key={lec.id}
                          className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
                        >
                          <FileText className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-xs font-medium text-foreground">
                              {lec.filename}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(lec.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              lec.status === "Processed"
                                ? "bg-primary/10 text-primary"
                                : lec.status === "Failed"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-muted text-muted-foreground subtle-pulse"
                            }`}
                          >
                            {lec.status}
                          </span>
                          <button
                            onClick={() => handleDeleteLecture(lec.id)}
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <UploadCard
                    type="questions"
                    file={questionsFile}
                    onFileChange={(file) => {
                      setQuestionsFile(file)
                      if (file) handlePaperUpload(file)
                    }}
                    onFilesChange={(files) => {
                      handleBatchPaperUpload(files)
                    }}
                    index={1}
                  />
                  {/* Uploaded papers list */}
                  {currentSubject.papers?.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {currentSubject.papers.map((paper) => (
                        <div
                          key={paper.id}
                          className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
                        >
                          <FileText className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-xs font-medium text-foreground">
                              {paper.filename}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(paper.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              paper.status === "Analyzed"
                                ? "bg-primary/10 text-primary"
                                : paper.status === "Ready"
                                ? "bg-primary/10 text-primary"
                                : paper.status === "Failed"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-muted text-muted-foreground subtle-pulse"
                            }`}
                          >
                            {paper.status}
                          </span>
                          <button
                            onClick={() => handleDeletePaper(paper.id)}
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Analyze button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-12 flex flex-col items-center gap-3"
              >
                <motion.button
                  onClick={handleAnalyzeAll}
                  disabled={!canAnalyze}
                  whileHover={canAnalyze ? { scale: 1.02, y: -2 } : {}}
                  whileTap={canAnalyze ? { scale: 0.98 } : {}}
                  className={`group relative flex items-center gap-3 rounded-full border px-8 py-4 text-sm font-medium tracking-wide transition-all duration-300 ${
                    canAnalyze
                      ? "border-primary bg-primary text-primary-foreground shadow-lg hover:shadow-xl"
                      : "border-border bg-muted text-muted-foreground opacity-60"
                  }`}
                >
                  <Sparkles
                    className={`h-4 w-4 transition-transform duration-300 ${
                      canAnalyze ? "group-hover:rotate-12" : ""
                    }`}
                  />
                  <span>Analyze All Papers</span>
                  {canAnalyze && (
                    <div className="absolute inset-0 -z-10 rounded-full bg-primary/20 blur-xl transition-opacity group-hover:opacity-100 opacity-0" />
                  )}
                </motion.button>

                <p className="text-xs text-muted-foreground">
                  {!currentSubject.chapters?.length
                    ? "Upload lecture materials first to detect chapters"
                    : !hasPapers
                    ? "Upload past year papers to begin analysis"
                    : "Ready to analyze your materials"}
                </p>
              </motion.div>
            </div>
          </section>
        )}

        {/* Empty state when no subject selected */}
        {!currentSubject && subjects.length > 0 && (
          <section className="px-6 pb-12 md:px-12">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm text-muted-foreground">
                Select a subject above or create a new one to get started
              </p>
            </div>
          </section>
        )}

        {/* Dashboard section */}
        {showDashboard && currentSubject?.analysis && (
          <section className="px-6 pb-12 md:px-12">
            <div className="mx-auto max-w-5xl">
              <Dashboard
                analysis={currentSubject.analysis}
                chapters={currentSubject.chapters}
                subjectName={currentSubject.name}
                onBarClick={(chapterNum) => {
                  const matched = currentSubject.analysis.matchedQuestions?.filter(
                    (q) => q.chapterNumber === chapterNum
                  )
                  if (matched?.length) {
                    setReferenceData({ chapter: chapterNum, questions: matched })
                  }
                }}
              />

              <ChapterGrid
                chapters={currentSubject.chapters}
                analysis={currentSubject.analysis}
                onViewQuestions={(chapterNum) => {
                  const matched = currentSubject.analysis.matchedQuestions?.filter(
                    (q) => q.chapterNumber === chapterNum
                  )
                  if (matched?.length) {
                    setReferenceData({ chapter: chapterNum, questions: matched })
                  }
                }}
              />

              <Predictions predictions={currentSubject.analysis.predictions} />

              <DocumentList
                papers={currentSubject.papers}
                analysis={currentSubject.analysis}
              />

              {/* Export buttons */}
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => {
                    setExportMode("separate")
                    setShowExportModal(true)
                  }}
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <FileText className="h-4 w-4" strokeWidth={1.5} />
                  Export Separate PDFs by Chapter
                </button>
                <button
                  onClick={() => {
                    setExportMode("combined")
                    setShowExportModal(true)
                  }}
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <FileText className="h-4 w-4" strokeWidth={1.5} />
                  Export Combined PDF
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Reference panel */}
        <ReferencePanel
          data={referenceData}
          chapters={currentSubject?.chapters || []}
          onClose={() => setReferenceData(null)}
        />
      </main>

      <Footer />

      {/* Processing overlay (legacy for single file) */}
      <ProcessingOverlay
        isVisible={isProcessing}
        onComplete={() => {
          setIsProcessing(false)
        }}
      />

      {/* Analysis loading overlay */}
      <LoadingOverlay
        isVisible={isAnalyzing}
        currentStep={analyzeStep}
        steps={["Extracting Text", "Matching Questions", "Analyzing Patterns", "Generating Predictions"]}
      />

      {/* Create subject modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          >
            <div className="absolute inset-0 bg-background/70" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-serif text-lg font-medium text-foreground">
                  Create New Subject
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <input
                type="text"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateSubject()}
                placeholder="e.g. Data Structures, Organic Chemistry..."
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />

              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSubject}
                  disabled={!newSubjectName.trim()}
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export modal */}
      {showExportModal && currentSubject && (
        <ExportModal
          mode={exportMode}
          chapters={currentSubject.chapters || []}
          analysis={currentSubject.analysis}
          subjectName={currentSubject.name}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Chat box */}
      <ChatBox
        subject={currentSubject}
        disabled={!showDashboard}
      />
    </div>
  )
}

export default function Page() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <OracleSortApp />
    </ThemeProvider>
  )
}
