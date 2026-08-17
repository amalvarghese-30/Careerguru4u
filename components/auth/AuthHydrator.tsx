"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";

export function AuthHydrator({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const { hydrate, isAuthenticated } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    async function hydrateAuth() {
      try {
        const res = await fetch("/api/auth/verify", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (mounted && data.user) {
            hydrate(data.user);
          } else if (mounted) {
            hydrate(null);
          }
        } else {
          if (mounted) hydrate(null);
        }
      } catch {
        if (mounted) hydrate(null);
      } finally {
        if (mounted) setHydrated(true);
      }
    }

    hydrateAuth();
    return () => { mounted = false; };
  }, [hydrate]);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-brand-bg">
        {children}
      </div>
    );
  }

  return <>{children}</>;
}