"use client";

import Link from "next/link";
import { useState } from "react";
import WorldMap, { type MapPoint } from "@/components/WorldMap";
import { excerpt } from "@/lib/utils";

export default function HomeMap({ points }: { points: MapPoint[] }) {
  const [selected, setSelected] = useState<MapPoint | null>(null);

  return (
    <div className="relative">
      <WorldMap
        points={points}
        onSelect={(p) => setSelected(p)}
        height={460}
      />
      {selected ? (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:w-80">
          <div className="note-card overflow-hidden shadow-2xl!">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/25 text-white hover:bg-black/45"
              aria-label="关闭详情"
            >
              ×
            </button>
            {selected.cover ? (
              <div className="h-36 w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selected.cover}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}
            <div className="p-4">
              <div className="mb-1 text-sm text-ink-soft">
                📍 {selected.name}
                {selected.date ? ` · ${selected.date}` : ""}
              </div>
              <h3 className="mb-1.5 text-lg font-bold">{selected.title}</h3>
              {selected.excerpt ? (
                <p className="mb-3 text-sm leading-relaxed text-ink-soft">
                  {excerpt(selected.excerpt, 60)}
                </p>
              ) : null}
              <Link
                href={`/posts/${selected.id}`}
                className="btn-primary py-1.5! text-sm"
              >
                翻开这篇日记 →
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/35 px-4 py-1.5 text-xs text-white">
          点击地图上的足迹查看日记
        </p>
      )}
    </div>
  );
}
