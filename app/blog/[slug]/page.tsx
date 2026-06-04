"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Eye, FileText, Tag, Loader2, Share2 } from "lucide-react";

interface BlogPost {
  _id?: string; title: string; slug: string; category: string;
  excerpt: string; content: string; readTime: string; views: number;
  publishedAt: string; tags: string[]; author: string;
  metaTitle?: string; metaDescription?: string;
}

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.post) setPost(data.post);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg pt-16">
        <Loader2 className="h-10 w-10 text-brand-royal animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg pt-16">
        <div className="text-center">
          <FileText className="h-16 w-16 text-neutral-lightGray mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-neutral-nearBlack mb-3">Article Not Found</h1>
          <Link href="/blog" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" /> Browse Articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg pt-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-navy via-brand-navy to-brand-royal text-white py-16">
        <div className="container-custom max-w-3xl mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">{post.category}</span>
            <span className="text-xs text-white/60 flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime || "5 min read"}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{post.title}</h1>
          {post.excerpt && <p className="text-white/70 text-lg">{post.excerpt}</p>}
          <div className="flex items-center gap-4 mt-6 text-sm text-white/50">
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(post.publishedAt || "").toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span>
            <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {(post.views || 0).toLocaleString()} views</span>
            {post.author && <span>By {post.author}</span>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom max-w-3xl mx-auto py-12">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-lightGray/50">
          {post.content ? (
            <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
          ) : (
            <div className="text-neutral-mediumGray leading-relaxed whitespace-pre-wrap">{post.excerpt}</div>
          )}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span key={tag} className="px-3 py-1.5 rounded-xl bg-white border border-neutral-lightGray text-sm text-neutral-mediumGray">{tag}</span>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/counselling" className="btn-primary inline-flex items-center gap-2">
            Need Career Guidance? Book a Free Session <ArrowLeft className="h-4 w-4 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}
