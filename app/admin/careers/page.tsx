"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, IndianRupee, TrendingUp, GraduationCap, X, CheckCircle } from "lucide-react";

interface Career {
  _id?: string;
  id?: string;
  title: string;
  stream: string;
  category: string;
  growth: string;
  subtitle?: string;
  overview?: string;
  salary: { entry: string; mid: string };
  educationPath?: string[];
  slug?: string;
}

export default function CareersAdminPage() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const [message, setMessage] = useState("");


  const fetchCareers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/careers", {
        credentials: "include",
      });
      const data = await res.json();
      setCareers(data.careers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCareers(); }, [fetchCareers]);

  const filtered = careers.filter((c) =>
    (c.title || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.stream || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const body: Record<string, unknown> = {
      title: fd.get("title"), stream: fd.get("stream"), category: fd.get("category"),
      growth: fd.get("growth"), subtitle: fd.get("subtitle"), overview: fd.get("overview"),
      slug: fd.get("slug"),
      salary: { entry: fd.get("entrySalary"), mid: fd.get("midSalary") },
    };

    try {
      const url = "/api/admin/careers";
      const method = editingCareer ? "PUT" : "POST";
      if (editingCareer) body.id = editingCareer._id || editingCareer.id;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(editingCareer ? "Career updated" : "Career created");
        fetchCareers();
        setShowEditor(false);
        setEditingCareer(null);
      } else {
        setMessage(data.error || "Save failed");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (career: Career) => {
    if (!confirm(`Delete "${career.title}"?`)) return;
    try {
      const id = career._id || career.id;
      const res = await fetch(`/api/admin/careers?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Career deleted");
        fetchCareers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Careers</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
              <div className="h-5 w-32 bg-slate-200 rounded mb-3" />
              <div className="h-3 w-24 bg-slate-100 rounded mb-4" />
              <div className="h-8 w-full bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Careers</h1>
          <p className="text-sm text-slate-500 mt-1">{careers.length} careers from database</p>
        </div>
        <button
          onClick={() => { setEditingCareer(null); setShowEditor(true); }}
          className="btn-primary py-2.5 px-4 text-sm flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Career
        </button>
      </div>

      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 text-emerald-700 text-sm p-3 rounded-xl text-center">
          {message}
        </motion.div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search careers..." className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((career) => (
          <div key={career._id || career.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-800">{career.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{career.stream} &bull; {career.category}</p>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                career.growth === "Very High" ? "bg-emerald-100 text-emerald-700" :
                career.growth === "High" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
              }`}>{career.growth}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
              <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3 text-emerald-500" /> {career.salary?.entry}</span>
              <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3 text-slate-400" /> {career.educationPath?.length || 0} steps</span>
            </div>
            <div className="flex items-center gap-1 pt-3 border-t border-slate-100">
              <button
                onClick={() => { setEditingCareer(career); setShowEditor(true); }}
                className="flex-1 py-2 rounded-lg bg-slate-50 text-slate-600 text-sm font-medium hover:bg-brand-bg hover:text-brand-royal transition-colors flex items-center justify-center gap-1.5"
              >
                <Edit className="h-3.5 w-3.5" /> Edit
              </button>
              <button onClick={() => handleDelete(career)}
                className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400">No careers found</div>
        )}
      </div>

      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowEditor(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <form onSubmit={handleSave} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">
                  {editingCareer ? `Edit: ${editingCareer.title}` : "Add New Career"}
                </h2>
                <button type="button" onClick={() => setShowEditor(false)} className="p-2 rounded-lg hover:bg-slate-100">
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Title</label>
                    <input name="title" defaultValue={editingCareer?.title || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Slug</label>
                    <input name="slug" defaultValue={editingCareer?.slug || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Stream</label>
                    <select name="stream" defaultValue={editingCareer?.stream || "Science"} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm">
                      <option>Science</option><option>Commerce</option><option>Arts/Humanities</option><option>Vocational</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
                    <select name="category" defaultValue={editingCareer?.category || "Private"} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm">
                      <option>Private</option><option>Government</option><option>Professional</option><option>Emerging</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Growth</label>
                    <select name="growth" defaultValue={editingCareer?.growth || "High"} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm">
                      <option>Very High</option><option>High</option><option>Moderate</option><option>Stable</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Subtitle</label>
                  <input name="subtitle" defaultValue={editingCareer?.subtitle || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Overview</label>
                  <textarea name="overview" rows={3} defaultValue={editingCareer?.overview || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Entry Salary</label>
                    <input name="entrySalary" defaultValue={editingCareer?.salary?.entry || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Mid Salary</label>
                    <input name="midSalary" defaultValue={editingCareer?.salary?.mid || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowEditor(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> {editingCareer ? "Save Changes" : "Create Career"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
