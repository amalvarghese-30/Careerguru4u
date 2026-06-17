"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, BookOpen, Compass, GraduationCap, Sparkles, ChevronDown,
  Award, PhoneCall, User, LayoutDashboard, Heart, Building2,
  Settings, LogOut, Shield, FileText, ChevronRight, Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore, isAdmin } from "@/lib/auth-store";
import Image from "next/image";

const megaMenu = {
  academic: {
    label: "Academic Solutions",
    icon: BookOpen,
    href: "/academic",
    items: [
      { title: "CBSE", href: "/academic/cbse", desc: "Class 1-10 Solutions" },
      { title: "ICSE", href: "/academic/icse", desc: "Class 1-10 Solutions" },
      { title: "Maharashtra Board", href: "/academic/maharashtra-board", desc: "Class 1-10 Solutions" },
      { title: "Important Questions", href: "/academic/important-questions", desc: "Exam-focused prep" },
      { title: "Previous Year Papers", href: "/academic/pyqs", desc: "10 years archive" },
      { title: "Sample Papers", href: "/academic/sample-papers", desc: "Latest patterns" },
      { title: "Mock Tests", href: "/mock-test", desc: "MCQ practice tests" },
      { title: "Entrance Exam Prep", href: "/mock-test/entrance", desc: "JEE, NEET, CUET & more" },
    ],
  },
  career: {
    label: "Career Guidance",
    icon: Compass,
    href: "/career-guidance",
    items: [
      { title: "After 10th Streams", href: "/career-guidance/after-10th", desc: "Science, Commerce, Arts, Vocational" },
      { title: "Career Flowchart", href: "/career-guidance/flowchart", desc: "Interactive career explorer" },
      { title: "Science Careers", href: "/career-guidance/after-10th/science", desc: "Engineering, Medical, Research" },
      { title: "Commerce Careers", href: "/career-guidance/after-10th/commerce", desc: "CA, Finance, MBA, Banking" },
      { title: "Arts Careers", href: "/career-guidance/after-10th/arts-humanities", desc: "Law, Design, Civil Services" },
      { title: "Vocational Courses", href: "/career-guidance/after-10th/vocational", desc: "ITI, Diploma, Skilled Trades" },
    ],
  },
  colleges: {
    label: "Colleges",
    icon: GraduationCap,
    href: "/universities",
    items: [
      { title: "UG Colleges", href: "/universities?type=ug", desc: "Undergraduate programs" },
      { title: "PG Colleges", href: "/universities?type=pg", desc: "Postgraduate programs" },
      { title: "College Comparison", href: "/compare", desc: "Side-by-side comparison" },
      { title: "Engineering Colleges", href: "/universities?course=engineering", desc: "B.Tech & M.Tech" },
      { title: "Medical Colleges", href: "/universities?course=medical", desc: "MBBS, BDS, BAMS" },
      { title: "MBA Colleges", href: "/universities?course=mba", desc: "Top B-Schools" },
    ],
  },
};

