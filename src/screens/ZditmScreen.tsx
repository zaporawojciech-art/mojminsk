import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Clock,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { cn } from '../components/ui';
import {
  busLines,
  getAllBusStopsList,
  getUpcomingDepartures,
  type FavoriteBusStop,
  type LineId,
} from '../data/mockData';

interface ZditmScreenProps {
  onBack: () => void;
  initialLine?: LineId;
  initialStopName?: string;
  isClosing?: boolean;
  favoriteBuses?: FavoriteBusStop[];
  onToggleFavorite?: (fav: Omit<FavoriteBusStop, 'id'>) => void;
  onRemoveFavorite?: (id: string) => void;
}

const lineBadges: Record<LineId, string> = {
  M2: 'bg-sky-100 text-sky-900 border-sky-200',
  M3: 'bg-sand-100 text-sand-900 border-sand-200',
  M4: 'bg-coral-100 text-coral-900 border-coral-200',
};

export function ZditmScreen({
  onBack,
  initialLine: _initialLine,
  initialStopName,
  isClosing = false,
  favoriteBuses = [],
  onToggleFavorite,
  onRemoveFavorite,
}: ZditmScreenProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(() => initialStopName || '');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dayType, setDayType] = useState<'weekday' | 'saturday' | 'sunday'>('weekday');

  const allStops = useMemo(() => getAllBusStopsList(), []);

  // Filtrowane przystanki do wyboru
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return allStops.slice(0, 8);
    return allStops
      .filter((s) => s.name.toLowerCase().includes(q) || s.routes.some((r) => r.destination.toLowerCase().includes(q)))
      .slice(0, 15);
  }, [allStops, searchQuery]);

  return (
    <div
      className={cn(
        'fixed inset-0 md:relative md:inset-auto md:h-full md:w-full z-50 flex flex-col bg-mist select-none',
        isClosing ? 'native-screen-exit' : 'native-screen-slide',
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-md md:max-w-none flex-col overflow-hidden bg-mist">
        {/* Minimalistyczny Top Bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-mist-300/80 bg-white/95 px-4 md:px-8 lg:px-12 backdrop-blur pt-[max(env(safe-area-inset-top),8px)] md:pt-0 shrink-0">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-[13.5px] font-bold text-ink hover:text-ink-600 active:scale-95 transition-transform cursor-pointer"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            Wróć
          </button>

          <h1 className="font-display text-[15.5px] md:text-[17px] font-bold text-ink">
            Komunikacja Miejska ZDiTM Mińsk Mazowiecki
          </h1>

          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden flex items-center gap-1 rounded-xl bg-ink px-3 py-1.5 text-[12px] font-bold text-white shadow-xs hover:bg-ink-700 active:scale-95 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Dodaj
          </button>
          <div className="hidden md:flex items-center gap-2 text-[12px] font-bold text-ink-500">
            <span>Bezpłatna komunikacja miejska:</span>
            <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-900 font-black">M2</span>
            <span className="px-2 py-0.5 rounded-md bg-sand-100 text-sand-900 font-black">M3</span>
            <span className="px-2 py-0.5 rounded-md bg-coral-100 text-coral-900 font-black">M4</span>
          </div>
        </header>

        {/* =====================================================================
            DESKTOP VIEW (>= 768px): 12-Column Split (Left Stop Finder, Right Timetables)
            ===================================================================== */}
        <div className="hidden md:grid md:grid-cols-12 md:gap-6 md:px-8 lg:px-12 md:py-6 flex-1 overflow-hidden">
          {/* LEFT COLUMN (4 cols): Always-open Stop & Line Finder */}
          <div className="col-span-5 lg:col-span-4 flex flex-col rounded-2xl border border-mist-200 bg-white shadow-xs overflow-hidden h-full">
            <div className="p-4 border-b border-mist-200 space-y-2.5 shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-[14.5px] font-bold text-ink">
                  Wszystkie przystanki ZDiTM
                </h2>
                <span className="text-[11px] font-semibold text-ink-400">
                  {allStops.length} lokalizacji
                </span>
              </div>
              <div className="flex h-10 items-center gap-2 rounded-xl border border-mist-300 bg-mist/60 px-3 focus-within:border-ink focus-within:bg-white transition-all">
                <Search className="h-4 w-4 text-ink-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Szukaj przystanku lub ulicy..."
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

            <div className="flex-1 overflow-y-auto divide-y divide-mist-100 p-2">
              {(searchQuery.trim() ? searchResults : allStops).map((stop) => (
                <div key={stop.name} className="p-2.5 space-y-1.5">
                  <p className="text-[12.5px] font-bold text-ink px-1">{stop.name}</p>
                  <div className="space-y-1">
                    {stop.routes.map((route, rIdx) => {
                      const isAdded = favoriteBuses.some(
                        (f) =>
                          f.lineId === route.lineId &&
                          f.stopName === stop.name &&
                          f.directionIdx === route.directionIdx,
                      );

                      return (
                        <button
                          key={rIdx}
                          type="button"
                          disabled={isAdded}
                          onClick={() => {
                            onToggleFavorite?.({
                              lineId: route.lineId,
                              stopName: stop.name,
                              directionIdx: route.directionIdx,
                              directionName: route.directionName,
                              destination: route.destination,
                            });
                          }}
                          className={cn(
                            'flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left transition-colors cursor-pointer',
                            isAdded
                              ? 'bg-mist/30 text-ink-400 cursor-default'
                              : 'bg-mist/60 hover:bg-mist-200/70',
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={cn(
                                'px-1.5 py-0.5 rounded-md text-[10.5px] font-black border shrink-0',
                                lineBadges[route.lineId],
                              )}
                            >
                              {route.lineId}
                            </span>
                            <span className="text-[12px] font-medium text-ink truncate">
                              ➔ {route.destination}
                            </span>
                          </div>
                          <span
                            className={cn(
                              'text-[11px] font-bold shrink-0',
                              isAdded ? 'text-emerald-700' : 'text-ink hover:underline',
                            )}
                          >
                            {isAdded ? '✓ Obserwowany' : '+ Obserwuj'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN (8 cols): Observed Stops & Live Timetables */}
          <div className="col-span-7 lg:col-span-8 flex flex-col overflow-y-auto space-y-4 pr-1">
            <div className="flex items-center justify-between rounded-2xl border border-mist-200 bg-white px-5 py-3.5 shadow-xs">
              <div>
                <h2 className="font-display text-[15.5px] font-bold text-ink">
                  Twoje obserwowane przystanki ({favoriteBuses.length})
                </h2>
                <p className="text-[12px] text-ink-500">
                  Kliknij wybrany przystanek po lewej stronie, aby przypiąć go do swojego pulpitu i widoku głównego.
                </p>
              </div>
              <div className="flex rounded-xl bg-mist p-1 text-[12px] font-bold shrink-0">
                {(['weekday', 'saturday', 'sunday'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDayType(d)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg transition-all cursor-pointer',
                      dayType === d ? 'bg-white text-ink shadow-xs' : 'text-ink-500 hover:text-ink',
                    )}
                  >
                    {d === 'weekday' ? 'Dni robocze (Pn-Pt)' : d === 'saturday' ? 'Soboty' : 'Niedziele'}
                  </button>
                ))}
              </div>
            </div>

            {favoriteBuses.length === 0 ? (
              <div className="rounded-2xl border border-mist-200 bg-white py-16 text-center space-y-3 px-6 shadow-xs">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-mist text-ink-400">
                  <Clock className="h-6 w-6 text-ink-400" />
                </div>
                <h3 className="font-display text-[16px] font-bold text-ink">Brak przypiętych przystanków</h3>
                <p className="text-[13px] text-ink-500 max-w-md mx-auto">
                  Wybierz przystanek z listy po lewej stronie i kliknij „+ Obserwuj”, aby śledzić odjazdy autobusów M2, M3 i M4 na żywo.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                {favoriteBuses.map((fav) => {
                  const line = busLines.find((l) => l.id === fav.lineId);
                  const departures = getUpcomingDepartures(fav.lineId, fav.stopName, fav.directionIdx);
                  const dir = line?.directions[fav.directionIdx];

                  return (
                    <div
                      key={fav.id}
                      className="rounded-2xl bg-white p-4 shadow-xs border border-mist-200 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={cn(
                              'px-2.5 py-1 rounded-xl text-[13px] font-black border shrink-0',
                              lineBadges[fav.lineId],
                            )}
                          >
                            {fav.lineId}
                          </span>
                          <div className="min-w-0">
                            <h3 className="text-[15px] font-bold text-ink truncate">
                              {fav.stopName}
                            </h3>
                            <p className="text-[12px] text-ink-500 truncate">
                              Kierunek: <strong className="text-ink-700">{fav.destination}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className="flex items-baseline justify-end gap-1">
                              <span className="font-display text-[22px] font-extrabold text-ink leading-none">
                                {departures[0]}
                              </span>
                              <span className="text-[11px] font-bold text-ink-500">min</span>
                            </div>
                            <p className="text-[10.5px] text-ink-400 mt-0.5">
                              kolejny za {departures[1]} min
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => onRemoveFavorite?.(fav.id)}
                            title="Usuń z obserwowanych"
                            className="grid h-8 w-8 place-items-center rounded-xl bg-mist text-ink-400 hover:bg-coral-50 hover:text-coral transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {dir && (
                        <div className="pt-2.5 border-t border-mist-100">
                          <p className="text-[10.5px] font-bold uppercase tracking-wider text-ink-400 mb-2">
                            Pełny rozkład odjazdów ({dayType === 'weekday' ? 'Pn-Pt' : dayType === 'saturday' ? 'Sobota' : 'Niedziela'})
                          </p>
                          <div className="grid grid-cols-6 gap-1.5">
                            {dir.departures[dayType]?.map((time) => (
                              <div
                                key={time}
                                className="rounded-lg bg-mist/70 py-1 text-center text-[12px] font-semibold text-ink tabular-nums"
                              >
                                {time}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* =====================================================================
            MOBILE VIEW (< 768px): Original Native Layout
            ===================================================================== */}
        <main className="md:hidden flex-1 overflow-y-auto overscroll-contain p-4 space-y-2.5 pb-16">
          {favoriteBuses.length === 0 ? (
            <div className="py-20 text-center space-y-3 px-6">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-ink-400 shadow-xs border border-mist-300">
                <Clock className="h-6 w-6 text-ink-400" />
              </div>
              <h2 className="font-display text-[16px] font-bold text-ink">Brak zapisanych przystanków</h2>
              <p className="text-[12.5px] text-ink-500 max-w-xs mx-auto leading-relaxed">
                Dodaj przystanki, z których korzystasz w Mińsku Mazowieckim, aby widzieć najbliższe odjazdy.
              </p>
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-ink px-5 text-[13px] font-bold text-white shadow-sm hover:bg-ink-700 active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4" />
                Dodaj pierwszy przystanek
              </button>
            </div>
          ) : (
            favoriteBuses.map((fav) => {
              const line = busLines.find((l) => l.id === fav.lineId);
              const isExpanded = expandedId === fav.id;
              const departures = getUpcomingDepartures(fav.lineId, fav.stopName, fav.directionIdx);
              const dir = line?.directions[fav.directionIdx];

              return (
                <div
                  key={fav.id}
                  className="rounded-2xl bg-white p-3.5 shadow-sm border border-mist-300/70 transition-all"
                >
                  {/* Wiersz główny */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : fav.id)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-lg text-[11.5px] font-black border shrink-0',
                          lineBadges[fav.lineId],
                        )}
                      >
                        {fav.lineId}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-[14.5px] font-bold text-ink truncate leading-tight">
                            {fav.stopName}
                          </h3>
                          {fav.customLabel && (
                            <span className="text-[10.5px] font-semibold text-ink-400">
                              ({fav.customLabel})
                            </span>
                          )}
                        </div>
                        <p className="text-[11.5px] text-ink-400 truncate mt-0.5">
                          ➔ {fav.destination}
                        </p>
                      </div>
                    </div>

                    {/* Najbliższy odjazd */}
                    <div className="text-right shrink-0">
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="font-display text-[21px] font-extrabold text-ink leading-none">
                          {departures[0]}
                        </span>
                        <span className="text-[11px] font-bold text-ink-500">min</span>
                      </div>
                      <p className="text-[10px] text-ink-400 mt-0.5">kolejny {departures[1]} min</p>
                    </div>
                  </div>

                  {/* Rozwinięcie pełnego rozkładu */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-mist/80 space-y-2.5 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        {/* Przełącznik dni */}
                        <div className="flex rounded-lg bg-mist p-0.5 text-[11px] font-bold">
                          {(['weekday', 'saturday', 'sunday'] as const).map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDayType(d);
                              }}
                              className={cn(
                                'px-2 py-1 rounded-md transition-all',
                                dayType === d ? 'bg-white text-ink shadow-xs' : 'text-ink-400',
                              )}
                            >
                              {d === 'weekday' ? 'Pn-Pt' : d === 'saturday' ? 'Sob' : 'Ndz'}
                            </button>
                          ))}
                        </div>

                        {/* Usuń z listy */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFavorite?.(fav.id);
                          }}
                          className="flex items-center gap-1 text-[11px] font-bold text-coral hover:text-coral-700 active:scale-95 transition-transform"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Usuń
                        </button>
                      </div>

                      {/* Odjazdy godzinowe */}
                      {dir && (
                        <div className="grid grid-cols-5 gap-1 pt-1 max-h-36 overflow-y-auto overscroll-contain">
                          {dir.departures[dayType]?.map((time) => (
                            <div
                              key={time}
                              className="rounded-md bg-mist/60 py-1 text-center text-[12px] font-semibold text-ink"
                            >
                              {time}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </main>

        {/* Modal / Nakładka wyszukiwania przystanków */}
        {isSearchOpen && (
          <div className="absolute inset-0 z-30 flex flex-col bg-white select-none">
            {/* Search Header */}
            <div className="flex h-14 items-center gap-2 border-b border-mist-300 px-4 pt-[max(env(safe-area-inset-top),8px)]">
              <Search className="h-4.5 w-4.5 text-ink-400 shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Wpisz nazwę przystanku..."
                className="flex-1 bg-transparent text-[14px] font-medium text-ink placeholder:text-ink-400 outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="grid h-8 w-8 place-items-center rounded-full bg-mist text-ink-600 hover:text-ink active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Wyniki wyszukiwania */}
            <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-mist">
              {searchResults.map((stop) => (
                <div key={stop.name} className="p-3 space-y-1.5">
                  <p className="text-[13px] font-bold text-ink px-1">{stop.name}</p>
                  <div className="space-y-1">
                    {stop.routes.map((route, rIdx) => {
                      const isAdded = favoriteBuses.some(
                        (f) =>
                          f.lineId === route.lineId &&
                          f.stopName === stop.name &&
                          f.directionIdx === route.directionIdx,
                      );

                      return (
                        <button
                          key={rIdx}
                          type="button"
                          disabled={isAdded}
                          onClick={() => {
                            onToggleFavorite?.({
                              lineId: route.lineId,
                              stopName: stop.name,
                              directionIdx: route.directionIdx,
                              directionName: route.directionName,
                              destination: route.destination,
                            });
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className={cn(
                            'flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left transition-colors',
                            isAdded
                              ? 'bg-mist/30 text-ink-400'
                              : 'bg-mist/60 hover:bg-mist active:bg-mist-300/60',
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={cn(
                                'px-1.5 py-0.5 rounded-md text-[10.5px] font-black border shrink-0',
                                lineBadges[route.lineId],
                              )}
                            >
                              {route.lineId}
                            </span>
                            <span className="text-[12px] font-medium text-ink truncate">
                              ➔ {route.destination}
                            </span>
                          </div>
                          <span
                            className={cn(
                              'text-[11px] font-bold shrink-0',
                              isAdded ? 'text-ink-300' : 'text-ink hover:underline',
                            )}
                          >
                            {isAdded ? 'Dodany' : '+ Dodaj'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
