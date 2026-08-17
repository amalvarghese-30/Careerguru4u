"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CareerComparison from "./career-comparison";
import CollegeComparison from "./college-comparison";

function CompareTabs() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as "careers" | "colleges" | null;
  const careersParam = searchParams.get("careers");
  const collegesParam = searchParams.get("colleges");

  const [activeTab, setActiveTab] = useState<"careers" | "colleges">(
    tabParam === "colleges" ? "colleges" : "careers"
  );

  return (
    <>
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-navy via-brand-navy to-brand-royal text-white py-12">
        <div className="container-custom text-center max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Compare &amp; Decide
          </h1>
          <p className="text-white/70 text-lg">
            Side-by-side comparison of careers, colleges, salaries, and more
          </p>
          <div className="flex items-center justify-center gap-1 mt-6 bg-white/10 rounded-2xl p-1 inline-flex">
            <button
              onClick={() => setActiveTab("careers")}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "careers"
                  ? "bg-white text-brand-navy"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Compare Careers
            </button>
            <button
              onClick={() => setActiveTab("colleges")}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "colleges"
                  ? "bg-white text-brand-navy"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Compare Colleges
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "careers" ? (
        <CareerComparison careersParam={careersParam} />
      ) : (
        <CollegeComparison collegesParam={collegesParam} />
      )}
    </>
  );
}

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-brand-bg pt-16">
      <Suspense
        fallback={
          <div className="container-custom py-12">
            <div className="h-96 animate-pulse rounded-2xl bg-neutral-lightGray/20" />
          </div>
        }
      >
        <CompareTabs />
      </Suspense>
    </div>
  );
}
