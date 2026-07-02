import type { DecisionTreeNode } from "../decision-tree.types";
import { SCIENCE_STREAM } from "./science";
import { COMMERCE_STREAM } from "./commerce";
import { ARTS_STREAM } from "./arts";
import { DIPLOMA_STREAM } from "./diploma";
import { ITI_STREAM } from "./iti";
import { VOCATIONAL_STREAM } from "./vocational";

// ═══════════════════════════════════════════════
// ROOT: Complete Decision Tree
// ═══════════════════════════════════════════════

export const decisionTree: DecisionTreeNode = {
  id: "root",
  name: "After 10th — Choose Your Path",
  shortDescription: "Every Indian educational pathway mapped out — find yours",
  detailedDescription: "Choosing what to do after Class 10 is one of the most important decisions in an Indian student's life. This decision tree maps out every major educational pathway available — Science (Medical & Non-Medical), Commerce, Arts & Humanities, Diploma/Polytechnic, ITI trades, and Vocational courses. Explore each branch to discover degrees, specializations, career roles, salaries, entrance exams, top colleges, and more.",
  iconName: "Compass",
  color: "from-brand-royal to-brand-electric",
  educationPath: [],
  entranceExams: [],
  topColleges: [],
  salaryRanges: { entry: "", mid: "", senior: "" },
  growthOutlook: "High",
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
  category: "Root",
  timeToComplete: "",
  children: [
    SCIENCE_STREAM,
    COMMERCE_STREAM,
    ARTS_STREAM,
    DIPLOMA_STREAM,
    ITI_STREAM,
    VOCATIONAL_STREAM,
  ],
};

// ═══════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════

export function findNodeById(id: string, root: DecisionTreeNode = decisionTree): DecisionTreeNode | null {
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findNodeById(id, child);
    if (found) return found;
  }
  return null;
}

export function getAncestors(id: string, root: DecisionTreeNode = decisionTree): DecisionTreeNode[] {
  function dfs(node: DecisionTreeNode, path: DecisionTreeNode[]): DecisionTreeNode[] | null {
    if (node.id === id) return [...path, node];
    for (const child of node.children) {
      const result = dfs(child, [...path, node]);
      if (result) return result;
    }
    return null;
  }
  return dfs(root, []) ?? [];
}

export function searchNodes(query: string, root: DecisionTreeNode = decisionTree): DecisionTreeNode[] {
  const lower = query.toLowerCase();
  const results: DecisionTreeNode[] = [];
  function dfs(node: DecisionTreeNode) {
    if (node.name.toLowerCase().includes(lower) || node.shortDescription.toLowerCase().includes(lower)) {
      results.push(node);
    }
    for (const child of node.children) {
      dfs(child);
    }
  }
  dfs(root);
  return results;
}
