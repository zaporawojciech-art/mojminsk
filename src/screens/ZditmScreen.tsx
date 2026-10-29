import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Bus,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  RefreshCw,
  Search,
  Star,
  X,
} from 'lucide-react';
import { cn } from '../components/ui';
import type { FavoriteBusStop, LineId } from '../data/mockData';
import {
  fetchBusStops,
  fetchStopDepartures,
  fetchLiveVehicles,
  fetchPassingTimes,
  findNearestStops,
  type BusStop,
  type StopDeparturesResult,
  type LiveVehicle,
  type PassingTimesResult,
} from '../services/cityBusService';

interface ZditmScreenProps {
  onBack: () => void;
  initialLine?: LineId;
  initialStopName?: string;
  isClosing?: boolean;
  favoriteBuses?: FavoriteBusStop[];
  onToggleFavorite?: (fav: Omit<FavoriteBusStop, 'id'>) => void;
  onRemoveFavorite?: (id: string) => void;
}

const LINE_STYLES: Record<string, { badge: string; border: string }> = {
  M1: { badge: 'bg-emerald-100 text-emerald-950 border-emerald-300', border: 'border-emerald-200' },
  M2: { badge: 'bg-sky-100 text-sky-950 border-sky-300', border: 'border-sky-200' },
  M3: { badge: 'bg-sand-100 text-sand-950 border-sand-300', border: 'border-sand-200' },
  M4: { badge: 'bg-coral-100 text-coral-950 border-coral-300', border: 'border-coral-200' },
};

