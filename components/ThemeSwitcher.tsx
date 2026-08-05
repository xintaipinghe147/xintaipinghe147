"use client";

import { useEffect, useState } from "react";

const THEMES = [
  { id: "paper", label: "奶油", color: "#fbf7f1", color2: "#f5ede2" },
  { id: "warm", label: "蜜桃", color: "#fdf3ec", color2: "#f8e6d9" },
  { id: "mist", label: "薄荷", color: "#f1f8f3", color2: "#e1efe7" },
  { id: "sakura", label: "草莓", color: "#fdf2f4", color2: "#f8e0e5" },
  { id: "lavender", label: "紫芋", color: "#f6f2fb", color2: "#eae2f6" },
  { id: "night", label: "夜空", color: "#17141d", color2: "#211c2b" },
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
          <div className="grid grid-cols-3 gap-2">
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
