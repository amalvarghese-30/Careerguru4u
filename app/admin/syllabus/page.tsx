"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search, Trash2, Filter, Plus, Edit3, X, Save, Clock } from "lucide-react";

interface SyllabusDoc {
    _id: string;
    title: string;
    board: string;
    class: number;
    subject: string;
    content: string;
    year: string;
    createdAt: string;
}

const BOARDS = ["CBSE", "ICSE", "Maharashtra Board"];
const CLASSES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function SyllabusAdminPage() {
    const [syllabus, setSyllabus] = useState<SyllabusDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [board, setBoard] = useState("");
    const [classNum, setClassNum] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [showEditor, setShowEditor] = useState(false);
    const [editing, setEditing] = useState<Partial<SyllabusDoc>>({});
    const [saving, setSaving] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const fetchSyllabus = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (board) params.set("board", board);
            if (classNum) params.set("class", classNum);
            if (subject) params.set("subject", subject);

            const res = await fetch(`/api/admin/syllabus?${params}`);
            const data = await res.json();
            setSyllabus(data.syllabus || []);
        } catch (err) {
            console.error("Failed to fetch syllabus:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSyllabus(); }, []);

    const openNew = () => {
        setEditing({ board: "CBSE", class: 10, subject: "", title: "", content: "", year: new Date().getFullYear().toString() });
        setIsNew(true);
        setShowEditor(true);
    };

    const openEdit = (s: SyllabusDoc) => {
        setEditing({ ...s });
        setIsNew(false);
        setShowEditor(true);
    };

    const handleSave = async () => {
        if (!editing.title || !editing.board || !editing.class || !editing.subject || !editing.content) {
            setMessage("Please fill all required fields");
            return;
        }
        setSaving(true); setMessage("");
        try {
            const res = await fetch("/api/admin/syllabus", {
                method: isNew ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(isNew ? editing : { _id: (editing as SyllabusDoc)._id, ...editing }),
            });
            if (res.ok) {
                setShowEditor(false); setEditing({}); fetchSyllabus();
                setMessage(isNew ? "Syllabus created" : "Syllabus updated");
            } else {
                const data = await res.json();
                setMessage(data.error || "Save failed");
            }
        } catch { setMessage("Save failed"); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        try {
            await fetch(`/api/admin/syllabus?id=${id}`, { method: "DELETE" });
            setSyllabus(prev => prev.filter(s => s._id !== id));
            setDeleteConfirm(null);
        } catch (err) { console.error("Delete failed:", err); }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Syllabus Documents</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage syllabus documents for all boards, classes, and subjects</p>
                </div>
                <button onClick={openNew} className="flex items-center gap-2 px-5 py-2.5 bg-brand-gradient-static text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all">
                    <Plus className="h-4 w-4" /> Add Syllabus
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-3"><Filter className="h-4 w-4" /> Filters</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <select value={board} onChange={(e) => setBoard(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal">
                        <option value="">All Boards</option>
                        {BOARDS.map(b => <option key={b}>{b}</option>)}
                    </select>
                    <select value={classNum} onChange={(e) => setClassNum(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal">
                        <option value="">All Classes</option>
                        {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                    <input type="text" placeholder="Subject..." value={subject} onChange={(e) => setSubject(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" />
                    <button onClick={fetchSyllabus} className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
                        <Search className="h-4 w-4 inline mr-1" /> Apply
                    </button>
                </div>
            </div>

            {message && (
                <div className={`text-sm px-4 py-3 rounded-xl ${message.includes("failed") ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50"}`}>{message}</div>
            )}

            {/* List */}
            {loading ? (
                <div className="space-y-3">{[...Array(5)].map((_, i) => (<div key={i} className="h-20 bg-white rounded-xl border border-slate-200 animate-pulse" />))}</div>
            ) : syllabus.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                    <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No syllabus documents found</p>
                    <p className="text-slate-400 text-sm mt-1">Add syllabus documents using the button above</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {syllabus.map((s) => (
                        <div key={s._id} className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <BookOpen className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 truncate">{s.title}</p>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{s.board}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">Class {s.class}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{s.subject}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3" /> {s.year}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button onClick={() => openEdit(s)} className="p-2 rounded-lg text-slate-400 hover:text-brand-royal hover:bg-brand-royal/10"><Edit3 className="h-4 w-4" /></button>
                                <button onClick={() => setDeleteConfirm(s._id)} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Editor Modal */}
            <AnimatePresence>
                {showEditor && (
                    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowEditor(false); setEditing({}); }} className="absolute inset-0 bg-black/50" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl">
                            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                                <h3 className="font-semibold text-slate-800 text-lg">{isNew ? "Add" : "Edit"} Syllabus</h3>
                                <button onClick={() => { setShowEditor(false); setEditing({}); }} className="p-2 rounded-lg hover:bg-slate-100"><X className="h-5 w-5 text-slate-500" /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Board *</label>
                                        <select value={editing.board || ""} onChange={(e) => setEditing({ ...editing, board: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal">
                                            {BOARDS.map(b => <option key={b}>{b}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Class *</label>
                                        <select value={editing.class || ""} onChange={(e) => setEditing({ ...editing, class: parseInt(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal">
                                            {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Subject *</label>
                                        <input type="text" value={editing.subject || ""} onChange={(e) => setEditing({ ...editing, subject: e.target.value })} placeholder="e.g. Science" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Year</label>
                                        <input type="text" value={editing.year || ""} onChange={(e) => setEditing({ ...editing, year: e.target.value })} placeholder="2026-27" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Title *</label>
                                    <input type="text" value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="e.g. CBSE Class 10 Science Syllabus 2026-27" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Content *</label>
                                    <textarea value={editing.content || ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={12} placeholder="Paste syllabus content here — unit names, topics, marks distribution, etc..." className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal resize-none" />
                                </div>
                            </div>
                            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
                                <button onClick={() => { setShowEditor(false); setEditing({}); }} className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-brand-gradient-static text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                                    {saving ? "Saving..." : <><Save className="h-4 w-4" /> {isNew ? "Create" : "Update"}</>}
                                </button>
                            </div>
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
                            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 className="h-6 w-6 text-red-600" /></div>
                            <h3 className="font-semibold text-slate-800 mb-2">Delete Syllabus?</h3>
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
