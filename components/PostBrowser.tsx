"use client";

import { useMemo, useState } from "react";
import PostCard from "@/components/PostCard";
import type { Post } from "@/lib/types";

export default function PostBrowser({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) =>
      `${p.title} ${p.location_name} ${p.content} ${p.author_username}`
        .toLowerCase()
        .includes(q)
    );
  }, [posts, query]);

  return (
    <div className="space-y-5">
      <input
        className="field"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="🔍 搜索标题、地点、作者…"
        maxLength={40}
      />
      {filtered.length === 0 ? (
        <div className="note-card px-6 py-12 text-center text-ink-soft">
          {query.trim()
            ? "没有找到相关的游记，换个词试试？"
            : "还没有游记。等第一段旅程被写下来，这里就会亮起来。"}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
