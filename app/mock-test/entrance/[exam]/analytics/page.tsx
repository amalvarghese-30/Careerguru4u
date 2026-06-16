"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Trophy, Target, TrendingUp, AlertTriangle, BarChart3, Clock } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#0056D2", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function EntranceExamAnalyticsPage() {
    const params = useParams();
    const examType = decodeURIComponent(params.exam as string);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/exam/analytics?examType=${encodeURIComponent(examType)}`)
            .then(r => r.json())
            .then(data => setData(data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [examType]);

    if (loading) {
        return (
            <div className="pt-20 min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="h-10 w-10 border-2 border-brand-royal border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (!data || data.stats?.totalAttempts === 0) {
        return (
            <div className="pt-20 min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center max-w-md">
                    <BarChart3 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-700 mb-2">No Analytics Yet</h2>
                    <p className="text-slate-500 mb-6">Take some practice tests to see your performance analytics here.</p>
                    <Link
                        href={`/mock-test/entrance/${examType}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-royal text-white rounded-xl font-semibold"
                    >
                        <ArrowLeft className="h-4 w-4" /> Start Practicing
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-20 min-h-screen bg-slate-50">
            <div className="container-custom py-8">
                <Link
                    href={`/mock-test/entrance/${examType}`}
                    className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 mb-4"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to {examType}
                </Link>

                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-bold text-slate-800 mb-6"
                >
                    {examType} Performance Analytics
                </motion.h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { icon: Target, label: "Total Tests", value: data.stats.totalAttempts, color: "text-brand-royal", bg: "bg-blue-50" },
                        { icon: Trophy, label: "Best Score", value: `${data.stats.bestScore}%`, color: "text-green-600", bg: "bg-green-50" },
                        { icon: TrendingUp, label: "Average Score", value: `${data.stats.avgScore}%`, color: "text-amber-600", bg: "bg-amber-50" },
                        { icon: Clock, label: "Recent Tests", value: data.recentAttempts?.length || 0, color: "text-purple-600", bg: "bg-purple-50" },
                    ].map((card, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="premium-card p-4"
                        >
                            <div className={`h-10 w-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                                <card.icon className={`h-5 w-5 ${card.color}`} />
                            </div>
                            <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                            <p className="text-xs text-slate-500">{card.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Score Progression Chart */}
                {data.scoreProgression?.length > 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="premium-card p-6 mb-6"
                    >
                        <h3 className="font-semibold text-slate-800 mb-4">Score Progression</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={data.scoreProgression}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis dataKey="attempt" stroke="#94A3B8" fontSize={12} />
                                <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0" }}
                                    formatter={(value: any) => [`${value}%`, "Score"]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#0056D2"
                                    strokeWidth={2}
                                    dot={{ fill: "#0056D2", r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}

                {/* Subject-wise Performance */}
                {data.subjectBreakdown?.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="premium-card p-6 mb-6"
                    >
                        <h3 className="font-semibold text-slate-800 mb-4">Subject-wise Performance</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={data.subjectBreakdown}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis dataKey="subject" stroke="#94A3B8" fontSize={12} />
                                <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0" }}
                                    formatter={(value: any) => [`${value}%`, "Average Score"]}
                                />
                                <Bar dataKey="avgScore" radius={[6, 6, 0, 0]}>
                                    {data.subjectBreakdown.map((_: any, i: number) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}

                {/* Weak Areas */}
                {data.stats.weakAreas?.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="premium-card p-6 mb-6 border-amber-200"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            <h3 className="font-semibold text-slate-800">Areas to Improve</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {data.stats.weakAreas.map((area: string) => (
                                <span key={area} className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium">
                                    {area}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Recent Attempts */}
                {data.recentAttempts?.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="premium-card p-6"
                    >
                        <h3 className="font-semibold text-slate-800 mb-4">Recent Attempts</h3>
                        <div className="space-y-3">
                            {data.recentAttempts.map((a: any) => (
                                <div key={a.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">{a.subject || "Full Test"}</p>
                                        <p className="text-xs text-slate-400">
                                            {new Date(a.attemptedAt).toLocaleDateString()} &middot; {a.totalQuestions} Q &middot; {Math.round(a.timeTaken / 60)} min
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-lg font-bold ${
                                            a.score >= 70 ? "text-green-600" : a.score >= 40 ? "text-amber-600" : "text-red-600"
                                        }`}>
                                            {a.score}%
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {a.correctAnswers}/{a.totalQuestions} correct
                                            {a.negativeMarks > 0 && ` (-${a.negativeMarks})`}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
