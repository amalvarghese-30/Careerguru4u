"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, MapPin, IndianRupee, Star, GraduationCap, Building, Briefcase, CheckCircle,
  TrendingUp, BookOpen, Award, Sparkles, ArrowRight, Loader2,
} from "lucide-react";
import LeadCaptureForm from "@/components/sections/LeadCaptureForm";

interface CollegeDetail {
  _id?: string; id?: string; name: string; slug: string; location: string; rating: number;
  courses: string[]; fees: string; placement: string; avgPackage: string;
  ranking: string; type: string; description: string; highlights: string[];
  infrastructure: string[]; entranceExams: string[]; topRecruiters: string[];
  established: string;
}
  "iit-bombay": {
    id: "iit-bombay", name: "Indian Institute of Technology Bombay", slug: "iit-bombay",
    location: "Mumbai, Maharashtra", rating: 4.8,
    courses: ["B.Tech CS", "B.Tech Mechanical", "B.Tech Electrical", "B.Tech Chemical", "M.Tech", "PhD"],
    fees: "₹2.2L - ₹8L", placement: "94%", avgPackage: "₹23.5L", ranking: "NIRF #3", type: "ug",
    description: "IIT Bombay is one of India's premier engineering institutions, known for its rigorous academic environment, world-class research output, and stellar placement records. Located in Powai, Mumbai, it offers undergraduate, postgraduate, and doctoral programs in engineering, science, design, and management.",
    highlights: ["NIRF #3 in Engineering", "94% placement rate", "₹23.5L avg package", "Host to Mood Indigo — Asia's largest college fest", "Global alumni network"],
    infrastructure: ["State-of-the-art labs", "Central library with 6L+ volumes", "Campus-wide WiFi", "Olympic-size swimming pool", "Student activity center"],
    entranceExams: ["JEE Advanced", "GATE", "UCEED (Design)"],
    topRecruiters: ["Google", "Microsoft", "Goldman Sachs", "McKinsey", "Tower Research", "Uber"],
    established: "1958",
  },
  "iit-delhi": {
    id: "iit-delhi", name: "Indian Institute of Technology Delhi", slug: "iit-delhi",
    location: "Delhi, NCR", rating: 4.8,
    courses: ["B.Tech CS", "B.Tech EE", "B.Tech Mechanical", "M.Tech", "MBA"],
    fees: "₹2.2L - ₹8L", placement: "93%", avgPackage: "₹22.8L", ranking: "NIRF #2", type: "ug",
    description: "IIT Delhi, established in 1961, is consistently ranked among the top 2 engineering colleges in India. With a sprawling 320-acre campus in Hauz Khas, Delhi, it offers world-class education across engineering, sciences, humanities, and management.",
    highlights: ["NIRF #2 in Engineering", "93% placement rate", "₹22.8L avg package", "Strong entrepreneurial ecosystem", "Located in the national capital"],
    infrastructure: ["Advanced research parks", "Incubation center", "Modern hostels", "Sports complex", "Central library"],
    entranceExams: ["JEE Advanced", "GATE"],
    topRecruiters: ["Google", "Amazon", "McKinsey", "Microsoft", "Goldman Sachs"],
    established: "1961",
  },
  "iit-madras": {
    id: "iit-madras", name: "Indian Institute of Technology Madras", slug: "iit-madras",
    location: "Chennai, Tamil Nadu", rating: 4.9,
    courses: ["B.Tech CS", "B.Tech EE", "B.Tech Mechanical", "M.Tech", "PhD"],
    fees: "₹2L - ₹7.5L", placement: "95%", avgPackage: "₹24.2L", ranking: "NIRF #1", type: "ug",
    description: "IIT Madras is ranked #1 in India's NIRF rankings for 6 consecutive years. Located in a 620-acre forested campus with a deer park, it offers an unmatched blend of academic excellence, research innovation, and student life.",
    highlights: ["NIRF #1 overall", "95% placement rate", "₹24.2L avg package", "Largest IIT campus (620 acres)", "Eco-friendly deer park campus"],
    infrastructure: ["Research Park", "CFI labs", "Olympic swimming pool", "Stadium", "Digital library"],
    entranceExams: ["JEE Advanced", "GATE"],
    topRecruiters: ["Microsoft", "Google", "Qualcomm", "Shell", "ISRO"],
    established: "1959",
  },
  "bits-pilani": {
    id: "bits-pilani", name: "Birla Institute of Technology & Science Pilani", slug: "bits-pilani",
    location: "Pilani, Rajasthan", rating: 4.7,
    courses: ["B.E CS", "B.E Mechanical", "B.E EEE", "M.Sc Economics", "MBA"],
    fees: "₹4L - ₹16L", placement: "92%", avgPackage: "₹18.5L", ranking: "NIRF #25", type: "ug",
    description: "BITS Pilani is one of India's most prestigious private engineering universities, known for its flexible curriculum, zero attendance policy, and practice school industry immersion program. It consistently produces top talent for India's tech and consulting industries.",
    highlights: ["Flexible academic structure", "Practice School program", "92% placement rate", "Strong startup culture", "All-India campus network"],
    infrastructure: ["Innovation labs", "Central library", "Sports facilities", "24/7 labs", "Campus-wide WiFi"],
    entranceExams: ["BITSAT", "BITS HD"],
    topRecruiters: ["Google", "Microsoft", "Amazon", "Deloitte", "Uber"],
    established: "1964",
  },
  "iim-ahmedabad": {
    id: "iim-ahmedabad", name: "Indian Institute of Management Ahmedabad", slug: "iim-ahmedabad",
    location: "Ahmedabad, Gujarat", rating: 4.9,
    courses: ["MBA", "PGP", "FPM", "ePGP"],
    fees: "₹12L - ₹25L", placement: "100%", avgPackage: "₹32.5L", ranking: "NIRF #1 (Management)", type: "pg",
    description: "IIM Ahmedabad is India's premier business school and consistently ranked #1 in management education. With its iconic Louis Kahn campus and rigorous case-study pedagogy, IIMA produces India's top business leaders entering consulting, finance, and technology.",
    highlights: ["#1 Management school in India", "100% placement record", "₹32.5L average package", "Case-study pedagogy", "Powerful alumni network"],
    infrastructure: ["Louis Kahn heritage campus", "Vikram Sarabhai Library", "Sports complex", "Student dorms", "Innovation centre"],
    entranceExams: ["CAT", "GMAT"],
    topRecruiters: ["McKinsey", "BCG", "Bain", "Goldman Sachs", "Amazon"],
    established: "1961",
  },
  "iisc-bangalore": {
    id: "iisc-bangalore", name: "Indian Institute of Science", slug: "iisc-bangalore",
    location: "Bangalore, Karnataka", rating: 4.8,
    courses: ["M.Tech", "M.Sc", "PhD", "Integrated PhD"],
    fees: "₹50K - ₹1.5L", placement: "95%", avgPackage: "₹18.5L", ranking: "NIRF #1 (University)", type: "pg",
    description: "IISc Bangalore is India's premier research institution. Founded by J.N. Tata, it is consistently ranked as the world's top research university per capita. Located in the heart of India's tech hub, it offers unmatched research opportunities in science and engineering.",
    highlights: ["World's #1 research per capita", "95% placement rate", "₹18.5L avg package", "Located in Bangalore tech hub", "Founded by J.N. Tata"],
    infrastructure: ["Advanced research labs", "Supercomputer facility", "Central library", "Botanical garden", "Innovation centre"],
    entranceExams: ["GATE", "IIT JAM", "CSIR NET", "IISc entrance test"],
    topRecruiters: ["Google", "Microsoft", "ISRO", "DRDO", "Intel"],
    established: "1909",
  },
  "fms-delhi": {
    id: "fms-delhi", name: "Faculty of Management Studies", slug: "fms-delhi",
    location: "Delhi, NCR", rating: 4.7,
    courses: ["MBA", "MBA Executive", "PhD"],
    fees: "₹1.5L - ₹2L", placement: "100%", avgPackage: "₹29.5L", ranking: "NIRF #6 (Management)", type: "pg",
    description: "FMS Delhi offers arguably the highest ROI MBA in India — a top-tier management education at a fraction of the cost of other leading B-schools. Located in Delhi University's North Campus, it has a 100% placement record with packages rivaling the best in India.",
    highlights: ["Best ROI MBA in India", "100% placement", "₹29.5L avg package", "DU North Campus", "Fees just ₹1.5-2L"],
    infrastructure: ["Campus library", "Computer labs", "Hostel facilities", "Sports grounds"],
    entranceExams: ["CAT"],
    topRecruiters: ["McKinsey", "BCG", "Amazon", "Google", "American Express"],
    established: "1954",
  },
};

