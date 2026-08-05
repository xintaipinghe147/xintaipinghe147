"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "@phosphor-icons/react";
import { THEME_KEY } from "@/lib/constants";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    setDark(root.dataset.theme === "dark");
  }, []);

  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (e) {
      /* 隐私模式下可能失败，忽略 */
    }
    setDark(next === "dark");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "切换到浅色模式" : "切换到深色模式"}
      title={dark ? "浅色模式" : "深色模式"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong text-ink-soft transition-all hover:scale-105 hover:text-accent active:scale-95"
    >
      {dark ? <Sun size={17} weight="duotone" /> : <Moon size={17} weight="duotone" />}
    </button>
  );
}
