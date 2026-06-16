"use client";

import { motion } from "framer-motion";
import { FileText, Briefcase, Palette, Zap } from "lucide-react";

const TEMPLATES = [
    { id: "minimal", name: "Minimal", icon: FileText, description: "Clean and simple layout, perfect for fresh graduates", gradient: "from-slate-600 to-slate-400" },
    { id: "professional", name: "Professional", icon: Briefcase, description: "Traditional format preferred by most recruiters", gradient: "from-brand-royal to-brand-electric" },
    { id: "modern", name: "Modern", icon: Palette, description: "Contemporary design with color accents", gradient: "from-purple-600 to-pink-500" },
    { id: "ats-friendly", name: "ATS-Friendly", icon: Zap, description: "Optimized for applicant tracking systems", gradient: "from-emerald-600 to-teal-400" },
];

interface Props {
    selected: string;
    onSelect: (id: string) => void;
}

export default function TemplateSelector({ selected, onSelect }: Props) {
    return (
        <div>
            <h2 className="heading-section text-xl mb-2">Choose a Template</h2>
            <p className="text-neutral-mediumGray text-sm mb-6">Select a design for your resume</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TEMPLATES.map((tpl, i) => {
                    const Icon = tpl.icon;
                    const isSelected = selected === tpl.id;
                    return (
                        <motion.button
                            key={tpl.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => onSelect(tpl.id)}
                            className={`p-5 rounded-2xl border-2 text-left transition-all ${
                                isSelected
                                    ? "border-brand-royal bg-brand-royal/5 shadow-lg shadow-brand-royal/10"
                                    : "border-slate-200 hover:border-slate-300 bg-white"
                            }`}
                        >
                            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${tpl.gradient} flex items-center justify-center mb-3`}>
                                <Icon className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="font-semibold text-slate-800 text-sm mb-1">{tpl.name}</h3>
                            <p className="text-xs text-slate-500">{tpl.description}</p>
                            {isSelected && (
                                <div className="mt-3 inline-flex items-center gap-1 text-xs text-brand-royal font-medium">
                                    <span className="h-2 w-2 rounded-full bg-brand-royal" /> Selected
                                </div>
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
