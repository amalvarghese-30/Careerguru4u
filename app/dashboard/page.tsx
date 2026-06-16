"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/auth-store";
import {
  LayoutDashboard, Compass, GraduationCap, Star, Heart, Award,
  PhoneCall, TrendingUp, ArrowRight, LogOut, Briefcase, Building, FileText, Download
} from "lucide-react";

type Tab = "overview" | "careers" | "colleges" | "counselling" | "resumes";

interface Bookmark {
  _id: string; itemId: string; itemType: "career" | "college";
  title: string; createdAt: string;
}

interface CounsellingRequest {
  _id: string; status: string; createdAt: string; message: string;
}

export default function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [mounted, setMounted] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [counselling, setCounselling] = useState<CounsellingRequest[]>([]);
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => document.cookie.match(/cg-auth-token=([^;]+)/)?.[1] || "";

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/user/dashboard", {
        headers: { Authorization: `Bearer ${getToken()}` },
        credentials: "include",
      });
      const data = await res.json();
      setBookmarks(data.bookmarks || []);
      setCounselling(data.counsellingRequests || []);
      setResumes(data.resumes || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (isAuthenticated) fetchDashboard(); }, [isAuthenticated, fetchDashboard]);

  if (!mounted) return null;

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg pt-16">
        <div className="text-center">
          <div className="h-20 w-20 rounded-3xl bg-brand-gradient-static flex items-center justify-center mx-auto mb-6 shadow-xl">
            <LayoutDashboard className="h-10 w-10 text-white" />
          </div>
          <h1 className="heading-section text-3xl mb-3">Access Your Dashboard</h1>
          <p className="text-neutral-mediumGray mb-8 max-w-md mx-auto">
            Login to access your saved careers, colleges, career match results, and counselling requests.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/login" className="btn-primary inline-flex items-center gap-2">
              Login <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/register" className="btn-outline inline-flex items-center gap-2">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const savedCareers = bookmarks.filter((b) => b.itemType === "career");
  const savedColleges = bookmarks.filter((b) => b.itemType === "college");

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "careers", label: "Saved Careers", icon: Compass },
    { key: "colleges", label: "Saved Colleges", icon: Building },
    { key: "counselling", label: "Counselling", icon: PhoneCall },
    { key: "resumes", label: "My Resumes", icon: FileText },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    assigned: "bg-blue-100 text-blue-700",
    scheduled: "bg-purple-100 text-purple-700",
    completed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg pt-16">
        <div className="container-custom py-8">
          <div className="premium-card p-6 mb-8 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-slate-200" />
              <div className="space-y-2">
                <div className="h-6 w-40 bg-slate-200 rounded" />
                <div className="h-4 w-60 bg-slate-100 rounded" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card p-4 animate-pulse">
                <div className="h-10 w-10 bg-slate-200 rounded-xl mx-auto mb-3" />
                <div className="h-6 w-8 bg-slate-200 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg pt-16">
      <div className="container-custom py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="premium-card p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-brand-gradient-static flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-brand-royal/20">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="heading-section text-2xl">Welcome, {user.fullName}</h1>
                <p className="text-neutral-mediumGray text-sm">{user.email} &bull; {user.board} &bull; {user.class}</p>
              </div>
            </div>
            <button onClick={logout} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Heart, label: "Saved Careers", value: savedCareers.length, color: "from-brand-royal to-brand-electric" },
            { icon: Building, label: "Saved Colleges", value: savedColleges.length, color: "from-brand-electric to-brand-sky" },
            { icon: Award, label: "Match Results", value: "0", color: "from-purple-500 to-pink-500" },
            { icon: PhoneCall, label: "Counselling", value: counselling.length, color: "from-emerald-500 to-teal-500" },
            { icon: FileText, label: "My Resumes", value: resumes.length, color: "from-rose-500 to-orange-500" },
          ].map((stat) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 text-center">
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-brand-navy">{stat.value}</div>
              <div className="text-xs text-neutral-mediumGray">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-1 mb-8 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key ? "bg-brand-gradient-static text-white shadow-brand-btn" : "text-neutral-darkGray hover:bg-white hover:text-brand-royal"
              }`}
            >
              <tab.icon className="h-4 w-4" />{tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="heading-card text-xl flex items-center gap-2"><Compass className="h-5 w-5 text-brand-royal" /> Saved Careers</h2>
                <button onClick={() => setActiveTab("careers")} className="text-sm text-brand-royal font-medium hover:underline">View All</button>
              </div>
              {savedCareers.length === 0 ? (
                <div className="glass-card p-8 text-center text-neutral-mediumGray">
                  <Heart className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p>No saved careers yet</p>
                  <Link href="/careers" className="text-brand-royal text-sm hover:underline">Browse Careers</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {savedCareers.slice(0, 3).map((b) => (
                    <div key={b._id} className="glass-card p-5">
                      <h3 className="font-semibold text-neutral-nearBlack">{b.title}</h3>
                      <p className="text-xs text-neutral-mediumGray mt-1">Saved {new Date(b.createdAt).toLocaleDateString("en-IN")}</p>
                      <Link href={`/careers/${b.itemId}`} className="text-sm text-brand-royal font-medium hover:underline mt-2 inline-block">View Details</Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="heading-card text-xl flex items-center gap-2"><Building className="h-5 w-5 text-brand-royal" /> Saved Colleges</h2>
                <button onClick={() => setActiveTab("colleges")} className="text-sm text-brand-royal font-medium hover:underline">View All</button>
              </div>
              {savedColleges.length === 0 ? (
                <div className="glass-card p-8 text-center text-neutral-mediumGray">
                  <Building className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p>No saved colleges yet</p>
                  <Link href="/universities" className="text-brand-royal text-sm hover:underline">Browse Colleges</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedColleges.slice(0, 2).map((b) => (
                    <div key={b._id} className="glass-card p-5 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-neutral-nearBlack">{b.title}</h3>
                        <p className="text-xs text-neutral-mediumGray">Saved {new Date(b.createdAt).toLocaleDateString("en-IN")}</p>
                      </div>
                      <Link href={`/universities/${b.itemId}`} className="text-sm text-brand-royal font-medium hover:underline">View</Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "careers" && (
          <div className="space-y-4">
            <h2 className="heading-card text-xl mb-4">Your Saved Careers ({savedCareers.length})</h2>
            {savedCareers.length === 0 ? (
              <div className="premium-card p-8 text-center text-neutral-mediumGray">
                <Heart className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p>No saved careers yet. Browse careers and save the ones you like.</p>
                <Link href="/careers" className="btn-primary inline-flex items-center gap-2 mt-4">Browse Careers <ArrowRight className="h-4 w-4" /></Link>
              </div>
            ) : savedCareers.map((b) => (
              <div key={b._id} className="premium-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-neutral-nearBlack text-lg">{b.title}</h3>
                  <p className="text-sm text-neutral-mediumGray">Saved on {new Date(b.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                <Link href={`/careers/${b.itemId}`} className="btn-primary py-2 px-4 text-sm">View Details</Link>
              </div>
            ))}
          </div>
        )}

        {activeTab === "colleges" && (
          <div className="space-y-4">
            <h2 className="heading-card text-xl mb-4">Your Saved Colleges ({savedColleges.length})</h2>
            {savedColleges.length === 0 ? (
              <div className="premium-card p-8 text-center text-neutral-mediumGray">
                <Building className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p>No saved colleges yet. Explore colleges and save the ones you like.</p>
                <Link href="/universities" className="btn-primary inline-flex items-center gap-2 mt-4">Browse Colleges <ArrowRight className="h-4 w-4" /></Link>
              </div>
            ) : savedColleges.map((b) => (
              <div key={b._id} className="premium-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-neutral-nearBlack text-lg">{b.title}</h3>
                  <p className="text-sm text-neutral-mediumGray">Saved on {new Date(b.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                <Link href={`/universities/${b.itemId}`} className="btn-primary py-2 px-4 text-sm">View Details</Link>
              </div>
            ))}
          </div>
        )}

        {activeTab === "counselling" && (
          <div className="space-y-4">
            <h2 className="heading-card text-xl mb-4">Your Counselling Requests ({counselling.length})</h2>
            {counselling.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-2xl bg-brand-bg flex items-center justify-center mx-auto mb-4">
                  <PhoneCall className="h-8 w-8 text-brand-royal" />
                </div>
                <h3 className="heading-card text-xl mb-2">No Counselling Requests Yet</h3>
                <p className="text-neutral-mediumGray mb-6">Book a free session with our expert counsellors.</p>
                <Link href="/counselling" className="btn-primary inline-flex items-center gap-2">
                  Book Free Session <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            ) : counselling.map((r) => (
              <div key={r._id} className="premium-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-neutral-nearBlack">Counselling Request</h3>
                  <p className="text-sm text-neutral-mediumGray">{r.message || "No message"} &bull; {new Date(r.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusColors[r.status] || "bg-slate-100 text-slate-600"}`}>{r.status}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "resumes" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="heading-card text-xl">My Resumes ({resumes.length})</h2>
              <Link href="/ai-tools/resume-builder" className="btn-primary inline-flex items-center gap-2 py-2 px-4 text-sm">
                <FileText className="h-4 w-4" /> Create New
              </Link>
            </div>
            {resumes.length === 0 ? (
              <div className="premium-card p-8 text-center text-neutral-mediumGray">
                <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p>No saved resumes yet. Build your first ATS-optimized resume.</p>
                <Link href="/ai-tools/resume-builder" className="btn-primary inline-flex items-center gap-2 mt-4">
                  Build Resume <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : resumes.map((r) => (
              <div key={r._id} className="premium-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-nearBlack">
                      {r.personalInfo?.fullName || "Untitled Resume"}
                    </h3>
                    <p className="text-sm text-neutral-mediumGray">
                      {r.templateId && <span className="capitalize">{r.templateId} &bull; </span>}
                      Updated {new Date(r.updatedAt).toLocaleDateString("en-IN")}
                    </p>
                    {r.atsScore != null && (
                      <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        r.atsScore >= 70 ? "bg-emerald-100 text-emerald-700" :
                        r.atsScore >= 40 ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        ATS Score: {r.atsScore}/100
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/ai-tools/resume-builder`}
                    className="text-sm text-brand-royal font-medium hover:underline px-3 py-1.5"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={async () => {
                      try {
                        await fetch(`/api/resume/${r._id}`, {
                          method: "DELETE",
                          headers: { Authorization: `Bearer ${getToken()}` },
                          credentials: "include",
                        });
                        fetchDashboard();
                      } catch (e) { console.error(e); }
                    }}
                    className="text-sm text-red-500 font-medium hover:underline px-3 py-1.5"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
