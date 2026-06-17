"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FlaskConical, ChartBar, Palette, Wrench, ArrowRight, Sparkles,
  Brain, BarChart3, Target, GraduationCap, ChevronRight, IndianRupee,
} from "lucide-react";
import { getCareersByStream } from "@/lib/careers-data";

const streamData = [
  {
    id: "science",
    name: "Science",
    description: "For those who love logic, experiments, and understanding how things work.",
    subjects: ["Physics", "Chemistry", "Mathematics", "Biology", "Computer Science"],
    icon: FlaskConical,
    color: "from-blue-600 to-cyan-500",
    bg: "bg-blue-50",
    textColor: "text-blue-600",
  },
  {
    id: "commerce",
    name: "Commerce",
    description: "For future business leaders, economists, and financial experts.",
    subjects: ["Accountancy", "Business Studies", "Economics", "Mathematics"],
    icon: ChartBar,
    color: "from-indigo-600 to-indigo-400",
    bg: "bg-indigo-50",
    textColor: "text-indigo-600",
  },
  {
    id: "arts-humanities",
    name: "Arts/Humanities",
    description: "For creative minds, thinkers, and those who want to make a difference.",
    subjects: ["History", "Political Science", "Psychology", "Sociology", "Geography"],
    icon: Palette,
    color: "from-purple-600 to-purple-400",
    bg: "bg-purple-50",
    textColor: "text-purple-600",
  },
  {
    id: "vocational",
    name: "Vocational",
    description: "For hands-on learners who want practical, job-ready skills.",
    subjects: ["ITI Trades", "Diploma Engineering", "Skill Development", "Technical Training"],
    icon: Wrench,
    color: "from-amber-500 to-orange-400",
    bg: "bg-amber-50",
    textColor: "text-amber-600",
  },
];

const aiTools = [
  { name: "Stream Selector AI", description: "Find your ideal stream based on interests and strengths", icon: Brain, href: "/ai-tools/stream-selector" },
  { name: "Career Match AI", description: "Discover careers that match your personality", icon: Sparkles, href: "/ai-tools/career-match" },
  { name: "Salary Predictor", description: "Estimate salary based on career, experience, and location", icon: BarChart3, href: "/ai-tools/salary-predictor" },
  { name: "Skill Gap Analyzer", description: "Identify skills you need for your dream career", icon: Target, href: "/ai-tools/skill-analyzer" },
];

export default function CareerGuidancePage() {
  return (
    <div className="min-h-screen bg-brand-bg pt-16">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-navy via-brand-navy to-brand-royal py-16">
        <div className="container-custom max-w-3xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
          >
            Your Career Journey Starts Here
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/90 text-lg mb-8"
          >
            Confused about what to do after 10th? Explore streams, discover careers, and plan your future with AI-powered guidance.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/career-guidance/flowchart" className="btn-primary inline-flex items-center gap-2 px-8 py-4">
              Launch Interactive Flowchart <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/counselling" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-white/20 text-white font-semibold hover:bg-white/10 transition-all">
              Talk to Counsellor
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stream Selection */}
      <section className="container-custom py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="heading-section text-3xl md:text-4xl mb-4">Choose Your Stream After 10th</h2>
          <p className="text-neutral-darkGray">Each stream opens doors to exciting career opportunities. Explore them all.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {streamData.map((stream, i) => {
            const careers = getCareersByStream(stream.name);
            return (
              <motion.div
                key={stream.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/career-guidance/after-10th/${stream.id}`}>
                  <div className="premium-card p-6 h-full group hover:shadow-brand-hover transition-all">
                    <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${stream.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <stream.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="heading-card text-xl mb-2 group-hover:text-brand-royal transition-colors">{stream.name}</h3>
                    <p className="text-neutral-darkGray text-sm mb-4">{stream.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {stream.subjects.slice(0, 3).map((s) => (
                        <span key={s} className="px-2.5 py-1 rounded-lg bg-brand-bg text-xs text-neutral-darkGray font-medium">{s}</span>
                      ))}
                      <span className="px-2.5 py-1 rounded-lg bg-brand-bg text-xs text-brand-royal font-medium">+{stream.subjects.length - 3} more</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-darkGray">{careers.length} career paths</span>
                      <span className="text-brand-royal font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        Explore <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* AI Tools */}
      <section className="bg-white py-16">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="heading-section text-3xl md:text-4xl mb-4">AI-Powered Career Tools</h2>
            <p className="text-neutral-darkGray">Make informed decisions with intelligent guidance</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiTools.map((tool, i) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={tool.href}>
                  <div className="glass-card p-6 text-center h-full hover:shadow-brand-hover transition-all group">
                    <div className="h-12 w-12 rounded-xl bg-brand-bg flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-royal/10 transition-colors">
                      <tool.icon className="h-6 w-6 text-brand-royal" />
                    </div>
                    <h3 className="font-semibold text-neutral-nearBlack mb-2">{tool.name}</h3>
                    <p className="text-sm text-neutral-darkGray">{tool.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Flowchart CTA */}
      <section className="container-custom py-16">
        <div className="premium-card p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="heading-section text-3xl md:text-4xl mb-4">Visual Career Flowchart</h2>
              <p className="text-neutral-darkGray mb-6">
                See the complete picture! Our interactive flowchart shows all career paths from each stream, with salary projections and growth outlook.
              </p>
              <ul className="space-y-3 mb-8">
                {["Explore career branches from each stream", "View salary ranges and growth projections", "Get detailed career profiles", "Save your favorite career paths"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-neutral-darkGray">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/career-guidance/flowchart" className="btn-primary inline-flex items-center gap-2">
                Launch Interactive Flowchart <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="glass-card p-6">
              <div className="text-center mb-6">
                <div className="inline-block px-5 py-2.5 rounded-xl bg-brand-gradient-static text-white font-semibold shadow-lg shadow-brand-royal/20">
                  <GraduationCap className="h-5 w-5 inline mr-2" />10th Pass
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 text-white text-center text-sm font-semibold">Science</div>
                  <div className="pl-3 space-y-2 border-l-2 border-blue-200">
                    <div className="p-2 rounded-lg bg-brand-bg text-sm text-neutral-darkGray">PCM → Engineering</div>
                    <div className="p-2 rounded-lg bg-brand-bg text-sm text-neutral-darkGray">PCB → Medical</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-400 text-white text-center text-sm font-semibold">Commerce</div>
                  <div className="pl-3 space-y-2 border-l-2 border-indigo-200">
                    <div className="p-2 rounded-lg bg-brand-bg text-sm text-neutral-darkGray">CA → Finance</div>
                    <div className="p-2 rounded-lg bg-brand-bg text-sm text-neutral-darkGray">BBA → MBA</div>
                  </div>
                </div>
              </div>
              <p className="text-center mt-5 text-sm text-neutral-darkGray">Click to expand and explore 20+ career paths</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
