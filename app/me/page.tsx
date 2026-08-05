import Link from "next/link";
import { redirect } from "next/navigation";
import PostCard from "@/components/PostCard";
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
        ? "已批准 · 可以发布游记"
        : "待批准 · 暂时不能发布游记";

  return (
    <div className="space-y-8">
      <div className="note-card relative p-6 sm:p-8">
        <div className="tape" aria-hidden />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{user.username}</h1>
            <p className="mt-1 text-sm text-ink-soft">{user.email}</p>
            <p className="mt-2">
              <span
                className={`rounded-full px-3 py-1 text-xs ${
                  user.role === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-paper-deep/80 text-ink"
                }`}
              >
                {roleText}
              </span>
            </p>
          </div>
          {user.role === "member" || user.role === "admin" ? (
            <Link href="/new" className="btn-primary">
              写一篇游记
            </Link>
          ) : null}
        </div>
        <p className="mt-4 text-xs text-ink-soft">
          加入于 {formatDateTime(user.created_at)}
        </p>
      </div>

      <section className="space-y-5">
        <h2 className="text-xl font-bold">我的游记（{posts.length}）</h2>
        {posts.length === 0 ? (
          <div className="note-card px-6 py-10 text-center text-ink-soft">
            {user.role === "pending"
              ? "等站长批准后，你的第一段旅程就可以写下来了。"
              : "还没有游记，去写第一篇吧。"}
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
