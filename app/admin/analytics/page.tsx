"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, Eye, Clock, Target, BookOpen,
  Building2, PhoneCall, GraduationCap, Activity, Shield,
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface AnalyticsStats {
  totalUsers: number; activeUsers: number; newToday: number;
  totalCareers: number; totalColleges: number; totalScholarships: number;
  totalBlogPosts: number; counsellingRequests: number;
  counsellingPending: number; totalLeads: number;
}

interface Breakdowns {
  usersByRole: Record<string, number>;
  leadsByStatus: Record<string, number>;
  sessionsByStatus: Record<string, number>;
}

interface RecentUser {
  fullName?: string; email?: string; createdAt?: string;
}

interface RecentCounselling {
  name?: string; email?: string; status?: string;
}

interface AuditLog {
  action?: string; collection?: string; performedByEmail?: string; timestamp?: string;
}

const PIE_COLORS = ["#4F46E5", "#7C3AED", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
const ROLE_COLORS: Record<string, string> = {
  student: "#06B6D4", counsellor: "#8B5CF6", admin: "#4F46E5", super_admin: "#7C3AED",
};
const STATUS_COLORS: Record<string, string> = {
  new: "#3B82F6", contacted: "#F59E0B", qualified: "#8B5CF6", converted: "#10B981", lost: "#EF4444", closed: "#EF4444",
};
const SESSION_COLORS: Record<string, string> = {
  pending: "#F59E0B", confirmed: "#3B82F6", completed: "#10B981", cancelled: "#EF4444",
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentCounselling, setRecentCounselling] = useState<RecentCounselling[]>([]);
  const [recentLeads, setRecentLeads] = useState<unknown[]>([]);
  const [recentAuditLogs, setRecentAuditLogs] = useState<AuditLog[]>([]);
  const [breakdowns, setBreakdowns] = useState<Breakdowns>({ usersByRole: {}, leadsByStatus: {}, sessionsByStatus: {} });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("7d");


  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/analytics", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.stats) setStats(data.stats);
      if (data.recentUsers) setRecentUsers(data.recentUsers);
      if (data.recentCounselling) setRecentCounselling(data.recentCounselling);
      if (data.recentLeads) setRecentLeads(data.recentLeads);
      if (data.recentAuditLogs) setRecentAuditLogs(data.recentAuditLogs);
      if (data.breakdowns) setBreakdowns(data.breakdowns);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
              <div className="h-10 w-10 rounded-xl bg-slate-100 mb-3" />
              <div className="h-8 w-24 bg-slate-200 rounded mb-1" />
              <div className="h-3 w-20 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const kpiData = [
    { label: "Total Users", value: stats?.totalUsers?.toLocaleString() || "0", icon: Users, color: "from-brand-royal to-brand-electric" },
    { label: "Careers", value: stats?.totalCareers?.toLocaleString() || "0", icon: BookOpen, color: "from-blue-600 to-blue-400" },
    { label: "Colleges", value: stats?.totalColleges?.toLocaleString() || "0", icon: Building2, color: "from-emerald-600 to-emerald-400" },
    { label: "Counselling", value: stats?.counsellingRequests?.toLocaleString() || "0", icon: PhoneCall, color: "from-purple-600 to-purple-400" },
  ];

  const roleData = Object.entries(breakdowns.usersByRole).map(([name, value]) => ({
    name: name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), value, fill: ROLE_COLORS[name] || PIE_COLORS[0],
  }));

  const leadData = Object.entries(breakdowns.leadsByStatus).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1), value, fill: STATUS_COLORS[name] || PIE_COLORS[0],
  }));

  const sessionData = Object.entries(breakdowns.sessionsByStatus).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1), value, fill: SESSION_COLORS[name] || PIE_COLORS[0],
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Platform metrics from database</p>
        </div>
        <div className="flex items-center gap-2">
          {["24h", "7d", "30d", "90d", "1y"].map((r) => (
            <button key={r} onClick={() => setDateRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase ${dateRange === r ? "bg-brand-gradient-static text-white shadow-brand-btn" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{r}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                <kpi.icon className="h-5 w-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{kpi.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Active Users", value: stats?.activeUsers || 0, icon: Users, color: "from-emerald-600 to-emerald-400" },
          { label: "New Today", value: stats?.newToday || 0, icon: Activity, color: "from-brand-royal to-brand-electric" },
          { label: "Scholarships", value: stats?.totalScholarships || 0, icon: GraduationCap, color: "from-amber-500 to-orange-400" },
          { label: "Blog Posts", value: stats?.totalBlogPosts || 0, icon: Eye, color: "from-purple-600 to-purple-400" },
          { label: "Pending Counselling", value: stats?.counsellingPending || 0, icon: Clock, color: "from-amber-500 to-amber-400" },
          { label: "Total Leads", value: stats?.totalLeads || 0, icon: Target, color: "from-blue-600 to-blue-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                <s.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {roleData.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-800 mb-4">Users by Role</h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={roleData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {roleData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) =>
                    typeof value === "number"
                      ? value.toLocaleString()
                      : String(value ?? "")
                  }
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {leadData.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-800 mb-4">Leads by Status</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={leadData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value) =>
                    typeof value === "number"
                      ? value.toLocaleString()
                      : String(value ?? "")
                  }
                />
                <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                  {leadData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {sessionData.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-800 mb-4">Counselling Sessions</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={sessionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value) =>
                    typeof value === "number"
                      ? value.toLocaleString()
                      : String(value ?? "")
                  }
                />
                <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                  {sessionData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-800 mb-4">Recent Users</h2>
          <div className="space-y-3">
            {recentUsers.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No recent users</p>
            ) : recentUsers.map((u, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-brand-bg flex items-center justify-center text-xs font-bold text-brand-royal">
                    {String(u.fullName || u.email || "?").charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{String(u.fullName || "N/A")}</p>
                    <p className="text-xs text-slate-400">{String(u.email || "")}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">{new Date(String(u.createdAt || "")).toLocaleDateString("en-IN")}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-800 mb-4">Recent Counselling Requests</h2>
          <div className="space-y-3">
            {recentCounselling.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No recent requests</p>
            ) : recentCounselling.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-600">
                    {String(r.name || "?").charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{String(r.name || "N/A")}</p>
                    <p className="text-xs text-slate-400">{String(r.email || "")}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${r.status === "pending" ? "bg-amber-100 text-amber-700" :
                    r.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                  }`}>{String(r.status || "pending")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {recentAuditLogs.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-royal" /> Audit Log
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Action</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Collection</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">By</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">When</th>
                </tr>
              </thead>
              <tbody>
                {recentAuditLogs.map((log, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${log.action === "CREATE" ? "bg-emerald-100 text-emerald-700" :
                          log.action === "UPDATE" ? "bg-blue-100 text-blue-700" :
                            log.action === "DELETE" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"
                        }`}>{String(log.action)}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{String(log.collection)}</td>
                    <td className="py-2.5 px-3 text-slate-600">{String(log.performedByEmail || "")}</td>
                    <td className="py-2.5 px-3 text-slate-400 text-xs">{new Date(String(log.timestamp || "")).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
