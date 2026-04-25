export function buildChatContext(subject) {
  if (!subject) return ""

  const parts = [`Subject: ${subject.name}`]

  if (subject.chapters?.length) {
    parts.push(
      "Chapters: " + subject.chapters.map((c) => `Ch${c.chapterNumber} ${c.chapterName}`).join(", ")
    )
  }

  if (subject.analysis) {
    const a = subject.analysis
    if (a.summary) {
      parts.push(
        `Total questions analyzed: ${a.summary.totalQuestions || "N/A"}, Papers: ${a.summary.papersAnalyzed || "N/A"}, Chapters covered: ${a.summary.chaptersCovered || "N/A"}`
      )
    }
    if (a.chapterFrequency) {
      const freq = Object.entries(a.chapterFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
      parts.push("Top chapters by frequency: " + freq.map(([ch, count]) => `Ch${ch}: ${count} questions`).join(", "))
    }
    if (a.predictions) {
      if (a.predictions.highPriority?.length) {
        parts.push("High priority chapters: " + a.predictions.highPriority.map((p) => `${p.chapter} (${p.occurrence}%)`).join(", "))
      }
      if (a.predictions.overallInsight) {
        parts.push("Overall insight: " + a.predictions.overallInsight)
      }
    }
  }

  if (subject.lectures?.length) {
    parts.push(`Lecture materials: ${subject.lectures.length} file(s) uploaded`)
  }

  if (subject.papers?.length) {
    parts.push(`Past year papers: ${subject.papers.length} file(s) uploaded`)
  }

  return parts.join("\n")
}
