"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { BasicInfo, ItineraryDay, ItineraryItem, Location, RouteLeg, Todo, Trip } from "@/types/trip";

const TRIP_STORAGE_KEY = "trip-planner-app:v2:trip";

type TripContextValue = {
  trip: Trip;
  activeDay: number | "all";
  setActiveDay: (day: number | "all") => void;
  selectedLocationId: string | null;
  focusToken: number;
  selectLocation: (locationId: string | null) => void;
  focusLocation: (locationId: string) => void;
  resetTrip: () => void;
  updateBasicInfo: (patch: Partial<BasicInfo>) => void;
  setTodos: (todos: Todo[]) => void;
  upsertLocation: (location: Location) => void;
  deleteLocation: (locationId: string) => void;
  upsertRoute: (route: RouteLeg) => void;
  deleteRoute: (routeId: string) => void;
  addItineraryDay: () => void;
  updateItineraryDay: (day: number, patch: Partial<Pick<ItineraryDay, "date" | "city" | "weather">>) => void;
  deleteItineraryDay: (day: number) => void;
  upsertItineraryItem: (day: number, item: ItineraryItem) => void;
  deleteItineraryItem: (day: number, itemId: string) => void;
};

const TripContext = createContext<TripContextValue | null>(null);

function safeParseTrip(raw: string | null): Trip | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.basicInfo || !Array.isArray(parsed.locations) || !Array.isArray(parsed.itinerary)) return null;
    return parsed as Trip;
  } catch {
    return null;
  }
}

function normalizeItineraryDays(itinerary: ItineraryDay[]): ItineraryDay[] {
  return itinerary
    .slice()
    .sort((a, b) => a.day - b.day)
    .map((day, index) => ({ ...day, day: index + 1 }));
}

function syncTripDays(trip: Trip): Trip {
  const itinerary = normalizeItineraryDays(trip.itinerary);
  return {
    ...trip,
    itinerary,
    basicInfo: {
      ...trip.basicInfo,
      days: itinerary.length,
    },
  };
}

function createDefaultDay(day: number): ItineraryDay {
  return {
    day,
    date: `第 ${day} 天`,
    city: "待定",
    weather: "待定",
    items: [],
  };
}

function createInitialTrip(defaultTrip: Trip): Trip {
  if (typeof window === "undefined") return defaultTrip;
  const cached = safeParseTrip(window.localStorage.getItem(TRIP_STORAGE_KEY));
  return cached ? syncTripDays(cached) : syncTripDays(defaultTrip);
}

