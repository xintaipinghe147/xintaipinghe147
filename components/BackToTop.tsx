"use client";

import { ArrowUp } from "@phosphor-icons/react";

export default function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="返回顶部"
      title="返回顶部"
      className="fixed bottom-6 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-card text-ink-soft shadow-[0_10px_26px_rgba(90,72,52,0.14)] transition-all hover:scale-105 hover:text-accent active:scale-95"
    >
      <ArrowUp size={19} weight="bold" />
    </button>
  );
}
