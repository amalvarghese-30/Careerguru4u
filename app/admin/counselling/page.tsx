"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Phone, Mail, Calendar, X, CheckCircle, MoreVertical, MessageSquare, UserCheck, Trash2 } from "lucide-react";

interface CounsellingRequest {
  _id: string;
  name: string; email: string; phone: string;
  board: string; class: string; message: string;
  status: "pending" | "assigned" | "scheduled" | "completed" | "cancelled";
  assignedTo?: string; notes?: string;
  createdAt: string; updatedAt: string;
}

export default function CounsellingPage() {
  const [requests, setRequests] = useState<CounsellingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<CounsellingRequest | null>(null);
  const [message, setMessage] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [assignInput, setAssignInput] = useState("");


  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/counselling?${params}`, {
        credentials: "include",
      });
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdate = async (id: string, updates: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/admin/counselling", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, ...updates }),
      });
      const data = await res.json();
      if (data.success) { setMessage("Updated successfully"); fetchData(); setSelected(null); }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this counselling request? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/counselling?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) { setMessage("Request deleted"); fetchData(); setSelected(null); }
    } catch (e) { console.error(e); }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    assigned: "bg-blue-100 text-blue-700",
    scheduled: "bg-purple-100 text-purple-700",
    completed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    scheduled: requests.filter((r) => r.status === "scheduled").length,
    completed: requests.filter((r) => r.status === "completed").length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Counselling CRM</h1>
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
          <h1 className="text-2xl font-bold text-slate-800">Counselling CRM</h1>
          <p className="text-sm text-slate-500 mt-1">{requests.length} requests from database</p>
        </div>
      </div>

      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 text-emerald-700 text-sm p-3 rounded-xl text-center">
          {message}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Requests", value: stats.total, color: "from-brand-royal to-brand-electric" },
          { label: "Pending", value: stats.pending, color: "from-amber-500 to-amber-400" },
          { label: "Scheduled", value: stats.scheduled, color: "from-purple-600 to-purple-400" },
          { label: "Completed", value: stats.completed, color: "from-emerald-600 to-emerald-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
              <Phone className="h-5 w-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone..." className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" />
        </div>
        <div className="flex gap-2">
          {["all", "pending", "assigned", "scheduled", "completed", "cancelled"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize ${statusFilter === s ? "bg-brand-gradient-static text-white shadow-brand-btn" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase">Student</th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase">Class</th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase">Contact</th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase">Date</th>
                <th className="text-right py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-slate-400">No counselling requests found</td></tr>
              ) : requests.map((r) => (
                <tr key={r._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-brand-bg flex items-center justify-center text-xs font-bold text-brand-royal">{r.name?.charAt(0) || "?"}</div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{r.name}</p>
                        <p className="text-xs text-slate-400">{r.board || "N/A"} / {r.class || "N/A"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">{r.class || r.board || "N/A"}</td>
                  <td className="py-3 px-4">
                    <div className="text-xs space-y-0.5">
                      <p className="text-slate-600 flex items-center gap-1"><Mail className="h-3 w-3" /> {r.email}</p>
                      <p className="text-slate-400 flex items-center gap-1"><Phone className="h-3 w-3" /> {r.phone}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[r.status]}`}>{r.status}</span>
                    {r.assignedTo && <p className="text-xs text-slate-400 mt-1">{r.assignedTo}</p>}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-400">{new Date(r.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => { setSelected(r); setNoteInput(r.notes || ""); setAssignInput(r.assignedTo || ""); }} className="p-2 rounded-lg hover:bg-slate-100"><MoreVertical className="h-4 w-4 text-slate-400" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelected(null)} />
          <motion.div initial={{ x: 400 }} animate={{ x: 0 }} className="relative w-full max-w-md bg-white shadow-2xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-slate-800">Request Details</h3>
                <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-slate-100"><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1">Student</p>
                  <p className="font-semibold text-slate-800">{selected.name}</p>
                  <p className="text-sm text-slate-500">{selected.email}</p>
                  <p className="text-sm text-slate-500">{selected.phone}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4"><p className="text-xs text-slate-400 mb-1">Board</p><p className="font-semibold text-slate-800 text-sm">{selected.board || "N/A"}</p></div>
                  <div className="bg-slate-50 rounded-xl p-4"><p className="text-xs text-slate-400 mb-1">Class</p><p className="font-semibold text-slate-800 text-sm">{selected.class || "N/A"}</p></div>
                </div>
                {selected.message && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-400 mb-1">Message</p>
                    <p className="text-sm text-slate-700">{selected.message}</p>
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Assign Counsellor</label>
                    <div className="flex gap-2">
                      <input value={assignInput} onChange={(e) => setAssignInput(e.target.value)}
                        placeholder="Counsellor name or email" className="flex-1 p-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" />
                      <button onClick={() => handleUpdate(selected._id, { assignedTo: assignInput })}
                        className="px-3 py-2 rounded-lg bg-brand-royal text-white text-xs font-medium hover:bg-brand-navy flex items-center gap-1">
                        <UserCheck className="h-3.5 w-3.5" /> Assign
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Notes</label>
                    <div className="flex gap-2">
                      <textarea rows={2} value={noteInput} onChange={(e) => setNoteInput(e.target.value)}
                        placeholder="Add internal notes..." className="flex-1 p-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal resize-none" />
                      <button onClick={() => handleUpdate(selected._id, { notes: noteInput })}
                        className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 self-end flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" /> Save
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-3">Quick Status</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.status === "pending" && (
                      <button onClick={() => handleUpdate(selected._id, { status: "assigned" })}
                        className="px-4 py-2 rounded-xl bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200">Assign</button>
                    )}
                    {["pending", "assigned"].includes(selected.status) && (
                      <button onClick={() => handleUpdate(selected._id, { status: "scheduled" })}
                        className="px-4 py-2 rounded-xl bg-purple-100 text-purple-700 text-sm font-medium hover:bg-purple-200">Schedule</button>
                    )}
                    {selected.status === "scheduled" && (
                      <button onClick={() => handleUpdate(selected._id, { status: "completed" })}
                        className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-700 text-sm font-medium hover:bg-emerald-200">Complete</button>
                    )}
                    <button onClick={() => handleUpdate(selected._id, { status: "cancelled" })}
                      className="px-4 py-2 rounded-xl bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200">Cancel</button>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <button onClick={() => handleDelete(selected._id)}
                  className="w-full px-4 py-2.5 rounded-xl bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 flex items-center justify-center gap-2">
                  <Trash2 className="h-4 w-4" /> Delete Request
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
