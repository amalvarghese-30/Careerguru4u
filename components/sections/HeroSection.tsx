"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Compass, GraduationCap, Sparkles, Star, Users } from "lucide-react";
import Link from "next/link";

const floatingCards = [
  { icon: BookOpen, label: "CBSE Solutions", color: "from-blue-500 to-blue-600", delay: 0 },
  { icon: GraduationCap, label: "ICSE Solutions", color: "from-indigo-500 to-indigo-600", delay: 1.5 },
  { icon: Compass, label: "Career Match", color: "from-sky-500 to-cyan-500", delay: 3 },
  { icon: Star, label: "Top Colleges", color: "from-amber-500 to-orange-500", delay: 4.5 },
];

const trustBadges = [
  { value: "1,00,000+", label: "Solutions" },
  { value: "3", label: "Boards" },
  { value: "5,000+", label: "Colleges" },
  { value: "2,00,000+", label: "Students" },
];

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
    const maxParticles = 30;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.06 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-brand-gradient pt-20">
      {/* Particle Background */}
      <div className="absolute inset-0 pointer-events-none">
        <ParticleField />
      </div>

      {/* Animated Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-blue-400/10 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-cyan-400/10 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-sky-400/8 blur-3xl"
        />
      </div>

      {/* Floating Cards */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block">
        {floatingCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: card.delay * 0.2, duration: 0.6 }}
            className="absolute"
            style={{
              top: `${20 + (i % 2) * 35}%`,
              left: i < 2 ? `${5 + i * 2}%` : "auto",
              right: i >= 2 ? `${5 + (i - 2) * 2}%` : "auto",
            }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg"
            >
              <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-white/90 text-sm font-medium whitespace-nowrap">{card.label}</span>
            </motion.div>
          </motion.div>
        ))}
      </div>

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
            >
              <Sparkles className="h-4 w-4 text-brand-sky" />
              <span className="text-white/90 text-sm font-medium">India&apos;s Most Trusted Education Platform</span>
            </motion.div>

            {/* Headline */}
            <h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl font-sora font-extrabold tracking-tighter leading-[1.05] mb-6"
            >
              <span className="text-white">Your Complete</span>
              <br />
              <span className="bg-gradient-to-r from-brand-sky via-white to-brand-sky bg-clip-text text-transparent">
                Academic & Career
              </span>
              <br />
              <span className="text-white">Success Platform</span>
            </h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-white/70 text-base md:text-lg max-w-xl lg:max-w-none mb-8 leading-relaxed"
            >
              Free textbook solutions, career guidance, stream selection, college discovery, AI career tools, and admission counselling — <span className="text-white/90 font-medium">everything in one place.</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 mb-10"
            >
              <Link
                href="/academic"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-navy rounded-xl font-semibold text-lg hover:bg-brand-bg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
              >
                Explore Solutions
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/career-guidance"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-white/30 text-white rounded-xl font-semibold text-lg hover:bg-white/10 hover:border-white/50 transition-all backdrop-blur-sm"
              >
                Get Career Guidance
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-6 md:gap-8 pt-8 border-t border-white/15"
            >
              {trustBadges.map((badge) => (
                <div key={badge.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">{badge.value}</div>
                  <div className="text-xs text-white/50 mt-0.5">{badge.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full max-w-lg">
              {/* Main illustration area */}
              <div className="relative rounded-3xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 p-8">
                {/* Abstract Education Illustration */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="col-span-2 h-32 rounded-2xl bg-gradient-to-br from-white/15 to-white/5 border border-white/10 flex items-center justify-center"
                    >
                      <Users className="h-12 w-12 text-white/30" />
                    </motion.div>
                    <motion.div
                      animate={{ y: [0, 6, 0] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                      className="h-32 rounded-2xl bg-gradient-to-br from-brand-royal/40 to-brand-electric/30 border border-white/10 flex items-center justify-center"
                    >
                      <GraduationCap className="h-10 w-10 text-white/40" />
                    </motion.div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.div
                      animate={{ y: [0, 4, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="h-24 rounded-2xl bg-gradient-to-br from-brand-electric/30 to-brand-sky/20 border border-white/10 flex items-center justify-center"
                    >
                      <BookOpen className="h-10 w-10 text-white/40" />
                    </motion.div>
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
                      className="h-24 rounded-2xl bg-gradient-to-br from-white/15 to-white/5 border border-white/10 flex items-center justify-center"
                    >
                      <Compass className="h-10 w-10 text-white/30" />
                    </motion.div>
                  </div>
                </div>

                {/* Glow effect behind */}
                <div className="absolute -inset-4 bg-gradient-to-br from-brand-royal/20 via-brand-electric/10 to-brand-sky/5 blur-2xl rounded-3xl -z-10" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120V60C240 20 480 0 720 0C960 0 1200 20 1440 60V120H0Z" fill="#F7FAFF" fillOpacity="0.06" />
          <path d="M0 120V90C240 50 480 40 720 40C960 40 1200 50 1440 90V120H0Z" fill="#F7FAFF" fillOpacity="0.04" />
        </svg>
      </div>
    </section>
  );
}
