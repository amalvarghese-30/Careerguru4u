"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, BookOpen, CheckSquare, ChevronRight } from "lucide-react";

interface FilterData {
  classes?: number[];
  subjects?: string[];
  chapters?: string[];
  counts: Record<string, number>;
  error?: string;
}

export default function MockTestBoardPage() {
  const params = useParams();
  const router = useRouter();
  const board = decodeURIComponent(params.board as string);

  const [classes, setClasses] = useState<number[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedChapters, setSelectedChapters] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState({ classes: true, subjects: false, chapters: false });
  const [error, setError] = useState("");

  // Fetch classes on mount
  useEffect(() => {
    fetchFilters(`board=${encodeURIComponent(board)}`, "classes");
  }, [board]);

  // Fetch subjects when class is selected
  useEffect(() => {
    if (selectedClass) {
      fetchFilters(`board=${encodeURIComponent(board)}&class=${selectedClass}`, "subjects");
    }
  }, [selectedClass, board]);

  // Fetch chapters when subject is selected
  useEffect(() => {
    if (selectedClass && selectedSubject) {
      fetchFilters(
        `board=${encodeURIComponent(board)}&class=${selectedClass}&subject=${encodeURIComponent(selectedSubject)}`,
        "chapters"
      );
    }
  }, [selectedSubject, selectedClass, board]);

  const fetchFilters = async (queryString: string, level: "classes" | "subjects" | "chapters") => {
    setLoading(prev => ({ ...prev, [level]: true }));
    setError("");
    try {
      const res = await fetch(`/api/academic/filters?${queryString}`);
      const data: FilterData = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load data");
        return;
      }
      if (level === "classes" && data.classes) {
        setClasses(data.classes);
        setCounts(data.counts);
      } else if (level === "subjects" && data.subjects) {
        setSubjects(data.subjects);
        setCounts(data.counts);
      } else if (level === "chapters" && data.chapters) {
        setChapters(data.chapters);
        setCounts(data.counts);
      }
    } catch {
      setError("Failed to connect. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, [level]: false }));
    }
  };

  const toggleChapter = (chapter: string) => {
    setSelectedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapter)) next.delete(chapter);
      else next.add(chapter);
      return next;
    });
  };

  const toggleAllChapters = () => {
    if (selectedChapters.size === chapters.length) {
      setSelectedChapters(new Set());
    } else {
      setSelectedChapters(new Set(chapters));
    }
  };

  const handleStartTest = () => {
    if (selectedClass && selectedSubject && selectedChapters.size > 0) {
      const chaptersParam = [...selectedChapters].map(c => encodeURIComponent(c)).join(",");
      router.push(
        `/mock-test/${encodeURIComponent(board)}/${selectedClass}?subject=${encodeURIComponent(selectedSubject)}&chapters=${chaptersParam}`
      );
    }
  };

  const formatCount = (n: number) => `${n} solution${n !== 1 ? "s" : ""}`;

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="bg-ocean-gradient py-12">
        <div className="container-custom">
          <Link
            href="/mock-test"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Boards
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{board}</h1>
            <p className="text-white/70">Select your class, subject, and chapters to begin</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom max-w-3xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Class Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Select Class</h2>
            {loading.classes ? (
              <div className="flex items-center gap-2 text-slate-400">
                <div className="h-4 w-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                Loading classes...
              </div>
            ) : classes.length === 0 ? (
              <p className="text-slate-500">No classes available for this board yet.</p>
            ) : (
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-6 gap-2">
                {classes.map((cls) => (
                  <button
                    key={cls}
                    onClick={() => {
                      setSelectedClass(cls);
                      setSelectedSubject(null);
                      setSelectedChapters(new Set());
                    }}
                    className={`p-3 rounded-xl text-sm font-semibold transition-all relative ${
                      selectedClass === cls
                        ? "bg-brand-royal text-white shadow-lg shadow-brand-royal/20"
                        : "bg-white border border-slate-200 text-slate-600 hover:border-brand-royal hover:text-brand-royal"
                    }`}
                  >
                    {cls}
                    {counts[String(cls)] !== undefined && (
                      <span className={`block text-[10px] font-normal mt-0.5 ${
                        selectedClass === cls ? "text-white/60" : "text-slate-400"
                      }`}>
                        {formatCount(counts[String(cls)])}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Subject Selection */}
          {selectedClass && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                Select Subject{" "}
                <span className="text-sm text-slate-400 font-normal">for Class {selectedClass}</span>
              </h2>
              {loading.subjects ? (
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="h-4 w-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                  Loading subjects...
                </div>
              ) : subjects.length === 0 ? (
                <p className="text-slate-500">No subjects available for this class.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {subjects.map((subj) => (
                    <button
                      key={subj}
                      onClick={() => {
                        setSelectedSubject(subj);
                        setSelectedChapters(new Set());
                      }}
                      className={`p-4 rounded-xl text-left transition-all ${
                        selectedSubject === subj
                          ? "bg-brand-royal text-white shadow-lg shadow-brand-royal/20"
                          : "bg-white border border-slate-200 text-slate-700 hover:border-brand-royal"
                      }`}
                    >
                      <BookOpen
                        className={`h-5 w-5 mb-2 ${
                          selectedSubject === subj ? "text-white" : "text-brand-royal"
                        }`}
                      />
                      <span className="font-semibold text-sm">{subj}</span>
                      {counts[subj] !== undefined && (
                        <span className={`block text-xs mt-0.5 ${
                          selectedSubject === subj ? "text-white/60" : "text-slate-400"
                        }`}>
                          {formatCount(counts[subj])}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Chapter Selection */}
          {selectedSubject && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                Select Chapters{" "}
                <span className="text-sm text-slate-400 font-normal">
                  {selectedChapters.size > 0 ? `(${selectedChapters.size} selected)` : "(choose at least one)"}
                </span>
              </h2>
              {loading.chapters ? (
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="h-4 w-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                  Loading chapters...
                </div>
              ) : chapters.length === 0 ? (
                <p className="text-slate-500">No chapters found for this subject.</p>
              ) : (
                <>
                  {/* Select All toggle */}
                  <button
                    onClick={toggleAllChapters}
                    className="mb-3 flex items-center gap-2 text-sm font-medium text-brand-royal hover:text-brand-navy transition-colors"
                  >
                    <CheckSquare className="h-4 w-4" />
                    {selectedChapters.size === chapters.length ? "Deselect All" : "Select All"}
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                    {chapters.map((ch) => {
                      const isSelected = selectedChapters.has(ch);
                      return (
                        <button
                          key={ch}
                          onClick={() => toggleChapter(ch)}
                          className={`flex items-start gap-3 p-3 rounded-xl text-left transition-all text-sm ${
                            isSelected
                              ? "bg-brand-royal/10 border border-brand-royal text-brand-royal"
                              : "bg-white border border-slate-200 text-slate-600 hover:border-brand-royal/50"
                          }`}
                        >
                          <div
                            className={`flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors ${
                              isSelected
                                ? "bg-brand-royal border-brand-royal"
                                : "border-slate-300"
                            }`}
                          >
                            {isSelected && (
                              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`font-medium ${isSelected ? "text-brand-royal" : "text-slate-700"}`}>
                              {ch}
                            </span>
                            {counts[ch] !== undefined && (
                              <span className="block text-xs text-slate-400 mt-0.5">
                                {formatCount(counts[ch])}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Step 4: Start Test */}
          {selectedChapters.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200 p-6"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-semibold text-slate-800">Ready to Begin</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {board} — Class {selectedClass} — {selectedSubject}
                  </p>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {selectedChapters.size} chapter{selectedChapters.size !== 1 ? "s" : ""} selected
                  </p>
                </div>
                <button
                  onClick={handleStartTest}
                  className="flex items-center gap-2 px-6 py-3 bg-brand-gradient-static text-white rounded-xl font-semibold hover:opacity-90 transition-all"
                >
                  Start Test <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
