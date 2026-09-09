"use client";

import { useEffect, useMemo, useState } from "react";
import {
  APIProvider,
  InfoWindow,
  Map as GoogleMap,
  Marker,
  Polyline,
  useApiIsLoaded,
} from "@vis.gl/react-google-maps";
import type { Location, RouteLeg } from "@/types/trip";
import { defaultMapOptions, mapContainerStyle, markerConfig } from "@/lib/mapMarkers";

export type MapMarkerData = {
  location: Location;
  index: number;
  active: boolean;
};

type MapViewProps = {
  apiKey: string;
  markers: MapMarkerData[];
  routes: RouteLeg[];
  selectedLocationId: string | null;
  focusToken: number;
  onSelectLocation: (locationId: string | null) => void;
};

const PIN_PATH =
  "M0,-22 C-8.8,-22 -14,-16.8 -14,-8 C-14,2.8 0,18 0,18 C0,18 14,2.8 14,-8 C14,-16.8 8.8,-22 0,-22 Z";

function buildIcon(active: boolean, color: string): google.maps.Symbol {
  return {
    path: PIN_PATH,
    fillColor: active ? "#E5394F" : color,
    fillOpacity: active ? 1 : 0.75,
    strokeColor: "#FFFFFF",
    strokeWeight: active ? 3 : 2,
    scale: active ? 1.3 : 1,
    anchor: new google.maps.Point(0, 18),
    labelOrigin: new google.maps.Point(0, -8),
  };
}

function InnerMap({ markers, routes, selectedLocationId, focusToken, onSelectLocation }: Omit<MapViewProps, "apiKey">) {
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const isLoaded = useApiIsLoaded();

  const locationById = useMemo(() => {
    return new Map<string, Location>(markers.map((m) => [m.location.id, m.location]));
  }, [markers]);

  const polylines = useMemo(() => {
    return routes
      .map((route) => {
        const from = route.fromLocationId ? locationById.get(route.fromLocationId) : undefined;
        const to = route.toLocationId ? locationById.get(route.toLocationId) : undefined;
        if (!from || !to) return null;
        return {
          id: route.id,
          path: [
            { lat: from.latitude, lng: from.longitude },
            { lat: to.latitude, lng: to.longitude },
          ],
        };
      })
      .filter((item): item is { id: string; path: google.maps.LatLngLiteral[] } => item !== null);
  }, [routes, locationById]);

  // 选中地点 / 点击行程条目：地图飞到该点并放大
  useEffect(() => {
    if (!mapRef || !selectedLocationId) return;
    const target = locationById.get(selectedLocationId);
    if (!target) return;
    mapRef.panTo({ lat: target.latitude, lng: target.longitude });
    mapRef.setZoom(14);
  }, [mapRef, selectedLocationId, focusToken, locationById]);

  // 切换「全部 / 第 N 天」：自动缩放到当天的地点范围
  useEffect(() => {
    if (!mapRef) return;
    const activeMarkers = markers.filter((m) => m.active);
    if (activeMarkers.length === 0) return;

    if (activeMarkers.length === 1) {
      mapRef.panTo({ lat: activeMarkers[0].location.latitude, lng: activeMarkers[0].location.longitude });
      mapRef.setZoom(13);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    activeMarkers.forEach((m) => bounds.extend({ lat: m.location.latitude, lng: m.location.longitude }));
    mapRef.fitBounds(bounds, 72);
  }, [mapRef, markers]);

  const selected = selectedLocationId ? locationById.get(selectedLocationId) : undefined;

  return (
    <GoogleMap
      {...defaultMapOptions}
      defaultCenter={{ lat: 13.7466, lng: 100.5344 }}
      defaultZoom={11}
      style={mapContainerStyle}
      onIdle={(event) => setMapRef(event.map)}
    >
      {isLoaded
        ? polylines.map((line) => (
            <Polyline
              key={line.id}
              path={line.path}
              strokeColor="#FF8FA3"
              strokeOpacity={0.85}
              strokeWeight={3}
              geodesic
            />
          ))
        : null}

      {isLoaded
        ? markers.map((marker) => {
            const color = markerConfig[marker.location.type].color;
            return (
              <Marker
                key={marker.location.id}
                position={{ lat: marker.location.latitude, lng: marker.location.longitude }}
                icon={buildIcon(marker.active, color)}
                label={{
                  text: String(marker.index),
                  color: "#FFFFFF",
                  fontSize: "11px",
                  fontWeight: "600",
                }}
                opacity={marker.active ? 1 : 0.55}
                zIndex={marker.active ? 100 : 1}
                onClick={() => onSelectLocation(marker.location.id)}
              />
            );
          })
        : null}

      {selected ? (
        <InfoWindow
          position={{ lat: selected.latitude, lng: selected.longitude }}
          onCloseClick={() => onSelectLocation(null)}
        >
          <div className="max-w-[200px] text-[var(--color-text)]">
            <p className="text-sm font-semibold">{selected.name}</p>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{selected.address}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${selected.latitude},${selected.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs font-semibold text-[var(--color-primary)]"
            >
              在 Google 地图中打开
            </a>
          </div>
        </InfoWindow>
      ) : null}
    </GoogleMap>
  );
}

export function MapView({ apiKey, ...rest }: MapViewProps) {
  return (
    <APIProvider apiKey={apiKey}>
      <InnerMap {...rest} />
    </APIProvider>
  );
}
