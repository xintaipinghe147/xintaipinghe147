"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import * as echarts from "echarts/core";
import { GeoComponent, TooltipComponent } from "echarts/components";
import { EffectScatterChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  GeoComponent,
  TooltipComponent,
  EffectScatterChart,
  CanvasRenderer,
]);

export type MapPoint = {
  id: string;
  name: string;
  title: string;
  value: [number, number];
  date?: string;
  cover?: string;
  excerpt?: string;
};

type Props = {
  points: MapPoint[];
  onPick?: (lng: number, lat: number) => void;
  onSelect?: (point: MapPoint | null) => void;
  height?: number;
};

function buildOption(points: MapPoint[]) {
  return {
    backgroundColor: "#eef2f6",
    tooltip: {
      trigger: "item" as const,
      confine: true,
      backgroundColor: "rgba(30,32,38,0.92)",
      borderWidth: 0,
      extraCssText: "border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.18);",
      textStyle: { color: "#fff", fontSize: 13 },
      formatter: (params: any) => {
        if (params.seriesType === "effectScatter") {
          const d = params.data ?? {};
          return `<b>${params.name}</b><br/>${d.title ?? ""}${
            d.date ? `<br/><span style="opacity:.75">${d.date}</span>` : ""
          }`;
        }
        return params.name;
      },
    },
    geo: {
      map: "world",
      roam: true,
      zoom: 1.12,
      scaleLimit: { min: 1, max: 20 },
      itemStyle: {
        areaColor: "#f7f9fb",
        borderColor: "#c8d1da",
        borderWidth: 1,
      },
      emphasis: {
        disabled: false,
        itemStyle: { areaColor: "#dfe8f1" },
        label: {
          show: false,
          fontSize: 11,
        },
      },
      select: { disabled: true },
    },
    series: [
      {
        type: "effectScatter" as const,
        coordinateSystem: "geo",
        data: points.map((p) => ({
          name: p.name,
          value: p.value,
          id: p.id,
          title: p.title,
        })),
        symbolSize: 10,
        showEffectOn: "render",
        rippleEffect: { scale: 2.6, brushType: "stroke", period: 3.6 },
        itemStyle: {
          color: "#ff3b30",
          borderColor: "#ffffff",
          borderWidth: 1.5,
          shadowBlur: 8,
          shadowColor: "rgba(255,59,48,0.5)",
        },
        label: {
          show: false,
        },
        zlevel: 3,
      },
    ],
  };
}

export default function WorldMap({
  points,
  onPick,
  onSelect,
  height = 430,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const router = useRouter();
  const pointsRef = useRef(points);
  const onPickRef = useRef(onPick);
  const onSelectRef = useRef(onSelect);
  pointsRef.current = points;
  onPickRef.current = onPick;
  onSelectRef.current = onSelect;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let disposed = false;
    let chart: echarts.ECharts | null = null;

    async function init() {
      try {
        const res = await fetch("/map/world.json");
        const geoJson = await res.json();
        if (disposed) return;
        echarts.registerMap("world", geoJson as any);
        chart = echarts.init(el);
        chartRef.current = chart;
        chart.setOption(buildOption(pointsRef.current));

        chart.on("click", (params: any) => {
          if (params.seriesType === "effectScatter" && params.data?.id) {
            const point = pointsRef.current.find(
              (p) => p.id === params.data.id
            );
            if (onSelectRef.current && point) {
              onSelectRef.current(point);
            } else {
              router.push(`/posts/${params.data.id}`);
            }
          } else if (
            params.componentType === "geo" &&
            onPickRef.current
          ) {
            try {
              const pixel = [
                params.event?.offsetX ?? 0,
                params.event?.offsetY ?? 0,
              ];
              const point = chart?.convertFromPixel({ geoIndex: 0 }, pixel);
              if (point) {
                onPickRef.current(point[0], point[1]);
              }
            } catch {
              // 坐标转换失败时忽略，避免打断其他点击
            }
          }
        });
      } catch (err) {
        console.error("世界地图加载失败", err);
      }
    }

    init();
    const onResize = () => chart?.resize();
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      chart?.dispose();
      chartRef.current = null;
    };
  }, [router]);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.setOption(buildOption(points), true);
    }
  }, [points]);

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className="w-full cursor-crosshair"
      role="img"
      aria-label="世界足迹地图"
    />
  );
}
