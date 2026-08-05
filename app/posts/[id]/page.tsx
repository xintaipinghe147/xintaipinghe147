import Link from "next/link";
import { notFound } from "next/navigation";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";
import VideoEmbed from "@/components/VideoEmbed";
import DeletePostButton from "@/components/DeletePostButton";
import { getComments, getPost, isPostLiked } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

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

  const liked = user ? await isPostLiked(id, user.id) : false;
  const canManage = user && (user.role === "admin" || user.id === post.author_id);

  return (
    <article className="space-y-6">
      <div className="note-card relative overflow-hidden">
        <div className="tape" aria-hidden />
        <div className="p-6 sm:p-8">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
            <span className="rounded-full bg-paper-deep/70 px-3 py-1">
              📍 {post.location_name}
            </span>
            <span>{formatDate(post.created_at)}</span>
            <span aria-hidden>·</span>
            <span className="font-bold text-accent/80">
              {post.author_username}
            </span>
          </div>
          <h1 className="text-3xl font-bold leading-snug sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            坐标：{post.lat.toFixed(4)}° , {post.lng.toFixed(4)}°
          </p>
        </div>
      </div>

      {post.image_urls.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {post.image_urls.map((url, i) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noreferrer"
              className={`note-card block overflow-hidden p-1.5 transition-transform hover:-translate-y-0.5 ${
                i === 0 && post.image_urls.length === 1 ? "sm:col-span-2" : ""
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`${post.title} 图片 ${i + 1}`}
                className="max-h-[480px] w-full rounded-md object-cover"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      ) : null}

      <div className="note-card relative p-6 sm:p-8">
        <div className="pin" aria-hidden />
        <div className="whitespace-pre-line text-[17px] leading-[2]">
          {post.content}
        </div>
      </div>

      {post.video_url ? (
        <div className="note-card p-5">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
            <span aria-hidden>🎬</span> 影像记录
          </h2>
          <VideoEmbed url={post.video_url} />
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
          <DeletePostButton postId={post.id} />
        ) : null}
        <Link href="/" className="btn-ghost">
          ← 回到足迹地图
        </Link>
      </div>

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
