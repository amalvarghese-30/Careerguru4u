"use client";

import Image from "next/image";
import Link from "next/link";
import { Globe, Mail, Phone, MapPin } from "lucide-react";

const footerSections = [
  {
    title: "Academic Resources",
    links: [
      { label: "CBSE Solutions", href: "/academic/cbse" },
      { label: "ICSE Solutions", href: "/academic/icse" },
      { label: "Maharashtra Board", href: "/academic/maharashtra-board" },
      { label: "Important Questions", href: "/academic/important-questions" },
      { label: "Sample Papers", href: "/academic/sample-papers" },
      { label: "Previous Year Papers", href: "/academic/pyqs" },
      { label: "Entrance Exam Prep", href: "/mock-test/entrance" },
    ],
  },
  {
    title: "Career Guidance",
    links: [
      { label: "After 10th Stream Selector", href: "/career-guidance/after-10th" },
      { label: "Career Flowchart", href: "/career-guidance/flowchart" },
      { label: "Science Stream", href: "/career-guidance/after-10th/science" },
      { label: "Commerce Stream", href: "/career-guidance/after-10th/commerce" },
      { label: "Arts Stream", href: "/career-guidance/after-10th/arts-humanities" },
      { label: "Vocational Courses", href: "/career-guidance/after-10th/vocational" },
    ],
  },
  {
    title: "Colleges & Admissions",
    links: [
      { label: "UG Colleges", href: "/universities?type=ug" },
      { label: "PG Colleges", href: "/universities?type=pg" },
      { label: "Engineering Colleges", href: "/universities?course=engineering" },
      { label: "Medical Colleges", href: "/universities?course=medical" },
      { label: "MBA Colleges", href: "/universities?course=mba" },
      { label: "College Comparison", href: "/compare" },
    ],
  },
  {
    title: "Resources & Support",
    links: [
      { label: "AI Career Match", href: "/ai-tools/career-match" },
      { label: "Scholarships", href: "/scholarships" },
      { label: "Free Counselling", href: "/counselling" },
      { label: "Success Stories", href: "/success-stories" },
      { label: "Blog", href: "/blog" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
];

function SocialIcon({ type }: { type: string }) {
  const cls = "h-4 w-4";
  switch (type) {
    case "facebook": return <svg className={cls} fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
    case "twitter": return <svg className={cls} fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
    case "linkedin": return <svg className={cls} fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
    case "youtube": return <svg className={cls} fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
    case "globe": return <Globe className={cls} />;
    default: return <Globe className={cls} />;
  }
}

const socialLinks = [
  { type: "facebook", href: "#", label: "Facebook" },
  { type: "twitter", href: "#", label: "Twitter" },
  { type: "linkedin", href: "#", label: "LinkedIn" },
  { type: "youtube", href: "#", label: "YouTube" },
  { type: "globe", href: "#", label: "Website" },
];

export function Footer() {
  return (
    <footer className="bg-brand-navy text-white mt-auto">
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="relative h-20 w-56">
                <Image
                  src="/Career Guru.jpeg"
                  alt="Career Guru"
                  fill
                  sizes="224px"
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-white/70 text-sm mb-5 leading-relaxed">
              Your complete academic & career companion. Free textbook solutions, career guidance, and college admissions — all in one platform.
            </p>
            <div className="space-y-2.5 text-sm text-white/70">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-brand-sky flex-shrink-0" />
                <span>info@careerguru.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-brand-sky flex-shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-brand-sky flex-shrink-0" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </div>

          {/* Link Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-sora font-semibold text-white text-sm mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-brand-sky text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-10 pt-8 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="font-sora font-semibold text-white text-sm mb-1">
                Subscribe to Our Newsletter
              </h3>
              <p className="text-white/55 text-xs">
                Get the latest updates on exam notifications, career guidance, and college admissions.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/8 border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-electric/50 transition-all"
              />
              <button className="px-6 py-2.5 rounded-xl bg-brand-royal text-white font-semibold hover:bg-brand-electric transition-all text-sm">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/50 text-xs">
            &copy; {new Date().getFullYear()} Career Guru. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="h-9 w-9 rounded-xl bg-white/8 flex items-center justify-center text-white/70 hover:text-white hover:bg-brand-royal transition-all duration-200"
                aria-label={social.label}
              >
                <SocialIcon type={social.type} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
