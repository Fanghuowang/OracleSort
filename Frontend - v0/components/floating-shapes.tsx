"use client"

import { motion } from "framer-motion"

export function FloatingShapes() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Large circle - top right */}
      <motion.div
        className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-muted/30"
        animate={{
          y: [0, 20, 0],
          x: [0, -10, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Medium square - bottom left */}
      <motion.div
        className="absolute -bottom-10 -left-10 h-64 w-64 rotate-12 rounded-lg bg-accent/20"
        animate={{
          rotate: [12, 18, 12],
          y: [0, -15, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Small circle - center left */}
      <motion.div
        className="absolute left-1/4 top-1/3 h-32 w-32 rounded-full bg-border/30"
        animate={{
          scale: [1, 1.1, 1],
          y: [0, 10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Thin rectangle - right side */}
      <motion.div
        className="absolute right-1/4 top-2/3 h-2 w-48 -rotate-45 rounded-full bg-muted-foreground/10"
        animate={{
          rotate: [-45, -40, -45],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Small diamond - top center */}
      <motion.div
        className="absolute left-1/2 top-20 h-16 w-16 rotate-45 rounded-sm bg-accent/25"
        animate={{
          y: [0, 15, 0],
          rotate: [45, 50, 45],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}
