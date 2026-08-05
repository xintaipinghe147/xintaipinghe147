import type { Metadata } from "next";
import Link from "next/link";
import BlogCard from "@/components/BlogCard";
import { getBlogPosts } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  return { title: `#${decodeURIComponent(tag)}` };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const name = decodeURIComponent(tag);
  const posts = (await getBlogPosts(500)).filter((p) => p.tags.includes(name));

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-display text-4xl text-ink">#{name}</h1>
        <p className="text-ink-soft">标签「{name}」，共 {posts.length} 篇。</p>
        <Link href="/blog" className="chip">
          全部文章
        </Link>
      </header>

      {posts.length === 0 ? (
        <div className="note-card px-6 py-16 text-center text-ink-soft">
          这个标签下还没有文章。
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
