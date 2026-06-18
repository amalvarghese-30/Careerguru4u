"use client";

import type { ContentBlock, SolutionStep } from "@/scripts/ingestion/types";
import { MathRenderer } from "./MathRenderer";
import { BlockRenderer } from "./BlockRenderer";
import { GraduationCap, CheckCircle2, Lightbulb } from "lucide-react";

interface SolutionViewerProps {
  question: ContentBlock[] | string;
  solution: SolutionStep[] | string;
  questionType?: string;
  difficulty?: string;
}

/**
 * Unified solution viewer that handles both structured blocks and legacy strings.
 *
 * When `question`/`solution` are arrays of ContentBlock/SolutionStep, renders
 * using the typed block renderer. When strings, falls back to math-enhanced text.
 */
export function SolutionViewer({ question, solution, questionType, difficulty }: SolutionViewerProps) {
  const questionBlocks = Array.isArray(question) ? question : null;
  const solutionSteps = Array.isArray(solution) ? solution : null;
  const questionText = typeof question === "string" ? question : "";
  const solutionText = typeof solution === "string" ? solution : "";

  return (
    <div className="space-y-6">
      {/* Question Section */}
      <div className="rounded-2xl border border-neutral-lightGray bg-white p-5 md:p-6">
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-brand-bg text-brand-royal font-bold text-sm flex items-center justify-center">
            Q
          </span>
          <div className="flex-1 min-w-0">
            {questionBlocks ? (
              <div className="space-y-2">
                {questionBlocks.map((block) => (
                  <BlockRenderer key={block.id} block={block} />
                ))}
              </div>
            ) : (
              <p className="text-base md:text-lg font-medium text-neutral-nearBlack leading-relaxed">
                <MathRenderer text={questionText} />
              </p>
            )}
            {(questionType || difficulty) && (
              <div className="flex items-center gap-2 mt-3">
                {questionType && (
                  <span className="px-2 py-0.5 rounded-md bg-brand-bg/50 text-brand-royal text-xs font-medium capitalize">
                    {questionType}
                  </span>
                )}
                {difficulty && (
                  <span className={[
                    "px-2 py-0.5 rounded-md text-xs font-medium capitalize",
                    difficulty === "easy" ? "bg-emerald-50 text-emerald-700" :
                    difficulty === "hard" ? "bg-red-50 text-red-700" :
                    "bg-amber-50 text-amber-700",
                  ].join(" ")}>
                    {difficulty}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Solution Section */}
      {solutionSteps && solutionSteps.length > 0 ? (
        <div className="rounded-2xl border border-brand-royal/10 bg-gradient-to-br from-brand-bg/50 to-white overflow-hidden">
          <div className="px-5 md:px-6 py-4 bg-brand-royal/5 border-b border-brand-royal/10">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-brand-royal" />
              <h3 className="font-sora font-semibold text-brand-navy text-base">Step-by-Step Solution</h3>
            </div>
          </div>

          <div className="p-5 md:p-6 space-y-4">
            {solutionSteps.map((step) => (
              <SolutionStepCard key={step.stepNumber} step={step} />
            ))}
          </div>
        </div>
      ) : solutionText ? (
        <div className="rounded-2xl border border-brand-royal/10 bg-gradient-to-br from-brand-bg/50 to-white overflow-hidden">
          <div className="px-5 md:px-6 py-4 bg-brand-royal/5 border-b border-brand-royal/10">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-brand-royal" />
              <h3 className="font-sora font-semibold text-brand-navy text-base">Solution</h3>
            </div>
          </div>
          <div className="p-5 md:p-6">
            <p className="text-sm md:text-base text-neutral-darkGray leading-relaxed">
              <MathRenderer text={solutionText} />
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SolutionStepCard({ step }: { step: SolutionStep }) {
  return (
    <div className="rounded-xl bg-white border border-neutral-lightGray/80 p-4 md:p-5">
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-royal text-white text-xs font-bold flex items-center justify-center">
          {step.stepNumber}
        </span>
        <div className="flex-1 min-w-0 space-y-2">
          {step.title && (
            <p className="text-sm font-semibold text-neutral-nearBlack">{step.title}</p>
          )}
          {step.blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} />
          ))}
        </div>
      </div>
    </div>
  );
}
