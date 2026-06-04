"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, GraduationCap, School, ArrowRight, CheckCircle } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

const boards = [
  {
    name: "CBSE",
    slug: "cbse",
    description: "Central Board of Secondary Education — India's most widely adopted national board.",
    classes: "Class 1-10",
    subjects: "Math, Science, English, Social Science, Hindi",
    solutions: "15,000+ Solutions",
    gradient: "from-brand-navy to-brand-royal",
  },
  {
    name: "ICSE",
    slug: "icse",
    description: "Indian Certificate of Secondary Education — Known for its comprehensive and rigorous curriculum.",
    classes: "Class 1-10",
    subjects: "Math, Physics, Chemistry, Biology, English, History",
    solutions: "10,000+ Solutions",
    gradient: "from-brand-royal to-brand-electric",
  },
  {
    name: "Maharashtra Board",
    slug: "maharashtra-board",
    description: "Maharashtra State Board of Secondary and Higher Secondary Education.",
    classes: "Class 1-10",
    subjects: "Math, Science, Social Science, Languages",
    solutions: "5,000+ Solutions",
    gradient: "from-brand-electric to-brand-sky",
  },
];

export function BoardSelector() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <SectionHeader
          badge="Academic Solutions Hub"
          title="Find Solutions for Your Board"
          description="Free textbook solutions, important questions, and previous year papers for all major Indian boards."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {boards.map((board, i) => (
            <motion.div
              key={board.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.15 }}
            >
              <Link href={`/academic/${board.slug}`} className="block h-full">
                <div className="premium-card p-8 h-full flex flex-col group">
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${board.gradient} flex items-center justify-center mb-5 shadow-lg shadow-brand-royal/20 group-hover:scale-110 transition-transform duration-300`}>
                    {i === 0 ? <School className="h-7 w-7 text-white" /> : i === 1 ? <BookOpen className="h-7 w-7 text-white" /> : <GraduationCap className="h-7 w-7 text-white" />}
                  </div>
                  <h3 className="heading-section text-2xl mb-2">{board.name}</h3>
                  <p className="text-sm text-neutral-mediumGray mb-5 flex-1">{board.description}</p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-neutral-darkGray">
                      <CheckCircle className="h-4 w-4 text-brand-electric flex-shrink-0" />
                      {board.classes}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-darkGray">
                      <CheckCircle className="h-4 w-4 text-brand-electric flex-shrink-0" />
                      {board.subjects}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-darkGray">
                      <CheckCircle className="h-4 w-4 text-brand-electric flex-shrink-0" />
                      {board.solutions}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 text-brand-royal font-semibold group-hover:gap-3 transition-all">
                    View Solutions <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
