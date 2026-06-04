"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, Brain, CheckCircle, RefreshCw } from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: { text: string; scores: Record<string, number> }[];
}

const questions: Question[] = [
  {
    id: 1,
    question: "Which subjects do you enjoy most?",
    options: [
      { text: "Physics and Math — I love solving problems", scores: { science: 10, commerce: 2, arts: 0, vocational: 3 } },
      { text: "Biology and Chemistry — understanding life fascinates me", scores: { science: 10, commerce: 0, arts: 2, vocational: 3 } },
      { text: "Accountancy and Business Studies — numbers and business excite me", scores: { science: 2, commerce: 10, arts: 0, vocational: 1 } },
      { text: "History and Political Science — I love understanding society", scores: { science: 0, commerce: 2, arts: 10, vocational: 1 } },
    ],
  },
  {
    id: 2,
    question: "What kind of problems do you like to solve?",
    options: [
      { text: "Technical problems — building, fixing, designing things", scores: { science: 10, commerce: 1, arts: 0, vocational: 6 } },
      { text: "Business problems — strategy, growth, making money", scores: { science: 2, commerce: 10, arts: 1, vocational: 2 } },
      { text: "Social problems — helping people, creating change", scores: { science: 1, commerce: 2, arts: 10, vocational: 3 } },
      { text: "Practical problems — working with my hands, getting things done", scores: { science: 2, commerce: 1, arts: 0, vocational: 10 } },
    ],
  },
  {
    id: 3,
    question: "How do you prefer to learn?",
    options: [
      { text: "Through experiments, labs, and hands-on testing", scores: { science: 9, commerce: 1, arts: 2, vocational: 7 } },
      { text: "Through analysis, case studies, and data", scores: { science: 3, commerce: 9, arts: 1, vocational: 1 } },
      { text: "Through reading, discussion, and debate", scores: { science: 1, commerce: 2, arts: 10, vocational: 0 } },
      { text: "Through watching, doing, and practicing repeatedly", scores: { science: 1, commerce: 1, arts: 0, vocational: 10 } },
    ],
  },
  {
    id: 4,
    question: "What matters most to you in a career?",
    options: [
      { text: "High salary and career growth", scores: { science: 6, commerce: 8, arts: 2, vocational: 2 } },
      { text: "Job security and stability", scores: { science: 5, commerce: 4, arts: 6, vocational: 6 } },
      { text: "Making an impact on society", scores: { science: 3, commerce: 1, arts: 10, vocational: 2 } },
      { text: "Work-life balance and flexibility", scores: { science: 2, commerce: 3, arts: 4, vocational: 4 } },
    ],
  },
  {
    id: 5,
    question: "How do you feel about math and numbers?",
    options: [
      { text: "Love them — I'm comfortable with complex math", scores: { science: 10, commerce: 7, arts: 0, vocational: 1 } },
      { text: "Okay with basic math — I can handle practical calculations", scores: { science: 3, commerce: 8, arts: 2, vocational: 5 } },
      { text: "Prefer words and ideas over numbers", scores: { science: 0, commerce: 1, arts: 10, vocational: 1 } },
      { text: "I prefer working with my hands, not numbers", scores: { science: 0, commerce: 0, arts: 2, vocational: 10 } },
    ],
  },
  {
    id: 6,
    question: "What type of work environment suits you?",
    options: [
      { text: "Office or lab with computers and technology", scores: { science: 9, commerce: 5, arts: 1, vocational: 2 } },
      { text: "Corporate office with meetings and presentations", scores: { science: 2, commerce: 10, arts: 2, vocational: 1 } },
      { text: "Creative studio or fieldwork with people", scores: { science: 1, commerce: 1, arts: 10, vocational: 2 } },
      { text: "Workshop, factory, or outdoor hands-on setting", scores: { science: 1, commerce: 0, arts: 0, vocational: 10 } },
    ],
  },
  {
    id: 7,
    question: "How do you approach a big project or task?",
    options: [
      { text: "Research and analyze before creating a systematic plan", scores: { science: 9, commerce: 5, arts: 2, vocational: 2 } },
      { text: "Set goals, build a team, and manage execution", scores: { science: 2, commerce: 10, arts: 3, vocational: 3 } },
      { text: "Brainstorm creatively and think outside the box", scores: { science: 2, commerce: 2, arts: 10, vocational: 3 } },
      { text: "Jump in and figure it out by doing", scores: { science: 1, commerce: 1, arts: 1, vocational: 10 } },
    ],
  },
  {
    id: 8,
    question: "Who do you most admire?",
    options: [
      { text: "Scientists, engineers, and innovators", scores: { science: 10, commerce: 1, arts: 1, vocational: 4 } },
      { text: "Business leaders and entrepreneurs", scores: { science: 1, commerce: 10, arts: 0, vocational: 1 } },
      { text: "Artists, writers, and social reformers", scores: { science: 1, commerce: 0, arts: 10, vocational: 0 } },
      { text: "Skilled craftsmen and master technicians", scores: { science: 1, commerce: 0, arts: 0, vocational: 8 } },
    ],
  },
];

