import { useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { NativeHeader, cn } from '../components/ui';
import { streets } from '../data/mockData';

export interface AdFilterState {
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'popular';
  minPrice: string;
  maxPrice: string;
  selectedCategory: string;
  selectedStreet: string;
  onlyFree: boolean;
  onlyPromoted: boolean;
}

interface AdFiltersModalProps {
  currentFilters: AdFilterState;
  totalMatching: number;
  onClose: () => void;
  onApply: (filters: AdFilterState) => void;
  onReset: () => void;
}

const sortOptions = [
  { id: 'newest', label: 'Najnowsze' },
  { id: 'price_asc', label: 'Cena: od najniższej' },
  { id: 'price_desc', label: 'Cena: od najwyższej' },
  { id: 'popular', label: 'Najpopularniejsze' },
] as const;

const categories = [
  'Wszystkie',
  'Meble & Dom',
  'Dziecięce',
  'Elektronika',
  'Sport & Rowery',
  'Ogród & Narzędzia',
  'Oddam za darmo',
  'Zgubiłem / Znalazłem',
];

export function AdFiltersModal({
  currentFilters,
  totalMatching,
  onClose,
  onApply,
  onReset,
}: AdFiltersModalProps) {
  const [filters, setFilters] = useState<AdFilterState>(currentFilters);

  const handlePricePreset = (min: string, max: string) => {
    setFilters((prev) => ({ ...prev, minPrice: min, maxPrice: max, onlyFree: false }));
  };

  const handleReset = () => {
    onReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-mist native-screen-slide select-none">
      <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden bg-mist">
        {/* Top Header */}
        <NativeHeader
          title="Filtry i sortowanie"
          backLabel="Anuluj"
          onBack={onClose}
          right={
            <button
              type="button"
              onClick={handleReset}
              className="mr-1 flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-bold text-ink-500 hover:text-ink"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Resetuj
            </button>
          }
        />

        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
          {/* Sort By Card */}
          <div className="rounded-3xl bg-white p-4 shadow-card">
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-ink-400">
              Sortowanie
            </h3>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              {sortOptions.map((opt) => {
                const isSelected = filters.sortBy === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, sortBy: opt.id }))}
                    className={cn(
                      'flex items-center justify-between rounded-2xl p-3 text-left text-[13px] font-bold transition-all',
                      isSelected ? 'bg-ink text-white shadow-card' : 'bg-mist text-ink-700 hover:bg-mist-200',
                    )}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="h-4 w-4 text-coral shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Card */}
          <div className="rounded-3xl bg-white p-4 shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-ink-400">
                Zakres cenowy (zł)
              </h3>
              {filters.onlyFree && (
                <span className="rounded-full bg-sky px-2 py-0.5 text-[10.5px] font-bold text-ink">
                  Tylko darmowe
                </span>
              )}
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  placeholder="Od"
                  value={filters.minPrice}
                  onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value, onlyFree: false }))}
                  className="h-11 w-full rounded-xl bg-mist px-3 pr-8 text-[14px] font-bold text-ink outline-none"
                />
                <span className="absolute right-3 top-3 text-[12px] font-bold text-ink-400">zł</span>
              </div>
              <span className="text-[14px] font-bold text-ink-400">—</span>
              <div className="relative flex-1">
                <input
                  type="number"
                  placeholder="Do"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value, onlyFree: false }))}
                  className="h-11 w-full rounded-xl bg-mist px-3 pr-8 text-[14px] font-bold text-ink outline-none"
                />
                <span className="absolute right-3 top-3 text-[12px] font-bold text-ink-400">zł</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, onlyFree: !prev.onlyFree, minPrice: '', maxPrice: '' }))}
                className={cn(
                  'rounded-full px-3 py-1.5 text-[12px] font-bold transition-all',
                  filters.onlyFree ? 'bg-sky text-ink' : 'bg-mist text-ink-600',
                )}
              >
                Za darmo (0 zł)
              </button>
              <button
                type="button"
                onClick={() => handlePricePreset('0', '50')}
                className="rounded-full bg-mist px-3 py-1.5 text-[12px] font-semibold text-ink-600 hover:bg-mist-200"
              >
                Do 50 zł
              </button>
              <button
                type="button"
                onClick={() => handlePricePreset('50', '200')}
                className="rounded-full bg-mist px-3 py-1.5 text-[12px] font-semibold text-ink-600 hover:bg-mist-200"
              >
                50 – 200 zł
              </button>
              <button
                type="button"
                onClick={() => handlePricePreset('200', '')}
                className="rounded-full bg-mist px-3 py-1.5 text-[12px] font-semibold text-ink-600 hover:bg-mist-200"
              >
                Powyżej 200 zł
              </button>
            </div>
          </div>

          {/* Categories Card */}
          <div className="rounded-3xl bg-white p-4 shadow-card">
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-ink-400">
              Kategoria
            </h3>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {categories.map((cat) => {
                const isSelected = filters.selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, selectedCategory: cat }))}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-all',
                      isSelected ? 'bg-ink text-white font-bold' : 'bg-mist text-ink-700 hover:bg-mist-200',
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Street in Mińsk Mazowiecki */}
          <div className="rounded-3xl bg-white p-4 shadow-card">
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-ink-400">
              Ulica w Mińsku Mazowieckim
            </h3>
            <p className="mt-0.5 text-[11.5px] text-ink-400">
              Pokaż oferty z Twojej lub wybranej ulicy
            </p>
            <div className="mt-2.5">
              <select
                value={filters.selectedStreet}
                onChange={(e) => setFilters((prev) => ({ ...prev, selectedStreet: e.target.value }))}
                className="h-11 w-full rounded-2xl border border-mist-300 bg-mist px-3 text-[13.5px] font-semibold text-ink outline-none"
              >
                <option value="all">Wszystkie ulice w Mińsku</option>
                {streets.map((s) => (
                  <option key={s.name} value={s.name}>
                    ul. {s.name} ({s.neighbors} sąsiadów)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Extra Checkbox: Tylko wyróżnione */}
          <div className="rounded-3xl bg-white p-4 shadow-card">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filters.onlyPromoted}
                onChange={(e) => setFilters((prev) => ({ ...prev, onlyPromoted: e.target.checked }))}
                className="h-4 w-4 rounded accent-coral"
              />
              <div>
                <p className="text-[13.5px] font-bold text-ink">Tylko wyróżnione oferty</p>
                <p className="text-[11.5px] text-ink-400">Pokaż ogłoszenia z pakietem promowania</p>
              </div>
            </label>
          </div>
        </div>

        {/* Bottom Apply Bar */}
        <div className="border-t border-mist bg-white px-5 py-3 pb-[max(env(safe-area-inset-bottom),14px)] shrink-0 shadow-float">
          <button
            type="button"
            onClick={() => {
              onApply(filters);
              onClose();
            }}
            className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-coral text-[15px] font-bold text-ink shadow-coral transition-transform active:scale-95"
          >
            Zastosuj filtry ({totalMatching} ogłoszeń)
          </button>
        </div>
      </div>
    </div>
  );
}
