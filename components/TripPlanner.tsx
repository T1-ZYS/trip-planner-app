"use client";

import { useCallback, useMemo } from "react";
import type { Trip } from "@/types/trip";
import type { MapMarkerData } from "@/components/MapView";
import { TripProvider, useTrip } from "@/components/TripProvider";
import { HeroSection } from "@/components/HeroSection";
import { FlightSection } from "@/components/FlightSection";
import { RouteSection } from "@/components/RouteSection";
import { ItinerarySection } from "@/components/ItinerarySection";
import { TodoSection } from "@/components/TodoSection";
import { MapPanel } from "@/components/MapPanel";
import { Footer } from "@/components/Footer";
import { TopNav } from "@/components/TopNav";
import { PlannerEditorSection } from "@/components/PlannerEditorSection";

type TripPlannerProps = {
  trip: Trip;
  amapKey: string;
  amapSecurityJsCode: string;
  googleMapsApiKey: string;
};

function TripContent({ amapKey, amapSecurityJsCode, googleMapsApiKey }: Omit<TripPlannerProps, "trip">) {
  const { trip, activeDay, setActiveDay, selectedLocationId, focusToken, selectLocation, focusLocation, setTodos } = useTrip();

  const activeLocationIds = useMemo(() => {
    const ids = new Set<string>();

    trip.itinerary.forEach((day) => {
      if (activeDay !== "all" && day.day !== activeDay) return;
      day.items.forEach((item) => ids.add(item.locationId));
    });

    trip.routes.forEach((route) => {
      if (route.fromLocationId) ids.add(route.fromLocationId);
      if (route.toLocationId) ids.add(route.toLocationId);
    });

    return ids;
  }, [trip.itinerary, trip.routes, activeDay]);

  const markers = useMemo<MapMarkerData[]>(() => {
    return trip.locations.map((location, index) => ({
      location,
      index: index + 1,
      active: activeDay === "all" ? true : activeLocationIds.has(location.id),
    }));
  }, [trip.locations, activeDay, activeLocationIds]);

  const visibleRoutes = useMemo(() => {
    if (activeDay === "all") return trip.routes;
    return trip.routes.filter((route) => {
      const fromActive = route.fromLocationId ? activeLocationIds.has(route.fromLocationId) : false;
      const toActive = route.toLocationId ? activeLocationIds.has(route.toLocationId) : false;
      return fromActive || toActive;
    });
  }, [trip.routes, activeDay, activeLocationIds]);

  const onSelectLocation = useCallback(
    (locationId: string | null) => {
      selectLocation(locationId);
    },
    [selectLocation],
  );

  const activeDayLabel = activeDay === "all" ? "全部行程" : `第 ${String(activeDay).padStart(2, "0")} 天`;

  return (
    <>
      <TopNav
        tripTitle={trip.basicInfo.title}
        origin={trip.basicInfo.origin}
        destination={trip.basicInfo.destination}
        dateRange={`${trip.basicInfo.startDate} — ${trip.basicInfo.endDate}`}
        days={trip.basicInfo.days}
      />

      <main id="main" className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:space-y-10 md:px-8 md:py-10">
        <HeroSection basicInfo={trip.basicInfo} />

        <FlightSection flights={trip.flights} />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <div className="space-y-8 md:space-y-10">
            <RouteSection
              routes={trip.routes}
              itinerary={trip.itinerary}
              activeDay={activeDay}
              onActiveDayChange={setActiveDay}
            />

            <ItinerarySection
              itinerary={trip.itinerary}
              locations={trip.locations}
              activeDay={activeDay}
              onActiveDayChange={setActiveDay}
              selectedLocationId={selectedLocationId}
              onSelectLocation={focusLocation}
            />
          </div>

          <aside>
            <MapPanel
              amapKey={amapKey}
              amapSecurityJsCode={amapSecurityJsCode}
              apiKey={googleMapsApiKey}
              markers={markers}
              routes={visibleRoutes}
              locations={trip.locations}
              selectedLocationId={selectedLocationId}
              focusToken={focusToken}
              onSelectLocation={onSelectLocation}
              activeDayLabel={activeDayLabel}
            />
          </aside>
        </div>

        <TodoSection todos={trip.todos} onChange={setTodos} />

        <PlannerEditorSection />

        <Footer />
      </main>
    </>
  );
}

export function TripPlanner({ trip, amapKey, amapSecurityJsCode, googleMapsApiKey }: TripPlannerProps) {
  return (
    <TripProvider trip={trip}>
      <TripContent amapKey={amapKey} amapSecurityJsCode={amapSecurityJsCode} googleMapsApiKey={googleMapsApiKey} />
    </TripProvider>
  );
}
