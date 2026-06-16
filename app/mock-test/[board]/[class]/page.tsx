"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle, XCircle, Award, BookOpen, RefreshCw } from "lucide-react";

interface MCQQuestion {
    _id: string;
    questionText: string;
    options: string[];
    correctOptionIndex?: number;
    explanation?: string;
    board: string;
    class: number;
    subject: string;
    chapter: string;
    difficulty: string;
}

interface TestResult {
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    score: number;
    results: {
        questionId: string;
        selectedOption: number;
        isCorrect: boolean;
        correctOptionIndex: number;
        explanation: string;
    }[];
}

export default function MockTestExamPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const board = decodeURIComponent(params.board as string);
    const classNum = parseInt(params.class as string);
    const subject = searchParams.get("subject") || "";

    const [questions, setQuestions] = useState<MCQQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<TestResult | null>(null);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [startTime] = useState(Date.now());
    const [error, setError] = useState("");

    useEffect(() => {
        fetchQuestions();
    }, []);

    useEffect(() => {
        if (questions.length > 0 && !result) {
            const timer = setInterval(() => {
                setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [questions, result, startTime]);

    const fetchQuestions = async () => {
        setLoading(true);
        setError("");
        try {
            const queryParams = new URLSearchParams({
                board,
                class: classNum.toString(),
                subject,
                limit: "20",
            });
            const res = await fetch(`/api/mcq?${queryParams}`);
            const data = await res.json();
            if (data.questions?.length === 0) {
                setError("No MCQ questions found for this selection. Generate them from the admin panel first.");
            }
            setQuestions(data.questions || []);
        } catch {
            setError("Failed to load questions. Please try again.");
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

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const answerArray = Object.entries(answers).map(([questionId, selectedOption]) => ({
                questionId,
                selectedOption,
            }));

            const res = await fetch("/api/mcq/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    answers: answerArray,
                    board,
                    class: classNum,
                    subject,
                    timeTaken: timeElapsed,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setResult(data);
            } else {
                setError(data.error || "Failed to submit test");
            }
        } catch {
            setError("Failed to submit test. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const currentQ = questions[currentIndex];
    const answeredCount = Object.keys(answers).length;

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
                        href={`/mock-test/${encodeURIComponent(board)}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-royal text-white rounded-xl font-semibold hover:bg-brand-navy transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" /> Go Back
                    </Link>
                </div>
            </div>
        );
    }

    // Results Screen
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
                        <p className="text-slate-500 mb-6">Here&apos;s how you performed</p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-3xl font-bold text-brand-royal">{result.score}%</p>
                                <p className="text-sm text-slate-500">Score</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-3xl font-bold text-slate-700">{formatTime(timeElapsed)}</p>
                                <p className="text-sm text-slate-500">Time Taken</p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-xl">
                                <p className="text-3xl font-bold text-green-600">{result.correctAnswers}</p>
                                <p className="text-sm text-green-700">Correct</p>
                            </div>
                            <div className="p-4 bg-red-50 rounded-xl">
                                <p className="text-3xl font-bold text-red-600">{result.wrongAnswers}</p>
                                <p className="text-sm text-red-700">Wrong</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 justify-center">
                            <button
                                onClick={() => {
                                    setResult(null);
                                    setAnswers({});
                                    setCurrentIndex(0);
                                    setTimeElapsed(0);
                                }}
                                className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                <RefreshCw className="h-4 w-4" /> Retake
                            </button>
                            <Link
                                href={`/mock-test/${encodeURIComponent(board)}`}
                                className="flex items-center gap-2 px-5 py-2.5 bg-brand-royal text-white rounded-xl font-semibold hover:bg-brand-navy transition-colors"
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
                            return (
                                <div key={r.questionId} className="bg-white rounded-xl border border-slate-200 p-5">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {r.isCorrect ? (
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
                                                {oi === r.correctOptionIndex && <span className="ml-2 text-green-600 text-xs font-medium">Correct Answer</span>}
                                                {oi === r.selectedOption && !r.isCorrect && <span className="ml-2 text-red-600 text-xs font-medium">Your Answer</span>}
                                            </div>
                                        ))}
                                    </div>
                                    {r.explanation && (
                                        <details className="ml-8 mt-3">
                                            <summary className="text-sm text-brand-royal cursor-pointer hover:underline">Explanation</summary>
                                            <p className="text-sm text-slate-600 mt-2 p-3 bg-slate-50 rounded-lg">{r.explanation}</p>
                                        </details>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // Test Screen
    return (
        <div className="pt-20 min-h-screen bg-slate-50">
            <div className="container-custom max-w-3xl mx-auto py-6">
                {/* Header */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <Link href={`/mock-test/${encodeURIComponent(board)}`} className="text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-1">
                                <ArrowLeft className="h-3 w-3" /> Back
                            </Link>
                            <h2 className="font-semibold text-slate-800">{board} - Class {classNum} - {subject}</h2>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Clock className="h-4 w-4" />
                                {formatTime(timeElapsed)}
                            </div>
                            <div className="text-sm text-slate-500">
                                {answeredCount}/{questions.length} answered
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
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
                        className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>

                    <div className="flex gap-2 flex-wrap justify-center">
                        {questions.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all ${
                                    i === currentIndex
                                        ? "bg-brand-royal text-white"
                                        : answers[questions[i]._id] !== undefined
                                            ? "bg-green-100 text-green-700 border border-green-300"
                                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    {currentIndex === questions.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || answeredCount === 0}
                            className="px-6 py-2.5 bg-brand-gradient-static text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
                        >
                            {submitting ? "Submitting..." : "Submit Test"}
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                            className="px-4 py-2.5 bg-brand-royal text-white rounded-xl text-sm font-medium hover:bg-brand-navy transition-colors"
                        >
                            Next
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
