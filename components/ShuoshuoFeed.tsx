"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PaperPlaneTilt } from "@phosphor-icons/react";
import type { Shuoshuo } from "@/lib/types";

type Props = {
  currentUser: { id: string; username: string; role: string } | null;
};

export default function ShuoshuoFeed({ currentUser }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<Shuoshuo[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    fetch("/api/shuoshuo")
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
      const res = await fetch("/api/shuoshuo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error ?? "发布失败，请稍后再试");
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
    <div className="space-y-4">
      {currentUser ? (
        <div className="note-card flex gap-2 p-4">
          <input
            className="field flex-1"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={200}
            placeholder="此刻在想什么，随手记一句吧"
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
            {sending ? "发送中" : "记一句"}
          </button>
        </div>
      ) : (
        <div className="note-card p-4 text-sm text-ink-soft">
          登录后也可以在这里随手记一句。
        </div>
      )}
      {error ? <p className="text-sm text-accent">{error}</p> : null}

      <div className="space-y-3">
        {status === "loading" ? (
          <p className="text-sm text-ink-soft">加载中...</p>
        ) : null}
        {status === "error" ? (
          <div className="note-card p-6 text-center text-sm text-ink-soft">
            碎碎念板块正在准备中，稍后再来看看。
          </div>
        ) : null}
        {items.length === 0 && status === "ok" ? (
          <div className="note-card p-8 text-center text-sm text-ink-soft">
            还没有碎碎念，来记下第一句吧。
          </div>
        ) : null}
        {items.map((s) => (
          <div key={s.id} className="note-card flex gap-3 p-4">
            <PaperPlaneTilt
              size={20}
              weight="duotone"
              className="mt-1 shrink-0 text-accent"
            />
            <div className="min-w-0">
              <p className="whitespace-pre-line leading-relaxed">{s.content}</p>
              <p className="mt-2 text-xs text-ink-soft">
                {s.author_username} ·{" "}
                {new Date(s.created_at).toLocaleString("zh-CN", {
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
