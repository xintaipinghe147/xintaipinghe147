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
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loadError, setLoadError] = useState("");
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
      const timer = window.setTimeout(() => {
        if (!window.AMap) {
          setLoadError("高德地图加载失败，请检查 Key 是否配置正确");
        }
      }, 8000);
      const script = document.createElement("script");
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}&plugin=AMap.PlaceSearch,AMap.Geocoder`;
      script.async = true;
      script.onload = () => {
        window.clearTimeout(timer);
        if (window.AMap) initMap();
        else setLoadError("高德地图加载失败，请检查 Key 是否配置正确");
      };
      script.onerror = () => {
        window.clearTimeout(timer);
        setLoadError("高德地图脚本加载失败，请检查网络或 Key 配置");
      };
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
      setCandidates([]);
      const placeSearch = new window.AMap.PlaceSearch({
        pageSize: 5,
        pageIndex: 1,
      });
      placeSearch.search(kw, (status: string, result: any) => {
        const pois = result?.poiList?.pois ?? [];
        if (status === "complete" && pois.length > 0) {
          setCandidates(pois.slice(0, 5));
          selectPlace(pois[0]);
        } else {
          // POI 搜不到时，用地理编码试试（比如搜"山西"这类行政区名）
          const geocoder = new window.AMap.Geocoder({});
          geocoder.getLocation(kw, (geoStatus: string, geoResult: any) => {
            const gc = geoResult?.geocodes?.[0];
            if (geoStatus === "complete" && gc?.location) {
              selectPlace({
                name: gc.formattedAddress ?? kw,
                location: gc.location,
                adname: gc.adname ?? "",
              });
            } else {
              setPickedName("没有找到这个地点，试试更具体的名字");
            }
          });
        }
      });
    } finally {
      setSearching(false);
    }
  }

  function selectPlace(place: any) {
    if (!mapRef.current || !window.AMap || !place?.location) return;
    const lng = place.location.lng ?? place.location.getLng?.();
    const lat = place.location.lat ?? place.location.getLat?.();
    if (typeof lng !== "number" || typeof lat !== "number") return;
    const name = place.name ?? place.formattedAddress ?? keyword.trim();
    mapRef.current.setZoomAndCenter(13, place.location);
    const marker = new window.AMap.Marker({ position: place.location });
    if (markerRef.current) markerRef.current.setMap(null);
    markerRef.current = marker;
    markerRef.current.setMap(mapRef.current);
    onPickRef.current(lng, lat, name);
    setPickedName(name);
  }

  if (!key || loadError) {
    return (
      <div>
        <div className="mb-2 overflow-hidden rounded-lg border border-[rgba(150,128,92,0.35)] bg-[#fdfaf0]">
          <WorldMap points={[]} onPick={(lng, lat) => onPick(lng, lat)} height={height} />
        </div>
        <p className="mt-1 text-xs text-ink-soft">
          {loadError ??
            "当前使用简化版世界地图。配置高德地图密钥后，可搜索并精确到小区、街道。"}
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
      {candidates.length > 0 ? (
        <div className="mt-2 space-y-1">
          <p className="text-xs text-ink-soft">选一个更精确的结果：</p>
          {candidates.map((c) => (
            <button
              key={c.id ?? c.name}
              type="button"
              onClick={() => selectPlace(c)}
              className="block w-full truncate rounded-lg border border-[rgba(150,128,92,0.3)] bg-white/60 px-3 py-1.5 text-left text-sm hover:border-accent hover:bg-accent-soft/20"
            >
              {c.name}
              {c.adname ? (
                <span className="ml-2 text-xs text-ink-soft">{c.adname}</span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
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
