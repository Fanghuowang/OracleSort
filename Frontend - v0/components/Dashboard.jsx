"use client"

import { motion } from "framer-motion"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts"
import { BookOpen, FileText, Layers, TrendingUp } from "lucide-react"

export function Dashboard({ analysis, chapters, subjectName, onBarClick }) {
  if (!analysis) return null

  const summary = analysis.summary || {}
  const chapterFrequency = analysis.chapterFrequency || {}
  const totalQuestions = summary.totalQuestions || 0
  const papersAnalyzed = summary.papersAnalyzed || 0
  const chaptersCovered = summary.chaptersCovered || 0

  const sortedChapters = Object.entries(chapterFrequency).sort((a, b) => b[1] - a[1])
  const highestChapter = sortedChapters[0]
  const highestChapterName = chapters?.find(
    (c) => String(c.chapterNumber) === highestChapter?.[0]
  )?.chapterName || `Chapter ${highestChapter?.[0]}`

  const chartData = Object.entries(chapterFrequency).map(([num, count]) => ({
    name: chapters?.find((c) => String(c.chapterNumber) === num)?.chapterName || `Ch ${num}`,
    chapterNumber: parseInt(num),
    questions: count,
  }))

  const stats = [
    { label: "Total Questions", value: totalQuestions, icon: FileText },
    { label: "Papers Analyzed", value: papersAnalyzed, icon: Layers },
    { label: "Chapters Covered", value: chaptersCovered, icon: BookOpen },
    { label: "Highest Chapter", value: highestChapterName, icon: TrendingUp, isText: true },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8 text-center">
        <h2 className="font-serif text-2xl font-medium tracking-tight text-foreground md:text-3xl">
          Analysis Dashboard
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{subjectName}</p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className={`font-medium text-foreground ${stat.isText ? "text-sm" : "text-xl"}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Bar chart */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 rounded-xl border border-border bg-card p-6"
        >
          <h3 className="mb-4 font-serif text-lg font-medium text-foreground">
            Question Frequency by Chapter
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  angle={-35}
                  textAnchor="end"
                  height={70}
                />
                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.5rem",
                    fontSize: 12,
                    color: "var(--foreground)",
                  }}
                />
                <Bar
                  dataKey="questions"
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                  onClick={(data) => onBarClick?.(data.chapterNumber)}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={index === 0 ? "var(--primary)" : "var(--muted-foreground)"}
                      fillOpacity={index === 0 ? 0.9 : 0.4 + (0.6 * (chartData.length - index)) / chartData.length}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
