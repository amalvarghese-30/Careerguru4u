"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Plus, Trash2, RefreshCw, BookOpen, Search, X, Save, Eye } from "lucide-react";

interface Question {
    _id: string;
    questionText: string;
    options: string[];
    correctOptionIndex?: number;
    explanation?: string;
    subject: string;
    examType: string;
    chapter: string;
    difficulty: string;
}

interface ExamPattern {
    examType: string;
    displayName: string;
    description: string;
    category: string;
    subjects: { name: string; topics: string[] }[];
    totalMarks: number;
    totalQuestions: number;
    timeLimit: number;
    markingScheme: { correct: number; incorrect: number; unattempted: number };
    eligibility: string;
    session: string;
}

const EXAMS = [
    "JEE-Main", "NEET-UG", "CUET-UG", "CAT", "CLAT", "GATE",
];

export default function EntranceExamsAdminPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedExam, setSelectedExam] = useState("JEE-Main");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("");
    const [searchText, setSearchText] = useState("");
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [generateCount, setGenerateCount] = useState(10);
    const [message, setMessage] = useState("");
    const [tab, setTab] = useState<"questions" | "patterns">("questions");

    // Pattern form state
    const [patternForm, setPatternForm] = useState<ExamPattern>({
        examType: "JEE-Main",
        displayName: "JEE Main",
        description: "",
        category: "engineering",
        subjects: [{ name: "Physics", topics: [] }, { name: "Chemistry", topics: [] }, { name: "Mathematics", topics: [] }],
        totalMarks: 300,
        totalQuestions: 75,
        timeLimit: 180,
        markingScheme: { correct: 4, incorrect: -1, unattempted: 0 },
        eligibility: "",
        session: "",
    });
    const [savingPattern, setSavingPattern] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, [selectedExam, selectedSubject, selectedDifficulty]);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ examType: selectedExam, limit: "50" });
            if (selectedSubject) params.set("subject", selectedSubject);
            if (selectedDifficulty) params.set("difficulty", selectedDifficulty);
            const res = await fetch(`/api/mcq?${params}`);
            const data = await res.json();
            setQuestions(data.questions || []);
        } catch { setQuestions([]); }
        finally { setLoading(false); }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        setMessage("");
        try {
            const res = await fetch("/api/mcq/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    examType: selectedExam,
                    subject: selectedSubject || undefined,
                    limit: generateCount,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage(data.message);
                fetchQuestions();
            } else {
                setMessage(data.error || "Generation failed");
            }
        } catch {
            setMessage("Failed to generate questions");
        } finally {
            setGenerating(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await fetch(`/api/mcq?id=${id}`, { method: "DELETE" });
            setQuestions(prev => prev.filter(q => q._id !== id));
            if (selectedQuestion?._id === id) setSelectedQuestion(null);
        } catch {}
    };

    const handleSavePattern = async () => {
        setSavingPattern(true);
        try {
            await fetch("/api/exam/patterns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(patternForm),
            });
            setMessage("Exam pattern saved successfully");
        } catch {
            setMessage("Failed to save pattern");
        } finally {
            setSavingPattern(false);
        }
    };

    const addSubject = () => {
        setPatternForm(prev => ({
            ...prev,
            subjects: [...prev.subjects, { name: "", topics: [] }],
        }));
    };

    const removeSubject = (index: number) => {
        setPatternForm(prev => ({
            ...prev,
            subjects: prev.subjects.filter((_, i) => i !== index),
        }));
    };

    const updateSubject = (index: number, name: string) => {
        setPatternForm(prev => ({
            ...prev,
            subjects: prev.subjects.map((s, i) => (i === index ? { ...s, name } : s)),
        }));
    };

    const filteredQuestions = searchText
        ? questions.filter(q =>
            q.questionText.toLowerCase().includes(searchText.toLowerCase()) ||
            q.subject?.toLowerCase().includes(searchText.toLowerCase())
        )
        : questions;

    return (
        <div className="pt-4">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Entrance Exam Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage exam patterns and MCQ questions</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setTab("questions")}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            tab === "questions" ? "bg-brand-royal text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                        <BookOpen className="h-4 w-4 inline mr-1" /> Questions
                    </button>
                    <button
                        onClick={() => setTab("patterns")}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            tab === "patterns" ? "bg-brand-royal text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                        <Save className="h-4 w-4 inline mr-1" /> Exam Patterns
                    </button>
                </div>
            </div>

            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl mb-6 text-sm ${
                        message.includes("fail") || message.includes("error")
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-green-50 text-green-700 border border-green-200"
                    }`}
                >
                    {message}
                </motion.div>
            )}

            {tab === "patterns" ? (
                <div className="premium-card p-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Exam Pattern Editor</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Exam Type</label>
                            <input
                                value={patternForm.examType}
                                onChange={e => setPatternForm(prev => ({ ...prev, examType: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                                placeholder="e.g., JEE-Main"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Display Name</label>
                            <input
                                value={patternForm.displayName}
                                onChange={e => setPatternForm(prev => ({ ...prev, displayName: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                                placeholder="e.g., JEE Main"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Category</label>
                            <select
                                value={patternForm.category}
                                onChange={e => setPatternForm(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                            >
                                <option value="engineering">Engineering</option>
                                <option value="medical">Medical</option>
                                <option value="management">Management</option>
                                <option value="law">Law</option>
                                <option value="civil-service">Civil Service</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Session</label>
                            <input
                                value={patternForm.session}
                                onChange={e => setPatternForm(prev => ({ ...prev, session: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                                placeholder="e.g., April 2026"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Total Marks</label>
                            <input
                                type="number"
                                value={patternForm.totalMarks}
                                onChange={e => setPatternForm(prev => ({ ...prev, totalMarks: parseInt(e.target.value) || 0 }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Total Questions</label>
                            <input
                                type="number"
                                value={patternForm.totalQuestions}
                                onChange={e => setPatternForm(prev => ({ ...prev, totalQuestions: parseInt(e.target.value) || 0 }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Time Limit (minutes)</label>
                            <input
                                type="number"
                                value={patternForm.timeLimit}
                                onChange={e => setPatternForm(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 0 }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Eligibility</label>
                            <input
                                value={patternForm.eligibility}
                                onChange={e => setPatternForm(prev => ({ ...prev, eligibility: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                            />
                        </div>
                    </div>

                    {/* Marking Scheme */}
                    <h3 className="font-semibold text-slate-700 mb-3">Marking Scheme</h3>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {[
                            { key: "correct", label: "Marks per correct answer" },
                            { key: "incorrect", label: "Marks per wrong answer (negative)" },
                            { key: "unattempted", label: "Marks for unattempted" },
                        ].map(({ key, label }) => (
                            <div key={key}>
                                <label className="block text-xs text-slate-500 mb-1">{label}</label>
                                <input
                                    type="number"
                                    step="0.25"
                                    value={patternForm.markingScheme[key as keyof typeof patternForm.markingScheme]}
                                    onChange={e => setPatternForm(prev => ({
                                        ...prev,
                                        markingScheme: { ...prev.markingScheme, [key]: parseFloat(e.target.value) || 0 },
                                    }))}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Subjects */}
                    <h3 className="font-semibold text-slate-700 mb-3">Subjects</h3>
                    {patternForm.subjects.map((subj, i) => (
                        <div key={i} className="flex items-center gap-2 mb-2">
                            <input
                                value={subj.name}
                                onChange={e => updateSubject(i, e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                placeholder="Subject name"
                            />
                            <button
                                onClick={() => removeSubject(i)}
                                className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                    <button onClick={addSubject} className="flex items-center gap-1 text-sm text-brand-royal hover:underline mb-6">
                        <Plus className="h-4 w-4" /> Add Subject
                    </button>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
                        <textarea
                            value={patternForm.description}
                            onChange={e => setPatternForm(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                            rows={3}
                        />
                    </div>

                    <button
                        onClick={handleSavePattern}
                        disabled={savingPattern}
                        className="mt-6 flex items-center gap-2 px-6 py-3 bg-brand-gradient-static text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" /> {savingPattern ? "Saving..." : "Save Exam Pattern"}
                    </button>
                </div>
            ) : (
                <>
                    {/* MCQ Management */}
                    <div className="premium-card p-4 mb-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <select
                                value={selectedExam}
                                onChange={e => { setSelectedExam(e.target.value); setSelectedSubject(""); }}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                            >
                                {EXAMS.map(e => (
                                    <option key={e} value={e}>{e}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="Subject (e.g., Physics)"
                                value={selectedSubject}
                                onChange={e => setSelectedSubject(e.target.value)}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm w-40"
                            />
                            <select
                                value={selectedDifficulty}
                                onChange={e => setSelectedDifficulty(e.target.value)}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                            >
                                <option value="">All Difficulties</option>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                            <select
                                value={generateCount}
                                onChange={e => setGenerateCount(parseInt(e.target.value))}
                                className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={30}>30</option>
                            </select>
                            <button
                                onClick={handleGenerate}
                                disabled={generating}
                                className="flex items-center gap-2 px-5 py-2.5 bg-brand-gradient-static text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                            >
                                {generating ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Plus className="h-4 w-4" />
                                )}
                                Auto-Generate MCQs
                            </button>
                            <button
                                onClick={fetchQuestions}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Question List + Detail */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                <div className="p-4 border-b border-slate-100">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search questions..."
                                            value={searchText}
                                            onChange={e => setSearchText(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="max-h-[600px] overflow-y-auto">
                                    {loading ? (
                                        <div className="p-8 text-center">
                                            <RefreshCw className="h-8 w-8 text-slate-300 animate-spin mx-auto mb-3" />
                                            <p className="text-sm text-slate-400">Loading questions...</p>
                                        </div>
                                    ) : filteredQuestions.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <GraduationCap className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                            <p className="text-sm text-slate-500">No MCQs found for this filter</p>
                                            <p className="text-xs text-slate-400 mt-1">Generate MCQs from solutions using the options above</p>
                                        </div>
                                    ) : (
                                        filteredQuestions.map(q => (
                                            <div
                                                key={q._id}
                                                onClick={() => setSelectedQuestion(q)}
                                                className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${
                                                    selectedQuestion?._id === q._id ? "bg-brand-royal/5 border-l-2 border-l-brand-royal" : ""
                                                }`}
                                            >
                                                <p className="text-sm text-slate-700 line-clamp-2 mb-2">{q.questionText}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-brand-bg text-brand-royal font-medium">{q.subject}</span>
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 font-medium">{q.examType}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                        q.difficulty === "easy" ? "bg-green-50 text-green-600" :
                                                            q.difficulty === "medium" ? "bg-amber-50 text-amber-600" :
                                                                "bg-red-50 text-red-600"
                                                    }`}>{q.difficulty}</span>
                                                </div>
                                                <button
                                                    onClick={e => { e.stopPropagation(); handleDelete(q._id); }}
                                                    className="mt-2 text-xs text-red-400 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 inline mr-1" /> Delete
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Detail Panel */}
                        <div className="lg:col-span-1">
                            {selectedQuestion ? (
                                <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-24">
                                    <h3 className="font-semibold text-slate-700 mb-3">Question Detail</h3>
                                    <p className="text-sm text-slate-600 mb-4">{selectedQuestion.questionText}</p>
                                    <div className="space-y-2 mb-4">
                                        {selectedQuestion.options?.map((opt, i) => (
                                            <div
                                                key={i}
                                                className={`p-2.5 rounded-lg text-sm ${
                                                    selectedQuestion.correctOptionIndex !== undefined && i === selectedQuestion.correctOptionIndex
                                                        ? "bg-green-50 border border-green-200 text-green-800"
                                                        : "bg-slate-50 text-slate-500"
                                                }`}
                                            >
                                                <span className="font-semibold mr-2">{String.fromCharCode(65 + i)}.</span> {opt}
                                                {selectedQuestion.correctOptionIndex !== undefined && i === selectedQuestion.correctOptionIndex && (
                                                    <Eye className="h-3.5 w-3.5 inline ml-2 text-green-600" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {selectedQuestion.explanation && (
                                        <details className="mb-4">
                                            <summary className="text-xs text-brand-royal cursor-pointer hover:underline">Explanation</summary>
                                            <p className="text-xs text-slate-500 mt-2 p-3 bg-slate-50 rounded-lg">{selectedQuestion.explanation}</p>
                                        </details>
                                    )}
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-xs px-2 py-1 rounded-full bg-brand-bg text-brand-royal">{selectedQuestion.subject}</span>
                                        <span className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-600">{selectedQuestion.examType}</span>
                                        <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">{selectedQuestion.difficulty}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center sticky top-24">
                                    <GraduationCap className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                                    <p className="text-sm text-slate-400">Select a question to view details</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
