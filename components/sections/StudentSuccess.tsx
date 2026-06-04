"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

const testimonials = [
  {
    name: "Rahul Sharma",
    role: "IIT Bombay — Computer Science",
    content: "Career Guru helped me find the right study materials and guided me through JEE preparation. The textbook solutions were a lifesaver during my board exams!",
    rating: 5,
    board: "CBSE",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    name: "Priya Patel",
    role: "IIM Ahmedabad — MBA",
    content: "The career guidance flowchart showed me the path to MBA. Now I'm working at one of the top consulting firms in India. Thank you Career Guru!",
    rating: 5,
    board: "Maharashtra Board",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    name: "Amit Kumar",
    role: "Software Engineer at Google",
    content: "From CBSE solutions to college admissions, Career Guru was with me every step of the way. The college comparison tool was incredibly helpful.",
    rating: 5,
    board: "CBSE",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
  },
];

export function StudentSuccess() {
  return (
    <section className="section-padding bg-brand-bg">
      <div className="container-custom">
        <SectionHeader
          badge="Success Stories"
          title="Students Who Made It"
          description="Join thousands of students who achieved their dreams with Career Guru."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="premium-card p-6 h-full flex flex-col">
                <Quote className="h-8 w-8 text-brand-royal/15 mb-4" />
                <p className="text-neutral-darkGray text-sm leading-relaxed mb-5 flex-1">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-neutral-lightGray">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-neutral-lightGray flex-shrink-0">
                    <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-nearBlack text-sm">{t.name}</p>
                    <p className="text-xs text-neutral-mediumGray">{t.role}</p>
                    <p className="text-xs text-brand-royal mt-0.5">{t.board}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
