"use client"

import { motion } from "framer-motion"
import { FileText } from "lucide-react"
import type { MatchedQuestion } from "@/lib/api"
import type { Paper } from "@/lib/storage"

interface DocumentListProps {
  papers: Paper[]
  analysis: {
    matchedQuestions?: MatchedQuestion[]
    chapterCounts?: Record<number, number>
  } | null
}

export function DocumentList({ papers, analysis }: DocumentListProps) {
  const questions = analysis?.matchedQuestions || []
  const analyzedPapers = papers.filter((p) => p.status === "Analyzed")

  if (analyzedPapers.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-8"
    >
      <h3 className="mb-4 font-serif text-lg font-medium text-foreground">Analyzed Documents</h3>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-muted-foreground">Document</th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-muted-foreground">Questions</th>
              <th className="hidden px-4 py-3 text-left text-xs font-medium tracking-wide text-muted-foreground md:table-cell">Chapters</th>
            </tr>
          </thead>
          <tbody>
            {analyzedPapers.map((paper, i) => {
              const paperQuestions = questions.filter((q) => q.sourceDocument === paper.filename)
              const chapterNums = [...new Set(paperQuestions.map((q) => q.chapterNumber))].sort((a, b) => a - b)

              return (
                <motion.tr
                  key={paper.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                      <span className="max-w-[200px] truncate text-xs font-medium text-foreground">
                        {paper.filename}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground">{paperQuestions.length}</td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {chapterNums.map((num) => (
                        <span
                          key={num}
                          className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                        >
                          Ch {num}
                        </span>
                      ))}
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
