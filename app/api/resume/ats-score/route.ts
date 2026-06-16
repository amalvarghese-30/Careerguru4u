import { NextRequest, NextResponse } from "next/server";

interface ResumeSections {
    personalInfo?: { fullName?: string; email?: string; phone?: string; location?: string; linkedin?: string; portfolio?: string };
    education?: { degree?: string; institution?: string }[];
    skills?: string[];
    experience?: { description?: string; title?: string }[];
    achievements?: string[];
}

function calculateATSScore(sections: ResumeSections) {
    const feedback: { category: string; score: number; suggestion: string }[] = [];
    let totalScore = 0;
    const maxScore = 100;

    // Section completeness (40%)
    const completenessChecks = [
        { category: "Personal Info", check: sections.personalInfo?.fullName && sections.personalInfo?.email && sections.personalInfo?.phone },
        { category: "Education", check: sections.education && sections.education.length > 0 && sections.education.some(e => e.degree && e.institution) },
        { category: "Skills", check: sections.skills && sections.skills.length >= 3 },
        { category: "Experience/Projects", check: (sections.experience && sections.experience.length > 0) || sections.achievements?.length },
    ];

    let completedSections = 0;
    for (const { category, check } of completenessChecks) {
        if (check) {
            completedSections++;
            feedback.push({ category, score: 10, suggestion: `${category} section looks good.` });
        } else {
            feedback.push({ category, score: 0, suggestion: `Add your ${category.toLowerCase()} information to improve your ATS score.` });
        }
    }
    totalScore += (completedSections / completenessChecks.length) * 40;

    // Keyword density (30%)
    let keywordScore = 0;
    const allText = [
        sections.personalInfo?.fullName || "",
        ...(sections.skills || []),
        ...(sections.experience?.map(e => (e.description || "") + " " + (e.title || "")) || []),
        ...(sections.achievements || []),
    ].join(" ").toLowerCase();

    const atsKeywords = ["managed", "led", "developed", "improved", "increased", "reduced", "created", "designed",
        "implemented", "achieved", "delivered", "analyzed", "collaborated", "team", "project", "results",
        "data", "strategy", "leadership", "growth"];
    const foundKeywords = atsKeywords.filter(k => allText.includes(k));
    keywordScore = Math.min(30, (foundKeywords.length / 10) * 30);
    totalScore += keywordScore;
    if (foundKeywords.length < 5) {
        feedback.push({ category: "Keywords", score: Math.round(keywordScore), suggestion: "Use more action verbs and industry keywords in your descriptions (e.g., managed, led, developed, achieved)." });
    } else {
        feedback.push({ category: "Keywords", score: Math.round(keywordScore), suggestion: "Good keyword usage. Consider adding more role-specific technical terms." });
    }

    // Quantifiable achievements (20%)
    let achievementScore = 0;
    const numbers = allText.match(/\d+%|\d+\.\d+|\$\d+|\d+\s*(?:people|team|users|customers|clients|projects)/gi) || [];
    const metricsKeywords = ["increased", "reduced", "improved", "saved", "generated", "grew"];
    const hasMetrics = metricsKeywords.some(k => allText.includes(k)) && numbers.length > 0;
    if (numbers.length >= 2 && hasMetrics) {
        achievementScore = 20;
        feedback.push({ category: "Impact", score: 20, suggestion: "Great use of quantifiable achievements with metrics." });
    } else if (numbers.length >= 1) {
        achievementScore = 12;
        feedback.push({ category: "Impact", score: 12, suggestion: "Add more quantifiable results with percentages or numbers (e.g., 'Increased sales by 25%')." });
    } else {
        feedback.push({ category: "Impact", score: 0, suggestion: "Add specific, measurable achievements (e.g., 'Reduced costs by 20%', 'Managed team of 10')." });
    }
    totalScore += achievementScore;

    // Formatting/length (10%)
    let formatScore = 0;
    if (sections.skills && sections.skills.length >= 5 && sections.skills.length <= 20) formatScore += 4;
    if (sections.education && sections.education.length >= 1 && sections.education.length <= 5) formatScore += 3;
    if (sections.achievements?.length && sections.achievements.length <= 8) formatScore += 3;
    else formatScore += 1;
    totalScore += formatScore;
    feedback.push({ category: "Format", score: formatScore, suggestion: formatScore >= 8 ? "Well-structured resume format." : "Keep your resume concise: 5-15 skills, 1-5 education entries, 3-8 achievements." });

    return {
        atsScore: Math.min(100, Math.round(totalScore)),
        feedback,
    };
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        if (!body) {
            return NextResponse.json({ error: "Resume data is required" }, { status: 400 });
        }

        const result = calculateATSScore(body);
        return NextResponse.json(result);
    } catch (error) {
        console.error("ATS Score API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
