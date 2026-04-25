"use client"

import { motion } from "framer-motion"
import { FileText } from "lucide-react"

export function DocumentList({ papers, analysis }) {
  if (!papers?.length) return null

  const matchedQuestions = analysis?.matchedQuestions || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mt-10"
    >
      <h3 className="mb-4 font-serif text-xl font-medium text-foreground">
        Analyzed Documents
      </h3>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-muted-foreground">
                Document
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-muted-foreground">
                Year
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-muted-foreground">
                Questions
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wide text-muted-foreground">
                Chapters
              </th>
            </tr>
          </thead>
          <tbody>
            {papers.map((paper, i) => {
              const paperQuestions = matchedQuestions.filter(
                (q) => q.source === paper.filename
              )
              const coveredChapters = [
                ...new Set(paperQuestions.map((q) => q.chapterNumber)),
              ].sort()

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
                      <span className="text-sm text-foreground">{paper.filename}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {paperQuestions[0]?.year || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {paperQuestions.length || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {coveredChapters.length > 0
                        ? coveredChapters.map((ch) => (
                            <span
                              key={ch}
                              className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                            >
                              Ch {ch}
                            </span>
                          ))
                        : "—"}
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
