// app/layout.tsx
import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Career Guru — Your Complete Academic & Career Companion",
    template: "%s | Career Guru",
  },
  description: "Free textbook solutions for Class 1-10, career guidance after 10th, and college admissions — all in one platform.",
  keywords: ["textbook solutions", "career guidance", "college admission", "CBSE", "ICSE", "Maharashtra Board"],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body className="min-h-screen bg-brand-bg font-inter antialiased">
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
          <MobileNav />
          <WhatsAppButton />
        </div>
      </body>
    </html>
  );
}