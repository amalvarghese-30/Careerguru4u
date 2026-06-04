"use client";

import { motion } from "framer-motion";
import { Search, FileText, Compass, GraduationCap } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const steps = [
    {
        step: 1,
        title: "Choose Your Board & Class",
        description: "Select from 15+ boards for Class 1-10 to find your textbook solutions.",
        icon: Search,
    },
    {
        step: 2,
        title: "Access Free Solutions",
        description: "First 2 solutions free per chapter. Login for unlimited access — completely FREE!",
        icon: FileText,
    },
    {
        step: 3,
        title: "Explore Careers",
        description: "Use our interactive flowchart to see what your future could look like.",
        icon: Compass,
    },
    {
        step: 4,
        title: "Get Into Dream College",
        description: "Compare colleges, apply online, and get free counselling from experts.",
        icon: GraduationCap,
    },
];

export function HowItWorks() {
    return (
        <section className="section-padding bg-primary-surface">
            <div className="container-custom">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <span className="text-primary font-semibold text-sm uppercase tracking-wider">Simple Process</span>
                    <h2 className="heading-section text-3xl md:text-4xl mt-2 mb-4">
                        How Career Guru Works
                    </h2>
                    <p className="text-slate-500">
                        Your journey from textbook solutions to career success in four simple steps.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {steps.map((step, i) => (
                        <motion.div
                            key={step.step}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="relative"
                        >
                            {i < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-24 left-full w-full h-0.5 bg-gradient-to-r from-primary/20 to-transparent -translate-x-1/2" />
                            )}
                            <GlassCard hover className="text-center h-full">
                                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary-600-light flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                                    {step.step}
                                </div>
                                <step.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                                <h3 className="font-bold text-slate-800 mb-2">{step.title}</h3>
                                <p className="text-sm text-slate-500">{step.description}</p>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}