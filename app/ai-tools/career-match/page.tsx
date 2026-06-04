"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, Heart, RefreshCw, IndianRupee, TrendingUp } from "lucide-react";
import { getCareerById } from "@/lib/careers-data";
import type { CareerData } from "@/lib/careers-data";

const questions = [
  {
    q: "What excites you most about work?",
    options: [
      { text: "Building and creating things", tags: ["engineering", "tech", "design"] },
      { text: "Helping and healing people", tags: ["healthcare", "social", "education"] },
      { text: "Analyzing data and solving puzzles", tags: ["analytics", "finance", "research"] },
      { text: "Leading teams and making deals", tags: ["business", "management", "law"] },
    ],
  },
  {
    q: "How do you prefer to spend your work day?",
    options: [
      { text: "At a computer, writing code or designing", tags: ["tech", "design", "analytics"] },
      { text: "In meetings, presenting and persuading", tags: ["business", "management", "law"] },
      { text: "With patients, students, or clients", tags: ["healthcare", "social", "education"] },
      { text: "Hands-on, building or operating equipment", tags: ["engineering", "skilled-trades", "healthcare"] },
    ],
  },
  {
    q: "What kind of impact do you want to make?",
    options: [
      { text: "Transform industries through technology", tags: ["tech", "engineering", "design"] },
      { text: "Improve people's health and well-being", tags: ["healthcare", "social", "education"] },
      { text: "Grow businesses and create wealth", tags: ["business", "finance", "management"] },
      { text: "Shape policy and serve the public", tags: ["law", "social", "management"] },
    ],
  },
  {
    q: "How do you handle pressure and deadlines?",
    options: [
      { text: "I thrive under pressure — it brings out my best", tags: ["business", "finance", "law"] },
      { text: "I manage well but prefer structured timelines", tags: ["engineering", "analytics", "management"] },
      { text: "I stay calm and methodical under any situation", tags: ["healthcare", "research", "social"] },
      { text: "I prefer steady, predictable work", tags: ["skilled-trades", "education", "design"] },
    ],
  },
  {
    q: "How important is money versus job satisfaction?",
    options: [
      { text: "Money is the top priority — I want to maximize earnings", tags: ["finance", "business", "tech"] },
      { text: "Both equally important — I want a balanced career", tags: ["engineering", "analytics", "management"] },
      { text: "Satisfaction over money — doing meaningful work matters most", tags: ["healthcare", "social", "education"] },
      { text: "Stable income with low stress is perfect", tags: ["skilled-trades", "education", "research"] },
    ],
  },
  {
    q: "What's your ideal learning style for a career?",
    options: [
      { text: "Continuous learning — new tech, new frameworks, fast evolution", tags: ["tech", "analytics", "design"] },
      { text: "Professional certifications and structured exams", tags: ["finance", "law", "healthcare"] },
      { text: "Learning by doing, on-the-job experience", tags: ["skilled-trades", "business", "engineering"] },
      { text: "Academic research and deep study", tags: ["research", "social", "education"] },
    ],
  },
  {
    q: "How do you feel about working with people?",
    options: [
      { text: "I love it — the more interaction the better", tags: ["healthcare", "social", "business", "education"] },
      { text: "I enjoy collaboration but need solo time too", tags: ["engineering", "design", "analytics"] },
      { text: "I prefer independent work with minimal meetings", tags: ["tech", "research", "finance"] },
    ],
  },
];

const careerMatchData: Record<string, { careerIds: string[]; description: string }> = {
  tech: { careerIds: ["software-engineer", "data-scientist"], description: "You're drawn to technology and innovation" },
  engineering: { careerIds: ["software-engineer", "mechanical-engineer", "civil-engineer"], description: "You love building and designing systems" },
  healthcare: { careerIds: ["doctor", "pharmacist", "nurse"], description: "You're passionate about health and helping people" },
  finance: { careerIds: ["ca", "investment-banker"], description: "You have a strong aptitude for numbers and business" },
  business: { careerIds: ["mba", "investment-banker"], description: "You're a natural leader with business acumen" },
  management: { careerIds: ["mba", "civil-servant"], description: "You excel at organizing and leading" },
  law: { careerIds: ["lawyer", "civil-servant"], description: "You value justice and have strong analytical skills" },
  social: { careerIds: ["civil-servant", "psychologist", "lawyer"], description: "You want to serve society and make a difference" },
  design: { careerIds: ["designer"], description: "You have a creative eye and love visual problem-solving" },
  analytics: { careerIds: ["data-scientist", "economist"], description: "You're data-driven and love finding patterns" },
  research: { careerIds: ["biotechnologist", "economist"], description: "You're curious and methodical in your approach" },
  education: { careerIds: ["psychologist", "economist"], description: "You enjoy sharing knowledge and guiding others" },
  "skilled-trades": { careerIds: ["iti-technician", "polytechnic"], description: "You excel at practical, hands-on work" },
};

