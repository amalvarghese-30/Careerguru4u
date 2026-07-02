import type { DecisionTreeNode } from "../decision-tree.types";
import { leafNode, TOP_ENGG_EXAMS, TOP_ENGG_COLLEGES, ENGG_SALARY, TOP_MED_EXAMS, TOP_MED_COLLEGES, MED_SALARY } from "./shared";
import { PCB_BRANCH } from "./science-pcb";
import { PCM_BRANCH, PCMB_BRANCH, CS_ELECTIVE, ELECTRONICS_ELECTIVE } from "./science-pcm";

// ═══════════════════════════════════════════════
// SCIENCE STREAM — Root node that branches to PCB / PCM / PCMB / CS / Electronics
// ═══════════════════════════════════════════════

export const SCIENCE_STREAM: DecisionTreeNode = {
  id: "science",
  name: "Science Stream",
  shortDescription: "For future doctors, engineers, scientists, and tech leaders",
  detailedDescription: "Science is the most popular stream in India after Class 10, offering the widest range of high-paying, high-impact careers. Students study Physics, Chemistry, and choose between Mathematics (PCM) for engineering/tech careers or Biology (PCB) for medical/life science careers — or both (PCMB) to keep all options open. The Science stream leads to careers in medicine, engineering, research, technology, data science, biotechnology, and many more.",
  iconName: "FlaskConical",
  color: "from-blue-600 to-blue-400",
  educationPath: ["11th-12th Science (PCB/PCM/PCMB)", "UG degree (MBBS/B.Tech/B.Sc)", "PG (MD/M.Tech/M.Sc)", "Specialization / Ph.D"],
  entranceExams: [...TOP_MED_EXAMS, ...TOP_ENGG_EXAMS, "IISER Aptitude Test", "NEST", "KVPY"],
  topColleges: [...TOP_MED_COLLEGES, ...TOP_ENGG_COLLEGES, { name: "IISc Bangalore", location: "Bangalore", fees: "₹2L - ₹3L/yr" }],
  salaryRanges: ENGG_SALARY,
  growthOutlook: "Very High",
  skillsRequired: ["Scientific Thinking", "Problem Solving", "Analytical Skills", "Lab/Technical Skills", "Mathematics", "Research Aptitude"],
  specializations: ["Medicine (PCB)", "Engineering (PCM)", "Biotechnology (PCB/PCMB)", "Pure Sciences", "Data Science", "Architecture", "Pharmacy"],
  certifications: ["NEET-UG", "JEE Main/Advanced", "GATE", "CSIR-NET", "Medical PG (NEET-PG)", "USMLE (US medical)"],
  topRecruiters: ["AIIMS/Hospitals", "Google/Microsoft/Amazon", "ISRO/DRDO/BARC", "Pharma (Cipla, Sun Pharma)", "IITs/IISc (Research)", "TCS/Infosys"],
  workEnvironment: "Varies enormously — hospital, lab, tech office, factory, construction site, or research lab. Most roles are desk-based or clean indoor work.",
  governmentJobs: ["Doctor (Govt Hospital)", "ISRO Scientist", "DRDO", "BARC", "PSU Engineer", "IES", "IFoS (Forest Service)"],
  privateJobs: ["Hospitals & Clinics", "Tech Companies (FAANG+)", "Pharma & Biotech", "Core Engineering (L&T, Tata)", "Consulting"],
  researchOpportunities: ["Ph.D at IITs/IISc", "CSIR Labs", "ICMR (Medical Research)", "ISRO/DRDO Research", "Post-doc abroad"],
  entrepreneurshipPotential: "Start tech startup, hospital/clinic, diagnostic lab, biotech company, or engineering consultancy.",
  futureScope: ["AI/ML revolution", "India as global tech hub", "Biotech & genomics boom", "Semiconductor manufacturing push", "Space tech & private space companies"],
  pros: ["Highest paying stream overall", "Widest career options (doctor, engineer, scientist)", "Prestige and respect", "Global career mobility (USMLE, tech jobs abroad)", "Research opportunities at world-class institutions"],
  cons: ["Highly competitive (JEE, NEET)", "Coaching culture pressure", "Expensive private college option if govt seat missed", "Intense study load in 11th-12th", "Mental health toll during exam prep"],
  category: "Science",
  timeToComplete: "4-10 years",
  children: [
    PCB_BRANCH,
    PCM_BRANCH,
    PCMB_BRANCH,
    CS_ELECTIVE,
    ELECTRONICS_ELECTIVE,
  ],
};
