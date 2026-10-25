import { useState } from 'react';
import {
  Bike,
  Plus,
  Search,
  ShieldCheck,
  Tag,
  X,
} from 'lucide-react';
import { Img, ProfileAvatarButton, cn, zl } from '../components/ui';
import {
  type MotylekAisle,
  type Product,
  type User,
  groceries,
  motylekAislesList,
  motylekDeals,
} from '../data/mockData';

interface ShopScreenProps {
  user?: User;
  onProfile?: () => void;
  onOpenProduct: (p: Product) => void;
  onAdd: (p: Product) => void;
  qtyOf: (id: string) => number;
  totalCartValue: number;
}

export function ShopScreen({
  user,
  onProfile,
  onOpenProduct,
  onAdd,
  qtyOf,
  totalCartValue,
}: ShopScreenProps) {
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
  const deliveryProgress = Math.min(100, Math.round((totalCartValue / 120) * 100));

  const getDealProduct = (deal: (typeof motylekDeals)[number]): Product => {
    const existing = groceries.find((g) => g.id === deal.id);
    if (existing) return existing;
    return {
      id: deal.id,
      name: deal.title,
      vendor: 'Motylek Market',
      price: deal.price,
      oldPrice: deal.oldPrice,
      unit: deal.unit,
      image: deal.image,
      cat: 'motylek',
      kind: 'grocery',
      tone: 'sand',
      description: `Promocja z gazetki Motylek Market (${deal.badge}).`,
    };
  };

  return (
    <div className="pb-36 select-none">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-20 border-b border-mist-300 bg-white/95 px-5 pt-[max(env(safe-area-inset-top),14px)] pb-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-[21px] font-bold text-ink leading-none">
                Motylek Market
              </h1>
              <span className="rounded-full bg-sand px-2 py-0.5 text-[10px] font-extrabold text-ink shrink-0">
                Wyłączność
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <p className="text-[11.5px] font-medium text-ink-500">
                Dostawa do: <span className="font-bold text-ink">ul. {user ? user.street.name : 'Spacerowa'}</span>
              </p>
              <span className="text-ink-300">·</span>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
                </span>
                <span>Otwarte do 21:00</span>
              </div>
            </div>
          </div>

          {user && onProfile && (
            <ProfileAvatarButton user={user} onClick={onProfile} />
          )}
        </div>

        {/* Search Field */}
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Szukaj chleba, mleka, pomidorów w Motylku…"
            className="h-11 w-full rounded-2xl bg-mist pl-10 pr-9 text-[13.5px] outline-none placeholder:text-ink-400 focus:bg-white focus:ring-2 focus:ring-ink transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 grid h-6 w-6 place-items-center rounded-full bg-mist-300 text-ink-500"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </header>

      {/* Free Delivery Bar Banner */}
      <div className="bg-sand-100 px-5 py-2.5 text-[12px] font-medium text-ink-700 border-b border-sand-200">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-semibold">
            <Bike className="h-4 w-4 text-coral" />
            Dostawa kurierem w 35 min
          </span>
          <span className="font-extrabold text-[11.5px]">
            {missingForFreeDelivery === 0 ? (
              <span className="text-emerald-700 font-extrabold">Darmowa dostawa aktywna! 🎉</span>
            ) : (
              `Do darmowej brakuje: ${zl(missingForFreeDelivery)}`
            )}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/70">
          <div
            className="h-full rounded-full bg-coral transition-all duration-300"
            style={{ width: `${deliveryProgress}%` }}
          />
        </div>
      </div>

      <div className="space-y-6 pt-4">
        {/* Gazetka Promocyjna Section */}
        <section className="px-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-coral-700">
                <Tag className="h-3.5 w-3.5" />
                Gazetka Promocyjna
              </span>
              <h2 className="font-display text-[19px] font-bold text-ink">
                Hity tygodnia z gazetki
              </h2>
            </div>
            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-ink-500 shadow-card border border-mist-300">
              Do soboty
            </span>
          </div>

          <div className="-mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-2 no-scrollbar">
            {motylekDeals.map((deal) => {
              const product = getDealProduct(deal);
              const inCartCount = qtyOf(product.id);

              return (
                <article
                  key={deal.id}
                  onClick={() => onOpenProduct(product)}
                  className="w-[185px] shrink-0 cursor-pointer rounded-3xl bg-white p-3 shadow-card transition-all hover:shadow-float active:scale-[0.98] border border-mist-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative overflow-hidden rounded-2xl bg-mist">
                      <Img src={deal.image} alt={deal.title} className="aspect-[4/3] w-full object-cover" />
                      <span className="absolute left-2 top-2 rounded-full bg-coral px-2 py-0.5 text-[10px] font-extrabold text-ink shadow-sm">
                        {deal.badge}
                      </span>
                    </div>
                    <div className="pt-2 px-0.5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-display text-[17px] font-bold text-ink">{zl(deal.price)}</span>
                        <span className="text-[11.5px] text-ink-400 line-through">{zl(deal.oldPrice)}</span>
                      </div>
                      <p className="line-clamp-2 min-h-[2.4em] text-[12px] font-bold leading-snug text-ink mt-0.5">
                        {deal.title}
                      </p>
                      <p className="text-[10.5px] font-medium text-ink-400 mt-1">{deal.unit}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAdd(product);
                    }}
                    className={cn(
                      "mt-2.5 flex h-8 w-full items-center justify-center gap-1 rounded-full text-[11px] font-bold shadow-xs transition-all active:scale-95",
                      inCartCount > 0
                        ? "bg-emerald-600 text-white"
                        : "bg-ink text-white hover:bg-ink-800"
                    )}
                  >
                    <Plus className="h-3 w-3" />
                    {inCartCount > 0 ? `W koszyku (${inCartCount})` : 'Do koszyka'}
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        {/* Alejki Sklepowe Filter */}
        <section>
          <div className="px-5">
            <h2 className="text-[11.5px] font-extrabold uppercase tracking-wider text-ink-400">
              Alejki sklepowe Motylka
            </h2>
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar">
            {motylekAislesList.map((a) => {
              const active = selectedAisle === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => setSelectedAisle(a.id as MotylekAisle)}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-bold transition-all active:scale-95 border',
                    active
                      ? 'bg-ink text-white border-ink shadow-card'
                      : 'bg-white text-ink-700 border-mist-300 shadow-card hover:bg-mist/50',
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
            <h2 className="font-display text-[18px] font-bold text-ink">
              Produkty ({filteredGroceries.length})
            </h2>
            <span className="text-[11.5px] font-medium text-ink-400">
              {selectedAisle === 'all' ? 'Cały asortyment' : 'Wybrana kategoria'}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            {filteredGroceries.map((product) => {
              const count = qtyOf(product.id);
              return (
                <article
                  key={product.id}
                  className="group flex flex-col justify-between rounded-3xl bg-white p-3 shadow-card transition-all hover:shadow-float border border-mist-200"
                >
                  <div
                    onClick={() => onOpenProduct(product)}
                    className="block w-full text-left cursor-pointer"
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-mist">
                      <Img
                        src={product.image}
                        alt={product.name}
                        className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {product.oldPrice && (
                        <span className="absolute left-2 top-2 rounded-full bg-coral px-2 py-0.5 text-[9.5px] font-extrabold text-ink shadow-sm">
                          -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="mt-2 px-0.5">
                      <p className="text-[10.5px] font-semibold text-ink-400">{product.unit}</p>
                      <p className="line-clamp-2 min-h-[2.4em] text-[12.5px] font-bold leading-snug text-ink mt-0.5">
                        {product.name}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between border-t border-mist/80 pt-2 px-0.5">
                    <div>
                      <span className="font-display text-[16px] font-bold text-ink leading-none">
                        {zl(product.price)}
                      </span>
                      {product.oldPrice && (
                        <span className="block text-[10px] text-ink-400 line-through leading-none mt-0.5">
                          {zl(product.oldPrice)}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onAdd(product)}
                      aria-label={`Dodaj ${product.name} do koszyka`}
                      className={cn(
                        'grid h-9 w-9 shrink-0 place-items-center rounded-full text-[13px] font-bold transition-all active:scale-90',
                        count > 0
                          ? 'bg-ink text-white shadow-card'
                          : 'bg-coral text-ink shadow-coral hover:brightness-105',
                      )}
                    >
                      {count > 0 ? count : <Plus className="h-4 w-4" aria-hidden />}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Local Guarantee Box */}
        <section className="mx-5 rounded-3xl bg-white p-4 shadow-card border border-mist-300">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-sand-200 text-ink">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[13px] font-bold text-ink">Hiperlokalne zakupy w Mińsku</p>
              <p className="text-[11px] text-ink-400">Wyłączny partner spożywczy mójMińsk</p>
            </div>
          </div>
          <p className="mt-2.5 text-[11.5px] leading-relaxed text-ink-500">
            Wszystkie artykuły są kompletowane bezpośrednio z półek sklepu Motylek Market przy ul. Siennickiej 14 w Mińsku Mazowieckim. Świeże pieczywo, nabiał i wędliny od lokalnych dostawców trafiają pod Twoje drzwi w 35 minut.
          </p>
        </section>
      </div>
    </div>
  );
}
