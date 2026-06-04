"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { X, Plus, GraduationCap, IndianRupee, Star, Briefcase, MapPin, ArrowLeft, ArrowRight, TrendingUp, Heart } from "lucide-react";
import { getAllCareerSlugs, getCareerById } from "@/lib/careers-data";
import type { CareerData } from "@/lib/careers-data";

export default function ComparePage() {
  const [activeTab, setActiveTab] = useState<"colleges" | "careers">("careers");

  return (
    <div className="min-h-screen bg-brand-bg pt-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-navy via-brand-navy to-brand-royal text-white py-12">
        <div className="container-custom text-center max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Compare & Decide</h1>
          <p className="text-white/70 text-lg">Side-by-side comparison of careers, colleges, salaries, and more</p>
          <div className="flex items-center justify-center gap-1 mt-6 bg-white/10 rounded-2xl p-1 inline-flex">
            <button
              onClick={() => setActiveTab("careers")}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "careers" ? "bg-white text-brand-navy" : "text-white/70 hover:text-white"
              }`}
            >
              Compare Careers
            </button>
            <button
              onClick={() => setActiveTab("colleges")}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "colleges" ? "bg-white text-brand-navy" : "text-white/70 hover:text-white"
              }`}
            >
              Compare Colleges
            </button>
          </div>
        </div>
      </div>

      {activeTab === "careers" ? <CareerComparison /> : <CollegeComparison />}
    </div>
  );
}

