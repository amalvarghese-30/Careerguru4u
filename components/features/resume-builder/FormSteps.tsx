"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";

interface PersonalInfoData {
    fullName: string; email: string; phone: string; location: string; linkedin?: string; portfolio?: string;
}

interface Props {
    personalInfo: PersonalInfoData;
    setPersonalInfo: (v: PersonalInfoData) => void;
    education: { degree: string; institution: string; year: string; score: string }[];
    setEducation: (v: any[]) => void;
    skills: string[];
    setSkills: (v: string[]) => void;
    experience: { title: string; company: string; duration: string; description: string }[];
    setExperience: (v: any[]) => void;
    projects: { name: string; description: string; link?: string; technologies: string[] }[];
    setProjects: (v: any[]) => void;
    achievements: string[];
    setAchievements: (v: string[]) => void;
}

function StepContainer({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
    return (
        <div>
            <h2 className="heading-section text-xl mb-1">{title}</h2>
            <p className="text-neutral-mediumGray text-sm mb-6">{subtitle}</p>
            {children}
        </div>
    );
}

export function PersonalInfoStep({ personalInfo, setPersonalInfo }: Props) {
    return (
        <StepContainer title="Personal Information" subtitle="This will appear at the top of your resume">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { key: "fullName", label: "Full Name *", placeholder: "John Doe" },
                    { key: "email", label: "Email *", placeholder: "john@example.com", type: "email" },
                    { key: "phone", label: "Phone *", placeholder: "+91 98765 43210", type: "tel" },
                    { key: "location", label: "Location *", placeholder: "Mumbai, Maharashtra" },
                    { key: "linkedin", label: "LinkedIn URL", placeholder: "linkedin.com/in/johndoe" },
                    { key: "portfolio", label: "Portfolio URL", placeholder: "johndoe.dev" },
                ].map(({ key, label, placeholder, type = "text" }) => (
                    <div key={key}>
                        <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
                        <input
                            type={type}
                            value={(personalInfo as any)[key] || ""}
                            onChange={e => setPersonalInfo({ ...personalInfo, [key]: e.target.value })}
                            placeholder={placeholder}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-royal/20 focus:border-brand-royal"
                        />
                    </div>
                ))}
            </div>
        </StepContainer>
    );
}

