"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, FileText } from "lucide-react"

export function ReferencePanel({ data, chapters, onClose }) {
  const chapterName = chapters?.find(
    (c) => c.chapterNumber === data?.chapter
  )?.chapterName || `Chapter ${data?.chapter}`

  return (
    <AnimatePresence>
      {data && (
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
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-border bg-card shadow-xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4">
              <div>
                <h3 className="font-serif text-lg font-medium text-foreground">
                  {chapterName}
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

            <div className="p-6">
              <div className="space-y-4">
                {data.questions.map((q, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-lg border border-border bg-background p-4"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                      <span className="text-xs font-medium text-muted-foreground">
                        {q.source || "Unknown source"}
                      </span>
                      {q.year && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                          {q.year}
                        </span>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-foreground">{q.question}</p>
                    <div className="mt-2 flex gap-2">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        {q.type || "Unknown type"}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                        Ch {q.chapterNumber}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
