"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { MapPin, Star, IndianRupee, ChevronRight, Loader2 } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

type CollegeType = "ug" | "pg";

interface CollegeData {
  _id?: string; name: string; slug: string; location: string; rating: number;
  courses: string[]; fees: string; placement: string; avgPackage: string;
  ranking: string; type: CollegeType; featured?: boolean;
}

export function FeaturedColleges() {
  const [activeType, setActiveType] = useState<CollegeType>("ug");
  const [colleges, setColleges] = useState<CollegeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/colleges?featured=true")
      .then(r => r.json())
      .then(data => {
        const list = data.colleges || [];
        setColleges(list.length > 0 ? list : data.colleges || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = colleges.filter((c) => c.type === activeType).slice(0, 6);

  if (loading || filtered.length === 0) return null;

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <SectionHeader
          badge="College Discovery"
          title="Find Your Dream College"
          description="Explore top-rated colleges across India with detailed profiles, fees, placements, and rankings."
        />

        <div className="flex justify-center gap-3 mb-10">
          {([
            { key: "ug" as CollegeType, label: "Undergraduate (UG)" },
            { key: "pg" as CollegeType, label: "Postgraduate (PG)" },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveType(tab.key)}
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                activeType === tab.key
                  ? "bg-brand-gradient-static text-white shadow-brand-btn"
                  : "bg-neutral-lightGray text-neutral-darkGray hover:bg-neutral-mediumGray/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeType}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((college, i) => (
              <motion.div
                key={(college._id || college.slug)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link href={`/universities/${(college._id || college.slug)}`} className="block h-full">
                  <div className="premium-card p-6 h-full group">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="heading-card text-lg">{college.name}</h3>
                        <p className="text-sm text-neutral-mediumGray flex items-center gap-1 mt-1">
                          <MapPin className="h-3.5 w-3.5" /> {college.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-semibold">{college.rating}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {college.courses.map((course) => (
                        <span key={course} className="px-2 py-0.5 text-xs rounded-full bg-brand-bg text-brand-royal font-medium">
                          {course}
                        </span>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                      <div>
                        <p className="text-xs text-neutral-mediumGray">Fees</p>
                        <p className="text-sm font-semibold text-neutral-nearBlack">{college.fees}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-mediumGray">Placed</p>
                        <p className="text-sm font-semibold text-green-600">{college.placement}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-mediumGray">Avg Pkg</p>
                        <p className="text-sm font-semibold text-brand-royal">{college.avgPackage}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-neutral-lightGray">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-bg text-brand-royal">
                        {college.ranking}
                      </span>
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

        <div className="text-center mt-10">
          <Link href="/universities" className="btn-primary inline-flex items-center gap-2">
            View All Colleges <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
