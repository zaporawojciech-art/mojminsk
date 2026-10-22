import { useState } from 'react';
import { BadgeCheck, ChevronRight, Coffee, Dices, Gem, Lock, Mail, Megaphone, ReceiptText, Car, Settings, Vote } from 'lucide-react';
import { avatarUrl, type User } from '../data/mockData';
import { BackHeader, StreetPill, cn } from '../components/ui';

export function ProfileScreen({ user, onBack, onUpdate, onPartner }: { user: User; onBack: () => void; onUpdate: (u: User) => void; onPartner: () => void }) {
  const [pin, setPin] = useState('');

  const menu = [
    { icon: ReceiptText, label: 'Moje zamówienia', meta: '2 w tym miesiącu', tone: 'bg-coral-100' },
    { icon: Megaphone, label: 'Moje ogłoszenia', meta: '1 aktywne', tone: 'bg-sand-100' },
    { icon: Car, label: 'Moje przejazdy', meta: '5 przejazdów', tone: 'bg-sky-100' },
    { icon: Vote, label: 'Utwórz ankietę sąsiedzką', meta: '1 / miesiąc', tone: 'bg-sand-100' },
    { icon: Gem, label: 'Strefa Partnera', meta: 'Złota Nić −15%', tone: 'bg-coral-100', onClick: onPartner },
    { icon: Coffee, label: 'Wesprzyj mójMińsk', meta: 'BLIK', tone: 'bg-sky-100' },
    { icon: Settings, label: 'Ustawienia i prywatność', tone: 'bg-mist' },
  ];

  return (
    <div className="pb-16">
      <BackHeader title="Profil" onBack={onBack} />

      <section className="px-5 pt-4 text-center">
        <div className="relative mx-auto h-36 w-36">
          <div className="absolute inset-0 rounded-[44px] bg-[conic-gradient(from_200deg,#F26659,#EBC999,#8CA9D3,#F26659)] p-1">
            <img src={avatarUrl(user.seed)} alt="Twój awatar AI" className="h-full w-full rounded-[40px] bg-white" />
          </div>
          {user.verified && (
            <span className="absolute -bottom-1 -right-1 grid h-10 w-10 place-items-center rounded-full bg-white shadow-card">
              <BadgeCheck className="h-7 w-7 fill-sky text-white" aria-label="Zweryfikowany" />
            </span>
          )}
        </div>
        <button
          disabled={user.rerolls === 0}
          onClick={() => onUpdate({ ...user, seed: `${user.name}-${Date.now()}`, rerolls: user.rerolls - 1 })}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[12px] font-bold shadow-card disabled:opacity-40"
        >
          <Dices className="h-4 w-4" aria-hidden />
          Wylosuj nowy awatar ({user.rerolls})
        </button>
        <h1 className="mt-4 font-display text-[28px] font-semibold leading-tight">
          {user.name} {user.street.as}
        </h1>
        <div className="mt-2 flex justify-center">
          <StreetPill street={`ul. ${user.street.name} · ${user.street.neighbors} sąsiadów`} className="bg-white text-[12px]" />
        </div>
      </section>

      <div className="mx-5 mt-6 grid grid-cols-3 gap-2.5">
        {[
          ['12', 'Wpisów'],
          ['148', 'Polubień'],
          ['5', 'Przejazdów'],
        ].map(([v, l]) => (
          <div key={l} className="rounded-3xl bg-white p-3 text-center shadow-card">
            <p className="font-display text-[22px] font-semibold">{v}</p>
            <p className="text-[11.5px] font-medium text-ink-500">{l}</p>
          </div>
        ))}
      </div>

      {user.verified ? (
        <div className="mx-5 mt-4 flex items-center gap-3 rounded-4xl bg-sky p-4">
          <BadgeCheck className="h-8 w-8 shrink-0" aria-hidden />
          <div>
            <p className="text-[14.5px] font-bold">Zweryfikowany mieszkaniec</p>
            <p className="text-[12px] text-ink/70">Adres potwierdzony listem · pełne uprawnienia</p>
          </div>
        </div>
      ) : (
        <div className="mx-5 mt-4 rounded-4xl bg-sand-100 p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sand">
              <Mail className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14.5px] font-bold">List z kodem jest w drodze</p>
              <p className="text-[12px] text-ink-500">Konto tymczasowe — zostało {user.trialDaysLeft} dni</p>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-sand-600" style={{ width: `${(user.trialDaysLeft / 14) * 100}%` }} />
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              placeholder="Kod z listu"
              aria-label="6-cyfrowy kod z listu"
              className="h-12 min-w-0 flex-1 rounded-full bg-white px-4 text-center font-display text-[18px] font-semibold tracking-[.35em] outline-none placeholder:font-sans placeholder:text-[14px] placeholder:font-medium placeholder:tracking-normal placeholder:text-ink-400 focus:ring-2 focus:ring-ink"
            />
            <button
              disabled={pin.length !== 6}
              onClick={() => onUpdate({ ...user, verified: true })}
              className="h-12 rounded-full bg-ink px-5 text-[13.5px] font-bold text-white disabled:opacity-40"
            >
              Aktywuj
            </button>
          </div>
        </div>
      )}

      <ul className="mx-5 mt-4 overflow-hidden rounded-4xl bg-white shadow-card">
        {menu.map(({ icon: Icon, label, meta, tone, onClick }) => (
          <li key={label} className="border-b border-mist last:border-0">
            <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-mist/50">
              <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-2xl', tone)}>
                <Icon className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <span className="flex-1 text-[14.5px] font-semibold">{label}</span>
              {meta && <span className="text-[12px] text-ink-400">{meta}</span>}
              <ChevronRight className="h-4 w-4 text-ink-300" aria-hidden />
            </button>
          </li>
        ))}
      </ul>

      <p className="mx-8 mt-5 flex items-start justify-center gap-1.5 text-center text-[11.5px] leading-snug text-ink-400">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        Twój pełny adres widzi tylko administrator. Inni widzą: {user.name} {user.street.as}.
      </p>
    </div>
  );
}
