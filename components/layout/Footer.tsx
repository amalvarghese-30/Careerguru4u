"use client";

import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaYoutube, FaGlobe } from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";

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

const socialLinks = [
  { icon: FaFacebookF, href: "#", label: "Facebook" },
  { icon: FaTwitter, href: "#", label: "Twitter" },
  { icon: FaLinkedinIn, href: "#", label: "LinkedIn" },
  { icon: FaYoutube, href: "#", label: "YouTube" },
  { icon: FaGlobe, href: "#", label: "Website" },
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
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-white/50 text-sm mb-5 leading-relaxed">
              Your complete academic & career companion. Free textbook solutions, career guidance, and college admissions — all in one platform.
            </p>
            <div className="space-y-2.5 text-sm text-white/50">
              <div className="flex items-center gap-3">
                <MdEmail className="h-4 w-4 text-brand-sky flex-shrink-0" />
                <span>info@careerguru.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MdPhone className="h-4 w-4 text-brand-sky flex-shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3">
                <MdLocationOn className="h-4 w-4 text-brand-sky flex-shrink-0" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </div>

          {/* Link Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-sora font-semibold text-white text-sm mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/45 hover:text-brand-sky text-sm transition-colors duration-200"
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
              <h4 className="font-sora font-semibold text-white text-sm mb-1">
                Subscribe to Our Newsletter
              </h4>
              <p className="text-white/35 text-xs">
                Get the latest updates on exam notifications, career guidance, and college admissions.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/8 border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-electric/50 transition-all"
              />
              <button className="px-6 py-2.5 rounded-xl bg-brand-electric text-white font-semibold hover:bg-brand-royal transition-all text-sm">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            &copy; {new Date().getFullYear()} Career Guru. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="h-9 w-9 rounded-xl bg-white/8 flex items-center justify-center text-white/50 hover:text-white hover:bg-brand-royal transition-all duration-200"
                aria-label={social.label}
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
