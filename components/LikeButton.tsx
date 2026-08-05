"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart } from "@phosphor-icons/react";

type Props = {
  postId: string;
  initialCount: number;
  initialLiked: boolean;
  signedIn: boolean;
};

export default function LikeButton({
  postId,
  initialCount,
  initialLiked,
  signedIn,
}: Props) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!signedIn) {
      router.push("/login");
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) return;
      const data = await res.json();
      setLiked(data.liked);
      setCount(data.count);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`btn-ghost ${liked ? "border-accent bg-accent-soft/50 text-accent" : ""}`}
      aria-pressed={liked}
    >
      <Heart size={17} weight={liked ? "fill" : "regular"} aria-hidden />
      <span>{liked ? "已喜欢" : "喜欢"}</span>
      <span className="text-sm opacity-80">{count}</span>
    </button>
  );
}
