"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Save, FileText, Sparkles } from "lucide-react";
import Link from "next/link";
import TemplateSelector from "./TemplateSelector";
import { PersonalInfoStep, EducationStep, SkillsStep, ExperienceStep, ProjectsStep, AchievementsStep } from "./FormSteps";
import ATSScoreCard from "./ATSScoreCard";
import ResumePreview from "./ResumePreview";
import ResumeExport from "./ResumeExport";
import { useAuthStore } from "@/lib/auth-store";

interface PersonalInfoData {
    fullName: string; email: string; phone: string; location: string; linkedin?: string; portfolio?: string;
}

const STEPS = [
    { id: "template", label: "Template" },
    { id: "personal", label: "Personal" },
    { id: "education", label: "Education" },
    { id: "skills", label: "Skills" },
    { id: "experience", label: "Experience" },
    { id: "projects", label: "Projects" },
    { id: "achievements", label: "Achievements" },
    { id: "preview", label: "Preview" },
];

export default function ResumeWizard() {
    const [step, setStep] = useState(0);
    const [templateId, setTemplateId] = useState("minimal");
    const [personalInfo, setPersonalInfo] = useState<PersonalInfoData>({ fullName: "", email: "", phone: "", location: "", linkedin: "", portfolio: "" });
    const [education, setEducation] = useState<any[]>([]);
    const [skills, setSkills] = useState<string[]>([]);
    const [experience, setExperience] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [achievements, setAchievements] = useState<string[]>([]);
    const [title, setTitle] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const { isAuthenticated } = useAuthStore();

    const next = () => setStep(prev => Math.min(STEPS.length - 1, prev + 1));
    const prev = () => setStep(prev => Math.max(0, prev - 1));

    const sections = { personalInfo, education, skills, experience, achievementCount: achievements.length };

    const handleSave = async () => {
        if (!isAuthenticated) return;
        setSaving(true);
        try {
            const res = await fetch("/api/resume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    templateId,
                    title: title || `${personalInfo.fullName || "Untitled"}'s Resume`,
                    personalInfo,
                    education,
                    skills,
                    experience,
                    projects,
                    achievements,
                }),
            });
            if (res.ok) setSaved(true);
        } catch {}
        finally { setSaving(false); }
    };

    const renderStep = () => {
        const props = { personalInfo, setPersonalInfo, education, setEducation, skills, setSkills, experience, setExperience, projects, setProjects, achievements, setAchievements };
        switch (step) {
            case 0: return <TemplateSelector selected={templateId} onSelect={setTemplateId} />;
            case 1: return <PersonalInfoStep {...props} />;
            case 2: return <EducationStep {...props} />;
            case 3: return <SkillsStep {...props} />;
            case 4: return <ExperienceStep {...props} />;
            case 5: return <ProjectsStep {...props} />;
            case 6: return <AchievementsStep {...props} />;
            case 7: return (
                <div className="text-center">
                    <div className="h-16 w-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="heading-section text-xl mb-2">Your Resume is Ready!</h2>
                    <p className="text-neutral-mediumGray text-sm mb-6">
                        Review your resume preview on the right. Download as PDF or save to your account.
                    </p>
                    <div className="flex items-center gap-3 justify-center flex-wrap">
                        <ResumeExport
                            templateId={templateId}
                            personalInfo={personalInfo}
                            education={education}
                            skills={skills}
                            experience={experience}
                            projects={projects}
                            achievements={achievements}
                        />
                        {isAuthenticated ? (
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl font-semibold text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                            >
                                <Save className="h-4 w-4" />
                                {saved ? "Saved!" : saving ? "Saving..." : "Save to Account"}
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl font-semibold text-sm text-slate-600 hover:bg-slate-50"
                            >
                                <FileText className="h-4 w-4" /> Login to Save
                            </Link>
                        )}
                    </div>
                    {!isAuthenticated && (
                        <p className="text-xs text-slate-400 mt-3">
                            Login to save your resume and access it from your dashboard later.
                        </p>
                    )}
                </div>
            );
            default: return null;
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form Area */}
            <div className="lg:col-span-2">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        {STEPS.map((s, i) => (
                            <div key={s.id} className="flex flex-col items-center">
                                <button
                                    onClick={() => setStep(i)}
                                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                        i < step ? "bg-green-500 text-white" :
                                            i === step ? "bg-brand-royal text-white shadow-lg shadow-brand-royal/20" :
                                                "bg-slate-100 text-slate-400"
                                    }`}
                                >
                                    {i < step ? <Sparkles className="h-3.5 w-3.5" /> : i + 1}
                                </button>
                                <span className={`text-xs mt-1 hidden md:block ${i === step ? "text-brand-royal font-semibold" : "text-slate-400"}`}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-brand-gradient-static rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="premium-card p-6 md:p-8"
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                {step < 7 && (
                    <div className="flex items-center justify-between mt-6">
                        <button
                            onClick={prev}
                            disabled={step === 0}
                            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ArrowLeft className="h-4 w-4" /> Previous
                        </button>
                        <span className="text-xs text-slate-400">Step {step + 1} of 8</span>
                        <button
                            onClick={next}
                            className="flex items-center gap-2 px-5 py-2.5 bg-brand-gradient-static text-white rounded-xl text-sm font-semibold hover:opacity-90"
                        >
                            {step === 6 ? "Finish & Preview" : "Next"} <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                )}
                {step === 7 && (
                    <div className="flex items-center justify-center mt-6">
                        <button
                            onClick={() => { setStep(0); setTemplateId("minimal"); }}
                            className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100"
                        >
                            <ArrowLeft className="h-4 w-4" /> Start Over
                        </button>
                    </div>
                )}
            </div>

            {/* Sidebar: Preview + ATS Score */}
            <div className="space-y-4">
                <ATSScoreCard sections={sections} />
                <ResumePreview
                    templateId={templateId}
                    personalInfo={personalInfo}
                    education={education}
                    skills={skills}
                    experience={experience}
                    projects={projects}
                    achievements={achievements}
                />
            </div>
        </div>
    );
}
