"use client"

import { useCallback, useState } from "react"
import { motion } from "framer-motion"
import { Book, ClipboardList, FileText, X, Check } from "lucide-react"

interface UploadCardProps {
  type: "lecture" | "questions"
  file: File | null
  onFileChange: (file: File | null) => void
  onFilesChange?: (files: File[]) => void
  index: number
}

export function UploadCard({ type, file, onFileChange, onFilesChange, index }: UploadCardProps) {
  const [isDragging, setIsDragging] = useState(false)

  const isLecture = type === "lecture"
  const Icon = isLecture ? Book : ClipboardList

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const isMultiple = !!onFilesChange

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const pdfFiles = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === "application/pdf"
    )
    if (isMultiple && pdfFiles.length > 0) {
      onFilesChange!(pdfFiles)
    } else if (pdfFiles[0]) {
      onFileChange(pdfFiles[0])
    }
  }, [onFileChange, onFilesChange, isMultiple])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const pdfFiles = Array.from(e.target.files || []).filter(
      (f) => f.type === "application/pdf"
    )
    if (isMultiple && pdfFiles.length > 0) {
      onFilesChange!(pdfFiles)
    } else if (pdfFiles[0]) {
      onFileChange(pdfFiles[0])
    }
  }, [onFileChange, onFilesChange, isMultiple])

  const removeFile = useCallback(() => {
    onFileChange(null)
  }, [onFileChange])

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 + index * 0.15, ease: "easeOut" }}
      className="group relative"
    >
      {/* Layered shadow effect */}
      <div className="absolute -bottom-2 left-4 right-4 h-full rounded-2xl bg-border/50" />
      <div className="absolute -bottom-1 left-2 right-2 h-full rounded-2xl bg-muted/70" />
      
      {/* Main card */}
      <div className="relative rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
        {/* Header */}
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <Icon className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-xl font-medium tracking-tight text-foreground">
              {isLecture ? "Lecture Materials" : "Past Year Questions"}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {isLecture 
                ? "Upload your lecture notes (PDF) — images, text, diagrams all supported"
                : "Upload exam papers (PDF) — MCQs, subjective, image-based questions"
              }
            </p>
          </div>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 ${
            isDragging
              ? "border-primary bg-accent/50"
              : file
              ? "border-primary/50 bg-accent/30"
              : "border-border hover:border-muted-foreground hover:bg-muted/30"
          }`}
        >
          <input
            type="file"
            accept=".pdf"
            multiple={isMultiple}
            onChange={handleFileInput}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          
          <div className="flex flex-col items-center justify-center px-6 py-10">
            {file ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex w-full items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      removeFile()
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Drop your PDF here</span>
                  <br />
                  or click to browse
                </p>
              </>
            )}
          </div>
        </div>

        {/* File requirements */}
        <p className="mt-4 text-center text-xs tracking-wide text-muted-foreground">
          {isMultiple ? "PDF only — select multiple files at once" : "PDF only, up to 50MB"}
        </p>
      </div>
    </motion.div>
  )
}
