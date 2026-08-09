"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, Star, ChevronRight, GraduationCap, Building,
  Loader2, Award, BookOpen, IndianRupee, Briefcase, Plus, Check,
  Sparkles, TrendingUp,
} from "lucide-react";

interface College {
  _id?: string;
  id?: string;
  slug: string;
  name: string;
  shortName?: string;
  location: string;
  rating: number;
  reviewCount?: number;
  courses: string[];
  ugCourses?: string[];
  pgCourses?: string[];
  courseCount?: number;
  fees: string;
  placement: string;
  avgPackage: string;
  ranking: string;
  type: string;
  description?: string;
  highlights?: string[];
  accreditation?: string[];
  tagline?: string;
  logoUrl?: string;
  bannerUrl?: string;
  learningMode?: string[];
  featured?: boolean;
  duration?: string;
  eligibility?: string;
  specializations?: string[];
  scholarship?: string;
}

function UniversitiesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialType = searchParams.get("type") || "ug";
  const initialCourse = searchParams.get("course") || "";
  const [activeType, setActiveType] = useState(initialType);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [allColleges, setAllColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeType) params.set("type", activeType);
    if (initialCourse) params.set("course", initialCourse);
    const queryStr = params.toString();
    fetch(`/api/colleges${queryStr ? `?${queryStr}` : ""}`)
      .then((r) => r.json())
      .then((data) => setAllColleges(data.colleges || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeType, initialCourse]);

  const colleges = allColleges.filter(
    (c) => c.type === activeType || (!c.type && activeType === "ug")
  );

  const locations = [
    ...new Set(
      allColleges
        .map((c) => c.location?.split(",")[0]?.trim())
        .filter(Boolean)
    ),
  ];

  // Filter by initial course param
  const courseFiltered = initialCourse
    ? colleges.filter((c) =>
        c.courses?.some(
          (course) => course.toLowerCase().includes(initialCourse.toLowerCase())
        )
      )
    : colleges;

  const filtered = courseFiltered.filter((college) => {
    const matchesSearch =
      !searchQuery ||
      college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      college.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      college.courses?.some((c) =>
        c.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesLocation =
      !selectedLocation || college.location?.includes(selectedLocation);
    return matchesSearch && matchesLocation;
  });

  const featuredColleges = allColleges.filter((c) => c.featured);

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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-block text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full mb-4">
              {initialCourse
                ? `${initialCourse.charAt(0).toUpperCase() + initialCourse.slice(1)} Colleges`
                : "Top Universities"}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {initialCourse
                ? `Best ${initialCourse.charAt(0).toUpperCase() + initialCourse.slice(1)} Colleges in India`
                : "Find Your Dream College"}
            </h1>
            <p className="text-white/70 text-lg mb-8">
              Explore top UGC-approved universities. Compare fees, placements,
              and rankings.
            </p>
          </motion.div>
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
                onClick={() => {
                  setActiveType("ug");
                  router.push("/universities?type=ug", { scroll: false });
                }}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  activeType === "ug"
                    ? "bg-brand-gradient-static text-white shadow-brand-btn"
                    : "bg-brand-bg text-neutral-darkGray hover:bg-neutral-lightGray"
                }`}
              >
                <GraduationCap className="h-4 w-4 inline mr-1.5" />
                Undergraduate (UG)
              </button>
              <button
                onClick={() => {
                  setActiveType("pg");
                  router.push("/universities?type=pg", { scroll: false });
                }}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  activeType === "pg"
                    ? "bg-brand-gradient-static text-white shadow-brand-btn"
                    : "bg-brand-bg text-neutral-darkGray hover:bg-neutral-lightGray"
                }`}
              >
                <Building className="h-4 w-4 inline mr-1.5" />
                Postgraduate (PG)
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {locations.slice(0, 8).map((loc) => (
                <button
                  key={loc}
                  onClick={() =>
                    setSelectedLocation(
                      selectedLocation === loc ? "" : loc
                    )
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedLocation === loc
                      ? "bg-brand-royal text-white"
                      : "bg-brand-bg text-neutral-darkGray hover:bg-neutral-lightGray"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Universities */}
      {featuredColleges.length > 0 && !searchQuery && !selectedLocation && !initialCourse && (
        <section className="container-custom pt-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 rounded-xl bg-amber-100 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-neutral-nearBlack">
              Featured Universities
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredColleges.map((college, i) => (
              <motion.div
                key={college.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/universities/${college.slug}`}>
                  <div className="premium-card p-5 group hover:shadow-brand-hover transition-all h-full border-2 border-transparent hover:border-amber-200">
                    <div className="flex items-center gap-3 mb-3">
                      {college.logoUrl ? (
                        <img
                          src={college.logoUrl}
                          alt={college.name}
                          className="h-10 w-10 rounded-lg object-contain bg-white"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-brand-gradient-static flex items-center justify-center text-white font-bold text-lg">
                          {college.shortName?.charAt(0) || college.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-neutral-nearBlack text-sm group-hover:text-brand-royal transition-colors">
                          {college.shortName || college.name}
                        </h3>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                          <span className="text-xs text-neutral-mediumGray">
                            {college.rating} ({college.reviewCount?.toLocaleString() || 0})
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {(college.accreditation || [])
                        .slice(0, 2)
                        .map((acc) => (
                          <span
                            key={acc}
                            className="px-2 py-0.5 text-[10px] rounded-full bg-brand-bg text-brand-royal font-medium"
                          >
                            {acc}
                          </span>
                        ))}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-mediumGray">
                        {college.courseCount || college.courses?.length || 0}+ Courses
                      </span>
                      <span className="text-brand-royal font-medium flex items-center gap-0.5 group-hover:gap-1 transition-all">
                        View Details <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* All Colleges Grid */}
      <section className="container-custom py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-neutral-nearBlack">
            {initialCourse
              ? `${initialCourse.charAt(0).toUpperCase() + initialCourse.slice(1)} Colleges`
              : activeType === "ug"
                ? "Undergraduate Colleges"
                : "Postgraduate Colleges"}
            <span className="text-neutral-mediumGray text-sm font-normal ml-2">
              ({filtered.length} {filtered.length === 1 ? "college" : "colleges"})
            </span>
          </h2>
        </div>
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Building className="h-16 w-16 text-neutral-lightGray mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-darkGray mb-2">
                No colleges found
              </h3>
              <p className="text-neutral-mediumGray">
                Try adjusting your search or filters
              </p>
            </motion.div>
          ) : (
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
                        <div className="flex items-center gap-3">
                          {college.logoUrl ? (
                            <img
                              src={college.logoUrl}
                              alt={college.name}
                              className="h-12 w-12 rounded-xl object-contain bg-white border border-neutral-lightGray/50 flex-shrink-0"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-xl bg-brand-gradient-static flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                              {(college.shortName || college.name).charAt(0)}
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold text-neutral-nearBlack text-lg group-hover:text-brand-royal transition-colors">
                              {college.name}
                            </h3>
                            <p className="text-sm text-neutral-mediumGray flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />{" "}
                              {college.location}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-brand-royal/10 px-2.5 py-1 rounded-lg flex-shrink-0">
                          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-sm font-semibold text-neutral-nearBlack">
                            {college.rating}
                          </span>
                        </div>
                      </div>

                      {/* Accreditation Badges */}
                      {college.accreditation && college.accreditation.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {college.accreditation.slice(0, 3).map((acc) => (
                            <span
                              key={acc}
                              className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-100"
                            >
                              {acc}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Tagline */}
                      {college.tagline && (
                        <p className="text-xs text-neutral-mediumGray mb-3 italic">
                          "{college.tagline}"
                        </p>
                      )}

                      {/* UG Courses */}
                      {college.ugCourses && college.ugCourses.length > 0 && (
                        <div className="mb-2">
                          <div className="text-[10px] font-bold text-neutral-mediumGray uppercase tracking-wide mb-1.5">
                            UG Courses
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {college.ugCourses.slice(0, 4).map((course) => (
                              <span
                                key={course}
                                className="px-2 py-0.5 text-[10px] rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200"
                              >
                                {course}
                              </span>
                            ))}
                            {college.ugCourses.length > 4 && (
                              <span className="px-2 py-0.5 text-[10px] rounded-full bg-neutral-lightGray text-neutral-mediumGray">
                                +{college.ugCourses.length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* PG Courses */}
                      {college.pgCourses && college.pgCourses.length > 0 && (
                        <div className="mb-3">
                          <div className="text-[10px] font-bold text-neutral-mediumGray uppercase tracking-wide mb-1.5">
                            PG Courses
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {college.pgCourses.slice(0, 4).map((course) => (
                              <span
                                key={course}
                                className="px-2 py-0.5 text-[10px] rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200"
                              >
                                {course}
                              </span>
                            ))}
                            {college.pgCourses.length > 4 && (
                              <span className="px-2 py-0.5 text-[10px] rounded-full bg-neutral-lightGray text-neutral-mediumGray">
                                +{college.pgCourses.length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Fallback: generic courses if no ug/pg split */}
                      {(!college.ugCourses || college.ugCourses.length === 0) &&
                       (!college.pgCourses || college.pgCourses.length === 0) && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {college.courses.slice(0, 3).map((course) => (
                            <span
                              key={course}
                              className="px-2 py-0.5 text-xs rounded-full bg-brand-bg text-brand-royal font-medium"
                            >
                              {course}
                            </span>
                          ))}
                          {college.courses.length > 3 && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-neutral-lightGray text-neutral-mediumGray">
                              +{college.courses.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                        <div className="bg-brand-bg rounded-lg p-2">
                          <div className="text-[10px] text-neutral-mediumGray uppercase">Fees</div>
                          <div className="text-xs font-semibold text-neutral-darkGray">
                            {college.fees}
                          </div>
                        </div>
                        <div className="bg-brand-bg rounded-lg p-2">
                          <div className="text-[10px] text-neutral-mediumGray uppercase">Placement</div>
                          <div className="text-xs font-semibold text-emerald-600">
                            {college.placement}
                          </div>
                        </div>
                        <div className="bg-brand-bg rounded-lg p-2">
                          <div className="text-[10px] text-neutral-mediumGray uppercase">Avg Pkg</div>
                          <div className="text-xs font-semibold text-brand-royal">
                            {college.avgPackage}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-neutral-lightGray">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-brand-bg text-brand-royal">
                          {college.ranking}
                        </span>
                        {college.learningMode && college.learningMode.length > 0 && (
                          <span className="text-xs text-neutral-mediumGray">
                            {college.learningMode.join(" & ")}
                          </span>
                        )}
                        <span className="text-brand-royal font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                          View Details <ChevronRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}

export default function UniversitiesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-bg pt-16 flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-brand-royal animate-spin" />
        </div>
      }
    >
      <UniversitiesContent />
    </Suspense>
  );
}
