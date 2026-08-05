import { approveUser, deleteComment, deletePost, revokeUser } from "./actions";
import {
  getAllProfiles,
  getPendingProfiles,
  getPublishedPosts,
  getRecentComments,
} from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    admin: "管理员",
    member: "已批准",
    pending: "待批准",
  };
  const style =
    role === "admin"
      ? "bg-accent/15 text-accent"
      : role === "member"
        ? "bg-paper-deep/80 text-ink"
        : "bg-white/10 text-white/70";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs ${style}`}>
      {map[role] ?? role}
    </span>
  );
}

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return (
      <div className="note-card mx-auto max-w-md p-8 text-center">
        <div className="pin" aria-hidden />
        <h1 className="text-xl font-bold">无权访问</h1>
        <p className="mt-3 text-ink-soft">只有站长可以进入管理页面。</p>
        <Link href="/" className="btn-ghost mt-5">
          回到首页
        </Link>
      </div>
    );
  }

  const [pending, all, posts, comments] = await Promise.all([
    getPendingProfiles(),
    getAllProfiles(),
    getPublishedPosts(200),
    getRecentComments(100),
  ]);

  return (
    <div className="space-y-8">
      <div className="note-card relative p-6">
        <div className="tape" aria-hidden />
        <h1 className="text-2xl font-bold">⚙ 站长管理台</h1>
        <p className="mt-2 text-sm text-ink-soft">
          这里可以批准新用户、管理日记和留言。
        </p>
      </div>

      <section className="note-card p-6">
        <h2 className="mb-3 text-lg font-bold">
          待批准用户（{pending.length}）
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-ink-soft">暂时没有等待批准的用户。</p>
        ) : (
          <ul className="divide-y divide-dashed divide-line">
            {pending.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <div>
                  <span className="font-bold">{p.username}</span>
                  <span className="ml-2 text-sm text-ink-soft">
                    注册于 {formatDateTime(p.created_at)}
                  </span>
                </div>
                <form action={approveUser}>
                  <input type="hidden" name="userId" value={p.id} />
                  <button type="submit" className="btn-primary px-4! py-1.5! text-sm">
                    批准发布
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="note-card p-6">
        <h2 className="mb-3 text-lg font-bold">全部用户（{all.length}）</h2>
        <ul className="divide-y divide-dashed divide-line">
          {all.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 py-3"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold">{p.username}</span>
                <RoleBadge role={p.role} />
              </div>
              {p.role === "member" ? (
                <form action={revokeUser}>
                  <input type="hidden" name="userId" value={p.id} />
                  <button
                    type="submit"
                    className="btn-ghost px-4! py-1! text-xs"
                  >
                    取消发布权
                  </button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="note-card p-6">
        <h2 className="mb-3 text-lg font-bold">日记管理（{posts.length}）</h2>
        <ul className="divide-y divide-dashed divide-line">
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex flex-wrap items-center justify-between gap-2 py-3"
            >
              <div>
                <Link
                  href={`/posts/${post.id}`}
                  className="font-bold hover:text-accent"
                >
                  {post.title}
                </Link>
                <div className="text-sm text-ink-soft">
                  {post.author_username} · {post.location_name} ·{" "}
                  {formatDateTime(post.created_at)} · ❤{post.like_count} · 💬
                  {post.comment_count}
                </div>
              </div>
              <form action={deletePost}>
                <input type="hidden" name="postId" value={post.id} />
                <button
                  type="submit"
                  className="btn-ghost px-4! py-1! text-xs text-accent"
                >
                  删除
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className="note-card p-6">
        <h2 className="mb-3 text-lg font-bold">最近留言（{comments.length}）</h2>
        <ul className="divide-y divide-dashed divide-line">
          {comments.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-2 py-3"
            >
              <div className="min-w-0">
                <div className="text-sm">
                  <span className="font-bold">{c.author_username}</span>
                  <span className="ml-2 text-xs text-ink-soft">
                    {formatDateTime(c.created_at)}
                  </span>
                </div>
                <p className="truncate text-sm text-ink-soft">{c.content}</p>
              </div>
              <form action={deleteComment}>
                <input type="hidden" name="commentId" value={c.id} />
                <button
                  type="submit"
                  className="btn-ghost px-4! py-1! text-xs text-accent"
                >
                  删除
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
