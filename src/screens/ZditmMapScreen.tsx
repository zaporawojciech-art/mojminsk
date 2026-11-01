import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ArrowLeft,
  ArrowRightLeft,
  Bus,
  Clock,
  Compass,
  Crosshair,
  List,
  MapPin,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { cn } from '../components/ui';
import {
  busLines,
  getCurrentTimetableDay,
  getNextScheduledBus,
  getOfficialStopTimetable,
  type LineId,
} from '../data/mockData';
import {
  getLineRouteCoordinates,
  getActiveBusEstimate,
  getActiveBuses,
  getStopCoordinates,
  type ActiveBusEstimate,
} from '../data/busRouteCoordinates';
import {
  getStopDetails,
  searchRealBusStops,
  type RealBusStop,
} from '../data/realBusStops';
import { buildZditmMapUrl } from '../router/urlUtils';

interface ZditmMapScreenProps {
  onBack: () => void;
  initialLine?: LineId;
  initialStopName?: string;
  onOpenTimetable?: (lineId: LineId, stopName?: string) => void;
  onLineChange?: (lineId: LineId) => void;
  onStopChange?: (lineId: LineId, stopName: string | null) => void;
  isClosing?: boolean;
}

const LINE_THEME: Record<
  LineId,
  { name: string; color: string; bgLight: string; text: string; activePill: string }
> = {
  M1: {
    name: 'Linia M1',
    color: '#10B981',
    bgLight: 'bg-emerald-500/10',
    text: 'text-emerald-700',
    activePill: 'bg-emerald-600 text-white',
  },
  M2: {
    name: 'Linia M2',
    color: '#0284C7',
    bgLight: 'bg-sky-500/10',
    text: 'text-sky-700',
    activePill: 'bg-sky-600 text-white',
  },
  M3: {
    name: 'Linia M3',
    color: '#D97706',
    bgLight: 'bg-amber-500/10',
    text: 'text-amber-800',
    activePill: 'bg-amber-600 text-white',
  },
  M4: {
    name: 'Linia M4',
    color: '#FF6B4A',
    bgLight: 'bg-coral-500/10',
    text: 'text-coral-800',
    activePill: 'bg-coral-600 text-white',
  },
};

