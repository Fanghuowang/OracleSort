"use client"

import { motion } from "framer-motion"
import { Download, FileText, Layers, Lightbulb, TrendingUp, type LucideIcon } from "lucide-react"

interface ResultCardProps {
  title: string
  description: string
  icon: LucideIcon
  isSpecial?: boolean
  isPrediction?: boolean
  index: number
}

export function ResultCard({ 
  title, 
  description, 
  icon: Icon,
  isSpecial = false,
  isPrediction = false,
  index 
}: ResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: 0.1 + index * 0.08,
        ease: "easeOut" 
      }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      {/* Layered shadow */}
      <div className={`absolute -bottom-1.5 left-2 right-2 h-full rounded-xl ${
        isSpecial || isPrediction ? "bg-primary/20" : "bg-border/50"
      }`} />
      
      {/* Main card */}
      <div className={`relative rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 group-hover:shadow-md ${
        isSpecial 
          ? "border-primary/30 ring-1 ring-primary/10" 
          : isPrediction
          ? "border-primary/40 ring-1 ring-primary/20"
          : "border-border"
      }`}>
        {/* Special badge */}
        {isPrediction && (
          <div className="absolute -top-2.5 left-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary-foreground">
              <Lightbulb className="h-3 w-3" />
              AI Insight
            </span>
          </div>
        )}

        <div className="flex items-start gap-4">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors ${
            isSpecial || isPrediction
              ? "bg-primary/10 text-primary group-hover:bg-primary/20"
              : "bg-muted text-muted-foreground group-hover:bg-accent"
          }`}>
            <Icon className="h-5 w-5" strokeWidth={1.5} />
          </div>
          
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-medium leading-tight tracking-tight text-foreground">
              {title}
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        {/* Download button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-medium tracking-wide transition-colors ${
            isSpecial || isPrediction
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </motion.button>
      </div>
    </motion.div>
  )
}

// Pre-configured result cards data
export const resultCardsData = [
  {
    title: "By Chapter — Objective Questions",
    description: "Multiple choice and true/false questions organized per chapter",
    icon: FileText,
  },
  {
    title: "By Chapter — Subjective Questions",
    description: "Essay and short answer questions with suggested answers",
    icon: FileText,
  },
  {
    title: "By Chapter — Combined",
    description: "All question types consolidated by chapter",
    icon: Layers,
  },
  {
    title: "Complete Compilation",
    description: "Full exam preparation package with all chapters",
    icon: Layers,
  },
  {
    title: "Image-Based Questions Only",
    description: "Diagram, graph, and visual-based questions extracted",
    icon: FileText,
  },
  {
    title: "Trend Analysis Report",
    description: "Historical patterns and frequently tested topics",
    icon: TrendingUp,
    isSpecial: true,
  },
  {
    title: "Exam Prediction & Focus Areas",
    description: "AI-powered predictions for upcoming exam topics",
    icon: Lightbulb,
    isPrediction: true,
  },
]
