"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

interface Props {
    templateId: string;
    personalInfo: { fullName: string; email: string; phone: string; location: string; linkedin?: string; portfolio?: string };
    education: { degree: string; institution: string; year: string; score: string }[];
    skills: string[];
    experience: { title: string; company: string; duration: string; description: string }[];
    projects: { name: string; description: string; link?: string; technologies: string[] }[];
    achievements: string[];
}

export default function ResumeExport(props: Props) {
    const [loading, setLoading] = useState(false);

    const exportPDF = async () => {
        setLoading(true);
        try {
            const { default: jsPDF } = await import("jspdf");
            const doc = new jsPDF({ unit: "mm", format: "a4" });

            const margin = 20;
            const pageWidth = 210;
            let y = margin;

            // Name
            const fullName = props.personalInfo.fullName || "Untitled Resume";
            doc.setFont("helvetica", "bold");
            doc.setFontSize(18);
            doc.text(fullName, margin, y);
            y += 8;

            // Contact
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            const contactInfo = [
                props.personalInfo.email,
                props.personalInfo.phone,
                props.personalInfo.location,
            ].filter(Boolean).join(" | ");
            if (contactInfo) {
                doc.text(contactInfo, margin, y);
                y += 6;
            }

            y += 4;

            const addSection = (title: string, renderFn: () => number) => {
                if (y > 250) {
                    doc.addPage();
                    y = margin;
                }
                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                doc.setTextColor(0, 0, 0);
                doc.text(title, margin, y);
                y += 5;
                doc.setLineWidth(0.3);
                doc.line(margin, y, pageWidth - margin, y);
                y += 6;
                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                doc.setTextColor(60, 60, 60);
                y = renderFn();
                y += 4;
            };

            if (props.skills.length > 0) {
                addSection("SKILLS", () => {
                    const skillText = doc.splitTextToSize(props.skills.join(", "), pageWidth - margin * 2);
                    doc.text(skillText, margin, y);
                    return y + skillText.length * 4.5;
                });
            }

            if (props.experience.length > 0) {
                addSection("EXPERIENCE", () => {
                    for (const exp of props.experience) {
                        doc.setFont("helvetica", "bold");
                        doc.text(`${exp.title} — ${exp.company}`, margin, y);
                        y += 4.5;
                        doc.setFont("helvetica", "normal");
                        doc.setTextColor(100, 100, 100);
                        doc.text(exp.duration || "", margin, y);
                        y += 4.5;
                        if (exp.description) {
                            doc.setTextColor(60, 60, 60);
                            const desc = doc.splitTextToSize(exp.description, pageWidth - margin * 2 - 5);
                            doc.text(desc, margin + 3, y);
                            y += desc.length * 4.5 + 2;
                        }
                        if (y > 250) { doc.addPage(); y = margin; }
                    }
                    return y;
                });
            }

            if (props.education.length > 0) {
                addSection("EDUCATION", () => {
                    for (const edu of props.education) {
                        doc.setFont("helvetica", "bold");
                        doc.setTextColor(0, 0, 0);
                        doc.text(edu.degree, margin, y);
                        y += 4.5;
                        doc.setFont("helvetica", "normal");
                        doc.setTextColor(100, 100, 100);
                        doc.text(`${edu.institution} | ${edu.year} | ${edu.score}`, margin, y);
                        y += 6;
                        if (y > 250) { doc.addPage(); y = margin; }
                    }
                    return y;
                });
            }

            if (props.projects.length > 0) {
                addSection("PROJECTS", () => {
                    for (const proj of props.projects) {
                        doc.setFont("helvetica", "bold");
                        doc.setTextColor(0, 0, 0);
                        doc.text(proj.name, margin, y);
                        y += 4.5;
                        if (proj.description) {
                            doc.setFont("helvetica", "normal");
                            doc.setTextColor(60, 60, 60);
                            const desc = doc.splitTextToSize(proj.description, pageWidth - margin * 2 - 3);
                            doc.text(desc, margin + 3, y);
                            y += desc.length * 4.5 + 2;
                        }
                        if (y > 250) { doc.addPage(); y = margin; }
                    }
                    return y;
                });
            }

            if (props.achievements.length > 0) {
                addSection("ACHIEVEMENTS", () => {
                    for (const ach of props.achievements) {
                        doc.text(`- ${ach}`, margin + 3, y);
                        y += 4.5;
                    }
                    return y;
                });
            }

            const fileName = `${(props.personalInfo.fullName || "resume").replace(/\s+/g, "_")}.pdf`;
            doc.save(fileName);
        } catch (err) {
            console.error("PDF export error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={exportPDF}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-orange-500 text-white rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-all"
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Download className="h-4 w-4" />
            )}
            {loading ? "Generating PDF..." : "Download PDF"}
        </button>
    );
}