export function EducationStep({ education, setEducation }: Props) {
    const add = () => setEducation([...education, { degree: "", institution: "", year: "", score: "" }]);
    const remove = (i: number) => setEducation(education.filter((_, idx) => idx !== i));
    const update = (i: number, field: string, value: string) => {
        const updated = [...education];
        (updated[i] as any)[field] = value;
        setEducation(updated);
    };

    return (
        <StepContainer title="Education" subtitle="Add your academic qualifications">
            <AnimatePresence>
                {education.map((edu, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="premium-card p-4 mb-4"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-slate-600">Education {i + 1}</span>
                            <button onClick={() => remove(i)} className="p-1 rounded-lg hover:bg-red-50 text-red-400">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                                { key: "degree", label: "Degree", placeholder: "B.Tech Computer Science" },
                                { key: "institution", label: "Institution", placeholder: "IIT Bombay" },
                                { key: "year", label: "Year", placeholder: "2020-2024" },
                                { key: "score", label: "Score/CGPA", placeholder: "8.5 CGPA" },
                            ].map(({ key, label, placeholder }) => (
                                <div key={key}>
                                    <label className="block text-xs text-slate-500 mb-1">{label}</label>
                                    <input
                                        value={(edu as any)[key] || ""}
                                        onChange={e => update(i, key, e.target.value)}
                                        placeholder={placeholder}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand-royal/20"
                                    />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
            <button onClick={add} className="flex items-center gap-2 text-sm text-brand-royal hover:underline">
                <Plus className="h-4 w-4" /> Add Education
            </button>
        </StepContainer>
    );
}

function SkillsInput({ skills, setSkills }: { skills: string[]; setSkills: Props["setSkills"] }) {
    const [input, setInput] = useState("");

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && input.trim()) {
            e.preventDefault();
            if (!skills.includes(input.trim())) {
                setSkills([...skills, input.trim()]);
            }
            setInput("");
        }
    };

    const remove = (skill: string) => setSkills(skills.filter(s => s !== skill));

    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-3">
                {skills.map(skill => (
                    <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-gradient-static text-white text-sm font-medium"
                    >
                        {skill}
                        <button onClick={() => remove(skill)} className="hover:bg-white/20 rounded-full p-0.5">
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}
            </div>
            <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a skill and press Enter..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-royal/20"
            />
        </div>
    );
}

export function SkillsStep({ skills, setSkills }: Props) {
    return (
        <StepContainer title="Skills" subtitle="Add your technical and soft skills">
            <SkillsInput skills={skills} setSkills={setSkills} />
            <p className="text-xs text-slate-400 mt-3">
                Press Enter after typing each skill. Aim for 5-15 relevant skills.
            </p>
        </StepContainer>
    );
}

export function ExperienceStep({ experience, setExperience }: Props) {
    const add = () => setExperience([...experience, { title: "", company: "", duration: "", description: "" }]);
    const remove = (i: number) => setExperience(experience.filter((_, idx) => idx !== i));
    const update = (i: number, field: string, value: string) => {
        const updated = [...experience];
        (updated[i] as any)[field] = value;
        setExperience(updated);
    };

    return (
        <StepContainer title="Experience" subtitle="Add your work and internship experience">
            <AnimatePresence>
                {experience.map((exp, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="premium-card p-4 mb-4"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-slate-600">Experience {i + 1}</span>
                            <button onClick={() => remove(i)} className="p-1 rounded-lg hover:bg-red-50 text-red-400">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            {[
                                { key: "title", label: "Job Title", placeholder: "Software Engineer Intern" },
                                { key: "company", label: "Company", placeholder: "Google" },
                                { key: "duration", label: "Duration", placeholder: "Jun 2023 - Aug 2023" },
                            ].map(({ key, label, placeholder }) => (
                                <div key={key}>
                                    <label className="block text-xs text-slate-500 mb-1">{label}</label>
                                    <input
                                        value={(exp as any)[key] || ""}
                                        onChange={e => update(i, key, e.target.value)}
                                        placeholder={placeholder}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand-royal/20"
                                    />
                                </div>
                            ))}
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Description</label>
                            <textarea
                                value={exp.description || ""}
                                onChange={e => update(i, "description", e.target.value)}
                                placeholder="Describe your responsibilities and achievements. Use action verbs and include numbers..."
                                rows={3}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand-royal/20 resize-none"
                            />
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
            <button onClick={add} className="flex items-center gap-2 text-sm text-brand-royal hover:underline">
                <Plus className="h-4 w-4" /> Add Experience
            </button>
        </StepContainer>
    );
}

export function ProjectsStep({ projects, setProjects }: Props) {
    const [techInput, setTechInput] = useState<Record<number, string>>({});
    const add = () => setProjects([...projects, { name: "", description: "", link: "", technologies: [] }]);
    const remove = (i: number) => setProjects(projects.filter((_, idx) => idx !== i));
    const update = (i: number, field: string, value: any) => {
        const updated = [...projects];
        (updated[i] as any)[field] = value;
        setProjects(updated);
    };

    const handleTechKeyDown = (i: number, e: React.KeyboardEvent) => {
        if (e.key === "Enter" && (techInput[i] || "").trim()) {
            e.preventDefault();
            const currentTechs = projects[i]?.technologies || [];
            if (!currentTechs.includes((techInput[i] || "").trim())) {
                update(i, "technologies", [...currentTechs, (techInput[i] || "").trim()]);
            }
            setTechInput({ ...techInput, [i]: "" });
        }
    };

    return (
        <StepContainer title="Projects" subtitle="Showcase your best projects">
            <AnimatePresence>
                {projects.map((proj, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="premium-card p-4 mb-4"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-slate-600">Project {i + 1}</span>
                            <button onClick={() => remove(i)} className="p-1 rounded-lg hover:bg-red-50 text-red-400">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Project Name</label>
                                <input
                                    value={proj.name || ""}
                                    onChange={e => update(i, "name", e.target.value)}
                                    placeholder="AI Resume Builder"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand-royal/20"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Link (optional)</label>
                                <input
                                    value={proj.link || ""}
                                    onChange={e => update(i, "link", e.target.value)}
                                    placeholder="github.com/username/project"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand-royal/20"
                                />
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="block text-xs text-slate-500 mb-1">Description</label>
                            <textarea
                                value={proj.description || ""}
                                onChange={e => update(i, "description", e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand-royal/20 resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Technologies</label>
                            <div className="flex flex-wrap gap-1 mb-2">
                                {(proj.technologies || []).map((t: string) => (
                                    <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-brand-bg text-brand-royal text-xs">
                                        {t}
                                        <button
                                            onClick={() => update(i, "technologies", (proj.technologies || []).filter((x: string) => x !== t))}
                                            className="hover:text-red-500"
                                        >
                                            <X className="h-2.5 w-2.5" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <input
                                value={techInput[i] || ""}
                                onChange={e => setTechInput({ ...techInput, [i]: e.target.value })}
                                onKeyDown={e => handleTechKeyDown(i, e)}
                                placeholder="Type technology + Enter"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand-royal/20"
                            />
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
            <button onClick={add} className="flex items-center gap-2 text-sm text-brand-royal hover:underline">
                <Plus className="h-4 w-4" /> Add Project
            </button>
        </StepContainer>
    );
}

export function AchievementsStep({ achievements, setAchievements }: Props) {
    const [input, setInput] = useState("");

    const handleAdd = () => {
        if (input.trim()) {
            setAchievements([...achievements, input.trim()]);
            setInput("");
        }
    };

    const remove = (i: number) => setAchievements(achievements.filter((_, idx) => idx !== i));

    return (
        <StepContainer title="Achievements & Certifications" subtitle="Add notable achievements, awards, and certifications">
            <div className="flex gap-2 mb-4">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
                    placeholder="e.g., Winner of Hackathon 2024, AWS Certified Developer..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-royal/20"
                />
                <button
                    onClick={handleAdd}
                    className="px-4 py-2.5 bg-brand-royal text-white rounded-xl text-sm font-semibold hover:bg-brand-navy"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>
            <AnimatePresence>
                {achievements.map((a, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl mb-2"
                    >
                        <span className="text-sm text-slate-700">{a}</span>
                        <button onClick={() => remove(i)} className="p-1 rounded-lg hover:bg-red-50 text-red-400">
                            <X className="h-4 w-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </StepContainer>
    );
}
