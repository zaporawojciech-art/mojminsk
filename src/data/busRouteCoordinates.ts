import { busLines, getCurrentTimetableDay, type LineId } from './mockData';
import { REAL_BUS_STOPS } from './realBusStops';
import { BUS_STREET_ROUTES } from './busStreetRoutes';
import {
  OFFICIAL_TIMETABLES,
  getScheduledTripsForLine,
} from './officialTimetables';

export interface GeoPoint {
  lat: number;
  lon: number;
}

export interface StopGeoInfo {
  name: string;
  lat: number;
  lon: number;
  zone?: string;
  isTransfer?: boolean;
}

// Baza dokładnych współrzędnych przystanków ZDiTM w Mińsku Mazowieckim
export const BUS_STOPS_GEO: Record<string, GeoPoint> = {
  // Linia M1 & Centrum
  'Plac Dworcowy': { lat: 52.17654, lon: 21.55398 },
  'Kazikowskiego': { lat: 52.179655, lon: 21.560556 },
  'Konstytucji 3 Maja': { lat: 52.18252, lon: 21.55615 },
  'Warszawska': { lat: 52.186687, lon: 21.543835 },
  'Stojadła Handlowa': { lat: 52.1915, lon: 21.5332 },
  'Stojadła Pętla': { lat: 52.1952, lon: 21.5245 },

  // Linia M2 & Serbinów
  'Piękna': { lat: 52.176947, lon: 21.549884 },
  'Licealna': { lat: 52.179486, lon: 21.548827 },
  'Tartaczna': { lat: 52.181193, lon: 21.549632 },
  'Urząd Miasta': { lat: 52.180998, lon: 21.559419 },
  'Mireckiego': { lat: 52.176664, lon: 21.566793 },
  'Chemik': { lat: 52.1752, lon: 21.57263 },
  'Szpital': { lat: 52.174221, lon: 21.578786 },
  'Cmentarz Żydowski': { lat: 52.173201, lon: 21.584188 },
  'Serbinów': { lat: 52.177354, lon: 21.588721 },

  // Linia M3
  'Rondo Żołnierzy Wyklętych': { lat: 52.188071, lon: 21.542577 },
  'Warszawskie Przedmieście': { lat: 52.188565, lon: 21.5444 },
  'Sienkiewicza': { lat: 52.186549, lon: 21.55225 },
  'Kościuszki': { lat: 52.18162, lon: 21.5587 },
  'Szpitalna': { lat: 52.173555, lon: 21.570236 },
  'Spacerowa': { lat: 52.165884, lon: 21.568127 },
  'Klonowa Osiedle': { lat: 52.166099, lon: 21.571904 },
  'FUD': { lat: 52.173806, lon: 21.557942 },
  'Osiedlowa': { lat: 52.165211, lon: 21.52465 },
  'Szkoła Podstawowa nr 6 20': { lat: 52.175008, lon: 21.554149 },
  'Szkoła Podstawowa nr 6 19': { lat: 52.175115, lon: 21.554312 },
  'Szkoła Podstawowa nr 6': { lat: 52.175008, lon: 21.554149 },
  'Mechanik': { lat: 52.1722, lon: 21.5512 },
  'Widok': { lat: 52.1734, lon: 21.5528 },
  'Rudzkiego': { lat: 52.1745, lon: 21.5601 },
  'Dźwigowa': { lat: 52.1731, lon: 21.5632 },
  'Łąkowa': { lat: 52.1718, lon: 21.5654 },
  'Langiewicza': { lat: 52.1695, lon: 21.5672 },
  'Klonowa 45': { lat: 52.1672, lon: 21.5735 },
  'Śniadeckich': { lat: 52.1748, lon: 21.5715 },
  'Przedszkole Miejskie nr 5': { lat: 52.1795, lon: 21.5622 },
  '11 Listopada': { lat: 52.1822, lon: 21.5558 },
  'Targowisko': { lat: 52.1848, lon: 21.5539 },

  // Linia M4
  'Urząd Skarbowy': { lat: 52.183616, lon: 21.562263 },
  'Chełmońskiego': { lat: 52.184311, lon: 21.568304 },
  'Kościelna': { lat: 52.180858, lon: 21.573843 },
  'Dąbrówki': { lat: 52.17514, lon: 21.58153 },
  'PKP Anielina': { lat: 52.16864, lon: 21.586307 },
  'Sosnkowskiego': { lat: 52.1685, lon: 21.5621 },
};

