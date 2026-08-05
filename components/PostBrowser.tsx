"use client";

import { useMemo, useState } from "react";
import PostCard from "@/components/PostCard";
import type { Post } from "@/lib/types";

export default function PostBrowser({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.tags?.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      const matchQ =
        !q ||
        `${p.title} ${p.location_name} ${p.content} ${p.author_username}`
          .toLowerCase()
          .includes(q);
      const matchTag = !activeTag || (p.tags ?? []).includes(activeTag);
      return matchQ && matchTag;
    });
  }, [posts, query, activeTag]);

  return (
    <div className="space-y-5">
      <input
        className="field"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="🔍 搜索标题、地点、作者…"
        maxLength={40}
      />
      {allTags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            className={`rounded-full px-3.5 py-1 text-sm ${
              activeTag === null
                ? "bg-accent text-white"
                : "border border-line-strong text-ink-soft"
            }`}
          >
            全部
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`rounded-full px-3.5 py-1 text-sm ${
                activeTag === tag
                  ? "bg-accent text-white"
                  : "border border-line-strong text-ink-soft"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      ) : null}
      {filtered.length === 0 ? (
        <div className="note-card px-6 py-12 text-center text-ink-soft">
          {query.trim()
            ? "没有找到相关的日记，换个词试试？"
            : "还没有日记。等第一段旅程被写下来，这里就会亮起来。"}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((post, i) => (
            <PostCard
              key={post.id}
              post={post}
              index={i}
              featured={i === 0 && !query.trim() && !activeTag}
            />
          ))}
        </div>
      )}
    </div>
  );
}
