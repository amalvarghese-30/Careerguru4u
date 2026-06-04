// components/features/CareerFlowchart.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, TrendingUp, GraduationCap, Briefcase, IndianRupee } from "lucide-react";

interface CareerNode {
    id: string;
    name: string;
    salary?: string;
    growth?: string;
    children?: CareerNode[];
}

const careerData: CareerNode = {
    id: "10th",
    name: "10th Pass",
    children: [
        {
            id: "science",
            name: "Science Stream",
            children: [
                {
                    id: "pcm",
                    name: "PCM (Physics, Chemistry, Math)",
                    children: [
                        { id: "engg", name: "Engineering", salary: "₹5L - ₹50L+", growth: "High" },
                        { id: "arch", name: "Architecture", salary: "₹4L - ₹30L+", growth: "Moderate" },
                        { id: "data", name: "Data Science", salary: "₹6L - ₹60L+", growth: "Very High" },
                    ]
                },
                {
                    id: "pcb",
                    name: "PCB (Physics, Chemistry, Biology)",
                    children: [
                        { id: "medical", name: "Medical (MBBS)", salary: "₹6L - ₹1Cr+", growth: "Very High" },
                        { id: "pharma", name: "Pharmacy", salary: "₹3L - ₹15L+", growth: "Moderate" },
                        { id: "biotech", name: "Biotechnology", salary: "₹4L - ₹25L+", growth: "High" },
                    ]
                }
            ]
        },
        {
            id: "commerce",
            name: "Commerce Stream",
            children: [
                {
                    id: "commerce-main",
                    name: "Commerce with Math",
                    children: [
                        { id: "ca", name: "Chartered Accountant", salary: "₹6L - ₹50L+", growth: "High" },
                        { id: "cfa", name: "CFA", salary: "₹8L - ₹40L+", growth: "High" },
                        { id: "economics", name: "Economics", salary: "₹5L - ₹35L+", growth: "High" },
                    ]
                },
                {
                    id: "commerce-without",
                    name: "Commerce without Math",
                    children: [
                        { id: "bcom", name: "B.Com → MBA", salary: "₹5L - ₹40L+", growth: "High" },
                        { id: "law", name: "Law (LLB)", salary: "₹4L - ₹30L+", growth: "High" },
                        { id: "hotel", name: "Hotel Management", salary: "₹3L - ₹20L+", growth: "Moderate" },
                    ]
                }
            ]
        },
        {
            id: "arts",
            name: "Arts/Humanities",
            children: [
                {
                    id: "arts-main",
                    name: "Humanities",
                    children: [
                        { id: "upsc", name: "Civil Services", salary: "₹6L - ₹25L+", growth: "Stable" },
                        { id: "psych", name: "Psychology", salary: "₹4L - ₹20L+", growth: "High" },
                        { id: "design", name: "Design", salary: "₹4L - ₹30L+", growth: "High" },
                    ]
                }
            ]
        },
        {
            id: "vocational",
            name: "Vocational",
            children: [
                {
                    id: "voc-main",
                    name: "Skill-Based Courses",
                    children: [
                        { id: "iti", name: "ITI", salary: "₹2L - ₹10L+", growth: "Stable" },
                        { id: "poly", name: "Polytechnic", salary: "₹3L - ₹15L+", growth: "Moderate" },
                        { id: "nursing", name: "Nursing", salary: "₹3L - ₹12L+", growth: "High" },
                    ]
                }
            ]
        }
    ]
};

function CareerNodeComponent({ node, level = 0 }: { node: CareerNode; level?: number }) {
    const [expanded, setExpanded] = useState(level < 1);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="relative">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all ${hasChildren ? "hover:bg-primary-50" : "hover:bg-slate-50"
                    }`}
                onClick={() => hasChildren && setExpanded(!expanded)}
            >
                {hasChildren && (
                    <motion.div
                        animate={{ rotate: expanded ? 90 : 0 }}
                        className="text-slate-400"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </motion.div>
                )}
                <div className={`flex-1 ${level === 0 ? "font-bold text-primary-800" : "font-medium"}`}>
                    {node.name}
                </div>
                {node.salary && (
                    <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-green-600">
                            <IndianRupee className="h-3 w-3" /> {node.salary}
                        </span>
                        {node.growth && (
                            <span className={`px-2 py-0.5 rounded-full ${node.growth === "Very High" ? "bg-emerald-100 text-emerald-700" :
                                node.growth === "High" ? "bg-green-100 text-green-700" :
                                    node.growth === "Stable" ? "bg-blue-100 text-blue-700" :
                                        "bg-orange-100 text-orange-700"
                                }`}>
                                {node.growth}
                            </span>
                        )}
                    </div>
                )}
            </motion.div>

            <AnimatePresence>
                {expanded && hasChildren && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-6 pl-4 border-l-2 border-primary-200"
                    >
                        {node.children!.map((child) => (
                            <CareerNodeComponent key={child.id} node={child} level={level + 1} />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function CareerFlowchart() {
    const [selectedCareer, setSelectedCareer] = useState<CareerNode | null>(null);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-slate-100 p-4">
                    <CareerNodeComponent node={careerData} />
                </div>
            </div>

            <div>
                {selectedCareer ? (
                    <div className="bg-primary-50 rounded-2xl p-6">
                        <h3 className="font-bold text-slate-800 text-lg mb-4">{selectedCareer.name}</h3>
                        {selectedCareer.salary && (
                            <div className="mb-3">
                                <span className="text-sm text-slate-500">Salary Range</span>
                                <p className="font-semibold text-primary-600">{selectedCareer.salary}</p>
                            </div>
                        )}
                        {selectedCareer.growth && (
                            <div className="mb-3">
                                <span className="text-sm text-slate-500">Growth Outlook</span>
                                <p className="font-semibold">{selectedCareer.growth}</p>
                            </div>
                        )}
                        <button className="mt-4 w-full bg-primary-600 text-white py-2 rounded-xl font-semibold hover:bg-primary-700">
                            Explore Detailed Career Guide
                        </button>
                    </div>
                ) : (
                    <div className="bg-slate-50 rounded-2xl p-6 text-center">
                        <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">Click on any career to see details</p>
                    </div>
                )}
            </div>
        </div>
    );
}