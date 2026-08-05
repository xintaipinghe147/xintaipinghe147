import Link from "next/link";
import type { Post } from "@/lib/types";
import { excerpt, formatDate } from "@/lib/utils";

export default function PostCard({ post, index }: { post: Post; index: number }) {
  const rotate = index % 3 === 0 ? "rotate-[0.4deg]" : index % 3 === 1 ? "-rotate-[0.5deg]" : "";
  const cover = post.image_urls[0];

  return (
    <Link
      href={`/posts/${post.id}`}
      className={`note-card group block overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg ${rotate}`}
    >
      <div className="tape" aria-hidden />
      <div className="flex flex-col sm:flex-row">
        {cover ? (
          <div className="relative h-40 w-full overflow-hidden sm:h-auto sm:w-52 sm:shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="flex h-40 w-full items-center justify-center bg-paper-deep/60 text-4xl sm:h-auto sm:w-52 sm:shrink-0">
            <span aria-hidden>📍</span>
          </div>
        )}
        <div className="flex-1 p-5">
          <div className="mb-1 flex items-center gap-2 text-sm text-ink-soft">
            <span>📍 {post.location_name}</span>
            <span aria-hidden>·</span>
            <span>{formatDate(post.created_at)}</span>
          </div>
          <h2 className="mb-2 text-xl font-bold leading-snug group-hover:text-accent">
            {post.title}
          </h2>
          <p className="mb-3 line-clamp-2 text-[15px] leading-relaxed text-ink-soft">
            {excerpt(post.content, 110)}
          </p>
          <div className="flex items-center gap-4 text-sm text-ink-soft/80">
            <span className="font-bold text-accent/80">{post.author_username}</span>
            <span>❤ {post.like_count}</span>
            <span>💬 {post.comment_count}</span>
            <span className="ml-auto hidden text-accent sm:inline">
              翻开看看 →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
