# Mock Test Feature Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the school board mock test flow fully dynamic — classes 1-12 from DB, subjects/chapters fetched live, chapter multi-select, and zero-cost same-chapter distractor-pooling MCQ generation with hybrid caching.

**Architecture:** New public `GET /api/academic/filters` endpoint discovers subjects/chapters from `solutions`. Rewritten `POST /api/mcq/generate` uses same-chapter answer pooling. The `[board]/page.tsx` selection page becomes fully dynamic with a chapter multi-select step. The quiz page adds chapter support and auto-generates MCQs on first visit.

**Tech Stack:** Next.js 16 App Router, MongoDB native driver, React 19, TypeScript, Tailwind CSS, Framer Motion

## Global Constraints

- Zero external API costs — all MCQ generation uses same-chapter distractor pooling from existing solutions DB
- Class range: 1-12 (currently hardcoded to 1-10)
- Chapter names with spaces/special chars must use `encodeURIComponent`/`decodeURIComponent`
- Minimum 5 questions needed for a test to be meaningful
- No changes to entrance exam flow (`/mock-test/entrance/*`)
- Public APIs (no auth) for read-only filter data; auth still required only for test submission
- Follow existing code patterns: `"use client"` pages with `useParams`, API routes use `clientPromise` from `@/lib/db/mongodb`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `app/api/academic/filters/route.ts` | **Create** | Public endpoint: discover classes/subjects/chapters from `solutions` collection |
| `app/api/mcq/generate/route.ts` | **Rewrite** | Replace heuristic distractors with same-chapter answer pooling + subject fallback |
| `app/api/mcq/route.ts` | **Edit** | Support `chapters` query param (comma-separated → `$in` query) |
| `app/mock-test/[board]/page.tsx` | **Rewrite** | Dynamic class 1-12, subjects, chapter multi-select from API |
| `app/mock-test/[board]/[class]/page.tsx` | **Edit** | Add chapter param, auto-generate MCQs when none cached |

### Task 1: Create Public Filters API

**Files:**
- Create: `app/api/academic/filters/route.ts`

**Interfaces:**
- Produces: `GET /api/academic/filters?board=X&class=Y&subject=Z` returns `{ classes?, subjects?, chapters?, counts }`

- [ ] **Step 1: Create the API route file**

```typescript
// app/api/academic/filters/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";

const BOARDS = ["CBSE", "ICSE", "Maharashtra Board"] as const;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const board = searchParams.get("board") || "";
    const classNum = searchParams.get("class") || "";
    const subject = searchParams.get("subject") || "";

    const client = await clientPromise;
    const db = client.db("career_guru");
    const col = db.collection("solutions");

    // Level 1: Board specified → return classes 1-12 that have solutions
    if (board && !classNum && !subject) {
      if (!BOARDS.includes(board as (typeof BOARDS)[number])) {
        return NextResponse.json({ error: "Invalid board" }, { status: 400 });
      }

      const result = await col
        .aggregate([
          { $match: { board } },
          { $group: { _id: "$class", count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ])
        .toArray();

      const classes: number[] = [];
      const counts: Record<string, number> = {};
      for (const row of result) {
        const cls = row._id as number;
        classes.push(cls);
        counts[String(cls)] = row.count;
      }
      return NextResponse.json({ classes, counts });
    }

    // Level 2: Board + Class specified → return distinct subjects
    if (board && classNum && !subject) {
      if (!BOARDS.includes(board as (typeof BOARDS)[number])) {
        return NextResponse.json({ error: "Invalid board" }, { status: 400 });
      }

      const result = await col
        .aggregate([
          { $match: { board, class: parseInt(classNum) } },
          { $group: { _id: "$subject", count: { $sum: 1 } } },
        ])
        .toArray();

      const subjects: string[] = [];
      const counts: Record<string, number> = {};
      for (const row of result) {
        const subj = row._id as string;
        subjects.push(subj);
        counts[subj] = row.count;
      }
      subjects.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      return NextResponse.json({ subjects, counts });
    }

    // Level 3: Board + Class + Subject specified → return distinct chapters
    if (board && classNum && subject) {
      if (!BOARDS.includes(board as (typeof BOARDS)[number])) {
        return NextResponse.json({ error: "Invalid board" }, { status: 400 });
      }

      const result = await col
        .aggregate([
          { $match: { board, class: parseInt(classNum), subject } },
          { $group: { _id: "$chapter", count: { $sum: 1 } } },
        ])
        .toArray();

      const chapters: string[] = [];
      const counts: Record<string, number> = {};
      for (const row of result) {
        const ch = row._id as string;
        chapters.push(ch);
        counts[ch] = row.count;
      }
      chapters.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      return NextResponse.json({ chapters, counts });
    }

    return NextResponse.json({ error: "Provide at least a board parameter" }, { status: 400 });
  } catch (error) {
    console.error("Academic filters GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Test the API manually**

Run: Start dev server with `npm run dev`, then visit:
- `http://localhost:3000/api/academic/filters?board=Maharashtra%20Board` — should return classes array with counts
- `http://localhost:3000/api/academic/filters?board=Maharashtra%20Board&class=12` — should return subjects
- `http://localhost:3000/api/academic/filters?board=Maharashtra%20Board&class=12&subject=Physics` — should return chapters
Expected: JSON with non-empty arrays and count objects

