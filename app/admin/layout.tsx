"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Compass, GitBranch, Building2, Award,
  FileText, PhoneCall, UserPlus, Settings, LogOut, Shield, Menu,
  X, ChevronDown, Bell, Search, GraduationCap, BarChart3, MessageSquare,
  TrendingUp, BookOpen, ChevronRight, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore, isAdmin } from "@/lib/auth-store";

const sidebarItems = [
  {
    section: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
      { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
    ],
  },
  {
    section: "Management",
    items: [
      { icon: Users, label: "Users", href: "/admin/users" },
      { icon: Compass, label: "Careers", href: "/admin/careers" },
      { icon: GitBranch, label: "Flowcharts", href: "/admin/flowcharts" },
      { icon: Building2, label: "Colleges", href: "/admin/colleges" },
      { icon: Award, label: "Scholarships", href: "/admin/scholarships" },
    ],
  },
  {
    section: "Content",
    items: [
      { icon: FileText, label: "Blog", href: "/admin/blog" },
      { icon: PhoneCall, label: "Counselling", href: "/admin/counselling" },
      { icon: UserPlus, label: "Leads", href: "/admin/leads" },
    ],
  },
  {
    section: "System",
    items: [
      { icon: Settings, label: "Settings", href: "/admin/settings" },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => { setHydrated(true); }, []);

  // Close mobile sidebar when route changes
  useEffect(() => { setMobileSidebarOpen(false); }, [pathname]);

  // Skip auth check for login page
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (hydrated && !isLoginPage && (!isAuthenticated || !isAdmin(user?.role))) {
      router.push("/admin/login");
    }
  }, [hydrated, isAuthenticated, user, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!hydrated || !isAuthenticated || !isAdmin(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-8 w-8 border-2 border-brand-royal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Overlay (mobile) */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-[70]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar (desktop) */}
      <aside
        className={cn(
          "hidden lg:flex fixed lg:sticky top-0 left-0 z-[60] h-screen bg-white border-r border-slate-200 flex-col transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Logo */}
        <div className={cn("h-16 flex items-center border-b border-slate-200 px-4", sidebarOpen ? "gap-3" : "justify-center")}>
          <div className="h-9 w-9 rounded-xl bg-brand-gradient-static flex items-center justify-center flex-shrink-0 shadow-md">
            <Shield className="h-5 w-5 text-white" />
          </div>
          {sidebarOpen && (
            <span className="font-sora font-bold text-brand-navy text-sm">Admin</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex ml-auto p-1 rounded-lg hover:bg-slate-100"
          >
            <ChevronRight className={cn("h-4 w-4 text-slate-400 transition-transform", sidebarOpen && "rotate-180")} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {sidebarItems.map((section) => (
            <div key={section.section} className="mb-6">
              {sidebarOpen && (
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2 px-3">
                  {section.section}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                      pathname === item.href
                        ? "bg-brand-royal/10 text-brand-royal"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {sidebarOpen && <span>{item.label}</span>}
                    {!sidebarOpen && (
                      <div className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className={cn("p-3 border-t border-slate-200", !sidebarOpen && "flex flex-col items-center")}>
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors mb-1"
            )}
          >
            <GraduationCap className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && "View Site"}
          </Link>
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && "Logout"}
          </button>
          {sidebarOpen && user && (
            <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-3 px-3">
              <div className="h-8 w-8 rounded-lg bg-brand-gradient-static flex items-center justify-center text-white text-xs font-bold">
                {user.fullName.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-700 truncate">{user.fullName}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center gap-3 px-4 lg:px-6 sticky top-0 z-[60]">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5 text-slate-600" />
          </button>

          <div className="flex-1" />

          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal w-40 lg:w-64"
            />
          </div>

          <button className="relative p-2 rounded-lg hover:bg-slate-100">
            <Bell className="h-5 w-5 text-slate-400" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          </button>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 z-[80] h-screen w-64 bg-white border-r border-slate-200 flex flex-col"
          >
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-brand-gradient-static flex items-center justify-center shadow-md">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="font-sora font-bold text-brand-navy text-sm">Admin</span>
              </div>
              <button onClick={() => setMobileSidebarOpen(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              {sidebarItems.map((section) => (
                <div key={section.section} className="mb-6">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2 px-3">{section.section}</p>
                  <div className="space-y-0.5">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                          pathname === item.href
                            ? "bg-brand-royal/10 text-brand-royal"
                            : "text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
            <div className="p-3 border-t border-slate-200">
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors mb-1"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <GraduationCap className="h-5 w-5 flex-shrink-0" />
                View Site
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                Logout
              </button>
              {user && (
                <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-3 px-3">
                  <div className="h-8 w-8 rounded-lg bg-brand-gradient-static flex items-center justify-center text-white text-xs font-bold">
                    {user.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{user.fullName}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
