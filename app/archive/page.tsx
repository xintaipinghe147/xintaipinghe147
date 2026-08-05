import type { Metadata } from "next";
import Link from "next/link";
import { CalendarBlank } from "@phosphor-icons/react/dist/ssr";
import { getBlogPosts } from "@/lib/data";
import { formatDateShort, postDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "时间归档",
};

export default async function ArchivePage() {
  const posts = await getBlogPosts(1000);
  const grouped = new Map<string, typeof posts>();
  for (const post of posts) {
    const ym = postDate(post).slice(0, 7);
    const list = grouped.get(ym) ?? [];
    list.push(post);
    grouped.set(ym, list);
  }
  const months = Array.from(grouped.entries()).sort((a, b) =>
    b[0].localeCompare(a[0])
  );

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="font-display text-4xl text-ink">时间归档</h1>
        <p className="text-ink-soft">
          按年月翻看旧文章，共 {posts.length} 篇。
        </p>
      </header>

      {months.length === 0 ? (
        <div className="note-card px-6 py-16 text-center text-ink-soft">
          还没有文章可以归档。
        </div>
      ) : (
        <div className="space-y-10">
          {months.map(([ym, list]) => {
            const [year, month] = ym.split("-");
            return (
              <section key={ym}>
                <h2 className="font-display mb-4 flex items-center gap-2 text-2xl text-ink">
                  <CalendarBlank
                    size={20}
                    weight="duotone"
                    className="text-accent"
                  />
                  {year}年{month}月
                </h2>
                <div className="note-card divide-y divide-line overflow-hidden">
                  {list.map((post) => (
                    <Link
                      key={post.id}
                      href={`/posts/${post.id}`}
                      className="group flex items-baseline gap-4 px-5 py-3.5 transition-colors hover:bg-accent-soft"
                    >
                      <span className="w-16 shrink-0 text-sm text-ink-soft">
                        {formatDateShort(postDate(post))}
                      </span>
                      <span className="font-bold text-ink transition-colors group-hover:text-accent">
                        {post.title}
                      </span>
                      <span className="ml-auto hidden shrink-0 text-xs text-ink-soft sm:inline">
                        {post.category}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
