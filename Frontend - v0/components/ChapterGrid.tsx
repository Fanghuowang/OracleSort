"use client"

import { motion } from "framer-motion"
import { BookOpen } from "lucide-react"
import type { MatchedQuestion } from "@/lib/api"
import type { Chapter } from "@/lib/storage"

interface ChapterGridProps {
  chapters: Chapter[]
  analysis: {
    matchedQuestions?: MatchedQuestion[]
    chapterCounts?: Record<number, number>
  } | null
  onViewQuestions: (chapterNum: number) => void
}

export function ChapterGrid({ chapters, analysis, onViewQuestions }: ChapterGridProps) {
  if (!chapters.length) return null

  const chapterCounts = analysis?.chapterCounts || {}
  const totalQuestions = Object.values(chapterCounts).reduce((sum, c) => sum + c, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mt-8"
    >
      <h3 className="mb-4 font-serif text-lg font-medium text-foreground">Chapter Breakdown</h3>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {chapters.map((chapter, i) => {
          const count = chapterCounts[chapter.number] || 0
          const percentage = totalQuestions > 0 ? Math.round((count / totalQuestions) * 100) : 0

          return (
            <motion.div
              key={chapter.number}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
            >
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen className="h-4 w-4 text-primary" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Chapter {chapter.number}</p>
                  <p className="truncate text-sm font-medium text-foreground">{chapter.title}</p>
                </div>
              </div>

              <div className="mb-3">
                <p className="font-serif text-3xl font-medium text-foreground">{count}</p>
                <p className="text-xs text-muted-foreground">
                  {percentage}% of questions
                </p>
              </div>

              {/* Progress bar */}
              <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {count > 0 && (
                <button
                  onClick={() => onViewQuestions(chapter.number)}
                  className="w-full rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  View Questions
                </button>
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
