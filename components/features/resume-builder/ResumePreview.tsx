"use client";

interface TemplateProps {
    personalInfo: { fullName: string; email: string; phone: string; location: string; linkedin?: string; portfolio?: string };
    education: { degree: string; institution: string; year: string; score: string }[];
    skills: string[];
    experience: { title: string; company: string; duration: string; description: string }[];
    projects: { name: string; description: string; link?: string; technologies: string[] }[];
    achievements: string[];
}

interface Props extends TemplateProps {
    templateId: string;
}

export default function ResumePreview({ templateId, personalInfo, education, skills, experience, projects, achievements }: Props) {
    const hasContent = personalInfo.fullName || education.length > 0 || skills.length > 0;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Live Preview</span>
                <span className="text-xs text-slate-400 capitalize">{templateId} template</span>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: "600px" }}>
                <div className="bg-white" style={{ minHeight: "800px" }}>
                    {!hasContent ? (
                        <div className="flex items-center justify-center h-full min-h-[300px] text-sm text-slate-400">
                            Start filling in your details to see a preview
                        </div>
                    ) : templateId === "modern" ? (
                        <ModernTemplate personalInfo={personalInfo} education={education} skills={skills} experience={experience} projects={projects} achievements={achievements} />
                    ) : templateId === "ats-friendly" ? (
                        <ATSTemplate personalInfo={personalInfo} education={education} skills={skills} experience={experience} projects={projects} achievements={achievements} />
                    ) : templateId === "professional" ? (
                        <ProfessionalTemplate personalInfo={personalInfo} education={education} skills={skills} experience={experience} projects={projects} achievements={achievements} />
                    ) : (
                        <MinimalTemplate personalInfo={personalInfo} education={education} skills={skills} experience={experience} projects={projects} achievements={achievements} />
                    )}
                </div>
            </div>
        </div>
    );
}

function MinimalTemplate({ personalInfo, education, skills, experience, projects, achievements }: TemplateProps) {
    return (
        <div className="p-8 font-sans text-sm">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900">{personalInfo.fullName || "Your Name"}</h1>
                <p className="text-xs text-slate-500 mt-1">
                    {[personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).join(" | ")}
                </p>
            </div>
            {education.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-sm font-bold text-slate-800 uppercase border-b border-slate-200 pb-1 mb-2">Education</h2>
                    {education.map((e, i) => (
                        <div key={i} className="mb-2">
                            <p className="font-semibold">{e.degree}</p>
                            <p className="text-xs text-slate-500">{e.institution} &middot; {e.year} &middot; {e.score}</p>
                        </div>
                    ))}
                </div>
            )}
            {skills.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-sm font-bold text-slate-800 uppercase border-b border-slate-200 pb-1 mb-2">Skills</h2>
                    <div className="flex flex-wrap gap-1">
                        {skills.map(s => (
                            <span key={s} className="text-xs px-2 py-0.5 bg-slate-100 rounded">{s}</span>
                        ))}
                    </div>
                </div>
            )}
            {experience.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-sm font-bold text-slate-800 uppercase border-b border-slate-200 pb-1 mb-2">Experience</h2>
                    {experience.map((e, i) => (
                        <div key={i} className="mb-3">
                            <p className="font-semibold">{e.title} - {e.company}</p>
                            <p className="text-xs text-slate-500">{e.duration}</p>
                            {e.description && <p className="text-xs text-slate-600 mt-1">{e.description}</p>}
                        </div>
                    ))}
                </div>
            )}
            {projects.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-sm font-bold text-slate-800 uppercase border-b border-slate-200 pb-1 mb-2">Projects</h2>
                    {projects.map((p, i) => (
                        <div key={i} className="mb-2">
                            <p className="font-semibold">{p.name}</p>
                            {p.description && <p className="text-xs text-slate-600">{p.description}</p>}
                        </div>
                    ))}
                </div>
            )}
            {achievements.length > 0 && (
                <div>
                    <h2 className="text-sm font-bold text-slate-800 uppercase border-b border-slate-200 pb-1 mb-2">Achievements</h2>
                    {achievements.map((a, i) => (
                        <p key={i} className="text-xs text-slate-600 mb-1">- {a}</p>
                    ))}
                </div>
            )}
        </div>
    );
}

