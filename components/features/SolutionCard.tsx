"use client";

import { Bookmark, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import type { ContentBlock, SolutionStep } from "@/scripts/ingestion/types";
import { SolutionViewer } from "@/components/content/SolutionViewer";

interface SolutionCardProps {
  questionNumber: number;
  totalQuestions?: number;
  question: string;
  answer: string;
  isFree: boolean;
  isBookmarked?: boolean;
  onBookmark?: () => void;
  onShare?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  chapterName?: string;
  // Block-based content (takes precedence when available)
  questionBlocks?: ContentBlock[];
  solutionSteps?: SolutionStep[];
  questionType?: string;
  difficulty?: string;
}

function NavBar({
  questionNumber,
  totalQuestions,
  chapterName,
  isBookmarked,
  onBookmark,
  onShare,
}: {
  questionNumber: number;
  totalQuestions?: number;
  chapterName?: string;
  isBookmarked: boolean;
  onBookmark?: () => void;
  onShare?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <div className="flex items-center gap-2">
        <span className="px-3 py-1.5 rounded-full bg-brand-royal/10 text-brand-royal text-xs font-semibold">
          Q{questionNumber}
          {totalQuestions && ` / ${totalQuestions}`}
        </span>
        {chapterName && (
          <span className="text-xs text-neutral-darkGray hidden sm:inline">{chapterName}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {onBookmark && (
          <button
            onClick={onBookmark}
            className={`p-2 rounded-lg transition-colors ${
              isBookmarked
                ? "bg-brand-royal/10 text-brand-royal"
                : "bg-neutral-offWhite text-neutral-darkGray hover:bg-brand-bg"
            }`}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark question"}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-brand-royal" : ""}`} />
          </button>
        )}
        {onShare && (
          <button
            onClick={onShare}
            className="p-2 rounded-lg bg-neutral-offWhite text-neutral-darkGray hover:bg-brand-bg transition-colors"
            aria-label="Share question"
          >
            <Share2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function NavFooter({ onPrev, onNext }: { onPrev?: () => void; onNext?: () => void }) {
  return (
    <div className="flex items-center justify-between pt-2">
      <button
        onClick={onPrev}
        disabled={!onPrev}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-lightGray text-neutral-darkGray font-medium text-sm hover:bg-brand-bg hover:border-brand-royal/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>
      <button
        onClick={onNext}
        disabled={!onNext}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-lightGray text-neutral-darkGray font-medium text-sm hover:bg-brand-bg hover:border-brand-royal/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export function SolutionCard({
  questionNumber,
  totalQuestions,
  question,
  answer,
  isFree,
  isBookmarked = false,
  onBookmark,
  onShare,
  onPrev,
  onNext,
  chapterName,
  questionBlocks,
  solutionSteps,
  questionType,
  difficulty,
}: SolutionCardProps) {
  const hasBlocks = !!(questionBlocks || solutionSteps);
  const resolvedQuestion = questionBlocks || question;
  const resolvedSolution = solutionSteps || (answer === "LOGIN_REQUIRED" ? "" : answer);

  return (
    <div className="space-y-6">
      <NavBar
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        chapterName={chapterName}
        isBookmarked={isBookmarked}
        onBookmark={onBookmark}
        onShare={onShare}
      />

      <SolutionViewer
        question={resolvedQuestion}
        solution={resolvedSolution}
        questionType={questionType}
        difficulty={difficulty}
      />

      <NavFooter onPrev={onPrev} onNext={onNext} />
    </div>
  );
}
