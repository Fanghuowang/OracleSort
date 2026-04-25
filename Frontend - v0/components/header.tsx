"use client"

import { motion } from "framer-motion"
import { Moon, Sun, RotateCcw } from "lucide-react"
import { useTheme } from "./theme-provider"

interface HeaderProps {
  onReset: () => void
  showReset: boolean
}

export function Header({ onReset, showReset }: HeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12"
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="font-serif text-sm font-bold text-primary-foreground">O</span>
        </div>
        <span className="font-serif text-lg font-medium tracking-tight text-foreground">
          OracleSort
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Reset button */}
        {showReset && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={onReset}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium tracking-wide text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset All
          </motion.button>
        )}

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>
      </div>
    </motion.header>
  )
}
