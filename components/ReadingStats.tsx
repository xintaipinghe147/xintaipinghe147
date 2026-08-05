"use client";

import { useEffect, useState } from "react";
import { Eye } from "@phosphor-icons/react";

export default function ReadingStats({
  postId,
  initialViews,
}: {
  postId: string;
  initialViews: number;
}) {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/posts/${postId}/view`, { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && typeof d.views === "number" && d.views > 0)
          setViews(d.views);
      })
      .catch(() => {
        /* 统计失败不影响阅读 */
      });
    return () => {
      cancelled = true;
    };
  }, [postId]);

  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-ink-soft">
      <Eye size={15} weight="duotone" />
      {views}
    </span>
  );
}
