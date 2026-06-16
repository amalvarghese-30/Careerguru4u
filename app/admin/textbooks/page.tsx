"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search, Trash2, Download, Filter, Plus, Upload, ExternalLink, FileText } from "lucide-react";

interface Textbook {
    _id: string;
    title: string;
    board: string;
    class: number;
    subject: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    downloads: number;
    createdAt: string;
}

const BOARDS = ["CBSE", "ICSE", "Maharashtra Board"];
const CLASSES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function TextbooksAdminPage() {
    const [textbooks, setTextbooks] = useState<Textbook[]>([]);
    const [loading, setLoading] = useState(true);
    const [board, setBoard] = useState("");
    const [classNum, setClassNum] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [showUpload, setShowUpload] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const fetchTextbooks = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (board) params.set("board", board);
            if (classNum) params.set("class", classNum);
            if (subject) params.set("subject", subject);

            const res = await fetch(`/api/admin/textbooks?${params}`);
            const data = await res.json();
            setTextbooks(data.textbooks || []);
        } catch (err) {
            console.error("Failed to fetch textbooks:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTextbooks(); }, []);

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUploading(true);
        setMessage("");

        const form = e.currentTarget;
        const formData = new FormData(form);
        try {
            const res = await fetch("/api/admin/textbooks", { method: "POST", body: formData });
            const data = await res.json();
            if (res.ok) {
                setMessage("Textbook uploaded successfully");
                setShowUpload(false);
                form.reset();
                fetchTextbooks();
            } else {
                setMessage(data.error || "Upload failed");
            }
        } catch {
            setMessage("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await fetch(`/api/admin/textbooks?id=${id}`, { method: "DELETE" });
            setTextbooks(prev => prev.filter(t => t._id !== id));
            setDeleteConfirm(null);
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    const formatSize = (bytes: number) => {
        if (!bytes) return "—";
        const mb = bytes / (1024 * 1024);
        return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Textbook Library</h1>
                    <p className="text-slate-500 text-sm mt-1">Upload and manage PDF textbooks for all boards and classes</p>
                </div>
                <button
                    onClick={() => setShowUpload(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-gradient-static text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
                >
                    <Upload className="h-4 w-4" /> Upload PDF
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                    <Filter className="h-4 w-4" /> Filters
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <select value={board} onChange={(e) => setBoard(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal">
                        <option value="">All Boards</option>
                        {BOARDS.map(b => <option key={b}>{b}</option>)}
                    </select>
                    <select value={classNum} onChange={(e) => setClassNum(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal">
                        <option value="">All Classes</option>
                        {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                    <button onClick={fetchTextbooks} className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
                        <Search className="h-4 w-4 inline mr-1" /> Apply Filters
                    </button>
                </div>
            </div>

            {message && (
                <div className={`text-sm px-4 py-3 rounded-xl ${message.includes("failed") ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50"}`}>
                    {message}
                </div>
            )}

            {/* List */}
            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-20 bg-white rounded-xl border border-slate-200 animate-pulse" />
                    ))}
                </div>
            ) : textbooks.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No textbooks found</p>
                    <p className="text-slate-400 text-sm mt-1">Upload PDFs using the button above</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {textbooks.map((t) => (
                        <div key={t._id} className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                                    <FileText className="h-5 w-5 text-red-500" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 truncate">{t.title}</p>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{t.board}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">Class {t.class}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{t.subject}</span>
                                        {t.fileSize > 0 && <span className="text-xs text-slate-400">{formatSize(t.fileSize)}</span>}
                                        <span className="text-xs text-slate-400"><Download className="h-3 w-3 inline" /> {t.downloads}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <a href={t.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-slate-400 hover:text-brand-royal hover:bg-brand-royal/10 transition-colors">
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                                <button onClick={() => setDeleteConfirm(t._id)} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            <AnimatePresence>
                {showUpload && (
                    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowUpload(false)} className="absolute inset-0 bg-black/50" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-2xl border border-slate-200 w-full max-w-xl shadow-2xl">
                            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl">
                                <h3 className="font-semibold text-slate-800 text-lg">Upload Textbook PDF</h3>
                            </div>
                            <form onSubmit={handleUpload} className="p-6 space-y-4">
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Board *</label>
                                        <select name="board" required className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal">
                                            <option value="">Select</option>
                                            {BOARDS.map(b => <option key={b}>{b}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Class *</label>
                                        <select name="class" required className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal">
                                            <option value="">Select</option>
                                            {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Subject *</label>
                                        <input name="subject" required placeholder="e.g. Mathematics" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Title</label>
                                    <input name="title" placeholder="Display title (optional)" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">PDF File *</label>
                                    <input type="file" name="file" accept=".pdf" required className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200" />
                                </div>
                                <div className="text-xs text-slate-400">
                                    Or provide a URL instead of file upload — <code className="bg-slate-100 px-1 rounded">fileUrl</code> field (add as hidden input if needed).
                                </div>
                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setShowUpload(false)} className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                                    <button type="submit" disabled={uploading} className="flex items-center gap-2 px-5 py-2.5 bg-brand-gradient-static text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                                        {uploading ? "Uploading..." : <><Upload className="h-4 w-4" /> Upload</>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirm */}
            <AnimatePresence>
                {deleteConfirm && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirm(null)} className="absolute inset-0 bg-black/50" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-sm shadow-2xl text-center">
                            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="font-semibold text-slate-800 mb-2">Delete Textbook?</h3>
                            <p className="text-sm text-slate-500 mb-6">This cannot be undone.</p>
                            <div className="flex items-center gap-3 justify-center">
                                <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                                <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700">Delete</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