/**
 * Zwraca precyzyjne współrzędne GPS przystanku (ze słupka lub bazy realBusStops)
 */
export function getStopCoordinates(stopName: string): [number, number] {
  if (BUS_STOPS_GEO[stopName]) {
    return [BUS_STOPS_GEO[stopName].lat, BUS_STOPS_GEO[stopName].lon];
  }

  const clean = stopName.replace(/\s+\d+$/, '').trim().toLowerCase();
  const found = REAL_BUS_STOPS.find(
    (s) =>
      s.name.toLowerCase() === clean ||
      s.name.toLowerCase().includes(clean) ||
      clean.includes(s.name.toLowerCase()) ||
      s.fullName.toLowerCase().includes(stopName.toLowerCase())
  );
  if (found) {
    return [found.lat, found.lon];
  }

  // Centrum Mińska Mazowieckiego jako bezpieczny fallback
  return [52.1793, 21.5658];
}

/**
 * Pobiera pełną polilinię trasy po siatce ulic dla danej linii i kierunku
 */
export function getLineRouteCoordinates(lineId: LineId, directionIdx: 0 | 1 = 0): [number, number][] {
  const streetData = BUS_STREET_ROUTES[lineId];
  if (streetData) {
    return directionIdx === 1 ? streetData.backward : streetData.forward;
  }
  const line = busLines.find((l) => l.id === lineId) || busLines[0];
  const stops = directionIdx === 1 ? [...line.stops].reverse() : line.stops;
  return stops.map((stopName) => getStopCoordinates(stopName));
}