export function TripProvider({ trip: initialTrip, children }: { trip: Trip; children: React.ReactNode }) {
  const [trip, setTrip] = useState<Trip>(() => createInitialTrip(initialTrip));
  const [activeDay, setActiveDay] = useState<number | "all">("all");
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [focusToken, setFocusToken] = useState(0);

  const persistTrip = useCallback((nextTrip: Trip) => {
    setTrip(nextTrip);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify(nextTrip));
    }
  }, []);

  const updateTrip = useCallback(
    (updater: (prev: Trip) => Trip) => {
      setTrip((prev) => {
        const next = syncTripDays(updater(prev));
        if (typeof window !== "undefined") {
          window.localStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify(next));
        }
        return next;
      });
    },
    [],
  );

  const resetTrip = useCallback(() => {
    const next = syncTripDays(initialTrip);
    persistTrip(next);
    setActiveDay("all");
    setSelectedLocationId(null);
    setFocusToken((token) => token + 1);
  }, [initialTrip, persistTrip]);

  const selectLocation = useCallback((locationId: string | null) => {
    setFocusToken((token) => token + 1);
    setSelectedLocationId(locationId);
  }, []);

  const focusLocation = useCallback((locationId: string) => {
    setFocusToken((token) => token + 1);
    setSelectedLocationId(locationId);

    if (typeof document !== "undefined") {
      const target = document.querySelector(`[data-location-id="${locationId}"]`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, []);

  const updateBasicInfo = useCallback(
    (patch: Partial<BasicInfo>) => {
      updateTrip((prev) => ({
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          ...patch,
        },
      }));
    },
    [updateTrip],
  );

  const setTodos = useCallback(
    (todos: Todo[]) => {
      updateTrip((prev) => ({ ...prev, todos }));
    },
    [updateTrip],
  );

  const upsertLocation = useCallback(
    (location: Location) => {
      updateTrip((prev) => {
        const exists = prev.locations.some((item) => item.id === location.id);
        const nextLocations = exists
          ? prev.locations.map((item) => (item.id === location.id ? location : item))
          : [...prev.locations, location];
        return { ...prev, locations: nextLocations };
      });
    },
    [updateTrip],
  );

  const deleteLocation = useCallback(
    (locationId: string) => {
      updateTrip((prev) => ({
        ...prev,
        locations: prev.locations.filter((item) => item.id !== locationId),
        routes: prev.routes.map((route) => ({
          ...route,
          fromLocationId: route.fromLocationId === locationId ? undefined : route.fromLocationId,
          toLocationId: route.toLocationId === locationId ? undefined : route.toLocationId,
        })),
        itinerary: prev.itinerary.map((day) => ({
          ...day,
          items: day.items.filter((item) => item.locationId !== locationId),
        })),
      }));

      setSelectedLocationId((prev) => (prev === locationId ? null : prev));
      setFocusToken((token) => token + 1);
    },
    [updateTrip],
  );

  const upsertRoute = useCallback(
    (route: RouteLeg) => {
      updateTrip((prev) => {
        const exists = prev.routes.some((item) => item.id === route.id);
        const routes = exists
          ? prev.routes.map((item) => (item.id === route.id ? route : item))
          : [...prev.routes, route];
        return { ...prev, routes };
      });
    },
    [updateTrip],
  );

  const deleteRoute = useCallback(
    (routeId: string) => {
      updateTrip((prev) => ({
        ...prev,
        routes: prev.routes.filter((item) => item.id !== routeId),
      }));
    },
    [updateTrip],
  );

  const addItineraryDay = useCallback(() => {
    updateTrip((prev) => {
      const nextDay = prev.itinerary.length + 1;
      return {
        ...prev,
        itinerary: [...prev.itinerary, createDefaultDay(nextDay)],
      };
    });
  }, [updateTrip]);

  const updateItineraryDay = useCallback(
    (day: number, patch: Partial<Pick<ItineraryDay, "date" | "city" | "weather">>) => {
      updateTrip((prev) => ({
        ...prev,
        itinerary: prev.itinerary.map((item) => (item.day === day ? { ...item, ...patch } : item)),
      }));
    },
    [updateTrip],
  );

  const deleteItineraryDay = useCallback(
    (day: number) => {
      updateTrip((prev) => ({
        ...prev,
        itinerary: prev.itinerary.filter((item) => item.day !== day),
      }));

      setActiveDay((prev) => {
        if (prev === "all") return prev;
        return prev === day ? "all" : prev;
      });
    },
    [updateTrip],
  );

  const upsertItineraryItem = useCallback(
    (day: number, item: ItineraryItem) => {
      updateTrip((prev) => {
        const itinerary = prev.itinerary.map((entry) => {
          if (entry.day !== day) return entry;
          const exists = entry.items.some((x) => x.id === item.id);
          const items = exists ? entry.items.map((x) => (x.id === item.id ? item : x)) : [...entry.items, item];
          return { ...entry, items };
        });
        return { ...prev, itinerary };
      });
    },
    [updateTrip],
  );

  const deleteItineraryItem = useCallback(
    (day: number, itemId: string) => {
      updateTrip((prev) => ({
        ...prev,
        itinerary: prev.itinerary.map((entry) =>
          entry.day === day ? { ...entry, items: entry.items.filter((item) => item.id !== itemId) } : entry,
        ),
      }));
    },
    [updateTrip],
  );

  const value = useMemo(
    () => ({
      trip,
      activeDay,
      setActiveDay,
      selectedLocationId,
      focusToken,
      selectLocation,
      focusLocation,
      resetTrip,
      updateBasicInfo,
      setTodos,
      upsertLocation,
      deleteLocation,
      upsertRoute,
      deleteRoute,
      addItineraryDay,
      updateItineraryDay,
      deleteItineraryDay,
      upsertItineraryItem,
      deleteItineraryItem,
    }),
    [
      trip,
      activeDay,
      selectedLocationId,
      focusToken,
      selectLocation,
      focusLocation,
      resetTrip,
      updateBasicInfo,
      setTodos,
      upsertLocation,
      deleteLocation,
      upsertRoute,
      deleteRoute,
      addItineraryDay,
      updateItineraryDay,
      deleteItineraryDay,
      upsertItineraryItem,
      deleteItineraryItem,
    ],
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip(): TripContextValue {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error("useTrip must be used within TripProvider");
  }
  return context;
}