export function ZditmScreen({
  onBack,
  initialStopName,
  isClosing = false,
  favoriteBuses = [],
  onToggleFavorite,
  onRemoveFavorite,
}: ZditmScreenProps) {
  const [stops, setStops] = useState<BusStop[]>([]);
  const [isLoadingStops, setIsLoadingStops] = useState(true);
  const [selectedStop, setSelectedStop] = useState<BusStop | null>(null);

  const [departuresResult, setDeparturesResult] = useState<StopDeparturesResult | null>(null);
  const [isLoadingDepartures, setIsLoadingDepartures] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [liveVehicles, setLiveVehicles] = useState<LiveVehicle[]>([]);
  const [expandedDepId, setExpandedDepId] = useState<string | null>(null);
  const [passingTimesCache, setPassingTimesCache] = useState<Record<string, PassingTimesResult>>({});
  const [isLoadingPassingTimes, setIsLoadingPassingTimes] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [lineFilter, setLineFilter] = useState<'ALL' | 'M1' | 'M2' | 'M3' | 'M4'>('ALL');
  const [isLocating, setIsLocating] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // 1. Ładowanie przystanków przy starcie
  useEffect(() => {
    let active = true;
    async function load() {
      setIsLoadingStops(true);
      const data = await fetchBusStops();
      if (!active) return;
      setStops(data);
      setIsLoadingStops(false);

      // Wybierz początkowy przystanek
      if (data.length > 0) {
        if (initialStopName) {
          const match = data.find(
            (s) => s.name.toLowerCase().includes(initialStopName.toLowerCase())
          );
          setSelectedStop(match || data[0]);
        } else if (favoriteBuses.length > 0) {
          const match = data.find(
            (s) => s.name.toLowerCase() === favoriteBuses[0].stopName.toLowerCase()
          );
          setSelectedStop(match || data[0]);
        } else {
          // Domyślnie Plac Dworcowy
          const dworzec = data.find((s) => s.name.toLowerCase().includes('dworcowy'));
          setSelectedStop(dworzec || data[0]);
        }
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [initialStopName]);

  // 2. Ładowanie odjazdów dla wybranego przystanku
  const loadDepartures = useCallback(async (stopId: string, background = false) => {
    if (!background) setIsLoadingDepartures(true);
    else setIsRefreshing(true);
    try {
      const data = await fetchStopDepartures(stopId);
      setDeparturesResult(data);
    } catch (err) {
      console.error('[ZditmScreen] Błąd pobierania odjazdów:', err);
    } finally {
      setIsLoadingDepartures(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedStop?.id) return;
    loadDepartures(selectedStop.id);

    // Auto-polling co 20 sekund
    const interval = setInterval(() => {
      loadDepartures(selectedStop.id, true);
    }, 20000);

    return () => clearInterval(interval);
  }, [selectedStop?.id, loadDepartures]);

  // 3. Ładowanie pozycji autobusów
  useEffect(() => {
    let active = true;
    async function pollVehicles() {
      const v = await fetchLiveVehicles();
      if (active) setLiveVehicles(v);
    }
    pollVehicles();
    const interval = setInterval(pollVehicles, 15000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // 4. Rozwijanie szczegółów opóźnienia i kolejnych przystanków kursu
  const togglePassingTimes = async (depId: string) => {
    if (expandedDepId === depId) {
      setExpandedDepId(null);
      return;
    }
    setExpandedDepId(depId);
    if (!passingTimesCache[depId]) {
      setIsLoadingPassingTimes(true);
      const res = await fetchPassingTimes(depId);
      if (res) {
        setPassingTimesCache((prev) => ({ ...prev, [depId]: res }));
      }
      setIsLoadingPassingTimes(false);
    }
  };

  // 5. Geolokalizacja najbliższych przystanków
  const locateNearest = () => {
    if (!navigator.geolocation) {
      alert('Twoja przeglądarka nie obsługuje geolokalizacji.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        setUserCoords({ lat: latitude, lon: longitude });
        const nearest = findNearestStops(stops, latitude, longitude, 1);
        if (nearest.length > 0) {
          setSelectedStop(nearest[0]);
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // 6. Filtrowanie listy przystanków
  const filteredStops = useMemo(() => {
    let list = stops;

    if (userCoords) {
      list = list.map((s) => ({
        ...s,
        distanceKm: findNearestStops([s], userCoords.lat, userCoords.lon, 1)[0]?.distanceKm,
      }));
    }

    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.altId.toLowerCase().includes(q));
    }

    if (userCoords && !q) {
      list = [...list].sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    }

    return list;
  }, [stops, searchQuery, userCoords]);

  // 7. Filtrowanie odjazdów na tablicy
  const visibleDepartures = useMemo(() => {
    if (!departuresResult?.departures) return [];
    if (lineFilter === 'ALL') return departuresResult.departures;
    return departuresResult.departures.filter((d) => d.line.toUpperCase() === lineFilter);
  }, [departuresResult, lineFilter]);

  // Sprawdzenie, czy bieżący przystanek jest w ulubionych
  const isCurrentStopFavorite = useMemo(() => {
    if (!selectedStop) return false;
    return favoriteBuses.some(
      (f) => f.stopName.toLowerCase() === selectedStop.name.toLowerCase()
    );
  }, [favoriteBuses, selectedStop]);

  const handleToggleCurrentFavorite = () => {
    if (!selectedStop) return;
    if (isCurrentStopFavorite) {
      const match = favoriteBuses.find(
        (f) => f.stopName.toLowerCase() === selectedStop.name.toLowerCase()
      );
      if (match) onRemoveFavorite?.(match.id);
    } else {
      const firstLine = (departuresResult?.departures[0]?.line as LineId) || 'M2';
      const firstDest = departuresResult?.departures[0]?.destination || 'Kierunek w rozkładzie';
      onToggleFavorite?.({
        lineId: firstLine,
        stopName: selectedStop.name,
        directionIdx: 0,
        directionName: firstDest,
        destination: firstDest,
      });
    }
  };

  return (
    <div
      className={cn(
        'fixed inset-0 md:relative md:inset-auto md:h-full md:w-full z-50 flex flex-col bg-mist select-none',
        isClosing ? 'native-screen-exit' : 'native-screen-slide'
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-md md:max-w-none flex-col overflow-hidden bg-mist">
        {/* =====================================================================
            TOP BAR: KOMUNIKACJA MIEJSKA
            ===================================================================== */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-mist-300/80 bg-white/95 px-4 md:px-8 lg:px-12 backdrop-blur pt-[max(env(safe-area-inset-top),8px)] md:pt-0 shrink-0">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-[13.5px] font-bold text-ink hover:text-ink-600 active:scale-95 transition-transform cursor-pointer"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            <span>Wróć</span>
          </button>

          <div className="flex items-center gap-2">
            <h1 className="font-display text-[15px] md:text-[17px] font-bold text-ink flex items-center gap-2">
              <Bus className="w-4 h-4 text-sky-700" />
              <span>Komunikacja miejska</span>
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10.5px] font-bold text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Na żywo (GPS)</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {liveVehicles.length > 0 && (
              <span className="hidden lg:inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-500 bg-mist px-2.5 py-1 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                <span>{liveVehicles.length} autobusy w trasie</span>
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(true)}
              className="md:hidden flex items-center gap-1 rounded-xl bg-ink px-3 py-1.5 text-[12px] font-bold text-white shadow-xs active:scale-95 transition-all"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Przystanki</span>
            </button>
          </div>
        </header>

        {/* =====================================================================
            DESKTOP VIEW (>= 768px): 12-Column Split
            ===================================================================== */}
        <div className="hidden md:grid md:grid-cols-12 md:gap-6 md:px-8 lg:px-12 md:py-6 flex-1 overflow-hidden">
          {/* LEFT COLUMN (4 cols): Przystanki & Wyszukiwarka */}
          <div className="col-span-5 lg:col-span-4 flex flex-col rounded-2xl border border-mist-200 bg-white shadow-xs overflow-hidden h-full">
            <div className="p-4 border-b border-mist-200 space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-[14px] font-bold text-ink">
                    Przystanki miejskie
                  </h2>
                  <p className="text-[11px] text-ink-400">
                    {stops.length > 0 ? `${stops.length} oficjalnych słupków` : 'Wczytywanie...'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={locateNearest}
                  disabled={isLocating}
                  className="flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  title="Znajdź najbliższy przystanek wg Twojej lokalizacji"
                >
                  <Compass className={cn('w-3.5 h-3.5', isLocating && 'animate-spin')} />
                  <span>Blisko mnie</span>
                </button>
              </div>

              {/* Input szukania */}
              <div className="flex h-10 items-center gap-2 rounded-xl border border-mist-300 bg-mist/60 px-3 focus-within:border-ink focus-within:bg-white transition-all">
                <Search className="h-4 w-4 text-ink-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Wpisz nazwę przystanku lub ulicy..."
                  className="flex-1 bg-transparent text-[13px] font-medium text-ink placeholder:text-ink-400 outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-ink-400 hover:text-ink cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Lista przystanków */}
            <div className="flex-1 overflow-y-auto divide-y divide-mist-100 p-2">
              {isLoadingStops ? (
                <div className="p-6 text-center text-xs text-ink-400 space-y-2">
                  <RefreshCw className="w-5 h-5 mx-auto animate-spin text-sky-700" />
                  <p>Ładowanie przystanków...</p>
                </div>
              ) : filteredStops.length === 0 ? (
                <div className="p-6 text-center text-xs text-ink-400">
                  Nie znaleziono przystanku „{searchQuery}”.
                </div>
              ) : (
                filteredStops.map((stop) => {
                  const isSelected = selectedStop?.id === stop.id;
                  const isFav = favoriteBuses.some(
                    (f) => f.stopName.toLowerCase() === stop.name.toLowerCase()
                  );

                  return (
                    <button
                      key={stop.id}
                      type="button"
                      onClick={() => setSelectedStop(stop)}
                      className={cn(
                        'w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer',
                        isSelected ? 'bg-sky-50 border border-sky-300 shadow-2xs' : 'hover:bg-mist/70'
                      )}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[13px] font-bold text-ink leading-snug break-words">
                            {stop.name}
                          </p>
                          {isFav && <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-ink-400 truncate">
                          Kod: {stop.altId || stop.id}
                          {stop.distanceKm !== undefined && (
                            <span className="ml-1 text-sky-700 font-semibold">
                              · {(stop.distanceKm * 1000).toFixed(0)} m stąd
                            </span>
                          )}
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-ink-400 shrink-0">➔</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN (8 cols): Tablica Odjazdów Na Żywo */}
          <div className="col-span-7 lg:col-span-8 flex flex-col overflow-y-auto space-y-4 pr-1">
            {/* Header wybranego przystanku */}
            <div className="rounded-2xl border border-mist-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-900 text-[10px] font-extrabold uppercase tracking-wider">
                      Przystanek
                    </span>
                    <span className="text-[11px] text-ink-400 font-mono">
                      {selectedStop?.altId || selectedStop?.id}
                    </span>
                  </div>
                  <h2 className="font-display text-[20px] md:text-[22px] font-bold text-ink leading-tight break-words">
                    {selectedStop?.name || 'Wybierz przystanek'}
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleToggleCurrentFavorite}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-2xs',
                      isCurrentStopFavorite
                        ? 'bg-amber-50 text-amber-900 border-amber-300'
                        : 'bg-white text-ink-700 hover:bg-mist border-mist-300'
                    )}
                  >
                    <Star
                      className={cn(
                        'w-3.5 h-3.5',
                        isCurrentStopFavorite ? 'fill-amber-400 text-amber-500' : 'text-ink-400'
                      )}
                    />
                    <span>{isCurrentStopFavorite ? 'Obserwowany' : 'Obserwuj'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectedStop?.id && loadDepartures(selectedStop.id, true)}
                    disabled={isRefreshing}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-mist hover:bg-mist-200 text-ink-700 text-xs font-bold transition-colors cursor-pointer"
                    title="Odśwież tablicę odjazdów"
                  >
                    <RefreshCw className={cn('w-3.5 h-3.5', isRefreshing && 'animate-spin text-sky-700')} />
                    <span>Odśwież</span>
                  </button>
                </div>
              </div>

              {/* Filtry linii (Wszystkie, M1, M2, M3, M4) */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-mist-100 text-xs font-bold overflow-x-auto no-scrollbar">
                <span className="text-ink-400 text-[11px] uppercase mr-1">Filtruj linię:</span>
                {(['ALL', 'M1', 'M2', 'M3', 'M4'] as const).map((line) => (
                  <button
                    key={line}
                    type="button"
                    onClick={() => setLineFilter(line)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg transition-all cursor-pointer',
                      lineFilter === line
                        ? 'bg-ink text-white shadow-2xs'
                        : 'bg-mist text-ink-600 hover:text-ink'
                    )}
                  >
                    {line === 'ALL' ? 'Wszystkie' : line}
                  </button>
                ))}
              </div>
            </div>

            {/* Tablica odjazdów */}
            <div className="rounded-2xl border border-mist-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-mist-100 pb-2.5">
                <h3 className="font-display text-[14.5px] font-bold text-ink flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-700" />
                  <span>Najbliższe odjazdy z tego przystanku</span>
                </h3>
                {departuresResult?.updatedAt && (
                  <span className="text-[11px] text-ink-400">
                    Aktualizacja: {new Date(departuresResult.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>

              {isLoadingDepartures ? (
                <div className="py-12 text-center text-xs text-ink-400 space-y-2">
                  <RefreshCw className="w-5 h-5 mx-auto animate-spin text-sky-700" />
                  <p>Ładowanie tablicy odjazdów na żywo...</p>
                </div>
              ) : visibleDepartures.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <Bus className="w-8 h-8 mx-auto text-ink-300" />
                  <p className="text-sm font-bold text-ink">Brak zaplanowanych odjazdów</p>
                  <p className="text-xs text-ink-500">
                    W tej chwili brak kursów dla wybranego filtra. Sprawdź inną linię lub porę dnia.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-mist-100">
                  {visibleDepartures.map((dep) => {
                    const style = LINE_STYLES[dep.line] || {
                      badge: 'bg-mist text-ink border-mist-300',
                      border: 'border-mist-200',
                    };
                    const isExpanded = expandedDepId === dep.id;
                    const passing = passingTimesCache[dep.id];

                    return (
                      <div key={dep.id} className="py-3 space-y-2">
                        <div
                          onClick={() => togglePassingTimes(dep.id)}
                          className="flex items-center justify-between gap-3 cursor-pointer group"
                        >
                          {/* Linia i kierunek */}
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={cn(
                                'px-2.5 py-1 rounded-xl text-[13px] font-black border shadow-2xs shrink-0',
                                style.badge
                              )}
                            >
                              {dep.line}
                            </span>
                            <div className="min-w-0">
                              <p className="text-[14px] font-bold text-ink truncate group-hover:text-coral-600 transition-colors">
                                ➔ {dep.destination}
                              </p>
                              <p className="text-[11px] text-ink-400">
                                Rozkładowo: <strong>{dep.time}</strong>
                              </p>
                            </div>
                          </div>

                          {/* Minuty i sytuacja */}
                          <div className="flex items-center gap-3 shrink-0 text-right">
                            <div>
                              <div className="flex items-baseline justify-end gap-1">
                                {dep.minutesTo !== undefined && dep.minutesTo <= 60 ? (
                                  <>
                                    <span className="font-display text-[22px] font-extrabold text-ink leading-none">
                                      {dep.minutesTo}
                                    </span>
                                    <span className="text-[11px] font-bold text-ink-500">min</span>
                                  </>
                                ) : (
                                  <span className="font-display text-[17px] font-bold text-ink">
                                    {dep.time}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-emerald-700 font-bold flex items-center justify-end gap-1 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>na żywo</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="text-ink-400 group-hover:text-ink transition-transform"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Rozwinięcie trasy i kolejnych przystanków kursu */}
                        {isExpanded && (
                          <div className="mt-2 p-3 rounded-xl bg-mist/60 border border-mist-200 text-xs space-y-2 animate-in fade-in duration-150">
                            {isLoadingPassingTimes && !passing ? (
                              <div className="text-center py-2 text-ink-400">
                                <RefreshCw className="w-3.5 h-3.5 mx-auto animate-spin" />
                                <span>Sprawdzanie sytuacji GPS...</span>
                              </div>
                            ) : passing ? (
                              <>
                                <div className="flex items-center justify-between border-b border-mist-200 pb-1.5">
                                  <span className="text-ink-500 font-medium">Sytuacja na trasie:</span>
                                  <span className="font-bold text-ink-900 bg-white px-2 py-0.5 rounded border border-mist-300">
                                    {passing.situation || 'Na czas'}
                                  </span>
                                </div>
                                {passing.stops.length > 0 && (
                                  <div className="space-y-1 pt-1">
                                    <p className="text-[11px] font-bold text-ink-500 uppercase">
                                      Następne przystanki tego kursu:
                                    </p>
                                    <div className="grid grid-cols-2 gap-1.5">
                                      {passing.stops.map((st, sIdx) => (
                                        <div
                                          key={sIdx}
                                          className="p-1.5 rounded bg-white text-[11px] flex items-center justify-between border border-mist-100"
                                        >
                                          <span className="truncate pr-1 text-ink-700">{st.station}</span>
                                          <span className="font-mono font-bold text-ink-900 shrink-0">
                                            {st.time}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : null}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =====================================================================
            MOBILE VIEW (< 768px): Native Mobile Departure Board
            ===================================================================== */}
        <main className="md:hidden flex-1 overflow-y-auto overscroll-contain p-4 space-y-3 pb-24">
          {/* Mobile Current Stop Header */}
          <div className="rounded-2xl border border-mist-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-ink-400 uppercase">
                  <span>Przystanek</span>
                  <span>•</span>
                  <span className="font-mono">{selectedStop?.altId || selectedStop?.id}</span>
                </div>
                <h2 className="font-display text-[17px] font-bold text-ink leading-tight mt-0.5 break-words">
                  {selectedStop?.name || 'Wybierz przystanek'}
                </h2>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleToggleCurrentFavorite}
                  className={cn(
                    'grid h-8 w-8 place-items-center rounded-xl border transition-all active:scale-95 cursor-pointer',
                    isCurrentStopFavorite
                      ? 'bg-amber-50 text-amber-500 border-amber-300'
                      : 'bg-mist text-ink-400 border-mist-300'
                  )}
                  title="Obserwuj przystanek"
                >
                  <Star className={cn('w-4 h-4', isCurrentStopFavorite && 'fill-amber-400')} />
                </button>
                <button
                  type="button"
                  onClick={() => selectedStop?.id && loadDepartures(selectedStop.id, true)}
                  disabled={isRefreshing}
                  className="grid h-8 w-8 place-items-center rounded-xl bg-mist text-ink-600 border border-mist-300 transition-all active:scale-95 cursor-pointer"
                  title="Odśwież"
                >
                  <RefreshCw className={cn('w-3.5 h-3.5', isRefreshing && 'animate-spin text-sky-700')} />
                </button>
              </div>
            </div>

            {/* Quick Actions (Zmień przystanek & GPS) */}
            <div className="flex items-center gap-2 pt-1 border-t border-mist-100">
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(true)}
                className="flex-1 py-1.5 px-3 rounded-xl bg-mist/70 hover:bg-mist text-ink-700 font-bold text-[11.5px] flex items-center justify-center gap-1.5 border border-mist-200 active:scale-95 transition-all"
              >
                <Search className="w-3.5 h-3.5 text-ink-500" />
                <span>Wybierz inny z 118 przystanków</span>
              </button>

              <button
                type="button"
                onClick={locateNearest}
                disabled={isLocating}
                className="py-1.5 px-3 rounded-xl bg-sky-50 text-sky-800 font-bold text-[11.5px] flex items-center justify-center gap-1 border border-sky-200 active:scale-95 transition-all shrink-0"
              >
                <Compass className={cn('w-3.5 h-3.5', isLocating && 'animate-spin')} />
                <span>GPS</span>
              </button>
            </div>

            {/* Line Filter Chips */}
            <div className="flex items-center gap-1 pt-1 overflow-x-auto no-scrollbar">
              {(['ALL', 'M1', 'M2', 'M3', 'M4'] as const).map((line) => (
                <button
                  key={line}
                  type="button"
                  onClick={() => setLineFilter(line)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0',
                    lineFilter === line
                      ? 'bg-ink text-white shadow-2xs'
                      : 'bg-mist text-ink-600 hover:text-ink'
                  )}
                >
                  {line === 'ALL' ? 'Wszystkie' : line}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Departures List */}
          <div className="rounded-2xl border border-mist-200 bg-white p-3.5 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-mist-100 pb-2">
              <span className="text-[12px] font-bold text-ink flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-700" />
                <span>Najbliższe odjazdy</span>
              </span>
              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>GPS Live</span>
              </span>
            </div>

            {isLoadingDepartures ? (
              <div className="py-8 text-center text-xs text-ink-400 space-y-1.5">
                <RefreshCw className="w-4 h-4 mx-auto animate-spin text-sky-700" />
                <p>Pobieranie odjazdów z Trapeze...</p>
              </div>
            ) : visibleDepartures.length === 0 ? (
              <div className="py-8 text-center space-y-1">
                <p className="text-xs font-bold text-ink">Brak odjazdów dla tego przystanku</p>
                <p className="text-[11px] text-ink-400">Zmień linię lub wybierz inny przystanek.</p>
              </div>
            ) : (
              <div className="divide-y divide-mist-100">
                {visibleDepartures.map((dep) => {
                  const style = LINE_STYLES[dep.line] || {
                    badge: 'bg-mist text-ink border-mist-300',
                    border: 'border-mist-200',
                  };
                  const isExpanded = expandedDepId === dep.id;
                  const passing = passingTimesCache[dep.id];

                  return (
                    <div key={dep.id} className="py-2.5 space-y-1.5">
                      <div
                        onClick={() => togglePassingTimes(dep.id)}
                        className="flex items-center justify-between gap-2 cursor-pointer active:opacity-75"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-lg text-[12px] font-black border shrink-0',
                              style.badge
                            )}
                          >
                            {dep.line}
                          </span>
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-ink truncate leading-tight">
                              ➔ {dep.destination}
                            </p>
                            <p className="text-[10.5px] text-ink-400">
                              Rozkład: <strong>{dep.time}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {dep.minutesTo !== undefined && dep.minutesTo <= 60 ? (
                            <div className="flex items-baseline justify-end gap-0.5">
                              <span className="font-display text-[18px] font-extrabold text-ink leading-none">
                                {dep.minutesTo}
                              </span>
                              <span className="text-[10px] font-bold text-ink-500">min</span>
                            </div>
                          ) : (
                            <span className="font-display text-[14px] font-bold text-ink">
                              {dep.time}
                            </span>
                          )}
                          <span className="text-[9.5px] text-emerald-700 font-bold block">
                            na żywo
                          </span>
                        </div>
                      </div>

                      {/* Mobile Passing Times Drawer */}
                      {isExpanded && (
                        <div className="p-2.5 rounded-xl bg-mist/60 text-[11px] space-y-1.5">
                          {isLoadingPassingTimes && !passing ? (
                            <div className="text-center py-1 text-ink-400">
                              <span>Sprawdzanie sytuacji GPS...</span>
                            </div>
                          ) : passing ? (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-ink-500">Sytuacja:</span>
                                <span className="font-bold text-ink-900 bg-white px-1.5 py-0.2 rounded border border-mist-300">
                                  {passing.situation || 'Na czas'}
                                </span>
                              </div>
                              {passing.stops.length > 0 && (
                                <div className="space-y-1 pt-1 border-t border-mist-200">
                                  {passing.stops.slice(0, 4).map((st, i) => (
                                    <div key={i} className="flex justify-between text-ink-600">
                                      <span className="truncate pr-1">{st.station}</span>
                                      <span className="font-mono font-bold text-ink-900">{st.time}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          ) : null}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ulubione przystanki na telefonie */}
          {favoriteBuses.length > 0 && (
            <div className="rounded-2xl border border-mist-200 bg-white p-3.5 shadow-xs space-y-2">
              <h3 className="text-[12px] font-bold text-ink">Twoje obserwowane przystanki</h3>
              <div className="flex flex-wrap gap-1.5">
                {favoriteBuses.map((fav) => (
                  <button
                    key={fav.id}
                    type="button"
                    onClick={() => {
                      const match = stops.find(
                        (s) => s.name.toLowerCase() === fav.stopName.toLowerCase()
                      );
                      if (match) setSelectedStop(match);
                    }}
                    className={cn(
                      'px-2.5 py-1 rounded-xl text-xs font-semibold border flex items-center gap-1.5 active:scale-95 transition-all',
                      selectedStop?.name.toLowerCase() === fav.stopName.toLowerCase()
                        ? 'bg-sky-50 border-sky-300 text-sky-900 font-bold'
                        : 'bg-mist/60 border-mist-200 text-ink-700'
                    )}
                  >
                    <span>{fav.stopName}</span>
                    <span className="text-[10px] text-ink-400">({fav.lineId})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* =====================================================================
            MOBILE SEARCH OVERLAY
            ===================================================================== */}
        {isMobileSearchOpen && (
          <div className="absolute inset-0 z-30 flex flex-col bg-white select-none">
            <div className="flex h-14 items-center gap-2 border-b border-mist-300 px-4 pt-[max(env(safe-area-inset-top),8px)] shrink-0">
              <Search className="h-4.5 w-4.5 text-ink-400 shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Wpisz nazwę przystanku lub ulicy..."
                className="flex-1 bg-transparent text-[14px] font-medium text-ink placeholder:text-ink-400 outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setIsMobileSearchOpen(false);
                  setSearchQuery('');
                }}
                className="grid h-8 w-8 place-items-center rounded-full bg-mist text-ink-600 hover:text-ink active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-mist">
              {filteredStops.map((stop) => (
                <button
                  key={stop.id}
                  type="button"
                  onClick={() => {
                    setSelectedStop(stop);
                    setIsMobileSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="w-full flex items-center justify-between p-3.5 text-left active:bg-mist/70 transition-colors"
                >
                  <div>
                    <p className="text-[13.5px] font-bold text-ink">{stop.name}</p>
                    <p className="text-[11px] text-ink-400">
                      Kod: {stop.altId || stop.id}
                      {stop.distanceKm !== undefined && (
                        <span className="ml-1 text-sky-700 font-semibold">
                          · {(stop.distanceKm * 1000).toFixed(0)} m stąd
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-ink-400">➔</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
