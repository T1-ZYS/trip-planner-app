"use client";

import { useMemo } from "react";
import type { ItineraryDay, Location } from "@/types/trip";
import { SectionTitle } from "@/components/SectionTitle";

type ItinerarySectionProps = {
  itinerary: ItineraryDay[];
  locations: Location[];
  activeDay: number | "all";
  onActiveDayChange: (day: number | "all") => void;
  selectedLocationId?: string | null;
  onSelectLocation?: (locationId: string) => void;
};

export function ItinerarySection({
  itinerary,
  locations,
  activeDay,
  onActiveDayChange,
  selectedLocationId,
  onSelectLocation,
}: ItinerarySectionProps) {
  const fallbackDay = itinerary[0]?.day ?? 1;
  const currentDay = activeDay === "all" ? fallbackDay : activeDay;

  const dayData = useMemo(() => itinerary.find((d) => d.day === currentDay), [currentDay, itinerary]);

  const locationMap = useMemo(() => {
    return new Map(locations.map((location) => [location.id, location]));
  }, [locations]);

  return (
    <section id="itinerary" className="scroll-mt-40">
      <SectionTitle
        eyebrow="每日行程"
        title="行程"
        description="以旅行手账节奏组织每日时间线。点击任一地点，地图会同步定位并高亮标记点。"
      />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => onActiveDayChange("all")}
          className={`min-h-10 rounded-full border px-3 py-2 text-xs font-medium tracking-wide transition ${
            activeDay === "all"
              ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
              : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)]"
          }`}
        >
          全部
        </button>

        {itinerary.map((d) => (
          <button
            key={d.day}
            type="button"
            onClick={() => onActiveDayChange(d.day)}
            className={`min-h-10 rounded-full border px-3 py-2 text-xs font-medium tracking-wide transition ${
              d.day === activeDay
                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)]"
            }`}
          >
            第 {String(d.day).padStart(2, "0")} 天
          </button>
        ))}
      </div>

      {dayData ? (
        <div className="rounded-3xl border border-[var(--color-border)] bg-white p-5 md:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-[var(--color-border)] pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">第 {String(dayData.day).padStart(2, "0")} 天</p>
              <h4 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--color-text)]">{dayData.city}</h4>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{dayData.date}</p>
            </div>
            <p className="rounded-full bg-[var(--color-soft)] px-3 py-1 text-sm text-[var(--color-primary)]">{dayData.weather}</p>
          </div>

          <div className="space-y-5">
            {dayData.items.map((item, idx) => {
              const location = locationMap.get(item.locationId);
              const isSelected = Boolean(location && selectedLocationId === location.id);

              return (
                <article
                  key={item.id}
                  data-location-id={item.locationId}
                  onClick={() => {
                    if (item.locationId && onSelectLocation) {
                      onSelectLocation(item.locationId);
                    }
                  }}
                  className={`relative cursor-pointer rounded-2xl pl-8 pr-3 py-3 transition ${
                    isSelected ? "bg-[var(--color-soft)]" : "bg-transparent hover:bg-[var(--color-bg)]"
                  }`}
                >
                  {idx < dayData.items.length - 1 ? (
                    <span className="absolute left-[10px] top-10 h-[calc(100%+10px)] w-px bg-[var(--color-soft)]" aria-hidden="true" />
                  ) : null}

                  <span className="absolute left-0 top-3 inline-grid h-5 w-5 place-items-center rounded-full bg-[var(--color-primary)] text-[10px] text-white">
                    {idx + 1}
                  </span>

                  <p className="text-sm font-semibold text-[var(--color-primary)]">{item.time}</p>
                  <h5 className="mt-1 text-lg font-semibold text-[var(--color-text)]">{item.title}</h5>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{item.description}</p>
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{location?.name ?? "未知地点"} · {location?.address ?? ""}</p>
                </article>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
