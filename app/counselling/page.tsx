// app/counselling/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, User, Phone, Mail, BookOpen, MessageCircle, ChevronRight, CheckCircle, GraduationCap } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const counsellingPurposes = [
    "Stream selection after 10th",
    "Career path guidance",
    "College selection",
    "Admission process help",
    "Scholarship guidance",
];

const counsellors = [
    {
        name: "Dr. Priya Sharma",
        expertise: "Career Counselling, Stream Selection",
        experience: "12+ years",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    {
        name: "Prof. Amit Mehta",
        expertise: "College Admissions, MBA Guidance",
        experience: "15+ years",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    },
    {
        name: "Ms. Neha Gupta",
        expertise: "Career Planning, Skill Development",
        experience: "8+ years",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
];

export default function CounsellingPage() {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        board: "",
        class: "",
        purpose: [] as string[],
        message: "",
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/counselling/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Submission failed");
            setSubmitted(true);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const togglePurpose = (purpose: string) => {
        setFormData((prev) => ({
            ...prev,
            purpose: prev.purpose.includes(purpose)
                ? prev.purpose.filter((p) => p !== purpose)
                : [...prev.purpose, purpose],
        }));
    };

    if (submitted) {
        return (
            <div className="pt-20 min-h-screen flex items-center justify-center">
                <div className="container-custom text-center py-16">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
                    >
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-4">Booking Confirmed!</h1>
                    <p className="text-slate-500 mb-8">
                        Thank you for booking a counselling session. Our counsellor will contact you within 24 hours.
                    </p>
                    <a href="/" className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700">
                        Back to Home <ChevronRight className="h-5 w-5" />
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-20">
            {/* Hero Section */}
            <section className="bg-ocean-gradient py-16">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
                        >
                            Get FREE Expert Career Counselling
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-white/80 text-lg"
                        >
                            Talk to experienced counsellors and make informed decisions about your future.
                        </motion.p>
                    </div>
                </div>
            </section>

            <section className="section-padding">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Form Section */}
                        <div className="lg:col-span-2">
                            <GlassCard>
                                <h2 className="heading-section text-2xl mb-6">Book Your Free Session</h2>
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                                                    placeholder="Enter your full name"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number *</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <input
                                                    type="tel"
                                                    required
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                                                    placeholder="Enter your phone number"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address *</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <input
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                                                    placeholder="Enter your email"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Board *</label>
                                            <div className="relative">
                                                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <select
                                                    required
                                                    value={formData.board}
                                                    onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 appearance-none"
                                                >
                                                    <option value="">Select Board</option>
                                                    <option>CBSE</option>
                                                    <option>ICSE</option>
                                                    <option>Maharashtra Board</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Current Class/Education *</label>
                                            <div className="relative">
                                                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <select
                                                    required
                                                    value={formData.class}
                                                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 appearance-none"
                                                >
                                                    <option value="">Select</option>
                                                    <option>Class 10</option>
                                                    <option>Class 11</option>
                                                    <option>Class 12</option>
                                                    <option>Graduate</option>
                                                    <option>Postgraduate</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">What do you need help with? *</label>
                                        <div className="flex flex-wrap gap-2">
                                            {counsellingPurposes.map((purpose) => (
                                                <button
                                                    key={purpose}
                                                    type="button"
                                                    onClick={() => togglePurpose(purpose)}
                                                    className={`px-4 py-2 rounded-xl text-sm transition-all ${formData.purpose.includes(purpose)
                                                        ? "bg-primary-600 text-white"
                                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                        }`}
                                                >
                                                    {purpose}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Additional Message</label>
                                        <div className="relative">
                                            <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                            <textarea
                                                rows={3}
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                                                placeholder="Tell us more about your career goals..."
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl text-center">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-60"
                                    >
                                        {loading ? "Submitting..." : "Book Free Session"}
                                    </button>
                                    <p className="text-xs text-slate-400 text-center">
                                        By booking, you agree to our terms and privacy policy. This is a 100% free service.
                                    </p>
                                </form>
                            </GlassCard>
                        </div>

                        {/* Counsellors Section */}
                        <div>
                            <GlassCard>
                                <h3 className="font-semibold text-slate-800 mb-4">Meet Our Counsellors</h3>
                                <div className="space-y-4">
                                    {counsellors.map((counsellor) => (
                                        <div key={counsellor.name} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                            <img
                                                src={counsellor.image}
                                                alt={counsellor.name}
                                                className="h-12 w-12 rounded-full object-cover"
                                            />
                                            <div className="flex-1">
                                                <p className="font-semibold text-slate-800 text-sm">{counsellor.name}</p>
                                                <p className="text-xs text-slate-500">{counsellor.expertise}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-primary-600">{counsellor.experience}</span>
                                                    <span className="text-xs text-amber-500">★ {counsellor.rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <Calendar className="h-4 w-4 text-primary-600" />
                                        <span>Flexible scheduling</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600 mt-2">
                                        <Clock className="h-4 w-4 text-primary-600" />
                                        <span>30-minute sessions</span>
                                    </div>
                                </div>
                            </GlassCard>

                            <div className="mt-6 p-4 rounded-xl bg-primary-50">
                                <p className="text-sm text-primary-800">
                                    <span className="font-semibold">1,000+ students</span> have already benefited from free counselling. Book your slot today!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}