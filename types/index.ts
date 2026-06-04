// Academic Types
export interface Board {
    id: string;
    name: string;
    type: "national" | "state" | "international";
    slug: string;
    classes: number[];
}

export interface Subject {
    id: string;
    name: string;
    slug: string;
    chapters: Chapter[];
}

export interface Chapter {
    id: string;
    name: string;
    slug: string;
    solutions: Solution[];
    importantQuestions: Question[];
    pyqs: Question[];
}

export interface Solution {
    id: string;
    question: string;
    answer: string;
    imageUrl?: string;
    videoUrl?: string;
    isFree: boolean;
    viewCount: number;
}

export interface Question {
    id: string;
    question: string;
    answer: string;
    year?: number;
    marks?: number;
}

// Career Types
export interface Stream {
    id: string;
    name: string;
    subjects: string[];
    careerPaths: CareerPath[];
}

export interface CareerPath {
    id: string;
    name: string;
    description: string;
    educationPath: string[];
    entranceExams: string[];
    salaryRange: {
        entry: number;
        mid: number;
        senior: number;
    };
    growth: string;
    topColleges: string[];
    requiredSkills: string[];
}

// University Types
export interface College {
    id: string;
    name: string;
    slug: string;
    type: "ug" | "pg" | "both";
    location: string;
    ranking?: number;
    accreditation: string[];
    courses: Course[];
    placementStats: PlacementStat[];
    fees: FeeStructure;
    reviews: Review[];
    images: string[];
}

export interface Course {
    id: string;
    name: string;
    level: "ug" | "pg";
    duration: string;
    fees: number;
    seats: number;
    eligibility: string;
    entranceExam?: string;
}

export interface PlacementStat {
    year: number;
    averagePackage: number;
    highestPackage: number;
    placementRate: number;
}

export interface FeeStructure {
    total: number;
    perYear: number;
    hostel?: number;
    oneTime?: number;
}

export interface Review {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    course?: string;
    date: string;
}