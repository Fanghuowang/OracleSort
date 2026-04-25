"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Check, Upload, BookOpen, Brain, FileOutput } from "lucide-react"

const stepIcons = [Upload, BookOpen, Brain, FileOutput]

export function LoadingOverlay({ isVisible, currentStep, steps }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md"
        >
          <div className="absolute inset-0 bg-background/80" />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10"
          >
            <div className="absolute -bottom-3 left-6 right-6 h-full rounded-3xl bg-border/40" />
            <div className="absolute -bottom-1.5 left-3 right-3 h-full rounded-3xl bg-muted/60" />

            <div className="relative rounded-3xl border border-border bg-card px-12 py-10 shadow-xl">
              <div className="mb-8 text-center">
                <h3 className="font-serif text-2xl font-medium tracking-tight text-foreground">
                  Analyzing Your Papers
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  AI is processing your materials...
                </p>
              </div>

              <div className="space-y-4">
                {steps.map((label, index) => {
                  const Icon = stepIcons[index] || BookOpen
                  const isCompleted = currentStep > index
                  const isCurrent = currentStep === index
                  const isPending = currentStep < index

                  return (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-4 rounded-xl px-4 py-3 transition-colors ${
                        isCurrent ? "bg-accent" : ""
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                          isCompleted
                            ? "bg-primary text-primary-foreground"
                            : isCurrent
                            ? "bg-muted subtle-pulse"
                            : "bg-muted"
                        }`}
                      >
                        {isCompleted ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 15 }}
                          >
                            <Check className="h-5 w-5" strokeWidth={2} />
                          </motion.div>
                        ) : (
                          <Icon
                            className={`h-5 w-5 ${
                              isPending ? "text-muted-foreground/50" : "text-muted-foreground"
                            }`}
                            strokeWidth={1.5}
                          />
                        )}
                      </div>
                      <span
                        className={`text-sm font-medium tracking-wide ${
                          isCompleted
                            ? "text-foreground"
                            : isCurrent
                            ? "text-foreground"
                            : "text-muted-foreground/50"
                        }`}
                      >
                        {label}
                      </span>
                      {isCurrent && (
                        <div className="ml-auto flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>

              {/* Progress bar */}
              <div className="mt-8 h-1.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-primary/60"
                  animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
