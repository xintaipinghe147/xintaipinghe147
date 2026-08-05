"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Checkin = {
  id: string;
  user_id: string;
  note: string;
  date: string;
  created_at: string;
  profiles: { username: string } | null;
};

type Props = {
  currentUser: { id: string; username: string; role: string } | null;
};

export default function CheckinBoard({ currentUser }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<Checkin[]>([]);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(now.getDate()).padStart(2, "0")}`;
    fetch(`/api/checkins?date=${dateStr}`)
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
    const text = note.trim();
    if (!text || sending) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: text }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error ?? "打卡失败，请稍后再试");
        return;
      }
      setItems((prev) => [
        d.item,
        ...prev.filter((i) => i.user_id !== currentUser.id),
      ]);
      setNote("");
      router.refresh();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="note-card relative p-6">
      <div className="tape" aria-hidden />
      <h2 className="text-xl font-bold">今天也在吗 🌸</h2>
      <p className="mt-1 text-sm text-ink-soft">
        写下此刻的一句小事，和朋友们一起打卡
      </p>
      {currentUser ? (
        <div className="mt-4 flex gap-2">
          <input
            className="field flex-1"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={80}
            placeholder="比如：今天和朋友吃了好吃的"
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
          />
          <button
            type="button"
            onClick={submit}
            disabled={sending || !note.trim()}
            className="btn-primary shrink-0"
          >
            {sending ? "打卡中…" : "打卡"}
          </button>
        </div>
      ) : (
        <p className="mt-4 text-sm text-ink-soft">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-accent underline underline-offset-4"
          >
            登录
          </button>{" "}
          后就可以一起打卡
        </p>
      )}
      {error ? <p className="mt-2 text-sm text-accent">{error}</p> : null}
      <div className="mt-5 space-y-3">
        {status === "loading" ? (
          <p className="text-sm text-ink-soft">加载中…</p>
        ) : null}
        {status === "error" ? (
          <p className="text-sm text-ink-soft">
            打卡板块正在准备中，稍后再来看看～
          </p>
        ) : null}
        {items.length === 0 && status === "ok" ? (
          <p className="text-sm text-ink-soft">今天还没有人打卡，来当第一个吧！</p>
        ) : null}
        {items.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl bg-paper-deep/70 px-4 py-3"
          >
            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold">{c.profiles?.username ?? "朋友"}</span>
              <span className="text-xs text-ink-soft">
                {c.created_at
                  ? new Date(c.created_at).toLocaleTimeString("zh-CN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </span>
            </div>
            {c.note ? (
              <p className="mt-1 leading-relaxed">{c.note}</p>
            ) : (
              <p className="mt-1 text-sm text-ink-soft">今天打卡 ✓</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
