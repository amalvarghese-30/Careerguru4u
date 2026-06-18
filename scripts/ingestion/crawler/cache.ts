/**
 * Cache — atomic writes, batch flushing, and checkpoint save/load.
 *
 * Uses write-then-rename for atomicity (no partial writes on crash).
 * Batch flushing collects N writes before committing to disk.
 */
import * as fs from "fs";
import * as path from "path";
import { CACHE_DIR } from "../config";

// ─── Path helpers ─────────────────────────────────────────────────────

function cachePath(file: string): string {
  return path.join(CACHE_DIR, file);
}

function ensureDir(dir?: string): void {
  const target = dir || CACHE_DIR;
  if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
}

// ─── Atomic write ─────────────────────────────────────────────────────

function atomicWrite(filePath: string, data: unknown): void {
  const tmp = filePath + ".tmp." + Date.now().toString(36);
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tmp, filePath);
}

function readJson<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
  } catch {
    // Corrupt file — fall back
  }
  return fallback;
}

// ─── Visited pages ────────────────────────────────────────────────────

export interface VisitedEntry {
  visitedAt: string;
  status: number;
  type: string;
}

export interface VisitedPagesMap {
  [url: string]: VisitedEntry;
}

const VISITED_FILE = "visited-pages.json";
let visitedDirty = false;
let visitedData: VisitedPagesMap | null = null;

export function getVisitedPages(): VisitedPagesMap {
  if (!visitedData) {
    visitedData = readJson<VisitedPagesMap>(cachePath(VISITED_FILE), {});
  }
  return visitedData;
}

export function markVisited(url: string, status: number, type: string): void {
  const v = getVisitedPages();
  v[url] = { visitedAt: new Date().toISOString(), status, type };
  visitedDirty = true;
}

export function isVisited(url: string): boolean {
  return url in getVisitedPages();
}

export function flushVisited(): void {
  if (!visitedDirty || !visitedData) return;
  ensureDir();
  atomicWrite(cachePath(VISITED_FILE), visitedData);
  visitedDirty = false;
}

// ─── Task completion tracking ─────────────────────────────────────────

export interface CompletedTasksMap {
  [taskKey: string]: {
    completedAt: string;
    result: string; // "success" | "failed" | "skipped"
    error?: string;
  };
}

const TASKS_FILE = "completed-tasks.json";
let tasksDirty = false;
let tasksData: CompletedTasksMap | null = null;

export function getCompletedTasks(): CompletedTasksMap {
  if (!tasksData) {
    tasksData = readJson<CompletedTasksMap>(cachePath(TASKS_FILE), {});
  }
  return tasksData;
}

export function markTaskCompleted(taskKey: string, result: "success" | "failed" | "skipped", error?: string): void {
  const t = getCompletedTasks();
  t[taskKey] = { completedAt: new Date().toISOString(), result, error };
  tasksDirty = true;
}

export function isTaskCompleted(taskKey: string): boolean {
  return taskKey in getCompletedTasks();
}

export function flushTasks(): void {
  if (!tasksDirty || !tasksData) return;
  ensureDir();
  atomicWrite(cachePath(TASKS_FILE), tasksData);
  tasksDirty = false;
}

// ─── HTML page cache ──────────────────────────────────────────────────

export function getCachedHtml(key: string): string | null {
  const filePath = path.join(CACHE_DIR, "html", `${key}.html`);
  try {
    if (fs.existsSync(filePath)) return fs.readFileSync(filePath, "utf-8");
  } catch {}
  return null;
}

export function setCachedHtml(key: string, html: string): void {
  const dir = path.join(CACHE_DIR, "html");
  ensureDir(dir);
  atomicWrite(path.join(dir, `${key}.html`), html);
}

// ─── Checkpoint save/load ─────────────────────────────────────────────

export interface CheckpointData {
  phase: string;
  board?: string;
  class?: number;
  subject?: string;
  chapter?: string;
  questionIndex?: number;
  stats: {
    subjectsFound: number;
    booksFound: number;
    chaptersFound: number;
    questionsFound: number;
    solutionsFound: number;
    errors: string[];
  };
  timestamp: string;
}

export function saveCheckpoint(key: string, data: CheckpointData): void {
  ensureDir();
  atomicWrite(cachePath(`checkpoint-${key}.json`), data);
}

export function loadCheckpoint(key: string): CheckpointData | null {
  return readJson<CheckpointData | null>(cachePath(`checkpoint-${key}.json`), null);
}

export function listCheckpoints(): string[] {
  ensureDir();
  try {
    return fs
      .readdirSync(CACHE_DIR)
      .filter((f) => f.startsWith("checkpoint-") && f.endsWith(".json"))
      .map((f) => f.replace(/^checkpoint-/, "").replace(/\.json$/, ""));
  } catch {
    return [];
  }
}

// ─── Batch flush ──────────────────────────────────────────────────────

let flushInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Start auto-flushing every N ms. Call once at crawl start.
 */
export function startAutoFlush(intervalMs: number = 10_000): void {
  if (flushInterval) return;
  flushInterval = setInterval(flushAll, intervalMs);
}

/**
 * Stop auto-flush. Call at crawl end.
 */
export function stopAutoFlush(): void {
  if (flushInterval) {
    clearInterval(flushInterval);
    flushInterval = null;
  }
  flushAll();
}

export function flushAll(): void {
  flushVisited();
  flushTasks();
}
