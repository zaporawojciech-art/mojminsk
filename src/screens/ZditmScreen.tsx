import { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRightLeft,
  Bus,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Map,
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
  groupTimetableByHours,
  type LineId,
  type TimetableDayType,
} from '../data/mockData';
import { REAL_BUS_STOPS } from '../data/realBusStops';
import { slugify } from '../router/urlUtils';

interface ZditmScreenProps {
  onBack: () => void;
  initialLine?: LineId;
  initialStopName?: string;
  isClosing?: boolean;
  onNavigate?: (lineId: LineId, stopName?: string) => void;
  onOpenMap?: (lineId: LineId) => void;
}

const LINE_CONFIG: Record<
  LineId,
  { name: string; bg: string; text: string; border: string; pillActive: string; accentColor: string }
> = {
  M1: {
    name: 'Linia M1',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700',
    border: 'border-emerald-300',
    pillActive: 'bg-emerald-600 text-white',
    accentColor: '#10B981',
  },
  M2: {
    name: 'Linia M2',
    bg: 'bg-sky-500/10',
    text: 'text-sky-700',
    border: 'border-sky-300',
    pillActive: 'bg-sky-600 text-white',
    accentColor: '#0284C7',
  },
  M3: {
    name: 'Linia M3',
    bg: 'bg-amber-500/10',
    text: 'text-amber-800',
    border: 'border-amber-300',
    pillActive: 'bg-amber-600 text-white',
    accentColor: '#D97706',
  },
  M4: {
    name: 'Linia M4',
    bg: 'bg-coral-500/10',
    text: 'text-coral-800',
    border: 'border-coral-300',
    pillActive: 'bg-coral-600 text-white',
    accentColor: '#FF6B4A',
  },
};

const DAY_LABELS: Record<TimetableDayType, string> = {
  weekday: 'Dni robocze',
  saturday: 'Soboty',
  sunday: 'Niedziele i święta',
};

