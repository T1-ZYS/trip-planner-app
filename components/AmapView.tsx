"use client";

import { useEffect, useRef, useState } from "react";
import type { AMapMap, AMapMarker, AMapNamespace, AMapOverlay, AMapPosition } from "@/lib/amap";
import { loadAmap } from "@/lib/amap";
import type { Location, RouteLeg } from "@/types/trip";
import type { MapMarkerData } from "@/components/MapView";
import { buildPinSvg, markerConfig } from "@/lib/mapMarkers";

type AmapViewProps = {
  apiKey: string;
  securityJsCode?: string;
  markers: MapMarkerData[];
  routes: RouteLeg[];
  selectedLocationId: string | null;
  focusToken: number;
  onSelectLocation: (locationId: string | null) => void;
};

const DEFAULT_CENTER: AMapPosition = [100.5344, 13.7466];
const DEFAULT_ZOOM = 11;

function buildInfoWindowHtml(location: Location) {
  const uri = `https://uri.amap.com/marker?position=${location.longitude},${location.latitude}&name=${encodeURIComponent(location.name)}`;
  return [
    `<div style="min-width:180px;max-width:220px;padding:10px 12px;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#333333;">`,
    `<div style="font-size:13px;font-weight:700;line-height:1.4;">${location.name}</div>`,
    `<div style="margin-top:4px;font-size:11px;line-height:1.5;color:#8a8a8a;">${location.address}</div>`,
    `<a href="${uri}" target="_blank" rel="noopener noreferrer"`,
    ` style="display:inline-block;margin-top:8px;font-size:11px;font-weight:700;color:#E5394F;text-decoration:none;">`,
    `在高德地图中打开</a>`,
    `</div>`,
  ].join("");
}

