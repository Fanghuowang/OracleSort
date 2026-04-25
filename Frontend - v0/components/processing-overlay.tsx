"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Upload, BookOpen, Brain, FileOutput } from "lucide-react"

interface ProcessingOverlayProps {
  isVisible: boolean
  onComplete: () => void
}

const steps = [
  { id: 1, label: "Uploading", icon: Upload },
  { id: 2, label: "Reading", icon: BookOpen },
  { id: 3, label: "Analyzing", icon: Brain },
  { id: 4, label: "Generating", icon: FileOutput },
]

export function ProcessingOverlay({ isVisible, onComplete }: ProcessingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0)
      setCompletedSteps([])
      return
    }

    const stepDurations = [1500, 2000, 2500, 2000]
    let timeoutId: NodeJS.Timeout

    const advanceStep = (step: number) => {
      if (step < steps.length) {
        setCurrentStep(step)
        timeoutId = setTimeout(() => {
          setCompletedSteps(prev => [...prev, step])
          if (step < steps.length - 1) {
            advanceStep(step + 1)
          } else {
            setTimeout(onComplete, 500)
          }
        }, stepDurations[step])
      }
    }

    advanceStep(0)

    return () => clearTimeout(timeoutId)
  }, [isVisible, onComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-md"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80" />
          
          {/* Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10"
          >
            {/* Layered card effect */}
            <div className="absolute -bottom-3 left-6 right-6 h-full rounded-3xl bg-border/40" />
            <div className="absolute -bottom-1.5 left-3 right-3 h-full rounded-3xl bg-muted/60" />
            
            <div className="relative rounded-3xl border border-border bg-card px-12 py-10 shadow-xl">
              <div className="mb-8 text-center">
                <h3 className="font-serif text-2xl font-medium tracking-tight text-foreground">
                  Processing Your Files
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  This may take a moment...
                </p>
              </div>

              <div className="space-y-4">
                {steps.map((step, index) => {
                  const Icon = step.icon
                  const isCompleted = completedSteps.includes(index)
                  const isCurrent = currentStep === index && !isCompleted
                  const isPending = currentStep < index

                  return (
                    <motion.div
                      key={step.id}
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
                        {step.label}
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

              {/* Shimmer loading bar */}
              <div className="mt-8 h-1 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-muted-foreground/30 to-transparent"
                  animate={{ x: ["-100%", "400%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
