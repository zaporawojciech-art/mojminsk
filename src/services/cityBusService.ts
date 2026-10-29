/**
 * Serwis Komunikacji Miejskiej w Mińsku Mazowieckim
 * Źródło danych: Oficjalny system Trapeze (Linie miejskie M1, M2, M3, M4)
 * Proxy backendowe: Supabase Edge Function `trapeze-proxy` (CORS + in-memory cache)
 */

export interface BusStop {
  id: string;
  altId: string;
  name: string;
  lat: number;
  lon: number;
  distanceKm?: number;
}

export interface BusDeparture {
  id: string;
  time: string;
  line: string;
  destination: string;
  minutesTo?: number;
  isSoon?: boolean;
}

export interface StopDeparturesResult {
  stopId: string;
  stopName: string;
  lat: number | null;
  lon: number | null;
  departures: BusDeparture[];
  updatedAt: string;
}

export interface LiveVehicle {
  id: string;
  line: string;
  lat: number;
  lon: number;
  bearing: number;
  depid: number;
  type: string;
}

export interface PassingTimesResult {
  depId: string;
  situation: string;
  schedule: string;
  direction: string;
  stops: Array<{ station: string; time: string }>;
  updatedAt: string;
}

const EDGE_PROXY_URL = 'https://jqortivwlvsjuiiexvro.supabase.co/functions/v1/trapeze-proxy';
const STOPS_STORAGE_KEY = 'mojminsk_bus_stops_cache_v1';

let inMemoryStops: BusStop[] | null = null;

/**
 * Oblicza ile minut pozostało do planowanego odjazdu (np. "22:18")
 */
export function calculateMinutesToDeparture(timeStr: string): number {
  const [hoursStr, minutesStr] = timeStr.split(':');
  const depH = parseInt(hoursStr, 10);
  const depM = parseInt(minutesStr, 10);
  if (isNaN(depH) || isNaN(depM)) return 0;

  const now = new Date();
  const depDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), depH, depM, 0);

  // Jeśli godzina odjazdu jest mniejsza niż obecna o więcej niż 6 godzin (np. odjazd 05:05 a jest 23:00)
  if (depDate.getTime() < now.getTime() - 1000 * 60 * 30) {
    depDate.setDate(depDate.getDate() + 1);
  }

  const diffMs = depDate.getTime() - now.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60)));
}

/**
 * Odległość geograficzna (formuła Haversine) w kilometrach
 */
export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Pobiera listę wszystkich 118 przystanków miejskich
 */
export async function fetchBusStops(): Promise<BusStop[]> {
  if (inMemoryStops && inMemoryStops.length > 0) {
    return inMemoryStops;
  }

  // Sprawdź LocalStorage
  try {
    const cached = localStorage.getItem(STOPS_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryStops = parsed;
      }
    }
  } catch {
    // ignore
  }

  try {
    const res = await fetch(`${EDGE_PROXY_URL}?action=stops`);
    if (!res.ok) {
      throw new Error(`Błąd pobierania przystanków: ${res.status}`);
    }
    const stops: BusStop[] = await res.json();
    if (Array.isArray(stops) && stops.length > 0) {
      inMemoryStops = stops;
      try {
        localStorage.setItem(STOPS_STORAGE_KEY, JSON.stringify(stops));
      } catch {
        // ignore
      }
      return stops;
    }
  } catch (err) {
    console.warn('[cityBusService] Nie udało się pobrać świeżych przystanków, używam cache:', err);
  }

  return inMemoryStops || [];
}

/**
 * Pobiera odjazdy na żywo z danego przystanku
 */
export async function fetchStopDepartures(stopId: string): Promise<StopDeparturesResult> {
  const res = await fetch(`${EDGE_PROXY_URL}?action=departures&stopId=${encodeURIComponent(stopId)}`);
  if (!res.ok) {
    throw new Error(`Błąd odjazdów z przystanku: ${res.status}`);
  }
  const data: StopDeparturesResult = await res.json();

  // Wzbogać odjazdy o wyliczone minuty
  const enriched = data.departures.map((d) => {
    const minutesTo = calculateMinutesToDeparture(d.time);
    return {
      ...d,
      minutesTo,
      isSoon: minutesTo <= 15,
    };
  });

  return {
    ...data,
    departures: enriched,
  };
}

/**
 * Pobiera pozycje autobusów na żywo
 */
export async function fetchLiveVehicles(): Promise<LiveVehicle[]> {
  try {
    const res = await fetch(`${EDGE_PROXY_URL}?action=vehicles`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/**
 * Pobiera sytuację i kolejne przystanki dla konkretnego kursu (opóźnienie GPS)
 */
export async function fetchPassingTimes(depId: string): Promise<PassingTimesResult | null> {
  try {
    const res = await fetch(`${EDGE_PROXY_URL}?action=passingtimes&id=${encodeURIComponent(depId)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Wyszukuje najbliższe przystanki na podstawie współrzędnych
 */
export function findNearestStops(stops: BusStop[], userLat: number, userLon: number, limit = 5): BusStop[] {
  return stops
    .map((stop) => ({
      ...stop,
      distanceKm: getDistanceKm(userLat, userLon, stop.lat, stop.lon),
    }))
    .sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))
    .slice(0, limit);
}
