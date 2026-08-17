// app/academic/maharashtra-board/textbooks/page.tsx
import { MaharashtraTextbooks } from "@/components/sections/MaharashtraTextbooks";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maharashtra Board Textbooks | Official eBalbharati Links | CareerGuru",
  description: "Access official Maharashtra State Board (Balbharati) textbooks for Classes 1-12. Direct links to eBalbharati portal. Marathi & English medium. No PDF hosting - only official source links.",
  openGraph: {
    title: "Maharashtra Board Textbooks | CareerGuru",
    description: "Official eBalbharati textbook links for Maharashtra State Board Classes 1-12",
    type: "website",
  },
};

export default function MaharashtraTextbooksPage() {
  return <MaharashtraTextbooks />;
}