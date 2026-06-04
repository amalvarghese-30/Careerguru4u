"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, MoreVertical, X, Download, Trash2, MessageSquare, UserCheck } from "lucide-react";

interface Lead {
  _id: string;
  name: string; email: string; phone: string; source: string;
  interest: string; class: string; board: string; city: string;
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  assignedTo?: string; notes?: string;
  createdAt: string; updatedAt: string;
}

interface FunnelData {
  total: number; newLeads: number; contacted: number;
  qualified: number; converted: number; lost: number;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [funnel, setFunnel] = useState<FunnelData>({ total: 0, newLeads: 0, contacted: 0, qualified: 0, converted: 0, lost: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [message, setMessage] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [assignInput, setAssignInput] = useState("");

  const getToken = () => document.cookie.match(/cg-auth-token=([^;]+)/)?.[1] || "";

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/leads?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        credentials: "include",
      });
      const data = await res.json();
      setLeads(data.leads || []);
      if (data.funnel) setFunnel(data.funnel);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdate = async (id: string, updates: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        credentials: "include",
        body: JSON.stringify({ id, ...updates }),
      });
      const data = await res.json();
      if (data.success) { setMessage("Lead updated"); fetchData(); setSelectedLead(null); }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/leads?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) { setMessage("Lead deleted"); fetchData(); setSelectedLead(null); }
    } catch (e) { console.error(e); }
  };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Source", "Interest", "Class", "Board", "City", "Status", "Assigned To", "Notes", "Created"];
    const rows = leads.map((l) => [
      l.name || "", l.email || "", l.phone || "", l.source || "", l.interest || "",
      l.class || "", l.board || "", l.city || "", l.status || "", l.assignedTo || "",
      l.notes || "", new Date(l.createdAt).toLocaleDateString("en-IN"),
    ]);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `leads-export-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-700", contacted: "bg-amber-100 text-amber-700",
    qualified: "bg-purple-100 text-purple-700", converted: "bg-emerald-100 text-emerald-700",
    lost: "bg-red-100 text-red-700",
  };

  const sourceColors: Record<string, string> = {
    Website: "bg-slate-100 text-slate-600", "Google Ads": "bg-blue-100 text-blue-700",
    Referral: "bg-emerald-100 text-emerald-700", "Social Media": "bg-purple-100 text-purple-700",
    "Email Campaign": "bg-amber-100 text-amber-700",
  };

  const funnelItems = [
    { label: "Total Leads", count: funnel.total, color: "from-slate-600 to-slate-400" },
    { label: "New", count: funnel.newLeads, color: "from-blue-600 to-blue-400" },
    { label: "Contacted", count: funnel.contacted, color: "from-amber-500 to-amber-400" },
    { label: "Qualified", count: funnel.qualified, color: "from-purple-600 to-purple-400" },
    { label: "Converted", count: funnel.converted, color: "from-emerald-600 to-emerald-400" },
    { label: "Lost", count: funnel.lost, color: "from-red-500 to-red-400" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Lead Management</h1>
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
          <h1 className="text-2xl font-bold text-slate-800">Lead Management</h1>
          <p className="text-sm text-slate-500 mt-1">{leads.length} leads from database</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 text-emerald-700 text-sm p-3 rounded-xl text-center">
          {message}
        </motion.div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-800 mb-4">Lead Funnel</h2>
        <div className="flex items-center gap-2">
          {funnelItems.map((f, i) => (
            <div key={f.label} className="flex-1 text-center" style={{ maxWidth: `${100 / funnelItems.length}%` }}>
              <div className={`rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-2`} style={{ height: `${Math.max(40, 80 - i * 10)}px` }}>
                <span className="text-white font-bold text-lg">{f.count}</span>
              </div>
              <p className="text-xs text-slate-500">{f.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..." className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "new", "contacted", "qualified", "converted", "lost"].map((s) => (
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
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase">Lead</th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase">Source</th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase">Interest</th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase">Assigned</th>
                <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase">Created</th>
                <th className="text-right py-3.5 px-4 text-xs font-semibold text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-slate-400">No leads found</td></tr>
              ) : leads.map((l) => (
                <tr key={l._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-brand-bg flex items-center justify-center text-xs font-bold text-brand-royal">{l.name?.charAt(0) || "?"}</div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{l.name}</p>
                        <p className="text-xs text-slate-400">{l.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4"><span className={`text-xs px-2 py-1 rounded-full ${sourceColors[l.source] || "bg-slate-100 text-slate-600"}`}>{l.source}</span></td>
                  <td className="py-3 px-4 text-sm text-slate-600">{l.interest}</td>
                  <td className="py-3 px-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[l.status]}`}>{l.status}</span></td>
                  <td className="py-3 px-4 text-sm text-slate-600">{l.assignedTo || "Unassigned"}</td>
                  <td className="py-3 px-4 text-sm text-slate-400">{new Date(l.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="py-3 px-4 text-right"><button onClick={() => { setSelectedLead(l); setNoteInput(l.notes || ""); setAssignInput(l.assignedTo || ""); }} className="p-2 rounded-lg hover:bg-slate-100"><MoreVertical className="h-4 w-4 text-slate-400" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedLead(null)} />
          <motion.div initial={{ x: 400 }} animate={{ x: 0 }} className="relative w-full max-w-md bg-white shadow-2xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-slate-800">Lead Details</h3>
                <button onClick={() => setSelectedLead(null)} className="p-2 rounded-lg hover:bg-slate-100"><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              <div className="text-center mb-6">
                <div className="h-16 w-16 rounded-2xl bg-brand-gradient-static flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3 shadow-lg">{selectedLead.name?.charAt(0)}</div>
                <h2 className="text-xl font-bold text-slate-800">{selectedLead.name}</h2>
                <span className={`inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusColors[selectedLead.status]}`}>{selectedLead.status}</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Email", value: selectedLead.email }, { label: "Phone", value: selectedLead.phone },
                  { label: "City", value: selectedLead.city }, { label: "Source", value: selectedLead.source },
                  { label: "Interest", value: selectedLead.interest }, { label: "Class", value: `${selectedLead.class || "N/A"} (${selectedLead.board || "N/A"})` },
                  { label: "Created", value: new Date(selectedLead.createdAt).toLocaleDateString("en-IN") },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between p-3 rounded-xl bg-slate-50">
                    <span className="text-xs text-slate-400">{item.label}</span>
                    <span className="text-sm font-medium text-slate-700">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Assign To</label>
                  <div className="flex gap-2">
                    <input value={assignInput} onChange={(e) => setAssignInput(e.target.value)}
                      placeholder="Counsellor name or email" className="flex-1 p-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" />
                    <button onClick={() => handleUpdate(selectedLead._id, { assignedTo: assignInput })}
                      className="px-3 py-2 rounded-lg bg-brand-royal text-white text-xs font-medium hover:bg-brand-navy flex items-center gap-1">
                      <UserCheck className="h-3.5 w-3.5" /> Assign
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Notes</label>
                  <div className="flex gap-2">
                    <textarea rows={2} value={noteInput} onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="Add notes about this lead..." className="flex-1 p-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal resize-none" />
                    <button onClick={() => handleUpdate(selectedLead._id, { notes: noteInput })}
                      className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 self-end flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" /> Save
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 mb-2">Quick Status</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleUpdate(selectedLead._id, { status: "contacted" })}
                    className="px-3 py-2 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium hover:bg-amber-100">Mark Contacted</button>
                  <button onClick={() => handleUpdate(selectedLead._id, { status: "qualified" })}
                    className="px-3 py-2 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium hover:bg-purple-100">Mark Qualified</button>
                  <button onClick={() => handleUpdate(selectedLead._id, { status: "converted" })}
                    className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100">Mark Converted</button>
                  <button onClick={() => handleUpdate(selectedLead._id, { status: "lost" })}
                    className="px-3 py-2 rounded-lg bg-red-50 text-red-700 text-xs font-medium hover:bg-red-100">Mark Lost</button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <button onClick={() => handleDelete(selectedLead._id)}
                  className="w-full px-4 py-2.5 rounded-xl bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 flex items-center justify-center gap-2">
                  <Trash2 className="h-4 w-4" /> Delete Lead
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
