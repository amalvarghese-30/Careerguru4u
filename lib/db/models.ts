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

export interface MCQQuestion {
    _id?: string;
    questionText: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
    board?: "CBSE" | "ICSE" | "Maharashtra Board";
    class?: number;
    subject: string;
    chapter?: string;
    examType?: string;
    sourceSolutionId?: string;
    difficulty: "easy" | "medium" | "hard";
    createdAt: Date;
}

export interface MockTestAttempt {
    _id?: string;
    userId: string;
    board?: string;
    class?: number;
    subject?: string;
    chapter?: string;
    examType?: string;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    score: number;
    timeTaken: number;
    negativeMarking?: boolean;
    negativeMarks?: number;
    answers: {
        questionId: string;
        selectedOption: number;
        isCorrect: boolean;
    }[];
    attemptedAt: Date;
}

export interface ExamPattern {
    _id?: string;
    examType: string;
    displayName: string;
    description: string;
    category: "engineering" | "medical" | "management" | "law" | "civil-service" | "design" | "other";
    subjects: { name: string; topics: string[] }[];
    totalMarks: number;
    totalQuestions: number;
    timeLimit: number;
    markingScheme: {
        correct: number;
        incorrect: number;
        unattempted: number;
    };
    eligibility: string;
    examDate: string;
    applicationLink?: string;
    icon: string;
    session: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Textbook {
    _id?: string;
    title: string;
    board: "CBSE" | "ICSE" | "Maharashtra Board";
    class: number;
    subject: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    downloads: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ConceptNote {
    _id?: string;
    title: string;
    board: "CBSE" | "ICSE" | "Maharashtra Board";
    class: number;
    subject: string;
    chapter: string;
    type: "note" | "video";
    content?: string;
    videoUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Syllabus {
    _id?: string;
    title: string;
    board: "CBSE" | "ICSE" | "Maharashtra Board";
    class: number;
    subject: string;
    content: string;
    year: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Resume {
    _id?: string;
    userId: string;
    templateId: string;
    title: string;
    personalInfo: {
        fullName: string;
        email: string;
        phone: string;
        location: string;
        linkedin?: string;
        portfolio?: string;
    };
    education: { degree: string; institution: string; year: string; score: string }[];
    skills: string[];
    experience: { title: string; company: string; duration: string; description: string }[];
    projects: { name: string; description: string; link?: string; technologies: string[] }[];
    achievements: string[];
    atsScore: number;
    atsFeedback: { category: string; score: number; suggestion: string }[];
    createdAt: Date;
    updatedAt: Date;
}