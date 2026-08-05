import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPosts } from "@/lib/data";
import { formatDateShort, postDate, postSummary } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "时间轴",
};

export default async function TimelinePage() {
  const posts = await getBlogPosts(1000);
  const sorted = posts.slice().sort((a, b) =>
    postDate(b).localeCompare(postDate(a))
  );

  let lastYear = "";

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-display text-4xl text-ink">时间轴</h1>
        <p className="text-ink-soft">沿着时间往回走，看看来时的路。</p>
      </header>

      {sorted.length === 0 ? (
        <div className="note-card px-6 py-16 text-center text-ink-soft">
          时间轴还空着，写下第一篇后会出现在这里。
        </div>
      ) : (
        <div className="relative ml-2 border-l border-line-strong pl-6 sm:ml-4 sm:pl-10">
          {sorted.map((post) => {
            const year = postDate(post).slice(0, 4);
            const showYear = year !== lastYear;
            lastYear = year;
            return (
              <div key={post.id} className="relative pb-8">
                <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-accent bg-paper sm:-left-[47px]" />
                {showYear ? (
                  <p className="font-display mb-3 text-2xl text-accent">{year}</p>
                ) : null}
                <Link
                  href={`/posts/${post.id}`}
                  className="note-card group block p-5 transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs text-ink-soft">
                    <span>{formatDateShort(postDate(post))}</span>
                    <span aria-hidden>·</span>
                    <span className="rounded-full bg-accent-soft px-2.5 py-0.5 font-bold text-accent">
                      {post.category}
                    </span>
                  </div>
                  <h2 className="font-display mt-2 text-xl text-ink transition-colors group-hover:text-accent">
                    {post.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">
                    {postSummary(post, 80)}
                  </p>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
