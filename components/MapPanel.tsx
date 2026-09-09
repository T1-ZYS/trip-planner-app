"use client";

import dynamic from "next/dynamic";
import type { MapMarkerData } from "@/components/MapView";
import type { Location, RouteLeg } from "@/types/trip";
import { StaticMap } from "@/components/StaticMap";

const MapView = dynamic(() => import("@/components/MapView").then((mod) => mod.MapView), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-center">
      <p className="text-sm text-[var(--color-text-secondary)]">地图加载中…</p>
    </div>
  ),
});

const AmapView = dynamic(() => import("@/components/AmapView").then((mod) => mod.AmapView), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-center">
      <p className="text-sm text-[var(--color-text-secondary)]">高德地图加载中…</p>
    </div>
  ),
});

type MapPanelProps = {
  amapKey: string;
  amapSecurityJsCode: string;
  apiKey: string;
  markers: MapMarkerData[];
  routes: RouteLeg[];
  locations: Location[];
  selectedLocationId: string | null;
  focusToken: number;
  onSelectLocation: (locationId: string | null) => void;
  activeDayLabel: string;
};

export function MapPanel({
  amapKey,
  amapSecurityJsCode,
  apiKey,
  markers,
  routes,
  locations,
  selectedLocationId,
  focusToken,
  onSelectLocation,
  activeDayLabel,
}: MapPanelProps) {
  // 底图优先级：高德 > Google Maps > 内置 SVG 示意图
  const basemap = amapKey ? "amap" : apiKey ? "google" : "static";
  const basemapLabel = basemap === "amap" ? "高德地图" : basemap === "google" ? "Google 地图" : "示意图";

  return (
    <div className="sticky top-28 space-y-4 rounded-3xl border border-[var(--color-border)] bg-white p-4 md:p-5">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-base font-semibold text-[var(--color-text)] md:text-lg">行程地图</h4>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-[var(--color-soft)] px-3 py-1 text-xs font-medium text-[var(--color-primary)]">
            {activeDayLabel}
          </span>
          <span className="rounded-full border border-[var(--color-border)] px-2.5 py-1 text-[11px] text-[var(--color-text-secondary)]">
            {basemapLabel}
          </span>
        </div>
      </div>

      <div className="h-[320px] w-full overflow-hidden rounded-2xl border border-[var(--color-border)] md:h-[420px]">
        {basemap === "amap" ? (
          <AmapView
            apiKey={amapKey}
            securityJsCode={amapSecurityJsCode || undefined}
            markers={markers}
            routes={routes}
            selectedLocationId={selectedLocationId}
            focusToken={focusToken}
            onSelectLocation={onSelectLocation}
          />
        ) : basemap === "google" ? (
          <MapView
            apiKey={apiKey}
            markers={markers}
            routes={routes}
            selectedLocationId={selectedLocationId}
            focusToken={focusToken}
            onSelectLocation={onSelectLocation}
          />
        ) : (
          <StaticMap
            markers={markers}
            routes={routes}
            selectedLocationId={selectedLocationId}
            onSelectLocation={onSelectLocation}
          />
        )}
      </div>

      <div className="max-h-[220px] space-y-2 overflow-y-auto pr-1">
        {markers.map((marker) => (
          <button
            key={marker.location.id}
            type="button"
            onClick={() => onSelectLocation(marker.location.id)}
            className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
              selectedLocationId === marker.location.id
                ? "border-[var(--color-primary)] bg-[var(--color-soft)]"
                : "border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]"
            }`}
          >
            <span
              className="inline-grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white"
              style={{ backgroundColor: marker.active ? "#E5394F" : "#C9C9C9" }}
            >
              {marker.index}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-[var(--color-text)]">{marker.location.name}</span>
              <span className="block truncate text-xs text-[var(--color-text-secondary)]">{marker.location.address}</span>
            </span>
          </button>
        ))}
      </div>

      {locations.length === 0 ? (
        <p className="text-center text-sm text-[var(--color-text-secondary)]">还没有地点数据。</p>
      ) : null}
    </div>
  );
}
