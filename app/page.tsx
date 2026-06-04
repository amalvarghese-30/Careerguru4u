"use client";

import { HeroSection } from "@/components/sections/HeroSection";
import { ThreePillars } from "@/components/sections/ThreePillars";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { EverythingWeOffer } from "@/components/sections/EverythingWeOffer";
import { BoardSelector } from "@/components/sections/BoardSelector";
import { StudentJourney } from "@/components/sections/StudentJourney";
import { StreamSelectorPreview } from "@/components/sections/StreamSelectorPreview";
import { FlowchartPreview } from "@/components/sections/FlowchartPreview";
import { AIToolsShowcase } from "@/components/sections/AIToolsShowcase";
import { FeaturedColleges } from "@/components/sections/FeaturedColleges";
import { StudentSuccess } from "@/components/sections/StudentSuccess";
import { LatestResources } from "@/components/sections/LatestResources";
import { CounsellingBanner } from "@/components/sections/CounsellingBanner";
import { CTASection } from "@/components/sections/CTASection";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <HeroSection />
      <ThreePillars />
      <WhyChooseUs />
      <EverythingWeOffer />
      <BoardSelector />
      <StudentJourney />
      <StreamSelectorPreview />
      <FlowchartPreview />
      <AIToolsShowcase />
      <FeaturedColleges />
      <StudentSuccess />
      <LatestResources />
      <CounsellingBanner />
      <CTASection />
    </motion.div>
  );
}
