"use client";

import { useState } from "react";
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import type { ContentBlock, SolutionStep } from "@/scripts/ingestion/types";

interface EnhancedData {
  question: ContentBlock[];
  solution: SolutionStep[];
  questionType?: string;
  difficulty?: string;
  hints?: ContentBlock[];
}

interface AiEnhanceButtonProps {
  solutionId: string;
  question: ContentBlock[];
  solution: SolutionStep[];
  onEnhanced: (data: EnhancedData) => void;
  disabled?: boolean;
}

export function AiEnhanceButton({ solutionId, question, solution, onEnhanced, disabled }: AiEnhanceButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleEnhance() {
    if (state === "loading") return;
    setState("loading");
    setError("");

    try {
      // If blocks exist locally but not in DB yet, skip the API preview and just enhance locally
      const hasBlocks = question.length > 0 || solution.length > 0;

      const res = await fetch("/api/admin/solutions/ai-enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solutionId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Enhancement failed");
      }

      if (data.enhanced) {
        onEnhanced(data.enhanced);
        setState("success");
      } else {
        throw new Error("No enhanced data returned");
      }
    } catch (err) {
      setState("error");
      setError((err as Error).message);
    }
  }

  function reset() {
    setState("idle");
    setError("");
  }

  return (
    <div className="flex items-center gap-2">
      {state === "idle" && (
        <button
          onClick={handleEnhance}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:border-purple-300 disabled:opacity-50 font-medium transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Enhance with AI
        </button>
      )}

      {state === "loading" && (
        <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-purple-200 bg-purple-50 text-purple-600 font-medium">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Enhancing...
        </span>
      )}

      {state === "success" && (
        <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-green-200 bg-green-50 text-green-700 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Enhanced!
        </span>
      )}

      {state === "error" && (
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-red-200 bg-red-50 text-red-700 font-medium">
            <AlertCircle className="h-3.5 w-3.5" />
            {error || "Failed"}
          </span>
          <button onClick={reset} className="text-xs text-slate-500 hover:text-slate-700 underline">
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
