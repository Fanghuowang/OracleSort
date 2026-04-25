"use client"

import { motion } from "framer-motion"

export function HeroSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="relative z-10 px-6 pb-12 pt-8 text-center md:px-12 md:pt-12"
    >
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="font-serif text-4xl font-medium tracking-tight text-foreground md:text-5xl lg:text-6xl"
      >
        <span className="text-balance">OracleSort</span>
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="mx-auto mt-4 max-w-md text-lg tracking-wide text-muted-foreground md:text-xl"
      >
        Intelligent question analysis. Chapter by chapter.
      </motion.p>
      
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="mx-auto mt-6 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground/80 md:text-base"
      >
        Upload your lecture notes and past exam papers. Our AI analyzes patterns, 
        extracts questions by chapter, and predicts focus areas for your upcoming exams.
      </motion.p>
    </motion.section>
  )
}