const otherLinks = [
  { label: "AI Tools", icon: Sparkles, href: "/ai-tools" },
  { label: "Scholarships", icon: Award, href: "/scholarships" },
  { label: "Counselling", icon: PhoneCall, href: "/counselling" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuEnter = (key: string) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setOpenMenu(key);
  };

  const handleMenuLeave = () => {
    closeTimeout.current = setTimeout(() => setOpenMenu(null), 200);
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setMobileOpen(false);
    router.push("/");
  };

  const profileDropdownItems = isAdmin(user?.role)
    ? [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
      { icon: Shield, label: "Admin Panel", href: "/admin" },
      { icon: Heart, label: "Saved Careers", href: "/dashboard?tab=careers" },
      { icon: Building2, label: "Saved Colleges", href: "/dashboard?tab=colleges" },
      { icon: Award, label: "Scholarships", href: "/scholarships" },
      { icon: PhoneCall, label: "Counselling", href: "/dashboard?tab=counselling" },
      { icon: Settings, label: "Profile Settings", href: "/dashboard" },
    ]
    : user?.role === "counsellor"
      ? [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
        { icon: Shield, label: "Counsellor Panel", href: "/admin/counselling" },
        { icon: PhoneCall, label: "My Sessions", href: "/dashboard?tab=counselling" },
        { icon: Settings, label: "Profile Settings", href: "/dashboard" },
      ]
      : [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
        { icon: Heart, label: "Saved Careers", href: "/dashboard?tab=careers" },
        { icon: Building2, label: "Saved Colleges", href: "/dashboard?tab=colleges" },
        { icon: FileText, label: "AI Resume Builder", href: "/ai-tools/resume-builder" },
        { icon: Award, label: "Scholarships", href: "/scholarships" },
        { icon: PhoneCall, label: "Counselling", href: "/dashboard?tab=counselling" },
        { icon: Settings, label: "Profile Settings", href: "/dashboard" },
      ];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-white/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(4,28,74,0.06)] border-b border-neutral-lightGray/50"
            : "bg-white/90 backdrop-blur-md border-b border-transparent"
        )}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-8">
          <nav className="flex items-center justify-between h-20">
            {/* Logo - Fixed sizing */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <div className="relative h-16 w-48">
                <Image
                  src="/logo.svg"
                  alt="CareerGuru Logo"
                  fill
                  sizes="192px"
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Nav - Increased gap */}
            <div className="hidden lg:flex items-center gap-2">
              {Object.entries(megaMenu).map(([key, menu]) => (
                <div
                  key={key}
                  className="relative"
                  onMouseEnter={() => handleMenuEnter(key)}
                  onMouseLeave={handleMenuLeave}
                >
                  <Link
                    href={menu.href}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                      pathname?.startsWith(menu.href)
                        ? "text-brand-royal bg-brand-bg"
                        : "text-neutral-darkGray hover:text-brand-royal hover:bg-brand-bg"
                    )}
                  >
                    <menu.icon className="h-4 w-4" />
                    {menu.label}
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", openMenu === key && "rotate-180")} />
                  </Link>

                  <AnimatePresence>
                    {openMenu === key && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 mt-2 w-[520px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-neutral-lightGray/50 overflow-hidden"
                      >
                        <div className="p-4 grid grid-cols-2 gap-2">
                          {menu.items.map((item) => (
                            <Link
                              key={item.title}
                              href={item.href}
                              className="flex items-start gap-3 p-3 rounded-xl hover:bg-brand-bg transition-colors group"
                            >
                              <div className="flex-shrink-0 mt-0.5">
                                <div className="h-8 w-8 rounded-lg bg-brand-gradient-static flex items-center justify-center">
                                  <menu.icon className="h-4 w-4 text-white" />
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-neutral-nearBlack group-hover:text-brand-royal transition-colors">
                                  {item.title}
                                </p>
                                <p className="text-xs text-neutral-mediumGray mt-0.5">{item.desc}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                        <div className="px-4 py-3 bg-brand-bg border-t border-neutral-lightGray/50">
                          <Link href={menu.href} className="text-sm font-semibold text-brand-royal hover:underline">
                            View All {menu.label} →
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {otherLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    pathname?.startsWith(link.href)
                      ? "text-brand-royal bg-brand-bg"
                      : "text-neutral-darkGray hover:text-brand-royal hover:bg-brand-bg"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Right */}
            <div className="hidden lg:flex items-center gap-3">
              {!hydrated ? (
                <div className="h-9 w-24 animate-pulse rounded-xl bg-neutral-lightGray/50" />
              ) : isAuthenticated && user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-brand-bg transition-colors border border-transparent hover:border-neutral-lightGray"
                  >
                    <div className="h-8 w-8 rounded-xl bg-brand-gradient-static flex items-center justify-center text-white text-sm font-bold shadow-md shadow-brand-royal/20">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-neutral-darkGray max-w-[100px] truncate">
                      {user.fullName.split(" ")[0]}
                    </span>
                    <ChevronDown className={cn("h-3.5 w-3.5 text-neutral-mediumGray transition-transform", profileOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-neutral-lightGray/50 overflow-hidden"
                      >
                        <div className="p-4 border-b border-neutral-lightGray/50">
                          <p className="text-sm font-semibold text-neutral-nearBlack">{user.fullName}</p>
                          <p className="text-xs text-neutral-mediumGray truncate">{user.email}</p>
                          <span className="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full bg-brand-bg text-brand-royal capitalize">
                            {user.role}
                          </span>
                        </div>
                        <div className="p-2">
                          {profileDropdownItems.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-neutral-darkGray hover:bg-brand-bg hover:text-brand-royal transition-colors"
                            >
                              <item.icon className="h-4 w-4" />
                              {item.label}
                            </Link>
                          ))}
                        </div>
                        <div className="p-2 border-t border-neutral-lightGray/50">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-brand-navy hover:text-brand-royal transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="btn-primary py-2.5 px-5 text-sm"
                  >
                    Sign Up Free
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Right */}
            <div className="flex lg:hidden items-center gap-2">
              {hydrated && isAuthenticated && user && (
                <Link
                  href="/dashboard"
                  className="p-2.5 rounded-xl bg-brand-bg border border-neutral-lightGray text-neutral-darkGray"
                  aria-label="Dashboard"
                >
                  <LayoutDashboard className="h-5 w-5" />
                </Link>
              )}
              <button
                onClick={() => setMobileOpen(true)}
                className="p-2.5 rounded-xl bg-brand-bg border border-neutral-lightGray text-neutral-darkGray"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-[320px] bg-white shadow-2xl overflow-y-auto"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-6">
                  <div className="relative h-10 w-32">
                    <Image
                      src="/logo.svg"
                      alt="CareerGuru Logo"
                      fill
                      sizes="128px"
                      className="object-contain"
                    />
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 rounded-xl bg-brand-bg text-neutral-darkGray"
                    aria-label="Close navigation menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Mobile Profile */}
                {hydrated && isAuthenticated && user && (
                  <div className="mb-4 p-4 rounded-2xl bg-brand-bg border border-neutral-lightGray/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-xl bg-brand-gradient-static flex items-center justify-center text-white font-bold">
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-nearBlack text-sm">{user.fullName}</p>
                        <p className="text-xs text-neutral-mediumGray capitalize">{user.role}</p>
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-brand-gradient-static text-white text-sm font-medium"
                    >
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                  </div>
                )}

                <div className="space-y-1">
                  {Object.entries(megaMenu).map(([key, menu]) => (
                    <div key={key} className="mb-4">
                      <p className="text-xs font-semibold text-neutral-mediumGray uppercase tracking-wider mb-2 px-2">
                        {menu.label}
                      </p>
                      <div className="space-y-1">
                        {menu.items.map((item) => (
                          <Link
                            key={item.title}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-brand-bg transition-colors"
                          >
                            <div className="h-8 w-8 rounded-lg bg-brand-gradient-static flex items-center justify-center flex-shrink-0">
                              <menu.icon className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-neutral-nearBlack">{item.title}</p>
                              <p className="text-xs text-neutral-mediumGray">{item.desc}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-neutral-lightGray">
                    {otherLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-brand-bg transition-colors"
                      >
                        <link.icon className="h-5 w-5 text-brand-royal" />
                        <span className="text-sm font-medium text-neutral-nearBlack">{link.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-neutral-lightGray space-y-3">
                  {hydrated && isAuthenticated ? (
                    <>
                      {isAdmin(user?.role) && (
                        <Link
                          href="/admin"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 w-full py-3 rounded-xl bg-brand-navy text-white font-semibold justify-center"
                        >
                          <Shield className="h-4 w-4" /> Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-center py-3 rounded-xl border-2 border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-colors"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setMobileOpen(false)}
                        className="block w-full text-center py-3 rounded-xl border-2 border-brand-royal text-brand-royal font-semibold hover:bg-brand-bg transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMobileOpen(false)}
                        className="block w-full text-center py-3 rounded-xl bg-brand-gradient-static text-white font-semibold"
                      >
                        Sign Up Free
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}