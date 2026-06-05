"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, MapPin, GraduationCap, X, CheckCircle } from "lucide-react";

interface College {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  location: string;
  rating: number;
  type: string;
  fees: string;
  placement: string;
  avgPackage: string;
  ranking: string;
  courses: string[];
  established: string;
}

export default function CollegesAdminPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<College | null>(null);
  const [message, setMessage] = useState("");


  const fetchColleges = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/colleges", {
        credentials: "include",
      });
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
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const body: Record<string, unknown> = {
      name: fd.get("name"), slug: fd.get("slug"), location: fd.get("location"),
      type: fd.get("type"), fees: fd.get("fees"), placement: fd.get("placement"),
      avgPackage: fd.get("avgPackage"), ranking: fd.get("ranking"),
      rating: Number(fd.get("rating")), established: fd.get("established"),
      courses: String(fd.get("courses") || "").split(",").map((s: string) => s.trim()).filter(Boolean),
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
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (college: College) => {
    if (!confirm(`Delete "${college.name}"?`)) return;
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
          <p className="text-sm text-slate-500 mt-1">{colleges.length} colleges from database</p>
        </div>
        <button onClick={() => { setEditing(null); setShowEditor(true); }}
          className="btn-primary py-2.5 px-4 text-sm flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add College
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
          placeholder="Search colleges..." className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" />
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
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase">Avg Pkg</th>
                <th className="text-right py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-slate-400">No colleges found</td></tr>
              ) : filtered.map((c) => (
                <tr key={c._id || c.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-brand-bg flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-brand-royal" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{c.name}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4"><span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-600 uppercase">{c.type}</span></td>
                  <td className="py-3 px-4 text-sm text-slate-600">{c.ranking}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{c.fees}</td>
                  <td className="py-3 px-4 text-sm text-emerald-600 font-semibold">{c.placement}</td>
                  <td className="py-3 px-4 text-sm text-brand-royal font-semibold">{c.avgPackage}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
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

      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowEditor(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <form onSubmit={handleSave} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">{editing ? `Edit: ${editing.name}` : "Add College"}</h2>
                <button type="button" onClick={() => setShowEditor(false)} className="p-2 rounded-lg hover:bg-slate-100"><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">College Name</label><input name="name" defaultValue={editing?.name || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" /></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Slug</label><input name="slug" defaultValue={editing?.slug || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Location</label><input name="location" defaultValue={editing?.location || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Type</label><select name="type" defaultValue={editing?.type || "UG"} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm"><option>UG</option><option>PG</option></select></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Rating</label><input name="rating" type="number" step="0.1" defaultValue={editing?.rating || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Fees</label><input name="fees" defaultValue={editing?.fees || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Ranking</label><input name="ranking" defaultValue={editing?.ranking || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Established</label><input name="established" defaultValue={editing?.established || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Placement %</label><input name="placement" defaultValue={editing?.placement || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Avg Package</label><input name="avgPackage" defaultValue={editing?.avgPackage || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Courses (comma-separated)</label>
                  <input name="courses" defaultValue={editing?.courses?.join(", ") || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowEditor(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm">Cancel</button>
                <button type="submit" className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2"><CheckCircle className="h-4 w-4" /> {editing ? "Save Changes" : "Create College"}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
