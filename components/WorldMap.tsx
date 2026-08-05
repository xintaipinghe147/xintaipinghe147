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
};

type Props = {
  points: MapPoint[];
  onPick?: (lng: number, lat: number) => void;
  height?: number;
};

function buildOption(points: MapPoint[]) {
  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item" as const,
      confine: true,
      backgroundColor: "rgba(76,65,53,0.92)",
      borderWidth: 0,
      textStyle: { color: "#fff", fontSize: 13, fontFamily: "KaiTi, serif" },
      formatter: (params: any) => {
        if (params.seriesType === "effectScatter") {
          return `<b>${params.name}</b><br/>${params.data?.title ?? ""}`;
        }
        return params.name;
      },
    },
    geo: {
      map: "world",
      roam: true,
      zoom: 1.15,
      scaleLimit: { min: 1, max: 20 },
      itemStyle: {
        areaColor: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "#f0e4c9" },
          { offset: 1, color: "#dfcda3" },
        ]),
        borderColor: "#a99678",
        borderWidth: 0.8,
        shadowColor: "rgba(90,70,40,0.28)",
        shadowBlur: 10,
        shadowOffsetY: 5,
      },
      emphasis: {
        disabled: false,
        itemStyle: { areaColor: "#d8bf8f" },
        label: { show: false },
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
        symbolSize: 11,
        showEffectOn: "render",
        rippleEffect: { scale: 3.6, brushType: "stroke", period: 3.2 },
        itemStyle: {
          color: "#c0452f",
          borderColor: "#fff7e6",
          borderWidth: 1.2,
          shadowBlur: 10,
          shadowColor: "rgba(192,69,47,0.55)",
        },
        label: {
          show: true,
          position: "right",
          formatter: "{b}",
          fontSize: 11,
          color: "#5f513f",
          fontWeight: "bold" as const,
          fontFamily: "KaiTi, serif",
          textShadowColor: "rgba(255,255,255,0.8)",
          textShadowBlur: 4,
        },
        zlevel: 3,
      },
    ],
  };
}

export default function WorldMap({ points, onPick, height = 430 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const router = useRouter();
  const pointsRef = useRef(points);
  const onPickRef = useRef(onPick);
  pointsRef.current = points;
  onPickRef.current = onPick;

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
            router.push(`/posts/${params.data.id}`);
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
