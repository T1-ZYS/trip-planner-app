"use client";

import { useMemo } from "react";
import type { ItineraryDay, RouteLeg } from "@/types/trip";
import { transportIcon, transportLabel } from "@/lib/transport";
import { SectionTitle } from "@/components/SectionTitle";

type RouteSectionProps = {
  routes: RouteLeg[];
  itinerary: ItineraryDay[];
  activeDay: number | "all";
  onActiveDayChange: (day: number | "all") => void;
};

export function RouteSection({ routes, itinerary, activeDay, onActiveDayChange }: RouteSectionProps) {
  const days = useMemo(() => itinerary.map((d) => d.day), [itinerary]);

  const visibleRoutes = useMemo(() => {
    if (activeDay === "all") return routes;
    const index = days.indexOf(activeDay);
    if (index <= 0) return routes.slice(0, 1);
    return routes.slice(0, index + 1);
  }, [activeDay, days, routes]);

  return (
    <section id="route" className="scroll-mt-40">
      <SectionTitle
        eyebrow="全程路线"
        title="路线"
        description="路线只表达地点间移动：飞机 / 高铁 / 火车 / 地铁 / 公交 / 步行 / 出租车。切换天数可同步地图显示。"
      />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => onActiveDayChange("all")}
          className={`min-h-10 rounded-full border px-3 py-2 text-xs font-medium tracking-wide transition ${
            activeDay === "all"
              ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
              : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
          }`}
        >
          全部
        </button>

        {days.map((day) => {
          const active = day === activeDay;
          return (
            <button
              key={day}
              type="button"
              onClick={() => onActiveDayChange(day)}
              className={`min-h-10 rounded-full border px-3 py-2 text-xs font-medium tracking-wide transition ${
                active
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                  : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              }`}
            >
              第 {String(day).padStart(2, "0")} 天
            </button>
          );
        })}
      </div>

      <div className="rounded-3xl border border-[var(--color-border)] bg-white p-5 md:p-6">
        <div className="space-y-4">
          {visibleRoutes.map((route, idx) => (
            <div key={route.id} className="relative pl-8">
              {idx < visibleRoutes.length - 1 ? (
                <span className="absolute left-[10px] top-8 h-[calc(100%+10px)] w-px bg-[var(--color-soft)]" aria-hidden="true" />
              ) : null}

              <span className="absolute left-0 top-1 inline-grid h-5 w-5 place-items-center rounded-full bg-[var(--color-primary)] text-[10px] text-white">
                {idx + 1}
              </span>

              <div className="flex flex-wrap items-center gap-2 text-sm">
                <strong className="text-[var(--color-text)]">{route.from}</strong>
                <span className="text-[var(--color-primary)]">→</span>
                <strong className="text-[var(--color-text)]">{route.to}</strong>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <span>{transportIcon[route.transport]} {transportLabel[route.transport]}</span>
                <span>· {route.departureTime} - {route.arrivalTime}</span>
                <span>· {route.duration}</span>
                <span>· {route.distance}</span>
              </div>

              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{route.notes}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
