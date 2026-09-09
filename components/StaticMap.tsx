"use client";

import { useMemo } from "react";
import type { RouteLeg } from "@/types/trip";
import type { MapMarkerData } from "@/components/MapView";
import { markerConfig } from "@/lib/mapMarkers";

const VIEW_W = 400;
const VIEW_H = 300;
const PAD_X = 46;
const PAD_Y = 46;

type Point = { x: number; y: number };

type StaticMapProps = {
  markers: MapMarkerData[];
  routes: RouteLeg[];
  selectedLocationId: string | null;
  onSelectLocation: (locationId: string | null) => void;
};

const PIN_PATH = "M0,0 C-7,-9 -11,-14 -11,-19 A11,11 0 1 1 11,-19 C11,-14 7,-9 0,0 Z";

/**
 * 把经纬度线性映射到 SVG 坐标。
 * 有 2 个以上「当天」地点时按当天范围取景（放大），否则用全部地点范围（保证不塌成一个点）。
 */
function buildProjection(markers: MapMarkerData[]) {
  const active = markers.filter((m) => m.active);
  const source = active.length >= 2 ? active : markers;

  const lats = source.map((m) => m.location.latitude);
  const lngs = source.map((m) => m.location.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latSpan = maxLat - minLat || 1;
  const lngSpan = maxLng - minLng || 1;

  return (lat: number, lng: number): Point => ({
    x: PAD_X + ((lng - minLng) / lngSpan) * (VIEW_W - PAD_X * 2),
    y: PAD_Y + ((maxLat - lat) / latSpan) * (VIEW_H - PAD_Y * 2),
  });
}

function buildCurve(from: Point, to: Point) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  // 沿垂直方向偏移一点，画出柔和的弧线而不是生硬的直线
  const offset = Math.min(26, length * 0.22);
  const cx = (from.x + to.x) / 2 + (-dy / length) * offset;
  const cy = (from.y + to.y) / 2 + (dx / length) * offset;
  return `M ${from.x},${from.y} Q ${cx},${cy} ${to.x},${to.y}`;
}

export function StaticMap({ markers, routes, selectedLocationId, onSelectLocation }: StaticMapProps) {
  const project = useMemo(() => buildProjection(markers), [markers]);

  const points = useMemo(() => {
    return new Map<string, Point>(
      markers.map((m) => [m.location.id, project(m.location.latitude, m.location.longitude)]),
    );
  }, [markers, project]);

  const paths = useMemo(() => {
    return routes
      .map((route) => {
        const from = route.fromLocationId ? points.get(route.fromLocationId) : undefined;
        const to = route.toLocationId ? points.get(route.toLocationId) : undefined;
        if (!from || !to) return null;
        return {
          id: route.id,
          d: buildCurve(from, to),
          dashed: route.transport === "flight",
        };
      })
      .filter((item): item is { id: string; d: string; dashed: boolean } => item !== null);
  }, [routes, points]);

  const gridLines = useMemo(() => {
    const lines: string[] = [];
    for (let x = 0; x <= VIEW_W; x += 40) {
      lines.push(`M ${x},0 L ${x},${VIEW_H}`);
    }
    for (let y = 0; y <= VIEW_H; y += 40) {
      lines.push(`M 0,${y} L ${VIEW_W},${y}`);
    }
    return lines.join(" ");
  }, []);

  const selectedMarker = markers.find((m) => m.location.id === selectedLocationId);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-[var(--color-bg)]">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="h-full w-full"
        role="img"
        aria-label="行程路线示意图"
        onClick={() => onSelectLocation(null)}
      >
        <defs>
          <linearGradient id="static-map-water" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFF1F4" />
            <stop offset="100%" stopColor="#FFE7EE" />
          </linearGradient>
          <filter id="static-map-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#E5394F" floodOpacity="0.25" />
          </filter>
        </defs>

        <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="url(#static-map-water)" />
        <path d={gridLines} stroke="#F1DDE1" strokeWidth="0.6" fill="none" />

        {paths.map((path) => (
          <path
            key={path.id}
            d={path.d}
            fill="none"
            stroke="#FF8FA3"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={path.dashed ? "7 6" : undefined}
            opacity={0.9}
          />
        ))}

        {markers.map((marker) => {
          const point = points.get(marker.location.id);
          if (!point) return null;
          const color = markerConfig[marker.location.type].color;
          const isSelected = marker.location.id === selectedLocationId;
          const fill = isSelected ? "#E5394F" : color;

          return (
            <g
              key={marker.location.id}
              transform={`translate(${point.x} ${point.y})`}
              style={{
                transform: `translate(${point.x}px, ${point.y}px)`,
                transition: "transform 460ms cubic-bezier(0.22, 0.61, 0.36, 1)",
                cursor: "pointer",
              }}
              onClick={(event) => {
                event.stopPropagation();
                onSelectLocation(isSelected ? null : marker.location.id);
              }}
            >
              {isSelected ? (
                <circle cx="0" cy="-19" r="22" fill="#E5394F" opacity="0.14">
                  <animate attributeName="r" values="16;24;16" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.22;0.05;0.22" dur="1.8s" repeatCount="indefinite" />
                </circle>
              ) : null}

              <g opacity={marker.active ? 1 : 0.45}>
                <path
                  d={PIN_PATH}
                  fill={fill}
                  stroke="#FFFFFF"
                  strokeWidth={isSelected ? 2.6 : 2}
                  filter={isSelected ? "url(#static-map-shadow)" : undefined}
                  style={{
                    transform: `scale(${isSelected ? 1.25 : 1})`,
                    transformOrigin: "0px 0px",
                    transition: "transform 220ms ease, fill 220ms ease",
                  }}
                />
                <text
                  x="0"
                  y="-15"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="10"
                  fontWeight="700"
                  style={{ pointerEvents: "none" }}
                >
                  {marker.index}
                </text>
              </g>

              {isSelected ? (
                <g style={{ pointerEvents: "none" }}>
                  <rect
                    x={-Math.max(28, marker.location.name.length * 5.2)}
                    y="10"
                    width={Math.max(56, marker.location.name.length * 10.4)}
                    height="20"
                    rx="10"
                    fill="#FFFFFF"
                    stroke="#F1DDE1"
                  />
                  <text x="0" y="24" textAnchor="middle" fill="#333333" fontSize="10" fontWeight="600">
                    {marker.location.name}
                  </text>
                </g>
              ) : null}
            </g>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-medium text-[var(--color-text-secondary)]">
        示意图 · 配置 API Key 后显示真实地图
      </div>

      {selectedMarker ? (
        <div className="pointer-events-none absolute right-2 top-2 rounded-xl bg-white/90 px-3 py-2 text-right shadow-sm">
          <p className="text-xs font-semibold text-[var(--color-text)]">{selectedMarker.location.name}</p>
          <p className="mt-0.5 max-w-[150px] text-[10px] leading-4 text-[var(--color-text-secondary)]">
            {selectedMarker.location.address}
          </p>
        </div>
      ) : null}
    </div>
  );
}
