import type { Metadata } from "next";
import SearchBox from "@/components/SearchBox";
import { getBlogPosts } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "搜索",
};

export default async function SearchPage() {
  const posts = await getBlogPosts(1000);
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-4xl text-ink">搜索</h1>
        <p className="text-ink-soft">在全部 {posts.length} 篇文章里找点什么。</p>
      </header>
      <SearchBox posts={posts} />
    </div>
  );
}
