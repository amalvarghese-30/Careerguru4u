"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, BookOpen, Beaker, ChevronRight } from "lucide-react";

const CLASSES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const SUBJECTS: Record<string, string[]> = {
    "CBSE": ["Science", "Mathematics", "Social Science", "English", "Hindi"],
    "ICSE": ["Science", "Mathematics", "Social Science", "English", "Hindi"],
    "Maharashtra Board": ["Science", "Mathematics", "Social Science", "English", "Hindi", "Marathi"],
};

export default function MockTestBoardPage() {
    const params = useParams();
    const router = useRouter();
    const board = decodeURIComponent(params.board as string);
    const [selectedClass, setSelectedClass] = useState<number | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [chapterCount, setChapterCount] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    const boardSubjects = SUBJECTS[board] || SUBJECTS["CBSE"];

    useEffect(() => {
        if (selectedClass && selectedSubject) {
            checkAvailability();
        }
    }, [selectedClass, selectedSubject]);

    const checkAvailability = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                board,
                class: selectedClass!.toString(),
                subject: selectedSubject!,
                limit: "1",
            });
            const res = await fetch(`/api/mcq?${params}`);
            const data = await res.json();
            setChapterCount(data.questions?.length || 0);
        } catch {
            setChapterCount(0);
        } finally {
            setLoading(false);
        }
    };

    const handleStartTest = () => {
        if (selectedClass && selectedSubject) {
            router.push(`/mock-test/${encodeURIComponent(board)}/${selectedClass}?subject=${encodeURIComponent(selectedSubject)}`);
        }
    };

    return (
        <div className="pt-20">
            {/* Hero */}
            <section className="bg-ocean-gradient py-12">
                <div className="container-custom">
                    <Link href="/mock-test" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-colors">
                        <ArrowLeft className="h-4 w-4" /> Back to Boards
                    </Link>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{board}</h1>
                        <p className="text-white/70">Select your class and subject to begin</p>
                    </motion.div>
                </div>
            </section>

            <section className="section-padding">
                <div className="container-custom max-w-3xl mx-auto">
                    {/* Step 1: Class Selection */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">Select Class</h2>
                        <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-2">
                            {CLASSES.map((cls) => (
                                <button
                                    key={cls}
                                    onClick={() => { setSelectedClass(cls); setSelectedSubject(null); }}
                                    className={`p-3 rounded-xl text-sm font-semibold transition-all ${
                                        selectedClass === cls
                                            ? "bg-brand-royal text-white shadow-lg shadow-brand-royal/20"
                                            : "bg-white border border-slate-200 text-slate-600 hover:border-brand-royal hover:text-brand-royal"
                                    }`}
                                >
                                    {cls}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Step 2: Subject Selection */}
                    {selectedClass && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">
                                Select Subject <span className="text-sm text-slate-400 font-normal">for Class {selectedClass}</span>
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {boardSubjects.map((subj) => (
                                    <button
                                        key={subj}
                                        onClick={() => setSelectedSubject(subj)}
                                        className={`p-4 rounded-xl text-left transition-all ${
                                            selectedSubject === subj
                                                ? "bg-brand-royal text-white shadow-lg shadow-brand-royal/20"
                                                : "bg-white border border-slate-200 text-slate-700 hover:border-brand-royal"
                                        }`}
                                    >
                                        <BookOpen className={`h-5 w-5 mb-2 ${selectedSubject === subj ? "text-white" : "text-brand-royal"}`} />
                                        <span className="font-semibold text-sm">{subj}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Start Test */}
                    {selectedSubject && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl border border-slate-200 p-6"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-slate-800">Ready to Begin</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {board} - Class {selectedClass} - {selectedSubject}
                                    </p>
                                    {loading ? (
                                        <p className="text-sm text-slate-400 mt-1">Checking available questions...</p>
                                    ) : (
                                        <p className="text-sm text-green-600 mt-1">Questions available</p>
                                    )}
                                </div>
                                <button
                                    onClick={handleStartTest}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-3 bg-brand-gradient-static text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
                                >
                                    Start Test <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </section>
        </div>
    );
}