- [ ] **Step 3: Commit**

```bash
git add app/api/academic/filters/route.ts
git commit -m "feat: add public academic filters API for dynamic subject/chapter discovery
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: Rewrite MCQ Generator with Distractor Pooling

**Files:**
- Modify: `app/api/mcq/generate/route.ts` (full rewrite)

**Interfaces:**
- Consumes: `POST /api/mcq/generate` body `{ board, class, subject, chapter?, chapters?, limit? }`
- Produces: `{ message, generated, totalProcessed }` — inserts MCQs into `mcq_questions` collection

- [ ] **Step 1: Write the distractor pooling generator**

Replace the entire file with:

```typescript
// app/api/mcq/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";

function extractAnswerText(answer: string, maxLen: number = 120): string {
  // Strip answer/ans/solution: prefixes
  const cleaned = answer
    .replace(/^(answer|ans|solution)[:\s-]*/i, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Take first meaningful sentence
  const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (sentences.length === 0) return cleaned.substring(0, maxLen);

  const first = sentences[0].trim();
  if (first.length <= maxLen) return first;
  return first.substring(0, maxLen) + "...";
}

function estimateDifficulty(question: string, answer: string): "easy" | "medium" | "hard" {
  const combinedLength = question.length + answer.length;
  if (combinedLength < 100) return "easy";
  if (combinedLength < 300) return "medium";
  return "hard";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { board, class: classNum, subject, chapter, chapters, limit = 10, examType } = body;

    // Validate required params
    if (!examType && (!board || !classNum || !subject)) {
      return NextResponse.json(
        { error: "board, class, and subject are required (or examType + subject)" },
        { status: 400 }
      );
    }
    if (examType && !subject) {
      return NextResponse.json({ error: "subject is required with examType" }, { status: 400 });
    }

    // Resolve chapters: single chapter or comma-separated list
    let chapterList: string[] = [];
    if (chapters) {
      chapterList = chapters.split(",").map((c: string) => c.trim()).filter(Boolean);
    } else if (chapter) {
      chapterList = [chapter];
    }

    const client = await clientPromise;
    const db = client.db("career_guru");

    // Build solution query
    const solutionQuery: any = {};
    if (examType) {
      solutionQuery.subject = subject;
    } else {
      solutionQuery.board = board;
      solutionQuery.class = parseInt(classNum);
      solutionQuery.subject = subject;
    }
    if (chapterList.length === 1) {
      solutionQuery.chapter = chapterList[0];
    } else if (chapterList.length > 1) {
      solutionQuery.chapter = { $in: chapterList };
    }

    // Fetch solutions for the selected scope
    const solutions = await db.collection("solutions")
      .find(solutionQuery)
      .limit(Math.min(limit * 3, 90)) // Fetch more to build good distractor pool
      .toArray();

    if (solutions.length < 5) {
      return NextResponse.json(
        { error: "Not enough content. Select more chapters or a different subject." },
        { status: 400 }
      );
    }

    // Build same-chapter distractor pool for each question
    // For a given solution, pool distractors from OTHER solutions in the SAME chapter
    // If same-chapter pool is too small, fall back to same-subject pool

    // Pre-group solutions by chapter for efficient pooling
    const byChapter: Record<string, string[]> = {};
    for (const sol of solutions) {
      const ch = sol.chapter || "unknown";
      if (!byChapter[ch]) byChapter[ch] = [];
      byChapter[ch].push(extractAnswerText(sol.answer));
    }

    // Build subject-wide fallback pool (all answers across all chapters)
    const subjectPool = solutions.map(sol => extractAnswerText(sol.answer));

    const generated: any[] = [];
    const maxToGenerate = Math.min(limit, 30);
    const solutionsToUse = solutions.slice(0, maxToGenerate);

    for (const sol of solutionsToUse) {
      const correctAnswer = extractAnswerText(sol.answer);

      // Pool distractors from the same chapter (excluding this solution's answer)
      const ch = sol.chapter || "unknown";
      const chapterPool = (byChapter[ch] || []).filter(a => a !== correctAnswer);

      let distractorPool = chapterPool;
      // Fallback: if chapter pool has fewer than 3 unique distractors, use subject-wide pool
      if (new Set(distractorPool).size < 3) {
        distractorPool = subjectPool.filter(a => a !== correctAnswer);
      }

      // Pick 3 unique random distractors
      const uniquePool = [...new Set(distractorPool)];

      // Shuffle the pool
      for (let i = uniquePool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [uniquePool[i], uniquePool[j]] = [uniquePool[j], uniquePool[i]];
      }

      const distractors = uniquePool.slice(0, 3);

      // If we still don't have 3 distractors, pad with generic options
      while (distractors.length < 3) {
        distractors.push("None of the above");
      }

      // Combine and shuffle all 4 options
      const options = [correctAnswer, ...distractors];
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }

      const correctIndex = options.indexOf(correctAnswer);

      const mcq: any = {
        questionText: sol.question,
        options,
        correctOptionIndex: correctIndex,
        explanation: sol.answer,
        subject: sol.subject,
        chapter: sol.chapter,
        sourceSolutionId: sol._id?.toString(),
        difficulty: estimateDifficulty(sol.question, sol.answer),
        createdAt: new Date(),
      };

      if (examType) {
        mcq.examType = examType;
      } else {
        mcq.board = sol.board;
        mcq.class = sol.class;
      }

      // Deduplicate by sourceSolutionId
      const existing = await db.collection("mcq_questions").findOne({
        sourceSolutionId: sol._id?.toString(),
      });

      if (!existing) {
        const result = await db.collection("mcq_questions").insertOne(mcq);
        generated.push({ ...mcq, _id: result.insertedId });
      }
    }

    return NextResponse.json({
      message: `Generated ${generated.length} new MCQ questions (${solutionsToUse.length - generated.length} already existed)`,
      generated: generated.length,
      totalProcessed: solutionsToUse.length,
    });
  } catch (error) {
    console.error("MCQ Generate API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Test the generator**

Run dev server and POST to `/api/mcq/generate`:
```json
{
  "board": "Maharashtra Board",
  "class": 12,
  "subject": "Physics",
  "chapters": "Current Electricity",
  "limit": 5
}
```
Expected: Returns `{ message: "...", generated: N, totalProcessed: N }` with N > 0.

Test error case — use a subject with no solutions:
```json
{ "board": "CBSE", "class": 1, "subject": "Nonexistent", "limit": 5 }
```
Expected: Returns 400 with `{ error: "Not enough content..." }`

- [ ] **Step 3: Commit**

```bash
git add app/api/mcq/generate/route.ts
git commit -m "feat: rewrite MCQ generator with same-chapter distractor pooling and subject fallback
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: Update MCQ GET API to Support Multiple Chapters

**Files:**
- Modify: `app/api/mcq/route.ts` (add `chapters` param support)

**Interfaces:**
- Produces: `GET /api/mcq?chapters=Ch1,Ch2` supports comma-separated chapters via `$in` query

- [ ] **Step 1: Add chapters param support**

In `app/api/mcq/route.ts`, find the existing GET handler (around line 5). The current code has `chapter` as a single value query. Change lines where query params are read and where the query is built:

**Current code (lines 7-23):**
```typescript
const { searchParams } = new URL(req.url);
const board = searchParams.get("board") || "";
const classNum = searchParams.get("class");
const subject = searchParams.get("subject");
const chapter = searchParams.get("chapter");
const examType = searchParams.get("examType") || "";
const difficulty = searchParams.get("difficulty") || "";
const limit = parseInt(searchParams.get("limit") || "20");

const client = await clientPromise;
const db = client.db("career_guru");

const query: any = {};
if (board) query.board = board;
if (classNum) query.class = parseInt(classNum);
if (subject) query.subject = subject;
if (chapter) query.chapter = chapter;
```

**Replace with:**
```typescript
const { searchParams } = new URL(req.url);
const board = searchParams.get("board") || "";
const classNum = searchParams.get("class");
const subject = searchParams.get("subject");
const chapterRaw = searchParams.get("chapter");
const chaptersRaw = searchParams.get("chapters");
const examType = searchParams.get("examType") || "";
const difficulty = searchParams.get("difficulty") || "";
const limit = parseInt(searchParams.get("limit") || "20");

const client = await clientPromise;
const db = client.db("career_guru");

const query: any = {};
if (board) query.board = board;
if (classNum) query.class = parseInt(classNum);
if (subject) query.subject = subject;

// Support both single chapter and comma-separated chapters
if (chaptersRaw) {
  const chapterList = chaptersRaw.split(",").map(c => c.trim()).filter(Boolean);
  if (chapterList.length === 1) {
    query.chapter = chapterList[0];
  } else if (chapterList.length > 1) {
    query.chapter = { $in: chapterList };
  }
} else if (chapterRaw) {
  query.chapter = chapterRaw;
}

if (examType) query.examType = examType;
if (difficulty) query.difficulty = difficulty;
```

- [ ] **Step 2: Test the updated endpoint**

Visit (after generating some MCQs in Task 2):
```
http://localhost:3000/api/mcq?board=Maharashtra%20Board&class=12&subject=Physics&chapters=Current%20Electricity,Rotational%20Dynamics&limit=10
```
Expected: Returns questions filtered to those two chapters.

- [ ] **Step 3: Commit**

```bash
git add app/api/mcq/route.ts
git commit -m "feat: support comma-separated chapters param in MCQ GET API
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: Rewrite Board Selection Page with Dynamic Flow

**Files:**
- Modify: `app/mock-test/[board]/page.tsx` (full rewrite)

**Interfaces:**
- Consumes: `GET /api/academic/filters?board=X` for classes, then for subjects, then for chapters
- Produces: Navigation to `/mock-test/[board]/[class]?subject=X&chapters=Ch1,Ch2`

- [ ] **Step 1: Rewrite the page component**

Replace the entire content of `app/mock-test/[board]/page.tsx` with:

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, BookOpen, CheckSquare, ChevronRight } from "lucide-react";

interface FilterData {
  classes?: number[];
  subjects?: string[];
  chapters?: string[];
  counts: Record<string, number>;
}

export default function MockTestBoardPage() {
  const params = useParams();
  const router = useRouter();
  const board = decodeURIComponent(params.board as string);

  const [classes, setClasses] = useState<number[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedChapters, setSelectedChapters] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState({ classes: true, subjects: false, chapters: false });
  const [error, setError] = useState("");

  // Fetch classes on mount
  useEffect(() => {
    fetchFilters(`board=${encodeURIComponent(board)}`, "classes");
  }, [board]);

  // Fetch subjects when class is selected
  useEffect(() => {
    if (selectedClass) {
      fetchFilters(`board=${encodeURIComponent(board)}&class=${selectedClass}`, "subjects");
    }
  }, [selectedClass, board]);

  // Fetch chapters when subject is selected
  useEffect(() => {
    if (selectedClass && selectedSubject) {
      fetchFilters(
        `board=${encodeURIComponent(board)}&class=${selectedClass}&subject=${encodeURIComponent(selectedSubject)}`,
        "chapters"
      );
    }
  }, [selectedSubject, selectedClass, board]);

  const fetchFilters = async (queryString: string, level: "classes" | "subjects" | "chapters") => {
    setLoading(prev => ({ ...prev, [level]: true }));
    setError("");
    try {
      const res = await fetch(`/api/academic/filters?${queryString}`);
      const data: FilterData = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load data");
        return;
      }
      if (level === "classes" && data.classes) {
        setClasses(data.classes);
        setCounts(data.counts);
      } else if (level === "subjects" && data.subjects) {
        setSubjects(data.subjects);
        setCounts(data.counts);
      } else if (level === "chapters" && data.chapters) {
        setChapters(data.chapters);
        setCounts(data.counts);
      }
    } catch {
      setError("Failed to connect. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, [level]: false }));
    }
  };

  const toggleChapter = (chapter: string) => {
    setSelectedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapter)) next.delete(chapter);
      else next.add(chapter);
      return next;
    });
  };

  const toggleAllChapters = () => {
    if (selectedChapters.size === chapters.length) {
      setSelectedChapters(new Set());
    } else {
      setSelectedChapters(new Set(chapters));
    }
  };

  const handleStartTest = () => {
    if (selectedClass && selectedSubject && selectedChapters.size > 0) {
      const chaptersParam = [...selectedChapters].map(c => encodeURIComponent(c)).join(",");
      router.push(
        `/mock-test/${encodeURIComponent(board)}/${selectedClass}?subject=${encodeURIComponent(selectedSubject)}&chapters=${chaptersParam}`
      );
    }
  };

  const formatCount = (n: number) => `${n} solution${n !== 1 ? "s" : ""}`;

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="bg-ocean-gradient py-12">
        <div className="container-custom">
          <Link
            href="/mock-test"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Boards
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{board}</h1>
            <p className="text-white/70">Select your class, subject, and chapters to begin</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom max-w-3xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Class Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Select Class</h2>
            {loading.classes ? (
              <div className="flex items-center gap-2 text-slate-400">
                <div className="h-4 w-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                Loading classes...
              </div>
            ) : classes.length === 0 ? (
              <p className="text-slate-500">No classes available for this board yet.</p>
            ) : (
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-6 gap-2">
                {classes.map((cls) => (
                  <button
                    key={cls}
                    onClick={() => {
                      setSelectedClass(cls);
                      setSelectedSubject(null);
                      setSelectedChapters(new Set());
                    }}
                    className={`p-3 rounded-xl text-sm font-semibold transition-all relative ${
                      selectedClass === cls
                        ? "bg-brand-royal text-white shadow-lg shadow-brand-royal/20"
                        : "bg-white border border-slate-200 text-slate-600 hover:border-brand-royal hover:text-brand-royal"
                    }`}
                  >
                    {cls}
                    {counts[String(cls)] !== undefined && (
                      <span className={`block text-[10px] font-normal mt-0.5 ${
                        selectedClass === cls ? "text-white/60" : "text-slate-400"
                      }`}>
                        {formatCount(counts[String(cls)])}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Subject Selection */}
          {selectedClass && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                Select Subject{" "}
                <span className="text-sm text-slate-400 font-normal">for Class {selectedClass}</span>
              </h2>
              {loading.subjects ? (
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="h-4 w-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                  Loading subjects...
                </div>
              ) : subjects.length === 0 ? (
                <p className="text-slate-500">No subjects available for this class.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {subjects.map((subj) => (
                    <button
                      key={subj}
                      onClick={() => {
                        setSelectedSubject(subj);
                        setSelectedChapters(new Set());
                      }}
                      className={`p-4 rounded-xl text-left transition-all ${
                        selectedSubject === subj
                          ? "bg-brand-royal text-white shadow-lg shadow-brand-royal/20"
                          : "bg-white border border-slate-200 text-slate-700 hover:border-brand-royal"
                      }`}
                    >
                      <BookOpen
                        className={`h-5 w-5 mb-2 ${
                          selectedSubject === subj ? "text-white" : "text-brand-royal"
                        }`}
                      />
                      <span className="font-semibold text-sm">{subj}</span>
                      {counts[subj] !== undefined && (
                        <span className={`block text-xs mt-0.5 ${
                          selectedSubject === subj ? "text-white/60" : "text-slate-400"
                        }`}>
                          {formatCount(counts[subj])}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Chapter Selection */}
          {selectedSubject && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                Select Chapters{" "}
                <span className="text-sm text-slate-400 font-normal">
                  {selectedChapters.size > 0 ? `(${selectedChapters.size} selected)` : "(choose at least one)"}
                </span>
              </h2>
              {loading.chapters ? (
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="h-4 w-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                  Loading chapters...
                </div>
              ) : chapters.length === 0 ? (
                <p className="text-slate-500">No chapters found for this subject.</p>
              ) : (
                <>
                  {/* Select All toggle */}
                  <button
                    onClick={toggleAllChapters}
                    className="mb-3 flex items-center gap-2 text-sm font-medium text-brand-royal hover:text-brand-navy transition-colors"
                  >
                    <CheckSquare className="h-4 w-4" />
                    {selectedChapters.size === chapters.length ? "Deselect All" : "Select All"}
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                    {chapters.map((ch) => {
                      const isSelected = selectedChapters.has(ch);
                      return (
                        <button
                          key={ch}
                          onClick={() => toggleChapter(ch)}
                          className={`flex items-start gap-3 p-3 rounded-xl text-left transition-all text-sm ${
                            isSelected
                              ? "bg-brand-royal/10 border border-brand-royal text-brand-royal"
                              : "bg-white border border-slate-200 text-slate-600 hover:border-brand-royal/50"
                          }`}
                        >
                          <div
                            className={`flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors ${
                              isSelected
                                ? "bg-brand-royal border-brand-royal"
                                : "border-slate-300"
                            }`}
                          >
                            {isSelected && (
                              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`font-medium ${isSelected ? "text-brand-royal" : "text-slate-700"}`}>
                              {ch}
                            </span>
                            {counts[ch] !== undefined && (
                              <span className="block text-xs text-slate-400 mt-0.5">
                                {formatCount(counts[ch])}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Step 4: Start Test */}
          {selectedChapters.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200 p-6"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-semibold text-slate-800">Ready to Begin</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {board} — Class {selectedClass} — {selectedSubject}
                  </p>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {selectedChapters.size} chapter{selectedChapters.size !== 1 ? "s" : ""} selected
                  </p>
                </div>
                <button
                  onClick={handleStartTest}
                  className="flex items-center gap-2 px-6 py-3 bg-brand-gradient-static text-white rounded-xl font-semibold hover:opacity-90 transition-all"
                >
                  Start Test <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify the page loads in the browser**

Run: `npm run dev`, then visit `http://localhost:3000/mock-test/Maharashtra%20Board`
Expected: Classes 1-12 shown (only those with solutions), subject cards appear on class click, chapter checkboxes appear on subject click, "Select All" works, "Start Test" navigates with chapters in URL.

- [ ] **Step 3: Commit**

```bash
git add "app/mock-test/[board]/page.tsx"
git commit -m "feat: rewrite mock test board page with dynamic classes 1-12, subjects, and chapter multi-select
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5: Update Quiz Page for Chapter Support + Auto-Generation

**Files:**
- Modify: `app/mock-test/[board]/[class]/page.tsx` (add chapter param, auto-generation on empty MCQs)

**Interfaces:**
- Consumes: URL query params `?subject=X&chapters=Ch1,Ch2`
- Produces: Quiz UI with questions from selected chapters; triggers generation if no MCQs exist

- [ ] **Step 1: Add chapter support and auto-generation to quiz page**

In `app/mock-test/[board]/[class]/page.tsx`, make these changes:

**Change 1: Add `chapters` from search params (around line 42)**

Current:
```typescript
const subject = searchParams.get("subject") || "";
```

Add after that line:
```typescript
const chaptersRaw = searchParams.get("chapters") || "";
const chapterList = chaptersRaw ? chaptersRaw.split(",").map(c => decodeURIComponent(c.trim())) : [];
```

**Change 2: Update `fetchQuestions` to support chapters and auto-generation (around lines 67-88)**

Replace the entire `fetchQuestions` function:

Current:
```typescript
const fetchQuestions = async () => {
    setLoading(true);
    setError("");
    try {
        const queryParams = new URLSearchParams({
            board,
            class: classNum.toString(),
            subject,
            limit: "20",
        });
        const res = await fetch(`/api/mcq?${queryParams}`);
        const data = await res.json();
        if (data.questions?.length === 0) {
            setError("No MCQ questions found for this selection. Generate them from the admin panel first.");
        }
        setQuestions(data.questions || []);
    } catch {
        setError("Failed to load questions. Please try again.");
    } finally {
        setLoading(false);
    }
};
```

Replace with:
```typescript
const fetchQuestions = async () => {
    setLoading(true);
    setError("");
    try {
        const params = new URLSearchParams({
            board,
            class: classNum.toString(),
            subject,
            limit: "20",
        });
        if (chaptersRaw) {
            params.set("chapters", chaptersRaw);
        }

        const res = await fetch(`/api/mcq?${params}`);
        const data = await res.json();

        if (data.questions && data.questions.length >= 5) {
            setQuestions(data.questions);
            setLoading(false);
            return;
        }

        // No cached MCQs — try generating on-the-fly
        setLoading(false);
        setGenerationState("generating");

        const genBody: any = {
            board,
            class: classNum,
            subject,
            limit: 20,
        };
        if (chapterList.length > 0) {
            genBody.chapters = chaptersRaw;
        }

        const genRes = await fetch("/api/mcq/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(genBody),
        });
        const genData = await genRes.json();

        if (!genRes.ok) {
            setError(genData.error || "Failed to generate questions. Try selecting different chapters.");
            setGenerationState(null);
            return;
        }

        // Re-fetch now that MCQs are generated
        const retryRes = await fetch(`/api/mcq?${params}`);
        const retryData = await retryRes.json();

        if (retryData.questions && retryData.questions.length >= 5) {
            setQuestions(retryData.questions);
            setGenerationState(null);
        } else {
            setError("Not enough content in these chapters to generate a test. Try selecting more chapters.");
            setGenerationState(null);
        }
    } catch {
        setError("Failed to load questions. Please try again.");
        setGenerationState(null);
    } finally {
        setLoading(false);
    }
};
```

**Change 3: Add generation state (add after the `error` state, around line 53)**

After:
```typescript
const [error, setError] = useState("");
```

Add:
```typescript
const [generationState, setGenerationState] = useState<"generating" | null>(null);
```

**Change 4: Add generation loading UI (in the loading section, around lines 142-151)**

After the existing loading screen, add a generation screen:

Current loading UI:
```tsx
if (loading) {
    return (
        <div className="pt-20 min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <div className="h-10 w-10 border-2 border-brand-royal border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-500">Loading questions...</p>
            </div>
        </div>
    );
}
```

Replace with:
```tsx
if (loading) {
    return (
        <div className="pt-20 min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <div className="h-10 w-10 border-2 border-brand-royal border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-500">Loading questions...</p>
            </div>
        </div>
    );
}

if (generationState === "generating") {
    return (
        <div className="pt-20 min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center max-w-md">
                <div className="h-12 w-12 border-2 border-brand-royal border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-slate-700 mb-2">Preparing Your Test</h2>
                <p className="text-slate-500">
                    Generating questions from{" "}
                    {chapterList.length > 0
                        ? `${chapterList.length} chapter${chapterList.length !== 1 ? "s" : ""}`
                        : "selected chapters"}
                    ...
                </p>
                <p className="text-xs text-slate-400 mt-2">This may take a moment the first time.</p>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Verify the full flow end-to-end**

Run: `npm run dev`

Test flow:
1. Visit `http://localhost:3000/mock-test/Maharashtra%20Board`
2. Click Class 12 → should show subjects from API
3. Click Physics → should show chapters from API
4. Select 1-2 chapters → click "Start Test"
5. If MCQs exist: quiz loads immediately
6. If no MCQs: shows "Preparing Your Test..." then quiz loads
7. Answer questions, submit, verify results screen shows scores

- [ ] **Step 3: Commit**

```bash
git add "app/mock-test/[board]/[class]/page.tsx"
git commit -m "feat: add chapter support and on-the-fly MCQ generation to mock test quiz page
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Verification Checklist

After all tasks are complete, verify these acceptance criteria:

1. Visit `/mock-test` → 3 board cards shown
2. Click "Maharashtra Board" → classes 1-12 shown (only those with solutions in DB)
3. Click Class 12 → subjects load from API dynamically
4. Click Physics → chapter checkboxes appear with solution counts
5. Click "Select All" → all chapters checked
6. Deselect a few, click "Start Test" → URL includes `?subject=Physics&chapters=...`
7. Quiz page loads → questions from selected chapters
8. If no MCQs exist → shows "Preparing Your Test..." spinner → generates → quiz loads
9. Answer questions → submit → results with scores shown
10. "Retake" button works → fresh questions
11. Chapter names with special characters work correctly in URLs
