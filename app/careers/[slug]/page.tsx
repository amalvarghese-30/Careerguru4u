"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, IndianRupee, TrendingUp, GraduationCap, Briefcase, Building,
  BookOpen, Award, Star, ChevronRight, Clock, Sparkles, CheckCircle, Users,
  Target, ExternalLink, Heart, MapPin, ArrowRight, Zap, Loader2,
} from "lucide-react";
import LeadCaptureForm from "@/components/sections/LeadCaptureForm";

interface CareerData {
  id: string;
  title: string;
  subtitle: string;
  overview: string;
  stream: string;
  category: string;
  educationPath: { step: string; description: string }[];
  requiredSkills: { name: string; level: string }[];
  salary: {
    entry: string;
    mid: string;
    senior: string;
    topCompanies: string;
  };
  futureScope: { title: string; description: string }[];
  entranceExams: { name: string; description: string; link?: string }[];
  topRecruiters: string[];
  topColleges: { name: string; type: string; location: string; fees: string }[];
  faqs: { question: string; answer: string }[];
  growth: string;
  workEnvironment: string;
  similarCareers: string[];
}

type TabId = "overview" | "education" | "skills" | "salary" | "exams" | "colleges" | "faqs";

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: Sparkles },
  { id: "education", label: "Education Path", icon: GraduationCap },
  { id: "skills", label: "Skills", icon: Award },
  { id: "salary", label: "Salary", icon: IndianRupee },
  { id: "exams", label: "Entrance Exams", icon: BookOpen },
  { id: "colleges", label: "Top Colleges", icon: Building },
  { id: "faqs", label: "FAQs", icon: Users },
];

