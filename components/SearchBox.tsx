"use client";

import { useMemo, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import BlogCard from "@/components/BlogCard";
import type { Post } from "@/lib/types";

export default function SearchBox({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return posts.filter((p) =>
      `${p.title} ${p.content} ${p.summary ?? ""} ${p.tags.join(" ")} ${
        p.category ?? ""
      }`
        .toLowerCase()
        .includes(q)
    );
  }, [posts, query]);

  return (
    <div className="space-y-6">
      <div className="relative">
        <MagnifyingGlass
          size={18}
          weight="duotone"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
        />
        <input
          className="field py-3 pl-11"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索标题、正文、标签…"
          maxLength={40}
          autoFocus
        />
      </div>

      {query.trim() ? (
        <p className="text-sm text-ink-soft">
          找到 {filtered.length} 篇与「{query.trim()}」相关的文章。
        </p>
      ) : null}

      {query.trim() && filtered.length === 0 ? (
        <div className="note-card px-6 py-14 text-center text-ink-soft">
          没有找到相关文章，换个词试试。
        </div>
      ) : null}

      {filtered.length > 0 ? (
        <div className="masonry">
          {filtered.map((post, i) => (
            <div key={post.id} className="masonry-item">
              <BlogCard post={post} index={i} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
