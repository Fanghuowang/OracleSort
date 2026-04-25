"use client"

import { motion } from "framer-motion"
import { Flame, AlertTriangle, Leaf } from "lucide-react"

export function Predictions({ predictions }) {
  if (!predictions) return null

  const sections = [
    { key: "highPriority", label: "High Priority", sublabel: ">70% occurrence", icon: Flame, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
    { key: "mediumPriority", label: "Medium Priority", sublabel: "40-70% occurrence", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { key: "lowPriority", label: "Low Priority", sublabel: "<40% occurrence", icon: Leaf, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-10"
    >
      <h3 className="mb-6 font-serif text-xl font-medium text-foreground">
        Exam Predictions
      </h3>

      {predictions.overallInsight && (
        <p className="mb-6 rounded-lg border border-border bg-card p-4 text-sm leading-relaxed text-muted-foreground">
          {predictions.overallInsight}
        </p>
      )}

      {sections.map((section, si) => {
        const items = predictions[section.key] || []
        if (!items.length) return null
        const Icon = section.icon

        return (
          <div key={section.key} className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <Icon className={`h-4 w-4 ${section.color}`} />
              <span className="text-sm font-medium text-foreground">{section.label}</span>
              <span className="text-xs text-muted-foreground">{section.sublabel}</span>
            </div>

            <div className="space-y-3">
              {items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: si * 0.1 + i * 0.05 }}
                  className={`rounded-lg border ${section.border} ${section.bg} p-4`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Ch {item.chapterNumber}: {item.chapter}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Predicted type: {item.predictedType}
                      </p>
                    </div>
                    <span className={`text-sm font-semibold ${section.color}`}>
                      {item.occurrence}%
                    </span>
                  </div>
                  {item.reasoning && (
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground/80">
                      {item.reasoning}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )
      })}
    </motion.div>
  )
}
