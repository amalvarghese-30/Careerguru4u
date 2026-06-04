// components/sections/TrustBar.tsx - Using simple icons
"use client";

import { motion } from "framer-motion";

const trustItems = [
    { icon: "📖", label: "Solutions", value: "30,000+" },
    { icon: "🏫", label: "Boards", value: "3" },
    { icon: "🎓", label: "Colleges", value: "500+" },
    { icon: "👥", label: "Students", value: "2,00,000+" },
    { icon: "⭐", label: "Success Rate", value: "94%" },
    { icon: "🤝", label: "Partner Institutes", value: "500+" },
];

export function TrustBar() {
    return (
        <section className="py-8 bg-white border-b border-slate-100">
            <div className="container-custom">
                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                    {trustItems.map((item, i) => (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center gap-3"
                        >
                            <div className="h-10 w-10 rounded-xl bg-primary-surface flex items-center justify-center text-2xl">
                                {item.icon}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-800">{item.value}</div>
                                <div className="text-xs text-slate-500">{item.label}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}