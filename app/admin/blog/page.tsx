"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, Eye, Calendar, Clock, X, CheckCircle, FileText, MessageCircle } from "lucide-react";

interface BlogPost {
  _id?: string; id?: string;
  title: string; slug: string; author: string; category: string;
  status: "published" | "draft" | "archived"; views: number; comments: number;
  publishedAt: string; readTime: string; excerpt: string; tags: string[];
  content?: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [message, setMessage] = useState("");


  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/blog", {
        credentials: "include",
      });
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const filtered = posts.filter((p) => {
    const m = (p.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(search.toLowerCase());
    const s = statusFilter === "all" || p.status === statusFilter;
    return m && s;
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const body: Record<string, unknown> = {
      title: fd.get("title"), category: fd.get("category"), status: fd.get("status"),
      excerpt: fd.get("excerpt"), readTime: fd.get("readTime"),
      content: fd.get("content"),
      tags: String(fd.get("tags") || "").split(",").map((s: string) => s.trim()).filter(Boolean),
    };

    try {
      const url = "/api/admin/blog";
      const method = editing ? "PUT" : "POST";
      if (editing) body.id = editing._id || editing.id;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(editing ? "Article updated" : "Article created");
        fetchPosts();
        setShowEditor(false);
        setEditing(null);
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`Delete "${post.title}"?`)) return;
    try {
      const id = post._id || post.id;
      const res = await fetch(`/api/admin/blog?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) { setMessage("Article deleted"); fetchPosts(); }
    } catch (e) { console.error(e); }
  };

  const statusColors: Record<string, string> = {
    published: "bg-emerald-100 text-emerald-700",
    draft: "bg-amber-100 text-amber-700",
    archived: "bg-slate-100 text-slate-600",
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Blog</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
              <div className="h-32 bg-slate-100 rounded-xl mb-4" />
              <div className="h-4 w-24 bg-slate-200 rounded mb-2" />
              <div className="h-3 w-full bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Blog</h1>
          <p className="text-sm text-slate-500 mt-1">{posts.length} articles from database</p>
        </div>
        <button onClick={() => { setEditing(null); setShowEditor(true); }}
          className="btn-primary py-2.5 px-4 text-sm flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Article
        </button>
      </div>

      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 text-emerald-700 text-sm p-3 rounded-xl text-center">
          {message}
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..." className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" />
        </div>
        <div className="flex gap-2">
          {["all", "published", "draft", "archived"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize ${statusFilter === s ? "bg-brand-gradient-static text-white shadow-brand-btn" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">No articles found</div>
        ) : filtered.map((post) => (
          <div key={post._id || post.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
              <div className="text-center">
                <div className="h-10 w-10 rounded-xl bg-brand-bg mx-auto flex items-center justify-center mb-2">
                  <FileText className="h-5 w-5 text-brand-royal" />
                </div>
                <p className="text-xs text-slate-400">{post.category}</p>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusColors[post.status]}`}>{post.status}</span>
              </div>
              <h3 className="font-bold text-slate-800 text-sm leading-snug">{post.title}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{post.excerpt}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {(post.views || 0).toLocaleString()}</span>
                <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {post.comments || 0}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime || "5 min"}</span>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                <button onClick={() => { setEditing(post); setShowEditor(true); }}
                  className="flex-1 py-2 rounded-lg bg-slate-50 text-slate-600 text-xs font-medium hover:bg-brand-bg hover:text-brand-royal transition-colors flex items-center justify-center gap-1.5"><Edit className="h-3.5 w-3.5" /> Edit</button>
                <button onClick={() => handleDelete(post)}
                  className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowEditor(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <form onSubmit={handleSave} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">{editing ? "Edit Article" : "New Article"}</h2>
                <button type="button" onClick={() => setShowEditor(false)} className="p-2 rounded-lg hover:bg-slate-100"><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              <div className="space-y-4">
                <div className="col-span-2"><label className="block text-xs font-semibold text-slate-500 mb-1">Title</label><input name="title" defaultValue={editing?.title || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" /></div>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Category</label><select name="category" defaultValue={editing?.category || "Career Guidance"} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm"><option>Career Guidance</option><option>Colleges</option><option>Exams</option><option>Scholarships</option><option>News</option></select></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Status</label><select name="status" defaultValue={editing?.status || "draft"} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Read Time</label><input name="readTime" defaultValue={editing?.readTime || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                </div>
                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Excerpt</label><textarea name="excerpt" rows={3} defaultValue={editing?.excerpt || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Tags (comma-separated)</label><input name="tags" defaultValue={editing?.tags?.join(", ") || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Content</label><textarea name="content" rows={8} defaultValue={editing?.content || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm font-mono" placeholder="Write your article content..." /></div>
              </div>
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowEditor(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm">Cancel</button>
                <button type="submit" className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2"><CheckCircle className="h-4 w-4" /> {editing ? "Save Changes" : "Publish"}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
