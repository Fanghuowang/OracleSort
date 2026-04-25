"use client"

import { motion } from "framer-motion"
import { AlertTriangle, Flame, Leaf } from "lucide-react"
import type { PredictionResult } from "@/lib/api"

interface PredictionsProps {
  predictions: PredictionResult | null
}

export function Predictions({ predictions }: PredictionsProps) {
  if (!predictions?.predictions?.length) return null

  const high = predictions.predictions.filter((p) => p.probability > 0.7)
  const medium = predictions.predictions.filter((p) => p.probability >= 0.4 && p.probability <= 0.7)
  const low = predictions.predictions.filter((p) => p.probability < 0.4)

  const tiers = [
    { label: "High Priority", items: high, icon: Flame, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
    { label: "Medium Priority", items: medium, icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { label: "Low Priority", items: low, icon: Leaf, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-8"
    >
      <h3 className="mb-4 font-serif text-lg font-medium text-foreground">Exam Predictions</h3>

      {predictions.summary && (
        <p className="mb-4 text-sm text-muted-foreground">{predictions.summary}</p>
      )}

      <div className="space-y-4">
        {tiers.filter((t) => t.items.length > 0).map((tier) => {
          const Icon = tier.icon
          return (
            <div key={tier.label}>
              <div className="mb-2 flex items-center gap-2">
                <Icon className={`h-4 w-4 ${tier.color}`} />
                <span className="text-xs font-medium tracking-wide text-muted-foreground">
                  {tier.label}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tier.items.map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`rounded-xl border ${tier.border} ${tier.bg} p-4`}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        Ch {p.chapterNumber}: {p.chapterTitle}
                      </p>
                      <span className={`text-xs font-bold ${tier.color}`}>
                        {Math.round(p.probability * 100)}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.reason}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
