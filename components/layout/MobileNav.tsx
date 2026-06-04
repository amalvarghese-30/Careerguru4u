"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Compass, GraduationCap, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Academic", href: "/academic", icon: BookOpen },
  { label: "Careers", href: "/career-guidance", icon: Compass },
  { label: "Colleges", href: "/universities", icon: GraduationCap },
  { label: "Profile", href: "/dashboard", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-white/95 backdrop-blur-2xl border-t border-neutral-lightGray/50 shadow-[0_-4px_24px_rgba(4,28,74,0.06)]">
        <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl transition-all duration-200",
                  isActive
                    ? "text-brand-royal"
                    : "text-neutral-mediumGray hover:text-neutral-darkGray"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