const streamInfo: Record<string, { name: string; description: string; color: string; careers: string[]; href: string }> = {
  science: {
    name: "Science",
    description: "Perfect for analytical thinkers who love experiments and understanding how things work. This stream opens doors to engineering, medicine, research, and cutting-edge technology careers.",
    color: "from-blue-600 to-cyan-500",
    careers: ["Software Engineer", "Doctor", "Data Scientist", "Mechanical Engineer", "Biotechnologist"],
    href: "/career-guidance/after-10th/science",
  },
  commerce: {
    name: "Commerce",
    description: "Ideal for business-minded students who enjoy numbers, strategy, and understanding markets. This stream leads to finance, accounting, management, and entrepreneurship.",
    color: "from-indigo-600 to-indigo-400",
    careers: ["Chartered Accountant", "Investment Banker", "MBA Professional", "Economist"],
    href: "/career-guidance/after-10th/commerce",
  },
  arts: {
    name: "Arts/Humanities",
    description: "Best for creative thinkers, communicators, and those passionate about society and culture. Opens paths to civil services, law, design, journalism, and psychology.",
    color: "from-purple-600 to-purple-400",
    careers: ["Civil Servant (IAS)", "Lawyer", "Designer", "Psychologist"],
    href: "/career-guidance/after-10th/arts-humanities",
  },
  vocational: {
    name: "Vocational/Skills",
    description: "Great for hands-on learners who want practical skills and quick employment. ITI courses and polytechnic diplomas offer fast career starts with government job opportunities.",
    color: "from-amber-500 to-orange-400",
    careers: ["ITI Technician", "Polytechnic Engineer", "Nurse"],
    href: "/career-guidance/after-10th/vocational",
  },
};

export default function StreamSelectorPage() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<number | null>(null);

  const handleAnswer = (optionIdx: number) => {
    setSelected(optionIdx);
    const option = questions[step].options[optionIdx];
    const newScores = { ...scores };
    Object.entries(option.scores).forEach(([key, val]) => {
      newScores[key] = (newScores[key] || 0) + val;
    });
    setScores(newScores);

    setTimeout(() => {
      setSelected(null);
      setStep((s) => s + 1);
    }, 400);
  };

  const reset = () => {
    setStep(0);
    setScores({});
    setSelected(null);
  };

  const getResult = () => {
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    return sorted[0][0];
  };

  const isComplete = step >= questions.length;
  const progress = isComplete ? 100 : Math.round((step / questions.length) * 100);
  const result = isComplete ? getResult() : null;
  const resultInfo = result ? streamInfo[result] : null;

  return (
    <div className="min-h-screen bg-brand-bg pt-16">
      {/* Header */}
      <div className="bg-white border-b border-neutral-lightGray/50">
        <div className="container-custom py-4">
          <Link href="/ai-tools" className="inline-flex items-center gap-2 text-neutral-mediumGray hover:text-brand-royal text-sm mb-3 transition-colors">
            <ArrowLeft className="h-4 w-4" /> AI Tools
          </Link>
          <h1 className="heading-section text-2xl md:text-3xl">Stream Selector AI</h1>
          <p className="text-neutral-mediumGray text-sm">Find the best stream after 10th based on your interests</p>

          {!isComplete && (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-neutral-lightGray overflow-hidden">
                <motion.div
                  className="h-full bg-brand-gradient-static rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-neutral-darkGray">{progress}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="container-custom py-12 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <div className="premium-card p-8">
                <div className="flex items-center gap-2 text-sm text-brand-royal font-medium mb-6">
                  <Brain className="h-4 w-4" /> Question {step + 1} of {questions.length}
                </div>
                <h2 className="heading-card text-xl md:text-2xl mb-6">{questions[step].question}</h2>
                <div className="space-y-3">
                  {questions[step].options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selected === i
                          ? "border-brand-royal bg-brand-royal/5"
                          : "border-neutral-lightGray hover:border-brand-royal/30 hover:bg-brand-bg"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-8 w-8 rounded-lg bg-brand-bg flex items-center justify-center text-sm font-bold text-brand-royal">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="font-medium text-neutral-darkGray">{opt.text}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="premium-card p-8 text-center"
            >
              <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${resultInfo?.color} flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h2 className="heading-section text-2xl mb-2">
                Your Ideal Stream: <span className="text-brand-royal">{resultInfo?.name}</span>
              </h2>
              <p className="text-neutral-mediumGray mb-8 max-w-md mx-auto">{resultInfo?.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {resultInfo?.careers.map((c) => (
                  <div key={c} className="flex items-center gap-2 p-3 rounded-xl bg-brand-bg">
                    <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm text-neutral-darkGray">{c}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href={resultInfo?.href || "#"} className="btn-primary inline-flex items-center gap-2">
                  Explore {resultInfo?.name} Stream <ArrowRight className="h-5 w-5" />
                </Link>
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
