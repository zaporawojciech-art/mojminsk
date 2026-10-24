import { useState } from 'react';
import { ChevronDown, Heart, MessageCircle, Phone, Plus, Star } from 'lucide-react';
import { avatarUrl, dishes, groceries, groceryHero, kitchenCats, restaurants, type Product, type User } from '../data/mockData';
import { Img, ProfileAvatarButton, SearchField, SectionHeader, cn, toneBg, zl } from '../components/ui';

const steps = ['Przyjęte', 'W kuchni', 'W drodze', 'U Ciebie'];

function OrderTracker() {
  return (
    <div className="mx-5 rounded-4xl bg-ink p-4 text-white">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] font-bold uppercase tracking-wider text-white/55">Zamówienie #2481 · Bella Ciao</p>
          <p className="mt-0.5 font-display text-[21px] font-semibold">Kurier w drodze · 12 min</p>
        </div>
        <Img src={dishes[0].image} alt="" className="h-14 w-14 rounded-full ring-4 ring-white/10" />
      </div>
      <ol className="mt-4 grid grid-cols-4 gap-1.5">
        {steps.map((s, i) => (
          <li key={s}>
            <div className={cn('h-1.5 rounded-full', i < 2 ? 'bg-coral' : i === 2 ? 'animate-pulse bg-coral' : 'bg-white/15')} />
            <p className={cn('mt-1.5 text-[10.5px] font-semibold', i <= 2 ? 'text-white' : 'text-white/40')}>{s}</p>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex items-center gap-3 rounded-3xl bg-white/[.07] p-2.5">
        <img src={avatarUrl('Kamil-kurier')} alt="" className="h-11 w-11 rounded-2xl" />
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-bold">Kamil</p>
          <p className="text-[11.5px] text-white/60">Kurier mójMińsk · rower</p>
        </div>
        <button aria-label="Czat z kurierem" className="grid h-11 w-11 place-items-center rounded-full bg-white/10">
          <MessageCircle className="h-5 w-5" aria-hidden />
        </button>
        <a href="tel:+48500000000" aria-label="Zadzwoń do kuriera" className="grid h-11 w-11 place-items-center rounded-full bg-coral text-ink">
          <Phone className="h-5 w-5" aria-hidden />
        </a>
      </div>
    </div>
  );
}

function AddButton({ qty, onClick, label }: { qty: number; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={`Dodaj ${label}`}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-coral text-[13px] font-bold text-ink shadow-coral transition-transform active:scale-90"
    >
      {qty > 0 ? qty : <Plus className="h-5 w-5" aria-hidden />}
    </button>
  );
}

export function KitchenScreen({
  user,
  onProfile,
  onOpen,
  onAdd,
  qtyOf,
  onOpenMotylek,
}: {
  user?: User;
  onProfile?: () => void;
  onOpen: (p: Product) => void;
  onAdd: (p: Product) => void;
  qtyOf: (id: string) => number;
  onOpenMotylek?: () => void;
}) {
  const [cat, setCat] = useState('all');
  const showGrocery = cat === 'all' || cat === 'motylek';
  const showFood = cat !== 'motylek';
  const visibleDishes = cat === 'all' ? dishes : dishes.filter((d) => d.cat === cat);
  const visibleRest = cat === 'all' ? restaurants : restaurants.filter((r) => r.cat === cat);

  return (
    <div className="space-y-7 pb-56">
      <header className="px-5 pt-[max(env(safe-area-inset-top),16px)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[12px] font-semibold text-ink-400">Dostawa na</p>
            <button className="flex items-center gap-1 font-display text-[22px] font-semibold">
              ul. {user ? user.street.name : 'Spacerowa'} <ChevronDown className="h-5 w-5" aria-hidden />
            </button>
          </div>
          {user && onProfile && <ProfileAvatarButton user={user} onClick={onProfile} />}
        </div>
        <div className="mt-4">
          <SearchField placeholder="Pizza, chleb, sushi, mleko…" />
        </div>
      </header>

      <div className="-mt-2 flex gap-4 overflow-x-auto px-5 pb-1 no-scrollbar" role="tablist" aria-label="Kategorie">
        {kitchenCats.map((c) => {
          const active = cat === c.id;
          return (
            <button
              key={c.id}
              role="tab"
              aria-selected={active}
              onClick={() => {
                if (c.id === 'motylek' && onOpenMotylek) onOpenMotylek();
                else setCat(c.id);
              }}
              className="flex w-16 shrink-0 flex-col items-center gap-1.5"
            >
              <span className={cn('rounded-full p-[3px] transition-all', active ? 'bg-coral' : c.id === 'motylek' ? 'bg-sand' : 'bg-transparent')}>
                <Img src={c.image} alt="" className="h-[58px] w-[58px] rounded-full ring-[3px] ring-mist" />
              </span>
              <span className={cn('text-[12px]', active ? 'font-bold text-ink' : 'font-semibold text-ink-500')}>{c.name}</span>
            </button>
          );
        })}
      </div>

      <OrderTracker />

      {showGrocery && (
        <section className="space-y-4">
          <div
            onClick={onOpenMotylek}
            className="relative mx-5 cursor-pointer overflow-hidden rounded-4xl bg-sand p-5 transition-transform active:scale-[.99]"
          >
            <Img src={groceryHero} alt="" className="absolute -bottom-8 -right-8 h-48 w-48 rounded-full ring-8 ring-sand-200" />
            <div className="flex items-center justify-between">
              <span className="relative inline-flex rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-sand">
                Wyłączny partner
              </span>
              <span className="relative rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-bold text-ink">
                Otwórz market →
              </span>
            </div>
            <p className="relative mt-2.5 max-w-[60%] font-display text-[28px] font-semibold leading-[1.02]">Motylek Market</p>
            <p className="relative mt-1 max-w-[52%] text-[13px] font-medium text-ink/75">Zakupy spożywcze pod drzwi w 35 min</p>
            <div className="relative mt-3 flex flex-wrap gap-1.5 text-[11px] font-bold">
              <span className="rounded-full bg-white/75 px-2.5 py-1">min. 40 zł</span>
              <span className="rounded-full bg-white/75 px-2.5 py-1">0 zł dostawy od 120 zł</span>
              <span className="rounded-full bg-coral/85 px-2.5 py-1 text-ink">Gazetka promocyjna</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 px-5">
            {groceries.map((p) => (
              <article key={p.id} className="rounded-3xl bg-white p-2.5 shadow-card">
                <button onClick={() => onOpen(p)} className="block w-full text-left">
                  <div className="relative overflow-hidden rounded-2xl">
                    <Img src={p.image} alt={p.name} className="aspect-square w-full" />
                    {p.oldPrice && (
                      <span className="absolute left-2 top-2 rounded-full bg-coral px-2 py-0.5 text-[10.5px] font-bold text-ink">
                        −{Math.round((1 - p.price / p.oldPrice) * 100)}%
                      </span>
                    )}
                  </div>
                  <p className="mt-2.5 px-1 text-[11px] font-semibold text-ink-400">{p.unit}</p>
                  <p className="line-clamp-2 min-h-[2.5em] px-1 text-[13.5px] font-bold leading-tight">{p.name}</p>
                </button>
                <div className="mt-2 flex items-end justify-between px-1">
                  <div>
                    <p className="font-display text-[17px] font-semibold leading-none">{zl(p.price)}</p>
                    {p.oldPrice && <p className="mt-0.5 text-[11px] text-ink-400 line-through">{zl(p.oldPrice)}</p>}
                  </div>
                  <AddButton qty={qtyOf(p.id)} onClick={() => onAdd(p)} label={p.name} />
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {showFood && visibleDishes.length > 0 && (
        <section>
          <SectionHeader title="Hity tygodnia" action="Więcej" />
          <div className="flex gap-3 overflow-x-auto px-5 pb-2 pt-8 no-scrollbar">
            {visibleDishes.map((d) => (
              <article key={d.id} className={cn('relative w-[172px] shrink-0 rounded-4xl p-4 pt-20', toneBg[d.tone])}>
                <button onClick={() => onOpen(d)} className="absolute -top-8 left-1/2 -translate-x-1/2" aria-label={`Szczegóły: ${d.name}`}>
                  <Img src={d.image} alt="" className="h-28 w-28 rounded-full shadow-float ring-[6px] ring-white/70" />
                </button>
                <p className="line-clamp-2 min-h-[2.5em] text-[14px] font-bold leading-tight">{d.name}</p>
                <p className="mt-0.5 truncate text-[11.5px] text-ink-500">{d.vendor}</p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="font-display text-[18px] font-semibold">{zl(d.price)}</p>
                  <AddButton qty={qtyOf(d.id)} onClick={() => onAdd(d)} label={d.name} />
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {showFood && visibleRest.length > 0 && (
        <section>
          <SectionHeader title="Restauracje w Mińsku" />
          <div className="space-y-4 px-5">
            {visibleRest.map((r) => (
              <article key={r.id} className="overflow-hidden rounded-4xl bg-white shadow-card">
                <button onClick={() => onOpen(dishes.find((d) => d.id === r.dishId)!)} className="block w-full text-left">
                  <div className="relative">
                    <Img src={r.image} alt={r.name} className="h-40 w-full" />
                    {r.badge && <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold">{r.badge}</span>}
                    <span className="absolute bottom-3 left-3 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">{r.time}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-[16px] font-bold">{r.name}</p>
                      <p className="truncate text-[12.5px] text-ink-500">{r.cuisine}</p>
                      <p className="mt-1 text-[12px] font-semibold text-sky-700">{r.fee}</p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sand-100 px-2.5 py-1 text-[12px] font-bold">
                      <Star className="h-3.5 w-3.5 fill-sand-600 text-sand-600" aria-hidden />
                      {r.rating} <span className="font-medium text-ink-400">({r.reviews})</span>
                    </span>
                  </div>
                </button>
                <span className="sr-only">
                  <Heart aria-hidden />
                </span>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
