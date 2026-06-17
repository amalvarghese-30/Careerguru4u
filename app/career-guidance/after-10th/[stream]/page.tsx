"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, IndianRupee, TrendingUp, GraduationCap, BookOpen,
  Building, CheckCircle, ArrowRight, Sparkles, Timer, Users, Target,
} from "lucide-react";
import { getCareersByStream, getCareerById } from "@/lib/careers-data";

interface StreamConfig {
  name: string;
  description: string;
  longDescription: string;
  color: string;
  bg: string;
  textColor: string;
  borderColor: string;
  subjects: string[];
  whyChoose: string[];
  entranceExams: { name: string; description: string }[];
  topColleges: { name: string; type: string; location: string; fees: string }[];
  subStreams?: { name: string; description: string; careers: string[] }[];
}

const streamConfigs: Record<string, StreamConfig> = {
  science: {
    name: "Science",
    description: "For future engineers, doctors, researchers, and tech leaders",
    longDescription: "The Science stream is the most versatile after 10th, opening doors to engineering, medicine, research, data science, and emerging technologies. It's ideal for students who love problem-solving, experiments, and understanding how the world works at a fundamental level.",
    color: "from-blue-600 to-cyan-500",
    bg: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "border-blue-200",
    subjects: ["Physics", "Chemistry", "Mathematics", "Biology (Optional)", "English", "Computer Science / IP"],
    whyChoose: [
      "Widest range of career options — engineering, medicine, research, tech",
      "Highest paying career paths with ₹50L+ potential",
      "Foundation for cutting-edge fields: AI, biotech, space tech, quantum computing",
      "Global demand for Indian STEM graduates",
      "Multiple government job opportunities through JEE, NEET, GATE, ISRO, DRDO",
    ],
    entranceExams: [
      { name: "JEE Main", description: "Engineering admission to NITs, IIITs, and state colleges" },
      { name: "JEE Advanced", description: "For admission to IITs — India's most prestigious engineering institutes" },
      { name: "NEET-UG", description: "Medical admission to MBBS, BDS, and allied courses" },
      { name: "BITSAT", description: "Entrance for BITS Pilani, Goa, and Hyderabad campuses" },
    ],
    topColleges: [
      { name: "IIT Bombay", type: "Government", location: "Mumbai", fees: "₹2.2L - ₹8L" },
      { name: "AIIMS Delhi", type: "Government", location: "Delhi", fees: "₹5K - ₹15K" },
      { name: "IISc Bangalore", type: "Government", location: "Bangalore", fees: "₹50K - ₹2L" },
      { name: "BITS Pilani", type: "Private", location: "Pilani", fees: "₹4L - ₹16L" },
    ],
    subStreams: [
      { name: "PCM — Engineering & Tech", description: "Opens all engineering and tech careers", careers: ["software-engineer", "data-scientist", "mechanical-engineer", "civil-engineer"] },
      { name: "PCB — Medical & Life Sciences", description: "Leads to medicine, pharmacy, and biotech", careers: ["doctor", "pharmacist", "biotechnologist"] },
    ],
  },
  commerce: {
    name: "Commerce",
    description: "For future business leaders, finance experts, and entrepreneurs",
    longDescription: "Commerce is the gateway to the world of business, finance, and economics. From chartered accountancy to investment banking and corporate leadership, commerce students drive India's economic growth. With mathematics, it opens even more doors in data analytics and quantitative finance.",
    color: "from-indigo-600 to-indigo-400",
    bg: "bg-indigo-50",
    textColor: "text-indigo-600",
    borderColor: "border-indigo-200",
    subjects: ["Accountancy", "Business Studies", "Economics", "Mathematics (Optional)", "English", "Entrepreneurship"],
    whyChoose: [
      "Direct path to high-paying careers: CA, Investment Banking, Management Consulting",
      "Covers both professional (CA/CS/CMA) and academic (B.Com/MBA) paths",
      "Foundation for entrepreneurship and startup leadership",
      "Combines with Math for data analytics and fintech opportunities",
      "Global career opportunities in finance hubs: London, Singapore, Dubai, New York",
    ],
    entranceExams: [
      { name: "CA Foundation", description: "Entry to Chartered Accountancy — the most respected finance credential" },
      { name: "CUET-UG", description: "For admission to top commerce colleges like SRCC, LSR, Christ" },
      { name: "IPMAT", description: "Integrated Program in Management at IIMs (BBA+MBA)" },
    ],
    topColleges: [
      { name: "SRCC Delhi", type: "Government", location: "Delhi", fees: "₹30K - ₹80K" },
      { name: "Christ University", type: "Private", location: "Bangalore", fees: "₹1L - ₹3L" },
      { name: "NMIMS Mumbai", type: "Private", location: "Mumbai", fees: "₹3L - ₹12L" },
      { name: "IIM Indore (IPM)", type: "Government", location: "Indore", fees: "₹5L - ₹20L" },
    ],
    subStreams: [
      { name: "Commerce with Math", description: "Opens finance, analytics, and economics", careers: ["ca", "investment-banker", "economist"] },
      { name: "Commerce without Math", description: "Business, marketing, HR, and general management", careers: ["mba"] },
    ],
  },
  "arts-humanities": {
    name: "Arts/Humanities",
    description: "For creative thinkers, change-makers, and those who shape society",
    longDescription: "Arts and Humanities is the most underrated stream with incredible career potential. From civil services and law to psychology and design, arts students shape policy, create culture, and understand human behavior. It's ideal for curious minds who love reading, writing, and critical thinking.",
    color: "from-purple-600 to-purple-400",
    bg: "bg-purple-50",
    textColor: "text-purple-600",
    borderColor: "border-purple-200",
    subjects: ["History", "Political Science", "Psychology", "Sociology", "Geography", "Economics", "English"],
    whyChoose: [
      "Path to prestigious careers: Civil Services (IAS/IPS/IFS), Judiciary, Diplomacy",
      "Best stream for UPSC preparation — humanities subjects align directly with the syllabus",
      "Creative careers: Design, journalism, filmmaking, advertising",
      "Deep understanding of society, human behavior, and policy",
      "Flexibility to switch to law, management, or social entrepreneurship later",
    ],
    entranceExams: [
      { name: "CUET-UG", description: "Admission to Delhi University, JNU, BHU, and central universities" },
      { name: "CLAT", description: "Admission to National Law Universities (NLUs) for 5-year integrated LLB" },
      { name: "NID DAT / UCEED", description: "For design programs at NID, NIFT, and IITs" },
    ],
    topColleges: [
      { name: "St. Stephen's Delhi", type: "Government", location: "Delhi", fees: "₹50K - ₹1L" },
      { name: "LSR Delhi", type: "Government", location: "Delhi", fees: "₹30K - ₹80K" },
      { name: "JNU Delhi", type: "Government", location: "Delhi", fees: "₹5K - ₹15K" },
      { name: "Ashoka University", type: "Private", location: "Sonipat", fees: "₹5L - ₹10L" },
    ],
    subStreams: [
      { name: "Humanities Core", description: "Civil services, academia, research", careers: ["civil-servant", "psychologist"] },
      { name: "Creative & Design", description: "Design, media, advertising", careers: ["designer"] },
      { name: "Law", description: "Litigation, corporate law, judiciary", careers: ["lawyer"] },
    ],
  },
  vocational: {
    name: "Vocational",
    description: "For hands-on learners who want practical, job-ready skills",
    longDescription: "Vocational education offers practical, skill-based training that leads to immediate employment. From ITI trades to polytechnic diplomas, this path is ideal for students who prefer hands-on learning over theoretical study. With Skill India and Make in India initiatives, skilled professionals are in massive demand.",
    color: "from-amber-500 to-orange-400",
    bg: "bg-amber-50",
    textColor: "text-amber-600",
    borderColor: "border-amber-200",
    subjects: ["Trade-specific skills", "Workshop Practice", "Technical Drawing", "Safety & Quality", "Basic Math & Science", "Computer Literacy"],
    whyChoose: [
      "Fastest path to employment — start earning within 1-3 years after 10th",
      "Massive demand: Skill India, Make in India, and infrastructure projects need skilled workers",
      "Lower education cost compared to traditional degree paths",
      "Government job opportunities: Railways, Defence, PSUs recruit ITI/diploma holders",
      "Option to upgrade to B.Tech via lateral entry for diploma holders",
    ],
    entranceExams: [
      { name: "ITI Admission", description: "Merit-based admission in most states for Industrial Training Institutes" },
      { name: "Polytechnic Entrance", description: "State-level exams for diploma engineering programs" },
      { name: "Railway RRB", description: "Indian Railways technician recruitment for ITI graduates" },
    ],
    topColleges: [
      { name: "Government ITIs", type: "Government", location: "All India", fees: "₹2K - ₹10K" },
      { name: "Government Polytechnics", type: "Government", location: "All India", fees: "₹3K - ₹20K" },
    ],
    subStreams: [
      { name: "ITI Trades", description: "Electrician, fitter, welder, mechanic", careers: ["iti-technician"] },
      { name: "Polytechnic Diploma", description: "Engineering diploma with B.Tech upgrade path", careers: ["polytechnic"] },
      { name: "Healthcare", description: "Nursing and paramedical", careers: ["nurse"] },
    ],
  },
};

