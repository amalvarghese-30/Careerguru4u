"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Compass, GraduationCap, ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

const pillars = [
  {
    icon: BookOpen,
    title: "Academic Success",
    subtitle: "Class 1-10 Textbook Solutions",
    description: "Free step-by-step solutions for CBSE, ICSE, and Maharashtra Board. Important questions, previous year papers, and sample papers — all in one place.",
    features: ["30,000+ Solutions", "3 Major Boards", "All Classes 1-10"],
    href: "/academic",
    gradient: "from-brand-navy to-brand-royal",
  },
  {
    icon: Compass,
    title: "Career Planning",
    subtitle: "Stream Selection & Guidance",
    description: "Confused after 10th? Explore all career paths, compare streams, use our AI career matching tools, and get expert guidance to make the right choice.",
    features: ["Interactive Flowchart", "AI Career Match", "Expert Counselling"],
    href: "/career-guidance",
    gradient: "from-brand-royal to-brand-electric",
  },
  {
    icon: GraduationCap,
    title: "College Admissions",
    subtitle: "Find & Compare Colleges",
    description: "Discover top UG and PG colleges across India. Compare fees, placements, courses, and ratings. Get admission guidance and scholarship information.",
    features: ["5,000+ Colleges", "Side-by-Side Compare", "Scholarship Updates"],
    href: "/universities",
    gradient: "from-brand-electric to-brand-sky",
  },
];

export function ThreePillars() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <SectionHeader
          badge="What is CareerGuru4U"
          title="Your Complete Education Ecosystem"
          description="Three powerful pillars working together to guide you from the classroom to your dream career."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.15 }}
            >
              <div className="premium-card p-8 h-full flex flex-col">
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center mb-6 shadow-lg shadow-brand-royal/20`}>
                  <pillar.icon className="h-8 w-8 text-white" />
                </div>
                <p className="text-sm font-semibold text-brand-royal mb-1">{pillar.subtitle}</p>
                <h3 className="heading-section text-2xl md:text-3xl mb-4">{pillar.title}</h3>
                <p className="text-neutral-mediumGray leading-relaxed mb-6 flex-1">{pillar.description}</p>
                <ul className="space-y-2 mb-6">
                  {pillar.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-neutral-darkGray">
                      <div className="h-1.5 w-1.5 rounded-full bg-brand-electric flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={pillar.href}
                  className="inline-flex items-center gap-2 text-brand-royal font-semibold hover:gap-3 transition-all group"
                >
                  Explore {pillar.title} <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
