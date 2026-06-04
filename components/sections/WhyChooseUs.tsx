"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Globe, Sparkles, Headphones, Compass } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

const features = [
  {
    icon: Shield,
    title: "100% Free Solutions",
    description: "First 2 solutions free per chapter. No hidden charges, no credit card required.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Compass,
    title: "Career Roadmaps",
    description: "Visual career pathways with salary projections and growth outlook for every stream.",
    color: "from-brand-royal to-brand-electric",
  },
  {
    icon: Globe,
    title: "College Database",
    description: "5,000+ colleges across India with detailed profiles, fees, placements, and reviews.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Zap,
    title: "Scholarship Updates",
    description: "Stay updated with the latest scholarships, deadlines, and eligibility criteria.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Guidance",
    description: "Smart career matching, salary predictions, and personalized roadmaps using AI.",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: Headphones,
    title: "Expert Counselling",
    description: "Free 30-minute sessions with certified career counsellors to guide your decisions.",
    color: "from-rose-500 to-red-500",
  },
];

export function WhyChooseUs() {
  return (
    <section className="section-padding bg-brand-bg">
      <div className="container-custom">
        <SectionHeader
          badge="Why Students Choose Us"
          title="Built for Student Success"
          description="Everything you need to go from confused to confident — completely free."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="glass-card p-6 h-full group">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="heading-card text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-mediumGray leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
