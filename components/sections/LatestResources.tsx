"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, TrendingUp } from "lucide-react";

interface BlogPost {
  _id?: string; title: string; slug: string; category: string;
  publishedAt: string; readTime: string; views: number; excerpt: string;
}

const gradients = [
  "from-brand-navy to-brand-royal",
  "from-brand-royal to-brand-electric",
  "from-brand-electric to-brand-sky",
  "from-purple-500 to-pink-500",
];

export function LatestResources() {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetch("/api/blog?limit=4")
      .then(r => r.json())
      .then(data => setPosts(data.posts || []))
      .catch(() => {});
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div>
            <span className="text-sm font-semibold text-brand-royal uppercase tracking-wider">Latest Updates</span>
            <h2 className="heading-section text-2xl md:text-3xl mt-1">Recent Resources & Guides</h2>
          </div>
          <Link href="/blog" className="text-brand-royal font-medium hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.map((post, i) => (
            <motion.div
              key={post._id || post.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.08 }}
            >
              <Link href={`/blog/${post.slug}`} className="block h-full">
                <div className="premium-card p-5 h-full group">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white bg-gradient-to-r ${gradients[i % gradients.length]}`}>
                      {post.category || "Article"}
                    </span>
                  </div>
                  <h3 className="font-semibold text-neutral-nearBlack mb-3 line-clamp-2 group-hover:text-brand-royal transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-neutral-mediumGray mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {new Date(post.publishedAt || "").toLocaleDateString("en-IN")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {post.readTime || "5 min read"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-brand-royal font-medium">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {(post.views || 0).toLocaleString()} views
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
