# OracleSort

AI-powered exam workflow orchestrator that analyzes past year questions, matches them to lecture chapters, and predicts exam focus areas using ILMU-GLM-5.1.

Built for **UM Hackathon 2026**.

## Live Demo

[Deploy to Vercel and add URL here]

## Features

- **Subject Management** — Create, switch, and delete study subjects
- **Lecture PDF Upload** — Upload lecture materials (single or batch), AI auto-detects chapters from filenames and content
- **Past Year Paper Upload** — Batch upload exam papers, AI extracts questions as complete blocks
- **Question-to-Chapter Matching** — Each question is matched to the relevant lecture chapter
- **Exam Predictions** — AI predicts which chapters are most likely to appear, with priority tiers (High/Medium/Low)
- **Interactive Dashboard** — Stats cards, bar chart (recharts), chapter grid with progress bars
- **Reference Panel** — Slide-in panel to view all questions for a specific chapter
- **AI Chat Assistant** — Context-aware chat that answers questions about your analysis
- **PDF Export** — Download separate PDFs per chapter or one combined document
- **LocalStorage Persistence** — All data saved locally, no account required

## Tech Stack

- **Frontend:** Next.js 16 + TypeScript
- **Styling:** Tailwind CSS + Framer Motion
- **AI Model:** ILMU-GLM-5.1 (Z.ai GLM — hackathon mandatory)
- **API Proxy:** Next.js API route (`/api/proxy`) — bypasses CORS, secures API key server-side
- **PDF Extraction:** pdfjs-dist
- **PDF Generation:** jsPDF
- **Charts:** Recharts
- **Storage:** localStorage

## How to Run Locally

```bash
# Clone the repository
git clone <your-repo-url>
cd "Frontend - v0"

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your ILMU API key

# Run development server
npm run dev

# Open http://localhost:3000
```

## Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_ANTHROPIC_AUTH_TOKEN=your_ilmu_api_key
NEXT_PUBLIC_ANTHROPIC_BASE_URL=https://api.ilmu.ai/v1
NEXT_PUBLIC_ANTHROPIC_MODEL=ilmu-glm-5.1
```

## Project Structure

```
app/
  page.tsx              — Main UI component
  layout.tsx            — Root layout with fonts and theme
  globals.css           — Global styles
  api/proxy/route.ts    — API proxy for ILMU AI
components/
  Dashboard.tsx         — Stats cards + bar chart
  Predictions.tsx       — Priority tier prediction cards
  ReferencePanel.tsx    — Slide-in question viewer
  DocumentList.tsx      — Analyzed papers table
  ChapterGrid.tsx       — Chapter cards with progress bars
  ExportModal.tsx       — PDF export dialog
  ChatBox.tsx           — AI chat assistant
  LoadingOverlay.tsx    — 4-step analysis animation
  upload-card.tsx       — File upload component
  header.tsx / footer.tsx / etc.
lib/
  storage.ts            — localStorage CRUD
  api.ts                — ILMU API calls (chapter detection, matching, predictions)
  pdf.ts                — PDF text extraction
  utils.ts              — Tailwind utility
```

## Team

- Winnie Fly
  Member: Tan Hock Lai

## License

MIT
