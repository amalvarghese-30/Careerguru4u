"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Calendar, Clock, Eye, ArrowRight, FileText, Loader2 } from "lucide-react";

interface BlogPost {
  _id?: string; title: string; slug: string; category: string;
  excerpt: string; readTime: string; views: number;
  publishedAt: string; tags: string[];
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    fetch(`/api/blog?${params}`)
      .then(r => r.json())
      .then(data => setPosts(data.posts || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category]);

  const filtered = posts.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.excerpt || "").toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(posts.map(p => p.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-brand-bg pt-16">
      <section className="bg-gradient-to-br from-brand-navy via-brand-navy to-brand-royal py-16">
        <div className="container-custom max-w-3xl mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Career Guidance Blog
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-white/70 text-lg mb-8">
            Expert articles, guides, and insights to help you navigate your career journey
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-lightGray" />
            <input type="text" placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white shadow-lg text-neutral-nearBlack placeholder:text-neutral-mediumGray focus:outline-none focus:ring-2 focus:ring-brand-royal" />
          </motion.div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="py-4 bg-white border-b border-neutral-lightGray/50 sticky top-16 z-20">
          <div className="container-custom">
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setCategory("")}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium ${!category ? "bg-brand-royal text-white" : "bg-brand-bg text-neutral-darkGray"}`}>All</button>
              {categories.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium ${category === cat ? "bg-brand-royal text-white" : "bg-brand-bg text-neutral-darkGray"}`}>{cat}</button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container-custom py-12">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 text-brand-royal animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="h-16 w-16 text-neutral-lightGray mx-auto mb-4" />
            <h2 className="text-xl font-bold text-neutral-nearBlack mb-2">No Articles Found</h2>
            <p className="text-neutral-mediumGray">Check back soon for new content.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post, i) => (
              <motion.div key={post._id || post.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={`/blog/${post.slug}`} className="block h-full">
                  <div className="premium-card p-6 h-full group hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-bg text-brand-royal">{post.category}</span>
                    </div>
                    <h3 className="font-bold text-neutral-nearBlack text-lg mb-2 group-hover:text-brand-royal transition-colors line-clamp-2">{post.title}</h3>
                    <p className="text-sm text-neutral-mediumGray mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-neutral-mediumGray">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(post.publishedAt || "").toLocaleDateString("en-IN")}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime || "5 min"}</span>
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {(post.views || 0).toLocaleString()}</span>
                    </div>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-neutral-lightGray">
                        {post.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
