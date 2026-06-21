"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Search, Trash2, Eye, Plus, Edit3, X, Save, Upload, LayoutGrid,
  ChevronRight, ArrowLeft, GraduationCap, BookMarked, FileText, Hash
} from "lucide-react";
import { SolutionBlockEditor } from "@/components/admin/SolutionBlockEditor";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { ContentBlock, SolutionStep } from "@/scripts/ingestion/types";

interface Solution {
  _id: string;
  question: string;
  answer: string;
  questionHtml?: string;
  answerHtml?: string;
  board: string;
  class: number;
  subject: string;
  chapter: string;
  questionNumber: number;
  isFree: boolean;
  viewCount: number;
  helpfulCount: number;
  createdAt: string;
  questionBlocks?: ContentBlock[];
  solutionSteps?: SolutionStep[];
  questionType?: string;
  difficulty?: string;
  version?: number;
  sourceType?: string;
  sourceUrl?: string;
}

interface FilterData {
  boards?: string[];
  classes?: number[];
  subjects?: string[];
  chapters?: string[];
  counts: Record<string, number>;
}

type ViewState = "boards" | "classes" | "subjects" | "chapters" | "solutions";

const BOARDS = ["CBSE", "ICSE", "Maharashtra Board"];
const CLASSES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const BOARD_DESCRIPTIONS: Record<string, string> = {
  "CBSE": "Central Board of Secondary Education",
  "ICSE": "Indian Certificate of Secondary Education",
  "Maharashtra Board": "Maharashtra State Board of Secondary & Higher Secondary Education",
};
const BOARD_COLORS: Record<string, string> = {
  "CBSE": "from-blue-600 to-blue-400",
  "ICSE": "from-indigo-600 to-indigo-400",
  "Maharashtra Board": "from-emerald-600 to-emerald-400",
};

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').trim();
}

