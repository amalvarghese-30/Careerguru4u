"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, FileText, Award, Download, Zap } from "lucide-react";
import ResumeWizard from "@/components/features/resume-builder/ResumeWizard";

export default function ResumeBuilderPage() {
    return (
        <div className="min-h-screen bg-brand-bg pt-16">
            {/* Header */}
            <div className="bg-white border-b border-neutral-lightGray/50">
                <div className="container-custom py-4">
                    <Link
                        href="/ai-tools"
                        className="inline-flex items-center gap-2 text-neutral-mediumGray hover:text-brand-royal text-sm mb-3 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" /> AI Tools
                    </Link>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="heading-section text-2xl md:text-3xl">AI Resume Builder</h1>
                        <p className="text-neutral-mediumGray text-sm mt-1">
                            Build a professional, ATS-optimized resume with real-time scoring, multiple templates, and instant PDF download.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Features Banner */}
            <div className="container-custom py-4">
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                        { icon: Award, label: "ATS Score", desc: "Real-time feedback" },
                        { icon: FileText, label: "4 Templates", desc: "Professional designs" },
                        { icon: Download, label: "PDF Export", desc: "Instant download" },
                    ].map((feat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200"
                        >
                            <div className="h-10 w-10 rounded-lg bg-brand-bg flex items-center justify-center">
                                <feat.icon className="h-5 w-5 text-brand-royal" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-800">{feat.label}</p>
                                <p className="text-xs text-slate-500">{feat.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Wizard */}
            <div className="container-custom py-6">
                <ResumeWizard />
            </div>
        </div>
    );
}
