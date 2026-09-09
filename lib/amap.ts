import { load } from "@amap/amap-jsapi-loader";

declare global {
  interface Window {
    /** 高德 JSAPI 2.0 安全密钥，必须在加载脚本前挂到 window 上 */
    _AMapSecurityConfig?: { securityJsCode: string };
  }
}

export type AMapPosition = [lng: number, lat: number];

export type AMapMap = {
  setZoomAndCenter: (zoom: number, center: AMapPosition) => void;
  setFitView: (overlays: unknown[], immediately?: boolean, avoid?: number[], maxZoom?: number) => void;
  destroy: () => void;
};

export type AMapOverlay = {
  setMap: (map: AMapMap | null) => void;
};

export type AMapMarker = AMapOverlay & {
  on: (event: string, handler: () => void) => void;
};

export type AMapInfoWindow = {
  setContent: (content: string) => void;
  open: (map: AMapMap, position: AMapPosition) => void;
  close: () => void;
};

export type AMapPixel = { x: number; y: number };

export type AMapNamespace = {
  Map: new (container: HTMLElement, options: Record<string, unknown>) => AMapMap;
  Marker: new (options: Record<string, unknown>) => AMapMarker;
  Polyline: new (options: Record<string, unknown>) => AMapOverlay;
  InfoWindow: new (options: Record<string, unknown>) => AMapInfoWindow;
  Pixel: new (x: number, y: number) => AMapPixel;
};

export function loadAmap(options: { key: string; securityJsCode?: string; version?: string }): Promise<AMapNamespace> {
  if (options.securityJsCode) {
    window._AMapSecurityConfig = { securityJsCode: options.securityJsCode };
  }
  return load({ key: options.key, version: options.version ?? "2.0" });
}
