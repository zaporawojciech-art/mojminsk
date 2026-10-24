import { useState } from 'react';
import {
  ArrowLeft,
  Bike,
  Plus,
  Search,
  Sparkles,
  Tag,
} from 'lucide-react';
import { Img, cn, zl } from '../components/ui';
import {
  type MotylekAisle,
  type Product,
  groceries,
  motylekAislesList,
  motylekDeals,
} from '../data/mockData';

interface MotylekScreenProps {
  onBack: () => void;
  onOpenProduct: (p: Product) => void;
  onAdd: (p: Product) => void;
  qtyOf: (id: string) => number;
  totalCartValue: number;
  isClosing?: boolean;
}

export function MotylekScreen({
  onBack,
  onOpenProduct,
  onAdd,
  qtyOf,
  totalCartValue,
  isClosing = false,
}: MotylekScreenProps) {
  const [selectedAisle, setSelectedAisle] = useState<MotylekAisle>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroceries = groceries.filter((g) => {
    const matchesAisle = selectedAisle === 'all' || g.aisle === selectedAisle;
    const matchesSearch =
      !searchQuery.trim() ||
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAisle && matchesSearch;
  });

  const missingForFreeDelivery = Math.max(0, 120 - totalCartValue);

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col bg-mist select-none',
        isClosing ? 'native-screen-exit' : 'native-screen-slide',
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-y-auto overscroll-contain bg-mist pb-28">
        {/* Header with store brand */}
      <header className="sticky top-0 z-20 border-b border-mist-300 bg-white/95 px-5 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              aria-label="Wróć"
              className="grid h-10 w-10 place-items-center rounded-full bg-mist text-ink transition-transform active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-[18px] font-semibold leading-none text-ink">
                  Motylek Market
                </h1>
                <span className="rounded-full bg-sand px-2 py-0.5 text-[10px] font-bold text-ink">
                  Wyłączność
                </span>
              </div>
              <p className="mt-0.5 text-[11.5px] text-ink-500">
                ul. Siennicka 14 · Mińsk Mazowiecki
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
            </span>
            Otwarte do 21:00
          </div>
        </div>

        {/* Search field */}
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Szukaj chleba, mleka, pomidorów w Motylku…"
            className="h-11 w-full rounded-2xl bg-mist pl-10 pr-4 text-[13.5px] outline-none placeholder:text-ink-400 focus:ring-2 focus:ring-ink"
          />
        </div>
      </header>

      {/* Free Delivery Bar Banner */}
      <div className="bg-sand-100 px-5 py-2.5 text-[12.5px] font-medium text-ink-700">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Bike className="h-4 w-4 text-coral" />
            Dostawa kurierem w 35 min
          </span>
          <span className="font-bold">
            {missingForFreeDelivery === 0 ? (
              <span className="text-emerald-700">Darmowa dostawa aktywna!</span>
            ) : (
              `Do darmowej brakuje: ${zl(missingForFreeDelivery)}`
            )}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/70">
          <div
            className="h-full rounded-full bg-coral transition-all duration-300"
            style={{ width: `${Math.min(100, (totalCartValue / 120) * 100)}%` }}
          />
        </div>
      </div>

      <div className="space-y-6 pt-4">
        {/* Digital Flyer / Gazetka Promocyjna Section */}
        <section className="px-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-coral-700">
                <Tag className="h-3.5 w-3.5" />
                Gazetka Promocyjna
              </span>
              <h2 className="font-display text-[20px] font-semibold text-ink">
                Hity tygodnia z gazetki
              </h2>
            </div>
            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-ink-500 shadow-sm">
              Do soboty
            </span>
          </div>

          <div className="-mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-2 no-scrollbar">
            {motylekDeals.map((deal) => (
              <div
                key={deal.id}
                className="w-[200px] shrink-0 rounded-3xl bg-white p-3 shadow-card transition-transform active:scale-[.98]"
              >
                <div className="relative overflow-hidden rounded-2xl">
                  <Img src={deal.image} alt={deal.title} className="aspect-[4/3] w-full" />
                  <span className="absolute left-2 top-2 rounded-full bg-coral px-2 py-0.5 text-[10.5px] font-bold text-ink shadow-sm">
                    {deal.badge}
                  </span>
                </div>
                <div className="pt-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display text-[18px] font-bold text-ink">{zl(deal.price)}</span>
                    <span className="text-[12px] text-ink-400 line-through">{zl(deal.oldPrice)}</span>
                  </div>
                  <p className="line-clamp-2 min-h-[2.4em] text-[12.5px] font-bold leading-snug text-ink">
                    {deal.title}
                  </p>
                  <p className="text-[11px] text-ink-400">{deal.unit}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Aisles Categories Filter */}
        <section>
          <div className="px-5">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-ink-400">
              Alejki sklepowe
            </h2>
          </div>
          <div className="mt-2.5 flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar">
            {motylekAislesList.map((a) => {
              const active = selectedAisle === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => setSelectedAisle(a.id as MotylekAisle)}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-bold transition-all active:scale-95',
                    active ? 'bg-ink text-white shadow-card' : 'bg-white text-ink-700 shadow-sm hover:bg-white/80',
                  )}
                >
                  {a.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Products Grid */}
        <section className="px-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[19px] font-semibold text-ink">
              Produkty ({filteredGroceries.length})
            </h2>
            <span className="text-[12px] text-ink-400">
              {selectedAisle === 'all' ? 'Cały asortyment' : 'Wybrana kategoria'}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            {filteredGroceries.map((product) => {
              const count = qtyOf(product.id);
              return (
                <article
                  key={product.id}
                  className="flex flex-col justify-between rounded-3xl bg-white p-3 shadow-card"
                >
                  <button
                    onClick={() => onOpenProduct(product)}
                    className="block w-full text-left"
                  >
                    <div className="relative overflow-hidden rounded-2xl">
                      <Img
                        src={product.image}
                        alt={product.name}
                        className="aspect-square w-full"
                      />
                      {product.oldPrice && (
                        <span className="absolute left-2 top-2 rounded-full bg-coral px-2 py-0.5 text-[10px] font-bold text-ink">
                          -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="mt-2 px-1">
                      <p className="text-[11px] font-semibold text-ink-400">{product.unit}</p>
                      <p className="line-clamp-2 min-h-[2.4em] text-[13px] font-bold leading-snug text-ink">
                        {product.name}
                      </p>
                    </div>
                  </button>

                  <div className="mt-3 flex items-center justify-between border-t border-mist pt-2">
                    <div>
                      <span className="font-display text-[16px] font-bold text-ink">
                        {zl(product.price)}
                      </span>
                      {product.oldPrice && (
                        <span className="block text-[10.5px] text-ink-400 line-through">
                          {zl(product.oldPrice)}
                        </span>
                      )}
                    </div>

                    {count === 0 ? (
                      <button
                        onClick={() => onAdd(product)}
                        className="grid h-9 w-9 place-items-center rounded-full bg-coral text-ink shadow-coral transition-transform active:scale-90"
                        aria-label={`Dodaj ${product.name} do koszyka`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 rounded-full bg-mist p-1">
                        <span className="px-2 text-[12px] font-bold tabular-nums text-ink">
                          {count}
                        </span>
                        <button
                          onClick={() => onAdd(product)}
                          className="grid h-7 w-7 place-items-center rounded-full bg-white text-ink shadow-sm"
                          aria-label="Więcej"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Partnership / Freshness guarantee */}
        <section className="mx-5 rounded-4xl bg-sand p-5 text-ink">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-ink text-sand">
              <Sparkles className="h-4 w-4" />
            </span>
            <p className="font-display text-[16px] font-bold">Gwarancja świeżości Motylka</p>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-ink/80">
            Wszystkie artykuły są kompletowane bezpośrednio z półek sklepu Motylek Market przy ul.
            Siennickiej tuż przed przyjazdem kuriera mójMińsk. Pieczywo z rannych wypieków, warzywa od
            lokalnych dostawców.
          </p>
        </section>
      </div>
    </div>
  </div>
);
}
