"use client"

import { motion } from "framer-motion"
import { BookOpen } from "lucide-react"

export function ChapterGrid({ chapters, analysis, onViewQuestions }) {
  if (!chapters?.length) return null

  const chapterFrequency = analysis?.chapterFrequency || {}
  const totalQuestions = analysis?.summary?.totalQuestions || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="mt-10"
    >
      <h3 className="mb-4 font-serif text-xl font-medium text-foreground">
        Chapters Overview
      </h3>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {chapters.map((chapter, i) => {
          const count = chapterFrequency[chapter.chapterNumber] || 0
          const percentage = totalQuestions > 0 ? Math.round((count / totalQuestions) * 100) : 0

          return (
            <motion.div
              key={chapter.chapterNumber}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-sm"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <BookOpen className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    Ch {chapter.chapterNumber}: {chapter.chapterName}
                  </p>
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-medium text-foreground">{count}</p>
                  <p className="text-xs text-muted-foreground">
                    {percentage}% of total
                  </p>
                </div>

                {count > 0 && (
                  <button
                    onClick={() => onViewQuestions?.(chapter.chapterNumber)}
                    className="rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    View Questions
                  </button>
                )}
              </div>

              {/* Mini bar */}
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary/50 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
