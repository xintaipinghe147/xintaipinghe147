import Link from "next/link";
import PostBrowser from "@/components/PostBrowser";
import CheckinBoard from "@/components/CheckinBoard";
import MessageBoard from "@/components/MessageBoard";
import {
  StickerCloud,
  StickerFlower,
  StickerHeart,
  StickerStar,
} from "@/components/Stickers";
import { getPublishedPosts } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [posts, user] = await Promise.all([
    getPublishedPosts(60),
    getSessionUser(),
  ]);
  const canPost = user?.role === "admin" || user?.role === "member";
  const currentUser = user
    ? { id: user.id, username: user.username, role: user.role }
    : null;

  const photos = posts
    .flatMap((p) =>
      p.image_urls.slice(0, 3).map((url, i) => ({
        url,
        id: p.id,
        title: p.title || "友达的手账",
        key: `${p.id}-${i}`,
      }))
    )
    .slice(0, 12);

  return (
    <div className="space-y-12">
      {/* 顶部 Hero */}
      <section className="relative overflow-hidden rounded-[2rem] border border-line bg-white/60 px-6 py-12 text-center shadow-[0_12px_36px_rgba(170,140,110,0.12)] sm:py-16">
        <StickerFlower className="absolute left-5 top-5 h-12 w-12 opacity-80" />
        <StickerStar className="absolute right-8 top-8 h-8 w-8 opacity-80" />
        <StickerCloud className="absolute bottom-6 left-10 h-12 w-14 opacity-70" />
        <StickerHeart className="absolute bottom-8 right-9 h-9 w-9 opacity-80" />
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">
          Tomodachi · Journal
        </p>
        <h1 className="font-display mt-4 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          友达手账
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-ink-soft">
          把每一天的小日子，和朋友们一起写进这本手账。
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {canPost ? (
            <Link href="/new" className="btn-primary">
              写一篇手账 ✍️
            </Link>
          ) : (
            <Link href="/signup" className="btn-primary">
              加入我们 🌸
            </Link>
          )}
          <Link href="/timeline" className="btn-ghost">
            翻看手账本
          </Link>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-ink-soft">
          <a
            href="#checkin"
            className="rounded-full bg-paper-deep/80 px-3.5 py-1.5 transition-colors hover:text-accent"
          >
            日常打卡
          </a>
          <a
            href="#albums"
            className="rounded-full bg-paper-deep/80 px-3.5 py-1.5 transition-colors hover:text-accent"
          >
            好友相册
          </a>
          <a
            href="#board"
            className="rounded-full bg-paper-deep/80 px-3.5 py-1.5 transition-colors hover:text-accent"
          >
            留言板
          </a>
        </div>
      </section>

      {/* 日常打卡 */}
      <section id="checkin" className="scroll-mt-24">
        <h2 className="font-display mb-4 flex items-center gap-2 text-2xl font-bold">
          <StickerFlower className="h-7 w-7" />
          日常打卡
        </h2>
        <CheckinBoard currentUser={currentUser} />
      </section>

      {/* 好友相册 */}
      <section id="albums" className="scroll-mt-24">
        <h2 className="font-display mb-4 flex items-center gap-2 text-2xl font-bold">
          <StickerStar className="h-7 w-7" />
          好友相册
        </h2>
        {photos.length === 0 ? (
          <div className="note-card px-6 py-12 text-center text-ink-soft">
            相册还是空的，和朋友一起写下手账，照片会出现在这里。
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {photos.map((ph) => (
              <Link
                key={ph.key}
                href={`/posts/${ph.id}`}
                className="group relative block aspect-square overflow-hidden rounded-2xl border border-line bg-paper-deep transition-transform hover:-translate-y-0.5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ph.url}
                  alt={ph.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 留言板 */}
      <section id="board" className="scroll-mt-24">
        <h2 className="font-display mb-4 flex items-center gap-2 text-2xl font-bold">
          <StickerHeart className="h-7 w-7" />
          留言板
        </h2>
        <MessageBoard currentUser={currentUser} />
      </section>

      {/* 最新手账 */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-display flex items-center gap-2 text-2xl font-bold">
            <StickerCloud className="h-7 w-7" />
            最新手账
          </h2>
          <Link href="/timeline" className="nav-link text-sm">
            查看全部 →
          </Link>
        </div>
        <PostBrowser posts={posts.slice(0, 6)} />
      </section>
    </div>
  );
}
