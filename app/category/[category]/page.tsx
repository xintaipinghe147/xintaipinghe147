import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlogCard from "@/components/BlogCard";
import { getBlogPosts } from "@/lib/data";
import { SITE } from "@/lib/constants";
import { postCategory } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  return { title: decodeURIComponent(category) };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const name = decodeURIComponent(category);
  if (!([...SITE.categories, SITE.defaultCategory] as string[]).includes(name))
    notFound();
  const posts = (await getBlogPosts(500)).filter((p) => postCategory(p) === name);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-display text-4xl text-ink">{name}</h1>
        <p className="text-ink-soft">分类「{name}」，共 {posts.length} 篇。</p>
        <div className="flex flex-wrap gap-2">
          {SITE.categories.map((c) => (
            <Link
              key={c}
              href={`/category/${encodeURIComponent(c)}`}
              className={`chip ${c === name ? "chip-active" : ""}`}
            >
              {c}
            </Link>
          ))}
          <Link href="/blog" className="chip">
            全部文章
          </Link>
        </div>
      </header>

      {posts.length === 0 ? (
        <div className="note-card px-6 py-16 text-center text-ink-soft">
          这个分类还没有文章。
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
