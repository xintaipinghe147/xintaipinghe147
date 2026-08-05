"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handle() {
    if (!confirm("确定要删除这篇日记吗？删除后无法恢复。")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        alert("删除失败，请稍后再试");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={busy}
      className="btn-ghost border-accent/50 text-sm text-accent"
    >
      删除这篇日记
    </button>
  );
}
