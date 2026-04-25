"use client"

import { motion } from "framer-motion"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { FileText, BookOpen, TrendingUp, Hash } from "lucide-react"
import type { MatchedQuestion, MatchResult, PredictionResult } from "@/lib/api"
import type { Chapter } from "@/lib/storage"

interface DashboardProps {
  analysis: {
    matchedQuestions?: MatchedQuestion[]
    chapterCounts?: Record<number, number>
    predictions?: PredictionResult | null
  } | null
  chapters: Chapter[]
  subjectName: string
  onBarClick: (chapterNum: number) => void
}

export function Dashboard({ analysis, chapters, subjectName, onBarClick }: DashboardProps) {
  if (!analysis) return null

  const questions = analysis.matchedQuestions || []
  const chapterCounts = analysis.chapterCounts || {}
  const totalQuestions = questions.length
  const totalChapters = Object.keys(chapterCounts).length

  const topChapter = Object.entries(chapterCounts).sort((a, b) => b[1] - a[1])[0]
  const topChapterTitle = topChapter
    ? chapters.find((c) => c.number === Number(topChapter[0]))?.title || `Chapter ${topChapter[0]}`
    : "N/A"
  const topChapterCount = topChapter?.[1] || 0

  const uniqueDocuments = new Set(questions.map((q) => q.sourceDocument)).size

  const chartData = chapters
    .map((c) => ({
      name: c.title.length > 18 ? c.title.slice(0, 16) + "…" : c.title,
      fullName: c.title,
      chapter: c.number,
      count: chapterCounts[c.number] || 0,
    }))
    .filter((d) => d.count > 0)

  const stats = [
    { label: "Questions", value: totalQuestions, icon: FileText },
    { label: "Papers", value: uniqueDocuments, icon: Hash },
    { label: "Chapters", value: totalChapters, icon: BookOpen },
    { label: "Top Chapter", value: topChapterTitle, icon: TrendingUp, small: true },
  ]

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-medium tracking-tight text-foreground">
          {subjectName} — Analysis
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {totalQuestions} questions across {totalChapters} chapters from {uniqueDocuments} paper{uniqueDocuments !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Stats cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <p className={stat.small ? "text-sm font-medium text-foreground" : "font-serif text-2xl font-medium text-foreground"}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              {stat.label === "Top Chapter" && topChapterCount > 0 && (
                <p className="text-[10px] text-muted-foreground">{topChapterCount} questions</p>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Bar chart */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="mb-4 font-serif text-lg font-medium text-foreground">
            Questions per Chapter
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number, _name: string, props: { payload: { fullName: string } }) => [
                    `${value} questions`,
                    props.payload.fullName,
                  ]}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} cursor="pointer" onClick={(data) => onBarClick(data.chapter)}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={index === 0 && topChapter ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.4)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">Click a bar to view questions</p>
        </motion.div>
      )}
    </div>
  )
}
