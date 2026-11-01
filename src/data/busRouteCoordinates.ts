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
// Pobierana bezpośrednio z oficjalnego rejestru REAL_BUS_STOPS
export const BUS_STOPS_GEO: Record<string, GeoPoint> = {};

/**
 * Zwraca precyzyjne współrzędne GPS przystanku (ze słupka lub bazy realBusStops)
 */
export function getStopCoordinates(stopName: string): [number, number] {
  // 1. Dopasowanie po dokładnej pełnej nazwie ze słupkiem (np. "11 Listopada 02", "PLAC DWORCOWY 01")
  const exact = REAL_BUS_STOPS.find(
    (s) => s.fullName.toLowerCase() === stopName.toLowerCase()
  );
  if (exact) {
    return [exact.lat, exact.lon];
  }

  // 2. Dopasowanie po nazwie bazowej i słupku
  const refMatch = stopName.match(/\s+(\d+)$/);
  const ref = refMatch ? refMatch[1] : null;
  const cleanName = stopName.replace(/\s+\d+$/, '').trim().toLowerCase();

  if (ref) {
    const withRef = REAL_BUS_STOPS.find(
      (s) => s.name.toLowerCase() === cleanName && s.ref === ref
    );
    if (withRef) {
      return [withRef.lat, withRef.lon];
    }
  }

  // 3. Dopasowanie po samej nazwie bazowej
  const foundByName = REAL_BUS_STOPS.find(
    (s) => s.name.toLowerCase() === cleanName
  );
  if (foundByName) {
    return [foundByName.lat, foundByName.lon];
  }

  // 4. Bezpieczny fallback do centrum Mińska Mazowieckiego
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
    const streetData = BUS_STREET_ROUTES[lineId];
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

      // Pobranie geometrii drogi bezpośrednio z segmentu międzreprzystankowego (HopSegment)
      const hops = trip.directionIdx === 1 ? streetData?.hopsBackward : streetData?.hopsForward;
      const hopCoords =
        hops && hops[hopIndex] && hops[hopIndex].coords && hops[hopIndex].coords.length >= 2
          ? hops[hopIndex].coords
          : extractRoadSubsegment(fullRoadCoords, stopACoord, stopBCoord);

      const interpolation = interpolateAlongRoadPoints(hopCoords, smoothFraction);
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
