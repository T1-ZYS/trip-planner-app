import type { LocationType } from "@/types/trip";

export const markerConfig: Record<LocationType, { color: string; label: string }> = {
  airport: { color: "#E5394F", label: "机场" },
  hotel: { color: "#FF8FA3", label: "酒店" },
  attraction: { color: "#FF8FA3", label: "景点" },
  restaurant: { color: "#FF6F91", label: "餐厅" },
  city: { color: "#888888", label: "城市" },
  other: { color: "#888888", label: "其他" },
};

export const mapContainerStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  borderRadius: "16px",
};

/**
 * 生成水滴图钉的 SVG 字符串（用于高德自定义 Marker 的 content）。
 * 视角固定在 viewBox 0 0 28 38，图钉尖端始终在底部居中，方便计算 offset。
 */
export function buildPinSvg(index: number, color: string, active: boolean, selected: boolean) {
  const width = selected ? 34 : 28;
  const height = selected ? 46 : 38;
  const fill = selected ? "#E5394F" : color;
  const opacity = active ? 1 : 0.45;
  const shadow = selected ? "0 3px 8px rgba(229,57,79,0.45)" : "0 2px 4px rgba(229,57,79,0.25)";

  const svg = [
    `<svg width="${width}" height="${height}" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg"`,
    ` style="opacity:${opacity};filter:drop-shadow(${shadow});cursor:pointer;">`,
    `<path d="M14,38 C14,38 2,25 2,14 A12,12 0 1 1 26,14 C26,25 14,38 14,38 Z"`,
    ` fill="${fill}" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round"/>`,
    `<text x="14" y="19" text-anchor="middle" font-size="12" font-weight="700" fill="#FFFFFF"`,
    ` font-family="system-ui,-apple-system,Segoe UI,sans-serif">${index}</text>`,
    `</svg>`,
  ].join("");

  return { svg, width, height };
}

/**
 * 注意：这里刻意不用 `google.maps.MapOptions` 做类型标注。
 * 该类型里的 colorScheme / renderingType 允许为 null，
 * 而 @vis.gl/react-google-maps 的 Map props 不接受 null，直接展开会类型报错。
 */
export const defaultMapOptions = {
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  styles: [
    {
      featureType: "poi" as const,
      elementType: "labels" as const,
      stylers: [{ visibility: "off" as const }],
    },
  ],
};