export function ZditmScreen({
  onBack,
  initialLine = 'M2',
  initialStopName,
  isClosing = false,
  onNavigate,
  onOpenMap,
}: ZditmScreenProps) {
  const [selectedLineId, setSelectedLineId] = useState<LineId>(initialLine);
  const [directionIdx, setDirectionIdx] = useState<0 | 1>(0);
  const [activeDay, setActiveDay] = useState<TimetableDayType>(getCurrentTimetableDay());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Aktualna linia
  const currentLine = useMemo(
    () => busLines.find((l) => l.id === selectedLineId) || busLines[0],
    [selectedLineId],
  );

  const currentDirection = currentLine.directions[directionIdx] || currentLine.directions[0];

  // Sekwencja przystanków zależna od kierunku (zgodna z tabelami PDF)
  const activeStops = useMemo<string[]>(() => {
    return currentDirection.stops && currentDirection.stops.length > 0
      ? currentDirection.stops
      : directionIdx === 1
        ? [...currentLine.stops].reverse()
        : currentLine.stops;
  }, [currentLine, currentDirection, directionIdx]);

  // Wybrany przystanek do rozwinięcia rozkładu
  const [selectedStopName, setSelectedStopName] = useState<string>(() => {
    if (initialStopName) {
      const allStops = [
        ...(currentLine.directions[0]?.stops || currentLine.stops),
        ...(currentLine.directions[1]?.stops || currentLine.stops),
      ];
      const direct = allStops.find((s) => s.toLowerCase() === initialStopName.toLowerCase());
      if (direct) return direct;
      const slugMatch = allStops.find((s) => slugify(s) === slugify(initialStopName));
      if (slugMatch) return slugMatch;
    }
    return activeStops[0] || 'Plac Dworcowy';
  });

  // Synchronizacja przy zmianie propsów (np. linki zewnętrzne lub historia URL)
  useEffect(() => {
    if (initialLine && initialLine !== selectedLineId) {
      setSelectedLineId(initialLine);
    }
  }, [initialLine, selectedLineId]);

  useEffect(() => {
    if (initialStopName) {
      const allStops = [
        ...(currentLine.directions[0]?.stops || currentLine.stops),
        ...(currentLine.directions[1]?.stops || currentLine.stops),
      ];
      const match = allStops.find(
        (s) => s.toLowerCase() === initialStopName.toLowerCase() || slugify(s) === slugify(initialStopName),
      );
      if (match && match !== selectedStopName) {
        setSelectedStopName(match);
        // Automatyczne przełączenie kierunku jeśli przystanek jest na trasie powrotnej
        if (
          currentLine.directions[1]?.stops?.includes(match) &&
          !currentLine.directions[0]?.stops?.includes(match)
        ) {
          setDirectionIdx(1);
        }
      }
    }
  }, [initialStopName, currentLine, selectedStopName]);

  // Zmiana kierunku
  const handleToggleDirection = () => {
    setDirectionIdx((prev) => (prev === 0 ? 1 : 0));
  };

  // Zmiana linii (jeśli nowa linia zawiera bieżący przystanek, zachowaj go, inaczej wybierz pierwszy)
  const handleSelectLine = (lineId: LineId) => {
    setSelectedLineId(lineId);
    setDirectionIdx(0);
    const line = busLines.find((l) => l.id === lineId) || busLines[0];
    const nextStop = line.stops.includes(selectedStopName) ? selectedStopName : line.stops[0];
    setSelectedStopName(nextStop);
    onNavigate?.(lineId, nextStop);
  };

  // Wybór przystanku
  const handleSelectStop = (stopName: string) => {
    setSelectedStopName(stopName);
    onNavigate?.(selectedLineId, stopName);
  };

  // Indeksy poprzedniego/następnego przystanku na trasie
  const currentStopIndex = activeStops.indexOf(selectedStopName);
  const prevStopName = currentStopIndex > 0 ? activeStops[currentStopIndex - 1] : null;
  const nextStopName =
    currentStopIndex >= 0 && currentStopIndex < activeStops.length - 1
      ? activeStops[currentStopIndex + 1]
      : null;

  // Rozkład dla aktualnie wybranego przystanku
  const timetable = useMemo(() => {
    return getOfficialStopTimetable(selectedLineId, selectedStopName, directionIdx);
  }, [selectedLineId, selectedStopName, directionIdx]);

  // Następny autobus wg aktualnego dnia i zegara
  const nextBus = useMemo(() => {
    return getNextScheduledBus(timetable[activeDay]);
  }, [timetable, activeDay]);

  // Pogrupowane godziny
  const groupedHours = useMemo(() => {
    return groupTimetableByHours(timetable[activeDay]);
  }, [timetable, activeDay]);

  // Wyszukiwanie przystanków
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return REAL_BUS_STOPS.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 20);
  }, [searchQuery]);

  const todayKey = getCurrentTimetableDay();

  return (
    <div
      className={cn(
        'fixed inset-0 md:top-16 z-50 flex flex-col bg-mist select-none',
        isClosing ? 'native-screen-exit' : 'native-screen-slide',
      )}
    >
      {/* 1. TOP BAR — Minimalistyczny nagłówek z powrotem i wyszukiwarką */}
      <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-mist-300 bg-white/95 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="grid h-10 w-10 place-items-center rounded-xl text-ink hover:bg-mist active:scale-95 transition-all cursor-pointer"
            aria-label="Wróć"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-display text-[17px] font-bold text-ink leading-tight">
              Rozkład jazdy ZDiTM
            </h1>
            <p className="text-[11.5px] font-medium text-ink-500">
              Mińsk Mazowiecki · Oficjalny rozkład miejski
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenMap && (
            <button
              type="button"
              onClick={() => onOpenMap(selectedLineId)}
              className="flex items-center gap-1.5 h-10 px-3 rounded-xl bg-mist/80 hover:bg-mist text-ink text-[12.5px] font-bold active:scale-95 transition-all cursor-pointer border border-mist-300"
              title="Przejdź do mapy na żywo"
              aria-label="Mapa na żywo"
            >
              <Map className="h-4 w-4 text-coral-500" />
              <span className="hidden sm:inline">Mapa</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsSearchOpen((prev) => !prev)}
            className={cn(
              'grid h-10 w-10 place-items-center rounded-xl transition-all cursor-pointer',
              isSearchOpen ? 'bg-ink text-white' : 'text-ink-600 hover:bg-mist',
            )}
            aria-label="Wyszukaj przystanek"
          >
            {isSearchOpen ? <X className="h-4 w-4" /> : <Search className="h-4.5 w-4.5" />}
          </button>
        </div>
      </header>

      {/* 2. POLE WYSZUKIWARKI PRZYSTANKÓW (ROZWIJANE) */}
      {isSearchOpen && (
        <div className="border-b border-mist-300 bg-white p-3.5 shadow-sm">
          <div className="relative max-w-4xl mx-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Wpisz nazwę przystanku (np. Plac Dworcowy, Szpital, Boczna)..."
              className="h-11 w-full rounded-xl bg-mist/60 pl-10 pr-10 text-[13.5px] font-medium text-ink outline-none placeholder:text-ink-400 focus:bg-white focus:ring-2 focus:ring-ink/10 transition-all border border-mist-300"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {searchQuery && (
            <div className="mt-2.5 max-h-56 overflow-y-auto divide-y divide-mist-200 rounded-xl bg-white border border-mist-300 max-w-4xl mx-auto">
              {searchResults.length > 0 ? (
                searchResults.map((stop) => (
                  <button
                    key={stop.id}
                    type="button"
                    onClick={() => {
                      const matchedLine = busLines.find((l) =>
                        l.stops.some((st) => stop.name.toLowerCase().includes(st.toLowerCase())),
                      );
                      if (matchedLine) {
                        setSelectedLineId(matchedLine.id);
                        const cleanName =
                          matchedLine.stops.find((st) =>
                            stop.name.toLowerCase().includes(st.toLowerCase()),
                          ) || matchedLine.stops[0];
                        setSelectedStopName(cleanName);
                        onNavigate?.(matchedLine.id, cleanName);
                      } else {
                        setSelectedStopName(stop.name);
                        onNavigate?.(selectedLineId, stop.name);
                      }
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex w-full items-center justify-between p-3 text-left hover:bg-mist/50 transition-colors cursor-pointer gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MapPin className="h-4 w-4 text-coral shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[13px] font-bold text-ink truncate">
                            {stop.fullName || stop.name}
                          </span>
                          {stop.ref && (
                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              Słupek {stop.ref}
                            </span>
                          )}
                          <span className="text-[10px] font-medium text-ink-500">
                            • {stop.zone}
                          </span>
                        </div>
                        {stop.lines.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            {stop.lines.map((l) => (
                              <span
                                key={l}
                                className="text-[9.5px] font-black px-1.5 py-0.2 rounded bg-ink/10 text-ink"
                              >
                                {l}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-coral shrink-0">
                      Wybierz ›
                    </span>
                  </button>
                ))
              ) : (
                <p className="p-4 text-center text-[12.5px] text-ink-500">
                  Nie znaleziono przystanku o tej nazwie w Mińsku.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. GŁÓWNA TREŚĆ — Podział na Selektor Linii, Kierunek, Pasek Przystanków i Tablicę Godzinową */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 md:px-8 space-y-4 max-w-4xl mx-auto w-full pb-24">
        {/* SELEKTOR LINII (M1, M2, M3, M4) */}
        <section aria-label="Wybór linii miejskiej">
          <div className="grid grid-cols-4 gap-2">
            {(['M1', 'M2', 'M3', 'M4'] as LineId[]).map((lineId) => {
              const isSelected = selectedLineId === lineId;
              const cfg = LINE_CONFIG[lineId];
              return (
                <button
                  key={lineId}
                  type="button"
                  onClick={() => handleSelectLine(lineId)}
                  className={cn(
                    'h-12 rounded-2xl font-bold text-[14px] flex items-center justify-center gap-1.5 transition-all cursor-pointer border',
                    isSelected
                      ? cn(cfg.pillActive, 'shadow-sm border-transparent')
                      : 'bg-white text-ink-700 border-mist-300 hover:bg-mist/60',
                  )}
                >
                  <Bus className="h-4 w-4" />
                  <span>{lineId}</span>
                </button>
              );
            })}
          </div>

          <p className="mt-2 text-center text-[12px] font-medium text-ink-500 truncate">
            {currentLine.route}
          </p>
        </section>

        {/* PRZEŁĄCZNIK KIERUNKU */}
        <div className="flex items-center justify-between rounded-2xl bg-white p-3.5 shadow-card border border-mist-200">
          <div className="min-w-0 pr-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400 block">
              Kierunek trasy ({currentDirection.name})
            </span>
            <p className="text-[14px] font-bold text-ink truncate mt-0.5">
              Docelowy: <strong className="text-coral">{currentDirection.destination}</strong>
            </p>
            <p className="text-[11px] text-ink-500 truncate">
              Częstotliwość kursowania: {currentDirection.frequency}
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleDirection}
            className="flex items-center gap-1.5 rounded-xl bg-mist px-3 py-2 text-[12px] font-bold text-ink hover:bg-mist-300 active:scale-95 transition-all shrink-0 cursor-pointer border border-mist-300"
          >
            <ArrowRightLeft className="h-3.5 w-3.5 text-coral" />
            <span>Zmień</span>
          </button>
        </div>

        {/* =========================================================================
            WYBÓR PRZYSTANKU NA TRASIE (Interactive Horizontal Stop Chips)
            ========================================================================= */}
        <section aria-label="Wybór przystanku na trasie" className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-[12px] font-bold text-ink-600">
              <MapPin className="h-3.5 w-3.5 text-coral" />
              <span>Przystanki na linii {selectedLineId} ({activeStops.length})</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={!prevStopName}
                onClick={() => prevStopName && handleSelectStop(prevStopName)}
                className="h-7 px-2 rounded-lg bg-white border border-mist-300 text-[11px] font-bold text-ink-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-mist active:scale-95 transition-all flex items-center gap-0.5 cursor-pointer"
                title={prevStopName ? `Poprzedni: ${prevStopName}` : 'Początek trasy'}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Poprzedni</span>
              </button>
              <button
                type="button"
                disabled={!nextStopName}
                onClick={() => nextStopName && handleSelectStop(nextStopName)}
                className="h-7 px-2 rounded-lg bg-white border border-mist-300 text-[11px] font-bold text-ink-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-mist active:scale-95 transition-all flex items-center gap-0.5 cursor-pointer"
                title={nextStopName ? `Następny: ${nextStopName}` : 'Koniec trasy'}
              >
                <span className="hidden sm:inline">Następny</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Pozioma wstążka przystanków ze wskaźnikami kolejności */}
          <div className="flex gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth">
            {activeStops.map((stopName, idx) => {
              const isSelected = selectedStopName === stopName;
              return (
                <button
                  key={stopName}
                  type="button"
                  onClick={() => handleSelectStop(stopName)}
                  className={cn(
                    'shrink-0 h-10 px-3.5 rounded-xl font-bold text-[12.5px] flex items-center gap-2 transition-all cursor-pointer border',
                    isSelected
                      ? 'bg-ink text-white border-ink shadow-xs ring-2 ring-ink/10'
                      : 'bg-white text-ink-700 border-mist-300 hover:border-ink-300 hover:bg-mist/40',
                  )}
                >
                  <span
                    className={cn(
                      'grid h-5 w-5 place-items-center rounded-full text-[10px] font-extrabold',
                      isSelected ? 'bg-white text-ink' : 'bg-mist-200 text-ink-500',
                    )}
                  >
                    {idx + 1}
                  </span>
                  <span className="whitespace-nowrap">{stopName}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            HERO ROZKŁAD GODZINOWY DLA WYBRANEGO PRZYSTANKU
            ========================================================================= */}
        <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-card border border-mist-200 space-y-4">
          {/* Nagłówek wybranego przystanku */}
          <div className="flex items-start justify-between gap-3 border-b border-mist pb-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-xl bg-ink text-white text-[12px] font-bold">
                  {selectedLineId}
                </span>
                <h2 className="text-[20px] sm:text-[22px] font-bold text-ink leading-tight truncate">
                  {selectedStopName}
                </h2>
              </div>
              <p className="text-[12px] text-ink-500 mt-1">
                Kierunek: <strong className="text-ink font-semibold">{currentDirection.destination}</strong> · Przystanek {currentStopIndex + 1} z {activeStops.length}
              </p>
            </div>
          </div>

          {/* DNI TYGODNIA: TABS */}
          <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-mist/70 p-1 border border-mist-300/80">
            {(['weekday', 'saturday', 'sunday'] as TimetableDayType[]).map((dayKey) => {
              const isCurrent = activeDay === dayKey;
              const isToday = todayKey === dayKey;
              return (
                <button
                  key={dayKey}
                  type="button"
                  onClick={() => setActiveDay(dayKey)}
                  className={cn(
                    'py-2 rounded-xl text-[12px] font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1',
                    isCurrent
                      ? 'bg-white text-ink shadow-sm'
                      : 'text-ink-500 hover:text-ink',
                  )}
                >
                  <span>{DAY_LABELS[dayKey]}</span>
                  {isToday && (
                    <span className="text-[9.5px] font-extrabold text-coral uppercase">
                      (Dziś)
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* NASTĘPNY KURS (PLANOWANY) */}
          {nextBus && (
            <div className="flex items-center justify-between rounded-2xl bg-sand-50 p-3.5 border border-sand-200">
              <div className="flex items-center gap-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-xl bg-sand text-coral font-bold text-[12px]">
                  <Clock className="h-4 w-4 text-ink" />
                </span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500 block flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-coral" />
                    Najbliższy planowany odjazd
                  </span>
                  <span className="font-display text-[15px] sm:text-[16px] font-bold text-ink">
                    {nextBus.isTomorrow ? `Jutro o ${nextBus.time}` : `Godzina ${nextBus.time}`}
                  </span>
                </div>
              </div>
              <span className="rounded-xl bg-ink px-3.5 py-1.5 font-mono text-[14px] font-extrabold text-white shadow-2xs">
                {nextBus.isTomorrow ? `Jutro ${nextBus.time}` : nextBus.time}
              </span>
            </div>
          )}

          {/* TABLICA GODZINOWA (SIATKA CZASÓW) */}
          <div className="space-y-2 pt-1">
            <h3 className="text-[11.5px] font-bold uppercase tracking-wider text-ink-400">
              Pełny rozkład godzinowy ({DAY_LABELS[activeDay]})
            </h3>

            <div className="divide-y divide-mist-200 rounded-2xl border border-mist-200 overflow-hidden bg-mist/20">
              {groupedHours.length > 0 ? (
                groupedHours.map(({ hour, minutes }) => (
                  <div
                    key={hour}
                    className="flex items-center gap-4 px-4 py-2.5 hover:bg-white transition-colors"
                  >
                    <span className="font-display text-[15px] font-extrabold text-ink w-8 shrink-0">
                      {hour}:
                    </span>
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                      {minutes.map((m, idx) => {
                        const fullTime = `${hour}:${m}`;
                        const isNext = !nextBus?.isTomorrow && nextBus?.time === fullTime;
                        return (
                          <span
                            key={idx}
                            className={cn(
                              'text-[13.5px] font-semibold px-2 py-0.5 rounded-md transition-all',
                              isNext
                                ? 'bg-ink text-white font-bold shadow-2xs ring-1 ring-coral/40'
                                : 'text-ink-700 bg-white border border-mist-300',
                            )}
                          >
                            {m}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-4 text-center text-[12.5px] text-ink-500">
                  Brak kursów w tym dniu.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            OŚ TRASY — Pełna sekwencja przystanków z możliwością wyboru
            ========================================================================= */}
        <section className="rounded-3xl bg-white p-5 shadow-card border border-mist-200 space-y-3">
          <div className="flex items-center justify-between border-b border-mist pb-2.5">
            <h3 className="font-display text-[15px] font-bold text-ink">
              Przebieg trasy {selectedLineId} ({activeStops.length} przystanków)
            </h3>
            <span className="text-[11px] font-semibold text-ink-400">
              Dotknij, aby zmienić przystanek
            </span>
          </div>

          <div className="relative pl-6 space-y-2.5 pt-2">
            {/* Pionowa linia łącząca */}
            <div
              className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-mist-300"
              aria-hidden
            />

            {activeStops.map((stopName, idx) => {
              const isSelected = selectedStopName === stopName;
              const isFirst = idx === 0;
              const isLast = idx === activeStops.length - 1;

              return (
                <button
                  key={stopName}
                  type="button"
                  onClick={() => handleSelectStop(stopName)}
                  className={cn(
                    'relative flex w-full items-center justify-between py-1.5 text-left transition-all cursor-pointer group',
                  )}
                >
                  {/* Kropka na osi */}
                  <span
                    className={cn(
                      'absolute -left-6 grid h-6 w-6 place-items-center rounded-full border-2 bg-white transition-all',
                      isSelected
                        ? 'border-ink bg-ink text-white shadow-xs'
                        : isFirst || isLast
                        ? 'border-ink-700 text-ink-700'
                        : 'border-mist-400 group-hover:border-ink',
                    )}
                  >
                    {isSelected ? (
                      <Check className="h-3 w-3 stroke-[3]" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-ink-400" />
                    )}
                  </span>

                  <span
                    className={cn(
                      'text-[13.5px] transition-colors truncate pr-2',
                      isSelected
                        ? 'font-bold text-ink'
                        : 'font-medium text-ink-600 group-hover:text-ink',
                    )}
                  >
                    {idx + 1}. {stopName}
                    {isFirst && (
                      <span className="ml-2 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                        Początek
                      </span>
                    )}
                    {isLast && (
                      <span className="ml-2 text-[10px] font-bold text-ink-700 bg-mist px-1.5 py-0.5 rounded">
                        Koniec trasy
                      </span>
                    )}
                  </span>

                  {isSelected && (
                    <span className="text-[11.5px] font-bold text-coral shrink-0">
                      Wybrany ›
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