interface MatchResult {
  career: CareerData;
  match: number;
}

export default function CareerMatchPage() {
  const [step, setStep] = useState(0);
  const [tags, setTags] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<number | null>(null);

  const handleAnswer = (optionIdx: number) => {
    setSelected(optionIdx);
    const optionTags = questions[step].options[optionIdx].tags;
    const newTags = { ...tags };
    optionTags.forEach((t) => {
      newTags[t] = (newTags[t] || 0) + 1;
    });
    setTags(newTags);
    setTimeout(() => {
      setSelected(null);
      setStep((s) => s + 1);
    }, 350);
  };

  const reset = () => { setStep(0); setTags({}); setSelected(null); };

  const getResults = (): MatchResult[] => {
    const careerScores: Record<string, number> = {};
    Object.entries(tags).forEach(([tag, count]) => {
      const matchData = careerMatchData[tag];
      if (matchData) {
        matchData.careerIds.forEach((cid) => {
          careerScores[cid] = (careerScores[cid] || 0) + count;
        });
      }
    });
    const maxScore = Math.max(...Object.values(careerScores), 1);
    return Object.entries(careerScores)
      .map(([cid, score]) => ({ career: getCareerById(cid)!, match: Math.round((score / maxScore) * 100) }))
      .filter((r) => r.career && r.match > 0)
      .sort((a, b) => b.match - a.match)
      .slice(0, 5);
  };

  const isComplete = step >= questions.length;
  const progress = Math.round((step / questions.length) * 100);
  const results = isComplete ? getResults() : [];

  return (
    <div className="min-h-screen bg-brand-bg pt-16">
      <div className="bg-white border-b border-neutral-lightGray/50">
        <div className="container-custom py-4">
          <Link href="/ai-tools" className="inline-flex items-center gap-2 text-neutral-mediumGray hover:text-brand-royal text-sm mb-3 transition-colors">
            <ArrowLeft className="h-4 w-4" /> AI Tools
          </Link>
          <h1 className="heading-section text-2xl md:text-3xl">Career Match AI</h1>
          <p className="text-neutral-mediumGray text-sm">Discover careers that match your personality and interests</p>
          {!isComplete && (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-neutral-lightGray overflow-hidden">
                <motion.div className="h-full bg-brand-gradient-static rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
              </div>
              <span className="text-sm font-medium text-neutral-darkGray">{progress}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="container-custom py-12 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="premium-card p-8">
                <div className="flex items-center gap-2 text-sm text-purple-600 font-medium mb-6">
                  <Sparkles className="h-4 w-4" /> Question {step + 1} of {questions.length}
                </div>
                <h2 className="heading-card text-xl md:text-2xl mb-6">{questions[step].q}</h2>
                <div className="space-y-3">
                  {questions[step].options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selected === i ? "border-purple-500 bg-purple-50" : "border-neutral-lightGray hover:border-purple-300 hover:bg-purple-50/50"
                      }`}
                    >
                      <span className="font-medium text-neutral-darkGray">{opt.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="premium-card p-8 text-center mb-8">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Heart className="h-10 w-10 text-white" />
                </div>
                <h2 className="heading-section text-2xl mb-2">Your Career Matches</h2>
                <p className="text-neutral-mediumGray">Based on your personality and preferences, here are your top career matches</p>
              </div>

              <div className="space-y-4">
                {results.map((r, i) => (
                  <motion.div
                    key={r.career.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link href={`/careers/${r.career.id}`}>
                      <div className="premium-card p-5 group hover:shadow-brand-hover transition-all">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-2xl bg-brand-gradient-static flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
                            {r.match}%
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-neutral-nearBlack text-lg group-hover:text-brand-royal transition-colors">{r.career.title}</h3>
                            <p className="text-sm text-neutral-mediumGray">{r.career.subtitle}</p>
                          </div>
                          <div className="flex items-center gap-3 text-right">
                            <div>
                              <p className="text-xs text-neutral-mediumGray">Entry Salary</p>
                              <p className="font-semibold text-green-600 text-sm">{r.career.salary.entry}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-6">
                <button onClick={reset} className="btn-outline inline-flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" /> Retake Quiz
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
