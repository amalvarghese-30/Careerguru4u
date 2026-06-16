import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";

function extractCorrectAnswer(answer: string): string {
    const cleaned = answer
        .replace(/^(answer|ans|solution)[:\s-]*/i, "")
        .replace(/\n+/g, " ")
        .trim();

    const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length === 0) return cleaned.substring(0, 100);

    const first = sentences[0].trim();
    if (first.length <= 120) return first;
    return first.substring(0, 120) + "...";
}

function generateDistractors(correctAnswer: string, question: string, subject: string): string[] {
    const distractors: string[] = [];
    const numbers = correctAnswer.match(/\d+(\.\d+)?/g) || [];
    const words = correctAnswer.split(/\s+/).filter(w => w.length > 4);

    if (numbers.length > 0 && numbers[0]) {
        const firstNum = numbers[0];
        const num = parseFloat(firstNum);
        distractors.push(correctAnswer.replace(firstNum, String(num + Math.max(1, Math.round(num * 0.2)))));
        distractors.push(correctAnswer.replace(firstNum, String(Math.max(0, num - Math.max(1, Math.round(num * 0.15))))));
        if (numbers.length > 1 && numbers[1]) {
            distractors.push(correctAnswer.replace(numbers[1], String(parseFloat(numbers[1]) * 2)));
        } else if (num > 10) {
            distractors.push(correctAnswer.replace(firstNum, String(Math.round(num * 0.5))));
        }
    }

    if (distractors.length < 3 && words.length >= 3) {
        const replacements: Record<string, string[]> = {
            "increase": ["decrease", "remain constant"],
            "decrease": ["increase", "remain unchanged"],
            "higher": ["lower", "equal"],
            "lower": ["higher", "same"],
            "faster": ["slower", "unchanged"],
            "greater": ["lesser", "equal"],
            "positive": ["negative", "zero"],
            "true": ["false"],
        };

        for (const word of words) {
            const key = Object.keys(replacements).find(k => word.toLowerCase().includes(k));
            if (key && replacements[key]) {
                for (const rep of replacements[key]) {
                    if (distractors.length >= 3) break;
                    distractors.push(correctAnswer.replace(new RegExp(word, "i"), rep));
                }
                break;
            }
        }
    }

    if (distractors.length < 3) {
        distractors.push("None of the above");
        distractors.push("All of the above");
    }

    if (distractors.length < 3) {
        distractors.push(
            correctAnswer.split(" ").reverse().join(" ").substring(0, 100),
        );
    }

    return distractors.slice(0, 3);
}

function estimateDifficulty(question: string, answer: string): "easy" | "medium" | "hard" {
    const combinedLength = question.length + answer.length;
    if (combinedLength < 100) return "easy";
    if (combinedLength < 300) return "medium";
    return "hard";
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { board, class: classNum, subject, chapter, limit = 10, examType } = body;

        if (!examType && (!board || !classNum || !subject)) {
            return NextResponse.json({ error: "board, class, and subject are required (or examType + subject)" }, { status: 400 });
        }

        if (examType && !subject) {
            return NextResponse.json({ error: "subject is required with examType" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("career_guru");

        const query: any = {};
        if (examType) {
            query.subject = subject;
        } else {
            query.board = board;
            query.class = parseInt(classNum);
            query.subject = subject;
        }
        if (chapter) query.chapter = chapter;

        const solutions = await db.collection("solutions")
            .find(query)
            .limit(Math.min(limit, 30))
            .toArray();

        if (solutions.length === 0) {
            return NextResponse.json({ error: "No solutions found for the given criteria" }, { status: 404 });
        }

        const generated: any[] = [];
        for (const sol of solutions) {
            const correctAnswer = extractCorrectAnswer(sol.answer);
            const distractors = generateDistractors(correctAnswer, sol.question, sol.subject);
            const options = [correctAnswer, ...distractors];

            for (let i = options.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [options[i], options[j]] = [options[j], options[i]];
            }

            const correctIndex = options.indexOf(correctAnswer);

            const mcq: any = {
                questionText: sol.question,
                options,
                correctOptionIndex: correctIndex,
                explanation: sol.answer,
                subject: sol.subject,
                chapter: sol.chapter,
                sourceSolutionId: sol._id?.toString(),
                difficulty: estimateDifficulty(sol.question, sol.answer),
                createdAt: new Date(),
            };

            if (examType) {
                mcq.examType = examType;
            } else {
                mcq.board = sol.board;
                mcq.class = sol.class;
            }

            const existing = await db.collection("mcq_questions").findOne({
                sourceSolutionId: sol._id?.toString(),
            });

            if (!existing) {
                const result = await db.collection("mcq_questions").insertOne(mcq);
                generated.push({ ...mcq, _id: result.insertedId });
            }
        }

        return NextResponse.json({
            message: `Generated ${generated.length} new MCQ questions (${solutions.length - generated.length} already existed)`,
            generated: generated.length,
            totalProcessed: solutions.length,
        });
    } catch (error) {
        console.error("MCQ Generate API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