export function AmapView({
  apiKey,
  securityJsCode,
  markers,
  routes,
  selectedLocationId,
  focusToken,
  onSelectLocation,
}: AmapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const amapRef = useRef<AMapNamespace | null>(null);
  const mapRef = useRef<AMapMap | null>(null);
  const markerRefs = useRef<AMapMarker[]>([]);
  const polylineRefs = useRef<AMapOverlay[]>([]);
  const infoWindowRef = useRef<{ setContent: (c: string) => void; open: (m: AMapMap, p: AMapPosition) => void; close: () => void } | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // 1. 加载高德 JSAPI 并创建地图实例
  useEffect(() => {
    let cancelled = false;

    loadAmap({ key: apiKey, securityJsCode })
      .then((AMap) => {
        if (cancelled || !containerRef.current) return;
        amapRef.current = AMap;
        mapRef.current = new AMap.Map(containerRef.current, {
          zoom: DEFAULT_ZOOM,
          center: DEFAULT_CENTER,
          viewMode: "2D",
          mapStyle: "amap://styles/whitesmoke",
          showLabel: true,
        });
        setMapReady(true);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [apiKey, securityJsCode]);

  // 卸载时销毁地图，避免重复初始化
  useEffect(
    () => () => {
      markerRefs.current = [];
      polylineRefs.current = [];
      mapRef.current?.destroy();
      mapRef.current = null;
    },
    [],
  );

  // 2. 渲染标记点（选中态变化时重建，保证图标同步更新）
  useEffect(() => {
    const AMap = amapRef.current;
    const map = mapRef.current;
    if (!AMap || !map) return;

    markerRefs.current.forEach((marker) => marker.setMap(null));

    markerRefs.current = markers.map((marker) => {
      const isSelected = marker.location.id === selectedLocationId;
      const color = markerConfig[marker.location.type].color;
      const pin = buildPinSvg(marker.index, color, marker.active, isSelected);

      const instance = new AMap.Marker({
        position: [marker.location.longitude, marker.location.latitude],
        content: pin.svg,
        offset: new AMap.Pixel(-pin.width / 2, -pin.height),
        zIndex: marker.active ? 200 : 100,
        bubble: true,
      });

      instance.on("click", () => onSelectLocation(marker.location.id));
      instance.setMap(map);
      return instance;
    });
  }, [mapReady, markers, selectedLocationId, onSelectLocation]);

  // 3. 渲染路线折线
  useEffect(() => {
    const AMap = amapRef.current;
    const map = mapRef.current;
    if (!AMap || !map) return;

    polylineRefs.current.forEach((line) => line.setMap(null));

    const locationById = new Map<string, Location>(markers.map((m) => [m.location.id, m.location]));

    polylineRefs.current = routes
      .map((route) => {
        const from = route.fromLocationId ? locationById.get(route.fromLocationId) : undefined;
        const to = route.toLocationId ? locationById.get(route.toLocationId) : undefined;
        if (!from || !to) return null;

        const path: AMapPosition[] = [
          [from.longitude, from.latitude],
          [to.longitude, to.latitude],
        ];
        const isFlight = route.transport === "flight";

        return new AMap.Polyline({
          path,
          strokeColor: "#FF8FA3",
          strokeWeight: 4,
          strokeOpacity: 0.9,
          strokeStyle: isFlight ? "dashed" : "solid",
          strokeDasharray: isFlight ? [8, 6] : undefined,
          lineJoin: "round",
          lineCap: "round",
          zIndex: 50,
        });
      })
      .filter((line): line is AMapOverlay => line !== null);

    polylineRefs.current.forEach((line) => line.setMap(map));
  }, [mapReady, routes, markers]);

  // 4. 切换「全部 / 第 N 天」时自动取景到当天地点
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const activePoints: AMapPosition[] = markers
      .filter((m) => m.active)
      .map((m) => [m.location.longitude, m.location.latitude]);

    if (activePoints.length === 0) return;
    if (activePoints.length === 1) {
      map.setZoomAndCenter(13, activePoints[0]);
      return;
    }

    const overlays = markerRefs.current.filter((_, index) => markers[index]?.active);
    if (overlays.length >= 2) {
      map.setFitView(overlays, false, [60, 60, 60, 60], 15);
    }
  }, [mapReady, markers]);

  // 5. 选中地点时飞到该点并弹出信息窗
  useEffect(() => {
    const AMap = amapRef.current;
    const map = mapRef.current;
    if (!AMap || !map) return;

    if (!selectedLocationId) {
      infoWindowRef.current?.close();
      return;
    }

    const target = markers.find((m) => m.location.id === selectedLocationId);
    if (!target) return;

    const position: AMapPosition = [target.location.longitude, target.location.latitude];
    map.setZoomAndCenter(14, position);

    if (!infoWindowRef.current) {
      infoWindowRef.current = new AMap.InfoWindow({
        offset: new AMap.Pixel(0, -46),
        anchor: "bottom-center",
      });
    }
    infoWindowRef.current.setContent(buildInfoWindowHtml(target.location));
    infoWindowRef.current.open(map, position);
  }, [mapReady, selectedLocationId, focusToken, markers]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-[var(--color-bg)]">
      <div ref={containerRef} className="h-full w-full" />

      {loadError ? (
        <div className="absolute inset-0 grid place-items-center bg-[var(--color-bg)] px-6 text-center">
          <div>
            <p className="text-base font-medium text-[var(--color-text)]">高德地图加载失败</p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--color-text-secondary)]">
              请确认 Key 类型为「Web端(JS API)」；2021-12-02 之后申请的 Key 还需要配置安全密钥
              NEXT_PUBLIC_AMAP_SECURITY_JS_CODE。
            </p>
          </div>
        </div>
      ) : null}

      {!loadError && !mapReady ? (
        <div className="absolute inset-0 grid place-items-center bg-[var(--color-bg)]">
          <p className="text-sm text-[var(--color-text-secondary)]">高德地图加载中…</p>
        </div>
      ) : null}
    </div>
  );
}