function ProfessionalTemplate({ personalInfo, education, skills, experience, projects, achievements }: TemplateProps) {
    return (
        <div className="p-8 font-sans text-sm">
            <div className="border-b-2 border-brand-royal pb-4 mb-4">
                <h1 className="text-2xl font-bold text-brand-royal">{personalInfo.fullName || "Your Name"}</h1>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                    {personalInfo.email && <span>{personalInfo.email}</span>}
                    {personalInfo.phone && <span>{personalInfo.phone}</span>}
                    {personalInfo.location && <span>{personalInfo.location}</span>}
                    {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                    {experience.length > 0 && (
                        <div className="mb-4">
                            <h2 className="text-sm font-bold text-brand-royal uppercase mb-2">Professional Experience</h2>
                            {experience.map((e, i) => (
                                <div key={i} className="mb-3">
                                    <p className="font-semibold text-slate-800">{e.title}</p>
                                    <p className="text-xs text-slate-500">{e.company} | {e.duration}</p>
                                    {e.description && <p className="text-xs text-slate-600 mt-1">{e.description}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                    {projects.length > 0 && (
                        <div className="mb-4">
                            <h2 className="text-sm font-bold text-brand-royal uppercase mb-2">Projects</h2>
                            {projects.map((p, i) => (
                                <div key={i} className="mb-2">
                                    <p className="font-semibold text-slate-800 text-xs">{p.name}</p>
                                    {p.description && <p className="text-xs text-slate-600">{p.description}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div>
                    {skills.length > 0 && (
                        <div className="mb-4">
                            <h2 className="text-sm font-bold text-brand-royal uppercase mb-2">Skills</h2>
                            <div className="flex flex-wrap gap-1">
                                {skills.map(s => (
                                    <span key={s} className="text-xs px-2 py-0.5 bg-brand-bg text-brand-royal rounded">{s}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {education.length > 0 && (
                        <div className="mb-4">
                            <h2 className="text-sm font-bold text-brand-royal uppercase mb-2">Education</h2>
                            {education.map((e, i) => (
                                <div key={i} className="mb-2">
                                    <p className="font-semibold text-xs">{e.degree}</p>
                                    <p className="text-xs text-slate-500">{e.institution} &middot; {e.year}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    {achievements.length > 0 && (
                        <div>
                            <h2 className="text-sm font-bold text-brand-royal uppercase mb-2">Achievements</h2>
                            {achievements.map((a, i) => (
                                <p key={i} className="text-xs text-slate-600 mb-1">{a}</p>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ModernTemplate({ personalInfo, education, skills, experience, projects, achievements }: TemplateProps) {
    return (
        <div className="font-sans text-sm">
            <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-8 text-white">
                <h1 className="text-2xl font-bold">{personalInfo.fullName || "Your Name"}</h1>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-white/80">
                    {personalInfo.email && <span>{personalInfo.email}</span>}
                    {personalInfo.phone && <span>{personalInfo.phone}</span>}
                    {personalInfo.location && <span>{personalInfo.location}</span>}
                </div>
            </div>
            <div className="p-8">
                {experience.length > 0 && (
                    <div className="mb-4">
                        <h2 className="text-sm font-bold text-purple-700 uppercase mb-2">Experience</h2>
                        {experience.map((e, i) => (
                            <div key={i} className="mb-3 p-3 rounded-lg bg-purple-50">
                                <p className="font-semibold text-slate-800">{e.title}</p>
                                <p className="text-xs text-slate-500">{e.company} | {e.duration}</p>
                                {e.description && <p className="text-xs text-slate-600 mt-1">{e.description}</p>}
                            </div>
                        ))}
                    </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        {education.length > 0 && (
                            <div className="mb-4">
                                <h2 className="text-sm font-bold text-purple-700 uppercase mb-2">Education</h2>
                                {education.map((e, i) => (
                                    <div key={i} className="mb-2">
                                        <p className="font-semibold text-xs">{e.degree}</p>
                                        <p className="text-xs text-slate-500">{e.institution} &middot; {e.year}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        {skills.length > 0 && (
                            <div className="mb-4">
                                <h2 className="text-sm font-bold text-purple-700 uppercase mb-2">Skills</h2>
                                <div className="flex flex-wrap gap-1">
                                    {skills.map(s => (
                                        <span key={s} className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">{s}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {achievements.length > 0 && (
                    <div>
                        <h2 className="text-sm font-bold text-purple-700 uppercase mb-2">Achievements</h2>
                        <div className="grid grid-cols-2 gap-1">
                            {achievements.map((a, i) => (
                                <p key={i} className="text-xs text-slate-600">- {a}</p>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ATSTemplate({ personalInfo, education, skills, experience, projects, achievements }: TemplateProps) {
    return (
        <div className="p-8 font-sans text-sm text-slate-800">
            <div className="mb-6">
                <h1 className="text-xl font-bold uppercase">{personalInfo.fullName || "Your Name"}</h1>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-slate-600">
                    {personalInfo.email && <span>{personalInfo.email}</span>}
                    {personalInfo.phone && <span>{personalInfo.phone}</span>}
                    {personalInfo.location && <span>{personalInfo.location}</span>}
                    {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
                </div>
            </div>
            {skills.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-xs font-bold uppercase text-slate-800 mb-1 border-b border-slate-300 pb-0.5">Skills</h2>
                    <p className="text-xs text-slate-600">{skills.join(", ")}</p>
                </div>
            )}
            {experience.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-xs font-bold uppercase text-slate-800 mb-1 border-b border-slate-300 pb-0.5">Professional Experience</h2>
                    {experience.map((e, i) => (
                        <div key={i} className="mb-2">
                            <p className="text-xs font-semibold">{e.title}, {e.company} &ndash; <span className="font-normal text-slate-500">{e.duration}</span></p>
                            {e.description && <ul className="list-disc ml-4 text-xs text-slate-600 mt-0.5"><li>{e.description}</li></ul>}
                        </div>
                    ))}
                </div>
            )}
            {education.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-xs font-bold uppercase text-slate-800 mb-1 border-b border-slate-300 pb-0.5">Education</h2>
                    {education.map((e, i) => (
                        <p key={i} className="text-xs text-slate-600 mb-0.5">
                            <span className="font-semibold">{e.degree}</span> &ndash; {e.institution}, {e.year} | {e.score}
                        </p>
                    ))}
                </div>
            )}
            {projects.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-xs font-bold uppercase text-slate-800 mb-1 border-b border-slate-300 pb-0.5">Projects</h2>
                    {projects.map((p, i) => (
                        <div key={i} className="mb-1">
                            <p className="text-xs font-semibold">{p.name}{p.link && <span className="font-normal text-slate-400"> &ndash; {p.link}</span>}</p>
                            {p.description && <p className="text-xs text-slate-600">{p.description}</p>}
                            {p.technologies.length > 0 && <p className="text-xs text-slate-400 mt-0.5">{p.technologies.join(" | ")}</p>}
                        </div>
                    ))}
                </div>
            )}
            {achievements.length > 0 && (
                <div>
                    <h2 className="text-xs font-bold uppercase text-slate-800 mb-1 border-b border-slate-300 pb-0.5">Achievements</h2>
                    <ul className="list-disc ml-4">
                        {achievements.map((a, i) => (
                            <li key={i} className="text-xs text-slate-600">{a}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
