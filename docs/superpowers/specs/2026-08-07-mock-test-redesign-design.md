# Mock Test Feature Redesign — Design Spec

**Date:** 2026-08-07  
**Status:** Approved  
**Scope:** School board mock test flow (`/mock-test`)

---

## Overview

Redesign the school board mock test flow to be fully dynamic and database-driven. Classes 11-12 are added, subjects and chapters are fetched from the `solutions` collection, and MCQ generation uses zero-cost same-chapter distractor pooling.

---

## Current vs. Target Flow

| Stage | Current | Target |
|---|---|---|
| Board selection | 3 hardcoded cards (OK) | No change |
| Class selection | Hardcoded 1-10 | Dynamic 1-12 from DB, with solution counts |
| Subject selection | Hardcoded per board | Dynamic from DB via `/api/academic/filters` |
| Chapter selection | None — skips straight to test | NEW: Checkbox list from DB, multi-select + "Select All" |
| MCQ source | Pre-generated `mcq_questions` only | Hybrid — pre-generated if available, else generate on-the-fly |
| MCQ generation | Heuristic (number manipulation, antonyms) | Same-chapter distractor pooling from `solutions` |
| Quiz page | Board+class+subject params | Board+class+subject+chapters params |
| Results | No change needed | No change |

**Not in scope:** Entrance exam flow (`/mock-test/entrance/*`), admin panel changes.

---

## 1. New Public API: `GET /api/academic/filters`

**Purpose:** Public endpoint to discover available classes, subjects, and chapters from the `solutions` collection. No authentication required. Read-only aggregate metadata.

**File:** `app/api/academic/filters/route.ts` (new)

### Query Parameters

| Params | Returns |
|---|---|
| `board` only | `{ classes: number[], counts: Record<string, number> }` — classes 1-12 that have ≥1 solution |
| `board` + `class` | `{ subjects: string[], counts: Record<string, number> }` — distinct subjects with counts |
| `board` + `class` + `subject` | `{ chapters: string[], counts: Record<string, number> }` — distinct chapters with counts |

### Behavior

- Only returns items with **actual solutions** in the DB (no empty placeholders)
- Uses MongoDB `distinct()` and aggregation for performance
- Cache-friendly: results change only when new solutions are imported
- Returns 400 for invalid board names
- Board names validated against `["CBSE", "ICSE", "Maharashtra Board"]`

---

## 2. MCQ Generation: Same-Chapter Distractor Pooling

**Rewrite target:** `POST /api/mcq/generate` (replace heuristic logic)

### Generation Algorithm

1. Query `solutions` for the given board/class/subject/chapter
2. For each solution (up to `limit`):
   - **Correct answer:** Extract first sentence from `answer` field, clean/truncate to ~120 chars
   - **Distractor pool:** Collect answers from all other solutions in the same chapter
   - If chapter pool < 3 unique distractors, **subject fallback:** pool from other chapters in the same board+class+subject
   - Pick 3 random distractors different from the correct answer
   - Shuffle all 4 options, record correct index
   - Insert into `mcq_questions` with `sourceSolutionId`
3. Deduplicate by `sourceSolutionId` (skip solutions already converted)

### Minimum Threshold

- At least **5 solutions** needed in the selected scope to generate a meaningful test
- If insufficient, return error: `"Not enough content — select more chapters"`

### Hybrid Serving Logic

Implemented in the quiz page (`[board]/[class]/page.tsx`) as client-side logic:

1. Query `GET /api/mcq?board=...&class=...&subject=...&chapters=Ch1,Ch2` 
2. If returned questions count ≥ 5: show quiz immediately
3. If count < 5: call `POST /api/mcq/generate` with same params to create MCQs from `solutions`
4. Re-query `GET /api/mcq` to fetch the freshly generated questions
5. Show "Generating questions..." loading state during generation

---

## 3. UI Changes

### `app/mock-test/[board]/page.tsx` — Selection Page

**Changes:**
- Replace hardcoded `CLASSES = [1..10]` with dynamic fetch from `/api/academic/filters?board=...`
- Replace hardcoded `SUBJECTS` record with dynamic fetch
- Add **chapter selection step** (multi-checkbox list)
- "Select All" toggle for chapters
- Show solution count badges on each option
- Navigate to quiz with `?subject=X&chapters=Ch1,Ch2,Ch3`

### `app/mock-test/[board]/[class]/page.tsx` — Quiz Page

**Changes:**
- Read `chapters` from `searchParams` (comma-separated, decode with `decodeURIComponent`)
- Pass `chapter` param to `/api/mcq?chapter=Ch1,Ch2,Ch3`
- MCQ API already supports `chapter` filter — no API change needed for GET
- If 0 questions returned: show generation prompt or auto-generate
- "Preparing your test..." loading state during on-the-fly generation

### Generation Loading State
- After chapter selection, if no cached MCQs exist, call `/api/mcq/generate`
- Show spinner with "Generating questions for [chapters]..."
- On success, transition to quiz; on failure, show error with fallback suggestion

---

## 4. Error Handling

| Scenario | Handling |
|---|---|
| No solutions for board | Show "Coming soon" on board card |
| No solutions for class | Don't show the class in the list |
| No solutions for subject | Don't show the subject |
| No MCQs + < 5 solutions in chapters | Show "Not enough content in these chapters. Try selecting more chapters." |
| Generation fails (DB error) | Show error toast: "Failed to generate questions. Please try again." |
| Board with special chars in URL | Already handled: `decodeURIComponent` + `encodeURIComponent` |
| Chapter names with special chars | `encodeURIComponent` when building URL, `decodeURIComponent` when reading |

---

## 5. Files Changed

| File | Action | Description |
|---|---|---|
| `app/api/academic/filters/route.ts` | **New** | Public filters API for dynamic subject/chapter discovery |
| `app/api/mcq/generate/route.ts` | **Rewrite** | Replace heuristic with distractor-pooling logic |
| `app/api/mcq/route.ts` | **Minor edit** | Support `chapters` query param (comma-separated, e.g., `chapters=Ch1,Ch2`). Use `$in` query to match multiple chapters in `mcq_questions` collection |
| `app/mock-test/[board]/page.tsx` | **Rewrite** | Dynamic class 1-12, subjects, chapters from API |
| `app/mock-test/[board]/[class]/page.tsx` | **Edit** | Add chapter support, generation loading state |

---

## 6. Non-Goals

- Entrance exam flow (`/mock-test/entrance/*`) — unchanged
- Admin MCQ management panel — unchanged
- AI/LLM-based generation — using zero-cost pooling instead
- User authentication for mock tests — auth currently required only for submission, not test-taking
- Analytics/dashboard for school board tests — unchanged

---

## 7. Acceptance Criteria

1. Classes 11 and 12 appear as options on the class selection screen for all boards
2. Subjects shown are only those with solutions in the DB, not hardcoded
3. Chapters are shown as a multi-select checkbox list with "Select All"
4. Selecting chapters and starting a test navigates to the quiz with chapter info
5. MCQs are generated from solutions in the selected chapters using distractor pooling
6. Previously generated MCQs are served instantly (no regeneration)
7. If no MCQs exist, generation happens transparently with a loading indicator
8. At least 5 solutions must exist in selected chapters to generate a test
9. Chapter names with spaces/special characters work correctly in URLs
10. Results screen works identically to current behavior
