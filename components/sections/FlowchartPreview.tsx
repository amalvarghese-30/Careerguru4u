"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

export function FlowchartPreview() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <span className="text-sm font-semibold text-brand-royal uppercase tracking-wider">Interactive Career Flowchart</span>
            <h2 className="heading-section text-3xl md:text-4xl lg:text-5xl mt-3 mb-5">
              Visualize Your Career Journey
            </h2>
            <p className="text-neutral-mediumGray text-lg mb-6 leading-relaxed">
              Explore 100+ career paths across 6 streams. Click through the interactive decision tree to discover degrees, specializations, salaries, entrance exams, and top colleges.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Complete career branches for every stream — Science, Commerce, Arts, Diploma, ITI, Vocational",
                "Salary ranges and growth projections at every level",
                "Required qualifications, entrance exams, and top colleges",
                "Search, zoom, and pan to navigate 100+ career nodes",
              ].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="h-6 w-6 rounded-full bg-brand-royal/10 flex items-center justify-center flex-shrink-0">
                    <div className="h-1.5 w-1.5 rounded-full bg-brand-royal" />
                  </div>
                  <span className="text-neutral-darkGray">{item}</span>
                </motion.li>
              ))}
            </ul>
            <Link
              href="/career-guidance/flowchart"
              className="btn-primary inline-flex items-center gap-2"
            >
              Launch Interactive Flowchart <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="premium-card p-6 md:p-8">
              <div className="text-center mb-6">
                <div className="inline-block px-5 py-2.5 rounded-full bg-brand-gradient-static text-white text-sm font-semibold shadow-lg">
                  10th Pass
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                {[
                  {
                    stream: "Science",
                    branches: ["PCM → Engineering", "PCB → Medical", "PCMB → Research"],
                  },
                  {
                    stream: "Commerce",
                    branches: ["B.Com → CA/CFA", "BBA → MBA", "Economics → Analytics"],
                  },
                  {
                    stream: "Arts",
                    branches: ["UPSC/Civil Services", "Psychology", "Design & Media"],
                  },
                  {
                    stream: "Vocational",
                    branches: ["ITI → Technician", "Polytechnic", "Nursing"],
                  },
                ].map((item) => (
                  <div key={item.stream} className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-brand-bg border border-brand-royal/10 text-center text-sm font-semibold text-brand-navy">
                      {item.stream}
                    </div>
                    <div className="pl-2 space-y-1.5 border-l-2 border-brand-electric/30">
                      {item.branches.map((b) => (
                        <div key={b} className="p-2 rounded-lg bg-white text-xs text-neutral-darkGray border border-neutral-lightGray">
                          {b}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center mt-6 text-sm text-brand-electric font-medium">
                Click to explore 100+ career paths →
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
