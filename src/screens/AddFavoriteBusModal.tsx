import { useState, useMemo, useEffect } from 'react';
import { Bus, ChevronRight, MapPin, Search } from 'lucide-react';
import { NativeHeader, cn } from '../components/ui';
import { REAL_BUS_STOPS, type RealBusStop } from '../data/realBusStops';
import type { FavoriteBusStop, LineId } from '../data/mockData';

interface AddFavoriteBusModalProps {
  onClose: () => void;
  onSave: (fav: Omit<FavoriteBusStop, 'id'>) => void;
  isClosing?: boolean;
}

const LINE_OPTIONS: { id: LineId; label: string; badge: string }[] = [
  { id: 'M1', label: 'Linia M1', badge: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  { id: 'M2', label: 'Linia M2', badge: 'bg-sky-100 text-sky-900 border-sky-300' },
  { id: 'M3', label: 'Linia M3', badge: 'bg-sand-100 text-sand-900 border-sand-300' },
  { id: 'M4', label: 'Linia M4', badge: 'bg-coral-100 text-coral-900 border-coral-300' },
];

export function AddFavoriteBusModal({
  onClose,
  onSave,
  isClosing = false,
}: AddFavoriteBusModalProps) {
  const [search, setSearch] = useState('');
  const [expandedStopId, setExpandedStopId] = useState<string | null>(null);

  const filteredStops = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return REAL_BUS_STOPS;
    return REAL_BUS_STOPS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.altId.toLowerCase().includes(q) ||
        s.id.includes(q)
    );
  }, [search]);

  // Gdy wyszukiwanie zawęzi wynik do 1 przystanku, rozwiń go automatycznie
  useEffect(() => {
    if (filteredStops.length === 1) {
      setExpandedStopId(filteredStops[0].id);
    }
  }, [filteredStops]);

  const handleSelectLine = (stop: RealBusStop, lineId: LineId) => {
    onSave({
      lineId,
      stopName: stop.name,
      directionIdx: 0,
      directionName: `Kierunki linii ${lineId}`,
      destination: `Odjazdy z ${stop.name}`,
      customLabel: stop.name.toLowerCase().includes('spacerowa') ? 'Dom' : undefined,
    });
    onClose();
  };

  const handleQuickAddStop = (stop: RealBusStop) => {
    onSave({
      lineId: 'M2',
      stopName: stop.name,
      directionIdx: 0,
      directionName: 'Wszystkie linie',
      destination: `Odjazdy ${stop.name}`,
    });
    onClose();
  };

  return (
    <div
      className={cn(
        'fixed inset-0 md:relative md:inset-auto md:h-full md:w-full z-50 flex flex-col bg-mist select-none',
        isClosing ? 'native-screen-exit' : 'native-screen-slide'
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-md md:max-w-none flex-col overflow-hidden bg-mist">
        <NativeHeader
          title="Dodaj przystanek do obserwowanych"
          backLabel="Wróć"
          onBack={onClose}
        />

        {/* Search Bar */}
        <div className="border-b border-mist-300 bg-white px-5 md:px-8 lg:px-12 py-3 shadow-xs">
          <div className="relative flex items-center max-w-xl">
            <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-ink-400" />
            <input
              type="text"
              autoFocus
              placeholder="Szukaj z 120 przystanków (np. Spacerowa, Serbinów, Szpital, Dworzec)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl md:rounded-xl bg-mist py-2.5 pl-10 pr-16 text-[13px] font-medium text-ink placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-ink"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 text-[12px] font-semibold text-ink-400 hover:text-ink cursor-pointer"
              >
                Wyczyść
              </button>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11.5px] text-ink-500 font-medium">
            <span>Oficjalna baza Trapeze: {REAL_BUS_STOPS.length} przystanków w Mińsku Mazowieckim</span>
            <span className="font-bold text-sky-800">Linie M1, M2, M3, M4</span>
          </div>
        </div>

        {/* Stops List */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 md:px-6 lg:px-8 py-4 md:py-6 pb-24 md:pb-12">
          <div className="mx-auto max-w-2xl space-y-2.5">
            {filteredStops.length === 0 ? (
              <div className="rounded-3xl bg-white p-8 text-center text-ink-500 shadow-card">
                <MapPin className="mx-auto h-8 w-8 text-ink-300" />
                <p className="mt-2 font-display text-[15px] font-bold text-ink">Nie znaleziono przystanku</p>
                <p className="mt-1 text-[12px]">Wpisz inną nazwę ulicy lub słupka w Mińsku Mazowieckim.</p>
              </div>
            ) : (
              filteredStops.map((stop) => {
                const isExpanded = expandedStopId === stop.id;

                return (
                  <div
                    key={stop.id}
                    className={cn(
                      'rounded-2xl bg-white shadow-xs transition-all border overflow-hidden',
                      isExpanded ? 'border-sky-300 shadow-sm' : 'border-mist-200 hover:border-mist-300'
                    )}
                  >
                    {/* Stop Header Row */}
                    <div className="flex w-full items-center justify-between p-3.5 md:p-4 text-left transition-colors">
                      <button
                        type="button"
                        onClick={() => setExpandedStopId(isExpanded ? null : stop.id)}
                        className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
                      >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-800 border border-sky-200">
                          <Bus className="h-4.5 w-4.5" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-display text-[15px] font-bold text-ink truncate">
                            {stop.name}
                          </p>
                          <p className="text-[11px] text-ink-400 font-mono">
                            Kod słupka: {stop.altId || stop.id}
                          </p>
                        </div>
                      </button>

                      <div className="flex items-center gap-2 shrink-0 pl-2">
                        <button
                          type="button"
                          onClick={() => handleQuickAddStop(stop)}
                          className="px-3 py-1.5 rounded-xl bg-ink text-white text-xs font-bold shadow-xs hover:bg-ink-700 active:scale-95 transition-all cursor-pointer"
                        >
                          + Obserwuj
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedStopId(isExpanded ? null : stop.id)}
                          className={cn(
                            'grid h-7 w-7 place-items-center rounded-full bg-mist text-ink-500 transition-transform duration-200 cursor-pointer',
                            isExpanded && 'rotate-90 bg-sky-100 text-sky-900'
                          )}
                          title="Wybierz linię"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Lines */}
                    {isExpanded && (
                      <div className="border-t border-mist-200 bg-sky-50/40 p-3 space-y-2">
                        <p className="text-[11.5px] font-extrabold text-ink px-1">
                          Wybierz linię dla tego przystanku:
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {LINE_OPTIONS.map((line) => (
                            <button
                              key={line.id}
                              type="button"
                              onClick={() => handleSelectLine(stop, line.id)}
                              className="p-2.5 rounded-xl bg-white border border-mist-200 hover:border-sky-400 shadow-2xs flex items-center justify-between transition-all active:scale-95 cursor-pointer text-left"
                            >
                              <span className={cn('px-2 py-0.5 rounded-md text-[11px] font-black border', line.badge)}>
                                {line.id}
                              </span>
                              <span className="text-[11px] font-bold text-ink-600">Dodaj ➔</span>
                            </button>
                          ))}
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
