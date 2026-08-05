import Link from "next/link";
import { getPublishedPosts } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const posts = await getPublishedPosts(300);

  const groups = new Map<number, typeof posts>();
  for (const post of posts) {
    const year = new Date(post.created_at).getFullYear();
    const list = groups.get(year) ?? [];
    list.push(post);
    groups.set(year, list);
  }
  const years = Array.from(groups.keys()).sort((a, b) => b - a);

  return (
    <div className="space-y-10">
      <div className="note-card relative p-6 text-center">
        <div className="pin" aria-hidden />
        <h1 className="text-2xl font-bold">我的旅行时间线</h1>
        <p className="mt-2 text-sm text-ink-soft">
          一年一年往回翻，每一段旅程都有位置
        </p>
      </div>

      {years.length === 0 ? (
        <div className="note-card px-6 py-12 text-center text-ink-soft">
          时间线还是空的，写下第一篇游记后这里就会亮起来。
        </div>
      ) : (
        <div className="relative space-y-10 pl-8 sm:pl-12">
          <div
            className="absolute bottom-4 left-3 top-2 w-px border-l-2 border-dashed border-line sm:left-4"
            aria-hidden
          />
          {years.map((year) => (
            <section key={year} className="relative">
              <div className="absolute -left-8 top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-accent bg-paper sm:-left-12 sm:h-7 sm:w-7">
                <span className="h-2.5 w-2.5 rounded-full bg-accent" />
              </div>
              <h2 className="mb-4 text-2xl font-bold text-accent">{year} 年</h2>
              <div className="space-y-4">
                {groups.get(year)!.map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.id}`}
                    className="note-card group flex items-stretch gap-4 overflow-hidden transition-transform hover:-translate-y-0.5"
                  >
                    {post.image_urls[0] ? (
                      <div className="hidden w-28 shrink-0 overflow-hidden sm:block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.image_urls[0]}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ) : null}
                    <div className="flex-1 py-4 pr-4">
                      <div className="mb-1 text-sm text-ink-soft">
                        {formatDate(post.created_at)} · 📍 {post.location_name}
                      </div>
                      <h3 className="font-bold group-hover:text-accent">
                        {post.title}
                      </h3>
                      {post.tags.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-paper-deep/70 px-2 py-0.5 text-xs text-ink-soft"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
