"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, ExternalLink, Download, FileText, Shield, AlertTriangle, Search } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface Textbook {
  _id: string;
  title: string;
  board: string;
  class: number;
  subject: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  downloads: number;
  createdAt: string;
  // eBalbharati-specific fields
  medium?: string;
  variant?: number;
  code?: string;
  officialUrl?: string;
  directPdfUrl?: string;
  isOfficial?: boolean;
  sizeMB?: number;
}

export function MaharashtraTextbooks() {
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterMedium, setFilterMedium] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTextbooks();
  }, []);

  const fetchTextbooks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/public/textbooks?board=Maharashtra%20Board");
      const data = await res.json();
      if (data.textbooks) {
        setTextbooks(data.textbooks);
      }
    } catch (err) {
      console.error("Failed to fetch textbooks:", err);
    } finally {
      setLoading(false);
    }
  };

  const classes = [...new Set(textbooks.map(t => t.class))].sort((a, b) => a - b);
  const mediums = [...new Set(textbooks.map(t => t.medium).filter(Boolean))];

  const filteredBooks = textbooks.filter(t => {
    const classMatch = filterClass === "all" || t.class === parseInt(filterClass);
    const mediumMatch = filterMedium === "all" || t.medium === filterMedium;
    const searchMatch = searchQuery === "" ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase());
    return classMatch && mediumMatch && searchMatch;
  });

  const groupedByClass = filteredBooks.reduce((acc, book) => {
    if (!acc[book.class]) acc[book.class] = [];
    acc[book.class].push(book);
    return acc;
  }, {} as Record<number, Textbook[]>);

  const totalSize = textbooks.reduce((sum, t) => sum + (t.sizeMB || 0), 0);
  const totalBooks = textbooks.length;

  return (
    <section className="pt-20 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-600/90 via-emerald-700 to-teal-800 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="container-custom relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-6">
                <Shield className="h-4 w-4 text-white" />
                <span className="text-sm font-medium text-white">Official eBalbharati Sources</span>
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            >
              Maharashtra State Board
              <br />
              <span className="text-emerald-100">Textbooks</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-emerald-100/90 text-lg md:text-xl max-w-2xl mx-auto mb-8"
            >
              Access official {totalBooks} PDF textbooks from Classes 1–12 (Marathi & English medium)
              directly from Balbharati's eBalbharati portal. All links point to official sources.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-6 text-sm text-emerald-100/80"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{totalBooks} Textbooks</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>{totalSize.toFixed(1)} MB Total</span>
              </div>
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                <span>Official Links Only</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="container-custom py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-amber-800 mb-2">Copyright & Usage Notice</h4>
              <p className="text-sm text-amber-700 mb-3">
                eBalbharati content is copyrighted by the Maharashtra State Bureau of Textbook Production
                and Curriculum Research (Balbharati). Their <a href="https://services.ebalbharati.in/copyright/"
                  target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-900">copyright policy (revised 26-10-2020)</a>
                requires a license (INR 10,000 + GST/year) for commercial use.
              </p>
              <ul className="text-sm text-amber-700 space-y-1 pl-4 list-disc">
                <li><strong>Educational institutes/schools:</strong> Exempt for teaching/learning purposes</li>
                <li><strong>This component:</strong> Only links to official eBalbharati pages — does NOT host PDFs</li>
                <li><strong>Direct PDF links:</strong> Provided for reference; always prefer the official portal</li>
                <li><strong>Commercial hosting:</strong> Requires written permission from Balbharati</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="container-custom pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl border border-slate-200 p-6"
        >
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search subjects (e.g., Mathematics, Marathi)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 min-w-[160px]"
            >
              <option value="all">All Classes</option>
              {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
            <select
              value={filterMedium}
              onChange={(e) => setFilterMedium(e.target.value)}
              className="px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 min-w-[160px]"
            >
              <option value="all">All Mediums</option>
              {mediums.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          {loading ? (
            <div className="text-sm text-slate-500">Loading textbooks...</div>
          ) : (
            <div className="text-sm text-slate-500">
              Showing <strong>{filteredBooks.length}</strong> of <strong>{totalBooks}</strong> textbooks
            </div>
          )}
        </motion.div>
      </div>

      {/* Textbook Grid by Class */}
      <div className="container-custom pb-20">
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="space-y-4"
              >
                <div className="h-8 bg-slate-200 rounded-xl w-48 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-64 bg-slate-100 rounded-2xl border border-slate-200 animate-pulse" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : Object.keys(groupedByClass).length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-2xl border border-slate-200"
          >
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No textbooks match your filters</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
          </motion.div>
        ) : (
          Object.entries(groupedByClass)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([classNum, books], classIndex) => (
              <motion.section
                key={classNum}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: classIndex * 0.08 }}
                className="py-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <span className="text-xl font-bold text-emerald-600">{classNum}</span>
                  </div>
                  <h2 className="heading-section text-2xl md:text-3xl">Class {classNum}</h2>
                  <span className="ml-auto text-sm px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                    {books.length} textbooks
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {books.map((book, bookIndex) => (
                    <motion.div
                      key={book._id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: bookIndex * 0.04 }}
                    >
                      <TextbookCard book={book} />
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            ))
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-slate-900 py-16">
        <div className="container-custom text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Need More Textbooks?</h3>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Visit the official eBalbharati portal for the complete catalog including Science, History,
            Geography, Sanskrit, Hindi, and other subjects across all classes.
          </p>
          <a
            href="https://books.ebalbharati.in/ebook.aspx"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors"
          >
            <ExternalLink className="h-5 w-5" />
            Visit Official eBalbharati Portal
          </a>
        </div>
      </div>
    </section>
  );
}

function TextbookCard({ book }: { book: Textbook }) {
  const formatSize = (mb: number) => mb >= 1 ? `${mb.toFixed(1)} MB` : `${(mb * 1024).toFixed(0)} KB`;

  const displaySize = book.sizeMB || (book.fileSize ? book.fileSize / (1024 * 1024) : 0);
  const pdfUrl = book.directPdfUrl || book.fileUrl;

  return (
    <GlassCard hover className="group p-5 h-full flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          book.isOfficial ? "bg-emerald-100" : "bg-emerald-100"
        }`}>
          {book.isOfficial ? (
            <Shield className="h-5 w-5 text-emerald-600" />
          ) : (
            <BookOpen className="h-5 w-5 text-emerald-600" />
          )}
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium">
          {book.medium || "Marathi"}
        </span>
      </div>

      <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-emerald-600 transition-colors">
        {book.title || book.subject}
      </h3>

      <p className="text-xs text-slate-500 mb-3 flex-1">
        {book.code ? `Code: ${book.code}${book.variant && book.variant !== 1 ? ` (v${book.variant})` : ""}` : book.subject}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <FileText className="h-3 w-3" />
          {formatSize(displaySize)}
        </span>
        <div className="flex items-center gap-2">
          {book.officialUrl && (
            <a
              href={book.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
              title="View on eBalbharati"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
              title="Direct PDF (if available)"
            >
              <Download className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </GlassCard>
  );
}