export default function SolutionsAdminPage() {
  // Navigation state
  const [view, setView] = useState<ViewState>("boards");
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");

  // Data
  const [filterData, setFilterData] = useState<FilterData>({ counts: {} });
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Selection
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);

  // Edit modal
  const [showEditor, setShowEditor] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [editing, setEditing] = useState<Partial<Solution>>({});
  const [editQuestionHtml, setEditQuestionHtml] = useState("");
  const [editAnswerHtml, setEditAnswerHtml] = useState("");
  const [saving, setSaving] = useState(false);

  // Block editor modal
  const [showBlockEditor, setShowBlockEditor] = useState(false);
  const [blockEditSolution, setBlockEditSolution] = useState<Solution | null>(null);
  const [blockSaving, setBlockSaving] = useState(false);

  // Bulk import
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkJson, setBulkJson] = useState("");
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkResult, setBulkResult] = useState("");

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  const fetchFilters = useCallback(async (params: URLSearchParams) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/solutions/filters?${params}`);
      const data = await res.json();
      if (res.ok) setFilterData(data);
    } catch (err) {
      console.error("Failed to fetch filters:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSolutions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBoard) params.set("board", selectedBoard);
      if (selectedClass) params.set("class", String(selectedClass));
      if (selectedSubject) params.set("subject", selectedSubject);
      if (selectedChapter) params.set("chapter", selectedChapter);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/admin/solutions?${params}`);
      const data = await res.json();
      setSolutions(data.solutions || []);
    } catch (err) {
      console.error("Failed to fetch solutions:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedBoard, selectedClass, selectedSubject, selectedChapter, searchQuery]);

  useEffect(() => {
    fetchFilters(new URLSearchParams());
  }, [fetchFilters]);

  useEffect(() => {
    if (view === "solutions") fetchSolutions();
  }, [view, fetchSolutions]);

  // Navigation handlers
  const goTo = (to: ViewState) => {
    setView(to);
    setSelectedSolution(null);
    if (to === "boards") {
      setSelectedBoard("");
      setSelectedClass(null);
      setSelectedSubject("");
      setSelectedChapter("");
      fetchFilters(new URLSearchParams());
    }
  };

  const selectBoard = async (board: string) => {
    setSelectedBoard(board);
    setSelectedClass(null);
    setSelectedSubject("");
    setSelectedChapter("");
    setView("classes");
    await fetchFilters(new URLSearchParams({ board }));
  };

  const selectClass = async (classNum: number) => {
    setSelectedClass(classNum);
    setSelectedSubject("");
    setSelectedChapter("");
    setView("subjects");
    await fetchFilters(new URLSearchParams({ board: selectedBoard, class: String(classNum) }));
  };

  const selectSubject = async (subject: string) => {
    setSelectedSubject(subject);
    setSelectedChapter("");
    setView("chapters");
    await fetchFilters(new URLSearchParams({ board: selectedBoard, class: String(selectedClass), subject }));
  };

  const selectChapter = (chapter: string) => {
    setSelectedChapter(chapter);
    setView("solutions");
  };

  // Edit handlers
  const openNew = () => {
    setEditing({
      board: selectedBoard || "CBSE",
      class: selectedClass || 10,
      subject: selectedSubject || "",
      chapter: selectedChapter || "",
      question: "",
      answer: "",
      questionNumber: 1,
      isFree: true,
    });
    setEditQuestionHtml("");
    setEditAnswerHtml("");
    setIsNew(true);
    setShowEditor(true);
  };

  const openEdit = (s: Solution) => {
    setEditing({ ...s });
    setEditQuestionHtml(s.questionHtml || "");
    setEditAnswerHtml(s.answerHtml || "");
    setIsNew(false);
    setShowEditor(true);
  };

  const handleSave = async () => {
    const questionText = editQuestionHtml ? stripHtml(editQuestionHtml) : editing.question || "";
    const answerText = editAnswerHtml ? stripHtml(editAnswerHtml) : editing.answer || "";

    if (!questionText || !answerText || !editing.board || !editing.class || !editing.subject || !editing.chapter) {
      setMessage("Please fill all required fields");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const body: Record<string, unknown> = {
        question: questionText,
        answer: answerText,
        questionHtml: editQuestionHtml || undefined,
        answerHtml: editAnswerHtml || undefined,
        board: editing.board,
        class: editing.class,
        subject: editing.subject,
        chapter: editing.chapter,
        questionNumber: editing.questionNumber || 1,
        isFree: editing.isFree ?? true,
      };

      if (!isNew) body._id = (editing as Solution)._id;

      const res = await fetch("/api/admin/solutions", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowEditor(false);
        setEditing({});
        setEditQuestionHtml("");
        setEditAnswerHtml("");
        if (view === "solutions") fetchSolutions();
        setMessage(isNew ? "Solution created" : "Solution updated");
      } else {
        const data = await res.json();
        setMessage(data.error || "Save failed");
      }
    } catch {
      setMessage("Save failed");
    } finally {
      setSaving(false);
    }
  };

  // Block editor
  const openBlockEditor = (s: Solution) => {
    setBlockEditSolution(s);
    setShowBlockEditor(true);
  };

  const handleBlockSave = async (data: {
    question: ContentBlock[];
    solution: SolutionStep[];
    questionType?: string;
    difficulty?: string;
    sourceType?: string;
    sourceUrl?: string;
  }) => {
    if (!blockEditSolution) return;
    setBlockSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/solutions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: blockEditSolution._id,
          questionBlocks: data.question,
          solutionSteps: data.solution,
          questionType: data.questionType || undefined,
          difficulty: data.difficulty || undefined,
          sourceType: data.sourceType || "manual",
          sourceUrl: data.sourceUrl || "",
        }),
      });
      if (res.ok) {
        setShowBlockEditor(false);
        setBlockEditSolution(null);
        if (view === "solutions") fetchSolutions();
        setMessage("Solution blocks updated");
      } else {
        const errData = await res.json();
        setMessage(errData.error || "Block save failed");
      }
    } catch {
      setMessage("Block save failed");
    } finally {
      setBlockSaving(false);
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/solutions?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      setSolutions(prev => prev.filter(s => s._id !== id));
      if (selectedSolution?._id === id) setSelectedSolution(null);
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Bulk import
  const handleBulkImport = async () => {
    setBulkImporting(true);
    setBulkResult("");
    try {
      let parsed: any[];
      try {
        parsed = JSON.parse(bulkJson);
      } catch {
        setBulkResult("Invalid JSON. Please paste a valid JSON array.");
        setBulkImporting(false);
        return;
      }

      if (!Array.isArray(parsed) || parsed.length === 0) {
        setBulkResult("JSON must be a non-empty array of solution objects.");
        setBulkImporting(false);
        return;
      }

      let success = 0;
      let failed = 0;

      for (const item of parsed) {
        if (!item.question || !item.answer || !item.board || !item.class || !item.subject || !item.chapter) {
          failed++;
          continue;
        }
        try {
          const res = await fetch("/api/admin/solutions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
          });
          if (res.ok) success++;
          else failed++;
        } catch {
          failed++;
        }
      }

      setBulkResult(`Imported ${success} solutions. ${failed > 0 ? `${failed} failed.` : ""}`);
      if (success > 0) {
        if (view === "solutions") fetchSolutions();
        setBulkJson("");
      }
    } catch {
      setBulkResult("Import failed");
    } finally {
      setBulkImporting(false);
    }
  };

  // Breadcrumb
  const breadcrumb = (
    <div className="flex items-center gap-1.5 text-sm flex-wrap">
      <button onClick={() => goTo("boards")} className={`transition-colors ${view === "boards" ? "font-semibold text-slate-800" : "text-slate-500 hover:text-brand-royal"}`}>
        Solutions
      </button>
      {selectedBoard && (
        <>
          <ChevronRight className="h-4 w-4 text-slate-300" />
          <button onClick={() => goTo("classes")} className={`transition-colors ${view === "classes" ? "font-semibold text-slate-800" : "text-slate-500 hover:text-brand-royal"}`}>
            {selectedBoard}
          </button>
        </>
      )}
      {selectedClass && (
        <>
          <ChevronRight className="h-4 w-4 text-slate-300" />
          <button onClick={() => selectClass(selectedClass)} className={`transition-colors ${view === "subjects" ? "font-semibold text-slate-800" : "text-slate-500 hover:text-brand-royal"}`}>
            Class {selectedClass}
          </button>
        </>
      )}
      {selectedSubject && (
        <>
          <ChevronRight className="h-4 w-4 text-slate-300" />
          <button onClick={() => selectSubject(selectedSubject)} className={`transition-colors ${view === "chapters" ? "font-semibold text-slate-800" : "text-slate-500 hover:text-brand-royal"}`}>
            {selectedSubject}
          </button>
        </>
      )}
      {selectedChapter && view === "solutions" && (
        <>
          <ChevronRight className="h-4 w-4 text-slate-300" />
          <span className="font-semibold text-slate-800 truncate max-w-[300px]">{selectedChapter}</span>
        </>
      )}
    </div>
  );

  // Back button
  const backButton = view !== "boards" && (
    <button
      onClick={() => {
        if (view === "classes") goTo("boards");
        else if (view === "subjects") selectBoard(selectedBoard);
        else if (view === "chapters") selectClass(selectedClass!);
        else if (view === "solutions") selectSubject(selectedSubject);
      }}
      className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Solutions Management</h1>
          <p className="text-slate-500 text-sm mt-1">Browse and edit textbook solutions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBulkImport(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
          >
            <Upload className="h-4 w-4" /> Bulk Import
          </button>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-gradient-static text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
          >
            <Plus className="h-4 w-4" /> Add Solution
          </button>
        </div>
      </div>

      {/* Navigation bar */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3">
        {breadcrumb}
        {backButton}
      </div>

      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`text-sm px-4 py-3 rounded-xl ${
              message.includes("failed") || message.includes("error")
                ? "text-red-600 bg-red-50"
                : "text-green-600 bg-green-50"
            }`}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content area */}
      {view === "boards" && (
        <BoardSelector
          boards={filterData.boards || BOARDS}
          counts={filterData.counts}
          onSelect={selectBoard}
          loading={loading}
        />
      )}

      {view === "classes" && (
        <ClassSelector
          classes={filterData.classes || CLASSES}
          counts={filterData.counts}
          onSelect={selectClass}
          loading={loading}
        />
      )}

      {view === "subjects" && (
        <SubjectSelector
          subjects={filterData.subjects || []}
          counts={filterData.counts}
          onSelect={selectSubject}
          loading={loading}
        />
      )}

      {view === "chapters" && (
        <ChapterSelector
          chapters={filterData.chapters || []}
          counts={filterData.counts}
          onSelect={selectChapter}
          loading={loading}
        />
      )}

      {view === "solutions" && (
        <SolutionsView
          solutions={solutions}
          loading={loading}
          selected={selectedSolution}
          onSelect={setSelectedSolution}
          onEdit={openEdit}
          onBlockEdit={openBlockEditor}
          onDelete={(id) => setDeleteConfirm(id)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={fetchSolutions}
        />
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditor && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-10 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowEditor(false); setEditing({}); }}
              className="absolute inset-0 bg-black/50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
                <h3 className="font-semibold text-slate-800 text-lg">
                  {isNew ? "Add Solution" : "Edit Solution"}
                </h3>
                <button
                  onClick={() => { setShowEditor(false); setEditing({}); }}
                  className="p-2 rounded-lg hover:bg-slate-100"
                >
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Board *</label>
                    <select
                      value={editing.board || ""}
                      onChange={(e) => setEditing({ ...editing, board: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
                    >
                      {BOARDS.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Class *</label>
                    <select
                      value={editing.class || ""}
                      onChange={(e) => setEditing({ ...editing, class: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
                    >
                      {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Subject *</label>
                    <input
                      type="text"
                      value={editing.subject || ""}
                      onChange={(e) => setEditing({ ...editing, subject: e.target.value })}
                      placeholder="e.g. Science"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Chapter *</label>
                    <input
                      type="text"
                      value={editing.chapter || ""}
                      onChange={(e) => setEditing({ ...editing, chapter: e.target.value })}
                      placeholder="Chapter name"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Q#</label>
                    <input
                      type="number"
                      value={editing.questionNumber || 1}
                      onChange={(e) => setEditing({ ...editing, questionNumber: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editing.isFree ?? true}
                      onChange={(e) => setEditing({ ...editing, isFree: e.target.checked })}
                      className="rounded border-slate-300 text-brand-royal focus:ring-brand-royal"
                    />
                    <span className="text-sm text-slate-600">Free access</span>
                  </label>
                </div>

                {/* Question Editor */}
                <RichTextEditor
                  label="Question"
                  content={editQuestionHtml || editing.question || ""}
                  onChange={setEditQuestionHtml}
                  placeholder="Enter the question..."
                />

                {/* Answer Editor */}
                <RichTextEditor
                  label="Answer / Solution"
                  content={editAnswerHtml || editing.answer || ""}
                  onChange={setEditAnswerHtml}
                  placeholder="Enter the step-by-step solution..."
                />
              </div>

              {/* Footer */}
              <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  onClick={() => { setShowEditor(false); setEditing({}); }}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-brand-gradient-static text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? "Saving..." : <><Save className="h-4 w-4" /> {isNew ? "Create Solution" : "Save Changes"}</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Block Editor Modal */}
      <AnimatePresence>
        {showBlockEditor && blockEditSolution && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-12 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowBlockEditor(false); setBlockEditSolution(null); }}
              className="absolute inset-0 bg-black/50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl"
            >
              <SolutionBlockEditor
                question={blockEditSolution.questionBlocks || []}
                solution={blockEditSolution.solutionSteps || []}
                questionType={blockEditSolution.questionType as "mcq" | "short" | "long" | "diagram" | "numerical" | "derivation" | undefined}
                difficulty={blockEditSolution.difficulty as "easy" | "medium" | "hard" | undefined}
                sourceUrl={blockEditSolution.sourceUrl}
                sourceType={blockEditSolution.sourceType as "scraped" | "manual" | "ai-enhanced" | undefined}
                solutionId={blockEditSolution._id}
                onSave={handleBlockSave}
                onCancel={() => { setShowBlockEditor(false); setBlockEditSolution(null); }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Import Modal */}
      <AnimatePresence>
        {showBulkImport && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowBulkImport(false); setBulkJson(""); setBulkResult(""); }}
              className="absolute inset-0 bg-black/50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl border border-slate-200 w-full max-w-2xl shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">Bulk Import Solutions</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Paste a JSON array of solution objects</p>
                </div>
                <button
                  onClick={() => { setShowBulkImport(false); setBulkJson(""); setBulkResult(""); }}
                  className="p-2 rounded-lg hover:bg-slate-100"
                >
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 font-mono">
                  {`[{"question":"...","answer":"...","board":"CBSE","class":10,"subject":"Science","chapter":"Chapter 1","questionNumber":1,"isFree":true}, ...]`}
                </div>
                <textarea
                  value={bulkJson}
                  onChange={(e) => setBulkJson(e.target.value)}
                  rows={12}
                  placeholder='Paste your JSON array here...'
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-brand-royal resize-none"
                />
                {bulkResult && (
                  <div className={`text-sm px-4 py-2.5 rounded-xl ${bulkResult.includes("failed") || bulkResult.includes("Invalid") ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50"}`}>
                    {bulkResult}
                  </div>
                )}
              </div>
              <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => { setShowBulkImport(false); setBulkJson(""); setBulkResult(""); }}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkImport}
                  disabled={bulkImporting || !bulkJson.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-brand-gradient-static text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  {bulkImporting ? "Importing..." : <><Upload className="h-4 w-4" /> Import</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-black/50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-sm shadow-2xl text-center"
            >
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Delete Solution?</h3>
              <p className="text-sm text-slate-500 mb-6">
                This action cannot be undone. Any MCQs generated from this solution will remain.
              </p>
              <div className="flex items-center gap-3 justify-center">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

function BoardSelector({
  boards, counts, onSelect, loading
}: {
  boards: string[]; counts: Record<string, number>; onSelect: (b: string) => void; loading: boolean;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Select Board</h2>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-xl border border-slate-200 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((board, i) => {
            const count = counts[board] || 0;
            return (
              <motion.button
                key={board}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onSelect(board)}
                className="bg-white rounded-2xl border border-slate-200 p-6 text-left hover:border-brand-royal hover:shadow-md transition-all group"
              >
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${BOARD_COLORS[board] || "from-slate-600 to-slate-400"} flex items-center justify-center mb-4`}>
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-800 text-lg group-hover:text-brand-royal transition-colors">{board}</h3>
                <p className="text-xs text-slate-400 mt-1">{BOARD_DESCRIPTIONS[board] || ""}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-brand-royal/10 text-brand-royal font-semibold">
                    {count} solution{count !== 1 ? "s" : ""}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-brand-royal group-hover:translate-x-0.5 transition-all" />
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ClassSelector({
  classes, counts, onSelect, loading
}: {
  classes: number[]; counts: Record<string, number>; onSelect: (c: number) => void; loading: boolean;
}) {
  const allClasses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Select Class</h2>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {allClasses.map(i => <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {allClasses.map((classNum, i) => {
            const count = counts[String(classNum)] || 0;
            const hasSolutions = count > 0;
            return (
              <motion.button
                key={classNum}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => hasSolutions && onSelect(classNum)}
                disabled={!hasSolutions}
                className={`rounded-2xl border p-5 text-center transition-all ${
                  hasSolutions
                    ? "bg-white border-slate-200 hover:border-brand-royal hover:shadow-md cursor-pointer group"
                    : "bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed"
                }`}
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold ${
                  hasSolutions ? "bg-brand-royal/10 text-brand-royal group-hover:bg-brand-royal group-hover:text-white transition-colors" : "bg-slate-200 text-slate-400"
                }`}>
                  {classNum}
                </div>
                <p className={`text-sm font-medium ${hasSolutions ? "text-slate-700" : "text-slate-400"}`}>Class {classNum}</p>
                <p className={`text-xs mt-1 ${hasSolutions ? "text-brand-royal font-semibold" : "text-slate-300"}`}>
                  {hasSolutions ? `${count} solution${count !== 1 ? "s" : ""}` : "No solutions"}
                </p>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SubjectSelector({
  subjects, counts, onSelect, loading
}: {
  subjects: string[]; counts: Record<string, number>; onSelect: (s: string) => void; loading: boolean;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Select Subject</h2>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 animate-pulse" />)}
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <BookMarked className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No subjects found</p>
          <p className="text-slate-400 text-sm mt-1">Add solutions for this board and class first</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject, i) => {
            const count = counts[subject] || 0;
            return (
              <motion.button
                key={subject}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => onSelect(subject)}
                className="bg-white rounded-2xl border border-slate-200 p-5 text-left hover:border-brand-royal hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-brand-royal/10 flex items-center justify-center">
                      <BookMarked className="h-5 w-5 text-brand-royal" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-800 group-hover:text-brand-royal transition-colors">{subject}</h3>
                      <p className="text-xs text-brand-royal font-semibold mt-0.5">{count} solution{count !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-brand-royal group-hover:translate-x-0.5 transition-all" />
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ChapterSelector({
  chapters, counts, onSelect, loading
}: {
  chapters: string[]; counts: Record<string, number>; onSelect: (ch: string) => void; loading: boolean;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Select Chapter</h2>
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-white rounded-xl border border-slate-200 animate-pulse" />)}
        </div>
      ) : chapters.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No chapters found</p>
          <p className="text-slate-400 text-sm mt-1">Add solutions for this subject first</p>
        </div>
      ) : (
        <div className="space-y-2">
          {chapters.map((chapter, i) => {
            const count = counts[chapter] || 0;
            return (
              <motion.button
                key={chapter}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => onSelect(chapter)}
                className="w-full bg-white rounded-xl border border-slate-200 p-4 text-left hover:border-brand-royal hover:shadow-sm transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-brand-royal/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-brand-royal" />
                  </div>
                  <span className="font-medium text-slate-700 group-hover:text-brand-royal transition-colors">{chapter}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-brand-royal/10 text-brand-royal font-semibold">
                    {count} Q{count !== 1 ? "s" : ""}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-brand-royal group-hover:translate-x-0.5 transition-all" />
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SolutionsView({
  solutions, loading, selected, onSelect, onEdit, onBlockEdit, onDelete,
  searchQuery, onSearchChange, onSearch,
}: {
  solutions: Solution[]; loading: boolean; selected: Solution | null;
  onSelect: (s: Solution) => void; onEdit: (s: Solution) => void;
  onBlockEdit: (s: Solution) => void; onDelete: (id: string) => void;
  searchQuery: string; onSearchChange: (q: string) => void; onSearch: () => void;
}) {
  return (
    <div>
      {/* Search bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions or answers..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
          />
        </div>
        <button
          onClick={onSearch}
          className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
        >
          Search
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Solutions list */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 bg-white rounded-xl border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : solutions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No solutions found</p>
              <p className="text-slate-400 text-sm mt-1">Add solutions using the button above</p>
            </div>
          ) : (
            <div className="space-y-2">
              {solutions.map((s, i) => (
                <motion.div
                  key={s._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => onSelect(s)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selected?._id === s._id
                      ? "border-brand-royal bg-brand-royal/5"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Q#{s.questionNumber}</span>
                        {!s.isFree && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Premium</span>}
                      </div>
                      <p className="text-sm font-medium text-slate-800 line-clamp-2">
                        {s.questionHtml ? stripHtml(s.questionHtml) : s.question}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs text-slate-400">{s.viewCount} views</span>
                        {s.questionType && <span className="text-xs px-1.5 py-0.5 rounded bg-purple-50 text-purple-600">{s.questionType}</span>}
                        {s.difficulty && <span className="text-xs px-1.5 py-0.5 rounded bg-slate-50 text-slate-500">{s.difficulty}</span>}
                        {(s.questionBlocks && s.questionBlocks.length > 0) && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">Block content</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(s); }}
                        className="p-2 rounded-lg text-slate-400 hover:text-brand-royal hover:bg-brand-royal/10 transition-colors"
                        title="Rich Text Editor"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onBlockEdit(s); }}
                        className="p-2 rounded-lg text-slate-400 hover:text-brand-royal hover:bg-brand-royal/10 transition-colors"
                        title="Block Editor"
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(s._id); }}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div>
          {selected ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">Q#{selected.questionNumber}</h3>
                <div className="flex items-center gap-1">
                  <button onClick={() => onEdit(selected)} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-royal hover:bg-brand-royal/10" title="Edit">
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => onBlockEdit(selected)} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-royal hover:bg-brand-royal/10" title="Block Editor">
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => onDelete(selected._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {(selected.questionType || selected.difficulty) && (
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  {selected.questionType && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">{selected.questionType}</span>}
                  {selected.difficulty && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      selected.difficulty === "easy" ? "bg-green-100 text-green-700" :
                      selected.difficulty === "medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                    }`}>{selected.difficulty}</span>
                  )}
                </div>
              )}

              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Question</p>
                {selected.questionHtml ? (
                  <div className="text-sm text-slate-700 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selected.questionHtml }} />
                ) : (
                  <p className="text-sm text-slate-700">{selected.question}</p>
                )}
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Answer</p>
                {selected.answerHtml ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-slate-700 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selected.answerHtml }} />
                ) : (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-slate-700 whitespace-pre-wrap">{selected.answer}</div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="px-2 py-1 bg-slate-100 rounded-lg">{selected.board}</span>
                <span className="px-2 py-1 bg-slate-100 rounded-lg">Class {selected.class}</span>
                <span className="px-2 py-1 bg-slate-100 rounded-lg">{selected.subject}</span>
                <span className="px-2 py-1 bg-slate-100 rounded-lg">{selected.chapter}</span>
                <span className={`px-2 py-1 rounded-lg ${selected.isFree ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {selected.isFree ? "Free" : "Premium"}
                </span>
                {selected.sourceType && <span className="px-2 py-1 bg-slate-100 rounded-lg">{selected.sourceType}</span>}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center sticky top-20">
              <Eye className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Select a solution to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
