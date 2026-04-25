"use client"

import { motion } from "framer-motion"
import { ResultCard, resultCardsData } from "./result-card"

interface ResultsSectionProps {
  isVisible: boolean
}

export function ResultsSection({ isVisible }: ResultsSectionProps) {
  if (!isVisible) return null

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 px-6 pb-20 pt-16 md:px-12"
    >
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center"
      >
        <h2 className="font-serif text-2xl font-medium tracking-tight text-foreground md:text-3xl">
          Your Analysis Results
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Download your personalized study materials
        </p>
      </motion.div>

      {/* Results grid */}
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {resultCardsData.map((card, index) => (
            <ResultCard
              key={card.title}
              title={card.title}
              description={card.description}
              icon={card.icon}
              isSpecial={card.isSpecial}
              isPrediction={card.isPrediction}
              index={index}
            />
          ))}
        </div>
      </div>
    </motion.section>
  )
}
