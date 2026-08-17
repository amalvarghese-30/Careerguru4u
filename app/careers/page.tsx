"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search, Briefcase, ArrowRight, IndianRupee, Compass,
} from "lucide-react";

interface Career {
  id: string;
  _id?: string;
  title: string;
  subtitle: string;
  overview?: string;
  stream: string;
  category?: string;
  salary?: {
    entry?: string;
    mid?: string;
    senior?: string;
  };
}

const STREAMS = ["All", "Science", "Commerce", "Arts/Humanities", "Vocational"];

const streamStyles: Record<string, string> = {
  Science: "from-blue-600 to-cyan-500",
  Commerce: "from-amber-500 to-orange-500",
  "Arts/Humanities": "from-purple-500 to-pink-500",
  Vocational: "from-emerald-500 to-teal-500",
};

export default function CareersIndexPage() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stream, setStream] = useState("All");

  useEffect(() => {
    fetch("/api/careers")
      .then((r) => r.json())
      .then((data) => setCareers(data.careers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return careers.filter((c) => {
      const matchesStream = stream === "All" || c.stream === stream;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        (c.subtitle || "").toLowerCase().includes(q) ||
        (c.stream || "").toLowerCase().includes(q);
      return matchesStream && matchesSearch;
    });
  }, [careers, search, stream]);

  return (
    <div className="min-h-screen bg-brand-bg pt-16">
      {/* Hero */}
      <section className="bg-ocean-gradient py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
            >
              Explore Careers
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white/85 text-lg mb-8"
            >
              Discover career paths across Science, Commerce, Arts, and Vocational streams — with salaries, exams, and roadmaps.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative max-w-xl mx-auto"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search for a career..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white shadow-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stream Filters */}
      <section className="py-6 bg-white border-b border-slate-100">
        <div className="container-custom">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {STREAMS.map((s) => (
              <button
                key={s}
                onClick={() => setStream(s)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  stream === s
                    ? "bg-brand-gradient-static text-white shadow-brand-btn"
                    : "text-neutral-darkGray bg-slate-100 hover:bg-slate-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Careers Grid */}
      <section className="section-padding">
        <div className="container-custom">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-card p-6 animate-pulse">
                  <div className="h-12 w-12 bg-slate-200 rounded-xl mb-4" />
                  <div className="h-5 w-2/3 bg-slate-200 rounded mb-2" />
                  <div className="h-4 w-full bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-brand-bg flex items-center justify-center mx-auto mb-4">
                <Compass className="h-8 w-8 text-brand-royal" />
              </div>
              <h3 className="heading-card text-xl mb-2">No careers found</h3>
              <p className="text-neutral-mediumGray">Try a different search term or stream filter.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="heading-card text-xl">
                  {stream === "All" ? "All Careers" : `${stream} Careers`}
                  <span className="text-neutral-mediumGray text-sm font-normal ml-2">({filtered.length})</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((career, i) => {
                  const slug = career.id || career._id || "";
                  const gradient = streamStyles[career.stream] || "from-brand-royal to-brand-electric";
                  return (
                    <motion.div
                      key={slug}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link href={`/careers/${slug}`} className="block h-full">
                        <div className="glass-card p-6 h-full group hover:shadow-brand-hover transition-all flex flex-col">
                          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <Briefcase className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-bg text-brand-royal">
                              {career.stream}
                            </span>
                            {career.category && (
                              <span className="text-xs text-neutral-mediumGray">{career.category}</span>
                            )}
                          </div>
                          <h3 className="font-bold text-neutral-nearBlack text-lg group-hover:text-brand-royal transition-colors">
                            {career.title}
                          </h3>
                          <p className="text-sm text-neutral-mediumGray mt-1 line-clamp-2 flex-1">
                            {career.subtitle || career.overview}
                          </p>
                          {career.salary?.entry && (
                            <div className="flex items-center gap-1.5 mt-4 text-sm text-green-600 font-medium">
                              <IndianRupee className="h-4 w-4" />
                              {career.salary.entry}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 mt-3 text-sm font-semibold text-brand-royal group-hover:gap-2.5 transition-all">
                            View Career <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
