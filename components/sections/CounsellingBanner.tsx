"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { PhoneCall, ArrowRight, Sparkles } from "lucide-react";

export function CounsellingBanner() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-brand-gradient-static" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-electric/10 blur-3xl motion-safe:animate-spin-slow" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-brand-sky/10 blur-3xl motion-safe:animate-spin-reverse-slow" />

      <div className="container-custom relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4 text-brand-sky" />
            Free 30-Minute Session
          </span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-sora font-bold text-white mb-5"
        >
          Still Confused About Your Future?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-8"
        >
          Talk to our expert counsellors for free. Get personalized guidance on streams, careers, and college admissions.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/counselling"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-navy rounded-xl font-semibold text-lg hover:bg-brand-bg transition-all shadow-xl hover:shadow-2xl"
          >
            <PhoneCall className="h-5 w-5" />
            Book Free Counselling
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-white/30 text-white rounded-xl font-semibold text-lg hover:bg-white/10 hover:border-white/50 transition-all backdrop-blur-sm"
          >
            Chat on WhatsApp
          </a>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
          className="text-white/40 text-sm mt-6"
        >
          1,000+ students counselled. 100% free. No credit card required.
        </motion.p>
      </div>
    </section>
  );
}
