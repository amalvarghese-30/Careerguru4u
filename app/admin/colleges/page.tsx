"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit, Trash2, MapPin, GraduationCap, X, CheckCircle, Eye, EyeOff } from "lucide-react";

interface College {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  shortName?: string;
  location: string;
  established?: string | number;
  type: string;
  accreditation?: string[];
  tagline?: string;
  description?: string;
  rating: number;
  reviewCount?: number;
  courseCount?: number;
  courses: string[];
  ugCourses?: string[];
  pgCourses?: string[];
  fees: string;
  placement: string;
  avgPackage: string;
  ranking: string;
  highlights?: string[];
  infrastructure?: string[];
  entranceExams?: string[];
  topRecruiters?: string[];
  learningMode?: string[];
  logoUrl?: string;
  bannerUrl?: string;
  category?: string;
  featured?: boolean;
  hidden?: boolean;
  duration?: string;
  eligibility?: string;
  specializations?: string[];
  scholarship?: string;
}

// Helper to split comma-separated input into string array
function splitTags(input: string): string[] {
  return input.split(",").map((s) => s.trim()).filter(Boolean);
}

function joinTags(arr: string[] | undefined): string {
  return (arr || []).join(", ");
}

export default function CollegesAdminPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<College | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const fetchColleges = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/colleges", { credentials: "include" });
      const data = await res.json();
      setColleges(data.colleges || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchColleges(); }, [fetchColleges]);

  const filtered = colleges.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);

    const body: Record<string, unknown> = {
      name: fd.get("name"),
      slug: fd.get("slug"),
      shortName: fd.get("shortName") || undefined,
      location: fd.get("location"),
      type: fd.get("type") || "ug",
      rating: Number(fd.get("rating")) || 0,
      reviewCount: Number(fd.get("reviewCount")) || 0,
      courseCount: Number(fd.get("courseCount")) || 0,
      fees: fd.get("fees") || "",
      placement: fd.get("placement") || "",
      avgPackage: fd.get("avgPackage") || "",
      ranking: fd.get("ranking") || "",
      tagline: fd.get("tagline") || "",
      description: fd.get("description") || "",
      established: fd.get("established") || "",
      duration: fd.get("duration") || "",
      eligibility: fd.get("eligibility") || "",
      scholarship: fd.get("scholarship") || "",
      logoUrl: fd.get("logoUrl") || "",
      bannerUrl: fd.get("bannerUrl") || "",
      category: fd.get("category") || undefined,
      featured: fd.get("featured") === "true",
      hidden: fd.get("hidden") === "true",
      courses: splitTags(String(fd.get("courses") || "")),
      ugCourses: splitTags(String(fd.get("ugCourses") || "")),
      pgCourses: splitTags(String(fd.get("pgCourses") || "")),
      accreditation: splitTags(String(fd.get("accreditation") || "")),
      highlights: splitTags(String(fd.get("highlights") || "")),
      infrastructure: splitTags(String(fd.get("infrastructure") || "")),
      entranceExams: splitTags(String(fd.get("entranceExams") || "")),
      topRecruiters: splitTags(String(fd.get("topRecruiters") || "")),
      learningMode: splitTags(String(fd.get("learningMode") || "")),
      specializations: splitTags(String(fd.get("specializations") || "")),
    };

    try {
      const url = "/api/admin/colleges";
      const method = editing ? "PUT" : "POST";
      if (editing) body.id = editing._id || editing.id;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(editing ? "College updated" : "College created");
        fetchColleges();
        setShowEditor(false);
        setEditing(null);
      } else {
        setMessage(data.error || "Something went wrong");
      }
    } catch (e) {
      console.error(e);
      setMessage("Network error");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (college: College) => {
    if (!confirm(`Delete "${college.name}"? This cannot be undone.`)) return;
    try {
      const id = college._id || college.id;
      const res = await fetch(`/api/admin/colleges?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) { setMessage("College deleted"); fetchColleges(); }
    } catch (e) { console.error(e); }
  };

  const handleToggleHidden = async (college: College) => {
    try {
      const id = college._id || college.id;
      const res = await fetch("/api/admin/colleges", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, hidden: !college.hidden }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(college.hidden ? "College is now visible" : "College is now hidden");
        fetchColleges();
      }
    } catch (e) { console.error(e); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Colleges</h1>
        <div className="bg-white rounded-2xl border border-slate-200 p-8 animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Colleges</h1>
          <p className="text-sm text-slate-500 mt-1">
            {colleges.length} colleges ({colleges.filter(c => c.hidden).length} hidden)
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowEditor(true); }}
          className="btn-primary py-2.5 px-4 text-sm flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add College
        </button>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-50 text-emerald-700 text-sm p-3 rounded-xl text-center flex items-center justify-between"
          >
            <span>{message}</span>
            <button onClick={() => setMessage("")} className="p-1 hover:bg-emerald-100 rounded-lg"><X className="h-3.5 w-3.5" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search colleges..." className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-brand-royal"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase">College</th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase">Type</th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase">Ranking</th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase">Fees</th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase">Placement</th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                <th className="text-right py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-slate-400">No colleges found</td></tr>
              ) : filtered.map((c) => (
                <tr key={c._id || c.id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${c.hidden ? "opacity-50" : ""}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-brand-bg flex items-center justify-center overflow-hidden">
                        {c.logoUrl ? (
                          <img src={c.logoUrl} alt={c.name} className="h-full w-full object-contain" />
                        ) : (
                          <GraduationCap className="h-5 w-5 text-brand-royal" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          {c.name}
                          {c.hidden && <span className="ml-1.5 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Hidden</span>}
                        </p>
                        <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4"><span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-600 uppercase">{c.type}</span></td>
                  <td className="py-3 px-4 text-sm text-slate-600">{c.ranking}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{c.fees}</td>
                  <td className="py-3 px-4 text-sm text-emerald-600 font-semibold">{c.placement}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.featured ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                      {c.featured ? "Featured" : "Standard"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleToggleHidden(c)}
                        className="p-2 rounded-lg hover:bg-slate-100"
                        title={c.hidden ? "Show" : "Hide"}
                      >
                        {c.hidden ? <Eye className="h-4 w-4 text-emerald-500" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
                      </button>
                      <button onClick={() => { setEditing(c); setShowEditor(true); }}
                        className="p-2 rounded-lg hover:bg-slate-100"><Edit className="h-4 w-4 text-slate-400" /></button>
                      <button onClick={() => handleDelete(c)}
                        className="p-2 rounded-lg hover:bg-red-50"><Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowEditor(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <form onSubmit={handleSave} className="p-6">
                <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b border-slate-100">
                  <h2 className="text-xl font-bold text-slate-800">{editing ? `Edit: ${editing.name}` : "Add College"}</h2>
                  <button type="button" onClick={() => setShowEditor(false)} className="p-2 rounded-lg hover:bg-slate-100"><X className="h-5 w-5 text-slate-400" /></button>
                </div>

                <div className="space-y-5">
                  {/* Basic Info */}
                  <fieldset className="border border-slate-200 rounded-xl p-4">
                    <legend className="text-xs font-bold text-slate-500 uppercase px-2">Basic Information</legend>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-xs font-semibold text-slate-500 mb-1">College Name *</label><input name="name" defaultValue={editing?.name || ""} required className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" /></div>
                      <div><label className="block text-xs font-semibold text-slate-500 mb-1">Short Name</label><input name="shortName" defaultValue={editing?.shortName || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div><label className="block text-xs font-semibold text-slate-500 mb-1">Slug *</label><input name="slug" defaultValue={editing?.slug || ""} required className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                      <div><label className="block text-xs font-semibold text-slate-500 mb-1">Location *</label><input name="location" defaultValue={editing?.location || ""} required className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div><label className="block text-xs font-semibold text-slate-500 mb-1">Type</label><select name="type" defaultValue={editing?.type || "ug"} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm"><option value="ug">UG</option><option value="pg">PG</option></select></div>
                      <div><label className="block text-xs font-semibold text-slate-500 mb-1">Category</label><select name="category" defaultValue={editing?.category || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm"><option value="">General</option><option value="engineering">Engineering</option><option value="medical">Medical</option><option value="mba">MBA</option></select></div>
                      <div><label className="block text-xs font-semibold text-slate-500 mb-1">Established</label><input name="established" defaultValue={editing?.established || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                      <div><label className="block text-xs font-semibold text-slate-500 mb-1">Accreditation (csv)</label><input name="accreditation" defaultValue={joinTags(editing?.accreditation)} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" placeholder="NAAC A+, UGC-DEB" /></div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Tagline</label>
                      <input name="tagline" defaultValue={editing?.tagline || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" />
                    </div>
                    <div className="mt-4">
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
                      <textarea name="description" defaultValue={editing?.description || ""} rows={3} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" />
                    </div>
                  </fieldset>

                  {/* Ratings & Stats */}
                  <fieldset className="border border-slate-200 rounded-xl p-4">
                    <legend className="text-xs font-bold text-slate-500 uppercase px-2">Ratings & Stats</legend>
                    <div className="grid grid-cols-4 gap-4">
                      <div><label className="block text-xs font-semibold text-slate-500 mb-1">Rating</label><input name="rating" type="number" step="0.1" min="0" max="5" defaultValue={editing?.rating || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                      <div><label className="block text-xs font-semibold text-slate-500 mb-1">Review Count</label><input name="reviewCount" type="number" defaultValue={editing?.reviewCount || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                      <div><label className="block text-xs font-semibold text-slate-500 mb-1">Course Count</label><input name="courseCount" type="number" defaultValue={editing?.courseCount || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                      <div><label className="block text-xs font-semibold text-slate-500 mb-1">Ranking</label><input name="ranking" defaultValue={editing?.ranking || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div><label className="block text-xs font-semibold text-slate-500 mb-1">Fees</label><input name="fees" defaultValue={editing?.fees || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                      <div><label className="block text-xs font-semibold text-slate-500 mb-1">Placement %</label><input name="placement" defaultValue={editing?.placement || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                      <div><label className="block text-xs font-semibold text-slate-500 mb-1">Avg Package</label><input name="avgPackage" defaultValue={editing?.avgPackage || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                    </div>
                  </fieldset>

                  {/* Courses */}
                  <fieldset className="border border-slate-200 rounded-xl p-4">
                    <legend className="text-xs font-bold text-slate-500 uppercase px-2">Courses</legend>
                    <div className="grid grid-cols-1 gap-4">
                      <div><label className="block text-xs font-semibold text-slate-500 mb-1">UG Courses (comma-separated)</label><input name="ugCourses" defaultValue={joinTags(editing?.ugCourses)} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" placeholder="BBA, BCA, B.Com" /></div>
                      <div><label className="block text-xs font-semibold text-slate-500 mb-1">PG Courses (comma-separated)</label><input name="pgCourses" defaultValue={joinTags(editing?.pgCourses)} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" placeholder="MBA, MCA, M.Sc" /></div>
                      <div><label className="block text-xs font-semibold text-slate-500 mb-1">All Courses (comma-separated, fallback)</label><input name="courses" defaultValue={joinTags(editing?.courses)} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                    </div>
                  </fieldset>

                  {/* Additional Info */}
                  <fieldset className="border border-slate-200 rounded-xl p-4">
                    <legend className="text-xs font-bold text-slate-500 uppercase px-2">Additional Information</legend>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-xs font-semibold text-slate-500 mb-1">Duration</label><input name="duration" defaultValue={editing?.duration || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" placeholder="3 Years" /></div>
                      <div><label className="block text-xs font-semibold text-slate-500 mb-1">Eligibility</label><input name="eligibility" defaultValue={editing?.eligibility || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" placeholder="10+2 with 50%" /></div>
                    </div>
                    <div className="mt-4"><label className="block text-xs font-semibold text-slate-500 mb-1">Scholarship Info</label><input name="scholarship" defaultValue={editing?.scholarship || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                    <div className="mt-4"><label className="block text-xs font-semibold text-slate-500 mb-1">Specializations (comma-separated)</label><input name="specializations" defaultValue={joinTags(editing?.specializations)} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" placeholder="Finance, Marketing, HR" /></div>
                    <div className="grid grid-cols-5 gap-4 mt-4">
                      <div className="col-span-2"><label className="block text-xs font-semibold text-slate-500 mb-1">Highlight Points (csv)</label><input name="highlights" defaultValue={joinTags(editing?.highlights)} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                      <div className="col-span-3"><label className="block text-xs font-semibold text-slate-500 mb-1">Infrastructure (csv)</label><input name="infrastructure" defaultValue={joinTags(editing?.infrastructure)} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" placeholder="Library, Hostel, Sports Complex" /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div><label className="block text-xs font-semibold text-slate-500 mb-1">Entrance Exams (csv)</label><input name="entranceExams" defaultValue={joinTags(editing?.entranceExams)} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                      <div><label className="block text-xs font-semibold text-slate-500 mb-1">Top Recruiters (csv)</label><input name="topRecruiters" defaultValue={joinTags(editing?.topRecruiters)} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                      <div><label className="block text-xs font-semibold text-slate-500 mb-1">Learning Modes (csv)</label><input name="learningMode" defaultValue={joinTags(editing?.learningMode)} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" placeholder="Online, Distance" /></div>
                    </div>
                  </fieldset>

                  {/* Media & Settings */}
                  <fieldset className="border border-slate-200 rounded-xl p-4">
                    <legend className="text-xs font-bold text-slate-500 uppercase px-2">Media & Settings</legend>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-xs font-semibold text-slate-500 mb-1">Logo URL</label><input name="logoUrl" defaultValue={editing?.logoUrl || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" placeholder="/images/colleges/slug.svg" /></div>
                      <div><label className="block text-xs font-semibold text-slate-500 mb-1">Banner URL</label><input name="bannerUrl" defaultValue={editing?.bannerUrl || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" name="featured" value="true" defaultChecked={editing?.featured || false} className="rounded border-slate-300 text-brand-royal focus:ring-brand-royal" />
                          <span className="text-sm text-slate-600">Featured University</span>
                        </label>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" name="hidden" value="true" defaultChecked={editing?.hidden || false} className="rounded border-slate-300 text-red-500 focus:ring-red-500" />
                          <span className="text-sm text-slate-600">Hidden from public</span>
                        </label>
                      </div>
                    </div>
                  </fieldset>
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100 sticky bottom-0 bg-white">
                  <button type="button" onClick={() => setShowEditor(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm">Cancel</button>
                  <button type="submit" disabled={busy} className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2 disabled:opacity-50">
                    <CheckCircle className="h-4 w-4" /> {busy ? "Saving..." : editing ? "Save Changes" : "Create College"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
