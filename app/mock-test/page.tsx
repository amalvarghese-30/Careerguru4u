"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Beaker, ChevronRight, GraduationCap, Clock, Target, Award } from "lucide-react";

const BOARDS = [
    { name: "CBSE", slug: "CBSE", desc: "Central Board of Secondary Education", classes: "Class 1-10" },
    { name: "ICSE", slug: "ICSE", desc: "Indian Certificate of Secondary Education", classes: "Class 1-10" },
    { name: "Maharashtra Board", slug: "Maharashtra Board", desc: "Maharashtra State Board", classes: "Class 1-10" },
];

export default function MockTestPage() {
    return (
        <div className="pt-20">
            {/* Hero */}
            <section className="bg-ocean-gradient py-16">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                                Mock Test Zone
                            </h1>
                            <p className="text-white/80 text-lg mb-6">
                                Practice with auto-generated MCQ tests from your syllabus. Instant results, detailed explanations.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 text-white/70 text-sm">
                                <div className="flex items-center gap-2">
                                    <Target className="h-4 w-4" /> Questions from your textbook solutions
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" /> Track your time and improve
                                </div>
                                <div className="flex items-center gap-2">
                                    <Award className="h-4 w-4" /> Instant scoring & explanations
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Board Selection */}
            <section className="section-padding">
                <div className="container-custom">
                    <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">Select Your Board</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {BOARDS.map((board, i) => (
                            <motion.div
                                key={board.slug}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Link
                                    href={`/mock-test/${board.slug}`}
                                    className="block p-6 bg-white rounded-2xl border border-slate-200 hover:border-brand-royal hover:shadow-lg transition-all group"
                                >
                                    <div className="h-12 w-12 rounded-xl bg-brand-gradient-static flex items-center justify-center mb-4">
                                        <GraduationCap className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-800 mb-2">{board.name}</h3>
                                    <p className="text-sm text-slate-500 mb-3">{board.desc}</p>
                                    <span className="text-xs px-3 py-1 rounded-full bg-brand-bg text-brand-royal font-medium">
                                        {board.classes}
                                    </span>
                                    <div className="flex items-center gap-1 text-brand-royal text-sm font-medium mt-4 group-hover:gap-2 transition-all">
                                        Start Tests <ChevronRight className="h-4 w-4" />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="section-padding bg-slate-50">
                <div className="container-custom">
                    <h2 className="text-2xl font-bold text-slate-800 mb-10 text-center">How It Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
                        {[
                            { icon: BookOpen, title: "1. Choose Your Test", desc: "Select your board, class, subject, and chapter to get started" },
                            { icon: Clock, title: "2. Take the Quiz", desc: "Answer MCQ questions auto-generated from your textbook solutions" },
                            { icon: Award, title: "3. Get Results", desc: "See your score instantly with detailed explanations for each question" },
                        ].map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div className="h-14 w-14 rounded-2xl bg-brand-gradient-static flex items-center justify-center mx-auto mb-4">
                                    <step.icon className="h-7 w-7 text-white" />
                                </div>
                                <h3 className="font-semibold text-slate-800 mb-2">{step.title}</h3>
                                <p className="text-sm text-slate-500">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
