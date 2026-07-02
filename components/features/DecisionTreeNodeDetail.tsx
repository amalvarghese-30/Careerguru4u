"use client";

import { motion } from "framer-motion";
import {
  IndianRupee, TrendingUp, GraduationCap, BookOpen, Building, CheckCircle, Timer,
  Briefcase, Users, FlaskConical, Lightbulb, Sparkles, ArrowRight, Shield, Zap,
  X, Globe, Heart, Award, Wrench,
} from "lucide-react";
import type { DecisionTreeNode } from "@/lib/decision-tree.types";
import Link from "next/link";

interface DecisionTreeNodeDetailProps {
  node: DecisionTreeNode;
  onClose: () => void;
}

function SalaryCard({ ranges }: { ranges: { entry: string; mid: string; senior: string } }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {[
        { label: "Entry", value: ranges.entry, color: "bg-green-50 text-green-700 border-green-200" },
        { label: "Mid", value: ranges.mid, color: "bg-blue-50 text-blue-700 border-blue-200" },
        { label: "Senior", value: ranges.senior, color: "bg-purple-50 text-purple-700 border-purple-200" },
      ].map(({ label, value, color }) => (
        <div key={label} className={`p-2.5 rounded-xl border ${color} text-center`}>
          <p className="text-[10px] uppercase font-semibold opacity-70">{label}</p>
          <p className="text-xs font-bold mt-0.5">{value}</p>
        </div>
      ))}
    </div>
  );
}

export function DecisionTreeNodeDetail({ node, onClose }: DecisionTreeNodeDetailProps) {
  const isLeaf = node.children.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="glass-card p-5 sticky top-40 max-h-[calc(100vh-12rem)] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            {node.category && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-royal bg-brand-royal/10 px-2 py-0.5 rounded-full">
                {node.category}
              </span>
            )}
            <h3 className="heading-card text-xl mt-1.5">{node.name}</h3>
            {node.timeToComplete && (
              <p className="text-xs text-neutral-darkGray flex items-center gap-1 mt-1">
                <Timer className="h-3 w-3" /> {node.timeToComplete}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-lightGray transition-colors shrink-0">
            <X className="h-5 w-5 text-neutral-darkGray" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-neutral-darkGray mb-4 leading-relaxed">{node.shortDescription}</p>

        {/* Salary */}
        {node.salaryRanges.entry && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-neutral-nearBlack mb-2 flex items-center gap-1.5">
              <IndianRupee className="h-3.5 w-3.5 text-green-600" />
              Salary Ranges
            </h4>
            <SalaryCard ranges={node.salaryRanges} />
          </div>
        )}

        {/* Growth Outlook */}
        {node.growthOutlook && (
          <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <p className="text-xs text-blue-600 font-medium">Growth Outlook</p>
              <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${
                node.growthOutlook === "Very High" ? "bg-emerald-200 text-emerald-800" :
                node.growthOutlook === "High" ? "bg-green-200 text-green-800" :
                node.growthOutlook === "Moderate" ? "bg-yellow-200 text-yellow-800" :
                "bg-blue-200 text-blue-800"
              }`}>
                {node.growthOutlook}
              </span>
            </div>
          </div>
        )}

        {/* Education Path */}
        {node.educationPath.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-neutral-nearBlack mb-2 flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-brand-royal" />
              Education Path
            </h4>
            <div className="space-y-1.5">
              {node.educationPath.map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="h-5 w-5 rounded-full bg-brand-royal/10 text-brand-royal text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-xs text-neutral-darkGray">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Entrance Exams */}
        {node.entranceExams.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-neutral-nearBlack mb-2 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-brand-royal" />
              Entrance Exams
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {node.entranceExams.map((exam) => (
                <span key={exam} className="px-2.5 py-1 rounded-lg bg-brand-bg text-xs text-brand-royal font-medium border border-brand-royal/10">
                  {exam}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {node.skillsRequired.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-neutral-nearBlack mb-2 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Skills Required
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {node.skillsRequired.map((skill) => (
                <span key={skill} className="px-2.5 py-1 rounded-lg bg-amber-50 text-xs text-amber-700 font-medium border border-amber-200">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Top Colleges */}
        {node.topColleges.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-neutral-nearBlack mb-2 flex items-center gap-1.5">
              <Building className="h-3.5 w-3.5 text-brand-royal" />
              Top Colleges
            </h4>
            <div className="space-y-1.5">
              {node.topColleges.slice(0, 3).map((college) => (
                <div key={college.name} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-brand-bg">
                  <span className="font-medium text-neutral-nearBlack">{college.name}</span>
                  <span className="text-neutral-darkGray">{college.fees}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {node.certifications.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-neutral-nearBlack mb-2 flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-purple-500" />
              Certifications
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {node.certifications.map((cert) => (
                <span key={cert} className="px-2.5 py-1 rounded-lg bg-purple-50 text-xs text-purple-700 font-medium border border-purple-200">
                  {cert}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Government vs Private */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          {node.governmentJobs.length > 0 && (
            <div className="p-3 rounded-xl bg-brand-bg border border-neutral-lightGray">
              <h4 className="text-xs font-semibold text-neutral-nearBlack mb-1.5 flex items-center gap-1">
                <Shield className="h-3 w-3 text-brand-navy" />
                Government
              </h4>
              <ul className="space-y-0.5">
                {node.governmentJobs.slice(0, 3).map((job) => (
                  <li key={job} className="text-[11px] text-neutral-darkGray">{job}</li>
                ))}
              </ul>
            </div>
          )}
          {node.privateJobs.length > 0 && (
            <div className="p-3 rounded-xl bg-brand-bg border border-neutral-lightGray">
              <h4 className="text-xs font-semibold text-neutral-nearBlack mb-1.5 flex items-center gap-1">
                <Briefcase className="h-3 w-3 text-brand-royal" />
                Private
              </h4>
              <ul className="space-y-0.5">
                {node.privateJobs.slice(0, 3).map((job) => (
                  <li key={job} className="text-[11px] text-neutral-darkGray">{job}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Work Environment */}
        {node.workEnvironment && (
          <div className="mb-4 p-3 rounded-xl bg-brand-bg border border-neutral-lightGray">
            <h4 className="text-xs font-semibold text-neutral-nearBlack mb-1 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-brand-royal" />
              Work Environment
            </h4>
            <p className="text-xs text-neutral-darkGray">{node.workEnvironment}</p>
          </div>
        )}

        {/* Pros & Cons */}
        {(node.pros.length > 0 || node.cons.length > 0) && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-neutral-nearBlack mb-2">Pros & Cons</h4>
            <div className="grid grid-cols-1 gap-2">
              {node.pros.slice(0, 2).map((p) => (
                <div key={p} className="flex items-start gap-1.5 text-xs text-emerald-700">
                  <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                  {p}
                </div>
              ))}
              {node.cons.slice(0, 2).map((c) => (
                <div key={c} className="flex items-start gap-1.5 text-xs text-red-600">
                  <span className="text-red-400 shrink-0">—</span>
                  {c}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Link to full career page if leaf */}
        {isLeaf && (
          <Link
            href={`/careers/${node.id}`}
            className="btn-primary w-full inline-flex items-center justify-center gap-2 mt-2"
          >
            View Full Career Profile <ArrowRight className="h-4 w-4" />
          </Link>
        )}

        {!isLeaf && (
          <p className="text-xs text-neutral-darkGray text-center mt-2 flex items-center justify-center gap-1">
            <Lightbulb className="h-3 w-3 text-amber-500" />
            Click child nodes to explore career paths
          </p>
        )}
      </div>
    </motion.div>
  );
}
