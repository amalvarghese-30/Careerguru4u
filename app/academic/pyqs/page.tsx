"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, BookOpen, Download, ExternalLink, Filter, GraduationCap,
  Search, Building2, BadgeCheck, Sparkles,
} from "lucide-react";

/* ---------- Boards ---------- */
const BOARDS = [
  { name: "CBSE", slug: "cbse", color: "from-blue-600 to-blue-400", official: "https://www.cbse.gov.in" },
  { name: "ICSE", slug: "icse", color: "from-indigo-600 to-indigo-400", official: "https://www.cisce.org" },
  { name: "Maharashtra Board", slug: "maharashtra-board", color: "from-emerald-600 to-emerald-400", official: "https://www.mahahsscboard.in" },
];

const CLASSES = Array.from({ length: 12 }, (_, i) => i + 1);

const SUBJECTS = [
  "Mathematics", "Science", "Physics", "Chemistry", "Biology",
  "English", "Social Science", "Hindi", "Sanskrit", "Accountancy",
  "Business Studies", "Economics", "History", "Geography", "Political Science", "Computer Science",
];

/* ---------- External resource recommendations ---------- */
interface Resource {
  name: string;
  url: string;
  description: string;
  icon: React.ElementType;
  officialFor?: string; // board slug this resource is the official source for
}

const RESOURCES: Resource[] = [
  {
    name: "CBSE Official",
    url: "https://www.cbse.gov.in",
    description: "Official question papers, sample papers & marking schemes archive.",
    icon: Building2,
    officialFor: "cbse",
  },
  {
    name: "CISCE Official",
    url: "https://www.cisce.org",
    description: "Official ICSE & ISC previous year papers and specimen papers.",
    icon: Building2,
    officialFor: "icse",
  },
  {
    name: "Maharashtra Board",
    url: "https://www.mahahsscboard.in",
    description: "Official MSBSHSE question papers and model answer keys.",
    icon: Building2,
    officialFor: "maharashtra-board",
  },
  {
    name: "SelfStudys",
    url: "https://www.selfstudys.com",
    description: "Detailed repository of CBSE & State Board papers with solutions.",
    icon: BookOpen,
  },
  {
    name: "Shaalaa",
    url: "https://www.shaalaa.com",
    description: "Excellent source for Maharashtra Board and ICSE solved papers.",
    icon: GraduationCap,
  },
  {
    name: "Vedantu",
    url: "https://www.vedantu.com",
    description: "Free PYQ PDFs with solved answer keys and analysis.",
    icon: Sparkles,
  },
  {
    name: "BYJU'S",
    url: "https://www.byjus.com",
    description: "Previous year papers and sample papers with step-by-step solutions.",
    icon: BookOpen,
  },
];

export default function PYQsLandingPage() {
  const [board, setBoard] = useState("");
  const [classNum, setClassNum] = useState("");
  const [subject, setSubject] = useState("");

  const selectedBoard = BOARDS.find(b => b.slug === board);

  // Official board resource surfaces first; everything else follows.
  const orderedResources = [...RESOURCES].sort((a, b) => {
    const aOfficial = a.officialFor === board ? 0 : 1;
    const bOfficial = b.officialFor === board ? 0 : 1;
    return aOfficial - bOfficial;
  });

  const hasFilter = board || classNum || subject;

  const clearFilters = () => {
    setBoard("");
    setClassNum("");
    setSubject("");
  };

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="bg-ocean-gradient py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <Link href="/academic" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Academic Solutions
            </Link>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
            >
              PYQs & Sample Papers
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white/85 text-lg"
            >
              Previous year question papers and sample papers for every board, class, and subject — sourced from official and trusted free repositories.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="section-padding pb-8">
        <div className="container-custom max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              <Filter className="h-4 w-4" /> Filter by Board, Class & Subject
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Board</label>
                <select
                  value={board}
                  onChange={e => setBoard(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-brand-royal"
                >
                  <option value="">All Boards</option>
                  {BOARDS.map(b => <option key={b.slug} value={b.slug}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Class</label>
                <select
                  value={classNum}
                  onChange={e => setClassNum(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-brand-royal"
                >
                  <option value="">All Classes</option>
                  {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Subject</label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-brand-royal"
                >
                  <option value="">All Subjects</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            {hasFilter && (
              <button
                onClick={clearFilters}
                className="mt-4 text-xs font-medium text-brand-royal hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Resource Recommendations */}
      <section className="section-padding pt-4">
        <div className="container-custom max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {selectedBoard ? `${selectedBoard.name} Resources` : "Recommended Resources"}
            </h2>
            <p className="text-slate-500 text-sm">
              {hasFilter
                ? `Showing official and popular repositories for ${[
                    selectedBoard?.name || "all boards",
                    classNum ? `Class ${classNum}` : "all classes",
                    subject || "all subjects",
                  ].join(" · ")}`
                : "Tap any resource to open free papers and solved answer keys in a new tab"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {orderedResources.map((res, i) => {
              const isOfficial = res.officialFor === board;
              const IconComp = res.icon;
              return (
                <motion.a
                  key={res.name}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className={`premium-card p-5 group block ${isOfficial ? "ring-2 ring-brand-royal/30" : ""}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${selectedBoard?.color || "from-brand-royal to-brand-navy"} flex items-center justify-center`}>
                      <IconComp className="h-5 w-5 text-white" />
                    </div>
                    {isOfficial && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-green-50 text-green-700">
                        <BadgeCheck className="h-3.5 w-3.5" /> Official
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-brand-royal transition-colors">
                    {res.name}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">{res.description}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-royal group-hover:gap-2.5 transition-all">
                    <Download className="h-4 w-4" /> Open Resource <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                  </span>
                </motion.a>
              );
            })}
          </div>

          {/* Why external */}
          <div className="mt-12 bg-brand-bg rounded-2xl p-6 border border-brand-royal/10">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-brand-gradient-static flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Why are papers hosted externally?</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Hosting 10+ years of PDFs for every board, class, and subject would consume heavy database bandwidth and slow the platform down.
                  We link directly to official board archives and trusted free repositories so you always get the latest papers and solved answer keys — instantly and free.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
