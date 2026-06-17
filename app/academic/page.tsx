// app/academic/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, BookOpen, TrendingUp, ChevronRight, GraduationCap, Filter, Download, Lightbulb, FileQuestion, FileText, ClipboardList } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const boards = [
    { name: "CBSE", slug: "cbse", students: "2.5L+", color: "from-blue-600 to-blue-400", description: "Central Board of Secondary Education" },
    { name: "ICSE", slug: "icse", students: "1.2L+", color: "from-indigo-600 to-indigo-400", description: "Indian Certificate of Secondary Education" },
    { name: "Maharashtra Board", slug: "maharashtra-board", students: "1.8L+", color: "from-emerald-600 to-emerald-400", description: "Maharashtra State Board" },
];

const trendingSolutions = [
    { title: "CBSE Class 10 Science — Chapter-wise Solutions", views: "15.2K", href: "/academic/cbse/10/science" },
    { title: "Maharashtra Board Class 10 Mathematics — All Chapters", views: "12.8K", href: "/academic/maharashtra-board/10/mathematics" },
    { title: "ICSE Class 10 Physics — Textbook Solutions", views: "10.5K", href: "/academic/icse/10/physics" },
    { title: "CBSE Class 10 Mathematics — Complete Solutions", views: "9.8K", href: "/academic/cbse/10/mathematics" },
];

export default function AcademicHubPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [stats, setStats] = useState({ solutions: 0, textbooks: 0, conceptNotes: 0, mcqs: 0 });

    useEffect(() => {
        fetch("/api/academic/stats")
            .then(r => r.json())
            .then(data => setStats({
                solutions: data.solutions || 0,
                textbooks: data.textbooks || 0,
                conceptNotes: data.conceptNotes || 0,
                mcqs: data.mcqs || 0,
            }))
            .catch(() => {});
    }, []);

    return (
        <div className="pt-20">
            {/* Hero Section */}
            <section className="bg-ocean-gradient py-16">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
                        >
                            Free Textbook Solutions
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-white/90 text-lg mb-8"
                        >
                            Step-by-step solutions for CBSE, ICSE, and Maharashtra State Board. Classes 1-10.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="relative max-w-xl mx-auto"
                        >
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search for any question, chapter, or subject..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white shadow-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Board Selector */}
            <section className="section-padding">
                <div className="container-custom">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="heading-section text-3xl md:text-4xl mb-4">Choose Your Board</h2>
                        <p className="text-slate-500">Select your board to access free textbook solutions for all classes</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {boards.map((board, i) => (
                            <motion.div
                                key={board.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Link href={`/academic/${board.slug}`}>
                                    <GlassCard hover className="text-center">
                                        <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${board.color} flex items-center justify-center mx-auto mb-3`}>
                                            <BookOpen className="h-7 w-7 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-slate-800 text-lg">{board.name}</h3>
                                        <p className="text-xs text-slate-400 mt-1">{board.description}</p>
                                        <p className="text-xs text-primary-600 mt-2 font-medium">{board.students} students</p>
                                    </GlassCard>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trending Solutions */}
            <section className="section-padding bg-primary-surface">
                <div className="container-custom">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="heading-section text-2xl md:text-3xl">Trending Solutions</h2>
                            <p className="text-slate-500 mt-1">Most viewed solutions this week</p>
                        </div>
                        <Link href="/academic/trending" className="text-primary-600 font-medium hover:underline flex items-center gap-1">
                            View All <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {trendingSolutions.map((solution, i) => (
                            <motion.div
                                key={solution.title}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Link href={solution.href}>
                                    <GlassCard hover padding="md" className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center">
                                                <TrendingUp className="h-5 w-5 text-primary-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-slate-800">{solution.title}</h3>
                                                <p className="text-xs text-slate-400">{solution.views} views</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-slate-400" />
                                    </GlassCard>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quick Stats */}
            <section className="py-12 bg-white">
                <div className="container-custom">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { value: stats.solutions > 0 ? `${(stats.solutions / 1000).toFixed(1)}K+` : "—", label: "Solutions", icon: FileText, color: "text-brand-royal" },
                            { value: stats.textbooks > 0 ? `${stats.textbooks}+` : "—", label: "Textbook PDFs", icon: Download, color: "text-red-500" },
                            { value: stats.conceptNotes > 0 ? `${stats.conceptNotes}+` : "—", label: "Notes & Videos", icon: Lightbulb, color: "text-amber-500" },
                            { value: stats.mcqs > 0 ? `${(stats.mcqs / 1000).toFixed(1)}K+` : "—", label: "MCQ Questions", icon: FileQuestion, color: "text-green-600" },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center"
                            >
                                <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                                <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                                <div className="text-sm text-slate-500">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}