export default function StreamDetailPage({ params }: { params: Promise<{ stream: string }> }) {
  const { stream } = use(params);
  const config = streamConfigs[stream];

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg pt-16">
        <div className="text-center">
          <h1 className="heading-section text-3xl mb-3">Stream Not Found</h1>
          <Link href="/career-guidance/after-10th" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" /> Back to Streams
          </Link>
        </div>
      </div>
    );
  }

  const careers = getCareersByStream(config.name);

  return (
    <div className="min-h-screen bg-brand-bg pt-16">
      {/* Hero Banner */}
      <div className={`bg-gradient-to-br ${config.color} text-white`}>
        <div className="container-custom py-12">
          <Link href="/career-guidance/after-10th" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Streams
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold mb-3">{config.name} Stream</h1>
          <p className="text-white/90 text-lg max-w-2xl">{config.longDescription}</p>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Core Subjects */}
            <div className="premium-card p-6">
              <h2 className="heading-card text-xl mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-brand-royal" />
                Core Subjects in 11th & 12th
              </h2>
              <div className="flex flex-wrap gap-2">
                {config.subjects.map((s) => (
                  <span key={s} className="px-4 py-2 rounded-xl bg-brand-bg text-sm font-medium text-neutral-darkGray border border-neutral-lightGray">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Why Choose */}
            <div className="premium-card p-6">
              <h2 className="heading-card text-xl mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-brand-royal" />
                Why Choose {config.name}?
              </h2>
              <div className="space-y-3">
                {config.whyChoose.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    <p className="text-neutral-darkGray">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Paths from this Stream */}
            <div>
              <h2 className="heading-card text-xl mb-4 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-brand-royal" />
                Career Paths from {config.name}
              </h2>
              <div className="space-y-4">
                {careers.map((career) => (
                  <Link key={career.id} href={`/careers/${career.id}`}>
                    <div className="premium-card p-5 group hover:shadow-brand-hover transition-all cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-neutral-nearBlack group-hover:text-brand-royal transition-colors">{career.title}</h3>
                          <p className="text-sm text-neutral-darkGray mt-1">{career.subtitle}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-neutral-lightGray group-hover:text-brand-royal group-hover:translate-x-1 transition-all" />
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs">
                        <span className="flex items-center gap-1 text-green-600"><IndianRupee className="h-3 w-3" /> {career.salary.entry}</span>
                        <span className={`px-2 py-0.5 rounded-full font-medium ${
                          career.growth === "Very High" ? "bg-emerald-100 text-emerald-700" :
                          career.growth === "High" ? "bg-green-100 text-green-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>{career.growth} Growth</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Sub-streams */}
            {config.subStreams && (
              <div className="glass-card p-6">
                <h3 className="font-semibold text-neutral-nearBlack mb-4">Sub-Streams</h3>
                <div className="space-y-3">
                  {config.subStreams.map((ss) => (
                    <div key={ss.name} className="p-3 rounded-xl bg-brand-bg">
                      <p className="font-semibold text-sm text-neutral-nearBlack">{ss.name}</p>
                      <p className="text-xs text-neutral-darkGray mt-1">{ss.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {ss.careers.map((cid) => {
                          const c = getCareerById(cid);
                          return c ? (
                            <Link key={cid} href={`/careers/${cid}`} className="text-xs text-brand-royal hover:underline font-medium">
                              {c.title}
                            </Link>
                          ) : null;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Entrance Exams */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-neutral-nearBlack mb-4 flex items-center gap-2">
                <Timer className="h-4 w-4 text-brand-royal" />
                Key Entrance Exams
              </h3>
              <div className="space-y-3">
                {config.entranceExams.map((exam) => (
                  <div key={exam.name} className="p-3 rounded-xl bg-brand-bg">
                    <p className="font-semibold text-sm text-neutral-nearBlack">{exam.name}</p>
                    <p className="text-xs text-neutral-darkGray mt-1">{exam.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Colleges */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-neutral-nearBlack mb-4 flex items-center gap-2">
                <Building className="h-4 w-4 text-brand-royal" />
                Top Colleges
              </h3>
              <div className="space-y-2">
                {config.topColleges.map((college) => (
                  <div key={college.name} className="flex items-center justify-between p-2.5 rounded-lg bg-brand-bg">
                    <div>
                      <p className="font-medium text-sm text-neutral-nearBlack">{college.name}</p>
                      <p className="text-xs text-neutral-darkGray">{college.type} &bull; {college.location}</p>
                    </div>
                    <span className="text-xs text-neutral-darkGray font-medium">{college.fees}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-brand-navy to-brand-royal text-white text-center">
          <Sparkles className="h-10 w-10 text-brand-sky mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Still Unsure About Choosing {config.name}?</h2>
          <p className="text-white/90 mb-6 max-w-lg mx-auto">
            Get personalized guidance from our expert career counsellors. It&apos;s completely free.
          </p>
          <Link href="/counselling" className="inline-flex items-center gap-2 bg-white text-brand-navy px-6 py-3 rounded-xl font-bold hover:bg-brand-sky transition-colors">
            Book Free Counselling <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
