// lib/db/models.ts - Updated board types
export interface User {
    _id?: string;
    fullName: string;
    email: string;
    phone: string;
    password: string;
    board: "CBSE" | "ICSE" | "Maharashtra Board";
    class: string;
    schoolName?: string;
    city?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Solution {
    _id?: string;
    question: string;
    answer: string;
    board: "CBSE" | "ICSE" | "Maharashtra Board";
    class: number;
    subject: string;
    chapter: string;
    questionNumber: number;
    isFree: boolean;
    viewCount: number;
    helpfulCount: number;
    createdAt: Date;
}

export interface UserProgress {
    _id?: string;
    userId: string;
    board: "CBSE" | "ICSE" | "Maharashtra Board";
    class: number;
    subject: string;
    chapter: string;
    viewedSolutions: string[];
    freeSolutionsUsed: number;
    bookmarks: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface CounsellingRequest {
    _id?: string;
    userId?: string;
    name: string;
    phone: string;
    email: string;
    class: string;
    board?: "CBSE" | "ICSE" | "Maharashtra Board";
    purpose: string[];
    message?: string;
    status: "pending" | "contacted" | "completed" | "cancelled";
    assignedTo?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CareerAssessment {
    _id?: string;
    userId: string;
    interests: string[];
    strengths: string[];
    favoriteSubjects: string[];
    careerGoal?: string;
    recommendedStream?: string;
    recommendedCareers: string[];
    matchScores: Record<string, number>;
    createdAt: Date;
}