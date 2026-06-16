"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface FeedbackItem {
    category: string;
    score: number;
    suggestion: string;
}

interface Props {
    sections: {
        personalInfo?: any;
        education?: any[];
        skills?: string[];
        experience?: any[];
        achievements?: string[];
    };
}

export default function ATSScoreCard({ sections }: Props) {
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const hasData = sections.personalInfo?.fullName || (sections.skills?.length || 0) > 0 || (sections.education?.length || 0) > 0;
        if (!hasData) {
            setScore(0);
            setFeedback([]);
            return;
        }

        const timer = setTimeout(() => {
            setLoading(true);
            fetch("/api/resume/ats-score", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sections),
            })
                .then(r => r.json())
                .then(data => {
                    setScore(data.atsScore || 0);
                    setFeedback(data.feedback || []);
                })
                .catch(() => {})
                .finally(() => setLoading(false));
        }, 500);

        return () => clearTimeout(timer);
    }, [
        JSON.stringify(sections.personalInfo),
        JSON.stringify(sections.education),
        JSON.stringify(sections.skills),
        JSON.stringify(sections.experience),
        JSON.stringify(sections.achievements),
    ]);

    const color = score >= 70 ? "text-green-600" : score >= 40 ? "text-amber-600" : "text-red-600";
    const bgColor = score >= 70 ? "bg-green-100" : score >= 40 ? "bg-amber-100" : "bg-red-100";
    const ringColor = score >= 70 ? "stroke-green-500" : score >= 40 ? "stroke-amber-500" : "stroke-red-500";

    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="premium-card p-5 sticky top-24">
            <h3 className="font-semibold text-slate-800 text-sm mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand-royal" />
                ATS Score
                {loading && <span className="text-xs text-slate-400 animate-pulse">Updating...</span>}
            </h3>

            {/* Score Circle */}
            <div className="flex items-center justify-center mb-4">
                <div className="relative h-24 w-24">
                    <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="8" />
                        <circle
                            cx="50" cy="50" r={radius} fill="none"
                            className={ringColor} strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            style={{ transition: "stroke-dashoffset 0.8s ease" }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-xl font-bold ${color}`}>{score}</span>
                    </div>
                </div>
            </div>

            <p className="text-xs text-slate-400 text-center mb-4">
                {score >= 80 ? "Excellent! Your resume is well-optimized." :
                    score >= 60 ? "Good start. A few improvements needed." :
                        score >= 30 ? "Needs work. Follow the suggestions below." :
                            "Fill in more sections to see your score."}
            </p>

            {/* Feedback List */}
            {feedback.length > 0 && (
                <div className="space-y-2">
                    {feedback.map((f, i) => (
                        <motion.div
                            key={f.category}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`p-3 rounded-xl ${
                                f.score >= 8 ? "bg-green-50 border border-green-100" :
                                    f.score >= 4 ? "bg-amber-50 border border-amber-100" :
                                        "bg-slate-50 border border-slate-100"
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                {f.score >= 8 ? (
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : f.score >= 4 ? (
                                    <Info className="h-3 w-3 text-amber-500" />
                                ) : (
                                    <AlertTriangle className="h-3 w-3 text-red-400" />
                                )}
                                <span className="text-xs font-semibold text-slate-700">{f.category}</span>
                                <span className="text-xs text-slate-400 ml-auto">{f.score}/10</span>
                            </div>
                            <p className="text-xs text-slate-500 ml-5">{f.suggestion}</p>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
