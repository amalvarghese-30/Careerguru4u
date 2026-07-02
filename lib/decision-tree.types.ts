export interface College {
  name: string;
  location: string;
  fees: string;
}

export interface SalaryRanges {
  entry: string;
  mid: string;
  senior: string;
}

export type GrowthOutlook = "Very High" | "High" | "Moderate" | "Stable";

export interface DecisionTreeNode {
  id: string;
  name: string;
  shortDescription: string;
  detailedDescription: string;
  iconName: string;
  color: string;
  educationPath: string[];
  entranceExams: string[];
  topColleges: College[];
  salaryRanges: SalaryRanges;
  growthOutlook: GrowthOutlook;
  skillsRequired: string[];
  specializations: string[];
  certifications: string[];
  topRecruiters: string[];
  workEnvironment: string;
  governmentJobs: string[];
  privateJobs: string[];
  researchOpportunities: string[];
  entrepreneurshipPotential: string;
  futureScope: string[];
  pros: string[];
  cons: string[];
  category?: string;
  timeToComplete?: string;
  children: DecisionTreeNode[];
}