// Odległość w linii prostej (haversine) w metrach
function haversineDistanceMeters(p1: [number, number], p2: [number, number]): number {
  const R = 6371e3;
  const phi1 = (p1[0] * Math.PI) / 180;
  const phi2 = (p2[0] * Math.PI) / 180;
  const deltaPhi = ((p2[0] - p1[0]) * Math.PI) / 180;
  const deltaLambda = ((p2[1] - p1[1]) * Math.PI) / 180;
  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Wyznacza kąt kierunku (bearing) w stopniach 0..360
export function calculateBearing(p1: [number, number], p2: [number, number]): number {
  const lat1 = (p1[0] * Math.PI) / 180;
  const lat2 = (p2[0] * Math.PI) / 180;
  const dLon = ((p2[1] - p1[1]) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

// Interpolacja wzdłuż odcinka drogi na podstawie fizycznej odległości
function interpolateAlongRoadPoints(points: [number, number][], fraction: number): { position: [number, number]; bearing: number } {
  if (points.length === 0) return { position: [52.1793, 21.5658], bearing: 0 };
  if (points.length === 1 || fraction <= 0) return { position: points[0], bearing: 0 };
  if (fraction >= 1) {
    const last = points[points.length - 1];
    const prev = points[points.length - 2] || last;
    return { position: last, bearing: calculateBearing(prev, last) };
  }

  // Obliczenie sumarycznych odległości
  const distances: number[] = [0];
  let totalDist = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const d = haversineDistanceMeters(points[i], points[i + 1]);
    totalDist += d;
    distances.push(totalDist);
  }

  if (totalDist === 0) return { position: points[0], bearing: 0 };

  const targetDist = totalDist * fraction;
  for (let i = 0; i < distances.length - 1; i++) {
    if (targetDist >= distances[i] && targetDist <= distances[i + 1]) {
      const segLen = distances[i + 1] - distances[i];
      const segFraction = segLen > 0 ? (targetDist - distances[i]) / segLen : 0;
      const p1 = points[i];
      const p2 = points[i + 1];
      const pos: [number, number] = [
        Number((p1[0] + (p2[0] - p1[0]) * segFraction).toFixed(6)),
        Number((p1[1] + (p2[1] - p1[1]) * segFraction).toFixed(6)),
      ];
      const bearing = calculateBearing(p1, p2);
      return { position: pos, bearing };
    }
  }

  const last = points[points.length - 1];
  return { position: last, bearing: 0 };
}

// Znajduje wycinek polilinii drogi między dwoma punktami przystankowymi
function extractRoadSubsegment(
  roadCoords: [number, number][],
  stopACoord: [number, number],
  stopBCoord: [number, number],
): [number, number][] {
  if (roadCoords.length < 2) return [stopACoord, stopBCoord];

  let nearestIdxA = 0;
  let minDistA = Infinity;
  let nearestIdxB = roadCoords.length - 1;
  let minDistB = Infinity;

  for (let i = 0; i < roadCoords.length; i++) {
    const dA = haversineDistanceMeters(roadCoords[i], stopACoord);
    if (dA < minDistA) {
      minDistA = dA;
      nearestIdxA = i;
    }
    const dB = haversineDistanceMeters(roadCoords[i], stopBCoord);
    if (dB < minDistB) {
      minDistB = dB;
      nearestIdxB = i;
    }
  }

  if (nearestIdxA < nearestIdxB) {
    const sub = roadCoords.slice(nearestIdxA, nearestIdxB + 1);
    return [stopACoord, ...sub, stopBCoord];
  } else if (nearestIdxA > nearestIdxB) {
    const sub = roadCoords.slice(nearestIdxB, nearestIdxA + 1).reverse();
    return [stopACoord, ...sub, stopBCoord];
  }

  return [stopACoord, stopBCoord];
}

export interface ActiveBusEstimate {
  id: string; // Identyfikator konkretnego kursu
  tripId: string;
  lineId: LineId;
  directionIdx: 0 | 1;
  isActive: boolean;
  position: [number, number];
  bearing: number;
  prevStop: string;
  nextStop: string;
  departureTime: string;
  destination: string;
  directionName: string;
  minutesToNextStop: number;
  progressPercent: number;
  isAtStop: boolean;
  statusLabel: string;
}

/**
 * Wyznacza wszystkie autobusy aktualnie będące w trasie dla danej linii
 * na podstawie oficjalnego rozkładu jazdy ZDiTM (PDF), minut i sekund zegara,
 * uwzględniając postoje na przystankach (15-25s), prędkość miejską i godziny szczytu.
 */
export function getActiveBuses(
  lineId: LineId,
  directionIdx?: 0 | 1,
  referenceDate: Date = new Date(),
): ActiveBusEstimate[] {
  const currentDay = getCurrentTimetableDay();
  const trips = getScheduledTripsForLine(lineId, currentDay, directionIdx);
  const lineOfficial = OFFICIAL_TIMETABLES[lineId];
  if (!lineOfficial || trips.length === 0) return [];

  const currentMinutes = referenceDate.getHours() * 60 + referenceDate.getMinutes();
  const currentSeconds = referenceDate.getSeconds();
  const exactCurrentMinutes = currentMinutes + currentSeconds / 60;

  // Sprawdzenie godzin szczytu w Mińsku Mazowieckim:
  // Ranny: 07:00 - 08:45 | Popołudniowy: 15:00 - 17:15
  const isMorningPeak = exactCurrentMinutes >= 7 * 60 && exactCurrentMinutes <= 8 * 60 + 45;
  const isAfternoonPeak = exactCurrentMinutes >= 15 * 60 && exactCurrentMinutes <= 17 * 60 + 15;
  const isPeakHour = isMorningPeak || isAfternoonPeak;

  // Długość postoju na przystanku (wymiana pasażerów): 20 sekund = 0.33 minuty
  const DWELL_MINUTES = 20 / 60;

  const activeBuses: ActiveBusEstimate[] = [];

  for (const trip of trips) {
    const startMin = trip.startTimeMinutes;
    const endMin = trip.endTimeMinutes;

    // Kurs jest aktywny od startu do końca trasy + 1 min bufora na pętli
    if (exactCurrentMinutes < startMin || exactCurrentMinutes > endMin + 1.2) {
      continue;
    }

    const dirData = lineOfficial.directions[trip.directionIdx];
    const fullRoadCoords = getLineRouteCoordinates(lineId, trip.directionIdx);

    // Znajdź segment między którymi przystankami znajduje się autobus
    let hopIndex = 0;
    for (let i = 0; i < trip.stops.length - 1; i++) {
      if (exactCurrentMinutes >= trip.stops[i].timeMinutes && exactCurrentMinutes <= trip.stops[i + 1].timeMinutes) {
        hopIndex = i;
        break;
      }
      if (i === trip.stops.length - 2 && exactCurrentMinutes > trip.stops[i + 1].timeMinutes) {
        hopIndex = i;
      }
    }

    const stopA = trip.stops[hopIndex];
    const stopB = trip.stops[Math.min(trip.stops.length - 1, hopIndex + 1)];

    const timeA = stopA.timeMinutes;
    const timeB = Math.max(timeA + 1, stopB.timeMinutes); // minimalny interwał 1 min
    const scheduledHopDuration = timeB - timeA;

    const stopACoord = getStopCoordinates(stopA.stopName);
    const stopBCoord = getStopCoordinates(stopB.stopName);

    let isAtStop = false;
    let busPosition: [number, number] = stopACoord;
    let busBearing = 0;
    let minutesToNext = Math.max(1, Math.round(timeB - exactCurrentMinutes));

    // Faza 1: Postój na przystanku A (pierwsze 20s po planowym odjeździe / wymiana pasażerów)
    const elapsedSinceA = exactCurrentMinutes - timeA;
    if (elapsedSinceA <= DWELL_MINUTES) {
      isAtStop = true;
      busPosition = stopACoord;
      busBearing = calculateBearing(stopACoord, stopBCoord);
    } else {
      // Faza 2: Autobus jedzie do przystanku B
      const drivingTimeTotal = Math.max(0.3, scheduledHopDuration - DWELL_MINUTES);
      const drivingTimeElapsed = elapsedSinceA - DWELL_MINUTES;
      let rawFraction = Math.min(1, Math.max(0, drivingTimeElapsed / drivingTimeTotal));

      // Współczynnik spowolnienia w godzinach szczytu na newralgicznych ulicach
      if (isPeakHour) {
        const congestedStreets = ['warszawsk', 'sosnkowsk', 'kościuszk', 'kazikowsk', 'dk92', 'dworcowy'];
        const isCongested = congestedStreets.some(
          (k) => stopA.stopName.toLowerCase().includes(k) || stopB.stopName.toLowerCase().includes(k)
        );
        if (isCongested) {
          // Łagodne opóźnienie szczytowe (ruch miejski)
          rawFraction = Math.pow(rawFraction, 1.15);
        }
      }

      // Płynna krzywa przyspieszania i hamowania (Smooth-Step: 3x^2 - 2x^3)
      const smoothFraction = rawFraction * rawFraction * (3 - 2 * rawFraction);

      // Wycięcie punktów drogi i wyznaczenie pozycji wzdłuż geometrii ulic
      const roadSubsegment = extractRoadSubsegment(fullRoadCoords, stopACoord, stopBCoord);
      const interpolation = interpolateAlongRoadPoints(roadSubsegment, smoothFraction);
      busPosition = interpolation.position;
      busBearing = interpolation.bearing;
    }

    const tripDuration = Math.max(1, endMin - startMin);
    const progressPercent = Math.min(100, Math.max(0, Math.round(((exactCurrentMinutes - startMin) / tripDuration) * 100)));

    const statusLabel = isAtStop
      ? `Na przystanku: ${stopA.stopName}`
      : `W trasie do: ${stopB.stopName} (~${minutesToNext} min)`;

    activeBuses.push({
      id: trip.id,
      tripId: trip.id,
      lineId,
      directionIdx: trip.directionIdx,
      isActive: true,
      position: busPosition,
      bearing: busBearing,
      prevStop: stopA.stopName,
      nextStop: stopB.stopName,
      departureTime: trip.startTime,
      destination: dirData.destination,
      directionName: dirData.name,
      minutesToNextStop: minutesToNext,
      progressPercent,
      isAtStop,
      statusLabel,
    });
  }

  return activeBuses;
}

/**
 * Zwraca reprezentację pierwszego autobusu na linii (dla wstecznej kompatybilności widoków)
 * lub podgląd najbliższego zaplanowanego kursu jeśli żaden autobus nie jest aktualnie w trasie.
 */
export function getActiveBusEstimate(
  lineId: LineId,
  directionIdx: 0 | 1 = 0,
  referenceDate: Date = new Date(),
): ActiveBusEstimate {
  const activeBuses = getActiveBuses(lineId, directionIdx, referenceDate);
  if (activeBuses.length > 0) {
    return activeBuses[0];
  }

  // Brak aktywnego autobusu w danej minucie - znajdź najbliższy odjazd z oficjalnego rozkładu
  const currentDay = getCurrentTimetableDay();
  const trips = getScheduledTripsForLine(lineId, currentDay, directionIdx);
  const lineOfficial = OFFICIAL_TIMETABLES[lineId];
  const dirData = lineOfficial ? lineOfficial.directions[directionIdx] : null;

  const currentMinutes = referenceDate.getHours() * 60 + referenceDate.getMinutes();
  let nextTrip = trips.find((t) => t.startTimeMinutes > currentMinutes);
  if (!nextTrip && trips.length > 0) {
    nextTrip = trips[0]; // Pierwszy kurs jutro
  }

  const firstStopName = dirData?.stops[0] || 'Plac Dworcowy';
  const secondStopName = dirData?.stops[1] || 'Następny przystanek';
  const startPos = getStopCoordinates(firstStopName);

  if (!nextTrip) {
    return {
      id: 'none',
      tripId: 'none',
      lineId,
      directionIdx,
      isActive: false,
      position: startPos,
      bearing: 0,
      prevStop: firstStopName,
      nextStop: secondStopName,
      departureTime: '06:00',
      destination: dirData?.destination || 'Mińsk Mazowiecki',
      directionName: dirData?.name || 'Kierunek',
      minutesToNextStop: 30,
      progressPercent: 0,
      isAtStop: true,
      statusLabel: 'Koniec kursowania na dziś',
    };
  }

  const isTomorrow = nextTrip.startTimeMinutes < currentMinutes;
  const waitMin = !isTomorrow
    ? nextTrip.startTimeMinutes - currentMinutes
    : nextTrip.startTimeMinutes + 1440 - currentMinutes;

  let statusLabel: string;
  if (isTomorrow) {
    statusLabel = `Jutro o ${nextTrip.startTime}`;
  } else if (waitMin <= 1) {
    statusLabel = `Odjazd za chwilę (o ${nextTrip.startTime})`;
  } else if (waitMin <= 60) {
    statusLabel = `Odjazd o ${nextTrip.startTime} (za ${waitMin} min)`;
  } else {
    statusLabel = `Odjazd o ${nextTrip.startTime}`;
  }

  return {
    id: nextTrip.id,
    tripId: nextTrip.id,
    lineId,
    directionIdx,
    isActive: false,
    position: startPos,
    bearing: 0,
    prevStop: firstStopName,
    nextStop: secondStopName,
    departureTime: nextTrip.startTime,
    destination: dirData?.destination || 'Mińsk Mazowiecki',
    directionName: dirData?.name || 'Kierunek',
    minutesToNextStop: waitMin,
    progressPercent: 0,
    isAtStop: true,
    statusLabel,
  };
}
