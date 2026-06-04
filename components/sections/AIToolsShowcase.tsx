"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Brain, TrendingUp, Target, Map, GraduationCap, Calculator, ArrowRight, Sparkles } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

const tools = [
  {
    icon: Brain,
    title: "AI Career Match",
    description: "Discover careers that match your personality, interests, and strengths using AI-powered analysis.",
    badge: "Most Popular",
    gradient: "from-brand-navy to-brand-royal",
    href: "/ai-tools/career-match",
  },
  {
    icon: TrendingUp,
    title: "Salary Predictor",
    description: "Estimate your future salary based on career, location, experience, and industry trends.",
    badge: "New",
    gradient: "from-brand-royal to-brand-electric",
    href: "/ai-tools/salary-predictor",
  },
  {
    icon: Target,
    title: "Skill Analyzer",
    description: "Identify skills you need for your dream career and get a personalized learning roadmap.",
    gradient: "from-brand-electric to-brand-sky",
    href: "/ai-tools/skill-analyzer",
  },
  {
    icon: Map,
    title: "Roadmap Generator",
    description: "Generate a step-by-step career roadmap from where you are to where you want to be.",
    gradient: "from-purple-500 to-pink-500",
    href: "/ai-tools/roadmap-generator",
  },
  {
    icon: GraduationCap,
    title: "University Fit Predictor",
    description: "Find universities that match your profile, budget, and career goals with smart matching.",
    gradient: "from-amber-500 to-orange-500",
    href: "/ai-tools/university-fit",
  },
  {
    icon: Calculator,
    title: "ROI Calculator",
    description: "Calculate the return on investment for different degrees and career paths.",
    gradient: "from-emerald-500 to-teal-500",
    href: "/ai-tools/roi-calculator",
  },
];

export function AIToolsShowcase() {
  return (
    <section className="section-padding bg-brand-bg">
      <div className="container-custom">
        <SectionHeader
          badge="AI-Powered Tools"
          title="Smart Tools for Smarter Decisions"
          description="Make informed career choices with our suite of AI-powered guidance tools."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.08 }}
            >
              <Link href={tool.href} className="block h-full">
                <div className="premium-card p-6 h-full group relative overflow-hidden">
                  {tool.badge && (
                    <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-brand-electric text-white text-[10px] font-semibold uppercase tracking-wider">
                      {tool.badge}
                    </span>
                  )}
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <tool.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="heading-card text-lg mb-2">{tool.title}</h3>
                  <p className="text-sm text-neutral-mediumGray leading-relaxed mb-4">{tool.description}</p>
                  <span className="inline-flex items-center gap-1 text-brand-royal font-medium text-sm group-hover:gap-2 transition-all">
                    Try Now <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12 p-8 rounded-3xl bg-brand-gradient-static text-white"
        >
          <Sparkles className="h-10 w-10 mx-auto mb-4 text-brand-sky" />
          <h3 className="text-2xl md:text-3xl font-bold font-sora mb-3">AI Career Match — Find Your Perfect Career</h3>
          <p className="text-white/70 mb-6 max-w-xl mx-auto">
            Answer a few questions about your interests and strengths, and our AI will match you with the best career paths.
          </p>
          <Link
            href="/ai-tools/career-match"
            className="inline-flex items-center gap-2 bg-white text-brand-navy px-8 py-4 rounded-xl font-semibold text-lg hover:bg-brand-bg transition-all shadow-xl"
          >
            Start AI Assessment <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
