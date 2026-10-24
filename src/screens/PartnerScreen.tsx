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
        'fixed inset-0 z-50 flex flex-col bg-ink select-none',
        isClosing ? 'native-screen-exit' : 'native-screen-slide',
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-y-auto overscroll-contain pb-16 text-white">
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
);
}
