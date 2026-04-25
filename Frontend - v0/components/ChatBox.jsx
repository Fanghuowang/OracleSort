"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Bot, User } from "lucide-react"
import { callILMU } from "@/lib/api"
import { buildChatContext } from "@/lib/chatContext"
import { getCurrentSubjectId } from "@/lib/storage"

function getChatHistory(subjectId) {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(`examprep_chat_${subjectId}`)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveChatHistory(subjectId, messages) {
  if (typeof window === "undefined") return
  localStorage.setItem(`examprep_chat_${subjectId}`, JSON.stringify(messages))
}

const starterQuestions = [
  "What should I focus on most?",
  "Why is the highest chapter high priority?",
  "Generate a practice question",
]

export function ChatBox({ subject, disabled }) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (subject?.id) {
      setMessages(getChatHistory(subject.id))
    }
  }, [subject?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || !subject?.id || isLoading) return

      const userMsg = { role: "user", content: text.trim() }
      const updatedMessages = [...messages, userMsg]
      setMessages(updatedMessages)
      saveChatHistory(subject.id, updatedMessages)
      setInput("")
      setIsLoading(true)

      try {
        const context = buildChatContext(subject)
        const apiMessages = [
          {
            role: "user",
            content: `You are an AI study assistant for OracleSort. Use this context about the student's subject and analysis:\n\n${context}\n\nStudent question: ${text.trim()}\n\nGive a helpful, concise answer focused on exam preparation.`,
          },
        ]

        const response = await callILMU(apiMessages)
        const assistantMsg = { role: "assistant", content: response }
        const finalMessages = [...updatedMessages, assistantMsg]
        setMessages(finalMessages)
        saveChatHistory(subject.id, finalMessages)
      } catch (err) {
        const errorMsg = {
          role: "assistant",
          content: `Sorry, I encountered an error: ${err.message}`,
        }
        const finalMessages = [...updatedMessages, errorMsg]
        setMessages(finalMessages)
        saveChatHistory(subject.id, finalMessages)
      } finally {
        setIsLoading(false)
      }
    },
    [messages, subject, isLoading]
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-colors ${
          disabled
            ? "cursor-not-allowed bg-muted text-muted-foreground/50"
            : "bg-primary text-primary-foreground hover:shadow-xl"
        }`}
        whileHover={!disabled ? { scale: 1.05 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        title={disabled ? "Complete analysis to start chatting" : "Open AI Chat"}
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-40 flex h-[460px] w-[340px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">AI Study Assistant</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bot className="mb-3 h-8 w-8 text-muted-foreground/40" strokeWidth={1.5} />
                  <p className="text-xs text-muted-foreground">
                    Ask me anything about your exam prep
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-3 w-3 text-primary" />
                  </div>
                  <div className="rounded-xl bg-muted px-3 py-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Starter questions */}
            {messages.length === 0 && !isLoading && (
              <div className="border-t border-border px-4 py-2">
                <p className="mb-2 text-[10px] font-medium tracking-wide text-muted-foreground">
                  SUGGESTED QUESTIONS
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {starterQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-[10px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 border-t border-border px-4 py-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                disabled={isLoading}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
