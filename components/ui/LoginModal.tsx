// components/ui/LoginModal.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Phone, GraduationCap, BookOpen } from "lucide-react";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin?: () => void;
}

export function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
        phone: "",
        board: "",
        class: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, handle authentication here
        localStorage.setItem("isLoggedIn", "true");
        if (onLogin) onLogin();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
                    >
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <div className="flex items-center justify-between p-4 border-b border-slate-100">
                                <h2 className="text-xl font-bold text-slate-800">
                                    {isLogin ? "Welcome Back!" : "Create Free Account"}
                                </h2>
                                <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100">
                                    <X className="h-5 w-5 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {!isLogin && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-primary-400 focus:outline-none"
                                                    placeholder="Enter your full name"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <input
                                                    type="tel"
                                                    required
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-primary-400 focus:outline-none"
                                                    placeholder="Enter your phone number"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Board *</label>
                                                <div className="relative">
                                                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <select
                                                        required
                                                        value={formData.board}
                                                        onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-primary-400 focus:outline-none appearance-none"
                                                    >
                                                        <option value="">Select Board</option>
                                                        <option>CBSE</option>
                                                        <option>ICSE</option>
                                                        <option>Maharashtra Board</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Class *</label>
                                                <div className="relative">
                                                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <select
                                                        required
                                                        value={formData.class}
                                                        onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-primary-400 focus:outline-none appearance-none"
                                                    >
                                                        <option value="">Select Class</option>
                                                        {[...Array(10)].map((_, i) => (
                                                            <option key={i + 1}>Class {i + 1}</option>
                                                        ))}
                                                        <option>Class 11</option>
                                                        <option>Class 12</option>
                                                        <option>Graduate</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-primary-400 focus:outline-none"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-primary-400 focus:outline-none"
                                            placeholder={isLogin ? "Enter your password" : "Create a password"}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-primary-600 text-white py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-all"
                                >
                                    {isLogin ? "Login" : "Create Free Account"}
                                </button>

                                <p className="text-center text-sm text-slate-500">
                                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                                    <button
                                        type="button"
                                        onClick={() => setIsLogin(!isLogin)}
                                        className="text-primary-600 font-medium hover:underline"
                                    >
                                        {isLogin ? "Sign Up Free" : "Login"}
                                    </button>
                                </p>

                                <p className="text-center text-xs text-slate-400">
                                    By continuing, you agree to our Terms and Privacy Policy.
                                </p>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}