function CareerComparison() {
  const allSlugs = getAllCareerSlugs();
  const [selected, setSelected] = useState<CareerData[]>(() => {
    const sde = getCareerById("software-engineer");
    const doc = getCareerById("doctor");
    return [sde, doc].filter(Boolean) as CareerData[];
  });

  const addCareer = (slug: string) => {
    if (selected.length >= 4) return;
    const career = getCareerById(slug);
    if (career && !selected.find((c) => c.id === slug)) {
      setSelected([...selected, career]);
    }
  };

  const removeCareer = (id: string) => {
    setSelected(selected.filter((c) => c.id !== id));
  };

  const availableCareers = allSlugs.filter((slug) => !selected.find((c) => c.id === slug));

  return (
    <div className="container-custom py-12">
      {/* Selected Careers */}
      <div className="flex flex-wrap gap-2 mb-8">
        {selected.map((career) => (
          <div key={career.id} className="flex items-center gap-2 bg-brand-royal/10 rounded-full px-4 py-2">
            <span className="text-sm font-medium text-brand-royal">{career.title}</span>
            <button onClick={() => removeCareer(career.id)} className="text-brand-royal/50 hover:text-brand-royal">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        {selected.length < 4 && availableCareers.length > 0 && (
          <div className="relative group">
            <button className="flex items-center gap-2 border-2 border-dashed border-neutral-lightGray rounded-full px-4 py-2 text-neutral-mediumGray hover:border-brand-royal hover:text-brand-royal transition-all">
              <Plus className="h-4 w-4" /> Add Career
            </button>
            <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-neutral-lightGray p-2 w-64 hidden group-hover:block z-10 max-h-64 overflow-y-auto">
              {availableCareers.map((slug) => {
                const c = getCareerById(slug);
                return c ? (
                  <button
                    key={slug}
                    onClick={() => addCareer(slug)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-brand-bg text-sm font-medium text-neutral-darkGray transition-colors"
                  >
                    {c.title}
                  </button>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>

      {/* Comparison Grid */}
      <div className="overflow-x-auto">
        <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${selected.length}, minmax(220px, 1fr))` }}>
          {/* Header Row */}
          <div className="font-medium text-neutral-mediumGray" />
          {selected.map((career) => (
            <div key={career.id} className="premium-card p-5 text-center">
              <h3 className="font-bold text-neutral-nearBlack text-lg mb-1">{career.title}</h3>
              <span className="text-xs text-brand-royal font-semibold">{career.stream} &bull; {career.category}</span>
            </div>
          ))}

          {/* Overview */}
          <CompareLabel icon={Star} label="Overview" />
          {selected.map((c) => (
            <div key={c.id} className="glass-card p-4">
              <p className="text-xs text-neutral-mediumGray leading-relaxed line-clamp-3">{c.overview}</p>
            </div>
          ))}

          {/* Growth */}
          <CompareLabel icon={TrendingUp} label="Growth Outlook" />
          {selected.map((c) => (
            <div key={c.id} className="glass-card p-4 text-center">
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                c.growth === "Very High" ? "bg-emerald-100 text-emerald-700" :
                c.growth === "High" ? "bg-green-100 text-green-700" :
                "bg-blue-100 text-blue-700"
              }`}>{c.growth}</span>
            </div>
          ))}

          {/* Entry Salary */}
          <CompareLabel icon={IndianRupee} label="Entry Salary" />
          {selected.map((c) => (
            <div key={c.id} className="glass-card p-4 text-center">
              <span className="font-semibold text-green-600">{c.salary.entry}</span>
            </div>
          ))}

          {/* Mid Salary */}
          <CompareLabel icon={IndianRupee} label="Mid Salary (5-10yr)" />
          {selected.map((c) => (
            <div key={c.id} className="glass-card p-4 text-center">
              <span className="font-semibold text-green-700">{c.salary.mid}</span>
            </div>
          ))}

          {/* Senior Salary */}
          <CompareLabel icon={IndianRupee} label="Senior Salary" />
          {selected.map((c) => (
            <div key={c.id} className="glass-card p-4 text-center">
              <span className="font-semibold text-brand-navy">{c.salary.senior}</span>
            </div>
          ))}

          {/* Education */}
          <CompareLabel icon={GraduationCap} label="Education Path" />
          {selected.map((c) => (
            <div key={c.id} className="glass-card p-4">
              <p className="text-xs text-neutral-darkGray font-medium">{c.educationPath[0]?.step}</p>
              <p className="text-xs text-neutral-mediumGray mt-1">→ {c.educationPath[c.educationPath.length - 1]?.step}</p>
              <p className="text-xs text-neutral-mediumGray mt-0.5">{c.educationPath.length} steps total</p>
            </div>
          ))}

          {/* Top Recruiters */}
          <CompareLabel icon={Briefcase} label="Top Recruiters" />
          {selected.map((c) => (
            <div key={c.id} className="glass-card p-4">
              <div className="flex flex-wrap gap-1">
                {c.topRecruiters.slice(0, 3).map((r) => (
                  <span key={r} className="text-xs px-2 py-0.5 rounded-full bg-brand-bg text-neutral-darkGray">{r}</span>
                ))}
                {c.topRecruiters.length > 3 && <span className="text-xs text-neutral-mediumGray">+{c.topRecruiters.length - 3} more</span>}
              </div>
            </div>
          ))}

          {/* Action */}
          <div />
          {selected.map((c) => (
            <div key={c.id} className="glass-card p-4 text-center">
              <Link href={`/careers/${c.id}`} className="btn-primary py-2 px-4 text-sm inline-flex items-center gap-1">
                View Full Profile <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CompareLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 py-4 text-neutral-darkGray font-medium">
      <Icon className="h-4 w-4 text-brand-royal" />
      <span>{label}</span>
    </div>
  );
}

function CollegeComparison() {
  const colleges = [
    { id: "iitb", name: "IIT Bombay", location: "Mumbai", ranking: "NIRF #3", fees: "₹2.2L-₹8L", placement: "94%", avgPackage: "₹23.5L", courses: ["B.Tech", "M.Tech", "PhD"], rating: 4.8 },
    { id: "iitd", name: "IIT Delhi", location: "Delhi", ranking: "NIRF #2", fees: "₹2.2L-₹8L", placement: "93%", avgPackage: "₹22.8L", courses: ["B.Tech", "M.Tech", "PhD"], rating: 4.8 },
    { id: "iitm", name: "IIT Madras", location: "Chennai", ranking: "NIRF #1", fees: "₹2L-₹7.5L", placement: "95%", avgPackage: "₹24.2L", courses: ["B.Tech", "M.Tech", "PhD"], rating: 4.9 },
    { id: "nitt", name: "NIT Trichy", location: "Tiruchirappalli", ranking: "NIRF #9", fees: "₹1.5L-₹5L", placement: "90%", avgPackage: "₹15.5L", courses: ["B.Tech", "M.Tech", "MCA"], rating: 4.6 },
    { id: "bitsp", name: "BITS Pilani", location: "Pilani", ranking: "NIRF #25", fees: "₹4L-₹16L", placement: "92%", avgPackage: "₹18.5L", courses: ["B.Tech", "M.Tech", "PhD"], rating: 4.7 },
  ];

  const [selected, setSelected] = useState([colleges[0], colleges[1]]);
  const [showModal, setShowModal] = useState(false);

  const addCollege = (college: typeof colleges[number]) => {
    if (selected.length < 4 && !selected.find((c) => c.id === college.id)) {
      setSelected([...selected, college]);
    }
    setShowModal(false);
  };

  const removeCollege = (id: string) => {
    setSelected(selected.filter((c) => c.id !== id));
  };

  const available = colleges.filter((c) => !selected.find((s) => s.id === c.id));

  return (
    <div className="container-custom py-12">
      <div className="flex flex-wrap gap-2 mb-8">
        {selected.map((c) => (
          <div key={c.id} className="flex items-center gap-2 bg-brand-royal/10 rounded-full px-4 py-2">
            <span className="text-sm font-medium text-brand-royal">{c.name}</span>
            <button onClick={() => removeCollege(c.id)} className="text-brand-royal/50 hover:text-brand-royal">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        {selected.length < 4 && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 border-2 border-dashed border-neutral-lightGray rounded-full px-4 py-2 text-neutral-mediumGray hover:border-brand-royal hover:text-brand-royal transition-all"
          >
            <Plus className="h-4 w-4" /> Add College
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-lightGray">
              <th className="text-left py-4 px-4 text-neutral-mediumGray font-medium w-48">College</th>
              {selected.map((c) => (
                <th key={c.id} className="text-left py-4 px-4">
                  <div className="font-bold text-neutral-nearBlack">{c.name}</div>
                  <div className="flex items-center gap-1 text-sm text-neutral-mediumGray mt-1">
                    <MapPin className="h-3 w-3" /> {c.location}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <CompareTableRow icon={Star} label="Ranking">
              {selected.map((c) => (
                <span key={c.id} className="px-2.5 py-1 rounded-full bg-brand-bg text-brand-royal text-sm font-medium">{c.ranking}</span>
              ))}
            </CompareTableRow>
            <CompareTableRow icon={IndianRupee} label="Fees">
              {selected.map((c) => (
                <span key={c.id} className="font-medium text-neutral-darkGray">{c.fees}</span>
              ))}
            </CompareTableRow>
            <CompareTableRow icon={Briefcase} label="Placement Rate">
              {selected.map((c) => (
                <span key={c.id} className="text-emerald-600 font-semibold">{c.placement}</span>
              ))}
            </CompareTableRow>
            <CompareTableRow icon={IndianRupee} label="Avg Package">
              {selected.map((c) => (
                <span key={c.id} className="text-brand-royal font-semibold">{c.avgPackage}</span>
              ))}
            </CompareTableRow>
            <CompareTableRow icon={Star} label="Rating">
              {selected.map((c) => (
                <div key={c.id} className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium">{c.rating}</span>
                </div>
              ))}
            </CompareTableRow>
            <CompareTableRow icon={GraduationCap} label="Courses">
              {selected.map((c) => (
                <div key={c.id} className="flex flex-wrap gap-1">
                  {c.courses.map((course) => (
                    <span key={course} className="text-xs px-2 py-0.5 rounded-full bg-brand-bg text-neutral-darkGray">{course}</span>
                  ))}
                </div>
              ))}
            </CompareTableRow>
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-neutral-nearBlack mb-4">Add College to Compare</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {available.map((c) => (
                <button
                  key={c.id}
                  onClick={() => addCollege(c)}
                  className="w-full text-left p-3 rounded-xl hover:bg-brand-bg transition-colors"
                >
                  <div className="font-medium text-neutral-nearBlack">{c.name}</div>
                  <div className="text-sm text-neutral-mediumGray">{c.location} &bull; {c.ranking}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setShowModal(false)} className="mt-4 w-full py-2.5 rounded-xl border border-neutral-lightGray text-neutral-darkGray hover:bg-neutral-lightGray/20 transition-colors font-medium">
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function CompareTableRow({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode[] }) {
  return (
    <tr className="border-b border-neutral-lightGray/50">
      <td className="py-4 px-4">
        <div className="flex items-center gap-2 text-neutral-darkGray">
          <Icon className="h-4 w-4 text-brand-royal" />
          <span className="font-medium">{label}</span>
        </div>
      </td>
      {children.map((child, i) => (
        <td key={i} className="py-4 px-4">{child}</td>
      ))}
    </tr>
  );
}
