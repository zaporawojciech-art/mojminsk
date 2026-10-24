import { useState } from 'react';
import { ArrowUpDown, Check, Phone, Star, Users } from 'lucide-react';
import { avatarUrl, rides, type User } from '../data/mockData';
import { Chip, ProfileAvatarButton, ScreenHeader, Segmented, cn } from '../components/ui';

const dests = ['Wszystkie', 'Warszawa', 'Halinów', 'Sulejówek'];

export function RidesScreen({ user, onProfile }: { user?: User; onProfile?: () => void }) {
  const [mode, setMode] = useState<'find' | 'offer'>('find');
  const [dest, setDest] = useState('Wszystkie');
  const [day, setDay] = useState<'today' | 'tomorrow'>('tomorrow');
  const [booked, setBooked] = useState<Record<string, boolean>>({});
  const [published, setPublished] = useState(false);
  const list = dest === 'Wszystkie' ? rides : rides.filter((r) => r.dest === dest);

  return (
    <div className="pb-36">
      <ScreenHeader
        title="Przejazdy"
        subtitle="Sąsiedzki carpooling i taxi"
        right={user && onProfile ? <ProfileAvatarButton user={user} onClick={onProfile} /> : undefined}
      />

      <div className="mx-5 relative overflow-hidden rounded-4xl bg-ink p-5 text-white">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sand/20" aria-hidden />
        <div className="absolute -bottom-14 right-10 h-32 w-32 rounded-full bg-coral/25" aria-hidden />
        <span className="relative text-[10.5px] font-bold uppercase tracking-[.16em] text-sand">Oficjalny partner</span>
        <p className="relative mt-1 font-display text-[26px] font-semibold leading-none">Nova Taxi</p>
        <p className="relative mt-1.5 text-[13px] text-white/70">Podjazd w Mińsku w 5–10 min</p>
        <div className="relative mt-4 flex items-center gap-2">
          <a href="tel:+48257582222" className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-coral text-[14.5px] font-bold text-ink active:scale-[.98]">
            <Phone className="h-4 w-4" aria-hidden />
            Zadzwoń po taxi
          </a>
          <span className="rounded-full border border-white/20 px-3 py-3 text-[11.5px] font-bold text-sand">−10% MOJMINSK</span>
        </div>
      </div>

      <div className="mt-6 px-5">
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { id: 'find', label: 'Szukam' },
            { id: 'offer', label: 'Oferuję' },
          ]}
        />
      </div>

      <div className="mx-5 mt-4 rounded-4xl bg-white p-4 shadow-card">
        <div className="relative space-y-2">
          <div className="flex items-center gap-3 rounded-2xl bg-mist px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-ink" aria-hidden />
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-ink-400">Skąd</p>
              <p className="text-[14.5px] font-bold">Mińsk Maz. · Spacerowa</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-mist px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full border-2 border-ink" aria-hidden />
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-ink-400">Dokąd</p>
              <p className="text-[14.5px] font-bold">{dest === 'Wszystkie' ? 'Dowolny kierunek' : dest}</p>
            </div>
          </div>
          <button aria-label="Zamień kierunek" className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white shadow-card">
            <ArrowUpDown className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          {(['today', 'tomorrow'] as const).map((d) => (
            <button key={d} onClick={() => setDay(d)} aria-pressed={day === d} className={cn('h-10 flex-1 rounded-full text-[13px] font-bold', day === d ? 'bg-sky' : 'bg-mist text-ink-500')}>
              {d === 'today' ? 'Dziś' : 'Jutro'}
            </button>
          ))}
          <button className="h-10 flex-1 rounded-full bg-mist text-[13px] font-bold text-ink-500">1 osoba</button>
        </div>
        {mode === 'offer' && (
          <button
            onClick={() => setPublished(true)}
            disabled={published}
            className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-coral text-[14.5px] font-bold text-ink shadow-coral disabled:bg-sky-100 disabled:text-sky-700 disabled:shadow-none"
          >
            {published ? (
              <>
                <Check className="h-4 w-4" aria-hidden /> Przejazd opublikowany
              </>
            ) : (
              'Opublikuj przejazd'
            )}
          </button>
        )}
      </div>

      {mode === 'find' && (
        <>
          <div className="mt-5 flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar">
            {dests.map((d) => (
              <Chip key={d} active={dest === d} onClick={() => setDest(d)}>
                {d}
              </Chip>
            ))}
          </div>

          <div className="mt-4 space-y-3 px-5">
            {list.map((r) => (
              <article key={r.id} className="rounded-4xl bg-white p-4 shadow-card">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center pt-1" aria-hidden>
                    <span className="h-2.5 w-2.5 rounded-full bg-ink" />
                    <span className="my-1 w-px flex-1 border-l-2 border-dashed border-mist-300" />
                    <span className="h-2.5 w-2.5 rounded-full border-2 border-ink" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-[14px] font-semibold text-ink-700">{r.from}</p>
                      <p className="font-display text-[19px] font-semibold">{r.depart}</p>
                    </div>
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-[14px] font-semibold text-ink-700">{r.to}</p>
                      <p className="font-display text-[19px] font-semibold text-ink-400">{r.arrive}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3 border-t border-mist pt-3">
                  <img src={avatarUrl(r.driver)} alt="" className="h-10 w-10 rounded-2xl" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-bold">
                      {r.driver} {r.driverAs}
                    </p>
                    <p className="flex items-center gap-1 text-[11.5px] text-ink-400">
                      <Star className="h-3 w-3 fill-sand-600 text-sand-600" aria-hidden />
                      {r.rating} · {r.rides} przejazdów · {r.car}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-[19px] font-semibold">{r.price} zł</p>
                    <p className="flex items-center justify-end gap-1 text-[11px] text-ink-400">
                      <Users className="h-3 w-3" aria-hidden />
                      {r.seats} miejsca
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setBooked((b) => ({ ...b, [r.id]: true }))}
                  disabled={booked[r.id]}
                  className={cn('mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full text-[13.5px] font-bold', booked[r.id] ? 'bg-sky-100 text-sky-700' : 'bg-ink text-white')}
                >
                  {booked[r.id] ? (
                    <>
                      <Check className="h-4 w-4" aria-hidden /> Zarezerwowano — {r.driver} da znać
                    </>
                  ) : (
                    'Zarezerwuj miejsce'
                  )}
                </button>
              </article>
            ))}
            <p className="px-2 text-center text-[11.5px] text-ink-400">Zrzutkę na paliwo rozliczacie bezpośrednio z kierowcą.</p>
          </div>
        </>
      )}
    </div>
  );
}
