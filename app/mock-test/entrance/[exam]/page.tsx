"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, Target, ChevronRight, Award, AlertTriangle, BarChart3 } from "lucide-react";

interface ExamData {
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
    examDate: string;
    session: string;
}

export default function EntranceExamPage() {
    const params = useParams();
    const router = useRouter();
    const examSlug = decodeURIComponent(params.exam as string);
    const [exam, setExam] = useState<ExamData | null>(null);
    const [questionCount, setQuestionCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch(`/api/exam/info/${encodeURIComponent(examSlug)}`)
            .then(r => r.json())
            .then(data => {
                if (data.error) {
                    setError(data.error);
                } else {
                    setExam(data.pattern);
                    setQuestionCount(data.questionCount || 0);
                }
            })
            .catch(() => setError("Failed to load exam details"))
            .finally(() => setLoading(false));
    }, [examSlug]);

    if (loading) {
        return (
            <div className="pt-20 min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="h-10 w-10 border-2 border-brand-royal border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500">Loading exam details...</p>
                </div>
            </div>
        );
    }

    if (error || !exam) {
        return (
            <div className="pt-20 min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center max-w-md">
                    <AlertTriangle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-700 mb-2">Exam Not Found</h2>
                    <p className="text-slate-500 mb-6">{error || "This exam is not available yet."}</p>
                    <Link href="/mock-test/entrance" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-royal text-white rounded-xl font-semibold">
                        <ArrowLeft className="h-4 w-4" /> Back to Exams
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-20">
            {/* Hero */}
            <section className="bg-ocean-gradient py-12">
                <div className="container-custom">
                    <Link href="/mock-test/entrance" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-colors">
                        <ArrowLeft className="h-4 w-4" /> All Exams
                    </Link>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{exam.displayName}</h1>
                        <p className="text-white/70 mb-4">{exam.description}</p>
                        <div className="flex flex-wrap gap-3 text-white/80 text-sm">
                            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
                                <Target className="h-4 w-4" /> {exam.totalMarks} Marks
                            </span>
                            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
                                <Clock className="h-4 w-4" /> {exam.timeLimit} Minutes
                            </span>
                            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
                                <BookOpen className="h-4 w-4" /> {exam.totalQuestions} Questions
                            </span>
                            <span className="flex items-center gap-1.5 bg-amber-500/20 px-3 py-1.5 rounded-lg">
                                +{exam.markingScheme.correct} / {exam.markingScheme.incorrect} marking
                            </span>
                        </div>
                        {exam.session && (
                            <p className="text-white/50 text-sm mt-3">Session: {exam.session}</p>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* Subject Selection */}
            <section className="section-padding">
                <div className="container-custom max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-slate-800">Subject-wise Tests</h2>
                        {questionCount > 0 && (
                            <Link
                                href={`/mock-test/entrance/${exam.examType}/analytics`}
                                className="flex items-center gap-2 text-sm text-brand-royal hover:underline"
                            >
                                <BarChart3 className="h-4 w-4" /> View Analytics
                            </Link>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {exam.subjects.map((subj, i) => (
                            <motion.div
                                key={subj.name}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="premium-card p-5"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold text-slate-800 mb-1">{subj.name}</h3>
                                        <p className="text-xs text-slate-400 mb-3">
                                            {subj.topics?.length || "Multiple"} topics covered
                                        </p>
                                    </div>
                                    <BookOpen className="h-8 w-8 text-brand-royal/20" />
                                </div>
                                <button
                                    onClick={() => router.push(`/mock-test/entrance/${exam.examType}/${encodeURIComponent(subj.name)}`)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-royal text-white rounded-xl font-semibold text-sm hover:bg-brand-navy transition-colors"
                                >
                                    Start Test <ChevronRight className="h-4 w-4" />
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    {/* Full Mock Test */}
                    {exam.subjects.length > 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-gradient-to-r from-brand-navy to-brand-royal rounded-2xl p-6 text-white"
                        >
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Full Mock Test</h3>
                                    <p className="text-white/70 text-sm">
                                        Practice all subjects together in {exam.timeLimit} minutes &middot; {exam.totalMarks} marks
                                    </p>
                                </div>
                                <button
                                    onClick={() => router.push(`/mock-test/entrance/${exam.examType}/all`)}
                                    className="flex items-center gap-2 px-6 py-3 bg-white text-brand-royal rounded-xl font-semibold hover:bg-white/90 transition-all"
                                >
                                    Start Full Test <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Eligibility & Info */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-8 bg-slate-50 rounded-2xl p-6 border border-slate-200"
                    >
                        <h3 className="font-semibold text-slate-800 mb-3">Exam Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-slate-400 mb-1">Eligibility</p>
                                <p className="text-slate-600">{exam.eligibility || "Check official website"}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 mb-1">Marking Scheme</p>
                                <p className="text-slate-600">
                                    +{exam.markingScheme.correct} for correct, {exam.markingScheme.incorrect} for wrong, {exam.markingScheme.unattempted} for unattempted
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
