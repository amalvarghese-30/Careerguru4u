/**
 * Review queue — manages the list of solutions that need manual review.
 *
 * Items are added automatically when validation finds issues, and can be
 * removed once an admin has reviewed the content.
 */
import * as fs from "fs";
import * as path from "path";
import { REVIEW_DIR } from "../config";
import type { ValidationIssue } from "../types";

export interface ReviewItem {
  addedAt: string;
  url: string;
  board: string;
  class: number;
  subject: string;
  chapter: string;
  questionNumber: string;
  issues: ValidationIssue[];
  reviewed: boolean;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface ReviewQueue {
  items: ReviewItem[];
  updatedAt: string;
}

const QUEUE_PATH = path.join(REVIEW_DIR, "review-required.json");

function ensureDir(): void {
  if (!fs.existsSync(REVIEW_DIR)) fs.mkdirSync(REVIEW_DIR, { recursive: true });
}

function loadQueue(): ReviewQueue {
  ensureDir();
  try {
    if (fs.existsSync(QUEUE_PATH)) {
      return JSON.parse(fs.readFileSync(QUEUE_PATH, "utf-8"));
    }
  } catch {}
  return { items: [], updatedAt: new Date().toISOString() };
}

function saveQueue(queue: ReviewQueue): void {
  ensureDir();
  queue.updatedAt = new Date().toISOString();
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2), "utf-8");
}

export function addToReviewQueue(
  url: string,
  board: string,
  classNum: number,
  subject: string,
  chapter: string,
  questionNumber: string,
  issues: ValidationIssue[]
): void {
  const queue = loadQueue();

  // Don't duplicate
  const existing = queue.items.find((i) => i.url === url);
  if (existing) {
    existing.issues = issues;
    existing.reviewed = false;
    existing.reviewedAt = undefined;
    existing.reviewedBy = undefined;
  } else {
    queue.items.push({
      addedAt: new Date().toISOString(),
      url,
      board,
      class: classNum,
      subject,
      chapter,
      questionNumber,
      issues,
      reviewed: false,
    });
  }

  saveQueue(queue);
}

export function getReviewQueue(): ReviewQueue {
  return loadQueue();
}

export function removeFromReviewQueue(url: string, reviewedBy?: string): void {
  const queue = loadQueue();
  const item = queue.items.find((i) => i.url === url);
  if (item) {
    item.reviewed = true;
    item.reviewedAt = new Date().toISOString();
    item.reviewedBy = reviewedBy;
  }
  saveQueue(queue);
}
