import Link from "next/link";
import HomeMap from "@/components/HomeMap";
import { getPublishedPosts } from "@/lib/data";
import { formatDate, postDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const posts = await getPublishedPosts(300);

  const groups = new Map<number, typeof posts>();
  for (const post of posts) {
    const year = new Date(postDate(post)).getFullYear();
    const list = groups.get(year) ?? [];
    list.push(post);
    groups.set(year, list);
  }
  const years = Array.from(groups.keys()).sort((a, b) => b - a);
  const points = posts
    .filter(
      (p): p is typeof posts[number] & { lat: number; lng: number } =>
        p.lat !== null && p.lng !== null
    )
    .map((p) => ({
      id: p.id,
      name: p.location_name,
      title: p.title,
      value: [p.lng, p.lat] as [number, number],
      date: formatDate(postDate(p)),
      cover: p.image_urls[0],
      excerpt: p.content,
    }));

  return (
    <div className="space-y-10">
      <section id="map" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            世界足迹
          </h2>
          <p className="text-sm text-ink-soft">
            {points.length > 0
              ? `已点亮 ${points.length} 个地方，点击标记查看日记`
              : "足迹会随着日记慢慢点亮"}
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-line bg-map-bg shadow-sm">
          <HomeMap points={points} />
        </div>
      </section>

      <div className="note-card relative p-6 text-center">
        <div className="pin" aria-hidden />
        <h1 className="font-display text-2xl font-bold">友达手账本</h1>
        <p className="mt-2 text-sm text-ink-soft">
          和朋友们一起，把日子一页页写下来
        </p>
      </div>

      {years.length === 0 ? (
        <div className="note-card px-6 py-12 text-center text-ink-soft">
          时间线还是空的，写下第一篇手账后这里就会亮起来。
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
                        {formatDate(postDate(post))}
                        {post.location_name ? ` · 📍 ${post.location_name}` : ""}
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
