// app/academic/[board]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookOpen, GraduationCap } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const boardInfo: Record<string, { name: string; description: string; students: string; fullName: string }> = {
    cbse: {
        name: "CBSE",
        description: "Central Board of Secondary Education",
        students: "2.5L+",
        fullName: "Central Board of Secondary Education"
    },
    icse: {
        name: "ICSE",
        description: "Indian Certificate of Secondary Education",
        students: "1.2L+",
        fullName: "Indian Certificate of Secondary Education"
    },
    "maharashtra-board": {
        name: "Maharashtra Board",
        description: "Maharashtra State Board of Secondary and Higher Secondary Education",
        students: "1.8L+",
        fullName: "Maharashtra State Board"
    },
};

const classes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

interface BoardPageProps {
    params: {
        board: string;
    };
}

export default async function BoardPage({ params }: BoardPageProps) {
    const { board } = await params;
    const info = boardInfo[board];

    if (!info) {
        notFound();
    }

    return (
        <div className="pt-20">
            {/* Hero Section */}
            <section className="bg-ocean-gradient py-16">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                            {info.name} Solutions
                        </h1>
                        <p className="text-white/90 text-lg mb-2">{info.fullName}</p>
                        <p className="text-white/80">Trusted by {info.students} students</p>
                    </div>
                </div>
            </section>

            {/* Class Selector */}
            <section className="section-padding">
                <div className="container-custom">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="heading-section text-3xl md:text-4xl mb-4">Choose Your Class</h2>
                        <p className="text-slate-500">Select your class to access textbook solutions for {info.name}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {classes.map((classNum) => (
                            <Link key={classNum} href={`/academic/${board}/${classNum}`}>
                                <GlassCard hover className="text-center">
                                    <div className="h-14 w-14 rounded-xl bg-primary-100 flex items-center justify-center mx-auto mb-3">
                                        <span className="text-2xl font-bold text-primary-600">{classNum}</span>
                                    </div>
                                    <h3 className="font-semibold text-slate-800">Class {classNum}</h3>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {classNum >= 9 ? "Board Exam Prep" : "All Subjects"}
                                    </p>
                                </GlassCard>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Textbook Hierarchy */}
            <section className="section-padding bg-primary-surface">
                <div className="container-custom">
                    <h2 className="heading-section text-2xl md:text-3xl mb-3">Textbook Solutions for {info.name}</h2>
                    <p className="text-slate-500 text-center mb-10 max-w-2xl mx-auto">
                        We provide chapter-wise solutions for all major textbooks prescribed by {info.name}
                    </p>

                    {board === "cbse" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
                            <GlassCard hover className="p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                        <BookOpen className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <h3 className="font-semibold text-slate-800">NCERT Solutions</h3>
                                </div>
                                <p className="text-sm text-slate-500">Official NCERT textbook solutions for Classes 1–12 — Mathematics, Science, Social Science, English, Hindi, and more.</p>
                            </GlassCard>
                            <GlassCard hover className="p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                        <BookOpen className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <h3 className="font-semibold text-slate-800">NCERT Exemplar</h3>
                                </div>
                                <p className="text-sm text-slate-500">NCERT Exemplar problems with detailed step-by-step solutions for advanced practice and competitive exam prep.</p>
                            </GlassCard>
                        </div>
                    )}

                    {board === "icse" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
                            <GlassCard hover className="p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                        <BookOpen className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <h3 className="font-semibold text-slate-800">Selina Publishers</h3>
                                </div>
                                <p className="text-sm text-slate-500">Concise Selina textbook solutions — Mathematics, Physics, Chemistry, Biology for Classes 6–10.</p>
                            </GlassCard>
                            <GlassCard hover className="p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-10 w-10 rounded-xl bg-pink-100 flex items-center justify-center">
                                        <BookOpen className="h-5 w-5 text-pink-600" />
                                    </div>
                                    <h3 className="font-semibold text-slate-800">Frank/AVM Publishers</h3>
                                </div>
                                <p className="text-sm text-slate-500">Frank Brothers & AVM solutions for ICSE — covering key subjects with comprehensive answers.</p>
                            </GlassCard>
                        </div>
                    )}

                    {board === "maharashtra-board" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
                            <GlassCard hover className="p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                                        <BookOpen className="h-5 w-5 text-green-600" />
                                    </div>
                                    <h3 className="font-semibold text-slate-800">Balbharati Solutions</h3>
                                </div>
                                <p className="text-sm text-slate-500">Maharashtra State Board (Balbharati) textbook solutions — Mathematics, Science, History, Geography for Classes 1–12.</p>
                            </GlassCard>
                            <GlassCard hover className="p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                        <BookOpen className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <h3 className="font-semibold text-slate-800">Target Publications</h3>
                                </div>
                                <p className="text-sm text-slate-500">Popular reference book solutions for Classes 10 & 12 board exam preparation.</p>
                            </GlassCard>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}