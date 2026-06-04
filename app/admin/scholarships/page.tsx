"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, IndianRupee, Calendar, GraduationCap, X, CheckCircle, Users } from "lucide-react";

interface Scholarship {
  _id?: string; id?: string;
  title: string; provider: string; amount: string; deadline: string;
  eligibility: string; category: string; applicants?: number;
  status: "active" | "closed" | "draft";
  description: string;
}

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<Scholarship | null>(null);
  const [message, setMessage] = useState("");

  const getToken = () => document.cookie.match(/cg-auth-token=([^;]+)/)?.[1] || "";

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/scholarships", {
        headers: { Authorization: `Bearer ${getToken()}` },
        credentials: "include",
      });
      const data = await res.json();
      setScholarships(data.scholarships || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = scholarships.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.provider.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    active: scholarships.filter((s) => s.status === "active").length,
    total: scholarships.length,
    totalApplicants: scholarships.reduce((sum, s) => sum + (s.applicants || 0), 0),
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const body: Record<string, unknown> = {
      title: fd.get("title"), provider: fd.get("provider"), amount: fd.get("amount"),
      category: fd.get("category"), deadline: fd.get("deadline"),
      eligibility: fd.get("eligibility"), description: fd.get("description"),
      status: fd.get("status"),
    };

    try {
      const url = "/api/admin/scholarships";
      const method = editing ? "PUT" : "POST";
      if (editing) body.id = editing._id || editing.id;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(editing ? "Scholarship updated" : "Scholarship created");
        fetchData();
        setShowEditor(false);
        setEditing(null);
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (s: Scholarship) => {
    if (!confirm(`Delete "${s.title}"?`)) return;
    try {
      const id = s._id || s.id;
      const res = await fetch(`/api/admin/scholarships?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) { setMessage("Scholarship deleted"); fetchData(); }
    } catch (e) { console.error(e); }
  };

  const statusColors: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    closed: "bg-red-100 text-red-700",
    draft: "bg-amber-100 text-amber-700",
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Scholarships</h1>
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
          <h1 className="text-2xl font-bold text-slate-800">Scholarships</h1>
          <p className="text-sm text-slate-500 mt-1">{scholarships.length} scholarships from database</p>
        </div>
        <button onClick={() => { setEditing(null); setShowEditor(true); }}
          className="btn-primary py-2.5 px-4 text-sm flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Scholarship
        </button>
      </div>

      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 text-emerald-700 text-sm p-3 rounded-xl text-center">
          {message}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center"><GraduationCap className="h-6 w-6 text-emerald-600" /></div>
          <div><p className="text-2xl font-bold text-slate-800">{stats.active}</p><p className="text-xs text-slate-500">Active Scholarships</p></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center"><Users className="h-6 w-6 text-blue-600" /></div>
          <div><p className="text-2xl font-bold text-slate-800">{stats.totalApplicants.toLocaleString()}</p><p className="text-xs text-slate-500">Total Applicants</p></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center"><IndianRupee className="h-6 w-6 text-purple-600" /></div>
          <div><p className="text-2xl font-bold text-slate-800">{stats.total}</p><p className="text-xs text-slate-500">Total Scholarships</p></div>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search scholarships..." className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase">Scholarship</th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase">Amount</th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase">Category</th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase">Deadline</th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase">Applicants</th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                <th className="text-right py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-slate-400">No scholarships found</td></tr>
              ) : filtered.map((s) => (
                <tr key={s._id || s.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{s.title}</p>
                      <p className="text-xs text-slate-400">{s.provider}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-brand-royal">{s.amount}</td>
                  <td className="py-3 px-4"><span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">{s.category}</span></td>
                  <td className="py-3 px-4 text-sm text-slate-600 flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-slate-400" /> {s.deadline ? new Date(s.deadline).toLocaleDateString("en-IN") : "N/A"}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{(s.applicants || 0).toLocaleString()}</td>
                  <td className="py-3 px-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[s.status]}`}>{s.status}</span></td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditing(s); setShowEditor(true); }} className="p-2 rounded-lg hover:bg-slate-100"><Edit className="h-4 w-4 text-slate-400" /></button>
                      <button onClick={() => handleDelete(s)} className="p-2 rounded-lg hover:bg-red-50"><Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" /></button>
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
                <h2 className="text-xl font-bold text-slate-800">{editing ? `Edit: ${editing.title}` : "Add Scholarship"}</h2>
                <button type="button" onClick={() => setShowEditor(false)} className="p-2 rounded-lg hover:bg-slate-100"><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Title</label><input name="title" defaultValue={editing?.title || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" /></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Provider</label><input name="provider" defaultValue={editing?.provider || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Amount</label><input name="amount" defaultValue={editing?.amount || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Category</label><select name="category" defaultValue={editing?.category || "Merit"} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm"><option>Merit</option><option>Means</option><option>Merit-cum-Means</option><option>Girl Child</option><option>Crisis Support</option><option>OBC/EBC/DNT</option></select></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Status</label><select name="status" defaultValue={editing?.status || "active"} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm"><option value="active">Active</option><option value="closed">Closed</option><option value="draft">Draft</option></select></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Deadline</label><input name="deadline" type="date" defaultValue={editing?.deadline || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Eligibility</label><input name="eligibility" defaultValue={editing?.eligibility || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
                  <textarea name="description" rows={3} defaultValue={editing?.description || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowEditor(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm">Cancel</button>
                <button type="submit" className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2"><CheckCircle className="h-4 w-4" /> {editing ? "Save Changes" : "Create Scholarship"}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
