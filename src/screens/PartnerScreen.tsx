import { useState } from 'react';
import { Check, Copy, MapPin } from 'lucide-react';
import { partner } from '../data/mockData';
import { BackHeader, Img, cn, zl } from '../components/ui';

export function PartnerScreen({ onBack, isClosing = false }: { onBack: () => void; isClosing?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [reserved, setReserved] = useState<Record<string, boolean>>({});

  return (
    <div
      className={cn(
        'fixed inset-0 md:relative md:inset-auto md:h-full md:w-full z-50 flex flex-col bg-ink select-none',
        isClosing ? 'native-screen-exit' : 'native-screen-slide',
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-md md:max-w-none flex-col overflow-y-auto overscroll-contain pb-16 text-white">
        {/* =====================================================================
            DESKTOP VIEW (>= 768px): 12-Column Partner Showcase
            ===================================================================== */}
        <div className="hidden md:block">
          <BackHeader onBack={onBack} dark />
          <div className="px-8 lg:px-12 py-6 grid grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN (4 cols): Hero Showcase & Discount Code Card */}
            <div className="col-span-4 space-y-5 sticky top-6">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6">
                <Img
                  src={partner.hero}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-35"
                />
                <div className="relative z-10 pt-16">
                  <span className="inline-block rounded-md bg-sand px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-ink">
                    Strefa Partnera Mińsk Mazowiecki
                  </span>
                  <h1 className="mt-3 font-display text-[32px] font-bold leading-tight text-white">
                    {partner.name}
                  </h1>
                  <p className="mt-2 flex items-center gap-1.5 text-[13px] text-white/80">
                    <MapPin className="h-4 w-4 text-sand shrink-0" aria-hidden />
                    {partner.address}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl bg-sand p-6 text-ink shadow-card">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink/60">
                  Tylko dla mieszkańców mójMińsk
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <p className="font-display text-[44px] font-bold leading-none">−15%</p>
                  <span className="text-[13px] font-bold text-ink/75">rabatu sąsiedzkiego</span>
                </div>
                <p className="mt-1.5 text-[13px] font-medium text-ink/75">
                  Na całą kolekcję biżuterii autorskiej oraz usługi złotnicze w pracowni stacjonarnej w Mińsku Mazowieckim.
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(partner.code);
                    setCopied(true);
                  }}
                  className="mt-4 flex h-12 w-full items-center justify-between rounded-2xl border-2 border-dashed border-ink/30 bg-white/70 pl-4 pr-2 hover:bg-white transition-colors cursor-pointer"
                >
                  <span className="font-display text-[17px] font-bold tracking-wider">
                    {partner.code}
                  </span>
                  <span className="flex h-9 items-center gap-1.5 rounded-xl bg-ink px-3.5 text-[12px] font-bold text-white">
                    {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
                    {copied ? 'Skopiowano' : 'Kopiuj kod'}
                  </span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN (8 cols): Partner Collection Grid */}
            <div className="col-span-8 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h2 className="font-display text-[22px] font-bold text-white">
                    Kolekcja z rabatem −15% dla sąsiadów
                  </h2>
                  <p className="text-[12.5px] text-white/60">
                    Zarezerwuj wybrany model w aplikacji i odbierz go osobiście w salonie przy {partner.address}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {partner.products.map((p) => (
                  <article
                    key={p.id}
                    className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[.06] p-3 hover:bg-white/[.09] transition-colors"
                  >
                    <div>
                      <Img src={p.image} alt={p.name} className="aspect-square w-full rounded-xl object-cover" />
                      <p className="mt-3 px-0.5 text-[11px] font-bold uppercase tracking-wider text-sand">
                        {p.material}
                      </p>
                      <p className="mt-0.5 px-0.5 text-[14px] font-bold leading-snug text-white">
                        {p.name}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-white/10">
                      <div className="flex items-baseline gap-1.5 px-0.5">
                        <span className="font-display text-[18px] font-bold text-white">
                          {zl(p.price * 0.85)}
                        </span>
                        <span className="text-[11.5px] text-white/45 line-through">
                          {zl(p.price)}
                        </span>
                      </div>
                      <button
                        onClick={() => setReserved((r) => ({ ...r, [p.id]: true }))}
                        className="mt-2.5 h-10 w-full rounded-xl bg-sand text-[12.5px] font-bold text-ink hover:bg-sand-200 transition-colors disabled:bg-white/10 disabled:text-white cursor-pointer"
                        disabled={reserved[p.id]}
                      >
                        {reserved[p.id] ? '✓ Zarezerwowano w salonie' : 'Zarezerwuj w salonie'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            MOBILE VIEW (< 768px): Original Native Layout
            ===================================================================== */}
        <div className="md:hidden">
          <div className="relative">
            <Img src={partner.hero} alt="" className="absolute inset-0 h-80 w-full opacity-70 [mask-image:linear-gradient(to_bottom,black_40%,transparent)]" />
            <div className="relative">
              <BackHeader onBack={onBack} dark />
              <div className="px-6 pb-6 pt-28">
                <span className="text-[10.5px] font-bold uppercase tracking-[.18em] text-sand">Strefa Partnera</span>
                <h1 className="mt-2 font-display text-[38px] font-semibold leading-[0.98]">{partner.name}</h1>
                <p className="mt-2 flex items-center gap-1.5 text-[13px] text-white/70">
                  <MapPin className="h-4 w-4" aria-hidden />
                  {partner.address}
                </p>
              </div>
            </div>
          </div>

          <div className="mx-5 rounded-4xl bg-sand p-5 text-ink">
            <p className="text-[12px] font-bold uppercase tracking-wider text-ink/60">Tylko dla mieszkańców mójMińsk</p>
            <p className="mt-1 font-display text-[40px] font-semibold leading-none">−15%</p>
            <p className="mt-1 text-[13px] font-medium text-ink/75">na całą kolekcję online i w pracowni</p>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(partner.code);
                setCopied(true);
              }}
              className="mt-4 flex h-12 w-full items-center justify-between rounded-full border-2 border-dashed border-ink/30 bg-white/60 pl-5 pr-2"
            >
              <span className="font-display text-[18px] font-semibold tracking-wider">{partner.code}</span>
              <span className="flex h-9 items-center gap-1.5 rounded-full bg-ink px-3.5 text-[12px] font-bold text-white">
                {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
                {copied ? 'Skopiowano' : 'Kopiuj'}
              </span>
            </button>
          </div>

          <h2 className="mt-8 px-5 font-display text-[22px] font-semibold">Kolekcja</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 px-5">
            {partner.products.map((p) => (
              <article key={p.id} className="rounded-3xl bg-white/[.06] p-2.5">
                <Img src={p.image} alt={p.name} className="aspect-square w-full rounded-2xl" />
                <p className="mt-2.5 px-1 text-[11px] font-semibold text-sand">{p.material}</p>
                <p className="px-1 text-[13.5px] font-bold leading-tight">{p.name}</p>
                <div className="mt-1.5 flex items-baseline gap-1.5 px-1">
                  <span className="font-display text-[17px] font-semibold">{zl(p.price * 0.85)}</span>
                  <span className="text-[11px] text-white/45 line-through">{zl(p.price)}</span>
                </div>
                <button
                  onClick={() => setReserved((r) => ({ ...r, [p.id]: true }))}
                  className="mt-2.5 h-10 w-full rounded-full bg-sand text-[12.5px] font-bold text-ink disabled:bg-white/10 disabled:text-white"
                  disabled={reserved[p.id]}
                >
                  {reserved[p.id] ? 'Zarezerwowano' : 'Zarezerwuj'}
                </button>
              </article>
            ))}
          </div>
        </div>
      </div>
  </div>
);
}
