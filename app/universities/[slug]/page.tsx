"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Star, GraduationCap, Building, Briefcase,
  CheckCircle, TrendingUp, BookOpen, Award, Sparkles, ArrowRight,
  Loader2, Shield, Clock, IndianRupee, Download, MessageSquare,
  Users, Monitor, ChevronRight, Plus, FileText,
} from "lucide-react";
import LeadCaptureForm from "@/components/sections/LeadCaptureForm";

interface CollegeDetail {
  _id?: string;
  slug: string;
  name: string;
  shortName?: string;
  location: string;
  established: number;
  type: string;
  accreditation: string[];
  tagline?: string;
  description: string;
  rating: number;
  reviewCount: number;
  courseCount?: number;
  courses: string[];
  ugCourses?: string[];
  pgCourses?: string[];
  fees: string;
  placement: string;
  avgPackage: string;
  ranking: string;
  highlights: string[];
  infrastructure: string[];
  entranceExams: string[];
  topRecruiters: string[];
  learningMode: string[];
  logoUrl?: string;
  bannerUrl?: string;
  featured?: boolean;
  duration?: string;
  eligibility?: string;
  specializations?: string[];
  scholarship?: string;
}

const accreditationLogos: Record<string, string> = {
  "NAAC A++": "https://collegeadmission360.b-cdn.net/static/naac-a-plus-plus-logo.jpg",
  "NAAC A+": "https://collegeadmission360.b-cdn.net/static/naac-a-plus-plus-logo.jpg",
  "NAAC A": "https://collegeadmission360.b-cdn.net/static/naac-a-plus-plus-logo.jpg",
  "UGC-DEB": "https://collegeadmission360.b-cdn.net/static/ugc-deb-logo.jpg",
  "UGC": "https://collegeadmission360.b-cdn.net/static/ugc-logo.jpg",
  "AICTE": "https://collegeadmission360.b-cdn.net/static/aicte-logo.jpg",
  "AIU": "https://collegeadmission360.b-cdn.net/static/aiu-logo.jpg",
  "WES": "https://collegeadmission360.b-cdn.net/static/wes-logo.jpg",
};

const tabs = [
  "About", "Approvals", "Courses", "Fees", "Admission", "Placements", "Reviews", "FAQs",
];

