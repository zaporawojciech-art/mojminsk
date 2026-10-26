import { useState, useMemo } from 'react';
import {
  ArrowRightLeft,
  Bus,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Info,
  MapPin,
  Phone,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { NativeHeader, cn } from '../components/ui';
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

const lineColors: Record<LineId, { badge: string; bg: string; text: string }> = {
  M2: { badge: 'bg-sky text-ink', bg: 'bg-sky-50', text: 'text-sky-800' },
  M3: { badge: 'bg-sand text-ink', bg: 'bg-sand-50', text: 'text-sand-800' },
  M4: { badge: 'bg-coral text-ink', bg: 'bg-coral-50', text: 'text-coral-800' },
};

const quickTags = ['Dom', 'Praca', 'Szkoła', 'Dworzec PKP', 'Szpital'];

export function ZditmScreen({
  onBack,
  initialLine = 'M2',
  initialStopName,
  isClosing = false,
  favoriteBuses = [],
  onToggleFavorite,
  onRemoveFavorite,
}: ZditmScreenProps) {
  // Tryb widoku: Moje przystanki vs Przeglądaj linie
  const [activeTab, setActiveTab] = useState<'my_stops' | 'browse_lines'>(
    favoriteBuses.length > 0 || !initialStopName ? 'my_stops' : 'browse_lines',
  );

  // Stan modala / drawer dodawania przystanku
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterLine, setSelectedFilterLine] = useState<LineId | 'ALL'>('ALL');
  const [selectedStopForAdd, setSelectedStopForAdd] = useState<{
    stopName: string;
    lineId: LineId;
    directionIdx: 0 | 1;
    directionName: string;
    destination: string;
  } | null>(null);
  const [customLabel, setCustomLabel] = useState('');

  // Rozwinięty pełny rozkład dla danego przystanku na liście
  const [expandedStopId, setExpandedStopId] = useState<string | null>(null);
  const [expandedDayType, setExpandedDayType] = useState<'weekday' | 'saturday' | 'sunday'>('weekday');

  // Stan przeglądania linii (druga zakładka)
  const [browseLineId, setBrowseLineId] = useState<LineId>(initialLine);
  const [browseDirIdx, setBrowseDirIdx] = useState<0 | 1>(0);
  const [browseDayType, setBrowseDayType] = useState<'weekday' | 'saturday' | 'sunday'>('weekday');

  const allCityStops = useMemo(() => getAllBusStopsList(), []);

  // Filtrowane przystanki do dodania
  const filteredCityStops = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allCityStops.filter((st) => {
      const matchesQuery = !q || st.name.toLowerCase().includes(q) || st.zone.toLowerCase().includes(q);
      const matchesLine =
        selectedFilterLine === 'ALL' || st.routes.some((r) => r.lineId === selectedFilterLine);
      return matchesQuery && matchesLine;
    });
  }, [allCityStops, searchQuery, selectedFilterLine]);

  // Zapisanie przystanku do obserwowanych
  const handleConfirmAddStop = () => {
    if (!selectedStopForAdd) return;
    onToggleFavorite?.({
      lineId: selectedStopForAdd.lineId,
      stopName: selectedStopForAdd.stopName,
      directionIdx: selectedStopForAdd.directionIdx,
      directionName: selectedStopForAdd.directionName,
      destination: selectedStopForAdd.destination,
      customLabel: customLabel.trim() || undefined,
    });
    setSelectedStopForAdd(null);
    setCustomLabel('');
    setIsAddModalOpen(false);
    setActiveTab('my_stops');
  };

  const browseLine = busLines.find((l) => l.id === browseLineId)!;
  const browseDirection = browseLine.directions[browseDirIdx];

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col bg-mist select-none',
        isClosing ? 'native-screen-exit' : 'native-screen-slide',
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-y-auto overscroll-contain bg-mist pb-16">
        {/* Header */}
        <NativeHeader
          title="Rozkład jazdy ZDiTM"
          backLabel="Wróć"
          onBack={onBack}
        />

        {/* 100% Bezpłatna komunikacja miejska banner */}
        <div className="border-b border-mist-300 bg-white px-5 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                <Bus className="h-4 w-4" />
              </span>
              <span className="text-[12.5px] font-bold text-ink">Bezpłatne przejazdy dla każdego</span>
            </div>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10.5px] font-extrabold text-emerald-800">
              0 zł · Bez biletów
            </span>
          </div>
        </div>

        {/* Zakładki widoku: Moje przystanki vs Przeglądaj linie */}
        <div className="p-4 pb-2">
          <div className="flex rounded-2xl bg-white p-1 shadow-card border border-mist-300">
            <button
              type="button"
              onClick={() => setActiveTab('my_stops')}
              className={cn(
                'flex-1 rounded-xl py-2 text-center text-[13px] font-bold transition-all',
                activeTab === 'my_stops'
                  ? 'bg-ink text-white shadow-sm'
                  : 'text-ink-600 hover:text-ink',
              )}
            >
              Moje przystanki ({favoriteBuses.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('browse_lines')}
              className={cn(
                'flex-1 rounded-xl py-2 text-center text-[13px] font-bold transition-all',
                activeTab === 'browse_lines'
                  ? 'bg-ink text-white shadow-sm'
                  : 'text-ink-600 hover:text-ink',
              )}
            >
              Wszystkie linie (M2, M3, M4)
            </button>
          </div>
        </div>

        {/* =========================================================================
            ZAKŁADKA 1: MOJE PRZYSTANKI (GŁÓWNY HUB ROZKŁADÓW)
            ========================================================================= */}
        {activeTab === 'my_stops' && (
          <div className="px-4 space-y-3 pt-1">
            {/* Przycisk Dodaj przystanek */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-[14.5px] font-bold text-white shadow-sm hover:bg-ink-700 active:scale-[0.98] transition-all"
            >
              <Plus className="h-4.5 w-4.5" />
              Dodaj przystanek do listy
            </button>

            {/* Empty State gdy brak przystanków */}
            {favoriteBuses.length === 0 ? (
              <div className="rounded-3xl bg-white p-6 text-center shadow-card border border-mist-300 my-4 space-y-3">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-sand-100 text-ink">
                  <Star className="h-7 w-7 text-sand-700" />
                </div>
                <h3 className="font-display text-[17px] font-bold text-ink">
                  Nie dodałeś jeszcze żadnego przystanku
                </h3>
                <p className="text-[12.5px] text-ink-500 leading-relaxed max-w-xs mx-auto">
                  Wybierz przystanki w pobliżu swojego domu, pracy lub szkoły (np.{' '}
                  <b>Spacerowa</b>, <b>Szpital</b>, <b>PKP Dworzec</b>), aby od razu widzieć
                  najbliższe autobusy bez szukania.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-coral px-5 text-[13.5px] font-bold text-ink shadow-coral transition-transform active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  Wybierz przystanek z bazy Mińska
                </button>
              </div>
            ) : (
              /* Lista dodanych przystanków */
              <div className="space-y-3 pt-1">
                {favoriteBuses.map((fav) => {
                  const lineInfo = busLines.find((l) => l.id === fav.lineId);
                  const isExpanded = expandedStopId === fav.id;
                  const upcomingMinutes = getUpcomingDepartures(
                    fav.lineId,
                    fav.stopName,
                    fav.directionIdx,
                  );
                  const targetDirection = lineInfo?.directions[fav.directionIdx];

                  return (
                    <div
                      key={fav.id}
                      className="rounded-3xl bg-white p-4 shadow-card border border-mist-300 space-y-3"
                    >
                      {/* Górny pasek karty: Linia, Nazwa, Etykieta i Kosz */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span
                            className={cn(
                              'px-2.5 py-1 rounded-xl text-[13px] font-black shrink-0 shadow-xs',
                              lineColors[fav.lineId]?.badge ?? 'bg-ink text-white',
                            )}
                          >
                            {fav.lineId}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-display text-[16px] font-bold text-ink leading-tight truncate">
                                {fav.stopName}
                              </h3>
                              {fav.customLabel && (
                                <span className="rounded-full bg-sand-100 px-2 py-0.5 text-[10.5px] font-bold text-sand-800">
                                  {fav.customLabel}
                                </span>
                              )}
                            </div>
                            <p className="text-[11.5px] text-ink-500 mt-0.5 truncate">
                              ➔ {fav.destination} ({fav.directionName})
                            </p>
                          </div>
                        </div>

                        {/* Przycisk usunięcia */}
                        <button
                          type="button"
                          onClick={() => onRemoveFavorite?.(fav.id)}
                          title="Usuń z obserwowanych"
                          className="grid h-8 w-8 place-items-center rounded-full text-ink-300 hover:text-coral hover:bg-mist transition-colors shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Odjazdy na żywo (3 kafle) */}
                      <div className="rounded-2xl bg-coral-50/70 p-3 border border-coral-100/60">
                        <div className="flex items-center justify-between text-[11.5px] font-bold text-coral-800 pb-1.5">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            Najbliższe odjazdy:
                          </span>
                          <span className="text-[10.5px] font-semibold text-ink-400">Na żywo</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {upcomingMinutes.slice(0, 3).map((min, idx) => (
                            <div
                              key={idx}
                              className="rounded-xl bg-white p-2 text-center shadow-xs border border-mist-200"
                            >
                              <p className="font-display text-[17px] font-black text-coral-700 leading-none">
                                za {min} min
                              </p>
                              <span className="text-[9.5px] font-semibold text-ink-400">Punktualnie</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Rozwijany pełny rozkład */}
                      <div>
                        <button
                          type="button"
                          onClick={() => setExpandedStopId(isExpanded ? null : fav.id)}
                          className="flex w-full items-center justify-between py-1 text-[12px] font-bold text-ink-600 hover:text-ink transition-colors"
                        >
                          <span>{isExpanded ? 'Zwiń rozkład godzinowy' : 'Zobacz pełny rozkład godzinowy'}</span>
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>

                        {isExpanded && targetDirection && (
                          <div className="mt-3 pt-3 border-t border-mist space-y-3">
                            {/* Przełącznik dni */}
                            <div className="grid grid-cols-3 gap-1 rounded-xl bg-mist p-1 text-[11.5px] font-bold">
                              <button
                                type="button"
                                onClick={() => setExpandedDayType('weekday')}
                                className={cn(
                                  'py-1.5 rounded-lg transition-all',
                                  expandedDayType === 'weekday'
                                    ? 'bg-white text-ink shadow-xs'
                                    : 'text-ink-500',
                                )}
                              >
                                Dni robocze
                              </button>
                              <button
                                type="button"
                                onClick={() => setExpandedDayType('saturday')}
                                className={cn(
                                  'py-1.5 rounded-lg transition-all',
                                  expandedDayType === 'saturday'
                                    ? 'bg-white text-ink shadow-xs'
                                    : 'text-ink-500',
                                )}
                              >
                                Soboty
                              </button>
                              <button
                                type="button"
                                onClick={() => setExpandedDayType('sunday')}
                                className={cn(
                                  'py-1.5 rounded-lg transition-all',
                                  expandedDayType === 'sunday'
                                    ? 'bg-white text-ink shadow-xs'
                                    : 'text-ink-500',
                                )}
                              >
                                Niedziele
                              </button>
                            </div>

                            {/* Siatka godzinowa odjazdów */}
                            <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto overscroll-contain pr-1">
                              {targetDirection.departures[expandedDayType]?.map((time) => (
                                <div
                                  key={time}
                                  className="rounded-lg bg-mist/80 p-2 text-center text-[12.5px] font-bold text-ink"
                                >
                                  {time}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            ZAKŁADKA 2: PRZEGLĄDAJ WSZYSTKIE LINIE (M2, M3, M4)
            ========================================================================= */}
        {activeTab === 'browse_lines' && (
          <div className="px-4 space-y-4 pt-1">
            {/* Wybór linii M2, M3, M4 */}
            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white p-2 shadow-card border border-mist-300">
              {busLines.map((l) => {
                const active = browseLineId === l.id;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      setBrowseLineId(l.id);
                      setBrowseDirIdx(0);
                    }}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-xl py-2.5 transition-all active:scale-95',
                      active ? 'bg-ink text-white shadow-sm' : 'bg-mist/70 text-ink hover:bg-mist',
                    )}
                  >
                    <span
                      className={cn(
                        'rounded-lg px-2.5 py-0.5 text-[13px] font-black',
                        lineColors[l.id].badge,
                      )}
                    >
                      {l.id}
                    </span>
                    <span className="text-[11px] font-bold truncate max-w-[80px]">
                      {l.id === 'M2' ? 'Serbinów' : l.id === 'M3' ? 'Osiedlowa' : 'Anielina'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Kierunek i Dzień */}
            <div className="rounded-3xl bg-white p-4 shadow-card border border-mist-300 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                  Trasa i kierunek linii {browseLineId}
                </span>
                <button
                  type="button"
                  onClick={() => setBrowseDirIdx((d) => (d === 0 ? 1 : 0))}
                  className="flex items-center gap-1.5 rounded-full bg-mist px-3 py-1 text-[11.5px] font-bold text-ink transition-transform active:scale-95 hover:bg-mist-200"
                >
                  <ArrowRightLeft className="h-3.5 w-3.5 text-coral" />
                  Zmień kierunek
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-coral-100 text-coral-700">
                  <Bus className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[15.5px] font-bold text-ink truncate">
                    {browseDirection.destination}
                  </p>
                  <p className="text-[12px] text-ink-500 truncate">
                    {browseDirection.name} · {browseDirection.frequency}
                  </p>
                </div>
              </div>

              {/* Dzień tygodnia */}
              <div className="grid grid-cols-3 gap-1 rounded-xl bg-mist p-1 text-[11.5px] font-bold">
                <button
                  type="button"
                  onClick={() => setBrowseDayType('weekday')}
                  className={cn(
                    'py-1.5 rounded-lg transition-all',
                    browseDayType === 'weekday' ? 'bg-white text-ink shadow-xs' : 'text-ink-500',
                  )}
                >
                  Dni robocze
                </button>
                <button
                  type="button"
                  onClick={() => setBrowseDayType('saturday')}
                  className={cn(
                    'py-1.5 rounded-lg transition-all',
                    browseDayType === 'saturday' ? 'bg-white text-ink shadow-xs' : 'text-ink-500',
                  )}
                >
                  Soboty
                </button>
                <button
                  type="button"
                  onClick={() => setBrowseDayType('sunday')}
                  className={cn(
                    'py-1.5 rounded-lg transition-all',
                    browseDayType === 'sunday' ? 'bg-white text-ink shadow-xs' : 'text-ink-500',
                  )}
                >
                  Niedziele
                </button>
              </div>
            </div>

            {/* Lista przystanków danej linii z opcją dodania do obserwowanych */}
            <div className="rounded-3xl bg-white p-4 shadow-card border border-mist-300">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-ink-400 pb-2">
                Przystanki na trasie linii {browseLineId} ({browseLine.stopsDetails.length})
              </h3>
              <div className="divide-y divide-mist">
                {browseLine.stopsDetails.map((st, i) => {
                  const isAlreadyFav = favoriteBuses.some(
                    (f) =>
                      f.lineId === browseLineId &&
                      f.stopName === st.name &&
                      f.directionIdx === browseDirIdx,
                  );

                  return (
                    <div
                      key={st.name}
                      className="py-3 flex items-center justify-between gap-3 text-left"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-mist text-[11px] font-bold text-ink-600 shrink-0">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[13.5px] font-bold text-ink truncate">{st.name}</p>
                          <p className="text-[11px] text-ink-400">Strefa {st.zone}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (isAlreadyFav) {
                            const found = favoriteBuses.find(
                              (f) =>
                                f.lineId === browseLineId &&
                                f.stopName === st.name &&
                                f.directionIdx === browseDirIdx,
                            );
                            if (found) onRemoveFavorite?.(found.id);
                          } else {
                            onToggleFavorite?.({
                              lineId: browseLineId,
                              stopName: st.name,
                              directionIdx: browseDirIdx,
                              directionName: browseDirection.name,
                              destination: browseDirection.destination,
                              customLabel: st.name === 'Spacerowa' ? 'Dom' : undefined,
                            });
                          }
                        }}
                        className={cn(
                          'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11.5px] font-bold transition-all active:scale-95 shrink-0',
                          isAlreadyFav
                            ? 'bg-sand-100 text-sand-900 border border-sand-300'
                            : 'bg-mist hover:bg-mist-200 text-ink border border-mist-300',
                        )}
                      >
                        <Star
                          className={cn(
                            'h-3.5 w-3.5',
                            isAlreadyFav ? 'fill-sand text-sand-700' : 'text-ink-400',
                          )}
                        />
                        <span>{isAlreadyFav ? 'Zapisany' : '+ Dodaj'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Informacja o ZDiTM i kontakt */}
        <div className="p-4 pt-2">
          <div className="rounded-3xl bg-sand-100/90 p-4 border border-sand-200">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-sand-700" />
              <p className="text-[12.5px] font-bold text-ink">Bezpłatne przejazdy dla każdego</p>
            </div>
            <p className="mt-1 text-[11.5px] text-ink-700 leading-snug">
              Wsiadasz i jedziesz bez biletu. Rozkłady są synchronizowane z oficjalnym systemem ZDiTM
              w Mińsku Mazowieckim.
            </p>
            <div className="mt-2.5 flex items-center justify-between border-t border-sand-200/80 pt-2 text-[11.5px]">
              <span className="font-medium text-ink-600">Dyspozytornia ZDiTM:</span>
              <a href="tel:257582044" className="font-bold text-ink flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                25 758 20 44
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL DODAWANIA NOWEGO PRZYSTANKU (INLINE MODAL)
          ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black/50 backdrop-blur-xs select-none">
          <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden bg-mist shadow-2xl">
            {/* Header modala */}
            <div className="border-b border-mist-300 bg-white px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-ink text-white">
                  <Plus className="h-4 w-4" />
                </span>
                <h3 className="font-display text-[16px] font-bold text-ink">
                  Dodaj przystanek do rozkładu
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setSelectedStopForAdd(null);
                }}
                className="grid h-8 w-8 place-items-center rounded-full bg-mist text-ink-600 hover:text-ink active:scale-95"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Krok A: Wybór przystanku i kierunku */}
            {!selectedStopForAdd ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Wyszukiwarka */}
                <div className="p-4 bg-white border-b border-mist space-y-2.5">
                  <div className="relative flex items-center">
                    <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-ink-400" />
                    <input
                      type="text"
                      placeholder="Szukaj przystanku (np. Spacerowa, Szpital, PKP)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-2xl border border-mist-300 bg-mist/50 py-2.5 pl-10 pr-4 text-[13px] font-medium text-ink placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-ink"
                    />
                  </div>

                  {/* Filtry linii */}
                  <div className="flex items-center gap-1.5">
                    {(['ALL', 'M2', 'M3', 'M4'] as const).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setSelectedFilterLine(l)}
                        className={cn(
                          'px-3 py-1 rounded-xl text-[11.5px] font-bold transition-all',
                          selectedFilterLine === l
                            ? 'bg-ink text-white shadow-xs'
                            : 'bg-mist text-ink-600 hover:bg-mist-200',
                        )}
                      >
                        {l === 'ALL' ? 'Wszystkie linie' : `Linia ${l}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lista znalezionych przystanków */}
                <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-2.5 pb-24">
                  {filteredCityStops.length === 0 ? (
                    <div className="p-8 text-center text-ink-400">
                      <MapPin className="mx-auto h-7 w-7 text-ink-300 mb-1" />
                      <p className="text-[13px] font-bold text-ink">Brak wyników</p>
                      <p className="text-[11.5px]">Spróbuj wpisać inną nazwę przystanku</p>
                    </div>
                  ) : (
                    filteredCityStops.map((st) => (
                      <div
                        key={st.name}
                        className="rounded-2xl bg-white p-3.5 shadow-card border border-mist-300 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-display text-[15px] font-bold text-ink">{st.name}</p>
                          <span className="text-[10.5px] font-bold text-ink-400">Strefa {st.zone}</span>
                        </div>

                        {/* Kierunki dostępne z tego przystanku */}
                        <div className="space-y-1.5 pt-1">
                          {st.routes
                            .filter(
                              (r) => selectedFilterLine === 'ALL' || r.lineId === selectedFilterLine,
                            )
                            .map((r, rIdx) => (
                              <button
                                key={rIdx}
                                type="button"
                                onClick={() =>
                                  setSelectedStopForAdd({
                                    stopName: st.name,
                                    lineId: r.lineId,
                                    directionIdx: r.directionIdx,
                                    directionName: r.directionName,
                                    destination: r.destination,
                                  })
                                }
                                className="flex w-full items-center justify-between rounded-xl border border-mist-200 bg-mist/40 p-2 text-left hover:bg-mist active:scale-[0.99] transition-all"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className={cn(
                                      'px-2 py-0.5 rounded-lg text-[11px] font-black shrink-0',
                                      lineColors[r.lineId].badge,
                                    )}
                                  >
                                    {r.lineId}
                                  </span>
                                  <span className="text-[12px] font-bold text-ink truncate">
                                    ➔ {r.destination}
                                  </span>
                                </div>
                                <span className="text-[11px] font-bold text-coral-700 shrink-0">
                                  Wybierz ›
                                </span>
                              </button>
                            ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* Krok B: Nadanie opcjonalnej etykiety i potwierdzenie */
              <div className="flex-1 p-5 space-y-4 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-4">
                  <div className="rounded-2xl bg-white p-4 shadow-card border border-mist-300 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                      Wybrany przystanek i linia
                    </span>
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-xl text-[13px] font-black',
                          lineColors[selectedStopForAdd.lineId].badge,
                        )}
                      >
                        {selectedStopForAdd.lineId}
                      </span>
                      <div>
                        <h4 className="font-display text-[16px] font-bold text-ink">
                          {selectedStopForAdd.stopName}
                        </h4>
                        <p className="text-[12px] text-ink-500">
                          ➔ Kierunek: {selectedStopForAdd.destination}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Własna etykieta (np. Dom, Praca) */}
                  <div className="rounded-2xl bg-white p-4 shadow-card border border-mist-300 space-y-2.5">
                    <label className="text-[12.5px] font-bold text-ink block">
                      Własna etykieta przystanku (opcjonalnie)
                    </label>
                    <input
                      type="text"
                      value={customLabel}
                      onChange={(e) => setCustomLabel(e.target.value)}
                      placeholder="np. Pod domem, Praca, Szkoła..."
                      className="h-11 w-full rounded-xl border border-mist-300 bg-mist/50 px-3.5 text-[13.5px] font-bold text-ink outline-none focus:ring-2 focus:ring-ink"
                    />

                    {/* Szybkie tagi */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {quickTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setCustomLabel(tag)}
                          className="rounded-full bg-mist px-2.5 py-1 text-[11px] font-semibold text-ink-700 hover:bg-mist-200 active:scale-95 transition-all"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Przyciski zatwierdzenia */}
                <div className="space-y-2 pt-4">
                  <button
                    type="button"
                    onClick={handleConfirmAddStop}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-[14.5px] font-bold text-white shadow-sm hover:bg-ink-700 active:scale-[0.98] transition-all"
                  >
                    <Check className="h-4.5 w-4.5" />
                    Zapisz i pokaż rozkład
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStopForAdd(null)}
                    className="flex h-11 w-full items-center justify-center rounded-2xl border border-mist-300 bg-white text-[13px] font-bold text-ink-600 hover:bg-mist active:scale-[0.98] transition-all"
                  >
                    Wróć do wyboru innego przystanku
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
