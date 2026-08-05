import Link from "next/link";
import { redirect } from "next/navigation";
import PostCard from "@/components/PostCard";
import MeForm from "@/components/MeForm";
import { getPostsByAuthor } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const posts = await getPostsByAuthor(user.id, true);
  const roleText =
    user.role === "admin"
      ? "站长"
      : user.role === "member"
        ? "已批准 · 可以写手账"
        : "待批准 · 暂时不能写手账";
  const totalLikes = posts.reduce((sum, p) => sum + p.like_count, 0);
  const spotCount = new Set(
    posts
      .filter(
        (p): p is (typeof posts)[number] & { lat: number; lng: number } =>
          p.lat !== null && p.lng !== null
      )
      .map((p) => `${p.lat.toFixed(3)},${p.lng.toFixed(3)}`)
  ).size;

  return (
    <div className="space-y-8">
      <div className="note-card relative p-6 sm:p-8">
        <div className="tape" aria-hidden />
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-line bg-paper-deep/60 text-3xl">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar_url}
                alt="头像"
                className="h-full w-full object-cover"
              />
            ) : (
              <span aria-hidden>👤</span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{user.username}</h1>
            <p className="mt-1 text-sm text-ink-soft">{user.email}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs ${
                user.role === "pending"
                  ? "bg-paper-deep/80 text-ink-soft"
                  : "bg-paper-deep/80 text-ink"
              }`}
            >
              {roleText}
            </span>
            {user.role === "member" || user.role === "admin" ? (
              <Link href="/new" className="btn-primary py-1.5! text-sm">
                写一篇手账
              </Link>
            ) : null}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <span className="rounded-lg bg-paper-deep/60 px-3 py-1.5">
            {posts.length} 篇手账
          </span>
          <span className="rounded-lg bg-paper-deep/60 px-3 py-1.5">
            收到 {totalLikes} 个喜欢
          </span>
          <span className="rounded-lg bg-paper-deep/60 px-3 py-1.5">
            到过 {spotCount} 个地方
          </span>
          <span className="ml-auto self-center text-xs text-ink-soft">
            加入于 {formatDateTime(user.created_at)}
          </span>
        </div>
      </div>

      <MeForm
        userId={user.id}
        initialUsername={user.username}
        initialBio={user.bio ?? ""}
        initialAvatarUrl={user.avatar_url}
      />

      <section className="space-y-5">
        <h2 className="font-display text-xl font-bold">我的手账（{posts.length}）</h2>
        {posts.length === 0 ? (
          <div className="note-card px-6 py-10 text-center text-ink-soft">
            {user.role === "pending"
              ? "等站长批准后，就可以和大家一起写手账了。"
              : "还没有手账，去写第一篇吧。"}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
