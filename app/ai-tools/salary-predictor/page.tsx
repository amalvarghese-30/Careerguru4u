"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, IndianRupee, TrendingUp, Briefcase, MapPin, GraduationCap } from "lucide-react";
import { getCareerById, getAllCareerSlugs } from "@/lib/careers-data";

const experienceLevels = [
  { label: "Fresher (0-2 years)", multiplier: 1 },
  { label: "Mid-Level (3-7 years)", multiplier: 2.5 },
  { label: "Senior (8-15 years)", multiplier: 5 },
  { label: "Expert (15+ years)", multiplier: 8 },
];

const cities = [
  { name: "Tier-2 City", multiplier: 0.85 },
  { name: "Tier-1 City (Chennai, Pune, Kolkata)", multiplier: 1 },
  { name: "Metro (Mumbai, Delhi, Bangalore)", multiplier: 1.15 },
  { name: "International (US/UK/Singapore)", multiplier: 3 },
];

const educationLevels = [
  { name: "Diploma / ITI", multiplier: 0.7 },
  { name: "Bachelor's Degree", multiplier: 1 },
  { name: "Master's / MBA", multiplier: 1.4 },
  { name: "Ph.D / Specialized", multiplier: 1.8 },
];

export default function SalaryPredictorPage() {
  const allSlugs = getAllCareerSlugs();
  const [career, setCareer] = useState("");
  const [experience, setExperience] = useState(experienceLevels[0]);
  const [city, setCity] = useState(cities[1]);
  const [education, setEducation] = useState(educationLevels[1]);
  const [showResult, setShowResult] = useState(false);

  const careerData = career ? getCareerById(career) : null;

  const calculateSalary = () => {
    if (!careerData) return { min: 0, max: 0 };
    const parseRange = (range: string) => {
      if (!range) return [300000, 500000];
      const nums = range.match(/₹([\d.]+)L/g);
      if (!nums || nums.length < 2) return [400000, 800000];
      const min = parseFloat(nums[0].replace(/[₹L]/g, "")) * 100000;
      const max = parseFloat(nums[1].replace(/[₹L]/g, "")) * 100000;
      return [min, max];
    };

    const isFresher = experience === experienceLevels[0];
    const baseRange = isFresher ? parseRange(careerData.salary.entry) : parseRange(careerData.salary.mid);

    const totalMultiplier = (isFresher ? 1 : experience.multiplier) * city.multiplier * education.multiplier;

    const min = Math.round(baseRange[0] * totalMultiplier / 100000) * 100000;
    const max = Math.round(baseRange[1] * totalMultiplier / 100000) * 100000;

    return { min, max };
  };

  const result = showResult ? calculateSalary() : null;

  const formatSalary = (n: number) => {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
    return `₹${(n / 100000).toFixed(1)} L`;
  };

  return (
    <div className="min-h-screen bg-brand-bg pt-16">
      <div className="bg-white border-b border-neutral-lightGray/50">
        <div className="container-custom py-4">
          <Link href="/ai-tools" className="inline-flex items-center gap-2 text-neutral-mediumGray hover:text-brand-royal text-sm mb-3 transition-colors">
            <ArrowLeft className="h-4 w-4" /> AI Tools
          </Link>
          <h1 className="heading-section text-2xl md:text-3xl">Salary Predictor</h1>
          <p className="text-neutral-mediumGray text-sm">Estimate your future salary based on career, experience, and location</p>
        </div>
      </div>

      <div className="container-custom py-12 max-w-2xl mx-auto">
        <div className="premium-card p-8">
          <div className="space-y-6">
            {/* Career Select */}
            <div>
              <label className="block text-sm font-semibold text-neutral-darkGray mb-2 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-brand-royal" /> Select Career
              </label>
              <select
                value={career}
                onChange={(e) => { setCareer(e.target.value); setShowResult(false); }}
                className="w-full p-3 rounded-xl border border-neutral-lightGray focus:border-brand-royal focus:outline-none focus:ring-2 focus:ring-brand-royal/10 bg-white"
              >
                <option value="">Choose a career...</option>
                {allSlugs.map((slug) => {
                  const c = getCareerById(slug);
                  return c ? <option key={slug} value={slug}>{c.title}</option> : null;
                })}
              </select>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-semibold text-neutral-darkGray mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand-royal" /> Experience Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {experienceLevels.map((lvl) => (
                  <button
                    key={lvl.label}
                    onClick={() => { setExperience(lvl); setShowResult(false); }}
                    className={`p-3 rounded-xl text-xs font-medium transition-all ${
                      experience === lvl ? "bg-brand-gradient-static text-white shadow-brand-btn" : "bg-brand-bg text-neutral-darkGray hover:bg-neutral-lightGray"
                    }`}
                  >
                    {lvl.label.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-neutral-darkGray mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-royal" /> Location
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {cities.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => { setCity(c); setShowResult(false); }}
                    className={`p-3 rounded-xl text-xs font-medium transition-all ${
                      city === c ? "bg-brand-gradient-static text-white shadow-brand-btn" : "bg-brand-bg text-neutral-darkGray hover:bg-neutral-lightGray"
                    }`}
                  >
                    {c.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Education */}
            <div>
              <label className="block text-sm font-semibold text-neutral-darkGray mb-2 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-brand-royal" /> Education
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {educationLevels.map((edu) => (
                  <button
                    key={edu.name}
                    onClick={() => { setEducation(edu); setShowResult(false); }}
                    className={`p-3 rounded-xl text-xs font-medium transition-all ${
                      education === edu ? "bg-brand-gradient-static text-white shadow-brand-btn" : "bg-brand-bg text-neutral-darkGray hover:bg-neutral-lightGray"
                    }`}
                  >
                    {edu.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowResult(true)}
              disabled={!career}
              className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Calculate Salary <IndianRupee className="h-5 w-5" />
            </button>
          </div>

          {result && careerData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-brand-navy to-brand-royal text-white text-center"
            >
              <p className="text-white/70 text-sm mb-2">Estimated Annual Salary</p>
              <p className="text-4xl font-bold mb-1">
                {formatSalary(result.min)} - {formatSalary(result.max)}
              </p>
              <p className="text-white/50 text-xs">
                Based on {careerData.title} &bull; {experience.label} &bull; {city.name} &bull; {education.name}
              </p>
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-xs text-white/50">
                  This is an estimate based on market data. Actual salaries vary by company, skills, and negotiation.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
