"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, Save, X, Check, Undo2 } from "lucide-react";
import { BlockListEditor } from "./BlockListEditor";
import { AiEnhanceButton } from "./AiEnhanceButton";
import { SolutionViewer } from "../content/SolutionViewer";
import type { ContentBlock, SolutionStep } from "@/scripts/ingestion/types";

type QuestionType = "mcq" | "short" | "long" | "diagram" | "numerical" | "derivation";
type Difficulty = "easy" | "medium" | "hard";

interface EnhancedData {
  question: ContentBlock[];
  solution: SolutionStep[];
  questionType?: string;
  difficulty?: string;
  hints?: ContentBlock[];
}

interface SolutionBlockEditorProps {
  question: ContentBlock[];
  solution: SolutionStep[];
  questionType?: QuestionType;
  difficulty?: Difficulty;
  sourceUrl?: string;
  sourceType?: "scraped" | "manual" | "ai-enhanced";
  solutionId?: string;
  onSave: (data: {
    question: ContentBlock[];
    solution: SolutionStep[];
    questionType?: QuestionType;
    difficulty?: Difficulty;
    sourceType?: "scraped" | "manual" | "ai-enhanced";
    sourceUrl?: string;
  }) => void;
  onCancel: () => void;
}

export function SolutionBlockEditor({
  question: initialQuestion,
  solution: initialSolution,
  questionType: initialQuestionType,
  difficulty: initialDifficulty,
  sourceUrl: initialSourceUrl,
  sourceType: initialSourceType,
  solutionId,
  onSave,
  onCancel,
}: SolutionBlockEditorProps) {
  const [question, setQuestion] = useState<ContentBlock[]>(initialQuestion);
  const [steps, setSteps] = useState<SolutionStep[]>(initialSolution);
  const [questionType, setQuestionType] = useState<QuestionType | undefined>(initialQuestionType);
  const [difficulty, setDifficulty] = useState<Difficulty | undefined>(initialDifficulty);
  const [sourceUrl, setSourceUrl] = useState(initialSourceUrl || "");
  const [sourceType, setSourceType] = useState<"scraped" | "manual" | "ai-enhanced">(initialSourceType || "manual");
  const [showPreview, setShowPreview] = useState(false);

  // AI Enhancement state
  const [enhancedData, setEnhancedData] = useState<EnhancedData | null>(null);
  const [showEnhancedPreview, setShowEnhancedPreview] = useState(false);

  function addStep() {
    setSteps([
      ...steps,
      { stepNumber: steps.length + 1, blocks: [] },
    ]);
  }

  function updateStep(index: number, step: SolutionStep) {
    const next = [...steps];
    next[index] = step;
    setSteps(next.map((s, i) => ({ ...s, stepNumber: i + 1 })));
  }

  function deleteStep(index: number) {
    const next = steps.filter((_, i) => i !== index);
    setSteps(next.map((s, i) => ({ ...s, stepNumber: i + 1 })));
  }

  function moveStepUp(index: number) {
    if (index === 0) return;
    const next = [...steps];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setSteps(next.map((s, i) => ({ ...s, stepNumber: i + 1 })));
  }

  function moveStepDown(index: number) {
    if (index === steps.length - 1) return;
    const next = [...steps];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setSteps(next.map((s, i) => ({ ...s, stepNumber: i + 1 })));
  }

  function handleSave() {
    onSave({
      question,
      solution: steps,
      questionType,
      difficulty,
      sourceType,
      sourceUrl: sourceUrl || undefined,
    });
  }

  function applyEnhancement() {
    if (!enhancedData) return;
    setQuestion(enhancedData.question);
    setSteps(enhancedData.solution);
    if (enhancedData.questionType) setQuestionType(enhancedData.questionType as QuestionType);
    if (enhancedData.difficulty) setDifficulty(enhancedData.difficulty as Difficulty);
    setSourceType("ai-enhanced");
    setEnhancedData(null);
  }

  function discardEnhancement() {
    setEnhancedData(null);
    setShowEnhancedPreview(false);
  }

  return (
    <div className="flex flex-col max-h-[90vh]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
        <h2 className="text-lg font-semibold text-slate-800">Block Content Editor</h2>
        <div className="flex items-center gap-2">
          {solutionId && !enhancedData && (
            <AiEnhanceButton
              solutionId={solutionId}
              question={question}
              solution={steps}
              onEnhanced={setEnhancedData}
            />
          )}
          {enhancedData && (
            <>
              <button
                onClick={applyEnhancement}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium"
              >
                <Check className="h-3.5 w-3.5" />
                Apply Enhancement
              </button>
              <button
                onClick={discardEnhancement}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
              >
                <Undo2 className="h-3.5 w-3.5" />
                Discard
              </button>
            </>
          )}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
          >
            {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showPreview ? "Edit" : "Preview"}
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs rounded-lg bg-brand-royal text-white hover:bg-brand-navy font-medium"
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </button>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Enhanced data banner */}
      {enhancedData && (
        <div className="px-6 py-3 bg-purple-50 border-b border-purple-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-purple-700">AI Enhancement Ready</span>
            <span className="text-xs text-purple-600">
              {enhancedData.questionType && `Type: ${enhancedData.questionType}`}
              {enhancedData.difficulty && ` • Difficulty: ${enhancedData.difficulty}`}
              {enhancedData.hints && enhancedData.hints.length > 0 && ` • ${enhancedData.hints.length} hint(s)`}
            </span>
          </div>
          <button
            onClick={() => setShowEnhancedPreview(!showEnhancedPreview)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg border border-purple-300 bg-white text-purple-700 hover:bg-purple-100"
          >
            {showEnhancedPreview ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {showEnhancedPreview ? "Hide Preview" : "Preview Enhanced"}
          </button>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Enhancement comparison */}
        {enhancedData && showEnhancedPreview && (
          <div className="rounded-xl border-2 border-purple-300 bg-purple-50/30 p-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Enhanced Version Preview</span>
            </div>
            <SolutionViewer
              question={enhancedData.question}
              solution={enhancedData.solution}
              questionType={enhancedData.questionType}
              difficulty={enhancedData.difficulty}
            />
            {enhancedData.hints && enhancedData.hints.length > 0 && (
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <p className="text-xs font-semibold text-blue-600 mb-2">Hints</p>
                <SolutionViewer question={enhancedData.hints} solution={[]} />
              </div>
            )}
          </div>
        )}

        {showPreview ? (
          <SolutionViewer
            question={question}
            solution={steps}
            questionType={questionType}
            difficulty={difficulty}
          />
        ) : (
          <>
            {/* Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Question Type</label>
                <select
                  value={questionType || ""}
                  onChange={(e) => setQuestionType((e.target.value as QuestionType) || undefined)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
                >
                  <option value="">None</option>
                  <option value="mcq">MCQ</option>
                  <option value="short">Short Answer</option>
                  <option value="long">Long Answer</option>
                  <option value="diagram">Diagram</option>
                  <option value="numerical">Numerical</option>
                  <option value="derivation">Derivation</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Difficulty</label>
                <select
                  value={difficulty || ""}
                  onChange={(e) => setDifficulty((e.target.value as Difficulty) || undefined)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
                >
                  <option value="">None</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Source Type</label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value as "scraped" | "manual" | "ai-enhanced")}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
                >
                  <option value="manual">Manual</option>
                  <option value="scraped">Scraped</option>
                  <option value="ai-enhanced">AI Enhanced</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Source URL</label>
                <input
                  type="text"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
                />
              </div>
            </div>

            {/* Question Section */}
            <BlockListEditor blocks={question} onChange={setQuestion} label="Question Blocks" />

            {/* Solution Steps */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  Solution Steps ({steps.length})
                </span>
                <button
                  onClick={addStep}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 text-brand-royal font-medium"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Step
                </button>
              </div>

              {steps.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                  No solution steps yet. Click "Add Step" to get started.
                </div>
              ) : (
                steps.map((step, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3 bg-brand-bg/50 border-b border-slate-100">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-royal text-white text-xs font-bold flex-shrink-0">
                        {step.stepNumber}
                      </span>
                      <input
                        type="text"
                        value={step.title || ""}
                        onChange={(e) => updateStep(i, { ...step, title: e.target.value || undefined })}
                        placeholder={`Step ${step.stepNumber} title (optional)...`}
                        className="flex-1 px-2 py-1 rounded border border-transparent hover:border-slate-200 focus:border-brand-royal focus:outline-none bg-transparent text-sm text-slate-700"
                      />
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => moveStepUp(i)}
                          disabled={i === 0}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 disabled:opacity-30"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => moveStepDown(i)}
                          disabled={i === steps.length - 1}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 disabled:opacity-30"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteStep(i)}
                          className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <BlockListEditor
                        blocks={step.blocks}
                        onChange={(blocks) => updateStep(i, { ...step, blocks })}
                        label={`Step ${step.stepNumber} Blocks`}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
