import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Tag, ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";
import VideoEmbed from "@/components/VideoEmbed";
import DeletePostButton from "@/components/DeletePostButton";
import MarkdownView from "@/components/MarkdownView";
import TocNav from "@/components/TocNav";
import PrevNext from "@/components/PrevNext";
import ReadingStats from "@/components/ReadingStats";
import {
  getComments,
  getPost,
  getPrevNext,
  isPostLiked,
} from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import {
  extractHeadings,
  formatDateShort,
  postDate,
  readingMinutes,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  return {
    title: post?.title ?? "文章",
    description: post?.summary ?? undefined,
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, user, comments] = await Promise.all([
    getPost(id),
    getSessionUser(),
    getComments(id),
  ]);
  if (!post) notFound();

  const [liked, neighbors] = await Promise.all([
    user ? isPostLiked(id, user.id) : Promise.resolve(false),
    getPrevNext(post),
  ]);
  const canManage =
    user && (user.role === "admin" || user.id === post.author_id);
  const headings = extractHeadings(post.content);
  const cover = post.image_urls[0];

  return (
    <article className="space-y-8">
      {/* 返回 */}
      <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-accent">
        <ArrowLeft size={15} weight="bold" />
        返回文章列表
      </Link>

      {/* 头部：封面 + 标题 */}
      <header className="note-card relative overflow-hidden">
        {cover ? (
          <div className="relative aspect-[21/9] w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/40 to-transparent" />
          </div>
        ) : null}
        <div className="p-6 sm:p-9">
          <div className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
            <span className="rounded-full bg-accent-soft px-3 py-1 font-bold text-accent">
              {post.category}
            </span>
            <span>{formatDateShort(postDate(post))}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock size={14} weight="duotone" />
              {readingMinutes(post.content)} 分钟
            </span>
            <span aria-hidden>·</span>
            <ReadingStats postId={post.id} initialViews={post.views} />
          </div>
          <h1 className="font-display mt-4 text-3xl leading-snug text-ink sm:text-4xl">
            {post.title}
          </h1>
          {post.summary ? (
            <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">
              {post.summary}
            </p>
          ) : null}
        </div>
      </header>

      {/* 正文 + 目录 */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_250px]">
        <div className="note-card relative p-6 sm:p-9">
          <div className="pin" aria-hidden />
          <MarkdownView content={post.content} />
        </div>
        <aside className="hidden lg:block">
          <TocNav headings={headings} />
        </aside>
      </div>

      {headings.length >= 2 ? (
        <div className="lg:hidden">
          <TocNav headings={headings} />
        </div>
      ) : null}

      {post.video_url ? (
        <div className="note-card p-5">
          <h2 className="mb-3 text-lg font-bold">影像记录</h2>
          <VideoEmbed url={post.video_url} />
        </div>
      ) : null}

      {post.tags.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <Tag size={16} weight="duotone" className="text-accent" />
          {post.tags.map((tag) => (
            <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`} className="chip">
              #{tag}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <LikeButton
          postId={post.id}
          initialCount={post.like_count}
          initialLiked={liked}
          signedIn={!!user}
        />
        {canManage ? (
          <>
            <Link
              href={`/posts/${post.id}/edit`}
              className="btn-ghost text-sm"
            >
              编辑
            </Link>
            <DeletePostButton postId={post.id} />
          </>
        ) : null}
      </div>

      <PrevNext prev={neighbors.prev} next={neighbors.next} />

      <CommentSection
        postId={post.id}
        initialComments={comments}
        currentUser={
          user ? { id: user.id, username: user.username, role: user.role } : null
        }
      />
    </article>
  );
}
