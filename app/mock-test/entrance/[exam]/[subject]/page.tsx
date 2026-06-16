"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle, XCircle, Award, BookOpen, RefreshCw, AlertTriangle, Timer } from "lucide-react";

interface MCQQuestion {
    _id: string;
    questionText: string;
    options: string[];
    board: string;
    class: number;
    subject: string;
    chapter: string;
    examType: string;
    difficulty: string;
}

interface TestResult {
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    unattempted: number;
    score: number;
    negativeMarks?: number;
    results: {
        questionId: string;
        selectedOption: number;
        isCorrect: boolean;
        correctOptionIndex: number;
        explanation: string;
    }[];
}

export default function EntranceExamTestPage() {
    const params = useParams();
    const router = useRouter();
    const examType = decodeURIComponent(params.exam as string);
    const subject = decodeURIComponent(params.subject as string);

    const [questions, setQuestions] = useState<MCQQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<TestResult | null>(null);
    const [examInfo, setExamInfo] = useState<any>(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [error, setError] = useState("");
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const hasSubmittedRef = useRef(false);

    const isTimed = subject !== "all";
    const isAll = subject === "all";

    useEffect(() => {
        fetch(`/api/exam/info/${encodeURIComponent(examType)}`)
            .then(r => r.json())
            .then(data => {
                if (data.pattern) {
                    setExamInfo(data.pattern);
                    const timeLimit = data.pattern.timeLimit || 30;
                    setTimeRemaining(timeLimit * 60);
                }
            })
            .catch(() => {});
        fetchQuestions();
    }, []);

    useEffect(() => {
        if (examInfo && questions.length > 0 && !result) {
            timerRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        if (timerRef.current) clearInterval(timerRef.current);
                        handleAutoSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [examInfo, questions, result]);

    const fetchQuestions = async () => {
        setLoading(true);
        setError("");
        try {
            const queryParams = new URLSearchParams({
                examType,
                subject,
                limit: isAll ? "60" : "30",
            });
            const res = await fetch(`/api/mcq?${queryParams}`);
            const data = await res.json();
            if (data.questions?.length === 0) {
                setError("No questions found for this exam and subject. Generate them from the admin panel first.");
            }
            const shuffled = data.questions?.sort(() => Math.random() - 0.5) || [];
            setQuestions(shuffled);
        } catch {
            setError("Failed to load questions.");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectOption = (optionIndex: number) => {
        if (result) return;
        const currentQ = questions[currentIndex];
        if (!currentQ) return;
        setAnswers(prev => ({ ...prev, [currentQ._id]: optionIndex }));

        if (currentIndex < questions.length - 1) {
            setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
        }
    };

    const handleAutoSubmit = useCallback(async () => {
        if (hasSubmittedRef.current) return;
        hasSubmittedRef.current = true;
        await submitTest();
    }, [answers, questions]);

    const submitTest = async () => {
        setSubmitting(true);
        try {
            const answerArray = Object.entries(answers).map(([questionId, selectedOption]) => ({
                questionId,
                selectedOption,
            }));

            const allQuestionIds = questions.map(q => q._id);
            for (const qid of allQuestionIds) {
                if (!answers.hasOwnProperty(qid)) {
                    answerArray.push({ questionId: qid, selectedOption: -1 });
                }
            }

            const timeTaken = examInfo ? examInfo.timeLimit * 60 - timeRemaining : 0;

            const res = await fetch("/api/mcq/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    answers: answerArray,
                    examType,
                    subject,
                    timeTaken: Math.max(0, timeTaken),
                    negativeMarking: true,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setResult(data);
            } else {
                setError(data.error || "Failed to submit test");
            }
        } catch {
            setError("Failed to submit test.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSkip = () => {
        if (result) return;
        const currentQ = questions[currentIndex];
        if (!currentQ) return;
        setAnswers(prev => ({ ...prev, [currentQ._id]: -1 }));
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const currentQ = questions[currentIndex];
    const answeredCount = Object.values(answers).filter(v => v >= 0).length;
    const skippedCount = Object.values(answers).filter(v => v === -1).length;

    if (loading) {
        return (
            <div className="pt-20 min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="h-10 w-10 border-2 border-brand-royal border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500">Loading questions...</p>
                </div>
            </div>
        );
    }

    if (error && questions.length === 0) {
        return (
            <div className="pt-20 min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center max-w-md">
                    <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-700 mb-2">No Questions Available</h2>
                    <p className="text-slate-500 mb-6">{error}</p>
                    <Link
                        href={`/mock-test/entrance/${examType}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-royal text-white rounded-xl font-semibold"
                    >
                        <ArrowLeft className="h-4 w-4" /> Go Back
                    </Link>
                </div>
            </div>
        );
    }

    if (result) {
        return (
            <div className="pt-20 min-h-screen bg-slate-50">
                <div className="container-custom max-w-2xl mx-auto py-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl border border-slate-200 p-8 text-center mb-6"
                    >
                        <div className={`h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                            result.score >= 70 ? "bg-green-100" : result.score >= 40 ? "bg-amber-100" : "bg-red-100"
                        }`}>
                            <Award className={`h-10 w-10 ${
                                result.score >= 70 ? "text-green-600" : result.score >= 40 ? "text-amber-600" : "text-red-600"
                            }`} />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">Test Complete!</h1>
                        <p className="text-sm text-slate-500 mb-6">{examType} - {subject}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-2xl font-bold text-brand-royal">{result.score}%</p>
                                <p className="text-xs text-slate-500">Score</p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-xl">
                                <p className="text-2xl font-bold text-green-600">{result.correctAnswers}</p>
                                <p className="text-xs text-green-700">Correct (+{examInfo?.markingScheme.correct || 4})</p>
                            </div>
                            <div className="p-4 bg-red-50 rounded-xl">
                                <p className="text-2xl font-bold text-red-600">{result.wrongAnswers}</p>
                                <p className="text-xs text-red-700">Wrong ({examInfo?.markingScheme.incorrect || -1})</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-2xl font-bold text-slate-400">{result.unattempted || 0}</p>
                                <p className="text-xs text-slate-500">Skipped</p>
                            </div>
                        </div>

                        {result.negativeMarks !== undefined && result.negativeMarks > 0 && (
                            <p className="text-sm text-red-600 mb-4">
                                Negative marks deducted: -{result.negativeMarks}
                            </p>
                        )}

                        <div className="flex items-center gap-3 justify-center">
                            <button
                                onClick={() => {
                                    setResult(null);
                                    setAnswers({});
                                    setCurrentIndex(0);
                                    if (examInfo) setTimeRemaining(examInfo.timeLimit * 60);
                                    hasSubmittedRef.current = false;
                                    fetchQuestions();
                                }}
                                className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                            >
                                <RefreshCw className="h-4 w-4" /> Retake
                            </button>
                            <Link
                                href={`/mock-test/entrance/${examType}`}
                                className="flex items-center gap-2 px-5 py-2.5 bg-brand-royal text-white rounded-xl font-semibold"
                            >
                                <BookOpen className="h-4 w-4" /> More Tests
                            </Link>
                        </div>
                    </motion.div>

                    {/* Answer Review */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-slate-800">Answer Review</h2>
                        {result.results.map((r, i) => {
                            const q = questions.find(q => q._id === r.questionId);
                            if (!q) return null;
                            const isSkipped = r.selectedOption === -1;
                            return (
                                <div key={r.questionId} className={`bg-white rounded-xl border p-5 ${isSkipped ? "border-slate-200" : r.isCorrect ? "border-green-200" : "border-red-200"}`}>
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {isSkipped ? (
                                                <AlertTriangle className="h-5 w-5 text-slate-400" />
                                            ) : r.isCorrect ? (
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-red-500" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">
                                                <span className="text-slate-400 mr-1">Q{i + 1}.</span>
                                                {q.questionText}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="ml-8 space-y-2">
                                        {q.options.map((opt, oi) => (
                                            <div
                                                key={oi}
                                                className={`p-2 rounded-lg text-sm ${
                                                    oi === r.correctOptionIndex
                                                        ? "bg-green-50 border border-green-200 text-green-800"
                                                        : oi === r.selectedOption && !r.isCorrect
                                                            ? "bg-red-50 border border-red-200 text-red-800"
                                                            : "bg-slate-50 text-slate-500"
                                                }`}
                                            >
                                                <span className="font-semibold mr-2">{String.fromCharCode(65 + oi)}.</span>
                                                {opt}
                                                {oi === r.correctOptionIndex && <span className="ml-2 text-green-600 text-xs font-medium">Correct</span>}
                                                {oi === r.selectedOption && !r.isCorrect && <span className="ml-2 text-red-600 text-xs font-medium">Your Answer</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-20 min-h-screen bg-slate-50">
            <div className="container-custom max-w-3xl mx-auto py-6">
                {/* Header */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <Link href={`/mock-test/entrance/${examType}`} className="text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-1">
                                <ArrowLeft className="h-3 w-3" /> Back
                            </Link>
                            <h2 className="font-semibold text-slate-800">{examType} — {subject}</h2>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 text-sm font-semibold ${
                                timeRemaining < 60 ? "text-red-600" : timeRemaining < 300 ? "text-amber-600" : "text-slate-600"
                            }`}>
                                <Timer className="h-4 w-4" />
                                {formatTime(timeRemaining)}
                            </div>
                            <div className="text-sm text-slate-500">
                                {answeredCount}/{questions.length} answered ({skippedCount} skipped)
                            </div>
                            {examInfo && (
                                <div className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 font-medium">
                                    +{examInfo.markingScheme.correct}/{examInfo.markingScheme.incorrect}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-brand-royal transition-all duration-300 rounded-full"
                            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-1.5 text-xs text-slate-400">
                        <span>Question {currentIndex + 1} of {questions.length}</span>
                        <span className="capitalize">{currentQ?.difficulty}</span>
                    </div>
                </div>

                {/* Question Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-2xl border border-slate-200 p-6 mb-4"
                    >
                        <p className="text-lg font-medium text-slate-800 mb-6">
                            <span className="text-brand-royal font-bold mr-2">Q{currentIndex + 1}.</span>
                            {currentQ?.questionText}
                        </p>

                        <div className="space-y-3">
                            {currentQ?.options.map((opt, i) => {
                                const isSelected = answers[currentQ._id] === i;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleSelectOption(i)}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                            isSelected
                                                ? "border-brand-royal bg-brand-royal/5"
                                                : "border-slate-100 hover:border-slate-300 bg-slate-50"
                                        }`}
                                    >
                                        <span className={`inline-flex items-center justify-center h-7 w-7 rounded-lg text-sm font-semibold mr-3 ${
                                            isSelected ? "bg-brand-royal text-white" : "bg-slate-200 text-slate-600"
                                        }`}>
                                            {String.fromCharCode(65 + i)}
                                        </span>
                                        <span className={`text-sm ${isSelected ? "text-brand-royal font-medium" : "text-slate-700"}`}>
                                            {opt}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentIndex === 0}
                        className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>

                    <div className="flex gap-2 items-center">
                        <button
                            onClick={handleSkip}
                            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-amber-600 hover:bg-amber-50"
                        >
                            Skip
                        </button>
                        <div className="flex gap-1 flex-wrap justify-center max-w-[240px]">
                            {questions.slice(0, 20).map((_, i) => {
                                const qId = questions[i]?._id;
                                const ans = answers[qId];
                                return (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentIndex(i)}
                                        className={`h-7 w-7 rounded-lg text-xs font-semibold transition-all ${
                                            i === currentIndex
                                                ? "bg-brand-royal text-white"
                                                : ans !== undefined && ans >= 0
                                                    ? "bg-green-100 text-green-700 border border-green-300"
                                                    : ans === -1
                                                        ? "bg-amber-100 text-amber-700 border border-amber-300"
                                                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {currentIndex === questions.length - 1 ? (
                        <button
                            onClick={submitTest}
                            disabled={submitting || answeredCount === 0}
                            className="px-6 py-2.5 bg-brand-gradient-static text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                        >
                            {submitting ? "Submitting..." : "Submit Test"}
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                            className="px-4 py-2.5 bg-brand-royal text-white rounded-xl text-sm font-medium hover:bg-brand-navy"
                        >
                            Next
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
