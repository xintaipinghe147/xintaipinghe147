import Link from "next/link";
import HomeMap from "@/components/HomeMap";
import PostBrowser from "@/components/PostBrowser";
import { getPublishedPosts } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [posts, user] = await Promise.all([getPublishedPosts(50), getSessionUser()]);

  const points = posts
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
    .map((p) => ({
      id: p.id,
      name: p.location_name,
      title: p.title,
      value: [p.lng, p.lat] as [number, number],
      date: formatDate(p.created_at),
      cover: p.image_urls[0],
      excerpt: p.content,
    }));

  const canPost = user?.role === "admin" || user?.role === "member";

  return (
    <div className="space-y-10">
      <section className="note-card relative px-6 py-10 text-center sm:px-10">
        <div className="pin" aria-hidden />
        <div className="stamp">旅行手账</div>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
          把走过的路，写成一册手账
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[16px] leading-relaxed text-ink-soft">
          点击地图上的足迹，翻开每一段旅程的故事。也可以注册账号，
          留下你的评论，或者分享你自己的旅行日记。
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {canPost ? (
            <Link href="/new" className="btn-primary">
              写一篇游记
            </Link>
          ) : (
            <Link href="/signup" className="btn-primary">
              注册，加入旅程
            </Link>
          )}
          <Link href="#latest" className="btn-ghost">
            浏览最新游记
          </Link>
        </div>
      </section>

      <section className="note-card p-4 sm:p-6">
        <h2 className="mb-3 flex items-center gap-2 text-xl font-bold">
          <span aria-hidden>🗺</span> 世界足迹
        </h2>
        <p className="mb-3 text-sm text-ink-soft">
          共 {points.length} 个足迹{points.length > 0 ? "，点击标记查看游记" : ""}
        </p>
        <div className="overflow-hidden rounded-lg border border-[rgba(150,128,92,0.35)] bg-[#fdfaf0]">
          <HomeMap points={points} />
        </div>
      </section>

      <section id="latest" className="space-y-5">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <span aria-hidden>✎</span> 最新游记
        </h2>
        <PostBrowser posts={posts} />
      </section>
    </div>
  );
}
