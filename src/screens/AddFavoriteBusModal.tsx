import { useState } from 'react';
import { Check, Compass, MapPin, Sparkles, Star, Tag } from 'lucide-react';
import { NativeHeader, cn } from '../components/ui';
import { busLines, getUpcomingDepartures, type FavoriteBusStop, type LineId } from '../data/mockData';

interface AddFavoriteBusModalProps {
  onClose: () => void;
  onSave: (fav: Omit<FavoriteBusStop, 'id'>) => void;
  isClosing?: boolean;
  initialLineId?: LineId;
  initialStopName?: string;
  initialDirectionIdx?: 0 | 1;
}

const labelPresets = [
  { id: 'Dom', label: '🏠 Dom' },
  { id: 'Praca / Szkoła', label: '💼 Praca / Szkoła' },
  { id: 'Dworzec PKP', label: '🚆 Dworzec PKP' },
  { id: 'Szpital / Przychodnia', label: '🏥 Szpital' },
];

const lineTone: Record<LineId, { badge: string; bg: string; text: string; border: string }> = {
  M2: { badge: 'bg-sky text-ink', bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-300' },
  M3: { badge: 'bg-sand text-ink', bg: 'bg-sand-50', text: 'text-sand-800', border: 'border-sand-300' },
  M4: { badge: 'bg-coral text-ink', bg: 'bg-coral-50', text: 'text-coral-800', border: 'border-coral-300' },
};

const clock = (minsFromNow: number) => {
  const d = new Date(Date.now() + minsFromNow * 60000);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export function AddFavoriteBusModal({
  onClose,
  onSave,
  isClosing = false,
  initialLineId = 'M3',
  initialStopName,
  initialDirectionIdx = 0,
}: AddFavoriteBusModalProps) {
  const [selectedLineId, setSelectedLineId] = useState<LineId>(initialLineId);
  const line = busLines.find((l) => l.id === selectedLineId)!;

  const [selectedStop, setSelectedStop] = useState<string>(() => {
    if (initialStopName && line.stops.includes(initialStopName)) return initialStopName;
    return line.stops[0];
  });

  const [directionIdx, setDirectionIdx] = useState<0 | 1>(initialDirectionIdx);
  const [selectedLabel, setSelectedLabel] = useState<string>('Dom');
  const [customLabel, setCustomLabel] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [searchStop, setSearchStop] = useState<string>('');

  // When changing line, reset stop if not found
  const handleLineChange = (id: LineId) => {
    setSelectedLineId(id);
    const targetLine = busLines.find((l) => l.id === id)!;
    if (!targetLine.stops.includes(selectedStop)) {
      setSelectedStop(targetLine.stops[0]);
    }
  };

  const currentDirection = line.directions[directionIdx];
  const upcoming = getUpcomingDepartures(selectedLineId, selectedStop, directionIdx);

  const filteredStops = line.stopsDetails.filter((s) =>
    s.name.toLowerCase().includes(searchStop.toLowerCase().trim()),
  );

  const handleSave = () => {
    const finalLabel = isCustom ? customLabel.trim() : selectedLabel;
    onSave({
      lineId: selectedLineId,
      stopName: selectedStop,
      directionIdx,
      directionName: currentDirection.name,
      destination: currentDirection.destination,
      customLabel: finalLabel || undefined,
    });
    onClose();
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col bg-mist select-none',
        isClosing ? 'native-screen-exit' : 'native-screen-slide',
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden bg-mist">
        <NativeHeader
          title="Dodaj przystanek do obserwowanych"
          backLabel="Wróć"
          onBack={onClose}
        />

        <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-5 pb-32">
          {/* Info Card */}
          <div className="flex items-start gap-3 rounded-3xl bg-sand-100 p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-sand-800 shadow-sm">
              <Star className="h-5 w-5 fill-sand text-sand-700" />
            </span>
            <div className="text-[13px] leading-snug text-ink-700">
              <p className="font-bold text-ink">Twój codzienny dojazd</p>
              <p className="mt-0.5 text-[12px] text-ink-500">
                Wybrane połączenie pojawi się na samej górze ekranu głównego z odliczaniem odjazdów na żywo.
              </p>
            </div>
          </div>

          {/* KROK 1: Wybór linii */}
          <div className="rounded-3xl bg-white p-4 shadow-card">
            <label className="text-[11.5px] font-bold uppercase tracking-wider text-ink-400">
              Krok 1: Wybierz linię
            </label>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {busLines.map((l) => {
                const active = selectedLineId === l.id;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => handleLineChange(l.id)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-2xl p-3 border-2 transition-all active:scale-95 text-center',
                      active
                        ? cn(lineTone[l.id].bg, lineTone[l.id].border, 'shadow-sm')
                        : 'border-transparent bg-mist hover:bg-mist-200 text-ink',
                    )}
                  >
                    <span className={cn('rounded-lg px-2.5 py-0.5 text-[14px] font-extrabold', lineTone[l.id].badge)}>
                      {l.id}
                    </span>
                    <span className="text-[11px] font-bold truncate max-w-full">
                      {l.id === 'M2' ? 'Serbinów' : l.id === 'M3' ? 'Osiedlowa' : 'Anielina'}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2.5 text-center text-[11.5px] text-ink-500 font-medium">{line.route}</p>
          </div>

          {/* KROK 2: Wybór kierunku */}
          <div className="rounded-3xl bg-white p-4 shadow-card">
            <label className="text-[11.5px] font-bold uppercase tracking-wider text-ink-400">
              Krok 2: Wybierz kierunek podróży
            </label>
            <div className="mt-3 grid grid-cols-1 gap-2.5">
              {line.directions.map((dir, idx) => {
                const active = directionIdx === idx;
                return (
                  <button
                    key={dir.destination}
                    type="button"
                    onClick={() => setDirectionIdx(idx as 0 | 1)}
                    className={cn(
                      'flex items-center justify-between rounded-2xl p-3.5 border-2 text-left transition-all active:scale-98',
                      active
                        ? 'border-ink bg-ink text-white shadow-card'
                        : 'border-mist bg-mist/60 text-ink hover:bg-mist',
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={cn(
                          'grid h-9 w-9 shrink-0 place-items-center rounded-xl',
                          active ? 'bg-white/20 text-white' : 'bg-white text-ink shadow-sm',
                        )}
                      >
                        <Compass className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className={cn('text-[10px] font-bold uppercase tracking-wider', active ? 'text-sand' : 'text-ink-400')}>
                          {dir.name}
                        </p>
                        <p className="truncate text-[14px] font-bold">{dir.destination}</p>
                      </div>
                    </div>
                    {active && <Check className="h-5 w-5 text-sand shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* KROK 3: Wybór przystanku */}
          <div className="rounded-3xl bg-white p-4 shadow-card">
            <div className="flex items-center justify-between">
              <label className="text-[11.5px] font-bold uppercase tracking-wider text-ink-400">
                Krok 3: Wybierz swój przystanek
              </label>
              <span className="text-[11px] font-semibold text-ink-500">
                {line.stops.length} przystanków
              </span>
            </div>

            <div className="mt-3">
              <input
                type="text"
                placeholder="Szukaj przystanku (np. Spacerowa, PKP)..."
                value={searchStop}
                onChange={(e) => setSearchStop(e.target.value)}
                className="w-full rounded-2xl bg-mist px-4 py-2.5 text-[13px] font-medium text-ink placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-ink"
              />
            </div>

            <div className="mt-3 max-h-52 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
              {filteredStops.map((st) => {
                const active = selectedStop === st.name;
                return (
                  <button
                    key={st.name}
                    type="button"
                    onClick={() => setSelectedStop(st.name)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors',
                      active ? 'bg-coral-100 text-coral-900 font-bold' : 'bg-mist/40 text-ink hover:bg-mist',
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MapPin className={cn('h-4 w-4 shrink-0', active ? 'text-coral-700' : 'text-ink-400')} />
                      <span className="truncate text-[13px]">{st.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {st.isTransfer && (
                        <span className="rounded-md bg-white/80 px-2 py-0.5 text-[10px] font-bold text-ink-600">
                          Węzeł
                        </span>
                      )}
                      {active && <Check className="h-4 w-4 text-coral-700" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* KROK 4: Własna etykieta */}
          <div className="rounded-3xl bg-white p-4 shadow-card">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-ink-500" />
              <label className="text-[11.5px] font-bold uppercase tracking-wider text-ink-400">
                Krok 4: Etykieta połączenia (opcjonalnie)
              </label>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {labelPresets.map((preset) => {
                const active = !isCustom && selectedLabel === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setIsCustom(false);
                      setSelectedLabel(preset.id);
                    }}
                    className={cn(
                      'rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-all active:scale-95',
                      active
                        ? 'bg-ink text-white shadow-sm'
                        : 'bg-mist text-ink hover:bg-mist-200',
                    )}
                  >
                    {preset.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-all active:scale-95',
                  isCustom ? 'bg-ink text-white shadow-sm' : 'bg-mist text-ink hover:bg-mist-200',
                )}
              >
                ✏️ Inna etykieta
              </button>
            </div>

            {isCustom && (
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Wpisz nazwę (np. Trening, U babci, Działka)..."
                  maxLength={24}
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  className="w-full rounded-2xl bg-mist px-4 py-2 text-[13px] font-medium text-ink focus:outline-none focus:ring-2 focus:ring-ink"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Podgląd na żywo */}
          <div className="rounded-3xl border-2 border-emerald-300 bg-emerald-50/80 p-4 text-ink">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
                <Sparkles className="h-3.5 w-3.5" />
                Podgląd odjazdów na żywo
              </span>
              <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                100% Bezpłatna ZDiTM
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-ink-500">Przystanek:</p>
                <p className="font-display text-[16px] font-bold text-ink">{selectedStop}</p>
                <p className="text-[12px] text-ink-600">
                  {selectedLineId} ➔ {currentDirection.destination}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Najbliższy odjazd
                </p>
                <p className="font-display text-[26px] font-extrabold text-emerald-900 leading-none">
                  za {upcoming[0]} min
                </p>
                <p className="mt-1 text-[11px] font-medium text-ink-500">
                  kolejne: {clock(upcoming[1])}, {clock(upcoming[2])}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Bar */}
        <div className="border-t border-mist-300 bg-white/95 p-4 backdrop-blur">
          <button
            type="button"
            onClick={handleSave}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink font-display text-[15px] font-semibold text-white shadow-float transition-transform active:scale-98"
          >
            <Star className="h-4 w-4 fill-sand text-sand" />
            Zapisz i obserwuj ten przystanek
          </button>
        </div>
      </div>
    </div>
  );
}
