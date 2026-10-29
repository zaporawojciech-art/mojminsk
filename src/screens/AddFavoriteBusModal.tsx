import { useState, useMemo, useEffect } from 'react';
import { ChevronRight, MapPin, Search } from 'lucide-react';
import { NativeHeader, cn } from '../components/ui';
import {
  getAllBusStopsList,
  getUpcomingDepartures,
  type FavoriteBusStop,
  type LineId,
} from '../data/mockData';

interface AddFavoriteBusModalProps {
  onClose: () => void;
  onSave: (fav: Omit<FavoriteBusStop, 'id'>) => void;
  isClosing?: boolean;
}

const lineTone: Record<LineId, { badge: string; border: string }> = {
  M1: { badge: 'bg-emerald-100 text-emerald-900', border: 'border-emerald-300' },
  M2: { badge: 'bg-sky text-ink', border: 'border-sky-300' },
  M3: { badge: 'bg-sand text-ink', border: 'border-sand-300' },
  M4: { badge: 'bg-coral text-ink', border: 'border-coral-300' },
};

export function AddFavoriteBusModal({
  onClose,
  onSave,
  isClosing = false,
}: AddFavoriteBusModalProps) {
  const [search, setSearch] = useState('');
  const [expandedStop, setExpandedStop] = useState<string | null>(null);

  const allStops = useMemo(() => getAllBusStopsList(), []);

  const filteredStops = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return allStops;
    return allStops.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.zone.toLowerCase().includes(q) ||
        s.routes.some((r) => r.destination.toLowerCase().includes(q) || r.lineId.toLowerCase().includes(q)),
    );
  }, [allStops, search]);

  // Gdy wyszukiwanie zawęzi wynik do 1 przystanku, rozwiń go automatycznie
  useEffect(() => {
    if (filteredStops.length === 1) {
      setExpandedStop(filteredStops[0].name);
    }
  }, [filteredStops]);

  const handleSelectRoute = (stopName: string, route: (typeof allStops)[0]['routes'][0]) => {
    onSave({
      lineId: route.lineId,
      stopName,
      directionIdx: route.directionIdx,
      directionName: route.directionName,
      destination: route.destination,
      customLabel: stopName === 'Spacerowa' ? 'Dom' : undefined,
    });
    onClose();
  };

  return (
    <div
      className={cn(
        'fixed inset-0 md:relative md:inset-auto md:h-full md:w-full z-50 flex flex-col bg-mist select-none',
        isClosing ? 'native-screen-exit' : 'native-screen-slide',
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-md md:max-w-none flex-col overflow-hidden bg-mist">
        <NativeHeader
          title="Wybierz przystanek z listy"
          backLabel="Wróć"
          onBack={onClose}
        />

        {/* Search Bar */}
        <div className="border-b border-mist-300 bg-white px-5 md:px-8 lg:px-12 py-3 shadow-xs">
          <div className="relative flex items-center max-w-xl">
            <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-ink-400" />
            <input
              type="text"
              placeholder="Wpisz nazwę przystanku (np. Spacerowa, PKP)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl md:rounded-xl bg-mist py-2.5 pl-10 pr-4 text-[13px] font-medium text-ink placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-ink"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 text-[12px] font-semibold text-ink-400 hover:text-ink"
              >
                Wyczyść
              </button>
            )}
          </div>
          <p className="mt-2 text-[11.5px] text-ink-500 font-medium">
            Dotknij przystanek z listy, aby rozwinąć kierunki i dodać go do obserwowanych.
          </p>
        </div>

        {/* Stops List */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 md:px-6 lg:px-8 py-4 md:py-6 pb-24 md:pb-12">
          <div className="mx-auto max-w-2xl space-y-3">
            {filteredStops.length === 0 ? (
              <div className="rounded-3xl bg-white p-8 text-center text-ink-500 shadow-card">
                <MapPin className="mx-auto h-8 w-8 text-ink-300" />
                <p className="mt-2 font-display text-[15px] font-bold text-ink">Nie znaleziono przystanku</p>
                <p className="mt-1 text-[12px]">Spróbuj wpisać inną nazwę ulicy lub węzła w Mińsku.</p>
              </div>
            ) : (
              filteredStops.map((stop) => {
                const isExpanded = expandedStop === stop.name;

                return (
                  <div
                    key={stop.name}
                    className={cn(
                      'rounded-2xl md:rounded-3xl bg-white shadow-card transition-all border overflow-hidden',
                      isExpanded ? 'border-ink shadow-md' : 'border-transparent hover:border-mist-300'
                    )}
                  >
                    {/* Stop Header Row */}
                    <button
                      type="button"
                      onClick={() => setExpandedStop(isExpanded ? null : stop.name)}
                      className="flex w-full items-center justify-between p-3.5 md:p-4 text-left transition-colors hover:bg-mist/30 active:bg-mist/50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-mist text-ink-700">
                          <MapPin className="h-5 w-5 text-coral-700" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-display text-[15.5px] md:text-[16px] font-bold text-ink truncate">
                              {stop.name}
                            </p>
                            {stop.isTransfer && (
                              <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-[9.5px] font-extrabold text-sky-800 shrink-0">
                                Węzeł PKP
                              </span>
                            )}
                          </div>
                          <p className="text-[11.5px] text-ink-400">
                            {stop.zone} · {stop.routes.length} {stop.routes.length === 1 ? 'kierunek' : 'kierunki'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pl-2">
                        <div className="flex -space-x-1">
                          {Array.from(new Set(stop.routes.map((r) => r.lineId))).map((lid) => (
                            <span
                              key={lid}
                              className={cn(
                                'rounded-md px-1.5 py-0.5 text-[10.5px] font-extrabold border border-white',
                                lineTone[lid].badge,
                              )}
                            >
                              {lid}
                            </span>
                          ))}
                        </div>
                        <span
                          className={cn(
                            'grid h-7 w-7 place-items-center rounded-full bg-mist/60 text-ink-500 transition-transform duration-200',
                            isExpanded && 'rotate-90 bg-ink text-white'
                          )}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      </div>
                    </button>

                    {/* Expanded Directions / Routes */}
                    {isExpanded && (
                      <div className="border-t border-mist-200 bg-sand-50/70 p-3 md:p-4 space-y-2.5">
                        <div className="flex items-center justify-between px-1">
                          <p className="text-[11.5px] font-extrabold text-ink">
                            Wybierz kierunek, by dodać do obserwowanych:
                          </p>
                          <span className="text-[10.5px] text-ink-400 font-semibold">
                            Dotknij wybraną trasę
                          </span>
                        </div>
                        <div className="space-y-2">
                          {stop.routes.map((r) => {
                            const upcoming = getUpcomingDepartures(r.lineId, stop.name, r.directionIdx);
                            return (
                              <button
                                key={`${r.lineId}-${r.destination}-${r.directionIdx}`}
                                type="button"
                                onClick={() => handleSelectRoute(stop.name, r)}
                                className="group flex w-full items-center justify-between rounded-xl md:rounded-2xl bg-white p-3 md:p-3.5 text-left shadow-xs border border-mist-200 transition-all active:scale-[.98] hover:border-ink hover:shadow-sm cursor-pointer"
                              >
                                <div className="flex items-center gap-3 min-w-0 pr-2">
                                  <span className={cn('shrink-0 rounded-lg px-2.5 py-1 text-[12px] font-black', lineTone[r.lineId].badge)}>
                                    {r.lineId}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="truncate text-[13.5px] font-bold text-ink group-hover:text-ink-700">
                                      ➔ {r.destination}
                                    </p>
                                    <p className="text-[11.5px] text-ink-500 truncate mt-0.5">
                                      {r.directionName}
                                    </p>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-coral-100 border border-coral-200 px-2.5 py-1 text-[11px] font-extrabold text-coral-800">
                                    za {upcoming[0]} min
                                  </span>
                                  <p className="text-[10px] text-ink-400 font-semibold mt-0.5">
                                    potem za {upcoming[1]} min
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
