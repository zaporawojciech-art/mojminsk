import { useMemo, useState } from 'react';
import { ArrowRight, ChevronLeft, Dices, Lock, Mail, Users } from 'lucide-react';
import { avatarUrl, demoUser, streets, type Street, type User } from '../data/mockData';
import { cn } from '../components/ui';

export function OnboardingScreen({ onDone }: { onDone: (u: User) => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [street, setStreet] = useState<Street | null>(null);
  const [query, setQuery] = useState('');
  const [seedN, setSeedN] = useState(1);
  const [rerolls, setRerolls] = useState(3);
  const [house, setHouse] = useState('');
  const [surname, setSurname] = useState('');

  const top3 = streets.slice(0, 3);
  const results = useMemo(
    () => (query.trim() ? streets.filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 5) : []),
    [query],
  );
  const displayName = name.trim() || 'Ty';
  const seed = `${displayName}-${seedN}`;

  if (step === 2 && street) {
    return (
      <div className="min-h-full pb-10">
        <header className="flex items-center px-5 pb-2 pt-[max(env(safe-area-inset-top),16px)]">
          <button onClick={() => setStep(1)} aria-label="Wróć" className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-card">
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <span className="ml-auto text-[12px] font-bold text-ink-400">Krok 2 z 2</span>
        </header>

        <div className="px-5">
          <h1 className="mt-3 font-display text-[32px] font-semibold leading-[1.05] tracking-tight">Ostatni krok: list z kodem</h1>
          <p className="mt-2 text-[14px] text-ink-500">Tak budujemy społeczność bez botów i trolli.</p>

          <div className="mt-6 flex items-center gap-4 rounded-4xl bg-white p-4 shadow-card">
            <img src={avatarUrl(seed)} alt="Twój awatar" className="h-20 w-20 rounded-3xl" />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-ink-400">Inni zobaczą Cię jako</p>
              <p className="font-display text-[19px] font-semibold leading-tight">
                {displayName} {street.as}
              </p>
              <button
                disabled={rerolls === 0}
                onClick={() => {
                  setSeedN((n) => n + 1);
                  setRerolls((r) => r - 1);
                }}
                className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1.5 text-[12px] font-bold disabled:opacity-40"
              >
                <Dices className="h-3.5 w-3.5" aria-hidden />
                Losuj awatar ({rerolls})
              </button>
            </div>
          </div>

          <fieldset className="mt-6 space-y-3">
            <legend className="mb-2 text-[13px] font-bold">Adres do wysyłki listu</legend>
            <div className="flex h-14 items-center rounded-2xl bg-white/60 px-4 text-[15px] font-semibold text-ink-500">ul. {street.name}</div>
            <div className="grid grid-cols-2 gap-3">
              <input value={house} onChange={(e) => setHouse(e.target.value)} placeholder="Nr domu / lokalu" aria-label="Numer domu i lokalu" className="h-14 rounded-2xl bg-white px-4 text-[15px] shadow-card outline-none placeholder:text-ink-400 focus:ring-2 focus:ring-ink" />
              <input value="05-300" readOnly aria-label="Kod pocztowy" className="h-14 rounded-2xl bg-white/60 px-4 text-[15px] font-semibold text-ink-500 outline-none" />
            </div>
            <input value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="Nazwisko (dla listonosza)" aria-label="Nazwisko" className="h-14 w-full rounded-2xl bg-white px-4 text-[15px] shadow-card outline-none placeholder:text-ink-400 focus:ring-2 focus:ring-ink" />
          </fieldset>

          <p className="mt-3 flex items-start gap-2 text-[12px] leading-snug text-ink-500">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            Pełny adres i nazwisko widzi wyłącznie administrator. Dane są szyfrowane.
          </p>

          <div className="mt-5 flex gap-3 rounded-3xl bg-sand-100 p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sand">
              <Mail className="h-5 w-5" aria-hidden />
            </span>
            <p className="text-[13px] leading-snug text-ink-700">
              W ciągu 3–5 dni listonosz przyniesie list z <b>6-cyfrowym kodem</b> i <b>5 kuponami</b> od mińskich firm. Do tego czasu masz pełny dostęp przez 14 dni.
            </p>
          </div>

          <button
            disabled={!house.trim() || !surname.trim()}
            onClick={() => onDone({ ...demoUser, name: displayName, street, seed, rerolls, trialDaysLeft: 14 })}
            className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-coral text-[16px] font-bold text-ink shadow-coral transition-transform active:scale-[.98] disabled:opacity-40 disabled:shadow-none"
          >
            Wyślij list i wejdź
            <ArrowRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full pb-10">
      <section className="relative overflow-hidden rounded-b-[44px] bg-coral px-6 pb-9 pt-[max(env(safe-area-inset-top),28px)]">
        <div className="absolute -right-16 top-10 h-56 w-56 rounded-full bg-sand" aria-hidden />
        <div className="absolute -right-4 top-36 h-28 w-28 rounded-full bg-sky" aria-hidden />
        <div className="absolute right-24 top-6 h-10 w-10 rounded-full bg-mist" aria-hidden />
        <div className="relative flex items-center justify-between">
          <p className="font-display text-[20px] font-semibold tracking-tight">
            mój<span className="font-bold">Mińsk</span>
            <span className="text-mist">.</span>
          </p>
          <button onClick={() => onDone(demoUser)} className="rounded-full bg-ink/10 px-3 py-1.5 text-[12px] font-bold">
            Pomiń (demo)
          </button>
        </div>
        <h1 className="relative mt-14 max-w-[260px] font-display text-[44px] font-semibold leading-[0.95] tracking-tight">
          Twoi sąsiedzi. Bez spamu.
        </h1>
        <p className="relative mt-3 max-w-[240px] text-[14px] font-medium text-ink/80">Zweryfikowana społeczność mieszkańców Mińska Mazowieckiego.</p>
      </section>

      <div className="px-5">
        <label className="mt-7 block">
          <span className="text-[13px] font-bold">Jak masz na imię?</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="np. Wojtek"
            autoComplete="given-name"
            className="mt-2 h-14 w-full rounded-2xl bg-white px-4 text-[17px] font-semibold shadow-card outline-none placeholder:font-medium placeholder:text-ink-400 focus:ring-2 focus:ring-ink"
          />
        </label>

        <p className="mt-6 text-[13px] font-bold">Przy jakiej ulicy mieszkasz?</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {top3.map((s) => {
            const active = street?.name === s.name;
            return (
              <button
                key={s.name}
                onClick={() => setStreet(s)}
                aria-pressed={active}
                className={cn('rounded-3xl p-3 text-left transition-all active:scale-95', active ? 'bg-ink text-white' : 'bg-white shadow-card')}
              >
                <span className={cn('inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10.5px] font-bold', active ? 'bg-coral text-ink' : 'bg-sand-100 text-sand-700')}>
                  <Users className="h-3 w-3" aria-hidden />
                  {s.neighbors}
                </span>
                <p className="mt-2 truncate text-[13.5px] font-bold">{s.name}</p>
              </button>
            );
          })}
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Szukaj innej ulicy…"
          aria-label="Szukaj ulicy"
          className="mt-3 h-12 w-full rounded-full bg-white px-5 text-[14px] shadow-card outline-none placeholder:text-ink-400 focus:ring-2 focus:ring-ink"
        />
        {results.length > 0 && (
          <ul className="mt-2 overflow-hidden rounded-3xl bg-white shadow-card">
            {results.map((s) => (
              <li key={s.name}>
                <button
                  onClick={() => {
                    setStreet(s);
                    setQuery('');
                  }}
                  className="flex w-full items-center justify-between border-b border-mist px-4 py-3 text-left last:border-0 hover:bg-mist/60"
                >
                  <span className="text-[14px] font-semibold">ul. {s.name}</span>
                  <span className="text-[12px] text-ink-400">{s.neighbors} sąsiadów</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {street && (
          <div className="mt-5 flex items-center gap-3 rounded-3xl bg-sky-100 p-3.5">
            <img src={avatarUrl(seed)} alt="" className="h-11 w-11 rounded-2xl" />
            <p className="text-[13px] text-ink-700">
              Będziesz widoczny jako <b className="text-ink">{displayName} {street.as}</b>
            </p>
          </div>
        )}

        <button
          disabled={!name.trim() || !street}
          onClick={() => setStep(2)}
          className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-coral text-[16px] font-bold text-ink shadow-coral transition-transform active:scale-[.98] disabled:opacity-40 disabled:shadow-none"
        >
          Dołącz do sąsiadów
          <ArrowRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
