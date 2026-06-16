"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { GraduationCap, Clock, Target, ChevronRight, Beaker, FileQuestion, Award, BookOpen } from "lucide-react";

const ICONS: Record<string, React.ElementType> = {
    GraduationCap, Beaker, FileQuestion, Award, BookOpen, Target,
};

const DEFAULT_EXAMS = [
    {
        examType: "JEE-Main",
        displayName: "JEE Main",
        description: "Joint Entrance Examination for engineering admissions to NITs, IIITs and other CFTIs",
        category: "engineering",
        subjects: [{ name: "Physics", topics: [] }, { name: "Chemistry", topics: [] }, { name: "Mathematics", topics: [] }],
        totalMarks: 300,
        totalQuestions: 75,
        timeLimit: 180,
        markingScheme: { correct: 4, incorrect: -1, unattempted: 0 },
        icon: "GraduationCap",
        session: "April 2026",
        eligibility: "10+2 with Physics, Chemistry, Mathematics",
    },
    {
        examType: "NEET-UG",
        displayName: "NEET-UG",
        description: "National Eligibility cum Entrance Test for MBBS/BDS admissions in India",
        category: "medical",
        subjects: [{ name: "Physics", topics: [] }, { name: "Chemistry", topics: [] }, { name: "Biology", topics: [] }],
        totalMarks: 720,
        totalQuestions: 180,
        timeLimit: 200,
        markingScheme: { correct: 4, incorrect: -1, unattempted: 0 },
        icon: "Beaker",
        session: "May 2026",
        eligibility: "10+2 with Physics, Chemistry, Biology",
    },
    {
        examType: "CUET-UG",
        displayName: "CUET UG",
        description: "Common University Entrance Test for central university admissions",
        category: "other",
        subjects: [{ name: "English", topics: [] }, { name: "General Test", topics: [] }, { name: "Mathematics", topics: [] }],
        totalMarks: 800,
        totalQuestions: 160,
        timeLimit: 180,
        markingScheme: { correct: 5, incorrect: -1, unattempted: 0 },
        icon: "BookOpen",
        session: "May 2026",
        eligibility: "10+2 from any recognized board",
    },
    {
        examType: "CAT",
        displayName: "CAT",
        description: "Common Admission Test for IIMs and top business schools",
        category: "management",
        subjects: [{ name: "VARC", topics: [] }, { name: "DILR", topics: [] }, { name: "Quantitative Aptitude", topics: [] }],
        totalMarks: 198,
        totalQuestions: 66,
        timeLimit: 120,
        markingScheme: { correct: 3, incorrect: -1, unattempted: 0 },
        icon: "Award",
        session: "November 2026",
        eligibility: "Bachelor's degree with 50% marks (45% for SC/ST/PwD)",
    },
    {
        examType: "CLAT",
        displayName: "CLAT",
        description: "Common Law Admission Test for NLUs and other law schools",
        category: "law",
        subjects: [{ name: "English", topics: [] }, { name: "Legal Reasoning", topics: [] }, { name: "Logical Reasoning", topics: [] }, { name: "GK & Current Affairs", topics: [] }, { name: "Quantitative Techniques", topics: [] }],
        totalMarks: 120,
        totalQuestions: 120,
        timeLimit: 120,
        markingScheme: { correct: 1, incorrect: -0.25, unattempted: 0 },
        icon: "FileQuestion",
        session: "December 2026",
        eligibility: "10+2 with 45% marks (40% for SC/ST)",
    },
    {
        examType: "GATE",
        displayName: "GATE",
        description: "Graduate Aptitude Test in Engineering for M.Tech admissions and PSU jobs",
        category: "engineering",
        subjects: [{ name: "General Aptitude", topics: [] }, { name: "Engineering Mathematics", topics: [] }, { name: "Core Subject", topics: [] }],
        totalMarks: 100,
        totalQuestions: 65,
        timeLimit: 180,
        markingScheme: { correct: 1, incorrect: -0.33, unattempted: 0 },
        icon: "Target",
        session: "February 2026",
        eligibility: "Bachelor's degree in Engineering/Technology",
    },
];

const CATEGORY_COLORS: Record<string, string> = {
    engineering: "from-blue-600 to-blue-400",
    medical: "from-emerald-600 to-emerald-400",
    management: "from-purple-600 to-purple-400",
    law: "from-amber-600 to-amber-400",
    "civil-service": "from-red-600 to-red-400",
    other: "from-slate-600 to-slate-400",
};

export default function EntranceExamListingPage() {
    const [exams, setExams] = useState(DEFAULT_EXAMS);

    useEffect(() => {
        fetch("/api/exam/patterns")
            .then(r => r.json())
            .then(data => {
                if (data.patterns?.length > 0) setExams(data.patterns);
            })
            .catch(() => {});
    }, []);

    return (
        <div className="pt-20">
            {/* Hero */}
            <section className="bg-ocean-gradient py-16">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                                Entrance Exam Prep
                            </h1>
                            <p className="text-white/80 text-lg mb-6">
                                Practice with full-length mock tests for JEE, NEET, CUET, CAT, CLAT, and more. Timed exams, negative marking, and detailed analytics.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 text-white/70 text-sm">
                                <div className="flex items-center gap-2"><Target className="h-4 w-4" /> Exam-pattern matching</div>
                                <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> Timed full-length tests</div>
                                <div className="flex items-center gap-2"><Award className="h-4 w-4" /> Detailed score analytics</div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Exam Grid */}
            <section className="section-padding">
                <div className="container-custom">
                    <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">Select an Exam</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {exams.map((exam, i) => {
                            const IconComp = ICONS[exam.icon] || GraduationCap;
                            const colorClass = CATEGORY_COLORS[exam.category] || CATEGORY_COLORS.other;
                            return (
                                <motion.div
                                    key={exam.examType}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Link
                                        href={`/mock-test/entrance/${exam.examType}`}
                                        className="block premium-card p-6 group h-full"
                                    >
                                        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center mb-4`}>
                                            <IconComp className="h-6 w-6 text-white" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-800 mb-2">{exam.displayName}</h3>
                                        <p className="text-sm text-slate-500 mb-4 line-clamp-2">{exam.description}</p>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {exam.subjects?.slice(0, 3).map((s: any) => (
                                                <span key={s.name} className="text-xs px-2 py-1 rounded-full bg-brand-bg text-brand-royal font-medium">
                                                    {s.name}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-slate-400">
                                            <span>{exam.totalMarks} marks  &middot; {exam.timeLimit} min</span>
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                                                +{exam.markingScheme.correct}/{(exam.markingScheme.incorrect)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-brand-royal text-sm font-medium mt-4 group-hover:gap-2 transition-all">
                                            Start Practice <ChevronRight className="h-4 w-4" />
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
}
