"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  X,
  Plus,
  GraduationCap,
  IndianRupee,
  Star,
  Briefcase,
  ArrowRight,
  TrendingUp,
  Building2,
  FileText,
  School,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { getAllCareerSlugs, getCareerById } from "@/lib/careers-data";
import type { CareerData } from "@/lib/careers-data";
import {
  CompareLabel,
  AddItemModal,
  EmptyState,
  safeStr,
} from "./compare-utils";

export default function CareerComparison({
  careersParam,
}: {
  careersParam: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const allSlugs = getAllCareerSlugs();

  const readFromURL = useCallback((): CareerData[] => {
    if (!careersParam) return [];
    const slugs = careersParam.split(",").filter(Boolean);
    return slugs.map((s) => getCareerById(s)).filter(Boolean) as CareerData[];
  }, [careersParam]);

  const [selected, setSelected] = useState<CareerData[]>(() => {
    const fromURL = readFromURL();
    if (fromURL.length > 0) return fromURL;
    // Default pre-select
    const sde = getCareerById("software-engineer");
    const doc = getCareerById("doctor");
    return [sde, doc].filter(Boolean) as CareerData[];
  });
  const [showModal, setShowModal] = useState(false);

  const updateURL = useCallback(
    (careers: CareerData[]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (careers.length > 0) {
        params.set("careers", careers.map((c) => c.id).join(","));
      } else {
        params.delete("careers");
      }
      params.set("tab", "careers");
      router.replace(`/compare?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const addCareer = useCallback(
    (slug: string) => {
      if (selected.length >= 4) return;
      const career = getCareerById(slug);
      if (career && !selected.find((c) => c.id === slug)) {
        const next = [...selected, career];
        setSelected(next);
        updateURL(next);
      }
    },
    [selected, updateURL]
  );

  const removeCareer = useCallback(
    (id: string) => {
      const next = selected.filter((c) => c.id !== id);
      setSelected(next);
      updateURL(next);
    },
    [selected, updateURL]
  );

  const clearAll = useCallback(() => {
    setSelected([]);
    updateURL([]);
  }, [updateURL]);

  const availableItems = allSlugs
    .filter((slug) => !selected.find((c) => c.id === slug))
    .map((slug) => {
      const c = getCareerById(slug);
      return c
        ? {
            slug: c.id,
            name: c.title,
            subtitle: `${c.stream} · ${c.category}`,
          }
        : null;
    })
    .filter(Boolean) as { slug: string; name: string; subtitle: string }[];

  // Calculate best values for salary highlighting
  const salaryValues = selected.map((c) => {
    const entryNum = parseInt(c.salary.entry.replace(/[^0-9]/g, "")) || 0;
    const midNum = parseInt(c.salary.mid.replace(/[^0-9]/g, "")) || 0;
    return entryNum + midNum;
  });

  const growthRank: Record<string, number> = {
    "Very High": 4,
    High: 3,
    Moderate: 2,
    Stable: 1,
  };

  const growthValues = selected.map((c) => growthRank[c.growth] || 0);

  if (selected.length === 0) {
    return (
      <div className="container-custom py-12">
        <EmptyState
          icon={Sparkles}
          title="Compare Careers"
          description="Select careers to see a side-by-side comparison of salary, growth, education path, and more."
        />
        <div className="text-center mt-2">
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary py-2.5 px-6 inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Careers
          </button>
        </div>
        <AddItemModal
          open={showModal}
          onClose={() => setShowModal(false)}
          items={availableItems}
          onSelect={(item) => addCareer(item.slug)}
          title="Add Career to Compare"
          placeholder="Search careers..."
          maxItems={4}
          currentCount={selected.length}
        />
      </div>
    );
  }

  return (
    <div className="container-custom py-10">
      {/* Selection chips */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {selected.map((career) => (
          <div
            key={career.id}
            className="flex items-center gap-2 bg-brand-royal/10 rounded-full px-4 py-2"
          >
            <span className="text-sm font-medium text-brand-royal">
              {career.title}
            </span>
            <button
              onClick={() => removeCareer(career.id)}
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
            <Plus className="h-4 w-4" /> Add Career
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

      {/* Comparison Grid */}
      <div className="overflow-x-auto rounded-2xl border border-neutral-lightGray/50">
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: `200px repeat(${selected.length}, minmax(220px, 1fr))`,
          }}
        >
          {/* Header */}
          <div className="font-medium text-neutral-mediumGray p-4 bg-neutral-lightGray/20 rounded-tl-2xl" />
          {selected.map((career, i) => (
            <div
              key={career.id}
              className={`premium-card p-5 text-center border-0 ${
                i === selected.length - 1 ? "rounded-tr-2xl" : ""
              }`}
            >
              <h3 className="font-bold text-neutral-nearBlack text-lg mb-1">
                {career.title}
              </h3>
              <span className="text-xs text-brand-royal font-semibold">
                {career.stream} &bull; {career.category}
              </span>
            </div>
          ))}

          {/* Overview */}
          <CompareLabel icon={Star} label="Overview" />
          {selected.map((c) => (
            <div key={c.id} className="glass-card p-4">
              <p className="text-xs text-neutral-mediumGray leading-relaxed line-clamp-4">
                {c.overview}
              </p>
            </div>
          ))}

          {/* Growth */}
          <CompareLabel icon={TrendingUp} label="Growth Outlook" />
          {selected.map((c, i) => {
            const isBest =
              growthValues[i] === Math.max(...growthValues) &&
              growthValues.filter((v) => v === growthValues[i]).length === 1;
            return (
              <div
                key={c.id}
                className={`glass-card p-4 text-center ${
                  isBest ? "bg-emerald-50" : ""
                }`}
              >
                <span
                  className={`text-sm font-bold px-3 py-1 rounded-full ${
                    c.growth === "Very High"
                      ? "bg-emerald-100 text-emerald-700"
                      : c.growth === "High"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {c.growth}
                  {isBest && (
                    <span className="ml-1 text-emerald-600 text-xs">
                      ★ Best
                    </span>
                  )}
                </span>
              </div>
            );
          })}

          {/* Entry Salary */}
          <CompareLabel icon={IndianRupee} label="Entry Salary" />
          {selected.map((c, i) => {
            const vals = selected.map(
              (x) => parseInt(x.salary.entry.replace(/[^0-9]/g, "")) || 0
            );
            const isBest =
              vals[i] === Math.max(...vals) &&
              vals.filter((v) => v === vals[i]).length === 1;
            return (
              <div
                key={c.id}
                className={`glass-card p-4 text-center ${
                  isBest ? "bg-emerald-50" : ""
                }`}
              >
                <span className="font-semibold text-green-600">
                  {c.salary.entry}
                  {isBest && (
                    <span className="ml-1 text-emerald-600 text-xs">
                      ★ Best
                    </span>
                  )}
                </span>
              </div>
            );
          })}

          {/* Mid Salary */}
          <CompareLabel icon={IndianRupee} label="Mid Salary (5-10yr)" />
          {selected.map((c, i) => {
            const vals = selected.map(
              (x) => parseInt(x.salary.mid.replace(/[^0-9]/g, "")) || 0
            );
            const isBest =
              vals[i] === Math.max(...vals) &&
              vals.filter((v) => v === vals[i]).length === 1;
            return (
              <div
                key={c.id}
                className={`glass-card p-4 text-center ${
                  isBest ? "bg-emerald-50" : ""
                }`}
              >
                <span className="font-semibold text-green-700">
                  {c.salary.mid}
                  {isBest && (
                    <span className="ml-1 text-emerald-600 text-xs">
                      ★ Best
                    </span>
                  )}
                </span>
              </div>
            );
          })}

          {/* Senior Salary */}
          <CompareLabel icon={IndianRupee} label="Senior Salary" />
          {selected.map((c, i) => {
            const vals = selected.map(
              (x) => parseInt(x.salary.senior.replace(/[^0-9]/g, "")) || 0
            );
            const isBest =
              vals[i] === Math.max(...vals) &&
              vals.filter((v) => v === vals[i]).length === 1;
            return (
              <div
                key={c.id}
                className={`glass-card p-4 text-center ${
                  isBest ? "bg-emerald-50" : ""
                }`}
              >
                <span className="font-semibold text-brand-navy">
                  {c.salary.senior}
                  {isBest && (
                    <span className="ml-1 text-emerald-600 text-xs">
                      ★ Best
                    </span>
                  )}
                </span>
              </div>
            );
          })}

          {/* Education */}
          <CompareLabel icon={GraduationCap} label="Education Path" />
          {selected.map((c) => (
            <div key={c.id} className="glass-card p-4">
              <p className="text-xs text-neutral-darkGray font-medium">
                {c.educationPath[0]?.step}
              </p>
              <p className="text-xs text-neutral-mediumGray mt-1">
                → {c.educationPath[c.educationPath.length - 1]?.step}
              </p>
              <p className="text-xs text-neutral-mediumGray mt-0.5">
                {c.educationPath.length} steps total
              </p>
            </div>
          ))}

          {/* Work Environment */}
          <CompareLabel icon={Building2} label="Work Environment" />
          {selected.map((c) => (
            <div key={c.id} className="glass-card p-4">
              <p className="text-xs text-neutral-darkGray leading-relaxed line-clamp-3">
                {c.workEnvironment}
              </p>
            </div>
          ))}

          {/* Entrance Exams */}
          <CompareLabel icon={FileText} label="Entrance Exams" />
          {selected.map((c) => (
            <div key={c.id} className="glass-card p-4">
              <div className="flex flex-wrap gap-1">
                {c.entranceExams.slice(0, 2).map((e) => (
                  <span
                    key={e.name}
                    className="text-xs px-2 py-0.5 rounded-full bg-brand-bg text-neutral-darkGray"
                  >
                    {e.name}
                  </span>
                ))}
                {c.entranceExams.length > 2 && (
                  <span className="text-xs text-neutral-mediumGray">
                    +{c.entranceExams.length - 2} more
                  </span>
                )}
                {c.entranceExams.length === 0 && (
                  <span className="text-xs text-neutral-mediumGray">—</span>
                )}
              </div>
            </div>
          ))}

          {/* Top Colleges */}
          <CompareLabel icon={School} label="Top Colleges" />
          {selected.map((c) => (
            <div key={c.id} className="glass-card p-4">
              <ul className="space-y-0.5">
                {c.topColleges.slice(0, 3).map((col) => (
                  <li
                    key={col.name}
                    className="text-xs text-neutral-darkGray flex items-center gap-1"
                  >
                    <span className="w-1 h-1 rounded-full bg-brand-royal/50 shrink-0" />
                    {col.name}
                  </li>
                ))}
                {c.topColleges.length > 3 && (
                  <li className="text-xs text-neutral-mediumGray">
                    +{c.topColleges.length - 3} more
                  </li>
                )}
              </ul>
            </div>
          ))}

          {/* Top Recruiters */}
          <CompareLabel icon={Briefcase} label="Top Recruiters" />
          {selected.map((c) => (
            <div key={c.id} className="glass-card p-4">
              <div className="flex flex-wrap gap-1">
                {c.topRecruiters.slice(0, 3).map((r) => (
                  <span
                    key={r}
                    className="text-xs px-2 py-0.5 rounded-full bg-brand-bg text-neutral-darkGray"
                  >
                    {r}
                  </span>
                ))}
                {c.topRecruiters.length > 3 && (
                  <span className="text-xs text-neutral-mediumGray">
                    +{c.topRecruiters.length - 3} more
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Similar Careers */}
          <CompareLabel icon={Sparkles} label="Similar Careers" />
          {selected.map((c) => {
            const uniqueSlugs = [...new Set(c.similarCareers)];
            return (
              <div key={c.id} className="glass-card p-4">
                <div className="flex flex-wrap gap-1">
                  {uniqueSlugs.slice(0, 3).map((slug) => {
                    const sim = getCareerById(slug);
                    return sim ? (
                      <Link
                        key={slug}
                        href={`/careers/${slug}`}
                        className="text-xs px-2 py-0.5 rounded-full bg-brand-royal/5 text-brand-royal hover:bg-brand-royal/15 transition-colors"
                      >
                        {sim.title}
                      </Link>
                    ) : (
                      <span
                        key={slug}
                        className="text-xs px-2 py-0.5 rounded-full bg-brand-bg text-neutral-darkGray"
                      >
                        {slug}
                      </span>
                    );
                  })}
                  {uniqueSlugs.length > 3 && (
                    <span className="text-xs text-neutral-mediumGray">
                      +{uniqueSlugs.length - 3}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Action */}
          <div />
          {selected.map((c) => (
            <div key={c.id} className="glass-card p-4 text-center">
              <Link
                href={`/careers/${c.id}`}
                className="btn-primary py-2 px-4 text-sm inline-flex items-center gap-1"
              >
                View Full Profile <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      <AddItemModal
        open={showModal}
        onClose={() => setShowModal(false)}
        items={availableItems}
        onSelect={(item) => addCareer(item.slug)}
        title="Add Career to Compare"
        placeholder="Search careers..."
        maxItems={4}
        currentCount={selected.length}
      />
    </div>
  );
}
