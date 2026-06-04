"use client";

import { motion } from "framer-motion";

interface SectionHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  className?: string;
  light?: boolean;
}

export function SectionHeader({ badge, title, description, className = "", light = false }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className={`text-center max-w-3xl mx-auto mb-12 md:mb-16 ${className}`}
    >
      {badge && (
        <span className={`inline-block text-sm font-semibold uppercase tracking-wider mb-3 px-4 py-1.5 rounded-full ${
          light
            ? "bg-white/15 text-white/90 backdrop-blur-sm"
            : "bg-primary-50 text-primary-600"
        }`}>
          {badge}
        </span>
      )}
      <h2 className={`heading-section text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight mb-4 ${
        light ? "text-white" : ""
      }`}>
        {title}
      </h2>
      {description && (
        <p className={`text-base md:text-lg max-w-2xl mx-auto ${
          light ? "text-white/70" : "text-neutral-mediumGray"
        }`}>
          {description}
        </p>
      )}
    </motion.div>
  );
}
