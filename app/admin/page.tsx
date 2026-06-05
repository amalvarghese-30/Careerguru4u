"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users, Compass, Building2, Award, FileText, PhoneCall, Settings,
  TrendingUp, ArrowRight, UserPlus, Activity, Clock, Sparkles,
} from "lucide-react";

interface DashboardStats {
  totalUsers: number; activeUsers: number; newToday: number;
  totalCareers: number; totalColleges: number; totalScholarships: number;
  totalBlogPosts: number; counsellingRequests: number; counsellingPending: number;
  totalLeads: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<Array<{ fullName: string; email: string; createdAt: string; board: string; class: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics", { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        if (data.stats) {
          setStats(data.stats);
          setRecentUsers(data.recentUsers || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: "Total Users", value: stats.totalUsers.toLocaleString(), icon: Users, color: "from-blue-600 to-blue-400" },
    { label: "Active Users", value: stats.activeUsers.toLocaleString(), icon: Activity, color: "from-emerald-600 to-emerald-400" },
    { label: "New Today", value: stats.newToday.toString(), icon: UserPlus, color: "from-purple-600 to-purple-400" },
    { label: "Careers", value: stats.totalCareers.toString(), icon: Compass, color: "from-brand-royal to-brand-electric" },
    { label: "Colleges", value: stats.totalColleges.toString(), icon: Building2, color: "from-indigo-600 to-indigo-400" },
    { label: "Scholarships", value: stats.totalScholarships.toString(), icon: Award, color: "from-amber-500 to-yellow-500" },
    { label: "Counselling", value: stats.counsellingPending.toString(), sub: `${stats.counsellingRequests} total`, icon: PhoneCall, color: "from-teal-600 to-cyan-400" },
    { label: "Blog Posts", value: stats.totalBlogPosts.toString(), icon: FileText, color: "from-rose-600 to-pink-400" },
  ] : [];

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1 animate-pulse">Loading analytics...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 animate-pulse">
              <div className="h-10 w-10 rounded-xl bg-slate-200 mb-3" />
              <div className="h-6 w-20 bg-slate-200 rounded mb-1" />
              <div className="h-3 w-16 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (

    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back. Here&apos;s what&apos;s happening.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Live data from database
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              {stat.sub && <span className="text-xs text-slate-400">{stat.sub}</span>}
            </div>
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-slate-800">Recent Users</h2>
            <Link href="/admin/users" className="text-sm text-brand-royal font-medium hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-2 text-xs font-semibold text-slate-400 uppercase">User</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-slate-400 uppercase">Class</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-slate-400 uppercase">Board</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-slate-400 uppercase">Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-slate-400">No recent users</td></tr>
                ) : recentUsers.map((user) => (
                  <tr key={user.email} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-brand-bg flex items-center justify-center text-xs font-bold text-brand-royal">
                          {user.fullName?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{user.fullName}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm text-slate-600">{user.class || "N/A"}</td>
                    <td className="py-3 px-2 text-sm text-slate-600">{user.board || "N/A"}</td>
                    <td className="py-3 px-2 text-sm text-slate-400 text-right">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-800 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { icon: Users, label: "Manage Users", href: "/admin/users" },
              { icon: Compass, label: "Manage Careers", href: "/admin/careers" },
              { icon: Building2, label: "Manage Colleges", href: "/admin/colleges" },
              { icon: FileText, label: "Write Article", href: "/admin/blog" },
              { icon: Award, label: "Scholarships", href: "/admin/scholarships" },
              { icon: Settings, label: "Site Settings", href: "/admin/settings" },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <action.icon className="h-4 w-4 text-slate-400 group-hover:text-brand-royal transition-colors" />
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