export default function CollegeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [college, setCollege] = useState<CollegeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/colleges/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.college) setCollege(data.college);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg pt-16">
        <Loader2 className="h-10 w-10 text-brand-royal animate-spin" />
      </div>
    );
  }

  if (!college) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg pt-16">
        <div className="text-center">
          <Building className="h-16 w-16 text-neutral-lightGray mx-auto mb-4" />
          <h1 className="heading-section text-3xl mb-3">College Not Found</h1>
          <Link href="/universities" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" /> Browse Colleges
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg pt-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-navy via-brand-navy to-brand-royal text-white">
        <div className="container-custom py-12">
          <Link href="/universities" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Colleges
          </Link>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <span className="text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full mb-3 inline-block">
                {college.type === "ug" ? "Undergraduate" : "Postgraduate"}
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">{college.name}</h1>
              <div className="flex items-center gap-3 mt-3">
                <span className="flex items-center gap-1 text-white/70"><MapPin className="h-4 w-4" /> {college.location}</span>
                <span className="flex items-center gap-1"><Star className="h-4 w-4 text-amber-400 fill-amber-400" /> {college.rating}</span>
                <span className="text-white/70">Est. {college.established}</span>
              </div>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2 mt-2">
              <span className="text-lg font-bold bg-white/10 px-4 py-2 rounded-xl">{college.ranking}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="premium-card p-6">
              <h2 className="heading-card text-xl mb-3">About the College</h2>
              <p className="text-neutral-mediumGray leading-relaxed">{college.description}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: IndianRupee, label: "Fees", value: college.fees, color: "from-blue-500 to-cyan-500" },
                { icon: Briefcase, label: "Placement", value: college.placement, color: "from-emerald-500 to-teal-500" },
                { icon: TrendingUp, label: "Avg Package", value: college.avgPackage, color: "from-brand-royal to-brand-electric" },
                { icon: Star, label: "Rating", value: college.rating + "/5", color: "from-amber-500 to-yellow-500" },
              ].map((stat) => (
                <div key={stat.label} className="glass-card p-4 text-center">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-lg font-bold text-neutral-nearBlack">{stat.value}</p>
                  <p className="text-xs text-neutral-mediumGray">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Highlights */}
            <div className="premium-card p-6">
              <h2 className="heading-card text-xl mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-brand-royal" />
                Highlights
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {college.highlights.map((h) => (
                  <div key={h} className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm text-emerald-800">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Infrastructure */}
            <div className="premium-card p-6">
              <h2 className="heading-card text-xl mb-4 flex items-center gap-2">
                <Building className="h-5 w-5 text-brand-royal" />
                Campus & Infrastructure
              </h2>
              <div className="flex flex-wrap gap-2">
                {college.infrastructure.map((item) => (
                  <span key={item} className="px-3.5 py-2 rounded-xl bg-brand-bg text-sm font-medium text-neutral-darkGray">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Top Recruiters */}
            <div className="premium-card p-6">
              <h2 className="heading-card text-xl mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-brand-royal" />
                Top Recruiters
              </h2>
              <div className="flex flex-wrap gap-2">
                {college.topRecruiters.map((r) => (
                  <span key={r} className="px-4 py-2 rounded-xl bg-white border border-neutral-lightGray text-sm font-medium text-neutral-darkGray hover:border-brand-royal transition-colors">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-neutral-nearBlack mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-mediumGray">Type</span>
                  <span className="font-medium text-neutral-nearBlack">{college.type === "ug" ? "Undergraduate" : "Postgraduate"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-mediumGray">Established</span>
                  <span className="font-medium text-neutral-nearBlack">{college.established}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-mediumGray">Location</span>
                  <span className="font-medium text-neutral-nearBlack">{college.location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-mediumGray">Ranking</span>
                  <span className="font-medium text-brand-royal">{college.ranking}</span>
                </div>
              </div>
            </div>

            {/* Courses */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-neutral-nearBlack mb-4 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-brand-royal" />
                Courses Offered
              </h3>
              <div className="space-y-2">
                {college.courses.map((c) => (
                  <div key={c} className="p-2.5 rounded-lg bg-brand-bg text-sm font-medium text-neutral-darkGray">
                    {c}
                  </div>
                ))}
              </div>
            </div>

            {/* Entrance Exams */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-neutral-nearBlack mb-4 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-brand-royal" />
                Entrance Exams
              </h3>
              <div className="space-y-2">
                {college.entranceExams.map((exam) => (
                  <div key={exam} className="p-2.5 rounded-lg bg-brand-bg text-sm font-medium text-brand-royal">
                    {exam}
                  </div>
                ))}
              </div>
            </div>

            <LeadCaptureForm source="College Page" interest={college.name} />

            {/* CTA */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-navy to-brand-royal text-white text-center">
              <Sparkles className="h-8 w-8 text-brand-sky mx-auto mb-3" />
              <p className="font-semibold mb-1">Want to get into {college.name.split(" ")[0]}?</p>
              <p className="text-white/70 text-xs mb-4">Get expert guidance on admission strategy</p>
              <Link href="/counselling" className="inline-flex items-center gap-2 bg-white text-brand-navy px-5 py-2 rounded-xl text-sm font-bold hover:bg-brand-sky transition-colors">
                Book Counselling <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
