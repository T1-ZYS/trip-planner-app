export type TransportType =
  | "flight"
  | "highSpeedRail"
  | "train"
  | "metro"
  | "bus"
  | "walk"
  | "taxi"
  | "other";

export type BasicInfo = {
  title: string;
  startDate: string;
  endDate: string;
  origin: string;
  destination: string;
  description: string;
  days: number;
};

export type Flight = {
  id: string;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  terminal: string;
  seat: string;
  baggage: string;
  notes: string;
  departureAt?: string;
};

export type LocationType = "city" | "hotel" | "attraction" | "restaurant" | "airport" | "other";

export type Location = {
  id: string;
  name: string;
  type: LocationType;
  address: string;
  latitude: number;
  longitude: number;
  image: string;
  description: string;
  openingHours: string;
  ticketPrice: string;
  notes: string;
};

export type RouteLeg = {
  id: string;
  from: string;
  to: string;
  transport: TransportType;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  distance: string;
  notes: string;
  fromLocationId?: string;
  toLocationId?: string;
};

export type ItineraryItem = {
  id: string;
  time: string;
  locationId: string;
  title: string;
  description: string;
  duration: string;
  transport: TransportType;
  image: string;
  notes: string;
};

export type ItineraryDay = {
  day: number;
  date: string;
  city: string;
  weather: string;
  items: ItineraryItem[];
};

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

export type Trip = {
  basicInfo: BasicInfo;
  flights: Flight[];
  locations: Location[];
  routes: RouteLeg[];
  itinerary: ItineraryDay[];
  todos: Todo[];
};
