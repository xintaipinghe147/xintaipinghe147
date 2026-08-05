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
  const districtPolysRef = useRef<any[]>([]);
  const onPickRef = useRef(onPick);
  const [keyword, setKeyword] = useState("");
  const [searching, setSearching] = useState(false);
  const [pickedName, setPickedName] = useState("");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loadError, setLoadError] = useState("");
  const [searchError, setSearchError] = useState("");
  onPickRef.current = onPick;

  function placeMarker(lng: number, lat: number, name?: string) {
    const map = mapRef.current;
    if (!map || !window.AMap) return;
    const position = [lng, lat];
    if (markerRef.current) markerRef.current.setMap(null);
    markerRef.current = new window.AMap.Marker({ position });
    markerRef.current.setMap(map);
    onPickRef.current(lng, lat, name);
    setPickedName(name ?? "");
  }

  function clearDistrict() {
    districtPolysRef.current.forEach((poly) => poly.setMap?.(null));
    districtPolysRef.current = [];
  }

  useEffect(() => {
    if (!key || !containerRef.current) return;
    let map: any = null;
    let cancelled = false;

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
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}&plugin=AMap.PlaceSearch,AMap.Geocoder,AMap.DistrictSearch`;
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
      setSearchError("");
      clearDistrict();
      // 1) 先按行政区查询：搜"山西"显示山西省、搜"太原"显示太原市
      const district = new window.AMap.DistrictSearch({
        level: "district",
        subdistrict: 0,
        extensions: "all",
      });
      district.search(kw, (dStatus: string, dResult: any) => {
        const hit = (dResult?.districtList ?? []).find(
          (d: any) =>
            d.level === "province" ||
            d.level === "city" ||
            d.level === "district"
        );
        if (dStatus === "complete" && hit) {
          setSearchError("");
          if (Array.isArray(hit.boundaries) && hit.boundaries.length > 0) {
            hit.boundaries.forEach((b: any) => {
              const poly = new window.AMap.Polygon({
                path: b,
                strokeColor: "#ff3b30",
                strokeWeight: 2,
                strokeOpacity: 0.85,
                fillColor: "#ff3b30",
                fillOpacity: 0.06,
              });
              poly.setMap(mapRef.current);
              districtPolysRef.current.push(poly);
            });
            mapRef.current.setFitView(districtPolysRef.current, false, [
              70, 70, 70, 70,
            ]);
          } else if (hit.center) {
            mapRef.current.setZoomAndCenter(10, hit.center);
          }
          if (hit.center) {
            placeMarker(hit.center.lng, hit.center.lat, hit.name);
          } else {
            setPickedName(hit.name);
          }
          return;
        }
        searchPlace(kw);
      });
    } finally {
      setSearching(false);
    }
  }

  function searchPlace(kw: string) {
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
        setSearchError("没有搜到精确结果，试试更具体的地名（如“太原市小店区”）");
        const geocoder = new window.AMap.Geocoder({});
        geocoder.getLocation(kw, (geoStatus: string, geoResult: any) => {
          const gc = geoResult?.geocodes?.[0];
          if (geoStatus === "complete" && gc?.location) {
            setSearchError("");
            selectPlace({
              name: gc.formattedAddress ?? kw,
              location: gc.location,
              adname: gc.adname ?? "",
            });
          } else {
            setSearchError(
              "搜索失败：请检查高德 Key 的搜索权限，或换个更具体的地名"
            );
          }
        });
      }
    });
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
        <div className="mb-2 overflow-hidden rounded-lg border border-line bg-map-bg">
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
        className="w-full cursor-crosshair overflow-hidden rounded-lg border border-line"
      />
      {candidates.length > 0 ? (
        <div className="mt-2 space-y-1">
          <p className="text-xs text-ink-soft">选一个更精确的结果：</p>
          {candidates.map((c) => (
            <button
              key={c.id ?? c.name}
              type="button"
              onClick={() => selectPlace(c)}
              className="block w-full truncate rounded-lg border border-line bg-glass px-3 py-1.5 text-left text-sm hover:border-accent hover:bg-accent-soft/20"
            >
              {c.name}
              {c.adname ? (
                <span className="ml-2 text-xs text-ink-soft">{c.adname}</span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
      {searchError ? (
        <p className="mt-2 text-sm text-accent">{searchError}</p>
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
