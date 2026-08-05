import Link from "next/link";
import HomeMap from "@/components/HomeMap";
import PostBrowser from "@/components/PostBrowser";
import { getPublishedPosts } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { formatDate, postDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [posts, user] = await Promise.all([getPublishedPosts(50), getSessionUser()]);

  const points = posts
    .filter(
      (p): p is (typeof posts)[number] & { lat: number; lng: number } =>
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

  const canPost = user?.role === "admin" || user?.role === "member";

  return (
    <div className="space-y-10">
      <section className="py-10 text-center sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">
          我的旅行手账
        </p>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
          把走过的路，写成一册手账
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
          写下今天的故事，点亮去过的每一个地方。
          注册后，你也可以把每一天的经历写进这本手账。
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {canPost ? (
            <Link href="/new" className="btn-primary">
              写一篇日记
            </Link>
          ) : (
            <Link href="/signup" className="btn-primary">
              注册，开始记录
            </Link>
          )}
          <Link href="#latest" className="btn-ghost">
            浏览最新动态
          </Link>
        </div>
      </section>

      <section id="latest" className="scroll-mt-20 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            最新动态
          </h2>
          <Link href="/timeline" className="nav-link text-sm">
            查看时间线 →
          </Link>
        </div>
        <PostBrowser posts={posts} />
      </section>

      <section className="space-y-6">
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
    </div>
  );
}
