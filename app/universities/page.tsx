"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, IndianRupee, Star, ChevronRight, Filter, X, Building, GraduationCap, Loader2 } from "lucide-react";

type CollegeType = "ug" | "pg";

interface College {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  location: string;
  rating: number;
  courses: string[];
  fees: string;
  placement: string;
  avgPackage: string;
  ranking: string;
  type: CollegeType;
  description?: string;
  highlights?: string[];
  infrastructure?: string[];
  entranceExams?: string[];
  topRecruiters?: string[];
  established?: string;
}

export default function UniversitiesPage() {
  const [activeType, setActiveType] = useState<CollegeType>("ug");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [allColleges, setAllColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/colleges")
      .then(r => r.json())
      .then(data => setAllColleges(data.colleges || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const colleges = allColleges.filter((c) => c.type === activeType);
  const locations = [...new Set(allColleges.map((c) => c.location?.split(",")[0]?.trim()).filter(Boolean))];

  const filtered = colleges.filter((college) => {
    const matchesSearch = college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      college.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      college.courses?.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLocation = !selectedLocation || college.location?.includes(selectedLocation);
    return matchesSearch && matchesLocation;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg pt-16">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-10 w-10 text-brand-royal animate-spin" />
        </div>
      </div>
    );
  }

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
            Find Your Dream College
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/70 text-lg mb-8"
          >
            Explore top colleges across India. Compare fees, placements, and rankings.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-xl mx-auto"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-lightGray" />
            <input
              type="text"
              placeholder="Search colleges by name, location, or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white shadow-lg text-neutral-nearBlack placeholder:text-neutral-mediumGray focus:outline-none focus:ring-2 focus:ring-brand-royal"
            />
          </motion.div>
        </div>
      </section>

      {/* Toggle + Filters */}
      <section className="py-6 bg-white border-b border-neutral-lightGray/50 sticky top-16 z-20">
        <div className="container-custom">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveType("ug")}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  activeType === "ug" ? "bg-brand-gradient-static text-white shadow-brand-btn" : "bg-brand-bg text-neutral-darkGray hover:bg-neutral-lightGray"
                }`}
              >
                <GraduationCap className="h-4 w-4 inline mr-1.5" />
                Undergraduate (UG)
              </button>
              <button
                onClick={() => setActiveType("pg")}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  activeType === "pg" ? "bg-brand-gradient-static text-white shadow-brand-btn" : "bg-brand-bg text-neutral-darkGray hover:bg-neutral-lightGray"
                }`}
              >
                <Building className="h-4 w-4 inline mr-1.5" />
                Postgraduate (PG)
              </button>
            </div>
            <div className="flex items-center gap-2">
              {locations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => setSelectedLocation(selectedLocation === loc ? "" : loc)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedLocation === loc ? "bg-brand-royal text-white" : "bg-brand-bg text-neutral-darkGray hover:bg-neutral-lightGray"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Colleges Grid */}
      <section className="container-custom py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeType + selectedLocation + searchQuery}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {filtered.map((college, i) => (
              <motion.div
                key={college._id || college.id || college.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/universities/${college.slug}`}>
                  <div className="premium-card p-6 group hover:shadow-brand-hover transition-all h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-neutral-nearBlack text-lg group-hover:text-brand-royal transition-colors">{college.name}</h3>
                        <p className="text-sm text-neutral-mediumGray flex items-center gap-1 mt-1">
                          <MapPin className="h-3.5 w-3.5" /> {college.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-brand-royal/10 px-2.5 py-1 rounded-lg">
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-semibold text-neutral-nearBlack">{college.rating}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {college.courses.slice(0, 3).map((course) => (
                        <span key={course} className="px-2 py-0.5 text-xs rounded-full bg-brand-bg text-brand-royal font-medium">{course}</span>
                      ))}
                      {college.courses.length > 3 && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-neutral-lightGray text-neutral-mediumGray">+{college.courses.length - 3}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                      <div>
                        <div className="text-xs text-neutral-mediumGray">Fees</div>
                        <div className="text-sm font-semibold text-neutral-darkGray">{college.fees}</div>
                      </div>
                      <div>
                        <div className="text-xs text-neutral-mediumGray">Placement</div>
                        <div className="text-sm font-semibold text-emerald-600">{college.placement}</div>
                      </div>
                      <div>
                        <div className="text-xs text-neutral-mediumGray">Avg Package</div>
                        <div className="text-sm font-semibold text-brand-royal">{college.avgPackage}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-neutral-lightGray">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-brand-bg text-brand-royal">{college.ranking}</span>
                      <span className="text-brand-royal font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        View Details <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}
