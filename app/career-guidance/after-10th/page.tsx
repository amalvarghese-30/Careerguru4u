"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FlaskConical, ChartBar, Palette, Wrench, CheckCircle, TrendingUp,
  GraduationCap, Briefcase, ArrowRight, Sparkles, Brain, BarChart3, BookOpen, IndianRupee,
} from "lucide-react";
import { getCareersByStream } from "@/lib/careers-data";

const streams = [
  {
    id: "science", name: "Science", icon: FlaskConical,
    color: "from-blue-600 to-cyan-500", bg: "bg-blue-50", textColor: "text-blue-600",
    description: "For students who love logic, experiments, and understanding how things work.",
    subjects: ["Physics", "Chemistry", "Mathematics", "Biology", "Computer Science", "English"],
    subStreams: [
      { name: "PCM", description: "Engineering, Architecture, Data Science" },
      { name: "PCB", description: "Medicine, Pharmacy, Biotechnology" },
    ],
    entranceExams: ["JEE Main", "JEE Advanced", "NEET", "BITSAT"],
    topColleges: ["IIT Bombay", "AIIMS Delhi", "BITS Pilani", "IISc Bangalore"],
  },
  {
    id: "commerce", name: "Commerce", icon: ChartBar,
    color: "from-indigo-600 to-indigo-400", bg: "bg-indigo-50", textColor: "text-indigo-600",
    description: "For future business leaders, entrepreneurs, and financial experts.",
    subjects: ["Accountancy", "Business Studies", "Economics", "Mathematics", "English"],
    subStreams: [
      { name: "With Math", description: "CA, Investment Banking, Data Analytics" },
      { name: "Without Math", description: "BBA, Marketing, HR, Entrepreneurship" },
    ],
    entranceExams: ["CA Foundation", "CUET-UG", "IPMAT", "DU JAT"],
    topColleges: ["SRCC Delhi", "Christ University", "NMIMS", "IIM Indore (IPM)"],
  },
  {
    id: "arts-humanities", name: "Arts/Humanities", icon: Palette,
    color: "from-purple-600 to-purple-400", bg: "bg-purple-50", textColor: "text-purple-600",
    description: "For creative minds, thinkers, and those who want to shape society.",
    subjects: ["History", "Political Science", "Psychology", "Sociology", "Economics", "English"],
    subStreams: [
      { name: "Humanities Core", description: "Civil Services, Academia, Research" },
      { name: "Creative & Law", description: "Design, Journalism, Law" },
    ],
    entranceExams: ["CUET-UG", "CLAT", "NID DAT", "UCEED"],
    topColleges: ["St. Stephen's Delhi", "LSR Delhi", "JNU", "Ashoka University"],
  },
  {
    id: "vocational", name: "Vocational", icon: Wrench,
    color: "from-amber-500 to-orange-400", bg: "bg-amber-50", textColor: "text-amber-600",
    description: "For hands-on learners who want practical, job-ready skills.",
    subjects: ["ITI Trades", "Diploma Engineering", "Skill Development", "Technical Training"],
    subStreams: [
      { name: "ITI Trades", description: "Electrician, Fitter, Welder, Mechanic" },
      { name: "Polytechnic", description: "Diploma Engineering with B.Tech upgrade path" },
    ],
    entranceExams: ["ITI Admission", "Polytechnic CET", "Railway RRB"],
    topColleges: ["Government ITIs", "Government Polytechnics"],
  },
];

export default function After10thPage() {
  return (
    <div className="min-h-screen bg-brand-bg pt-16">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-navy via-brand-navy to-brand-royal py-16">
        <div className="container-custom max-w-3xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
          >
            What After 10th? Complete Guide
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/90 text-lg"
          >
            Compare Science, Commerce, Arts, and Vocational streams. Make the right choice for your future.
          </motion.p>
        </div>
      </section>

      {/* Stream Cards with Detail */}
      {streams.map((stream, idx) => {
        const careers = getCareersByStream(stream.name);
        return (
          <section key={stream.id} className={`py-16 ${idx % 2 === 1 ? "bg-white" : "bg-brand-bg"}`}>
            <div className="container-custom">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Left Column: Stream Info */}
                <div>
                  <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${stream.color} flex items-center justify-center mb-6 shadow-lg`}>
                    <stream.icon className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="heading-section text-3xl md:text-4xl mb-4">{stream.name} Stream</h2>
                  <p className="text-neutral-darkGray text-lg mb-6">{stream.description}</p>

                  <div className="mb-6">
                    <h3 className="font-semibold text-neutral-nearBlack mb-3 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-brand-royal" />
                      Core Subjects in 11th & 12th
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {stream.subjects.map((subject) => (
                        <span key={subject} className="px-3 py-1.5 rounded-lg bg-white border border-neutral-lightGray text-sm text-neutral-darkGray font-medium">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Sub-streams */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-neutral-nearBlack mb-3 flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-brand-royal" />
                      Sub-Streams
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {stream.subStreams.map((ss) => (
                        <div key={ss.name} className="p-3 rounded-xl bg-white border border-neutral-lightGray">
                          <p className="font-semibold text-sm text-neutral-nearBlack">{ss.name}</p>
                          <p className="text-xs text-neutral-darkGray mt-1">{ss.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Career Preview */}
                  <div>
                    <h3 className="font-semibold text-neutral-nearBlack mb-3 flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-brand-royal" />
                      Top Career Paths
                    </h3>
                    <div className="space-y-2">
                      {careers.slice(0, 4).map((career) => (
                        <div key={career.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-neutral-lightGray">
                          <span className="font-medium text-sm text-neutral-darkGray">{career.title}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                              <IndianRupee className="h-2.5 w-2.5" /> {career.salary.entry}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Colleges, Exams, Why */}
                <div className="space-y-6">
                  <div className="premium-card p-6">
                    <h3 className="font-semibold text-neutral-nearBlack mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-brand-royal" />
                      Top Colleges
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {stream.topColleges.map((college) => (
                        <span key={college} className="px-3 py-1.5 rounded-lg bg-brand-bg text-sm text-neutral-darkGray font-medium">
                          {college}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-semibold text-neutral-nearBlack mb-4 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-brand-royal" />
                      Entrance Exams
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {stream.entranceExams.map((exam) => (
                        <span key={exam} className="px-3 py-1.5 rounded-full bg-brand-bg text-sm text-brand-royal font-medium">
                          {exam}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card p-6">
                    <h3 className="font-semibold text-neutral-nearBlack mb-4">Why Choose {stream.name}?</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-neutral-darkGray">Wide range of career opportunities</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-neutral-darkGray">Excellent higher education pathways</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-neutral-darkGray">Strong job market demand</span>
                      </li>
                    </ul>
                    <div className="mt-6 pt-4 border-t border-neutral-lightGray">
                      <Link
                        href={`/career-guidance/after-10th/${stream.id}`}
                        className="btn-primary inline-flex items-center gap-2 w-full justify-center"
                      >
                        Explore {stream.name} in Detail <ArrowRight className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-brand-navy to-brand-royal">
        <div className="container-custom text-center">
          <Sparkles className="h-10 w-10 text-brand-sky mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Still Confused? Get Expert Guidance</h2>
          <p className="text-white/90 mb-8 max-w-xl mx-auto">
            Book a free counselling session with our career experts. We&apos;ll help you make the right decision.
          </p>
          <Link href="/counselling" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-navy rounded-xl font-bold hover:bg-brand-sky transition-colors">
            Book Free Counselling <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
