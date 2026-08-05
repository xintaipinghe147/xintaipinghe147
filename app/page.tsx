import Link from "next/link";
import PostBrowser from "@/components/PostBrowser";
import CheckinBoard from "@/components/CheckinBoard";
import MessageBoard from "@/components/MessageBoard";
import Reveal from "@/components/Reveal";
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
    <div className="space-y-16">
      {/* 顶部 Hero：左文右图的分栏布局 */}
      <section className="hero-enter grid items-center gap-10 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-14">
        <div className="relative">
          <StickerFlower className="absolute -left-3 -top-8 h-12 w-12 opacity-80" />
          <StickerCloud className="absolute right-2 -top-10 h-12 w-14 opacity-70" />
          <h1 className="font-display text-5xl font-bold leading-tight tracking-tight text-ink sm:text-6xl">
            友达手账
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-soft">
            把每一天的小日子，和朋友们一起写进这本手账。
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            {canPost ? (
              <Link href="/new" className="btn-primary">
                写一篇手账
              </Link>
            ) : (
              <Link href="/signup" className="btn-primary">
                加入我们
              </Link>
            )}
            <Link href="/timeline" className="btn-ghost">
              翻看手账本
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap gap-2 text-sm text-ink-soft">
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
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          {photos.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 -rotate-1">
              {photos.slice(0, 4).map((ph, i) => (
                <Link
                  key={ph.key}
                  href={`/posts/${ph.id}`}
                  className={`block overflow-hidden rounded-2xl border border-line bg-paper-deep shadow-[0_12px_30px_rgba(170,140,110,0.16)] transition-transform hover:-translate-y-1 ${
                    i % 2 === 0 ? "translate-y-2" : ""
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ph.url}
                    alt={ph.title}
                    className="aspect-[4/3] w-full object-cover"
                  />
                </Link>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-line shadow-[0_12px_30px_rgba(170,140,110,0.16)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero-poster.jpg"
                alt="友达手账"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          )}
          <StickerStar className="absolute -right-3 -top-4 h-10 w-10" />
          <StickerHeart className="absolute -bottom-4 left-8 h-11 w-11" />
        </div>
      </section>

      {/* 日常打卡 */}
      <section id="checkin" className="scroll-mt-24">
        <Reveal>
          <h2 className="font-display mb-4 flex items-center gap-2 text-2xl font-bold">
            <StickerFlower className="h-7 w-7" />
            日常打卡
          </h2>
          <CheckinBoard currentUser={currentUser} />
        </Reveal>
      </section>

      {/* 好友相册 */}
      <section id="albums" className="scroll-mt-24">
        <Reveal delay={60}>
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
        </Reveal>
      </section>

      {/* 留言板 */}
      <section id="board" className="scroll-mt-24">
        <Reveal delay={60}>
          <h2 className="font-display mb-4 flex items-center gap-2 text-2xl font-bold">
            <StickerHeart className="h-7 w-7" />
            留言板
          </h2>
          <MessageBoard currentUser={currentUser} />
        </Reveal>
      </section>

      {/* 最新手账 */}
      <section className="space-y-4">
        <Reveal delay={60}>
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
        </Reveal>
      </section>
    </div>
  );
}