export default function CollegeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [college, setCollege] = useState<CollegeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("About");

  useEffect(() => {
    fetch(`/api/colleges/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.college) {
          setCollege(data.college);
        }
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
          <Link
            href="/universities"
            className="btn-primary inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" /> Browse Colleges
          </Link>
        </div>
      </div>
    );
  }

  const pgCourses = college.pgCourses && college.pgCourses.length > 0
    ? college.pgCourses
    : college.courses.filter((c) =>
        ["MBA", "MCA", "M.Sc", "MA", "M.Com", "M.Tech", "Executive MBA", "MS"].some((p) =>
          c.toLowerCase().includes(p.toLowerCase())
        )
      );
  const ugCourses = college.ugCourses && college.ugCourses.length > 0
    ? college.ugCourses
    : college.courses.filter((c) => !pgCourses.includes(c));

  return (
    <div className="min-h-screen bg-brand-bg pt-16">
      {/* Hero Banner */}
      {college.bannerUrl ? (
        <section className="relative w-full">
          <div className="hidden lg:block w-full">
            <img
              src={college.bannerUrl}
              alt={`${college.name} banner`}
              className="w-full h-auto max-h-[320px] object-cover"
            />
          </div>
          <div className="block lg:hidden w-full h-40 bg-gradient-to-br from-brand-navy to-brand-royal flex items-center justify-center">
            <div className="text-center">
              <div className="h-14 w-14 mx-auto bg-white rounded-2xl shadow-lg flex items-center justify-center mb-2">
                {college.logoUrl ? (
                  <img
                    src={college.logoUrl}
                    alt={college.name}
                    className="h-10 w-10 object-contain rounded-lg"
                  />
                ) : (
                  <span className="text-xl font-bold text-brand-royal">
                    {(college.shortName || college.name).charAt(0)}
                  </span>
                )}
              </div>
              <p className="text-white font-semibold text-sm">
                {college.shortName || college.name}
              </p>
            </div>
          </div>
        </section>
      ) : (
        /* No banner — use gradient hero */
        <div className="bg-gradient-to-br from-brand-navy via-brand-navy to-brand-royal text-white">
          <div className="container-custom py-12">
            <Link
              href="/universities"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Colleges
            </Link>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <span className="text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full mb-3 inline-block">
                  {college.type === "ug" ? "Undergraduate" : "Postgraduate"}
                </span>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                  {college.name}
                </h1>
                {college.tagline && (
                  <p className="text-white/60 text-sm mt-2 italic">
                    "{college.tagline}"
                  </p>
                )}
                <div className="flex items-center gap-3 mt-3">
                  <span className="flex items-center gap-1 text-white/70">
                    <MapPin className="h-4 w-4" /> {college.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />{" "}
                    {college.rating}
                  </span>
                  <span className="text-white/70">
                    Est. {college.established}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2 mt-2">
                <span className="text-lg font-bold bg-white/10 px-4 py-2 rounded-xl">
                  {college.ranking}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Bar (below banner) */}
      <section className="w-full py-3 px-4 flex justify-center border-b bg-white">
        <div className="max-w-7xl w-full">
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
            {/* Accreditation logos */}
            <div className="flex items-center gap-3">
              {college.accreditation.slice(0, 4).map((acc) => {
                const logoUrl = accreditationLogos[acc];
                return logoUrl ? (
                  <img
                    key={acc}
                    src={logoUrl}
                    alt={acc}
                    className="h-8 w-auto object-contain grayscale hover:grayscale-0 transition-all cursor-pointer"
                    title={acc}
                  />
                ) : (
                  <span
                    key={acc}
                    className="text-xs font-medium px-2 py-1 rounded bg-brand-bg text-brand-royal"
                  >
                    {acc}
                  </span>
                );
              })}
            </div>

            <div className="h-6 hidden lg:block w-px bg-slate-200" />

            {/* Rating */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(college.rating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-300"
                  }`}
                />
              ))}
              <span className="text-sm text-slate-500 ml-1">
                {college.reviewCount?.toLocaleString() || 0} Reviews
              </span>
            </div>

            {/* Counsellor CTA */}
            <div className="lg:ml-auto">
              <Link
                href="/counselling"
                className="inline-flex items-center gap-1 text-sm text-brand-royal font-medium hover:underline"
              >
                Talk to Expert Counsellor <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-2 w-full lg:w-auto">
              <Link
                href="/counselling"
                className="btn-primary py-2 px-4 text-sm inline-flex items-center gap-1"
              >
                Apply Now <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/compare"
                className="px-4 py-2 rounded-xl text-sm font-medium border-2 border-brand-royal text-brand-royal hover:bg-brand-bg transition-colors inline-flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Compare
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Tab Navigation */}
      <div className="sticky top-16 z-30 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
          <div className="flex items-center min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-5 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "text-brand-royal font-semibold after:absolute after:left-0 after:-bottom-0 after:h-0.5 after:w-full after:bg-brand-royal"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <section className="container-custom py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* About Tab */}
            {activeTab === "About" && (
              <div className="max-w-4xl">
                <h2 className="text-2xl font-bold text-neutral-nearBlack mb-6">
                  <span className="text-brand-royal">About</span> {college.name}
                </h2>
                <div className="premium-card p-6">
                  <p className="text-neutral-mediumGray leading-relaxed mb-4">
                    {college.description}
                  </p>
                  <p className="text-neutral-mediumGray leading-relaxed mb-4">
                    {college.name} has been recognized as one of India's top
                    universities for online and distance education. The
                    university offers flexible learning options that allow
                    students to pursue their degrees while working or managing
                    other commitments.
                  </p>
                  <p className="text-neutral-mediumGray leading-relaxed">
                    The university's online programmes are designed with
                    industry-relevant curriculum, experienced faculty, and
                    robust learning management systems that provide students
                    with an engaging and comprehensive educational experience.
                  </p>
                </div>

                {/* Key Highlights */}
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-neutral-nearBlack mb-4">
                    University Highlights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        icon: Shield,
                        label: "Type",
                        value: college.accreditation.length > 0 ? "Deemed / Private" : "University",
                      },
                      {
                        icon: Clock,
                        label: "Established",
                        value: String(college.established),
                      },
                      {
                        icon: MapPin,
                        label: "Location",
                        value: college.location,
                      },
                      {
                        icon: Award,
                        label: "Accreditation",
                        value: college.accreditation[0] || "UGC Approved",
                      },
                      {
                        icon: GraduationCap,
                        label: "Programs",
                        value: `${college.courseCount || college.courses.length}+ Courses`,
                      },
                      {
                        icon: IndianRupee,
                        label: "Fees Range",
                        value: college.fees,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="premium-card p-4 flex items-center gap-3"
                      >
                        <div className="h-10 w-10 rounded-xl bg-brand-bg flex items-center justify-center">
                          <item.icon className="h-5 w-5 text-brand-royal" />
                        </div>
                        <div>
                          <p className="text-xs text-neutral-mediumGray">
                            {item.label}
                          </p>
                          <p className="font-semibold text-neutral-nearBlack text-sm">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Highlights list */}
                {college.highlights && college.highlights.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-neutral-nearBlack mb-4 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                      Why Choose {college.shortName || college.name}?
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {college.highlights.map((h) => (
                        <div
                          key={h}
                          className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200"
                        >
                          <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          <span className="text-sm text-emerald-800">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Infrastructure */}
                {college.infrastructure && college.infrastructure.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-neutral-nearBlack mb-4 flex items-center gap-2">
                      <Monitor className="h-5 w-5 text-brand-royal" />
                      Learning Infrastructure
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {college.infrastructure.map((item) => (
                        <span
                          key={item}
                          className="px-3.5 py-2 rounded-xl bg-brand-bg text-sm font-medium text-neutral-darkGray"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Duration & Eligibility */}
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-neutral-nearBlack mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-brand-royal" />
                    Duration & Eligibility
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="premium-card p-5 bg-gradient-to-br from-brand-bg to-brand-royal/5">
                      <p className="text-xs font-bold text-neutral-mediumGray uppercase tracking-wide mb-1">Programme Duration</p>
                      <p className="text-sm font-semibold text-neutral-nearBlack">{college.duration || "UG: 3 Years | PG: 2 Years"}</p>
                    </div>
                    <div className="premium-card p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/30">
                      <p className="text-xs font-bold text-neutral-mediumGray uppercase tracking-wide mb-1">Eligibility Criteria</p>
                      <p className="text-sm font-semibold text-neutral-nearBlack">{college.eligibility || "UG: 10+2 | PG: Bachelor's Degree"}</p>
                    </div>
                  </div>
                </div>

                {/* Scholarship */}
                {college.scholarship && (
                  <div className="mt-6 p-5 rounded-xl bg-amber-50 border border-amber-200">
                    <h3 className="text-lg font-bold text-neutral-nearBlack mb-2 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-amber-500" />
                      Scholarships & Financial Aid
                    </h3>
                    <p className="text-sm text-amber-800">{college.scholarship}</p>
                  </div>
                )}

                {/* Specializations */}
                {college.specializations && college.specializations.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-neutral-nearBlack mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5 text-brand-royal" />
                      MBA Specializations
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {college.specializations.map((spec) => (
                        <span
                          key={spec}
                          className="px-3.5 py-2 rounded-xl bg-brand-bg text-sm font-medium text-neutral-darkGray border border-brand-royal/10 hover:border-brand-royal/30 hover:bg-brand-royal/5 transition-all"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Approvals Tab */}
            {activeTab === "Approvals" && (
              <div className="max-w-4xl">
                <h2 className="text-2xl font-bold text-neutral-nearBlack mb-6">
                  <span className="text-brand-royal">Approvals</span> & Recognition
                </h2>
                <p className="text-neutral-mediumGray mb-6">
                  {college.name} is recognized by the following regulatory
                  bodies, ensuring that its degrees are valid for government
                  jobs, higher education, and private sector employment across
                  India and abroad.
                </p>
                {college.accreditation.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {college.accreditation.map((acc) => {
                      const logoUrl = accreditationLogos[acc];
                      return (
                        <div
                          key={acc}
                          className="premium-card p-4 text-center hover:shadow-brand-hover transition-all"
                        >
                          {logoUrl ? (
                            <img
                              src={logoUrl}
                              alt={acc}
                              className="h-12 w-auto mx-auto mb-2 object-contain"
                            />
                          ) : (
                            <div className="h-12 w-12 mx-auto mb-2 rounded-xl bg-brand-bg flex items-center justify-center">
                              <Shield className="h-6 w-6 text-brand-royal" />
                            </div>
                          )}
                          <p className="text-xs text-neutral-darkGray font-medium">
                            {acc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="premium-card p-6 text-center">
                    <Shield className="h-12 w-12 text-neutral-lightGray mx-auto mb-3" />
                    <p className="text-neutral-mediumGray">
                      {college.name} is a UGC-recognized university. All degrees
                      awarded are valid across India.
                    </p>
                  </div>
                )}
                <div className="mt-6 premium-card p-6">
                  <h3 className="font-semibold text-neutral-nearBlack mb-3">
                    Recognition for Government Jobs
                  </h3>
                  <p className="text-neutral-mediumGray text-sm">
                    Degrees from {college.name} are recognized by the University
                    Grants Commission (UGC), making them valid for all central
                    and state government jobs, UPSC, banking, railways, and
                    public sector undertakings. The university's online degrees
                    hold the same value as regular degrees as per UGC-DEB
                    regulations.
                  </p>
                </div>
              </div>
            )}

            {/* Courses Tab */}
            {activeTab === "Courses" && (
              <div className="max-w-5xl">
                <h2 className="text-2xl font-bold text-neutral-nearBlack mb-6">
                  <span className="text-brand-royal">Courses</span> Offered
                </h2>
                {pgCourses.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-neutral-nearBlack mb-3">
                      PG Programmes
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {pgCourses.map((course) => (
                        <div
                          key={course}
                          className="premium-card p-4 text-center group hover:shadow-brand-hover transition-all cursor-pointer"
                        >
                          <GraduationCap className="h-6 w-6 text-brand-royal mx-auto mb-2 group-hover:scale-110 transition-transform" />
                          <p className="font-medium text-neutral-nearBlack text-sm">
                            {course}
                          </p>
                          <p className="text-xs text-neutral-mediumGray mt-1">
                            {college.fees}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {ugCourses.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-neutral-nearBlack mb-3">
                      UG Programmes
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {ugCourses.map((course) => (
                        <div
                          key={course}
                          className="premium-card p-4 text-center group hover:shadow-brand-hover transition-all cursor-pointer"
                        >
                          <BookOpen className="h-6 w-6 text-brand-royal mx-auto mb-2 group-hover:scale-110 transition-transform" />
                          <p className="font-medium text-neutral-nearBlack text-sm">
                            {course}
                          </p>
                          <p className="text-xs text-neutral-mediumGray mt-1">
                            {college.fees}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {college.courses.length === 0 && (
                  <div className="text-center py-12">
                    <GraduationCap className="h-12 w-12 text-neutral-lightGray mx-auto mb-3" />
                    <p className="text-neutral-mediumGray">
                      Course information is being updated. Please check back
                      soon or contact our counsellors.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Fees Tab */}
            {activeTab === "Fees" && (
              <div className="max-w-4xl">
                <h2 className="text-2xl font-bold text-neutral-nearBlack mb-6">
                  <span className="text-brand-royal">Course</span> Fees
                </h2>
                <div className="premium-card p-6">
                  <p className="text-neutral-mediumGray mb-4">
                    Course fees at {college.name} range from{" "}
                    <strong className="text-neutral-nearBlack">
                      {college.fees}
                    </strong>{" "}
                    depending on the programme. The university offers EMI
                    options for most courses to make education affordable.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {college.courses.slice(0, 6).map((course) => (
                      <div
                        key={course}
                        className="flex items-center justify-between p-4 rounded-xl border border-neutral-lightGray hover:border-brand-royal/30 transition-all"
                      >
                        <div>
                          <p className="font-semibold text-neutral-nearBlack text-sm">
                            {course}
                          </p>
                          <p className="text-xs text-neutral-mediumGray">
                            {college.fees}
                          </p>
                        </div>
                        <Link
                          href="/counselling"
                          className="text-xs font-medium text-brand-royal hover:underline"
                        >
                          Get Details
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
                  <IndianRupee className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    EMI options available starting from ₹3,000/month. No-cost
                    EMI available on select courses.
                  </p>
                </div>
              </div>
            )}

            {/* Admission Tab */}
            {activeTab === "Admission" && (
              <div className="max-w-4xl">
                <h2 className="text-2xl font-bold text-neutral-nearBlack mb-6">
                  <span className="text-brand-royal">Admission</span> Open 2026
                </h2>
                <div className="premium-card p-6">
                  <p className="text-neutral-mediumGray mb-4">
                    Admissions are currently open for the 2026 academic session
                    at {college.name}. Apply now to secure your seat in the
                    programme of your choice.
                  </p>
                  <div className="space-y-3 mb-6">
                    {[
                      {
                        step: "1",
                        text: "Fill the online application form with your personal and academic details",
                      },
                      {
                        step: "2",
                        text: "Upload required documents (10th, 12th, graduation marksheets)",
                      },
                      {
                        step: "3",
                        text: "Pay the application fee to complete the registration",
                      },
                      {
                        step: "4",
                        text: "Receive admission confirmation via email within 24-48 hours",
                      },
                    ].map((s) => (
                      <div key={s.step} className="flex items-start gap-3">
                        <div className="h-7 w-7 rounded-full bg-brand-royal/10 text-brand-royal flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {s.step}
                        </div>
                        <p className="text-sm text-neutral-mediumGray pt-1">
                          {s.text}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/counselling"
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    Apply Now <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>

                {/* Entrance Exams */}
                {college.entranceExams && college.entranceExams.length > 0 && (
                  <div className="mt-6 premium-card p-6">
                    <h3 className="font-semibold text-neutral-nearBlack mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-brand-royal" />
                      Entrance Exams
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {college.entranceExams.map((exam) => (
                        <span
                          key={exam}
                          className="px-3 py-1.5 rounded-lg bg-brand-bg text-sm font-medium text-brand-royal"
                        >
                          {exam}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Placements Tab */}
            {activeTab === "Placements" && (
              <div className="max-w-4xl">
                <h2 className="text-2xl font-bold text-neutral-nearBlack mb-6">
                  <span className="text-brand-royal">Placement</span> Partners
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {college.topRecruiters.map((company) => (
                    <div
                      key={company}
                      className="premium-card p-4 text-center hover:shadow-brand-hover transition-all"
                    >
                      <Building className="h-8 w-8 text-brand-royal mx-auto mb-2" />
                      <p className="font-medium text-neutral-nearBlack text-sm">
                        {company}
                      </p>
                    </div>
                  ))}
                </div>
                {/* Placement Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="premium-card p-5 text-center bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200">
                    <TrendingUp className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-emerald-700">
                      {college.placement}
                    </p>
                    <p className="text-xs text-emerald-600">Placement Rate</p>
                  </div>
                  <div className="premium-card p-5 text-center bg-gradient-to-br from-brand-bg to-brand-royal/10 border border-brand-royal/20">
                    <IndianRupee className="h-8 w-8 text-brand-royal mx-auto mb-2" />
                    <p className="text-2xl font-bold text-brand-royal">
                      {college.avgPackage}
                    </p>
                    <p className="text-xs text-brand-royal">Average Package</p>
                  </div>
                  <div className="premium-card p-5 text-center bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200">
                    <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-700">
                      {college.topRecruiters.length}+
                    </p>
                    <p className="text-xs text-purple-600">Top Recruiters</p>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "Reviews" && (
              <div className="max-w-4xl">
                <h2 className="text-2xl font-bold text-neutral-nearBlack mb-2">
                  <span className="text-brand-royal">Student</span> Reviews
                </h2>
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(college.rating)
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-neutral-darkGray">
                    {college.rating} out of 5
                  </span>
                  <span className="text-sm text-neutral-mediumGray">
                    ({college.reviewCount?.toLocaleString() || 0} reviews)
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      rating: 5,
                      name: "Rahul Sharma",
                      course: "MBA Program",
                      text: "Excellent online learning experience. The faculty is very supportive and the LMS platform is easy to use. Placement assistance was genuinely helpful in getting my current job.",
                    },
                    {
                      rating: 4.5,
                      name: "Priya Patel",
                      course: "BBA Program",
                      text: "Great university with industry-relevant curriculum. The live sessions are interactive and the recorded lectures help when you miss a class. Highly recommended for working professionals.",
                    },
                    {
                      rating: 5,
                      name: "Amit Kumar",
                      course: "MCA Program",
                      text: "The online learning platform is world-class. Virtual labs work perfectly and the project work is industry-aligned. Already got placed before course completion.",
                    },
                    {
                      rating: 4,
                      name: "Sneha Reddy",
                      course: "B.Com Program",
                      text: "Good value for money. The study material is comprehensive and exams are conducted smoothly online. Student support responds within 24 hours for any queries.",
                    },
                  ].map((review, i) => (
                    <div key={i} className="premium-card p-5">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, j) => (
                          <Star
                            key={j}
                            className={`h-3.5 w-3.5 ${
                              j < Math.round(review.rating)
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-neutral-darkGray mb-3 leading-relaxed">
                        "{review.text}"
                      </p>
                      <div className="pt-3 border-t border-neutral-lightGray">
                        <p className="font-semibold text-neutral-nearBlack text-sm">
                          {review.name}
                        </p>
                        <p className="text-xs text-neutral-mediumGray">
                          {review.course}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQs Tab */}
            {activeTab === "FAQs" && (
              <div className="max-w-4xl">
                <h2 className="text-2xl font-bold text-neutral-nearBlack mb-6">
                  <span className="text-brand-royal">Frequently Asked</span>{" "}
                  Questions
                </h2>
                <div className="space-y-3">
                  {[
                    {
                      q: `Is ${college.name} UGC approved?`,
                      a: `Yes, ${college.name} is approved by UGC-DEB and recognized by the Government of India. Degrees from this university are valid for government jobs and higher education.`,
                    },
                    {
                      q: "Are online degrees valid for government jobs?",
                      a: "Yes, UGC-approved online degrees are valid for all government and private sector jobs, including UPSC, banking, railways, and state PSC examinations.",
                    },
                    {
                      q: "Can I pursue the course while working?",
                      a: "Yes, all online programmes are specifically designed for working professionals with flexible schedules. You can access lectures and study materials anytime, anywhere.",
                    },
                    {
                      q: "How are exams conducted?",
                      a: "Exams are conducted online through proctored mode via the university's LMS platform. You can take exams from home with a webcam and stable internet connection.",
                    },
                    {
                      q: "Is there placement assistance?",
                      a: `Yes, ${college.name} provides placement assistance to all enrolled students. The university has a dedicated placement cell with connections to ${college.topRecruiters.slice(0, 3).join(", ")} and other top companies.`,
                    },
                    {
                      q: "What is the duration of online programmes?",
                      a: "UG programmes are typically 3 years, and PG programmes are 2 years. However, many universities offer flexibility with a maximum duration of 4-5 years to complete the degree.",
                    },
                  ].map((faq, i) => (
                    <div key={i} className="premium-card p-5">
                      <p className="font-semibold text-neutral-nearBlack text-sm mb-1">
                        {faq.q}
                      </p>
                      <p className="text-sm text-neutral-mediumGray">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-brand-navy to-brand-royal py-16 mt-8">
        <div className="container-custom text-center max-w-2xl mx-auto">
          <Sparkles className="h-10 w-10 text-brand-sky mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Want to get into {college.shortName || college.name.split(" ")[0]}?
          </h2>
          <p className="text-white/70 mb-6">
            Get expert guidance on admission strategy, course selection, and
            application process from our experienced counsellors.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/counselling"
              className="btn-primary bg-white text-brand-navy hover:bg-brand-sky px-8 py-3 text-lg"
            >
              Book Free Counselling <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/compare"
              className="px-6 py-3 rounded-xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="h-5 w-5" /> Compare Colleges
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
