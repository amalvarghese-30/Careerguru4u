"use client";

import { AuthHydrator } from "@/components/auth/AuthHydrator";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export function RootLayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <MobileNav />
      <WhatsAppButton />
    </>
  );
}

export function RootLayoutProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthHydrator>
      <RootLayoutClient>{children}</RootLayoutClient>
    </AuthHydrator>
  );
}