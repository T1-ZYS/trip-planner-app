import type { TransportType } from "@/types/trip";

export const transportLabel: Record<TransportType, string> = {
  flight: "飞机",
  highSpeedRail: "高铁",
  train: "火车",
  metro: "地铁",
  bus: "公交",
  walk: "步行",
  taxi: "出租车",
  other: "其他",
};

export const transportIcon: Record<TransportType, string> = {
  flight: "✈",
  highSpeedRail: "🚄",
  train: "🚆",
  metro: "🚇",
  bus: "🚌",
  walk: "🚶",
  taxi: "🚕",
  other: "🧭",
};
