"use client";

import { useEffect, useState } from "react";

const THEMES = [
  { id: "paper", label: "石墨", color: "#0b0c10", color2: "#15171d" },
  { id: "warm", label: "暮蓝", color: "#0c1016", color2: "#131b29" },
  { id: "mist", label: "墨绿", color: "#0b1210", color2: "#121d18" },
  { id: "sakura", label: "暗紫", color: "#100e16", color2: "#181525" },
  { id: "night", label: "夜空", color: "#050607", color2: "#0b0c10" },
] as const;

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<string>("paper");

  useEffect(() => {
    const saved = localStorage.getItem("journal-theme");
    if (saved) {
      setTheme(saved);
      document.documentElement.dataset.theme = saved;
    }
  }, []);

  function apply(id: string) {
    setTheme(id);
    localStorage.setItem("journal-theme", id);
    document.documentElement.dataset.theme = id;
  }

  const current = THEMES.find((t) => t.id === theme);

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open ? (
        <div className="note-card absolute bottom-14 right-0 w-60 p-4">
          <p className="mb-2 text-sm font-bold">背景主题</p>
          <div className="grid grid-cols-5 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => apply(t.id)}
                title={t.label}
                aria-label={t.label}
                className={`h-9 rounded-lg border-2 transition-transform hover:scale-105 ${
                  theme === t.id
                    ? "border-accent"
                    : "border-line"
                }`}
                style={{
                  background: `linear-gradient(135deg, ${t.color} 50%, ${t.color2} 50%)`,
                }}
              />
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-ink-soft">
            <span>{current?.label ?? "纸张"}</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="hover:text-accent"
            >
              收起
            </button>
          </div>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-ghost h-12 w-12 rounded-full text-xl"
        title="切换背景主题"
        aria-label="切换背景主题"
      >
        🎨
      </button>
    </div>
  );
}
