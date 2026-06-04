"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, IndianRupee, Calendar, GraduationCap, Award, Loader2, ArrowRight, ChevronRight } from "lucide-react";

interface Scholarship {
  _id?: string; title: string; provider: string; amount: string; deadline: string;
  eligibility: string; category: string; description: string; status: string;
}

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    fetch(`/api/scholarships?${params}`)
      .then(r => r.json())
      .then(data => setScholarships(data.scholarships || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, search]);

  const categories = [...new Set(scholarships.map(s => s.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-brand-bg pt-16">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-navy via-brand-navy to-brand-royal py-16">
        <div className="container-custom max-w-3xl mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Scholarships & Financial Aid
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-white/70 text-lg mb-8">
            Discover scholarships that can fund your education journey
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-lightGray" />
            <input type="text" placeholder="Search scholarships by name or provider..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white shadow-lg text-neutral-nearBlack placeholder:text-neutral-mediumGray focus:outline-none focus:ring-2 focus:ring-brand-royal" />
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      {categories.length > 0 && (
        <section className="py-4 bg-white border-b border-neutral-lightGray/50 sticky top-16 z-20">
          <div className="container-custom">
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setCategory("")}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium ${!category ? "bg-brand-royal text-white" : "bg-brand-bg text-neutral-darkGray hover:bg-neutral-lightGray"}`}>All</button>
              {categories.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium ${category === cat ? "bg-brand-royal text-white" : "bg-brand-bg text-neutral-darkGray hover:bg-neutral-lightGray"}`}>{cat}</button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Scholarships Grid */}
      <section className="container-custom py-12">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 text-brand-royal animate-spin" /></div>
        ) : scholarships.length === 0 ? (
          <div className="text-center py-20">
            <Award className="h-16 w-16 text-neutral-lightGray mx-auto mb-4" />
            <h2 className="text-xl font-bold text-neutral-nearBlack mb-2">No Scholarships Found</h2>
            <p className="text-neutral-mediumGray">Check back later for new opportunities.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scholarships.map((s, i) => (
              <motion.div key={s._id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="premium-card p-6 h-full group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-12 w-12 rounded-xl bg-brand-bg flex items-center justify-center">
                      <Award className="h-6 w-6 text-brand-royal" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 capitalize">{s.status}</span>
                  </div>
                  <h3 className="font-bold text-neutral-nearBlack text-lg mb-1">{s.title}</h3>
                  <p className="text-sm text-brand-royal font-medium mb-3">{s.provider}</p>
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="flex items-center gap-1.5 text-neutral-mediumGray">
                      <IndianRupee className="h-4 w-4 text-emerald-500" />
                      <span className="font-semibold text-neutral-nearBlack">{s.amount || "Varies"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-neutral-mediumGray">
                      <Calendar className="h-4 w-4 text-amber-500" />
                      <span>{s.deadline ? new Date(s.deadline).toLocaleDateString("en-IN") : "Ongoing"}</span>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-mediumGray mb-2"><span className="font-medium">Eligibility:</span> {s.eligibility || "See details"}</p>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-brand-bg text-brand-royal font-medium">{s.category}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <div className="text-center pb-16">
        <Link href="/counselling" className="btn-primary inline-flex items-center gap-2">
          Need Help? Talk to a Counsellor <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
