"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, Brain, BarChart3, Target, ArrowRight, Zap, Star, Clock, FileText } from "lucide-react";

const tools = [
  {
    id: "stream-selector",
    name: "Stream Selector AI",
    description: "Answer a few questions and our AI will recommend the best stream for your interests, strengths, and career goals.",
    icon: Brain,
    color: "from-blue-600 to-cyan-500",
    questions: "10 questions",
    time: "2 minutes",
    href: "/ai-tools/stream-selector",
  },
  {
    id: "career-match",
    name: "Career Match AI",
    description: "Discover careers that match your personality, interests, and aspirations. Get personalized career recommendations.",
    icon: Sparkles,
    color: "from-purple-600 to-pink-500",
    questions: "15 questions",
    time: "3 minutes",
    href: "/ai-tools/career-match",
  },
  {
    id: "salary-predictor",
    name: "Salary Predictor",
    description: "Estimate your future salary based on career path, experience level, location, and education.",
    icon: BarChart3,
    color: "from-emerald-600 to-teal-500",
    questions: "5 inputs",
    time: "1 minute",
    href: "/ai-tools/salary-predictor",
  },
  {
    id: "skill-analyzer",
    name: "Skill Gap Analyzer",
    description: "Compare your current skills with your target career's requirements. Get a personalized learning roadmap.",
    icon: Target,
    color: "from-amber-500 to-orange-500",
    questions: "8 questions",
    time: "2 minutes",
    href: "/ai-tools/skill-analyzer",
  },
  {
    id: "resume-builder",
    name: "AI Resume Builder",
    description: "Build a professional ATS-friendly resume step by step. Choose templates, preview live, and download as PDF.",
    icon: FileText,
    color: "from-rose-600 to-orange-500",
    questions: "7 steps",
    time: "5 minutes",
    href: "/ai-tools/resume-builder",
  },
];

export default function AIToolsPage() {
  return (
    <div className="min-h-screen bg-brand-bg pt-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-navy via-brand-navy to-brand-royal text-white py-16">
        <div className="container-custom max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
              <Zap className="h-8 w-8 text-brand-sky" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">AI-Powered Career Tools</h1>
            <p className="text-white/70 text-lg">
              Make smarter career decisions with our intelligent tools. Powered by data and designed for Indian students.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={tool.href}>
                <div className="premium-card p-8 h-full group hover:shadow-brand-hover transition-all">
                  <div className="flex items-start gap-5">
                    <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <tool.icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="heading-card text-xl mb-2 group-hover:text-brand-royal transition-colors">{tool.name}</h2>
                      <p className="text-neutral-mediumGray text-sm mb-4">{tool.description}</p>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-xs text-neutral-mediumGray">
                          <Clock className="h-3.5 w-3.5" /> {tool.time}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-neutral-mediumGray">
                          <Star className="h-3.5 w-3.5" /> {tool.questions}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-neutral-lightGray group-hover:text-brand-royal group-hover:translate-x-1 transition-all flex-shrink-0 mt-2" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
