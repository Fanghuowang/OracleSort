"use client"

import { motion } from "framer-motion"

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="relative z-10 border-t border-border bg-card/50 px-6 py-8 md:px-12"
    >
      <div className="mx-auto max-w-5xl">
        {/* Divider with decorative element */}
        <div className="mb-6 flex items-center justify-center">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="mx-4 h-1.5 w-1.5 rotate-45 bg-muted-foreground/30" />
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Footer content */}
        <div className="text-center">
          <p className="text-xs tracking-widest text-muted-foreground">
            EXAMPREP AI
          </p>
          <p className="mt-2 text-xs text-muted-foreground/60">
            Intelligent study companion for focused exam preparation
          </p>
          <p className="mt-4 text-[10px] uppercase tracking-wider text-muted-foreground/40">
            © {new Date().getFullYear()} · All Rights Reserved
          </p>
        </div>
      </div>
    </motion.footer>
  )
}
