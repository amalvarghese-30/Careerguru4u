"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";

export function CTASection() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-brand-bg">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center relative">
          {/* Decorative elements */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-brand-navy/3 via-brand-royal/3 to-brand-electric/3 blur-3xl -z-10"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="h-20 w-20 rounded-3xl bg-brand-gradient-static flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-brand-royal/20">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-sora font-extrabold text-brand-navy mb-5 tracking-tight"
          >
            Ready to Build Your Future?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-neutral-mediumGray mb-10 max-w-2xl mx-auto"
          >
            Join 2,00,000+ students who are already using Career Guru for free textbook solutions, career guidance, and college admissions support.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/academic"
              className="btn-primary inline-flex items-center gap-2 text-lg px-10 py-5 rounded-2xl"
            >
              Start Learning Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/register"
              className="btn-outline inline-flex items-center gap-2 text-lg px-10 py-5 rounded-2xl border-2"
            >
              Create Free Account
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-neutral-mediumGray/60 text-sm mt-6"
          >
            No credit card required. Start free, stay free.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
