import { z } from "zod";

export const careerSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  subtitle: z.string().optional(),
  overview: z.string().optional(),
  stream: z.string().min(1, "Stream is required"),
  category: z.string().optional(),
  growth: z.string().optional(),
  workEnvironment: z.string().optional(),
  featured: z.boolean().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  salary: z.object({
    entry: z.string().optional(),
    mid: z.string().optional(),
    senior: z.string().optional(),
    topCompanies: z.string().optional(),
  }).optional(),
  educationPath: z.array(z.object({
    step: z.string(),
    description: z.string(),
  })).optional(),
  requiredSkills: z.array(z.object({
    name: z.string(),
    level: z.string(),
  })).optional(),
  futureScope: z.array(z.object({
    title: z.string(),
    description: z.string(),
  })).optional(),
  entranceExams: z.array(z.object({
    name: z.string(),
    description: z.string(),
    link: z.string().optional(),
  })).optional(),
  topRecruiters: z.array(z.string()).optional(),
  topColleges: z.array(z.object({
    name: z.string(),
    type: z.string(),
    location: z.string(),
    fees: z.string(),
  })).optional(),
  faqs: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).optional(),
  similarCareers: z.array(z.string()).optional(),
});

export const collegeSchema = z.object({
  name: z.string().min(2, "College name is required"),
  slug: z.string().min(2, "Slug is required"),
  location: z.string().min(1, "Location is required"),
  type: z.enum(["ug", "pg", "both"]).optional(),
  rating: z.number().min(0).max(5).optional(),
  courses: z.array(z.string()).optional(),
  fees: z.string().optional(),
  placement: z.string().optional(),
  avgPackage: z.string().optional(),
  ranking: z.string().optional(),
  description: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  infrastructure: z.array(z.string()).optional(),
  entranceExams: z.array(z.string()).optional(),
  topRecruiters: z.array(z.string()).optional(),
  established: z.string().optional(),
  featured: z.boolean().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export const flowchartNodeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  level: z.number().int().min(0).max(3),
  parentId: z.string().nullable().optional(),
  color: z.string().optional(),
  salary: z.string().optional(),
  growth: z.string().optional(),
});

export const scholarshipSchema = z.object({
  title: z.string().min(2, "Title is required"),
  provider: z.string().min(1, "Provider is required"),
  amount: z.string().optional(),
  category: z.string().optional(),
  deadline: z.string().optional(),
  eligibility: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["active", "closed", "draft"]).optional(),
  link: z.string().url().optional().or(z.literal("")),
});

export const blogPostSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z.string().min(2, "Slug is required"),
  author: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(["published", "draft", "archived"]).optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  readTime: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  coverImage: z.string().optional(),
});

export const resumeSchema = z.object({
  templateId: z.string().min(1, "Template is required"),
  title: z.string().optional(),
  personalInfo: z.object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Valid phone number is required"),
    location: z.string().min(1, "Location is required"),
    linkedin: z.string().optional(),
    portfolio: z.string().optional(),
  }),
  education: z.array(z.object({
    degree: z.string().min(1, "Degree is required"),
    institution: z.string().min(1, "Institution is required"),
    year: z.string().optional(),
    score: z.string().optional(),
  })).min(1, "At least one education entry is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  experience: z.array(z.object({
    title: z.string().optional(),
    company: z.string().optional(),
    duration: z.string().optional(),
    description: z.string().optional(),
  })).optional().default([]),
  projects: z.array(z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    link: z.string().optional(),
    technologies: z.array(z.string()).optional(),
  })).optional().default([]),
  achievements: z.array(z.string()).optional().default([]),
});

export const settingsSchema = z.object({
  siteName: z.string().optional(),
  tagline: z.string().optional(),
  siteUrl: z.string().optional(),
  metaDescription: z.string().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  address: z.string().optional(),
  socialLinks: z.object({
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
    youtube: z.string().optional(),
  }).optional(),
  footerContent: z.string().optional(),
  logo: z.string().optional(),
  favicon: z.string().optional(),
});
