"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChatCircleDots } from "@phosphor-icons/react";
import type { Comment } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

type Props = {
  postId: string;
  initialComments: Comment[];
  currentUser: { id: string; username: string; role: string } | null;
};

export default function CommentSection({
  postId,
  initialComments,
  currentUser,
}: Props) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function submit() {
    if (!currentUser) {
      router.push("/login");
      return;
    }
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => [...prev, data.comment]);
        setText("");
      }
    } finally {
      setSending(false);
    }
  }

  async function remove(commentId: string) {
    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  }

  return (
    <section className="note-card relative mt-8 p-6">
      <div className="tape" aria-hidden />
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
        <ChatCircleDots size={18} weight="duotone" className="text-accent" /> 留言（{comments.length}）
      </h2>

      <div className="mb-5">
        {currentUser ? (
          <div className="flex gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="写下你的感受…"
              rows={3}
              className="field flex-1 resize-none"
              maxLength={1000}
            />
            <button
              type="button"
              onClick={submit}
              disabled={sending || !text.trim()}
              className="btn-primary self-end"
            >
              发送
            </button>
          </div>
        ) : (
          <p className="text-sm text-ink-soft">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-accent underline underline-offset-4"
            >
              登录
            </button>{" "}
            后可以留言和点赞
          </p>
        )}
      </div>

      {comments.length === 0 ? (
        <p className="py-4 text-center text-sm text-ink-soft">
          还没有留言，来抢个沙发～
        </p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => {
            const canDelete =
              currentUser?.role === "admin" || currentUser?.id === c.author_id;
            return (
              <li
                key={c.id}
                className="border-b border-dashed border-line pb-3 last:border-0"
              >
                <div className="mb-1 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-accent/80">
                      {c.author_username}
                    </span>
                    <span className="text-xs text-ink-soft/70">
                      {formatDateTime(c.created_at)}
                    </span>
                  </div>
                  {canDelete ? (
                    <button
                      type="button"
                      onClick={() => remove(c.id)}
                      className="text-xs text-ink-soft/60 hover:text-accent"
                    >
                      删除
                    </button>
                  ) : null}
                </div>
                <p className="whitespace-pre-line leading-relaxed">{c.content}</p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