export function ZditmMapScreen({
  onBack,
  initialLine = 'M2',
  initialStopName,
  onOpenTimetable,
  onLineChange,
  onStopChange,
  isClosing = false,
}: ZditmMapScreenProps) {
  const [selectedLineId, setSelectedLineId] = useState<LineId>(initialLine);
  const [directionIdx, setDirectionIdx] = useState<0 | 1>(0);
  const [selectedStopName, setSelectedStopName] = useState<string | null>(initialStopName || null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Synchronizacja URL i stanu przy zmianie linii
  const handleSelectLine = useCallback(
    (lineId: LineId) => {
      setSelectedLineId(lineId);
      setSelectedStopName(null);
      onLineChange?.(lineId);
      onStopChange?.(lineId, null);
      const targetUrl = buildZditmMapUrl(lineId);
      if (typeof window !== 'undefined' && window.location.pathname !== targetUrl) {
        window.history.replaceState({}, '', targetUrl);
      }
    },
    [onLineChange, onStopChange],
  );

  // Synchronizacja URL i stanu przy wyborze/odznaczeniu przystanku
  const handleSelectStop = useCallback(
    (stopName: string | null) => {
      setSelectedStopName(stopName);
      onStopChange?.(selectedLineId, stopName);
      const targetUrl = buildZditmMapUrl(selectedLineId, stopName || undefined);
      if (typeof window !== 'undefined' && window.location.pathname !== targetUrl) {
        window.history.replaceState({}, '', targetUrl);
      }
      if (stopName && mapInstanceRef.current) {
        const targetPos = getStopCoordinates(stopName);
        mapInstanceRef.current.panTo(targetPos, { animate: true });
      }
    },
    [selectedLineId, onStopChange],
  );

  // Synchronizacja z zewnętrznymi zmianami propsów (np. nawigacja deep-link / historia wstecz)
  useEffect(() => {
    if (initialLine && initialLine !== selectedLineId) {
      setSelectedLineId(initialLine);
    }
  }, [initialLine, selectedLineId]);

  useEffect(() => {
    if (initialStopName !== undefined && initialStopName !== selectedStopName) {
      setSelectedStopName(initialStopName);
      if (initialStopName && mapInstanceRef.current) {
        const targetPos = getStopCoordinates(initialStopName);
        mapInstanceRef.current.setView(targetPos, 16, { animate: true });
      }
    }
  }, [initialStopName, selectedStopName]);

  // Dynamiczny tytuł strony dla zakładek i wyszukiwarek (SEO & UX)
  useEffect(() => {
    if (selectedStopName) {
      document.title = `${selectedStopName} — Linia ${selectedLineId} Mapa ZDiTM | mójMińsk`;
    } else {
      document.title = `Linia ${selectedLineId} — Mapa ZDiTM Mińsk Mazowiecki | mójMińsk`;
    }
  }, [selectedLineId, selectedStopName]);

  // Wyszukiwanie w pełnej bazie 244 przystanków Mińska Mazowieckiego
  const searchResults = useMemo(() => {
    return searchQuery.trim() ? searchRealBusStops(searchQuery, 15) : [];
  }, [searchQuery]);

  // Pełne parametry wybranego przystanku
  const selectedStopDetails = useMemo(() => {
    return selectedStopName ? getStopDetails(selectedStopName) : undefined;
  }, [selectedStopName]);

  // Aktualny czas do odświeżania pozycji autobusu na żywo (co 3 sekundy)
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 3000);
    return () => clearInterval(timer);
  }, []);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const stopMarkersRef = useRef<L.Marker[]>([]);
  const busMarkersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const currentLine = useMemo(
    () => busLines.find((l) => l.id === selectedLineId) || busLines[0],
    [selectedLineId],
  );

  const currentDirection = currentLine.directions[directionIdx] || currentLine.directions[0];
  const activeStops = useMemo<string[]>(
    () =>
      currentDirection.stops && currentDirection.stops.length > 0
        ? currentDirection.stops
        : directionIdx === 1
          ? [...currentLine.stops].reverse()
          : currentLine.stops,
    [currentLine, currentDirection, directionIdx],
  );

  // Wszystkie aktywne autobusy na danej linii (z obsługą wielu pojazdów w trasie)
  const activeBuses: ActiveBusEstimate[] = useMemo(
    () => getActiveBuses(selectedLineId, directionIdx, currentTime),
    [selectedLineId, directionIdx, currentTime],
  );

  // Podstawowy autobus (dla podsumowań i fallbacku)
  const busEstimate: ActiveBusEstimate = useMemo(
    () => activeBuses[0] || getActiveBusEstimate(selectedLineId, directionIdx, currentTime),
    [activeBuses, selectedLineId, directionIdx, currentTime],
  );

  // Rozkład dla wybranego przystanku (jeśli kliknięto)
  const stopTimetable = useMemo(() => {
    if (!selectedStopName) return null;
    const currentDay = getCurrentTimetableDay();
    const tt = getOfficialStopTimetable(selectedLineId, selectedStopName, directionIdx);
    const next = getNextScheduledBus(tt[currentDay]);
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const all = tt[currentDay] || [];
    const upcoming = all.filter((t) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m >= currentMinutes;
    });

    return {
      all,
      upcoming,
      next: next?.time || null,
      isTomorrow: next?.isTomorrow || false,
      label: next?.label || (next?.time ? `Godzina ${next.time}` : null),
      day: currentDay === 'weekday' ? 'Dni robocze' : currentDay === 'saturday' ? 'Sobota' : 'Niedziela',
    };
  }, [selectedLineId, selectedStopName, directionIdx]);

  // 1. Inicjalizacja instancji mapy Leaflet
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [52.1793, 21.5658],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    // Oficjalne, bezpłatne kafelki OpenStreetMap (bez wymogu klucza API i znaków wodnych)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    // Kliknięcie w puste tło mapy odznacza przystanek (ale ignoruje kliknięcia w markery)
    map.on('click', (e) => {
      const orig = e.originalEvent;
      if (orig && (orig.target as HTMLElement)?.closest?.('.custom-bus-stop-icon, .custom-bus-marker, [data-stop]')) {
        return;
      }
      handleSelectStop(null);
    });

    mapInstanceRef.current = map;
    (window as any).__zditmMapInstance = map;

    return () => {
      delete (window as any).__zditmMapInstance;
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Rysowanie trasy i przystanków przy zmianie linii lub kierunku
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Usunięcie starych markerów i polilinii
    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
    }
    stopMarkersRef.current.forEach((m) => map.removeLayer(m));
    stopMarkersRef.current = [];

    const theme = LINE_THEME[selectedLineId];
    const coords = getLineRouteCoordinates(selectedLineId, directionIdx);

    // Rysowanie nowej polilinii
    const polyline = L.polyline(coords, {
      color: theme.color,
      weight: 6,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    routePolylineRef.current = polyline;

    // Dopasowanie widoku do wybranego przystanku lub całej trasy
    if (selectedStopName) {
      const targetPos = getStopCoordinates(selectedStopName);
      map.setView(targetPos, 16, { animate: true });
    } else if (coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }

    // Rejestracja globalnego callbacka dla natywnych kliknięć DOM
    (window as any).__selectZditmStop = (name: string) => {
      handleSelectStop(name);
    };

    // Dodawanie markerów przystanków
    activeStops.forEach((stopName, idx) => {
      const pos = getStopCoordinates(stopName);
      const isSelected = selectedStopName === stopName;
      const isFirst = idx === 0;
      const isLast = idx === activeStops.length - 1;

      const stopIconHtml = `
        <div data-stop="${stopName}"
             class="relative flex items-center justify-center cursor-pointer transition-transform duration-150 active:scale-90">
          <div style="background-color: ${isSelected ? '#0F172A' : theme.color}; border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.2);"
               class="stop-badge h-7 min-w-7 px-1.5 rounded-full flex items-center justify-center text-white text-[11px] font-extrabold">
            ${idx + 1}
          </div>
          ${
            isFirst || isLast || isSelected
              ? `<div class="stop-label absolute -bottom-5 whitespace-nowrap bg-white/95 px-2 py-0.5 rounded-md shadow-xs border border-slate-200 text-[10px] font-bold text-slate-800">
                   ${stopName}
                 </div>`
              : ''
          }
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-bus-stop-icon',
        html: stopIconHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker(pos, { icon, interactive: true })
        .addTo(map)
        .on('click', (e) => {
          L.DomEvent.stop(e);
          handleSelectStop(stopName);
        });

      // Bezpośrednie podpięcie zdarzenia DOM do elementu markera (niezawodne na iOS i Android)
      const el = marker.getElement();
      if (el) {
        L.DomEvent.disableClickPropagation(el);
        el.addEventListener('click', (ev) => {
          ev.stopPropagation();
          handleSelectStop(stopName);
        });
      }

      stopMarkersRef.current.push(marker);
    });
  }, [selectedLineId, directionIdx, activeStops]);

  // Dynamiczna aktualizacja wyglądu aktywnego przystanku bez usuwania całej mapy
  useEffect(() => {
    const theme = LINE_THEME[selectedLineId];
    stopMarkersRef.current.forEach((marker) => {
      const el = marker.getElement();
      if (!el) return;
      const stopDiv = el.querySelector('[data-stop]') as HTMLElement | null;
      if (!stopDiv) return;
      const stopName = stopDiv.getAttribute('data-stop');
      const isSelected = selectedStopName === stopName;
      const badge = stopDiv.querySelector('.stop-badge') as HTMLElement | null;
      if (badge) {
        badge.style.backgroundColor = isSelected ? '#0F172A' : theme.color;
      }
    });
  }, [selectedStopName, selectedLineId]);

  // 3. Rysowanie i animowanie pozycji autobusów na żywo (obsługa wielu pojazdów)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Usunięcie poprzednich markerów autobusów
    busMarkersRef.current.forEach((m) => map.removeLayer(m));
    busMarkersRef.current = [];

    const theme = LINE_THEME[selectedLineId];
    const busesToDisplay = activeBuses.length > 0 ? activeBuses : (busEstimate.isActive ? [busEstimate] : []);

    busesToDisplay.forEach((bus, busIdx) => {
      const busHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110">
          ${
            !bus.isAtStop
              ? `<span class="absolute h-10 w-10 rounded-full animate-ping opacity-35" style="background-color: ${theme.color};"></span>`
              : `<span class="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white shadow-xs"></span>`
          }
          <div class="relative h-9 w-9 rounded-2xl flex items-center justify-center text-white shadow-xl border-2 border-white transition-all" style="background-color: ${theme.color};">
            <span class="text-[17px] leading-none">🚌</span>
            <span class="absolute -top-1.5 -right-1.5 bg-slate-900 text-white font-extrabold text-[8.5px] px-1 py-0.2 rounded-md shadow-xs">
              ${bus.lineId}
            </span>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'live-bus-marker',
        html: busHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker(bus.position, { icon, zIndexOffset: 1000 + busIdx })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: inherit; font-size: 12px; padding: 4px; min-width: 140px;">
            <div style="font-weight: 800; color: #0f172a; margin-bottom: 2px;">
              Linia ${bus.lineId} &bull; Kurs ${bus.departureTime}
            </div>
            <div style="color: #64748b; font-size: 11px; margin-bottom: 4px;">
              Do: <b>${bus.destination}</b>
            </div>
            <div style="font-weight: 700; color: ${bus.isAtStop ? '#059669' : '#d97706'}; font-size: 11px;">
              ${bus.isAtStop ? `🚏 Na przystanku ${bus.prevStop}` : `➔ Dojeżdża do: ${bus.nextStop}`}
            </div>
          </div>
        `, { closeButton: false, offset: [0, -14] })
        .on('click', () => {
          map.panTo(bus.position, { animate: true });
        });

      busMarkersRef.current.push(marker);
    });
  }, [activeBuses, busEstimate, selectedLineId]);

  // Centrowanie na autobusach lub trasie
  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (activeBuses.length > 0) {
      if (activeBuses.length === 1) {
        map.flyTo(activeBuses[0].position, 15, { animate: true, duration: 0.8 });
      } else {
        const busLatLngs = activeBuses.map((b) => b.position);
        map.fitBounds(L.latLngBounds(busLatLngs), { padding: [60, 60], maxZoom: 16 });
      }
    } else if (busEstimate.isActive) {
      map.flyTo(busEstimate.position, 15, { animate: true, duration: 0.8 });
    } else {
      const coords = getLineRouteCoordinates(selectedLineId, directionIdx);
      if (coords.length > 0) {
        map.fitBounds(L.latLngBounds(coords), { padding: [40, 40] });
      }
    }
  };

  // Geolokalizacja użytkownika
  const handleLocateMe = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (!navigator.geolocation) {
      alert('Geolokalizacja nie jest wspierana w tej przeglądarce.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];

        if (userMarkerRef.current) {
          map.removeLayer(userMarkerRef.current);
        }

        const userIcon = L.divIcon({
          className: 'user-geo-marker',
          html: `
            <div class="relative flex items-center justify-center">
              <span class="absolute h-8 w-8 rounded-full bg-blue-500 animate-ping opacity-30"></span>
              <div class="h-5 w-5 rounded-full bg-blue-600 border-2 border-white shadow-md"></div>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        userMarkerRef.current = L.marker(userPos, { icon: userIcon }).addTo(map);
        map.flyTo(userPos, 15, { animate: true });
      },
      (err) => {
        console.warn('Geolocation error:', err);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const handleSelectSearchStop = (stop: RealBusStop) => {
    setIsSearchOpen(false);
    setSearchQuery('');

    // Jeśli przystanek jest na innej linii, a nie na bieżącej, przełącz linię
    const targetLine =
      stop.lines.length > 0 && !stop.lines.includes(selectedLineId)
        ? (stop.lines[0] as LineId)
        : selectedLineId;

    if (targetLine !== selectedLineId) {
      setSelectedLineId(targetLine);
      onLineChange?.(targetLine);
    }

    setSelectedStopName(stop.name);
    onStopChange?.(targetLine, stop.name);
    const targetUrl = buildZditmMapUrl(targetLine, stop.name);
    if (typeof window !== 'undefined' && window.location.pathname !== targetUrl) {
      window.history.replaceState({}, '', targetUrl);
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([stop.lat, stop.lon], 16, { animate: true });
    }
  };

  const theme = LINE_THEME[selectedLineId];

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col bg-slate-900 select-none overflow-hidden',
        isClosing ? 'native-screen-exit' : 'native-screen-slide',
      )}
    >
      {/* 1. TOP FLOATING CONTROL BAR (Przełącznik Linii M1, M2, M3, M4) */}
      <header className="absolute top-0 inset-x-0 z-[1000] p-3 sm:p-4 pointer-events-none">
        <div className="mx-auto max-w-md w-full space-y-2">
          {/* Main Top Nav Card */}
          <div className="flex items-center justify-between gap-2 rounded-2xl bg-white/95 backdrop-blur-md p-2 shadow-xl border border-slate-200/80 pointer-events-auto">
            <button
              type="button"
              onClick={onBack}
              className="grid h-10 w-10 place-items-center rounded-xl text-slate-800 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
              aria-label="Wróć"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            {/* Line Buttons (M1, M2, M3, M4) */}
            <div className="grid grid-cols-4 gap-1.5 flex-1">
              {(['M1', 'M2', 'M3', 'M4'] as LineId[]).map((lineId) => {
                const isSelected = selectedLineId === lineId;
                const t = LINE_THEME[lineId];
                return (
                  <button
                    key={lineId}
                    type="button"
                    onClick={() => handleSelectLine(lineId)}
                    className={cn(
                      'h-10 rounded-xl font-extrabold text-[13.5px] flex items-center justify-center gap-1 transition-all cursor-pointer border',
                      isSelected
                        ? cn(t.activePill, 'shadow-md border-transparent')
                        : 'bg-slate-100/80 text-slate-700 border-transparent hover:bg-slate-200/80',
                    )}
                  >
                    <Bus className="h-3.5 w-3.5" />
                    <span>{lineId}</span>
                  </button>
                );
              })}
            </div>

            {/* Przycisk wyszukiwarki wszystkich 244 przystanków */}
            <button
              type="button"
              onClick={() => setIsSearchOpen((prev) => !prev)}
              className={cn(
                'grid h-10 w-10 place-items-center rounded-xl transition-all cursor-pointer',
                isSearchOpen
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95',
              )}
              title="Szukaj przystanku (244 w bazie)"
              aria-label="Wyszukaj przystanek"
            >
              {isSearchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={() => onOpenTimetable?.(selectedLineId, selectedStopName || undefined)}
              className="grid h-10 w-10 place-items-center rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
              title="Przejdź do pełnego rozkładu tabelarycznego"
              aria-label="Rozkład tabelaryczny"
            >
              <List className="h-4.5 w-4.5 text-slate-800" />
            </button>
          </div>

          {/* SEARCH OVERLAY BAR (Przeszukiwanie wszystkich 244 przystanków Mińska) */}
          {isSearchOpen && (
            <div className="rounded-2xl bg-white p-3 shadow-2xl border border-slate-200 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-150 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Wpisz przystanek z 244 w bazie (np. Szpital, Serbinów, 01)..."
                  className="h-10 w-full rounded-xl bg-slate-100 pl-9 pr-8 text-[12.5px] font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10 transition-all border border-slate-200"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {searchQuery && (
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 rounded-xl bg-slate-50 border border-slate-200">
                  {searchResults.length > 0 ? (
                    searchResults.map((stop) => (
                      <button
                        key={stop.id}
                        type="button"
                        onClick={() => handleSelectSearchStop(stop)}
                        className="flex w-full items-center justify-between p-2.5 text-left hover:bg-slate-200/60 transition-colors cursor-pointer gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin className="h-3.5 w-3.5 text-coral-500 shrink-0" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[12px] font-extrabold text-slate-900 truncate">
                                {stop.fullName || stop.name}
                              </span>
                              {stop.ref && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">
                                  Słupek {stop.ref}
                                </span>
                              )}
                              <span className="text-[9.5px] text-slate-500">
                                • {stop.zone}
                              </span>
                            </div>
                            {stop.lines.length > 0 && (
                              <div className="flex items-center gap-1 mt-0.5">
                                {stop.lines.map((l) => (
                                  <span
                                    key={l}
                                    className="text-[9px] font-black px-1.5 py-0.2 rounded bg-slate-800 text-white"
                                  >
                                    {l}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-coral-500 shrink-0">
                          Pokaż ›
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="p-3 text-center text-[11.5px] text-slate-500">
                      Nie znaleziono przystanku w Mińsku.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Direction & Live Status Pill */}
          <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-900/90 backdrop-blur-md px-3.5 py-2 text-white shadow-lg border border-white/10 pointer-events-auto">
            <div className="min-w-0 flex items-center gap-2">
              <span
                className={cn(
                  'flex h-2 w-2 rounded-full shrink-0',
                  activeBuses.length > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400',
                )}
              />
              <div className="min-w-0">
                <p className="text-[12px] font-bold truncate flex items-center gap-1.5">
                  <span>➔ {currentDirection.destination}</span>
                  {activeBuses.length > 1 && (
                    <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
                      {activeBuses.length} autobusy w trasie
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-slate-300 truncate">
                  {activeBuses.length > 0
                    ? activeBuses.length === 1
                      ? activeBuses[0].statusLabel
                      : `${activeBuses.length} autobusy w trasie: kursy ${activeBuses.map((b) => b.departureTime).join(', ')}`
                    : busEstimate.statusLabel}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setDirectionIdx((prev) => (prev === 0 ? 1 : 0))}
              className="flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/25 active:scale-95 transition-all shrink-0 cursor-pointer border border-white/10"
            >
              <ArrowRightLeft className="h-3 w-3 text-coral-400" />
              <span>Odwróć</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. LEAFLET MAP CONTAINER (Vertical Full Viewport) */}
      <div className="relative flex-1 w-full h-full bg-slate-100">
        <div id="zditm-leaflet-map" ref={mapContainerRef} className="w-full h-full" />

        {/* FLOATING ACTION BUTTONS */}
        <div className="absolute right-4 bottom-32 z-[1000] flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleRecenter}
            className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-slate-800 shadow-xl border border-slate-200 active:scale-95 transition-all cursor-pointer"
            title="Centruj na trasie / autobusie"
            aria-label="Centruj na trasie"
          >
            <Crosshair className="h-5 w-5 text-slate-700" />
          </button>

          <button
            type="button"
            onClick={handleLocateMe}
            className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-blue-600 shadow-xl border border-slate-200 active:scale-95 transition-all cursor-pointer"
            title="Moja lokalizacja"
            aria-label="Moja lokalizacja"
          >
            <Compass className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 3. BOTTOM SHEET: POPUP Z ODJAZDAMI DLA WYBRANEGO PRZYSTANKU */}
      {selectedStopName && stopTimetable && (
        <div className="absolute inset-x-0 bottom-0 z-[1001] max-w-lg mx-auto w-full p-3 sm:p-4 animate-in slide-in-from-bottom-6 duration-200">
          <div className="rounded-3xl bg-white p-4.5 sm:p-5 shadow-2xl border border-slate-200/90 space-y-3">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="grid h-6 w-6 place-items-center rounded-lg text-white font-black text-[11px]"
                    style={{ backgroundColor: theme.color }}
                  >
                    {selectedLineId}
                  </span>
                  <h3 className="font-display text-[17px] font-bold text-slate-900 truncate">
                    {selectedStopName}
                  </h3>
                </div>
                <p className="text-[11.5px] text-slate-500 mt-0.5">
                  Kierunek: <strong className="text-slate-800">{currentDirection.destination}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleSelectStop(null)}
                className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Zamknij podgląd przystanku"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* SZCZEGÓŁOWE PARAMETRY PRZYSTANKU W MIŃSKU */}
            {selectedStopDetails && (
              <div className="flex flex-wrap items-center gap-1.5 py-1 text-[11px] border-b border-slate-100">
                <span className="rounded-lg bg-slate-100 px-2 py-0.5 font-bold text-slate-700 border border-slate-200">
                  📍 {selectedStopDetails.zone}
                </span>
                {selectedStopDetails.ref && (
                  <span className="rounded-lg bg-amber-50 px-2 py-0.5 font-extrabold text-amber-800 border border-amber-200">
                    Słupek {selectedStopDetails.ref}
                  </span>
                )}
                {selectedStopDetails.lines.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 font-bold text-[10px]">Linie:</span>
                    {selectedStopDetails.lines.map((l) => (
                      <span
                        key={l}
                        className="rounded-md bg-slate-800 px-1.5 py-0.2 text-[9.5px] font-black text-white"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                )}
                {selectedStopDetails.isTransfer && (
                  <span className="rounded-lg bg-emerald-50 px-2 py-0.5 font-bold text-emerald-800 border border-emerald-200">
                    🔄 Węzeł przesiadkowy
                  </span>
                )}
                <span className="rounded-lg bg-slate-50 px-2 py-0.5 font-mono text-[10px] text-slate-500 border border-slate-200">
                  GPS {selectedStopDetails.lat.toFixed(4)}, {selectedStopDetails.lon.toFixed(4)}
                </span>
              </div>
            )}

            {/* NAJBLIŻSZY KURS */}
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 border border-slate-200">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-coral-500 shrink-0" />
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                    Najbliższy planowany odjazd ({stopTimetable.day})
                  </span>
                  <span className="font-display text-[15px] font-extrabold text-slate-900">
                    {stopTimetable.next
                      ? stopTimetable.isTomorrow
                        ? `Jutro o ${stopTimetable.next}`
                        : `Godzina ${stopTimetable.next}`
                      : 'Brak kursów dziś'}
                  </span>
                </div>
              </div>

              {stopTimetable.next && (
                <span
                  className="rounded-xl px-3 py-1 font-mono text-[13px] font-black text-white shadow-xs"
                  style={{ backgroundColor: theme.color }}
                >
                  {stopTimetable.isTomorrow ? `Jutro ${stopTimetable.next}` : stopTimetable.next}
                </span>
              )}
            </div>

            {/* KOLEJNE ODJAZDY */}
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {stopTimetable.upcoming.length > 0 ? 'Kolejne odjazdy dzisiaj:' : 'Pierwsze odjazdy jutro:'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(stopTimetable.upcoming.length > 0 ? stopTimetable.upcoming : stopTimetable.all).slice(0, 7).map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[12px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200"
                  >
                    {t}
                  </span>
                ))}
                {(stopTimetable.upcoming.length > 0 ? stopTimetable.upcoming.length : stopTimetable.all.length) > 7 && (
                  <span className="text-[11px] font-semibold text-slate-400 px-1 py-0.5">
                    +{(stopTimetable.upcoming.length > 0 ? stopTimetable.upcoming.length : stopTimetable.all.length) - 7} więcej
                  </span>
                )}
              </div>
            </div>

            {/* PRZYCISK: PEŁNY ROZKŁAD */}
            <button
              type="button"
              onClick={() => onOpenTimetable?.(selectedLineId, selectedStopName)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold text-[13px] flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <span>Zobacz pełną tablicę godzinową</span>
              <Sparkles className="h-3.5 w-3.5 text-coral-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
