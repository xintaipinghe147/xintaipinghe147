"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Msg = {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
  profiles: { username: string } | null;
};

type Props = {
  currentUser: { id: string; username: string; role: string } | null;
};

export default function MessageBoard({ currentUser }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.items)) {
          setItems(d.items);
          setStatus("ok");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, []);

  async function submit() {
    if (!currentUser) {
      router.push("/login");
      return;
    }
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error ?? "留言失败，请稍后再试");
        return;
      }
      setItems((prev) => [d.item, ...prev]);
      setText("");
      router.refresh();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="note-card relative p-6">
      <div className="tape" aria-hidden />
      {currentUser ? (
        <div className="flex gap-2">
          <input
            className="field flex-1"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={200}
            placeholder="给朋友们留句话吧～"
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
          />
          <button
            type="button"
            onClick={submit}
            disabled={sending || !text.trim()}
            className="btn-primary shrink-0"
          >
            {sending ? "发送中…" : "留言"}
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
          后就可以留言
        </p>
      )}
      {error ? <p className="mt-2 text-sm text-accent">{error}</p> : null}
      <div className="mt-5 space-y-3">
        {status === "loading" ? (
          <p className="text-sm text-ink-soft">加载中…</p>
        ) : null}
        {status === "error" ? (
          <p className="text-sm text-ink-soft">
            留言板正在准备中，稍后再来看看～
          </p>
        ) : null}
        {items.length === 0 && status === "ok" ? (
          <p className="text-sm text-ink-soft">还没有留言，来当第一个吧！</p>
        ) : null}
        {items.map((m) => (
          <div key={m.id} className="rounded-2xl bg-paper-deep/70 px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold text-accent">
                {m.profiles?.username ?? "朋友"}
              </span>
              <span className="text-xs text-ink-soft">
                {new Date(m.created_at).toLocaleString("zh-CN", {
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p className="mt-1 whitespace-pre-line leading-relaxed">{m.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
