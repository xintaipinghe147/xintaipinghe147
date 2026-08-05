import type { Metadata } from "next";
import Link from "next/link";
import BlogCard from "@/components/BlogCard";
import { getBlogPosts } from "@/lib/data";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "文章",
};

export default async function BlogPage() {
  const posts = await getBlogPosts(200);
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-display text-4xl text-ink">文章</h1>
        <p className="text-ink-soft">
          随笔、读书笔记、碎碎念，共 {posts.length} 篇。
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/blog" className="chip chip-active">
            全部
          </Link>
          {SITE.categories.map((c) => (
            <Link
              key={c}
              href={`/category/${encodeURIComponent(c)}`}
              className="chip"
            >
              {c}
            </Link>
          ))}
          <Link href="/archive" className="chip">
            按年月归档
          </Link>
        </div>
      </header>

      {posts.length === 0 ? (
        <div className="note-card px-6 py-16 text-center text-ink-soft">
          还没有文章，来写下第一篇吧。
        </div>
      ) : (
        <div className="masonry">
          {posts.map((post, i) => (
            <div key={post.id} className="masonry-item">
              <BlogCard post={post} index={i} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
