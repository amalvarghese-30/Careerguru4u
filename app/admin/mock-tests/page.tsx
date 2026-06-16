"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Beaker, Sparkles, Search, Trash2, Eye, BookOpen, Filter, RefreshCw, Plus, CheckCircle, XCircle } from "lucide-react";

interface MCQQuestion {
    _id: string;
    questionText: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
    board: string;
    class: number;
    subject: string;
    chapter: string;
    difficulty: string;
    sourceSolutionId?: string;
    createdAt: string;
}

const BOARDS = ["CBSE", "ICSE", "Maharashtra Board"];
const CLASSES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const SUBJECTS = ["Science", "Mathematics", "Social Science", "English", "Hindi", "Physics", "Chemistry", "Biology"];

export default function MockTestsAdminPage() {
    const [questions, setQuestions] = useState<MCQQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [board, setBoard] = useState("CBSE");
    const [classNum, setClassNum] = useState("10");
    const [subject, setSubject] = useState("Science");
    const [chapter, setChapter] = useState("");
    const [search, setSearch] = useState("");
    const [selectedQ, setSelectedQ] = useState<MCQQuestion | null>(null);
    const [message, setMessage] = useState("");
    const [genCount, setGenCount] = useState(10);

    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (board) params.set("board", board);
            if (classNum) params.set("class", classNum);
            if (subject) params.set("subject", subject);
            if (chapter) params.set("chapter", chapter);
            params.set("limit", "50");

            const res = await fetch(`/api/mcq?${params}`);
            const data = await res.json();
            setQuestions(data.questions || []);
        } catch (err) {
            console.error("Failed to fetch MCQs:", err);
        } finally {
            setLoading(false);
        }
    }, [board, classNum, subject, chapter]);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    const handleGenerate = async () => {
        setGenerating(true);
        setMessage("");
        try {
            const res = await fetch("/api/mcq/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    board,
                    class: parseInt(classNum),
                    subject,
                    chapter: chapter || undefined,
                    limit: genCount,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage(data.message);
                fetchQuestions();
            } else {
                setMessage(data.error || "Generation failed");
            }
        } catch (err) {
            setMessage("Failed to generate MCQs");
        } finally {
            setGenerating(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await fetch(`/api/mcq?id=${encodeURIComponent(id)}`, { method: "DELETE" });
            setQuestions(prev => prev.filter(q => q._id !== id));
            if (selectedQ?._id === id) setSelectedQ(null);
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    const filtered = questions.filter(q =>
        !search || q.questionText.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Mock Test Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Generate and manage MCQ questions from solutions</p>
                </div>
            </div>

            {/* Filter & Generate Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Filter className="h-4 w-4" />
                    Filter & Generate
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    <select
                        value={board}
                        onChange={(e) => setBoard(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
                    >
                        {BOARDS.map(b => <option key={b}>{b}</option>)}
                    </select>
                    <select
                        value={classNum}
                        onChange={(e) => setClassNum(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
                    >
                        {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                    <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
                    >
                        {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <input
                        type="text"
                        placeholder="Chapter (optional)"
                        value={chapter}
                        onChange={(e) => setChapter(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
                    />
                    <select
                        value={genCount}
                        onChange={(e) => setGenCount(parseInt(e.target.value))}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
                    >
                        <option value={5}>5 questions</option>
                        <option value={10}>10 questions</option>
                        <option value={20}>20 questions</option>
                        <option value={30}>30 questions</option>
                    </select>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="flex items-center gap-2 px-5 py-2.5 bg-brand-gradient-static text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                        {generating ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="h-4 w-4" />
                        )}
                        {generating ? "Generating..." : "Auto-Generate MCQs"}
                    </button>
                    <button
                        onClick={fetchQuestions}
                        className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm hover:bg-slate-50 transition-colors"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>
                </div>
                {message && (
                    <div className="text-sm text-green-600 bg-green-50 px-4 py-2 rounded-xl">
                        {message}
                    </div>
                )}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search questions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
                />
            </div>

            {/* Questions List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 animate-pulse" />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                            <Beaker className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">No MCQs found for this filter</p>
                            <p className="text-slate-400 text-sm mt-1">Generate MCQs from solutions using the options above</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((q) => (
                                <motion.div
                                    key={q._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={() => setSelectedQ(q)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                        selectedQ?._id === q._id
                                            ? "border-brand-royal bg-brand-royal/5"
                                            : "border-slate-200 bg-white hover:border-slate-300"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-800 line-clamp-2">{q.questionText}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{q.board}</span>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">Class {q.class}</span>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{q.subject}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                    q.difficulty === "easy" ? "bg-green-100 text-green-700" :
                                                        q.difficulty === "medium" ? "bg-amber-100 text-amber-700" :
                                                            "bg-red-100 text-red-700"
                                                }`}>{q.difficulty}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(q._id); }}
                                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detail Panel */}
                <div>
                    {selectedQ ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-20">
                            <h3 className="font-semibold text-slate-800 mb-4">Question Detail</h3>
                            <p className="text-sm text-slate-700 mb-4">{selectedQ.questionText}</p>

                            <div className="space-y-2 mb-4">
                                {selectedQ.options.map((opt, i) => (
                                    <div
                                        key={i}
                                        className={`p-3 rounded-xl text-sm flex items-start gap-2 ${
                                            i === selectedQ.correctOptionIndex
                                                ? "bg-green-50 border border-green-200"
                                                : "bg-slate-50 border border-slate-100"
                                        }`}
                                    >
                                        {i === selectedQ.correctOptionIndex ? (
                                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-slate-300 mt-0.5 flex-shrink-0" />
                                        )}
                                        <span className={i === selectedQ.correctOptionIndex ? "text-green-800 font-medium" : "text-slate-600"}>
                                            <span className="font-semibold mr-1">{String.fromCharCode(65 + i)}.</span>
                                            {opt}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <details className="mb-4">
                                <summary className="text-sm font-medium text-brand-royal cursor-pointer hover:underline">
                                    View Explanation
                                </summary>
                                <p className="text-sm text-slate-600 mt-2 p-3 bg-slate-50 rounded-xl">{selectedQ.explanation}</p>
                            </details>

                            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                                <span className="px-2 py-1 bg-slate-100 rounded-lg">{selectedQ.board}</span>
                                <span className="px-2 py-1 bg-slate-100 rounded-lg">Class {selectedQ.class}</span>
                                <span className="px-2 py-1 bg-slate-100 rounded-lg">{selectedQ.subject}</span>
                                <span className="px-2 py-1 bg-slate-100 rounded-lg">{selectedQ.chapter}</span>
                                <span className="px-2 py-1 bg-slate-100 rounded-lg capitalize">{selectedQ.difficulty}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center sticky top-20">
                            <Eye className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                            <p className="text-sm text-slate-500">Select a question to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
