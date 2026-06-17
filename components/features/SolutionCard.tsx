"use client";

import { useEffect, useRef } from "react";
import { decodeEntities, formatSolutionSteps } from "@/lib/math-renderer";
import { Bookmark, Share2, ChevronLeft, ChevronRight, CheckCircle2, Lightbulb, GraduationCap } from "lucide-react";

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
}

function MathContent({ text }: { text: string }) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    // Import katex dynamically to avoid SSR issues
    import("katex").then((katex) => {
      if (!containerRef.current) return;
      try {
        // Find inline math expressions: $...$ patterns
        const mathPattern = /\$([^$]+)\$/g;
        const parts: Array<{ type: "text" | "math"; content: string }> = [];
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = mathPattern.exec(text)) !== null) {
          if (match.index > lastIndex) {
            parts.push({ type: "text", content: text.slice(lastIndex, match.index) });
          }
          parts.push({ type: "math", content: match[1] });
          lastIndex = match.index + match[0].length;
        }
        if (lastIndex < text.length) {
          parts.push({ type: "text", content: text.slice(lastIndex) });
        }

        if (parts.length === 0) {
          // No $...$ patterns found, render the text as-is
          containerRef.current.textContent = text;
          return;
        }

        containerRef.current.innerHTML = "";
        for (const part of parts) {
          if (part.type === "math") {
            const span = document.createElement("span");
            katex.default.render(part.content.trim(), span, {
              throwOnError: false,
              displayMode: false,
              output: "html",
            });
            containerRef.current.appendChild(span);
          } else {
            const span = document.createElement("span");
            span.textContent = part.content;
            containerRef.current.appendChild(span);
          }
        }
      } catch {
        containerRef.current.textContent = text;
      }
    }).catch(() => {
      if (containerRef.current) {
        containerRef.current.textContent = text;
      }
    });
  }, [text]);

  return <span ref={containerRef} className="math-content" />;
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
}: SolutionCardProps) {
  const decodedQuestion = decodeEntities(question);
  const decodedAnswer = decodeEntities(answer);
  const steps = formatSolutionSteps(decodedAnswer);

  return (
    <div className="space-y-6">
      {/* Navigation Bar */}
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

      {/* Question Card */}
      <div className="rounded-2xl border border-neutral-lightGray bg-white p-5 md:p-6">
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-brand-bg text-brand-royal font-bold text-sm flex items-center justify-center">
            Q
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-base md:text-lg font-medium text-neutral-nearBlack leading-relaxed math-content">
              {decodedQuestion}
            </p>
          </div>
        </div>
      </div>

      {/* Solution Section */}
      {answer && answer !== "LOGIN_REQUIRED" && (
        <div className="rounded-2xl border border-brand-royal/10 bg-gradient-to-br from-brand-bg/50 to-white overflow-hidden">
          {/* Solution Header */}
          <div className="px-5 md:px-6 py-4 bg-brand-royal/5 border-b border-brand-royal/10">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-brand-royal" />
              <h3 className="font-sora font-semibold text-brand-navy text-base">Step-by-Step Solution</h3>
            </div>
          </div>

          {/* Solution Steps */}
          <div className="p-5 md:p-6 space-y-4">
            {steps.length === 0 && (
              <div className="p-4 rounded-xl bg-brand-bg/50 border border-brand-royal/5">
                <MathContent text={decodedAnswer} />
              </div>
            )}

            {steps.map((step, idx) => {
              if (step.type === "step" && step.stepNumber) {
                return (
                  <div
                    key={idx}
                    className="rounded-xl bg-white border border-neutral-lightGray/80 p-4 md:p-5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-royal text-white text-xs font-bold flex items-center justify-center">
                        {step.stepNumber}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm md:text-base text-neutral-darkGray font-mono leading-relaxed math-content">
                          {step.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }

              if (step.type === "heading") {
                return (
                  <div key={idx} className="flex items-center gap-2 pt-1">
                    <Lightbulb className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    <p className="text-sm font-semibold text-neutral-nearBlack math-content">
                      {step.content}
                    </p>
                  </div>
                );
              }

              if (step.type === "final-answer") {
                return (
                  <div
                    key={idx}
                    className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 md:p-5"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                        Final Answer
                      </span>
                    </div>
                    <p className="text-sm md:text-base text-emerald-900 font-semibold font-mono leading-relaxed math-content">
                      {step.content}
                    </p>
                  </div>
                );
              }

              // Plain text
              return (
                <div key={idx} className="py-1">
                  <p className="text-sm md:text-base text-neutral-darkGray leading-relaxed math-content">
                    {step.content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Prev/Next Navigation */}
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
    </div>
  );
}
