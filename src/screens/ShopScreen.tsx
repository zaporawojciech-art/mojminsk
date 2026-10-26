import { useState } from 'react';
import {
  Check,
  Clock,
  Info,
  Moon,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  Sun,
  Tag,
  Truck,
  X,
} from 'lucide-react';
import { Img, StandardTopBar, cn, zl } from '../components/ui';
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

export type DeliverySlotId = 'today_evening' | 'tomorrow_morning' | 'tomorrow_evening';

interface DeliverySlot {
  id: DeliverySlotId;
  label: string;
  sub: string;
  cutoff: string;
  badge?: string;
  icon: typeof Moon | typeof Sun;
}

const DELIVERY_SLOTS: DeliverySlot[] = [
  {
    id: 'today_evening',
    label: 'Dzisiaj wieczorem',
    sub: '18:30 – 20:30',
    cutoff: 'Zamów do 16:00',
    badge: 'Najchętniej wybierany',
    icon: Moon,
  },
  {
    id: 'tomorrow_morning',
    label: 'Jutro rano',
    sub: '07:30 – 09:30',
    cutoff: 'Zamów do 21:00',
    badge: 'Świeże pieczywo',
    icon: Sun,
  },
  {
    id: 'tomorrow_evening',
    label: 'Jutro po pracy',
    sub: '18:30 – 20:30',
    cutoff: 'Zaplanowane zakupy',
    icon: Moon,
  },
];

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
  const [selectedSlot, setSelectedSlot] = useState<DeliverySlotId>('today_evening');
  const [showHowItWorks, setShowHowItWorks] = useState(false);

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

  const activeSlot = DELIVERY_SLOTS.find((s) => s.id === selectedSlot) ?? DELIVERY_SLOTS[0];

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
      {/* Unified Standard Top Bar */}
      <StandardTopBar
        user={user}
        onProfile={onProfile}
        title={
          <div className="flex items-center gap-2">
            <h1 className="font-display text-[22px] font-bold text-ink leading-none">
              Motylek Market
            </h1>
            <span className="rounded-full bg-sand px-2 py-0.5 text-[10px] font-extrabold text-ink shrink-0">
              Wyłączność
            </span>
          </div>
        }
        subtitle={
          <div className="flex items-center gap-2 text-[12px] flex-wrap">
            <p className="text-[11.5px] font-medium text-ink-500">
              Dostawa: <span className="font-bold text-ink">ul. {user ? user.street.name : 'Spacerowa'}</span>
            </p>
            <span className="text-ink-300">·</span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
              </span>
              <span>ul. Siennicka 14</span>
            </div>
          </div>
        }
      />

      {/* Search Field */}
      <div className="px-5 pb-3 pt-1">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Szukaj pieczywa, nabiału, wędlin z Motylka…"
            className="h-11 w-full rounded-2xl bg-white pl-10 pr-9 text-[13.5px] outline-none placeholder:text-ink-400 focus:ring-2 focus:ring-ink shadow-card transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 grid h-6 w-6 place-items-center rounded-full bg-mist text-ink-500"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Free Delivery Bar Banner */}
      <div className="bg-sand-100 px-5 py-2.5 text-[12px] font-medium text-ink-700 border-b border-sand-200">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-semibold">
            <Truck className="h-4 w-4 text-ink-700" />
            <span>Dedykowany kurier mójMińsk</span>
          </span>
          <span className="font-extrabold text-[11.5px]">
            {missingForFreeDelivery === 0 ? (
              <span className="text-emerald-700 font-extrabold">Darmowa dostawa aktywna! 🎉</span>
            ) : (
              `Do darmowej: ${zl(missingForFreeDelivery)}`
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
        {/* Planned Delivery Slot Hero Selector */}
        <section className="px-5">
          <div className="relative overflow-hidden rounded-3xl bg-ink p-4 text-white shadow-float border border-ink-800">
            <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-coral/15 blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-sand">
                <Clock className="h-3.5 w-3.5 text-sand" />
                Planowana dostawa domowa
              </span>
              <button
                type="button"
                onClick={() => setShowHowItWorks((prev) => !prev)}
                className="flex items-center gap-1 text-[11.5px] font-semibold text-white/70 hover:text-white transition-colors"
              >
                <span>Jak to działa?</span>
                <Info className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-display text-[19px] font-bold text-white tracking-tight leading-snug">
                  {activeSlot.label}: <span className="text-sand">{activeSlot.sub}</span>
                </h2>
              </div>
              <p className="mt-1 text-[12px] text-white/80 leading-relaxed">
                {activeSlot.cutoff} · Kurier doręcza zakupy w zaplanowanej pętli wieczornej.
              </p>
            </div>

            {/* Delivery Slot Buttons */}
            <div className="mt-3.5 grid grid-cols-3 gap-2">
              {DELIVERY_SLOTS.map((slot) => {
                const isSelected = selectedSlot === slot.id;
                const SlotIcon = slot.icon;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlot(slot.id)}
                    className={cn(
                      'relative flex flex-col items-start rounded-2xl p-2.5 text-left transition-all active:scale-95 border',
                      isSelected
                        ? 'bg-white text-ink border-sand shadow-sm'
                        : 'bg-white/10 text-white border-white/10 hover:bg-white/15',
                    )}
                  >
                    {slot.badge && isSelected && (
                      <span className="absolute -top-2 right-1.5 rounded-full bg-coral px-1.5 py-0.2 text-[8px] font-extrabold text-ink">
                        HIT
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      <SlotIcon className={cn('h-3.5 w-3.5', isSelected ? 'text-coral' : 'text-sand')} />
                      <span className="text-[11px] font-bold truncate">{slot.label}</span>
                    </div>
                    <span className={cn('text-[11.5px] font-extrabold mt-0.5', isSelected ? 'text-ink' : 'text-sand-100')}>
                      {slot.sub}
                    </span>
                    <span className={cn('text-[9.5px] mt-0.5 truncate', isSelected ? 'text-ink-500' : 'text-white/60')}>
                      {slot.cutoff}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Collapsible How It Works Explanation */}
            {showHowItWorks && (
              <div className="mt-4 pt-3.5 border-t border-white/15 space-y-2 text-[12px] text-white/90">
                <p className="font-bold text-sand text-[12.5px]">
                  Dlaczego zakupy na slot, a nie w 15 minut?
                </p>
                <div className="grid grid-cols-3 gap-2 text-[11px] leading-snug pt-1">
                  <div className="rounded-xl bg-white/5 p-2 border border-white/10">
                    <p className="font-bold text-white">1. Zamawiasz do 16:00</p>
                    <p className="text-white/70 mt-1">Spokojny wybór z pracy lub domu.</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-2 border border-white/10">
                    <p className="font-bold text-white">2. Motylek pakuje</p>
                    <p className="text-white/70 mt-1">Najświeższe pieczywo i wędliny o 16:30.</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-2 border border-white/10">
                    <p className="font-bold text-white">3. Kurier dowozi</p>
                    <p className="text-white/70 mt-1">18:30–20:30 prosto pod Twoje drzwi.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 3 Step Quality Guarantee Bar */}
        <section className="px-5">
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-sand-50 p-2.5 border border-sand-200 text-center">
            <div className="flex flex-col items-center">
              <span className="grid h-7 w-7 place-items-center rounded-xl bg-white text-ink shadow-xs">
                <Clock className="h-3.5 w-3.5 text-coral" />
              </span>
              <p className="mt-1 text-[11px] font-bold text-ink">Zamów do 16:00</p>
              <p className="text-[9.5px] text-ink-500">Na dzisiejszy wieczór</p>
            </div>
            <div className="flex flex-col items-center border-x border-sand-200 px-1">
              <span className="grid h-7 w-7 place-items-center rounded-xl bg-white text-ink shadow-xs">
                <PackageCheck className="h-3.5 w-3.5 text-emerald-700" />
              </span>
              <p className="mt-1 text-[11px] font-bold text-ink">Staranna selekcja</p>
              <p className="text-[9.5px] text-ink-500">Bez biegania i pośpiechu</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="grid h-7 w-7 place-items-center rounded-xl bg-white text-ink shadow-xs">
                <Truck className="h-3.5 w-3.5 text-sky-700" />
              </span>
              <p className="mt-1 text-[11px] font-bold text-ink">Kurier mójMińsk</p>
              <p className="text-[9.5px] text-ink-500">Doręczenie 18:30–20:30</p>
            </div>
          </div>
        </section>

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

        {/* Local Guarantee & Q-Commerce Alternative Box */}
        <section className="mx-5 rounded-3xl bg-white p-4 shadow-card border border-mist-300 space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-sand text-ink">
              <ShieldCheck className="h-5 w-5 text-ink" />
            </span>
            <div>
              <p className="text-[13.5px] font-bold text-ink">Dlaczego zakupy z Motylka w slotach?</p>
              <p className="text-[11px] text-ink-400">Wyłączny partner spożywczy mójMińsk</p>
            </div>
          </div>

          <p className="text-[12px] leading-relaxed text-ink-600">
            Zamiast pośpiesznego q-commerce, stawiamy na jakość: zamawiasz w ciągu dnia do 16:00, personel Motylka przy ul. Siennickiej 14 kompletuje Twoje zakupy ze świeżych dostaw, a dedykowany kurier mójMińsk doręcza je wieczorem prosto pod Twoje drzwi.
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-mist">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-700">
              <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Zawsze świeże pieczywo</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-700">
              <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Chłodniczy transport</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-700">
              <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Zero pośpiechu i pomyłek</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-700">
              <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Darmowa dostawa od 120 zł</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
