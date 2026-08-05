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
        areaColor: "#e9dcc2",
        borderColor: "#b3a084",
        borderWidth: 0.6,
        shadowColor: "rgba(90,70,40,0.18)",
        shadowBlur: 8,
      },
      emphasis: {
        disabled: false,
        itemStyle: { areaColor: "#dcc9a4" },
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
        symbolSize: 10,
        showEffectOn: "render",
        rippleEffect: { scale: 3.2, brushType: "stroke" },
        itemStyle: {
          color: "#c0452f",
          shadowBlur: 6,
          shadowColor: "rgba(192,69,47,0.45)",
        },
        label: {
          show: true,
          position: "right",
          formatter: "{b}",
          fontSize: 11,
          color: "#6b5b47",
          fontFamily: "KaiTi, serif",
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
            Array.isArray(params.value) &&
            onPickRef.current
          ) {
            const [lng, lat] = params.value as number[];
            onPickRef.current(lng, lat);
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
