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

const classes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

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
                        <p className="text-white/80 text-lg mb-2">{info.fullName}</p>
                        <p className="text-white/60">Trusted by {info.students} students</p>
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

            {/* Popular Subjects Preview */}
            <section className="section-padding bg-primary-surface">
                <div className="container-custom">
                    <h2 className="heading-section text-2xl md:text-3xl mb-8">Popular Subjects for {info.name}</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {["Mathematics", "Science", "English", "Social Science", "Hindi", "Marathi", "Sanskrit", "Computer Science"].map((subject) => (
                            <GlassCard key={subject} hover className="text-center">
                                <BookOpen className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                                <h3 className="font-medium text-slate-800">{subject}</h3>
                                <p className="text-xs text-slate-400">Most viewed</p>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}