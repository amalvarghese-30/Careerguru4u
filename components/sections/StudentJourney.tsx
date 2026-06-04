"use client";

import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Compass, Target, Building, Trophy } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

const steps = [
  {
    step: "01",
    title: "Class 1-10",
    description: "Build strong academic foundations with free textbook solutions and practice materials.",
    icon: BookOpen,
    color: "from-brand-navy to-brand-royal",
  },
  {
    step: "02",
    title: "Academic Success",
    description: "Master your subjects with important questions, PYQs, and sample papers.",
    icon: GraduationCap,
    color: "from-brand-royal to-brand-electric",
  },
  {
    step: "03",
    title: "Choose Stream",
    description: "Use our interactive tools to select the right stream after 10th based on your interests.",
    icon: Compass,
    color: "from-brand-electric to-brand-sky",
  },
  {
    step: "04",
    title: "Choose Career",
    description: "Explore career paths, salary projections, and growth outlooks with AI-powered guidance.",
    icon: Target,
    color: "from-purple-500 to-pink-500",
  },
  {
    step: "05",
    title: "Choose College",
    description: "Compare top colleges, check placements, and find the perfect fit for your career path.",
    icon: Building,
    color: "from-amber-500 to-orange-500",
  },
  {
    step: "06",
    title: "Get Admission",
    description: "Get expert counselling, scholarship guidance, and complete admission support.",
    icon: Trophy,
    color: "from-emerald-500 to-teal-500",
  },
];

export function StudentJourney() {
  return (
    <section className="section-padding bg-brand-bg">
      <div className="container-custom">
        <SectionHeader
          badge="Your Journey"
          title="From Classroom to Career"
          description="A clear, step-by-step path that takes you from school to your dream profession."
        />

        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-navy via-brand-electric to-brand-sky md:-translate-x-px hidden md:block" />

          <div className="space-y-8 md:space-y-12">
            {steps.map((step, i) => {
              const isEven = i % 2 === 0;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={`flex items-start gap-6 md:gap-8 ${
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Content */}
                  <div className={`flex-1 ${isEven ? "md:text-right" : "md:text-left"}`}>
                    <div className="glass-card p-5 md:p-6 inline-block text-left">
                      <span className="text-xs font-bold text-brand-electric tracking-wider">{step.step}</span>
                      <h3 className="heading-card text-lg mt-1 mb-2">{step.title}</h3>
                      <p className="text-sm text-neutral-mediumGray leading-relaxed max-w-xs">{step.description}</p>
                    </div>
                  </div>

                  {/* Center Icon */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-xl shadow-brand-royal/20`}>
                      <step.icon className="h-7 w-7 text-white" />
                    </div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
