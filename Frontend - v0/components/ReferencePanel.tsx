"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, FileText } from "lucide-react"
import type { MatchedQuestion } from "@/lib/api"
import type { Chapter } from "@/lib/storage"

interface ReferencePanelProps {
  data: { chapter: number; questions: MatchedQuestion[] } | null
  chapters: Chapter[]
  onClose: () => void
}

export function ReferencePanel({ data, chapters, onClose }: ReferencePanelProps) {
  const chapterTitle = data
    ? chapters.find((c) => c.number === data.chapter)?.title || `Chapter ${data.chapter}`
    : ""

  return (
    <AnimatePresence>
      {data && data.questions.length > 0 && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-border bg-card shadow-xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4">
              <div>
                <h3 className="font-serif text-lg font-medium text-foreground">
                  Chapter {data.chapter}: {chapterTitle}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {data.questions.length} question{data.questions.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              {data.questions.map((q, i) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      {q.type === "mcq" ? "MCQ" : q.type === "essay" ? "Essay" : q.type === "image_based" ? "Image" : "Short Answer"}
                    </span>
                    {q.marks && (
                      <span className="text-[10px] text-muted-foreground">{q.marks} marks</span>
                    )}
                  </div>
                  <p className="text-sm text-foreground">{q.text}</p>
                  {q.options && q.options.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {q.options.map((opt, j) => (
                        <p key={j} className="text-xs text-muted-foreground pl-3">
                          {String.fromCharCode(65 + j)}. {opt}
                        </p>
                      ))}
                    </div>
                  )}
                  {q.imageDescription && (
                    <p className="mt-2 text-xs italic text-muted-foreground">
                      Image: {q.imageDescription}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2 border-t border-border pt-2">
                    <FileText className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
                    <span className="text-[10px] text-muted-foreground">{q.sourceDocument}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
