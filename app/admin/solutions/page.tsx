"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search, Trash2, Eye, Filter, Plus, Edit3, X, Save, Upload, LayoutGrid } from "lucide-react";
import { SolutionBlockEditor } from "@/components/admin/SolutionBlockEditor";
import type { ContentBlock, SolutionStep } from "@/scripts/ingestion/types";

interface Solution {
    _id: string;
    question: string;
    answer: string;
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

const BOARDS = ["CBSE", "ICSE", "Maharashtra Board"];
const CLASSES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const SUBJECTS = ["Mathematics", "Science", "Physics", "Chemistry", "Biology", "English", "Hindi", "Marathi", "Sanskrit", "Social Science", "History", "Geography", "Computer Science"];

export default function SolutionsAdminPage() {
    const [solutions, setSolutions] = useState<Solution[]>([]);
    const [loading, setLoading] = useState(true);
    const [board, setBoard] = useState("");
    const [classNum, setClassNum] = useState("");
    const [subject, setSubject] = useState("");
    const [chapter, setChapter] = useState("");
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<Solution | null>(null);
    const [message, setMessage] = useState("");
    const [showEditor, setShowEditor] = useState(false);
    const [editing, setEditing] = useState<Partial<Solution>>({});
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [isNew, setIsNew] = useState(false);
    const [showBulkImport, setShowBulkImport] = useState(false);
    const [showBlockEditor, setShowBlockEditor] = useState(false);
    const [blockEditSolution, setBlockEditSolution] = useState<Solution | null>(null);
    const [blockSaving, setBlockSaving] = useState(false);
    const [bulkJson, setBulkJson] = useState("");
    const [bulkImporting, setBulkImporting] = useState(false);
    const [bulkResult, setBulkResult] = useState("");

    const fetchSolutions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (board) params.set("board", board);
            if (classNum) params.set("class", classNum);
            if (subject) params.set("subject", subject);
            if (chapter) params.set("chapter", chapter);
            if (search) params.set("search", search);

            const res = await fetch(`/api/admin/solutions?${params}`);
            const data = await res.json();
            setSolutions(data.solutions || []);
        } catch (err) {
            console.error("Failed to fetch solutions:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSolutions(); }, []);

    const handleSearch = () => fetchSolutions();

    const openNew = () => {
        setEditing({ board: "CBSE", class: 10, subject: "", chapter: "", question: "", answer: "", questionNumber: 1, isFree: true });
        setIsNew(true);
        setShowEditor(true);
    };

    const openEdit = (s: Solution) => {
        setEditing({ ...s });
        setIsNew(false);
        setShowEditor(true);
    };

    const handleSave = async () => {
        if (!editing.question || !editing.answer || !editing.board || !editing.class || !editing.subject || !editing.chapter) {
            setMessage("Please fill all required fields");
            return;
        }
        setSaving(true);
        setMessage("");
        try {
            const res = await fetch("/api/admin/solutions", {
                method: isNew ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(isNew ? editing : { _id: (editing as Solution)._id, ...editing }),
            });
            if (res.ok) {
                setShowEditor(false);
                setEditing({});
                fetchSolutions();
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
                fetchSolutions();
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

    const handleDelete = async (id: string) => {
        try {
            await fetch(`/api/admin/solutions?id=${encodeURIComponent(id)}`, { method: "DELETE" });
            setSolutions(prev => prev.filter(q => q._id !== id));
            if (selected?._id === id) setSelected(null);
            setDeleteConfirm(null);
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

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
                fetchSolutions();
                setBulkJson("");
            }
        } catch {
            setBulkResult("Import failed");
        } finally {
            setBulkImporting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Solutions Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage textbook solutions across boards, classes, and subjects</p>
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

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                    <Filter className="h-4 w-4" /> Filters
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <select
                        value={board}
                        onChange={(e) => setBoard(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
                    >
                        <option value="">All Boards</option>
                        {BOARDS.map(b => <option key={b}>{b}</option>)}
                    </select>
                    <select
                        value={classNum}
                        onChange={(e) => setClassNum(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
                    >
                        <option value="">All Classes</option>
                        {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                    <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
                    >
                        <option value="">All Subjects</option>
                        {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <input
                        type="text"
                        placeholder="Chapter..."
                        value={chapter}
                        onChange={(e) => setChapter(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
                    />
                </div>
                <div className="flex items-center gap-3 mt-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search questions or answers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
                    >
                        Search
                    </button>
                </div>
            </div>

            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-sm px-4 py-3 rounded-xl ${
                        message.includes("failed") || message.includes("error")
                            ? "text-red-600 bg-red-50"
                            : "text-green-600 bg-green-50"
                    }`}
                >
                    {message}
                </motion.div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List */}
                <div className="lg:col-span-2">
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-20 bg-white rounded-xl border border-slate-200 animate-pulse" />
                            ))}
                        </div>
                    ) : solutions.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">No solutions found</p>
                            <p className="text-slate-400 text-sm mt-1">Add solutions using the button above or adjust filters</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {solutions.map((s) => (
                                <motion.div
                                    key={s._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={() => setSelected(s)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                        selected?._id === s._id
                                            ? "border-brand-royal bg-brand-royal/5"
                                            : "border-slate-200 bg-white hover:border-slate-300"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-800 line-clamp-2">{s.question}</p>
                                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{s.board}</span>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">Class {s.class}</span>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{s.subject}</span>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{s.chapter}</span>
                                                {!s.isFree && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Premium</span>}
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{s.viewCount} views</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openBlockEditor(s); }}
                                                className="p-2 rounded-lg text-slate-400 hover:text-brand-royal hover:bg-brand-royal/10 transition-colors"
                                                title="Edit Blocks"
                                            >
                                                <LayoutGrid className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openEdit(s); }}
                                                className="p-2 rounded-lg text-slate-400 hover:text-brand-royal hover:bg-brand-royal/10 transition-colors"
                                            >
                                                <Edit3 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setDeleteConfirm(s._id); }}
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

                {/* Detail / Empty State */}
                <div>
                    {selected ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-20">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-slate-800">Solution Detail</h3>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => openBlockEditor(selected)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-royal hover:bg-brand-royal/10"
                                        title="Edit Blocks"
                                    >
                                        <LayoutGrid className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={() => openEdit(selected)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-royal hover:bg-brand-royal/10"
                                    >
                                        <Edit3 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(selected._id)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>

                            {(selected.questionType || selected.difficulty || (selected.version && selected.version > 1)) && (
                                <div className="flex items-center gap-2 mb-4 flex-wrap">
                                    {selected.questionType && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                                            {selected.questionType}
                                        </span>
                                    )}
                                    {selected.difficulty && (
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                            selected.difficulty === "easy" ? "bg-green-100 text-green-700" :
                                            selected.difficulty === "medium" ? "bg-amber-100 text-amber-700" :
                                            "bg-red-100 text-red-700"
                                        }`}>
                                            {selected.difficulty}
                                        </span>
                                    )}
                                    {selected.version && selected.version > 1 && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                                            v{selected.version}
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="mb-4">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Question</p>
                                <p className="text-sm text-slate-700">{selected.question}</p>
                            </div>

                            <div className="mb-4">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Answer</p>
                                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-slate-700 whitespace-pre-wrap">
                                    {selected.answer}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                                <span className="px-2 py-1 bg-slate-100 rounded-lg">{selected.board}</span>
                                <span className="px-2 py-1 bg-slate-100 rounded-lg">Class {selected.class}</span>
                                <span className="px-2 py-1 bg-slate-100 rounded-lg">{selected.subject}</span>
                                <span className="px-2 py-1 bg-slate-100 rounded-lg">{selected.chapter}</span>
                                <span className="px-2 py-1 bg-slate-100 rounded-lg">Q#{selected.questionNumber}</span>
                                <span className={`px-2 py-1 rounded-lg ${selected.isFree ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                                    {selected.isFree ? "Free" : "Premium"}
                                </span>
                                {selected.sourceType && (
                                    <span className="px-2 py-1 bg-slate-100 rounded-lg">{selected.sourceType}</span>
                                )}
                                {selected.questionBlocks && selected.questionBlocks.length > 0 && (
                                    <span className="px-2 py-1 bg-brand-royal/10 text-brand-royal rounded-lg text-xs font-medium">Block content</span>
                                )}
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

            {/* Edit Modal */}
            <AnimatePresence>
                {showEditor && (
                    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
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
                            className="relative bg-white rounded-2xl border border-slate-200 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl"
                        >
                            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
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

                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Q#</label>
                                        <input
                                            type="number"
                                            value={editing.questionNumber || 1}
                                            onChange={(e) => setEditing({ ...editing, questionNumber: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Chapter *</label>
                                    <input
                                        type="text"
                                        value={editing.chapter || ""}
                                        onChange={(e) => setEditing({ ...editing, chapter: e.target.value })}
                                        placeholder="e.g. Chapter 1: Matter in Our Surroundings"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Question *</label>
                                    <textarea
                                        value={editing.question || ""}
                                        onChange={(e) => setEditing({ ...editing, question: e.target.value })}
                                        rows={3}
                                        placeholder="Enter the question text..."
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Answer *</label>
                                    <textarea
                                        value={editing.answer || ""}
                                        onChange={(e) => setEditing({ ...editing, answer: e.target.value })}
                                        rows={6}
                                        placeholder="Enter the full solution / step-by-step answer..."
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal resize-none"
                                    />
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
                            </div>

                            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
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
                                    {saving ? (
                                        <>Saving...</>
                                    ) : (
                                        <><Save className="h-4 w-4" /> {isNew ? "Create Solution" : "Save Changes"}</>
                                    )}
                                </button>
                            </div>
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
                            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
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
                                    <div className={`text-sm px-4 py-2.5 rounded-xl ${
                                        bulkResult.includes("failed") || bulkResult.includes("Invalid")
                                            ? "text-red-600 bg-red-50"
                                            : "text-green-600 bg-green-50"
                                    }`}>
                                        {bulkResult}
                                    </div>
                                )}
                            </div>
                            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
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
                            className="relative bg-white rounded-2xl border border-slate-200 w-full max-w-5xl max-h-[85vh] overflow-hidden shadow-2xl"
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
