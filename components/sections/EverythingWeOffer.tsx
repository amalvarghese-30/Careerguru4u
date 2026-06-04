"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, HelpCircle, FileText, ClipboardList, Compass, Target, Brain, Search, GitCompare, Award, PhoneCall, LayoutDashboard, ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

const bentoItems = [
  {
    title: "Textbook Solutions",
    description: "Step-by-step solutions for all subjects",
    icon: BookOpen,
    href: "/academic",
    size: "md",
    gradient: "from-brand-navy to-brand-royal",
  },
  {
    title: "Important Questions",
    description: "Curated by expert teachers",
    icon: HelpCircle,
    href: "/academic/important-questions",
    size: "sm",
    gradient: "from-brand-royal to-brand-electric",
  },
  {
    title: "Previous Year Papers",
    description: "10 years of board exam papers",
    icon: FileText,
    href: "/academic/pyqs",
    size: "sm",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    title: "Sample Papers",
    description: "Practice with latest patterns",
    icon: ClipboardList,
    href: "/academic/sample-papers",
    size: "sm",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Career Guidance",
    description: "Explore all paths after 10th",
    icon: Compass,
    href: "/career-guidance",
    size: "lg",
    gradient: "from-brand-electric to-brand-sky",
  },
  {
    title: "Stream Selection",
    description: "Science, Commerce, Arts, Vocational",
    icon: Target,
    href: "/career-guidance/after-10th",
    size: "sm",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "AI Career Match",
    description: "Find your ideal career with AI",
    icon: Brain,
    href: "/ai-tools/career-match",
    size: "md",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    title: "College Search",
    description: "5,000+ colleges in one place",
    icon: Search,
    href: "/universities",
    size: "md",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    title: "College Comparison",
    description: "Compare fees, placements & more",
    icon: GitCompare,
    href: "/compare",
    size: "sm",
    gradient: "from-rose-500 to-red-500",
  },
  {
    title: "Scholarships",
    description: "Never miss a scholarship deadline",
    icon: Award,
    href: "/scholarships",
    size: "sm",
    gradient: "from-teal-500 to-green-500",
  },
  {
    title: "Admission Counselling",
    description: "Free expert guidance sessions",
    icon: PhoneCall,
    href: "/counselling",
    size: "sm",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    title: "Student Dashboard",
    description: "Track your progress & bookmarks",
    icon: LayoutDashboard,
    href: "/dashboard",
    size: "sm",
    gradient: "from-brand-navy to-brand-electric",
  },
];

const sizeClasses: Record<string, string> = {
  sm: "col-span-1",
  md: "col-span-1 md:col-span-2",
  lg: "col-span-1 md:col-span-2 lg:col-span-3",
};

export function EverythingWeOffer() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <SectionHeader
          badge="Everything We Offer"
          title="12 Powerful Tools in One Platform"
          description="From textbook solutions to career planning — we have everything a student needs."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {bentoItems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.05 }}
              className={sizeClasses[item.size]}
            >
              <Link href={item.href} className="block h-full">
                <div className="glass-card p-5 md:p-6 h-full group flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="heading-card text-base md:text-lg">{item.title}</h3>
                    <p className="text-sm text-neutral-mediumGray mt-0.5">{item.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-neutral-mediumGray group-hover:text-brand-royal group-hover:translate-x-1 transition-all ml-auto flex-shrink-0 hidden sm:block" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
