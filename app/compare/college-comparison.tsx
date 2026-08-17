"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  X,
  Plus,
  GraduationCap,
  IndianRupee,
  Star,
  Briefcase,
  MapPin,
  ArrowRight,
  Award,
  BookOpen,
  Sparkles,
  RotateCcw,
  Loader2,
  AlertCircle,
  Building2,
  RefreshCw,
} from "lucide-react";
import {
  AddItemModal,
  EmptyState,
  safeStr,
  CompareLabel,
} from "./compare-utils";

interface College {
  _id?: string;
  slug: string;
  name: string;
  shortName?: string;
  location: string;
  type: string;
  rating: number;
  reviewCount?: number;
  courses: string[];
  ugCourses?: string[];
  pgCourses?: string[];
  fees: string;
  placement: string;
  avgPackage: string;
  ranking: string;
  accreditation?: string[];
  learningMode?: string[];
  highlights?: string[];
  logoUrl?: string;
  category?: string;
  duration?: string;
  eligibility?: string;
  scholarship?: string;
  tagline?: string;
}

type UGPGTab = "all" | "ug" | "pg";

export default function CollegeComparison({
  collegesParam,
}: {
  collegesParam: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [allColleges, setAllColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [ugpg, setUgpg] = useState<UGPGTab>("all");

  const [selected, setSelected] = useState<College[]>([]);
  const [urlSynced, setUrlSynced] = useState(false);

  // Fetch colleges
  useEffect(() => {
    fetch("/api/colleges")
      .then((r) => r.json())
      .then((data) => {
        const colleges = data.colleges || [];
        setAllColleges(colleges);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load colleges. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Restore selections from URL once colleges are loaded
  useEffect(() => {
    if (urlSynced || allColleges.length === 0) return;
    if (collegesParam) {
      const slugs = collegesParam.split(",").filter(Boolean);
      const found = slugs
        .map((s) => allColleges.find((c) => c.slug === s))
        .filter(Boolean) as College[];
      if (found.length > 0) {
        setSelected(found.slice(0, 4));
      } else if (allColleges.length >= 2) {
        setSelected([allColleges[0], allColleges[1]]);
      }
    } else if (allColleges.length >= 2) {
      setSelected([allColleges[0], allColleges[1]]);
    } else if (allColleges.length === 1) {
      setSelected([allColleges[0]]);
    }
    setUrlSynced(true);
  }, [allColleges, collegesParam, urlSynced]);

  const updateURL = useCallback(
    (cols: College[]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (cols.length > 0) {
        params.set("colleges", cols.map((c) => c.slug).join(","));
      } else {
        params.delete("colleges");
      }
      params.set("tab", "colleges");
      router.replace(`/compare?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const addCollege = useCallback(
    (slug: string) => {
      if (selected.length >= 4) return;
      const col = allColleges.find((c) => c.slug === slug);
      if (col && !selected.find((c) => c.slug === slug)) {
        const next = [...selected, col];
        setSelected(next);
        updateURL(next);
      }
    },
    [selected, allColleges, updateURL]
  );

  const removeCollege = useCallback(
    (slug: string) => {
      const next = selected.filter((c) => c.slug !== slug);
      setSelected(next);
      updateURL(next);
    },
    [selected, updateURL]
  );

  const clearAll = useCallback(() => {
    setSelected([]);
    updateURL([]);
  }, [updateURL]);

  // Filter colleges by UG/PG
  const isUG = (c: College): boolean => {
    if (c.ugCourses && c.ugCourses.length > 0) return true;
    if (c.type === "ug") return true;
    // Check if any course name suggests UG
    const ugKeywords = ["BBA", "BCA", "B.Com", "B.Sc", "B.Tech", "BA", "B.E", "B.Arch"];
    return c.courses?.some((name) =>
      ugKeywords.some((kw) => name.toLowerCase().includes(kw.toLowerCase()))
    );
  };

  const isPG = (c: College): boolean => {
    if (c.pgCourses && c.pgCourses.length > 0) return true;
    if (c.type === "pg") return true;
    const pgKeywords = ["MBA", "MCA", "M.Sc", "MA", "M.Com", "M.Tech", "M.E", "Executive"];
    return c.courses?.some((name) =>
      pgKeywords.some((kw) => name.toLowerCase().includes(kw.toLowerCase()))
    );
  };

  const filteredColleges = allColleges.filter((c) => {
    if (ugpg === "ug") return isUG(c);
    if (ugpg === "pg") return isPG(c);
    return true;
  });

  const availableItems = filteredColleges
    .filter((c) => !selected.find((s) => s.slug === c.slug))
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      subtitle: `${c.location} · ${c.ranking || "N/A"}`,
      logoUrl: c.logoUrl,
    }));

  // ---- Render ----

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="space-y-6 animate-pulse">
          <div className="flex gap-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-10 w-44 rounded-full bg-neutral-lightGray/50"
              />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-neutral-lightGray/30"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-12">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-darkGray mb-1">
            Connection Error
          </h3>
          <p className="text-sm text-neutral-mediumGray max-w-sm mb-4">
            {error}
          </p>
          <button
            onClick={() => {
              setError("");
              setLoading(true);
              fetch("/api/colleges")
                .then((r) => r.json())
                .then((data) => setAllColleges(data.colleges || []))
                .catch((err) =>
                  setError("Failed to load colleges. Please try again.")
                )
                .finally(() => setLoading(false));
            }}
            className="btn-primary py-2 px-5 inline-flex items-center gap-2 text-sm"
          >
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (selected.length === 0) {
    return (
      <div className="container-custom py-12">
        <EmptyState
          icon={Sparkles}
          title="Compare Colleges"
          description="Select colleges to compare rankings, fees, placements, courses, and more side-by-side."
        />
        <div className="text-center mt-2">
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary py-2.5 px-6 inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Colleges
          </button>
        </div>
        <AddItemModal
          open={showModal}
          onClose={() => setShowModal(false)}
          items={availableItems}
          onSelect={(item) => addCollege(item.slug)}
          title="Add College to Compare"
          placeholder="Search by name or location..."
          maxItems={4}
          currentCount={selected.length}
        />
      </div>
    );
  }

  return (
    <div className="container-custom py-10">
      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {selected.map((c) => (
          <div
            key={c.slug}
            className="flex items-center gap-2 bg-brand-royal/10 rounded-full px-4 py-2"
          >
            {c.logoUrl && (
              <img
                src={c.logoUrl}
                alt={c.name}
                className="w-5 h-5 rounded-full object-cover"
              />
            )}
            <span className="text-sm font-medium text-brand-royal">
              {c.shortName || c.name}
            </span>
            <button
              onClick={() => removeCollege(c.slug)}
              className="text-brand-royal/50 hover:text-brand-royal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        {selected.length < 4 && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 border-2 border-dashed border-neutral-lightGray rounded-full px-4 py-2 text-neutral-mediumGray hover:border-brand-royal hover:text-brand-royal transition-all text-sm"
          >
            <Plus className="h-4 w-4" /> Add College
          </button>
        )}
        {selected.length > 0 && (
          <button
            onClick={clearAll}
            className="ml-auto flex items-center gap-1.5 text-xs text-neutral-mediumGray hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Clear All
          </button>
        )}
      </div>

      {/* UG/PG Toggle */}
      <div className="flex items-center gap-1.5 mb-6 bg-white/70 rounded-xl p-1 border border-neutral-lightGray/50 w-fit">
        {(["all", "ug", "pg"] as UGPGTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setUgpg(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              ugpg === tab
                ? "bg-brand-royal text-white shadow-sm"
                : "text-neutral-mediumGray hover:text-neutral-darkGray"
            }`}
          >
            {tab === "all" ? "All" : tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Empty state when UG/PG filter yields nothing */}
      {filteredColleges.length === 0 && allColleges.length > 0 && (
        <div className="text-center py-10">
          <p className="text-neutral-mediumGray text-sm">
            No {ugpg.toUpperCase()} colleges available. Try &ldquo;All&rdquo; filter.
          </p>
        </div>
      )}

      {/* Comparison table */}
      <div className="overflow-x-auto rounded-2xl border border-neutral-lightGray/50">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-neutral-lightGray">
              <th className="text-left py-4 px-4 text-neutral-mediumGray font-medium text-sm w-48 bg-neutral-lightGray/10 rounded-tl-2xl">
                College
              </th>
              {selected.map((c, i) => (
                <th
                  key={c.slug}
                  className={`text-left py-4 px-4 ${
                    i === selected.length - 1 ? "rounded-tr-2xl" : ""
                  }`}
                >
                  <div className="font-bold text-neutral-nearBlack">
                    {c.name}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-neutral-mediumGray mt-1">
                    <MapPin className="h-3 w-3" /> {c.location}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Ranking */}
            <CollegeRow icon={Star} label="Ranking">
              {selected.map((c) => (
                <span
                  key={c.slug}
                  className="inline-block px-2.5 py-1 rounded-full bg-brand-royal/10 text-brand-royal text-sm font-semibold"
                >
                  {safeStr(c.ranking)}
                </span>
              ))}
            </CollegeRow>

            {/* College Type */}
            <CollegeRow icon={Building2} label="College Type">
              {selected.map((c) => (
                <span
                  key={c.slug}
                  className="inline-block px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-sm font-medium"
                >
                  {safeStr(c.type)}
                </span>
              ))}
            </CollegeRow>

            {/* Accreditation */}
            <CollegeRow icon={Award} label="Accreditation">
              {selected.map((c) => {
                const acc = c.accreditation;
                return (
                  <div key={c.slug} className="flex flex-wrap gap-1">
                    {acc && acc.length > 0
                      ? acc.map((a) => (
                          <span
                            key={a}
                            className="text-xs px-2 py-0.5 rounded-full bg-brand-bg text-neutral-darkGray"
                          >
                            {a}
                          </span>
                        ))
                      : (
                        <span className="text-xs text-neutral-mediumGray">
                          —
                        </span>
                      )}
                  </div>
                );
              })}
            </CollegeRow>

            {/* Fees */}
            <CollegeRow icon={IndianRupee} label="Fees">
              {selected.map((c, i) => {
                const vals = selected.map(
                  (x) =>
                    parseInt(x.fees?.replace(/[^0-9]/g, "").slice(0, 6)) || 0
                );
                const isBest =
                  vals[i] > 0 &&
                  vals[i] === Math.min(...vals.filter((v) => v > 0)) &&
                  vals.filter((v) => v === vals[i]).length === 1;
                return (
                  <span
                    key={c.slug}
                    className={`font-medium text-neutral-darkGray ${
                      isBest ? "text-emerald-600" : ""
                    }`}
                  >
                    {safeStr(c.fees)}
                    {isBest && (
                      <span className="ml-1 text-emerald-600 text-xs">
                        ★ Best
                      </span>
                    )}
                  </span>
                );
              })}
            </CollegeRow>

            {/* Placement */}
            <CollegeRow icon={Briefcase} label="Placement Rate">
              {selected.map((c) => (
                <span
                  key={c.slug}
                  className="text-emerald-600 font-semibold"
                >
                  {safeStr(c.placement)}
                </span>
              ))}
            </CollegeRow>

            {/* Avg Package */}
            <CollegeRow icon={IndianRupee} label="Avg Package">
              {selected.map((c, i) => {
                const vals = selected.map(
                  (x) =>
                    parseFloat(x.avgPackage?.replace(/[^0-9.]/g, "")) || 0
                );
                const isBest =
                  vals[i] === Math.max(...vals) &&
                  vals.filter((v) => v === vals[i]).length === 1;
                return (
                  <span
                    key={c.slug}
                    className={`font-semibold ${
                      isBest ? "text-emerald-600" : "text-brand-royal"
                    }`}
                  >
                    {safeStr(c.avgPackage)}
                    {isBest && (
                      <span className="ml-1 text-emerald-600 text-xs">
                        ★ Best
                      </span>
                    )}
                  </span>
                );
              })}
            </CollegeRow>

            {/* Rating */}
            <CollegeRow icon={Star} label="Rating">
              {selected.map((c) => (
                <div key={c.slug} className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium">
                    {c.rating || "—"}
                  </span>
                  {c.reviewCount ? (
                    <span className="text-xs text-neutral-mediumGray">
                      ({c.reviewCount})
                    </span>
                  ) : null}
                </div>
              ))}
            </CollegeRow>

            {/* Learning Mode */}
            <CollegeRow icon={BookOpen} label="Learning Mode">
              {selected.map((c) => {
                const modes = c.learningMode;
                return (
                  <div key={c.slug} className="flex flex-wrap gap-1">
                    {modes && modes.length > 0
                      ? modes.map((m) => (
                          <span
                            key={m}
                            className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700"
                          >
                            {m}
                          </span>
                        ))
                      : (
                        <span className="text-xs text-neutral-mediumGray">
                          —
                        </span>
                      )}
                  </div>
                );
              })}
            </CollegeRow>

            {/* Courses */}
            <CollegeRow icon={GraduationCap} label="Courses">
              {selected.map((c) => (
                <div key={c.slug} className="flex flex-wrap gap-1">
                  {c.courses?.slice(0, 5).map((course) => (
                    <span
                      key={course}
                      className="text-xs px-2 py-0.5 rounded-full bg-brand-bg text-neutral-darkGray"
                    >
                      {course}
                    </span>
                  ))}
                  {c.courses?.length > 5 && (
                    <span className="text-xs text-neutral-mediumGray">
                      +{c.courses.length - 5} more
                    </span>
                  )}
                  {(!c.courses || c.courses.length === 0) && (
                    <span className="text-xs text-neutral-mediumGray">
                      —
                    </span>
                  )}
                </div>
              ))}
            </CollegeRow>

            {/* Highlights */}
            <CollegeRow icon={Sparkles} label="Highlights">
              {selected.map((c) => {
                const h = c.highlights;
                return (
                  <div key={c.slug} className="space-y-1">
                    {h && h.length > 0
                      ? h.slice(0, 3).map((item, idx) => (
                          <p
                            key={idx}
                            className="text-xs text-neutral-darkGray flex items-start gap-1"
                          >
                            <span className="text-brand-royal mt-0.5 shrink-0">
                              •
                            </span>
                            {item}
                          </p>
                        ))
                      : (
                        <span className="text-xs text-neutral-mediumGray">
                          —
                        </span>
                      )}
                    {h && h.length > 3 && (
                      <p className="text-xs text-neutral-mediumGray">
                        +{h.length - 3} more
                      </p>
                    )}
                  </div>
                );
              })}
            </CollegeRow>

            {/* View Profile */}
            <tr className="border-b border-neutral-lightGray/50">
              <td className="py-4 px-4 bg-white sticky left-0 z-10" />
              {selected.map((c) => (
                <td key={c.slug} className="py-4 px-4 text-center">
                  <Link
                    href={`/universities/${c.slug}`}
                    className="btn-primary py-2 px-4 text-sm inline-flex items-center gap-1"
                  >
                    View Full Profile <ArrowRight className="h-4 w-4" />
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <AddItemModal
        open={showModal}
        onClose={() => setShowModal(false)}
        items={availableItems}
        onSelect={(item) => addCollege(item.slug)}
        title={`Add ${ugpg === "all" ? "" : ugpg.toUpperCase() + " "}College to Compare`}
        placeholder="Search by name or location..."
        maxItems={4}
        currentCount={selected.length}
      />
    </div>
  );
}

/** Internal: a comparison row using the table semantic */
function CollegeRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode[];
}) {
  return (
    <tr className="border-b border-neutral-lightGray/50">
      <td className="py-4 px-4 bg-white sticky left-0 z-10">
        <div className="flex items-center gap-2 text-neutral-darkGray">
          <Icon className="h-4 w-4 text-brand-royal shrink-0" />
          <span className="font-medium text-sm">{label}</span>
        </div>
      </td>
      {children.map((child, i) => (
        <td key={i} className="py-4 px-4">
          {child}
        </td>
      ))}
    </tr>
  );
}
