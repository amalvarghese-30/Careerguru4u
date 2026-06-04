"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FlaskConical, ChartBar, Palette, Wrench, ArrowRight, TrendingUp, IndianRupee, GraduationCap } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

const streams = [
  {
    name: "Science",
    icon: FlaskConical,
    careers: "Engineering, Medical, Research, Data Science, Biotechnology",
    salary: "₹4L - ₹50L+",
    scope: "Very High",
    color: "from-brand-navy to-brand-royal",
    iconBg: "from-blue-600 to-blue-400",
    href: "/career-guidance/after-10th/science",
  },
  {
    name: "Commerce",
    icon: ChartBar,
    careers: "CA, Finance, Banking, Business, Analytics, Economics",
    salary: "₹3L - ₹40L+",
    scope: "High",
    color: "from-brand-royal to-brand-electric",
    iconBg: "from-indigo-600 to-indigo-400",
    href: "/career-guidance/after-10th/commerce",
  },
  {
    name: "Arts/Humanities",
    icon: Palette,
    careers: "Design, Law, Journalism, Psychology, Civil Services",
    salary: "₹3L - ₹30L+",
    scope: "High",
    color: "from-brand-electric to-brand-sky",
    iconBg: "from-purple-600 to-purple-400",
    href: "/career-guidance/after-10th/arts-humanities",
  },
  {
    name: "Vocational",
    icon: Wrench,
    careers: "ITI, Diploma, Skilled Trades, Entrepreneurship",
    salary: "₹2L - ₹20L+",
    scope: "Moderate",
    color: "from-amber-500 to-orange-500",
    iconBg: "from-amber-600 to-amber-400",
    href: "/career-guidance/after-10th/vocational",
  },
];

export function StreamSelectorPreview() {
  return (
    <section className="section-padding bg-brand-bg">
      <div className="container-custom">
        <SectionHeader
          badge="Career Guidance"
          title="What After 10th?"
          description="Explore all four streams, compare career options, salaries, and future scope to make an informed decision."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {streams.map((stream, i) => (
            <motion.div
              key={stream.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={stream.href} className="block h-full">
                <div className="premium-card p-6 h-full flex flex-col group">
                  <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${stream.iconBg} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <stream.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="heading-card text-xl mb-3">{stream.name}</h3>
                  <p className="text-sm text-neutral-mediumGray mb-4 flex-1">{stream.careers}</p>
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-sm">
                      <IndianRupee className="h-4 w-4 text-brand-electric" />
                      <span className="font-semibold text-brand-navy">{stream.salary}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-brand-electric" />
                      <span className="text-neutral-darkGray">Scope: </span>
                      <span className="font-semibold text-green-600">{stream.scope}</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 text-brand-royal font-semibold text-sm group-hover:gap-3 transition-all">
                    Explore <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link
            href="/career-guidance/after-10th"
            className="btn-primary inline-flex items-center gap-2 text-lg"
          >
            Compare All Streams <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
