"use client";

import { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronDown, ArrowLeft, Sparkles, Lightbulb, Play, ClipboardList, Download, FileText, Search } from "lucide-react";
import { SolutionCard } from "@/components/features/SolutionCard";
import { decodeEntities } from "@/lib/math-renderer";
import { MathRenderer } from "@/components/content/MathRenderer";

interface SolutionData {
    _id: string;
    question: string;
    answer: string;
    chapter: string;
    questionNumber: number;
    isFree: boolean;
    canAccess?: boolean;
    freeRemaining?: number;
    questionHtml?: string;
    answerHtml?: string;
    questionBlocks?: any[];
    solutionSteps?: any[];
    questionType?: string;
    difficulty?: string;
}

interface ConceptNoteData {
    _id: string;
    title: string;
    chapter: string;
    type: "note" | "video";
    content?: string;
    videoUrl?: string;
}

interface SyllabusData {
    _id: string;
    title: string;
    content: string;
    year: string;
}

interface TextbookData {
    _id: string;
    title: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    downloads: number;
}

interface ChapterGroup {
    chapter: string;
    solutions: SolutionData[];
    count: number;
}

const boardNames: Record<string, string> = {
    cbse: "CBSE", icse: "ICSE", "maharashtra-board": "Maharashtra Board",
};

type Tab = "solutions" | "notes" | "syllabus" | "textbooks";

