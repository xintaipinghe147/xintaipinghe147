import Link from "next/link";
import { ArrowRight, Images, NotePencil } from "@phosphor-icons/react/dist/ssr";
import BlogCard from "@/components/BlogCard";
import SectionHeading from "@/components/SectionHeading";
import ShuoshuoFeed from "@/components/ShuoshuoFeed";
import { getBlogPosts, getShuoshuo } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { SITE } from "@/lib/constants";
import { formatDateShort, postDate, postSummary, readingMinutes } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [posts, shuoshuo, user] = await Promise.all([
    getBlogPosts(30),
    getShuoshuo(4),
    getSessionUser(),
  ]);
  const canWrite = user?.role === "admin" || user?.role === "member";
  const currentUser = user
    ? { id: user.id, username: user.username, role: user.role }
    : null;
  const featured = posts[0] ?? null;
  const rest = posts.slice(1, 13);
  const photos = posts
    .flatMap((p) =>
      p.image_urls.slice(0, 3).map((url, i) => ({
        url,
        id: p.id,
        title: p.title,
        key: `${p.id}-${i}`,
      }))
    )
    .slice(0, 6);

  return (
    <div className="space-y-16">
      {/* 大封面横幅 */}
      <section className="hero-enter relative overflow-hidden rounded-[28px] border border-line shadow-[0_18px_50px_rgba(90,72,52,0.14)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/blog-hero.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-paper/95 via-paper/75 to-paper/25" />
        <div className="relative z-10 min-h-[380px] max-w-2xl px-7 py-16 sm:px-10 sm:py-20">
          <h1 className="font-display text-5xl leading-tight tracking-tight text-ink sm:text-6xl">
            {SITE.name}
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-ink">
            {SITE.tagline}。
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/blog" className="btn-primary">
              开始阅读
              <ArrowRight size={16} weight="bold" />
            </Link>
            <Link href="/about" className="btn-ghost">
              关于我
            </Link>
          </div>
        </div>
      </section>

      {/* 分类快捷入口 */}
      <section>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/blog" className="chip chip-active">
            全部文章
          </Link>
          {SITE.categories.map((c) => (
            <Link key={c} href={`/category/${encodeURIComponent(c)}`} className="chip">
              {c}
            </Link>
          ))}
          <Link href="/archive" className="chip">
            按年月归档
          </Link>
        </div>
      </section>

      {/* 最新文章：置顶 + 瀑布流 */}
      <section>
        <SectionHeading title="最新文章" href="/blog" hrefLabel="查看全部" />
        {featured ? (
          <Link
            href={`/posts/${featured.id}`}
            className="note-card group mb-6 grid overflow-hidden transition-transform duration-200 hover:-translate-y-1 md:grid-cols-2"
          >
            <div className="relative aspect-[16/9] overflow-hidden md:aspect-auto md:h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featured.image_urls[0] ?? "/blog-hero.jpg"}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <span className="absolute left-4 top-4 rounded-full bg-paper/90 px-3 py-1 text-xs font-bold text-accent">
                最新
              </span>
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8">
              <div className="flex items-center gap-2 text-xs text-ink-soft">
                <span className="rounded-full bg-accent-soft px-2.5 py-0.5 font-bold text-accent">
                  {featured.category}
                </span>
                <span>{formatDateShort(postDate(featured))}</span>
                <span aria-hidden>·</span>
                <span>{readingMinutes(featured.content)} 分钟</span>
              </div>
              <h2 className="font-display mt-4 text-2xl leading-snug text-ink transition-colors group-hover:text-accent sm:text-3xl">
                {featured.title}
              </h2>
              <p className="mt-3 line-clamp-3 leading-relaxed text-ink-soft">
                {postSummary(featured, 110)}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-accent">
                继续阅读
                <ArrowRight
                  size={15}
                  weight="bold"
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            </div>
          </Link>
        ) : (
          <div className="note-card px-6 py-14 text-center text-ink-soft">
            还没有文章，来写下第一篇吧。
          </div>
        )}

        {rest.length > 0 ? (
          <div className="masonry">
            {rest.map((post, i) => (
              <div key={post.id} className="masonry-item">
                <BlogCard post={post} index={i} />
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {/* 碎碎念 */}
      <section>
        <SectionHeading title="碎碎念" href="/shuoshuo" hrefLabel="全部碎碎念" />
        <ShuoshuoFeed currentUser={currentUser} />
      </section>

      {/* 相册预览 */}
      <section>
        <SectionHeading title="相册" href="/album" hrefLabel="去相册" />
        {photos.length === 0 ? (
          <div className="note-card px-6 py-12 text-center text-ink-soft">
            相册还空着，写文章时带上照片，它们会出现在这里。
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((ph) => (
              <Link
                key={ph.key}
                href={`/posts/${ph.id}`}
                className="group relative block aspect-square overflow-hidden rounded-2xl border border-line bg-paper-deep"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ph.url}
                  alt={ph.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 底部引导 */}
      <section className="note-card relative overflow-hidden p-8 text-center sm:p-12">
        <div className="pin" aria-hidden />
        <Images size={26} weight="duotone" className="mx-auto text-accent" />
        <h2 className="font-display mt-3 text-2xl text-ink">
          {canWrite ? "今天想写点什么？" : "想在这里写点什么吗？"}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
          {canWrite
            ? "随笔、读书笔记、碎碎念，写下来就是自己的小历史。"
            : "申请一个账号，获得批准后就可以把日子写下来。"}
        </p>
        <Link
          href={canWrite ? "/new" : "/signup"}
          className="btn-primary mt-6"
        >
          <NotePencil size={16} weight="fill" />
          {canWrite ? "写文章" : "申请加入"}
        </Link>
      </section>
    </div>
  );
}
