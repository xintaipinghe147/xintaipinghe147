import Link from "next/link";
import type { Post } from "@/lib/types";
import { formatDateShort, postDate, postSummary, readingMinutes } from "@/lib/utils";

export default function BlogCard({
  post,
  index,
}: {
  post: Post;
  index: number;
}) {
  const cover = post.image_urls[0];
  // 瀑布流里用不同纵横比制造错落感
  const ratios = ["aspect-[4/3]", "aspect-[4/5]", "aspect-square"];
  const ratio = ratios[index % ratios.length];

  return (
    <Link
      href={`/posts/${post.id}`}
      className="note-card group block overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(90,72,52,0.14)]"
    >
      {cover ? (
        <div className={`w-full overflow-hidden ${ratio}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </div>
      ) : (
        <div
          className={`flex w-full items-center justify-center bg-paper-deep/70 ${ratio}`}
        >
          <span className="font-display text-2xl text-ink-soft/60">
            {post.title.slice(0, 2) || "拾光"}
          </span>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-center gap-2 text-xs text-ink-soft">
          <span className="rounded-full bg-accent-soft px-2.5 py-0.5 font-bold text-accent">
            {post.category}
          </span>
          <span>{formatDateShort(postDate(post))}</span>
          <span aria-hidden>·</span>
          <span>{readingMinutes(post.content)} 分钟</span>
        </div>
        <h2 className="font-display mt-3 text-xl leading-snug text-ink transition-colors group-hover:text-accent">
          {post.title}
        </h2>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft">
          {postSummary(post, 90)}
        </p>
        {post.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-line px-2 py-0.5 text-[11px] text-ink-soft"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
