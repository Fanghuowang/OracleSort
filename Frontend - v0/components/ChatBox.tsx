"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Loader2 } from "lucide-react"
import type { Subject } from "@/lib/storage"
import type { MatchedQuestion, PredictionResult } from "@/lib/api"

interface ChatBoxProps {
  subject: Subject | null
  disabled: boolean
}

interface Message {
  role: "user" | "assistant"
  content: string
}

function getChatKey(subjectId: string) {
  return `examprep_chat_${subjectId}`
}

function loadChat(subjectId: string): Message[] {
  try {
    const raw = localStorage.getItem(getChatKey(subjectId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveChat(subjectId: string, messages: Message[]) {
  localStorage.setItem(getChatKey(subjectId), JSON.stringify(messages))
}

function buildContext(subject: Subject): string {
  const analysis = subject.analysis as {
    matchedQuestions?: MatchedQuestion[]
    chapterCounts?: Record<number, number>
    predictions?: PredictionResult | null
  } | null

  const chapters = subject.chapters
  const chapterCounts = analysis?.chapterCounts || {}
  const predictions = analysis?.predictions

  let ctx = `Subject: ${subject.name}\n\nChapters:\n`
  for (const c of chapters) {
    const count = chapterCounts[c.number] || 0
    ctx += `  Chapter ${c.number}: ${c.title} (${count} questions)\n`
  }

  if (predictions?.predictions?.length) {
    ctx += `\nExam Predictions:\n`
    for (const p of predictions.predictions) {
      const label = p.probability > 0.7 ? "HIGH" : p.probability >= 0.4 ? "MEDIUM" : "LOW"
      ctx += `  Ch ${p.chapterNumber} ${p.chapterTitle}: ${Math.round(p.probability * 100)}% (${label}) — ${p.reason}\n`
    }
    if (predictions.summary) {
      ctx += `  Summary: ${predictions.summary}\n`
    }
  }

  const papers = subject.papers.filter((p) => p.status === "Analyzed")
  if (papers.length) {
    ctx += `\nAnalyzed papers: ${papers.map((p) => p.filename).join(", ")}\n`
  }

  return ctx
}

const SUGGESTED = [
  "What should I focus on most?",
  "Why is the highest chapter high priority?",
  "Generate a practice question",
]

export function ChatBox({ subject, disabled }: ChatBoxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (subject) {
      setMessages(loadChat(subject.id))
    }
  }, [subject?.id])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const sendMessage = useCallback(async (text: string) => {
    if (!subject || !text.trim() || isLoading) return

    const userMsg: Message = { role: "user", content: text.trim() }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput("")
    setIsLoading(true)

    try {
      const context = buildContext(subject)
      const systemPrompt = `You are OracleSort, an academic study assistant. Help the student with their questions about exam preparation based on the analysis data below. Be concise and helpful.

Analysis data:
${context}`

      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          max_tokens: 2048,
          temperature: 0.7,
          messages: [
            { role: "system", content: systemPrompt },
            ...updated.slice(-10).map((m) => ({ role: m.role, content: m.content })),
          ],
        }),
      })

      const data = await res.json()
      const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response."

      const assistantMsg: Message = { role: "assistant", content: reply }
      const final = [...updated, assistantMsg]
      setMessages(final)
      saveChat(subject.id, final)
    } catch {
      const errorMsg: Message = { role: "assistant", content: "Something went wrong. Please try again." }
      const final = [...updated, errorMsg]
      setMessages(final)
      saveChat(subject.id, final)
    } finally {
      setIsLoading(false)
    }
  }, [subject, messages, isLoading])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <>
      {/* Floating button */}
      <motion.div
        className="fixed bottom-6 right-6 z-30"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        {!isOpen && (
          <div className="group relative">
            {disabled && (
              <div className="absolute -top-10 right-0 hidden whitespace-nowrap rounded-lg bg-card border border-border px-3 py-1.5 text-xs text-muted-foreground shadow-md group-hover:block">
                Complete analysis to start chatting
              </div>
            )}
            <button
              onClick={() => !disabled && setIsOpen(true)}
              disabled={disabled}
              className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all ${
                disabled
                  ? "cursor-not-allowed bg-muted text-muted-foreground opacity-50"
                  : "bg-primary text-primary-foreground hover:shadow-xl hover:scale-105"
              }`}
            >
              <MessageCircle className="h-6 w-6" />
            </button>
          </div>
        )}
      </motion.div>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-30 flex h-[460px] w-[340px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h4 className="text-sm font-medium text-foreground">OracleSort</h4>
                <p className="text-[10px] text-muted-foreground">{subject?.name || "Chat"}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="space-y-2">
                  <p className="text-center text-xs text-muted-foreground">
                    Ask about your exam analysis
                  </p>
                  <div className="space-y-1.5">
                    {SUGGESTED.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-left text-xs text-foreground transition-colors hover:bg-accent"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your exam..."
                  disabled={isLoading}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none disabled:opacity-50"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