function OverviewTab({ career }: { career: CareerData }) {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="font-semibold text-neutral-nearBlack text-lg mb-3">About This Career</h3>
        <p className="text-neutral-mediumGray leading-relaxed">{career.overview}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="bg-brand-bg rounded-xl p-3 text-center">
            <Zap className="h-5 w-5 text-brand-electric mx-auto mb-1" />
            <p className="text-xs text-neutral-mediumGray">Stream</p>
            <p className="font-semibold text-neutral-nearBlack text-sm">{career.stream}</p>
          </div>
          <div className="bg-brand-bg rounded-xl p-3 text-center">
            <Briefcase className="h-5 w-5 text-brand-royal mx-auto mb-1" />
            <p className="text-xs text-neutral-mediumGray">Category</p>
            <p className="font-semibold text-neutral-nearBlack text-sm">{career.category}</p>
          </div>
          <div className="bg-brand-bg rounded-xl p-3 text-center">
            <TrendingUp className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-xs text-neutral-mediumGray">Growth</p>
            <p className="font-semibold text-neutral-nearBlack text-sm">{career.growth}</p>
          </div>
          <div className="bg-brand-bg rounded-xl p-3 text-center">
            <Clock className="h-5 w-5 text-brand-sky mx-auto mb-1" />
            <p className="text-xs text-neutral-mediumGray">Environment</p>
            <p className="font-semibold text-neutral-nearBlack text-sm text-[11px] leading-tight mt-0.5">{career.workEnvironment}</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-semibold text-neutral-nearBlack text-lg mb-3">Future Scope</h3>
        <div className="space-y-4">
          {career.futureScope.map((item) => (
            <div key={item.title} className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-brand-gradient-static flex items-center justify-center flex-shrink-0 mt-0.5">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-neutral-nearBlack text-sm">{item.title}</h4>
                <p className="text-xs text-neutral-mediumGray mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-semibold text-neutral-nearBlack text-lg mb-3">Similar Careers</h3>
        <div className="flex flex-wrap gap-2">
          {career.similarCareers.map((c) => (
            <Link
              key={c}
              href={`/careers/${c}`}
              className="px-4 py-2 rounded-xl bg-brand-bg text-sm text-neutral-darkGray hover:bg-brand-royal hover:text-white transition-all font-medium"
            >
              {c.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function EducationTab({ career }: { career: CareerData }) {
  return (
    <div className="space-y-4">
      {career.educationPath.map((step, i) => (
        <motion.div
          key={step.step}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass-card p-5 flex gap-4"
        >
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-xl bg-brand-gradient-static flex items-center justify-center text-white font-bold shadow-lg shadow-brand-royal/20">
              {i + 1}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-neutral-nearBlack">{step.step}</h4>
            <p className="text-sm text-neutral-mediumGray mt-1">{step.description}</p>
          </div>
          {i < career.educationPath.length - 1 && (
            <div className="hidden sm:block flex-shrink-0 mt-5">
              <ChevronRight className="h-5 w-5 text-neutral-lightGray" />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

function SkillsTab({ career }: { career: CareerData }) {
  const levels: Record<string, string> = {
    Expert: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Advanced: "bg-blue-100 text-blue-700 border-blue-200",
    Intermediate: "bg-amber-100 text-amber-700 border-amber-200",
    Beginner: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <div className="glass-card p-6">
      <h3 className="font-semibold text-neutral-nearBlack text-lg mb-4">Required Skills</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {career.requiredSkills.map((skill) => (
          <div key={skill.name} className="flex items-center justify-between p-3 rounded-xl bg-brand-bg">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium text-neutral-darkGray">{skill.name}</span>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${levels[skill.level] || levels.Intermediate}`}>
              {skill.level}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SalaryTab({ career }: { career: CareerData }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 text-center">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
            <IndianRupee className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-xs text-neutral-mediumGray mb-1">Entry Level</p>
          <p className="font-bold text-neutral-nearBlack text-lg">{career.salary.entry}</p>
        </div>
        <div className="glass-card p-5 text-center ring-2 ring-brand-royal/20 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-gradient-static text-white text-xs font-semibold px-3 py-1 rounded-full">
            Popular
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
            <IndianRupee className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-xs text-neutral-mediumGray mb-1">Mid Level (5-10 yrs)</p>
          <p className="font-bold text-neutral-nearBlack text-lg">{career.salary.mid}</p>
        </div>
        <div className="glass-card p-5 text-center">
          <div className="h-10 w-10 rounded-xl bg-brand-royal/10 flex items-center justify-center mx-auto mb-3">
            <IndianRupee className="h-5 w-5 text-brand-royal" />
          </div>
          <p className="text-xs text-neutral-mediumGray mb-1">Senior Level</p>
          <p className="font-bold text-neutral-nearBlack text-lg">{career.salary.senior}</p>
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center gap-3 mb-2">
          <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
          <h3 className="font-semibold text-neutral-nearBlack">Top Company Salaries</h3>
        </div>
        <p className="text-neutral-mediumGray">{career.salary.topCompanies}</p>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-semibold text-neutral-nearBlack text-lg mb-4">Top Recruiters</h3>
        <div className="flex flex-wrap gap-2">
          {career.topRecruiters.map((r) => (
            <span key={r} className="px-4 py-2 rounded-xl bg-brand-bg text-sm font-medium text-neutral-darkGray border border-neutral-lightGray hover:border-brand-royal transition-colors">
              {r}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExamsTab({ career }: { career: CareerData }) {
  return (
    <div className="space-y-4">
      {career.entranceExams.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <BookOpen className="h-12 w-12 text-neutral-lightGray mx-auto mb-3" />
          <p className="text-neutral-mediumGray">No specific entrance exams required for this career path.</p>
        </div>
      ) : (
        career.entranceExams.map((exam) => (
          <div key={exam.name} className="glass-card p-5 flex items-start justify-between gap-4">
            <div>
              <h4 className="font-semibold text-neutral-nearBlack">{exam.name}</h4>
              <p className="text-sm text-neutral-mediumGray mt-1">{exam.description}</p>
            </div>
            {exam.link && (
              <a href={exam.link} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 p-2 rounded-lg bg-brand-bg hover:bg-brand-royal/10 transition-colors text-brand-royal">
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        ))
      )}
    </div>
  );
}

function CollegesTab({ career }: { career: CareerData }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {career.topColleges.map((college) => (
          <div key={college.name} className="glass-card p-5 group hover:shadow-brand-hover transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-brand-gradient-static flex items-center justify-center">
                  <Building className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-nearBlack group-hover:text-brand-royal transition-colors">{college.name}</h4>
                  <p className="text-xs text-neutral-mediumGray">{college.type} College</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-neutral-mediumGray">
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {college.location}</span>
              <span className="flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" /> {college.fees}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FAQsTab({ career }: { career: CareerData }) {
  return (
    <div className="space-y-3">
      {career.faqs.map((faq) => (
        <details key={faq.question} className="glass-card group cursor-pointer">
          <summary className="p-5 font-medium text-neutral-nearBlack flex items-center justify-between">
            {faq.question}
            <ChevronRight className="h-4 w-4 text-neutral-mediumGray group-open:rotate-90 transition-transform" />
          </summary>
          <div className="px-5 pb-5 text-sm text-neutral-mediumGray leading-relaxed">
            {faq.answer}
          </div>
        </details>
      ))}
    </div>
  );
}

export default function CareerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [saved, setSaved] = useState(false);
  const [career, setCareer] = useState<CareerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/careers/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.career) setCareer(data.career);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg pt-16">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-brand-royal animate-spin mx-auto mb-4" />
          <p className="text-neutral-mediumGray">Loading career...</p>
        </div>
      </div>
    );
  }

  if (!career) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg pt-16">
        <div className="text-center">
          <div className="h-20 w-20 rounded-3xl bg-brand-bg flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-10 w-10 text-neutral-lightGray" />
          </div>
          <h1 className="heading-section text-3xl mb-3">Career Not Found</h1>
          <p className="text-neutral-mediumGray mb-6">The career you&apos;re looking for doesn&apos;t exist yet.</p>
          <Link href="/career-guidance/flowchart" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" /> Explore Careers
          </Link>
        </div>
      </div>
    );
  }

  const TabContent = {
    overview: OverviewTab,
    education: EducationTab,
    skills: SkillsTab,
    salary: SalaryTab,
    exams: ExamsTab,
    colleges: CollegesTab,
    faqs: FAQsTab,
  }[activeTab];

  return (
    <div className="min-h-screen bg-brand-bg pt-16">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-brand-navy via-brand-navy to-brand-royal text-white">
        <div className="container-custom py-12">
          <Link
            href="/career-guidance/flowchart"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Flowchart
          </Link>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full">
                  {career.stream}
                </span>
                <span className="text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full">
                  {career.category}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">{career.title}</h1>
              <p className="text-white/70 mt-3 text-lg max-w-2xl">{career.subtitle}</p>
            </div>
            <button
              onClick={() => setSaved(!saved)}
              className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                saved
                  ? "bg-red-500 text-white"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <Heart className={`h-4 w-4 ${saved ? "fill-white" : ""}`} />
              {saved ? "Saved" : "Save Career"}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-neutral-lightGray/50 sticky top-16 z-30">
        <div className="container-custom overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-brand-gradient-static text-white shadow-brand-btn"
                    : "text-neutral-darkGray hover:bg-brand-bg hover:text-brand-royal"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container-custom py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <TabContent career={career} />
        </motion.div>

        {/* CTA Banner */}
        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-brand-navy to-brand-royal text-white text-center">
          <Sparkles className="h-10 w-10 text-brand-sky mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Still Confused About Your Career?</h2>
          <p className="text-white/70 mb-6 max-w-lg mx-auto">
            Get personalized career guidance from our expert counsellors. It&rsquo;s free.
          </p>
          <Link href="/counselling" className="inline-flex items-center gap-2 bg-white text-brand-navy px-6 py-3 rounded-xl font-bold hover:bg-brand-sky transition-colors">
            Book Free Counselling <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="mt-8 max-w-md mx-auto">
          <LeadCaptureForm source="Career Page" interest={career.title} />
        </div>
      </div>
    </div>
  );
}
