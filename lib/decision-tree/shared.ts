import type { DecisionTreeNode, College, SalaryRanges } from "../decision-tree.types";

// ═══════════════════════════════════════════════
// SHARED DATA
// ═══════════════════════════════════════════════

export const TOP_ENGG_EXAMS = ["JEE Main", "JEE Advanced", "BITSAT", "VITEEE", "SRMJEEE", "MHT CET", "WBJEE", "COMEDK"];
export const TOP_MED_EXAMS = ["NEET-UG", "AIIMS Nursing", "JIPMER", "MHT CET (Medical)"];
export const TOP_MED_COLLEGES: College[] = [
  { name: "AIIMS Delhi", location: "Delhi", fees: "₹5K - ₹15K/yr" },
  { name: "CMC Vellore", location: "Vellore", fees: "₹30K - ₹50K/yr" },
  { name: "KEM Mumbai", location: "Mumbai", fees: "₹10K - ₹20K/yr" },
  { name: "JIPMER Puducherry", location: "Puducherry", fees: "₹10K - ₹20K/yr" },
];
export const TOP_ENGG_COLLEGES: College[] = [
  { name: "IIT Bombay", location: "Mumbai", fees: "₹2.2L - ₹8L/yr" },
  { name: "IIT Delhi", location: "Delhi", fees: "₹2.2L - ₹8L/yr" },
  { name: "BITS Pilani", location: "Pilani", fees: "₹4L - ₹16L/yr" },
  { name: "NIT Trichy", location: "Tiruchirappalli", fees: "₹1.5L - ₹5L/yr" },
];

export const ENGG_SALARY: SalaryRanges = { entry: "₹4L - ₹10L", mid: "₹12L - ₹25L", senior: "₹25L - ₹60L+" };
export const MED_SALARY: SalaryRanges = { entry: "₹6L - ₹12L", mid: "₹15L - ₹30L", senior: "₹30L - ₹1Cr+" };
export const DEFAULT_SALARY: SalaryRanges = { entry: "₹3L - ₹6L", mid: "₹6L - ₹12L", senior: "₹15L - ₹25L" };

// ═══════════════════════════════════════════════
// HELPER: Create a leaf node with defaults
// ═══════════════════════════════════════════════

export function leafNode(
  id: string,
  name: string,
  shortDescription: string,
  detailedDescription: string,
  color: string,
  overrides: Partial<DecisionTreeNode> = {}
): DecisionTreeNode {
  return {
    id,
    name,
    shortDescription,
    detailedDescription,
    iconName: "Briefcase",
    color,
    educationPath: [],
    entranceExams: [],
    topColleges: [],
    salaryRanges: DEFAULT_SALARY,
    growthOutlook: "Moderate",
    skillsRequired: [],
    specializations: [],
    certifications: [],
    topRecruiters: [],
    workEnvironment: "",
    governmentJobs: [],
    privateJobs: [],
    researchOpportunities: [],
    entrepreneurshipPotential: "",
    futureScope: [],
    pros: [],
    cons: [],
    children: [],
    ...overrides,
  };
}
