import { notFound } from "next/navigation";
import Link from "next/link";
import { BookOpen, FileText, FileQuestion, Download, Lightbulb, ClipboardList, Play } from "lucide-react";
import clientPromise from "@/lib/db/mongodb";

const boardInfo: Record<string, { name: string; fullName: string }> = {
    cbse: { name: "CBSE", fullName: "Central Board of Secondary Education" },
    icse: { name: "ICSE", fullName: "Indian Certificate of Secondary Education" },
    "maharashtra-board": { name: "Maharashtra Board", fullName: "Maharashtra State Board" },
};

interface ClassPageProps {
    params: Promise<{ board: string; class: string }>;
}

interface ResourceLinks {
    solutions?: { count: number; chapters: number; href: string };
    mcqs?: { href: string };
    textbooks?: { count: number; href: string };
    conceptNotes?: { count: number; videoCount: number; href: string };
    syllabus?: { count: number; href: string };
}

export default async function ClassPage({ params }: ClassPageProps) {
    const { board, class: classParam } = await params;
    const info = boardInfo[board];
    if (!info) notFound();

    const classNum = parseInt(classParam);
    if (isNaN(classNum) || classNum < 1 || classNum > 10) notFound();

    const client = await clientPromise;
    const db = client.db("career_guru");

    // Aggregate solutions by subject
    const solAgg = await db.collection("solutions").aggregate([
        { $match: { board: info.name, class: classNum } },
        { $group: { _id: "$subject", solutions: { $sum: 1 }, chapters: { $addToSet: "$chapter" } } },
        { $sort: { _id: 1 } },
    ]).toArray();

    // Aggregate textbooks by subject
    const txtAgg = await db.collection("textbooks").aggregate([
        { $match: { board: info.name, class: classNum } },
        { $group: { _id: "$subject", count: { $sum: 1 } } },
    ]).toArray();

    // Aggregate concept notes by subject
    const cnAgg = await db.collection("concept_notes").aggregate([
        { $match: { board: info.name, class: classNum } },
        { $group: { _id: "$subject", count: { $sum: 1 }, videos: { $sum: { $cond: [{ $eq: ["$type", "video"] }, 1, 0] } } } },
    ]).toArray();

    // Aggregate syllabus by subject
    const sylAgg = await db.collection("syllabus").aggregate([
        { $match: { board: info.name, class: classNum } },
        { $group: { _id: "$subject", count: { $sum: 1 } } },
    ]).toArray();

    // Build subject map
    const subjectMap = new Map<string, ResourceLinks>();

    for (const s of solAgg) {
        const name = s._id as string;
        const slug = name.toLowerCase().replace(/\s+/g, "-");
        subjectMap.set(name, {
            solutions: {
                count: s.solutions as number,
                chapters: (s.chapters as string[]).length,
                href: `/academic/${board}/${classNum}/${encodeURIComponent(slug)}`,
            },
        });
    }

    for (const t of txtAgg) {
        const name = t._id as string;
        if (!subjectMap.has(name)) subjectMap.set(name, {});
        subjectMap.get(name)!.textbooks = { count: t.count as number, href: `/academic/${board}/${classNum}?tab=textbooks` };
    }

    for (const c of cnAgg) {
        const name = c._id as string;
        if (!subjectMap.has(name)) subjectMap.set(name, {});
        subjectMap.get(name)!.conceptNotes = {
            count: c.count as number,
            videoCount: (c.videos as number) || 0,
            href: `/academic/${board}/${classNum}?tab=notes`,
        };
    }

    for (const s of sylAgg) {
        const name = s._id as string;
        if (!subjectMap.has(name)) subjectMap.set(name, {});
        subjectMap.get(name)!.syllabus = { count: s.count as number, href: `/academic/${board}/${classNum}?tab=syllabus` };
    }

    // Also add subjects that appear in MCQ collection
    const mcqSubjects = await db.collection("mcq_questions").distinct("subject", {
        board: info.name,
        class: classNum,
    });

    for (const name of mcqSubjects) {
        if (!subjectMap.has(name)) subjectMap.set(name, {});
        subjectMap.get(name)!.mcqs = { href: `/mock-test` };
    }

    const subjects = Array.from(subjectMap.entries())
        .map(([name, resources]) => ({ name, ...resources }))
        .sort((a, b) => a.name.localeCompare(b.name));

    const totalSolutions = subjects.reduce((sum, s) => sum + (s.solutions?.count || 0), 0);
    const totalTextbooks = subjects.reduce((sum, s) => sum + (s.textbooks?.count || 0), 0);
    const totalNotes = subjects.reduce((sum, s) => sum + (s.conceptNotes?.count || 0), 0);

    const subjectSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

    return (
        <div className="pt-20">
            {/* Hero */}
            <section className="bg-ocean-gradient py-16">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 text-white/60 text-sm mb-4">
                            <Link href="/academic" className="hover:text-white transition-colors">Academic</Link>
                            <span>/</span>
                            <Link href={`/academic/${board}`} className="hover:text-white transition-colors">{info.name}</Link>
                            <span>/</span>
                            <span className="text-white">Class {classNum}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                            Class {classNum} — {info.name}
                        </h1>
                        <p className="text-white/70 text-lg">
                            {totalSolutions > 0
                                ? `${totalSolutions} solutions across ${subjects.length} subjects`
                                : "Textbook solutions, chapter-wise answers, and practice material"}
                        </p>
                        {totalTextbooks > 0 && (
                            <p className="text-white/50 text-sm mt-1">{totalTextbooks} textbook PDFs available for download</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Stats Ribbon */}
            <div className="bg-white border-b border-slate-200">
                <div className="container-custom py-4">
                    <div className="flex items-center gap-6 text-sm text-slate-500 overflow-x-auto">
                        <span className="flex items-center gap-1.5"><FileText className="h-4 w-4 text-brand-royal" /> {totalSolutions} Solutions</span>
                        <span className="flex items-center gap-1.5"><Download className="h-4 w-4 text-red-500" /> {totalTextbooks} PDFs</span>
                        <span className="flex items-center gap-1.5"><Lightbulb className="h-4 w-4 text-amber-500" /> {totalNotes} Notes & Videos</span>
                        <span className="flex items-center gap-1.5"><FileQuestion className="h-4 w-4 text-green-600" /> MCQ Practice</span>
                    </div>
                </div>
            </div>

            {/* Subject Cards - Shaalaa Style */}
            <section className="section-padding">
                <div className="container-custom">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="heading-section text-3xl md:text-4xl mb-4">Choose a Subject</h2>
                        <p className="text-slate-500">
                            {subjects.length > 0
                                ? `Select a subject to access textbook solutions, notes, PDFs, and more for ${info.name} Class ${classNum}`
                                : `Resources for ${info.name} Class ${classNum} are coming soon.`}
                        </p>
                    </div>

                    {subjects.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {subjects.map((subject) => (
                                <div key={subject.name} className="premium-card p-6 group hover:shadow-brand-hover transition-all">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="h-12 w-12 rounded-xl bg-brand-gradient-static flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                                            <BookOpen className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-slate-800 text-lg group-hover:text-brand-royal transition-colors">
                                                {subject.name}
                                            </h3>
                                            {subject.solutions ? (
                                                <p className="text-sm text-slate-500 mt-0.5">
                                                    {subject.solutions.chapters} chapter{subject.solutions.chapters !== 1 ? "s" : ""} &bull; {subject.solutions.count} solution{subject.solutions.count !== 1 ? "s" : ""}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-slate-400 mt-0.5">Resources available</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Resource Links */}
                                    <div className="space-y-1.5 border-t border-slate-100 pt-3">
                                        {subject.solutions && (
                                            <Link
                                                href={subject.solutions.href}
                                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-brand-bg hover:text-brand-royal transition-colors"
                                            >
                                                <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                                                Textbook Solutions
                                            </Link>
                                        )}
                                        {subject.conceptNotes && (
                                            <Link
                                                href={`/academic/${board}/${classNum}/${encodeURIComponent(subjectSlug(subject.name))}?view=notes`}
                                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                                            >
                                                <Lightbulb className="h-3.5 w-3.5 flex-shrink-0" />
                                                Concept Notes & Videos
                                                {subject.conceptNotes.videoCount > 0 && (
                                                    <span className="text-purple-500 ml-auto flex items-center gap-0.5">
                                                        <Play className="h-3 w-3" /> {subject.conceptNotes.videoCount}
                                                    </span>
                                                )}
                                            </Link>
                                        )}
                                        {subject.syllabus && (
                                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                                                <ClipboardList className="h-3.5 w-3.5 flex-shrink-0" />
                                                Syllabus
                                                <span className="text-slate-400 ml-auto">{subject.syllabus.count}</span>
                                            </div>
                                        )}
                                        {subject.textbooks && (
                                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors">
                                                <Download className="h-3.5 w-3.5 flex-shrink-0" />
                                                Download Textbook PDF
                                                <span className="text-slate-400 ml-auto">{subject.textbooks.count} file{subject.textbooks.count !== 1 ? "s" : ""}</span>
                                            </div>
                                        )}
                                        {subject.mcqs && (
                                            <Link
                                                href={subject.mcqs.href}
                                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-green-50 hover:text-green-700 transition-colors"
                                            >
                                                <FileQuestion className="h-3.5 w-3.5 flex-shrink-0" />
                                                MCQ Online Mock Tests
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
                                <BookOpen className="h-10 w-10 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Resources Yet</h3>
                            <p className="text-slate-500 max-w-md mx-auto">
                                We haven&apos;t added resources for {info.name} Class {classNum} yet. Content is being added regularly — check back soon!
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
