"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Target, CheckCircle, AlertCircle, BookOpen, ArrowRight } from "lucide-react";
import { getCareerById, getAllCareerSlugs } from "@/lib/careers-data";

const commonSkills = [
  "Python", "Java", "JavaScript", "C/C++",
  "Data Structures & Algorithms", "System Design",
  "Machine Learning", "SQL", "Excel",
  "Financial Modeling", "Accounting",
  "Public Speaking", "Communication",
  "Leadership", "Project Management",
  "AutoCAD", "MATLAB",
  "Research", "Critical Thinking", "Problem Solving",
  "Digital Marketing", "Social Media",
];

export default function SkillAnalyzerPage() {
  const allSlugs = getAllCareerSlugs();
  const [targetCareer, setTargetCareer] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const careerData = targetCareer ? getCareerById(targetCareer) : null;

  const analyze = () => {
    if (!careerData) return { matched: [], missing: [] };
    const required = careerData.requiredSkills.map((s) => s.name);
    const matched: string[] = [];
    const missing: string[] = [];

    required.forEach((skill) => {
      const isKnown = selectedSkills.some((s) => s.toLowerCase().includes(skill.toLowerCase().split("(")[0].trim()) || skill.toLowerCase().includes(s.toLowerCase()));
      if (isKnown) matched.push(skill);
      else missing.push(skill);
    });

    // Also check if selected skills match any required skill partially
    selectedSkills.forEach((s) => {
      if (!matched.some((m) => m.toLowerCase().includes(s.toLowerCase().split("(")[0].trim()))) {
        // already handled above
      }
    });

    return {
      matched: matched.filter((s, i) => matched.indexOf(s) === i),
      missing: missing.filter((s, i) => missing.indexOf(s) === i),
    };
  };

  const result = showResult ? analyze() : null;
  const matchPercent = result && careerData
    ? Math.round((result.matched.length / Math.max(careerData.requiredSkills.length, 1)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-brand-bg pt-16">
      <div className="bg-white border-b border-neutral-lightGray/50">
        <div className="container-custom py-4">
          <Link href="/ai-tools" className="inline-flex items-center gap-2 text-neutral-mediumGray hover:text-brand-royal text-sm mb-3 transition-colors">
            <ArrowLeft className="h-4 w-4" /> AI Tools
          </Link>
          <h1 className="heading-section text-2xl md:text-3xl">Skill Gap Analyzer</h1>
          <p className="text-neutral-mediumGray text-sm">Compare your skills with target careers and get a learning roadmap</p>
        </div>
      </div>

      <div className="container-custom py-12 max-w-3xl mx-auto">
        <div className="premium-card p-8 mb-8">
          {/* Career Select */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-neutral-darkGray mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-brand-royal" /> Target Career
            </label>
            <select
              value={targetCareer}
              onChange={(e) => { setTargetCareer(e.target.value); setShowResult(false); }}
              className="w-full p-3 rounded-xl border border-neutral-lightGray focus:border-brand-royal focus:outline-none focus:ring-2 focus:ring-brand-royal/10 bg-white"
            >
              <option value="">Select your dream career...</option>
              {allSlugs.map((slug) => {
                const c = getCareerById(slug);
                return c ? <option key={slug} value={slug}>{c.title}</option> : null;
              })}
            </select>
          </div>

          {/* Skills Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-neutral-darkGray mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-brand-royal" /> Your Current Skills
            </label>
            <p className="text-xs text-neutral-mediumGray mb-3">Select all the skills you currently have</p>
            <div className="flex flex-wrap gap-2">
              {commonSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => { toggleSkill(skill); setShowResult(false); }}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedSkills.includes(skill)
                      ? "bg-brand-gradient-static text-white shadow-brand-btn"
                      : "bg-brand-bg text-neutral-darkGray hover:bg-neutral-lightGray border border-neutral-lightGray"
                  }`}
                >
                  {selectedSkills.includes(skill) ? <CheckCircle className="h-3.5 w-3.5 inline mr-1" /> : null}
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowResult(true)}
            disabled={!targetCareer || selectedSkills.length === 0}
            className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Analyze Skill Gap <Target className="h-5 w-5" />
          </button>
        </div>

        {/* Results */}
        {result && careerData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Score Card */}
            <div className="premium-card p-8 text-center">
              <div className="relative h-28 w-28 mx-auto mb-4">
                <svg className="h-28 w-28" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#E2E8F0" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="45" fill="none"
                    stroke={matchPercent >= 70 ? "#10B981" : matchPercent >= 40 ? "#F59E0B" : "#EF4444"}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${matchPercent * 2.83} ${283 - matchPercent * 2.83}`}
                    strokeDashoffset="0"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-neutral-nearBlack">{matchPercent}%</span>
                </div>
              </div>
              <h2 className="heading-section text-xl mb-2">Skill Match: {careerData.title}</h2>
              <p className="text-neutral-mediumGray text-sm">
                You match {matchPercent}% of the required skills for this career.
                {matchPercent >= 70 ? " You're well prepared!" : matchPercent >= 40 ? " You're on the right track." : " There's work to do!"}
              </p>
            </div>

            {/* Matched Skills */}
            <div className="premium-card p-6">
              <h3 className="font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" /> Skills You Have ({result.matched.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.matched.map((s) => (
                  <span key={s} className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="premium-card p-6">
              <h3 className="font-semibold text-amber-700 mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Skills to Develop ({result.missing.length})
              </h3>
              <div className="space-y-3">
                {result.missing.map((skill) => (
                  <div key={skill} className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-neutral-darkGray text-sm">{skill}</p>
                      <p className="text-xs text-neutral-mediumGray mt-0.5">
                        {skill.includes("Programming") || skill.includes("Python") || skill.includes("SQL") ? "Start with online platforms like Coursera, YouTube. Build small projects to practice." :
                         skill.includes("Communication") || skill.includes("Leadership") ? "Join Toastmasters, participate in group projects, give presentations." :
                         skill.includes("System Design") ? "Study design patterns, read engineering blogs, practice designing systems on paper." :
                         "Take online courses, read books, and practice through projects and internships."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Plan CTA */}
            <div className="text-center">
              <Link href={`/careers/${targetCareer}`} className="btn-primary inline-flex items-center gap-2">
                View Full Career Profile & Learning Path <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
