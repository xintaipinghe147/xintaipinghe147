"use client";

import { useEffect, useRef, useState } from "react";
import WorldMap from "@/components/WorldMap";

declare global {
  interface Window {
    AMap?: any;
  }
}

type Props = {
  onPick: (lng: number, lat: number, name?: string) => void;
  height?: number;
  center?: [number, number] | null;
};

export default function AmapPicker({ onPick, height = 300, center = null }: Props) {
  const key = process.env.NEXT_PUBLIC_AMAP_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const onPickRef = useRef(onPick);
  const [keyword, setKeyword] = useState("");
  const [searching, setSearching] = useState(false);
  const [pickedName, setPickedName] = useState("");
  onPickRef.current = onPick;

  useEffect(() => {
    if (!key || !containerRef.current) return;
    let map: any = null;
    let cancelled = false;

    function placeMarker(lng: number, lat: number, name?: string) {
      if (!map || !window.AMap) return;
      const position = [lng, lat];
      if (markerRef.current) markerRef.current.setMap(null);
      markerRef.current = new window.AMap.Marker({ position });
      markerRef.current.setMap(map);
      onPickRef.current(lng, lat, name);
      setPickedName(name ?? "");
    }

    function initMap() {
      if (cancelled || !containerRef.current || !window.AMap) return;
      map = new window.AMap.Map(containerRef.current, {
        zoom: 11,
        center: center ?? [116.397428, 39.90923],
        viewMode: "2D",
        mapStyle: "amap://styles/whitesmoke",
      });
      if (center) {
        placeMarker(center[0], center[1]);
      }
      mapRef.current = map;
      map.on("click", (e: any) => {
        const lng = e.lnglat?.getLng?.();
        const lat = e.lnglat?.getLat?.();
        if (typeof lng === "number" && typeof lat === "number") {
          placeMarker(lng, lat);
        }
      });
    }

    if (window.AMap) {
      initMap();
    } else {
      const script = document.createElement("script");
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}&plugin=AMap.PlaceSearch`;
      script.async = true;
      script.onload = () => initMap();
      script.onerror = () => console.error("高德地图脚本加载失败");
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      map?.destroy?.();
      mapRef.current = null;
    };
  }, [key]);

  async function search() {
    const kw = keyword.trim();
    if (!kw || !mapRef.current || !window.AMap) return;
    setSearching(true);
    try {
      const placeSearch = new window.AMap.PlaceSearch({
        pageSize: 1,
        pageIndex: 1,
      });
      placeSearch.search(kw, (status: string, result: any) => {
        const poi = result?.poiList?.pois?.[0];
        if (status === "complete" && poi) {
          mapRef.current.setZoomAndCenter(16, poi.location);
          const marker = new window.AMap.Marker({ position: poi.location });
          if (markerRef.current) markerRef.current.setMap(null);
          markerRef.current = marker;
          markerRef.current.setMap(mapRef.current);
          onPickRef.current(poi.location.lng, poi.location.lat, poi.name);
          setPickedName(poi.name);
        } else {
          setPickedName("没有找到这个地点");
        }
      });
    } finally {
      setSearching(false);
    }
  }

  if (!key) {
    return (
      <div>
        <div className="mb-2 overflow-hidden rounded-lg border border-[rgba(150,128,92,0.35)] bg-[#fdfaf0]">
          <WorldMap points={[]} onPick={(lng, lat) => onPick(lng, lat)} height={height} />
        </div>
        <p className="mt-1 text-xs text-ink-soft">
          当前使用简化版世界地图。配置高德地图密钥后，可搜索并精确到小区、街道。
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex gap-2">
        <input
          className="field flex-1"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              search();
            }
          }}
          placeholder="搜索小区、街道、地标，例如：外滩"
          maxLength={40}
        />
        <button
          type="button"
          onClick={search}
          disabled={searching || !keyword.trim()}
          className="btn-ghost shrink-0"
        >
          {searching ? "搜索中…" : "搜索"}
        </button>
      </div>
      <div
        ref={containerRef}
        style={{ height }}
        className="w-full cursor-crosshair overflow-hidden rounded-lg border border-[rgba(150,128,92,0.35)]"
      />
      {pickedName ? (
        <p className="mt-2 text-sm text-accent">已选：{pickedName}</p>
      ) : (
        <p className="mt-2 text-sm text-ink-soft">
          搜索地点，或直接点击地图选点
        </p>
      )}
    </div>
  );
}