export default function SubjectPage({ params }: { params: Promise<{ board: string; class: string; subject: string }> }) {
    const { board, class: classParam, subject: subjectSlug } = use(params);
    const classNum = parseInt(classParam);
    const subjectName = subjectSlug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

    const [activeTab, setActiveTab] = useState<Tab>("solutions");
    const [chapters, setChapters] = useState<ChapterGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
    const [chapterSolutions, setChapterSolutions] = useState<SolutionData[]>([]);
    const [loadingSolutions, setLoadingSolutions] = useState(false);
    const [error, setError] = useState("");

    // Active question navigation
    const [activeQuestionIndex, setActiveQuestionIndex] = useState<number | null>(null);
    const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<string>>(new Set());

    // Concept notes
    const [notes, setNotes] = useState<ConceptNoteData[]>([]);
    const [loadingNotes, setLoadingNotes] = useState(false);

    // Syllabus
    const [syllabus, setSyllabus] = useState<SyllabusData[]>([]);
    const [loadingSyllabus, setLoadingSyllabus] = useState(false);

    // Textbooks
    const [textbooks, setTextbooks] = useState<TextbookData[]>([]);
    const [loadingTextbooks, setLoadingTextbooks] = useState(false);

    const boardName = boardNames[board] || board;

    useEffect(() => {
        async function fetchChapters() {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                params.set("board", boardName);
                params.set("class", classParam);
                params.set("subject", subjectName);
                params.set("limit", "2000");

                const res = await fetch(`/api/solutions?${params}`);
                const data = await res.json();
                const solutions: SolutionData[] = data.solutions || [];

                const grouped: Record<string, SolutionData[]> = {};
                for (const s of solutions) {
                    const ch = s.chapter || "General";
                    if (!grouped[ch]) grouped[ch] = [];
                    grouped[ch].push(s);
                }

                const chapterList: ChapterGroup[] = Object.entries(grouped)
                    .sort(([a], [b]) => {
                        const numA = (a.match(/(\d+)/) || [])[1];
                        const numB = (b.match(/(\d+)/) || [])[1];
                        if (numA && numB) return parseInt(numA) - parseInt(numB);
                        if (numA) return -1;
                        if (numB) return 1;
                        return a.localeCompare(b);
                    })
                    .map(([chapter, sols]) => ({ chapter, solutions: sols, count: sols.length }));

                setChapters(chapterList);
            } catch { setError("Failed to load"); }
            finally { setLoading(false); }
        }
        fetchChapters();
    }, [board, classParam, subjectName, boardName]);

    const toggleChapter = async (chapter: string) => {
        if (expandedChapter === chapter) { setExpandedChapter(null); setActiveQuestionIndex(null); return; }
        setExpandedChapter(chapter);
        setActiveQuestionIndex(null);
        setLoadingSolutions(true);
        try {
            const params = new URLSearchParams();
            params.set("board", boardName);
            params.set("class", classParam);
            params.set("subject", subjectName);
            params.set("chapter", chapter);

            const res = await fetch(`/api/solutions?${params}`, {
                headers: { Authorization: `Bearer ${document.cookie.match(/cg-auth-token=([^;]+)/)?.[1] || ""}` },
            });
            const data = await res.json();
            setChapterSolutions(data.solutions || []);
        } catch { setChapterSolutions([]); }
        finally { setLoadingSolutions(false); }
    };

    const openQuestion = (index: number) => {
        setActiveQuestionIndex(index);
        // Scroll to question view
        setTimeout(() => {
            document.getElementById("active-question-scroll")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
    };

    const navigateQuestion = useCallback((direction: "prev" | "next") => {
        if (activeQuestionIndex === null) return;
        const newIndex = direction === "prev" ? activeQuestionIndex - 1 : activeQuestionIndex + 1;
        if (newIndex >= 0 && newIndex < chapterSolutions.length) {
            setActiveQuestionIndex(newIndex);
            setTimeout(() => {
                document.getElementById("active-question-scroll")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 50);
        }
    }, [activeQuestionIndex, chapterSolutions.length]);

    const handleBookmark = (solutionId: string) => {
        setBookmarkedQuestions(prev => {
            const next = new Set(prev);
            if (next.has(solutionId)) {
                next.delete(solutionId);
            } else {
                next.add(solutionId);
            }
            return next;
        });
        // Fire-and-forget API call
        fetch("/api/solutions/bookmark", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ solutionId }),
        }).catch(() => {});
    };

    const handleShare = async (question: string) => {
        const url = `${window.location.origin}${window.location.pathname}`;
        if (navigator.share) {
            try {
                await navigator.share({ title: `Question from ${subjectName}`, text: question.substring(0, 100), url });
            } catch {}
        } else {
            navigator.clipboard.writeText(url).catch(() => {});
        }
    };

    // Fetch concept notes when tab changes
    useEffect(() => {
        if (activeTab !== "notes" || notes.length > 0) return;
        setLoadingNotes(true);
        fetch(`/api/admin/concept-notes?board=${encodeURIComponent(boardName)}&class=${classNum}&subject=${encodeURIComponent(subjectName)}`)
            .then(r => r.json())
            .then(data => setNotes(data.notes || []))
            .catch(() => {})
            .finally(() => setLoadingNotes(false));
    }, [activeTab, notes.length, boardName, classNum, subjectName]);

    // Fetch syllabus when tab changes
    useEffect(() => {
        if (activeTab !== "syllabus" || syllabus.length > 0) return;
        setLoadingSyllabus(true);
        fetch(`/api/admin/syllabus?board=${encodeURIComponent(boardName)}&class=${classNum}&subject=${encodeURIComponent(subjectName)}`)
            .then(r => r.json())
            .then(data => setSyllabus(data.syllabus || []))
            .catch(() => {})
            .finally(() => setLoadingSyllabus(false));
    }, [activeTab, syllabus.length, boardName, classNum, subjectName]);

    // Fetch textbooks when tab changes
    useEffect(() => {
        if (activeTab !== "textbooks" || textbooks.length > 0) return;
        setLoadingTextbooks(true);
        fetch(`/api/admin/textbooks?board=${encodeURIComponent(boardName)}&class=${classNum}&subject=${encodeURIComponent(subjectName)}`)
            .then(r => r.json())
            .then(data => setTextbooks(data.textbooks || []))
            .catch(() => {})
            .finally(() => setLoadingTextbooks(false));
    }, [activeTab, textbooks.length, boardName, classNum, subjectName]);

    const formatSize = (bytes: number) => {
        if (!bytes) return "—";
        const mb = bytes / (1024 * 1024);
        return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
    };

    const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
        { key: "solutions", label: "Solutions", icon: FileText },
        { key: "notes", label: "Concept Notes", icon: Lightbulb },
        { key: "syllabus", label: "Syllabus", icon: ClipboardList },
        { key: "textbooks", label: "Textbook PDFs", icon: Download },
    ];

    const activeSolution = activeQuestionIndex !== null && chapterSolutions[activeQuestionIndex]
        ? chapterSolutions[activeQuestionIndex]
        : null;

    return (
        <div className="pt-20 min-h-screen bg-brand-bg">
            {/* Hero */}
            <section className="bg-gradient-to-br from-brand-navy via-brand-navy to-brand-royal py-10 md:py-14">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto">
                        {/* Breadcrumbs */}
                        <nav aria-label="Breadcrumb" className="inline-flex items-center gap-2 text-white/60 text-xs md:text-sm mb-3 flex-wrap">
                            <Link href="/academic" className="hover:text-white transition-colors">Academic</Link>
                            <span className="text-white/30">/</span>
                            <Link href={`/academic/${board}`} className="hover:text-white transition-colors">{boardName}</Link>
                            <span className="text-white/30">/</span>
                            <Link href={`/academic/${board}/${classNum}`} className="hover:text-white transition-colors">Class {classNum}</Link>
                            <span className="text-white/30">/</span>
                            <span className="text-white/90 font-medium">{subjectName}</span>
                        </nav>
                        <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{subjectName}</h1>
                        <p className="text-white/70 text-sm md:text-base">
                            {boardName} &bull; Class {classNum} &bull; {chapters.length} chapter{chapters.length !== 1 ? "s" : ""} &bull; {chapters.reduce((sum, ch) => sum + ch.count, 0)} solutions
                        </p>
                    </div>
                </div>
            </section>

            {/* Sticky Tab Navigation */}
            <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
                <div className="container-custom max-w-4xl mx-auto">
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                                    activeTab === tab.key
                                        ? "bg-brand-gradient-static text-white shadow-brand-btn"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-brand-royal"
                                }`}
                            >
                                <tab.icon className="h-4 w-4" />{tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <section className="section-padding pt-8">
                <div className="container-custom max-w-4xl mx-auto">

                    {/* Solutions Tab */}
                    {activeTab === "solutions" && (
                        <>
                            {loading ? (
                                <div className="space-y-3">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="h-16 bg-white rounded-xl border border-slate-200 animate-pulse" />
                                    ))}
                                </div>
                            ) : error ? (
                                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                                    <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-600">{error}</p>
                                </div>
                            ) : chapters.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                                    <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <h2 className="text-xl font-semibold text-slate-700 mb-2">No Solutions Yet</h2>
                                    <p className="text-slate-500 max-w-md mx-auto">
                                        Solutions for {subjectName} ({boardName} Class {classNum}) haven&apos;t been added yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {chapters.map((ch) => {
                                        const isExpanded = expandedChapter === ch.chapter;
                                        return (
                                            <div key={ch.chapter} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                                <button
                                                    onClick={() => toggleChapter(ch.chapter)}
                                                    className="w-full p-4 md:p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-brand-bg flex items-center justify-center">
                                                            <BookOpen className="h-5 w-5 text-brand-royal" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-slate-800 text-sm md:text-base">{ch.chapter}</h3>
                                                            <p className="text-xs text-slate-500">{ch.count} solution{ch.count !== 1 ? "s" : ""}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                                </button>

                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="px-4 md:px-5 pb-5 border-t border-slate-100">
                                                                {loadingSolutions ? (
                                                                    <div className="py-8 text-center">
                                                                        <div className="h-6 w-6 border-2 border-brand-royal border-t-transparent rounded-full animate-spin mx-auto" />
                                                                    </div>
                                                                ) : chapterSolutions.length === 0 ? (
                                                                    <p className="py-8 text-center text-sm text-slate-400">No solutions found</p>
                                                                ) : (
                                                                    <div className="pt-4">
                                                                        {/* Question Jump Chips */}
                                                                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3 mb-3">
                                                                            {chapterSolutions.map((_, idx) => (
                                                                                <button
                                                                                    key={idx}
                                                                                    onClick={() => openQuestion(idx)}
                                                                                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                                                                        activeQuestionIndex === idx
                                                                                            ? "bg-brand-royal text-white shadow-sm"
                                                                                            : "bg-slate-100 text-slate-600 hover:bg-brand-bg hover:text-brand-royal"
                                                                                    }`}
                                                                                >
                                                                                    Q{idx + 1}
                                                                                </button>
                                                                            ))}
                                                                        </div>

                                                                        {/* Active Question View */}
                                                                        {activeSolution && (
                                                                            <div id="active-question-scroll">
                                                                                <SolutionCard
                                                                                    questionNumber={activeSolution.questionNumber || (activeQuestionIndex ?? 0) + 1}
                                                                                    totalQuestions={chapterSolutions.length}
                                                                                    question={activeSolution.question}
                                                                                    answer={activeSolution.answer}
                                                                                    isFree={activeSolution.isFree}
                                                                                    isBookmarked={bookmarkedQuestions.has(activeSolution._id)}
                                                                                    onBookmark={() => handleBookmark(activeSolution._id)}
                                                                                    onShare={() => handleShare(activeSolution.question)}
                                                                                    onPrev={activeQuestionIndex! > 0 ? () => navigateQuestion("prev") : undefined}
                                                                                    onNext={activeQuestionIndex! < chapterSolutions.length - 1 ? () => navigateQuestion("next") : undefined}
                                                                                    chapterName={ch.chapter}
                                                                                    questionHtml={activeSolution.questionHtml}
                                                                                    answerHtml={activeSolution.answerHtml}
                                                                                    questionBlocks={activeSolution.questionBlocks}
                                                                                    solutionSteps={activeSolution.solutionSteps}
                                                                                    questionType={activeSolution.questionType}
                                                                                    difficulty={activeSolution.difficulty}
                                                                                />
                                                                            </div>
                                                                        )}

                                                                        {/* Question List (when no individual question is selected) */}
                                                                        {activeQuestionIndex === null && (
                                                                            <div className="space-y-2">
                                                                                {chapterSolutions.map((sol, i) => (
                                                                                    <button
                                                                                        key={sol._id}
                                                                                        onClick={() => openQuestion(i)}
                                                                                        className="w-full p-3 md:p-4 rounded-xl bg-slate-50 border border-slate-100 text-left hover:bg-brand-bg hover:border-brand-royal/20 transition-all group"
                                                                                    >
                                                                                        <div className="flex items-start gap-3">
                                                                                            <span className="flex-shrink-0 h-7 w-7 rounded-lg bg-brand-royal/10 text-brand-royal text-xs font-bold flex items-center justify-center mt-0.5 group-hover:bg-brand-royal group-hover:text-white transition-colors">
                                                                                                {sol.questionNumber || i + 1}
                                                                                            </span>
                                                                                            <div className="flex-1 min-w-0">
                                                                                                <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900 leading-relaxed">
                                                                                                    {decodeEntities(sol.question)}
                                                                                                </p>
                                                                                                <div className="flex items-center gap-2 mt-1.5">
                                                                                                    {sol.isFree ? (
                                                                                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Free</span>
                                                                                                    ) : (
                                                                                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Login to view</span>
                                                                                                    )}
                                                                                                    <span className="text-[10px] text-slate-400 group-hover:text-brand-royal transition-colors">Click to view solution</span>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}

                    {/* Concept Notes Tab */}
                    {activeTab === "notes" && (
                        <>
                            <h2 className="heading-section text-xl mb-6">Concept Notes & Videos</h2>
                            {loadingNotes ? (
                                <div className="space-y-3">{[...Array(5)].map((_, i) => (<div key={i} className="h-20 bg-white rounded-xl border border-slate-200 animate-pulse" />))}</div>
                            ) : notes.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                                    <Lightbulb className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <h2 className="text-xl font-semibold text-slate-700 mb-2">No Concept Notes Yet</h2>
                                    <p className="text-slate-500">Notes and videos for this subject haven&apos;t been added yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {notes.map((n) => (
                                        <div key={n._id} className="bg-white rounded-xl border border-slate-200 p-5">
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.type === "video" ? "bg-purple-100" : "bg-amber-100"}`}>
                                                    {n.type === "video" ? <Play className="h-5 w-5 text-purple-600" /> : <Lightbulb className="h-5 w-5 text-amber-600" />}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-800 text-sm">{n.title}</h3>
                                                    {n.chapter && <p className="text-xs text-slate-500">{n.chapter}</p>}
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${n.type === "video" ? "bg-purple-100 text-purple-700" : "bg-amber-100 text-amber-700"}`}>
                                                        {n.type === "video" ? "Video" : "Note"}
                                                    </span>
                                                </div>
                                            </div>
                                            {n.type === "video" && n.videoUrl ? (
                                                <div className="aspect-video rounded-xl overflow-hidden bg-slate-100">
                                                    <iframe src={n.videoUrl} allowFullScreen className="w-full h-full" title={n.title} />
                                                </div>
                                            ) : n.content ? (
                                                <div className="text-sm text-slate-600 whitespace-pre-wrap mt-3 p-3 bg-slate-50 rounded-xl">
                                                    <MathRenderer text={decodeEntities(n.content)} />
                                                </div>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Syllabus Tab */}
                    {activeTab === "syllabus" && (
                        <>
                            <h2 className="heading-section text-xl mb-6">Syllabus Documents</h2>
                            {loadingSyllabus ? (
                                <div className="space-y-3">{[...Array(3)].map((_, i) => (<div key={i} className="h-32 bg-white rounded-xl border border-slate-200 animate-pulse" />))}</div>
                            ) : syllabus.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                                    <ClipboardList className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <h2 className="text-xl font-semibold text-slate-700 mb-2">No Syllabus Documents Yet</h2>
                                    <p className="text-slate-500">Syllabus documents for this subject haven&apos;t been added yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {syllabus.map((s) => (
                                        <div key={s._id} className="bg-white rounded-xl border border-slate-200 p-6">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                                    <ClipboardList className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-800">{s.title}</h3>
                                                    <p className="text-xs text-slate-500">Academic Year: {s.year}</p>
                                                </div>
                                            </div>
                                            <div className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-xl p-4">
                                                <MathRenderer text={decodeEntities(s.content)} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Textbooks Tab */}
                    {activeTab === "textbooks" && (
                        <>
                            <h2 className="heading-section text-xl mb-6">Textbook PDF Downloads</h2>
                            {loadingTextbooks ? (
                                <div className="space-y-3">{[...Array(3)].map((_, i) => (<div key={i} className="h-20 bg-white rounded-xl border border-slate-200 animate-pulse" />))}</div>
                            ) : textbooks.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                                    <Download className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <h2 className="text-xl font-semibold text-slate-700 mb-2">No Textbook PDFs Yet</h2>
                                    <p className="text-slate-500">PDF textbooks for this subject haven&apos;t been uploaded yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {textbooks.map((t) => (
                                        <div key={t._id} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                                                    <FileText className="h-5 w-5 text-red-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800">{t.title}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {t.fileName} &bull; {formatSize(t.fileSize)} &bull; {t.downloads} download{t.downloads !== 1 ? "s" : ""}
                                                    </p>
                                                </div>
                                            </div>
                                            <a
                                                href={t.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={() => {
                                                    fetch("/api/textbooks/download", {
                                                        method: "POST",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({ id: t._id }),
                                                    }).catch(() => {});
                                                }}
                                                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors flex-shrink-0"
                                            >
                                                <Download className="h-4 w-4" /> Download PDF
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="section-padding bg-white">
                <div className="container-custom max-w-2xl mx-auto text-center">
                    <div className="p-8 rounded-3xl bg-brand-gradient-static text-white">
                        <Sparkles className="h-10 w-10 mx-auto mb-4 text-brand-sky" />
                        <h2 className="text-2xl font-bold mb-3">Need Practice for {subjectName}?</h2>
                        <p className="text-white/70 mb-6">
                            Practice with AI-generated MCQs and get instant feedback on your preparation.
                        </p>
                        <Link
                            href="/mock-test"
                            className="inline-flex items-center gap-2 bg-white text-brand-navy px-6 py-3 rounded-xl font-semibold hover:bg-brand-bg transition-all shadow-lg"
                        >
                            Take a Mock Test <ArrowLeft className="h-5 w-5 rotate-180" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
