import { useState } from 'react';
import {
  ArrowUpDown,
  Car,
  Check,
  Minus,
  Phone,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import { avatarUrl, rides as initialRides, type Ride, type User } from '../data/mockData';
import { Chip, StandardTopBar, cn } from '../components/ui';

const dests = ['Wszystkie', 'Warszawa', 'Halinów', 'Sulejówek', 'Stojadła', 'Dębe Wielkie'];

interface RidesScreenProps {
  user?: User;
  onProfile?: () => void;
  ridesList?: Ride[];
  onDeleteRide?: (rideId: string) => void;
  onAuthRequired?: (title: string, desc: string) => void;
}

export function RidesScreen({
  user,
  onProfile,
  ridesList = initialRides,
  onDeleteRide,
  onAuthRequired,
}: RidesScreenProps) {
  const defaultOrigin = `Mińsk · ${user ? user.street.name : 'Spacerowa'}`;

  const [booked, setBooked] = useState<Record<string, boolean>>({});

  // Search ("Szukam") form state
  const [searchFrom, setSearchFrom] = useState(defaultOrigin);
  const [searchTo, setSearchTo] = useState('');
  const [dest, setDest] = useState('Wszystkie');
  const [day, setDay] = useState<'today' | 'tomorrow'>('tomorrow');
  const [seatsNeeded, setSeatsNeeded] = useState(1);

  const handleSwapSearch = () => {
    setSearchFrom(searchTo || 'Warszawa · Centrum');
    setSearchTo(searchFrom);
    if (dest !== 'Wszystkie') {
      setDest('Wszystkie');
    }
  };

  const handleSelectDestChip = (d: string) => {
    setDest(d);
    if (d === 'Wszystkie') {
      setSearchTo('');
    } else {
      setSearchTo(d);
    }
  };

  const handleToggleBook = (rideId: string) => {
    if (user?.isGuest) {
      onAuthRequired?.(
        'Rezerwacja miejsca w przejeździe',
        'Sąsiedzki carpooling jest dostępny dla mieszkańców Mińska. Zarejestruj się, aby wspólnie dojeżdżać do Warszawy.',
      );
      return;
    }
    setBooked((prev) => ({ ...prev, [rideId]: !prev[rideId] }));
  };

  const filteredRides = ridesList.filter((r) => {
    if (dest !== 'Wszystkie' && r.dest.toLowerCase() !== dest.toLowerCase()) {
      return false;
    }
    if (searchTo.trim() && dest === 'Wszystkie') {
      const q = searchTo.trim().toLowerCase();
      const matchTo = r.to.toLowerCase().includes(q) || r.dest.toLowerCase().includes(q);
      const matchFrom = r.from.toLowerCase().includes(q);
      if (!matchTo && !matchFrom) return false;
    }
    if (r.seats < seatsNeeded) {
      return false;
    }
    return true;
  });

  return (
    <div className="w-full pb-36 md:px-8 lg:px-12 md:py-6 md:pb-16">
      <StandardTopBar
        user={user}
        onProfile={onProfile}
        title="Przejazdy"
        subtitle="Sąsiedzki carpooling i taxi"
      />

      {/* Desktop Header */}
      <div className="hidden md:flex items-end justify-between border-b border-mist-300/80 pb-4 mb-5">
        <div>
          <p className="text-[11.5px] font-bold uppercase tracking-wider text-ink-400">
            Strefa Przejazdu · Mińsk Mazowiecki ↔ Warszawa i powiat
          </p>
          <h1 className="mt-0.5 font-display text-[23px] font-extrabold tracking-tight text-ink">
            Sąsiedzki Carpooling & Nova Taxi
          </h1>
        </div>
        <p className="text-[12.5px] font-medium text-ink-500">
          Zrzutkę na paliwo rozliczacie bezpośrednio z kierowcą bez prowizji
        </p>
      </div>

      <div className="md:grid md:grid-cols-12 md:gap-6 lg:gap-7 items-start">
        {/* LEFT COLUMN: Search Form + Nova Taxi Partner Card */}
        <div className="md:col-span-4 lg:col-span-3 space-y-4 md:sticky md:top-5">
          {/* Nova Taxi Official Partner Banner */}
          <div className="mx-5 md:mx-0 relative overflow-hidden rounded-4xl bg-ink p-5 md:p-6 text-white shadow-card">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sand/20" aria-hidden />
            <div className="absolute -bottom-14 right-10 h-32 w-32 rounded-full bg-coral/25" aria-hidden />
            <span className="relative text-[10.5px] font-bold uppercase tracking-[.16em] text-sand">Oficjalny partner</span>
            <p className="relative mt-1 font-display text-[26px] font-semibold leading-none">Nova Taxi</p>
            <p className="relative mt-1.5 text-[13px] text-white/70">Podjazd w Mińsku w 5–10 min</p>
            <div className="relative mt-4 flex items-center gap-2">
              <a
                href="tel:+48257582222"
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-coral text-[14.5px] font-bold text-ink active:scale-[.98] hover:bg-coral-400 transition-colors"
              >
                <Phone className="h-4 w-4" aria-hidden />
                Zadzwoń po taxi
              </a>
              <span className="rounded-full border border-white/20 px-3 py-3 text-[11.5px] font-bold text-sand">
                −10% MOJMINSK
              </span>
            </div>
          </div>

          {/* Interactive Search & Filter Form */}
          <div className="mx-5 md:mx-0 mt-5 md:mt-0 rounded-4xl bg-white p-4 md:p-5 shadow-card border border-mist-200">
            <p className="hidden md:block text-[11px] font-extrabold uppercase tracking-wider text-ink-400 mb-3">
              Wyszukaj wspólny przejazd
            </p>
            <div className="relative space-y-2">
              {/* Skąd Input */}
              <label className="flex items-center gap-3 rounded-2xl bg-mist px-4 py-2.5 focus-within:ring-2 focus-within:ring-ink">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-ink" aria-hidden />
                <div className="min-w-0 flex-1 pr-10">
                  <span className="block text-[10.5px] font-bold uppercase tracking-wider text-ink-400">
                    Skąd
                  </span>
                  <input
                    type="text"
                    value={searchFrom}
                    onChange={(e) => setSearchFrom(e.target.value)}
                    placeholder="Np. Mińsk Maz. · Spacerowa"
                    className="w-full bg-transparent text-[14.5px] font-bold text-ink outline-none placeholder:font-medium placeholder:text-ink-400"
                  />
                </div>
              </label>

              {/* Dokąd Input */}
              <label className="flex items-center gap-3 rounded-2xl bg-mist px-4 py-2.5 focus-within:ring-2 focus-within:ring-ink">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-ink" aria-hidden />
                <div className="min-w-0 flex-1 pr-10">
                  <span className="block text-[10.5px] font-bold uppercase tracking-wider text-ink-400">
                    Dokąd
                  </span>
                  <input
                    type="text"
                    value={searchTo}
                    onChange={(e) => {
                      setSearchTo(e.target.value);
                      if (dest !== 'Wszystkie') setDest('Wszystkie');
                    }}
                    placeholder="Dowolny kierunek (np. Warszawa, Halinów)"
                    className="w-full bg-transparent text-[14.5px] font-bold text-ink outline-none placeholder:font-medium placeholder:text-ink-400"
                  />
                </div>
              </label>

              {/* Swap Origin <-> Destination Button */}
              <button
                type="button"
                onClick={handleSwapSearch}
                aria-label="Zamień kierunek"
                className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-card transition-transform active:scale-90 hover:bg-mist"
              >
                <ArrowUpDown className="h-4 w-4" aria-hidden />
              </button>
            </div>

            {/* Day & Seats Controls */}
            <div className="mt-3 flex items-center gap-2">
              {(['today', 'tomorrow'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDay(d)}
                  aria-pressed={day === d}
                  className={cn(
                    'h-10 flex-1 rounded-full text-[13px] font-bold transition-colors',
                    day === d ? 'bg-sky text-ink shadow-xs' : 'bg-mist text-ink-500 hover:text-ink',
                  )}
                >
                  {d === 'today' ? 'Dziś' : 'Jutro'}
                </button>
              ))}

              {/* Seats Stepper */}
              <div className="flex h-10 items-center gap-1.5 rounded-full bg-mist px-2">
                <button
                  type="button"
                  onClick={() => setSeatsNeeded((s) => Math.max(1, s - 1))}
                  aria-label="Mniej miejsc"
                  className="grid h-7 w-7 place-items-center rounded-full bg-white text-ink shadow-xs active:scale-90 disabled:opacity-40"
                  disabled={seatsNeeded <= 1}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-[54px] text-center text-[12.5px] font-bold text-ink">
                  {seatsNeeded} {seatsNeeded === 1 ? 'osoba' : 'osoby'}
                </span>
                <button
                  type="button"
                  onClick={() => setSeatsNeeded((s) => Math.min(4, s + 1))}
                  aria-label="Więcej miejsc"
                  className="grid h-7 w-7 place-items-center rounded-full bg-white text-ink shadow-xs active:scale-90 disabled:opacity-40"
                  disabled={seatsNeeded >= 4}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Destination Chips & Matching Rides Grid */}
        <div className="md:col-span-8 lg:col-span-9">
          {/* Destination Quick Chips */}
          <div className="mt-5 md:mt-0 flex gap-2 overflow-x-auto md:flex-wrap px-5 md:px-0 pb-1 no-scrollbar">
            {dests.map((d) => (
              <Chip key={d} active={dest === d} onClick={() => handleSelectDestChip(d)}>
                {d}
              </Chip>
            ))}
          </div>

          {/* Matching Rides List */}
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 px-5 md:px-0">
            {filteredRides.length === 0 ? (
              <div className="col-span-full rounded-4xl bg-white p-8 text-center shadow-card">
                <p className="font-display text-[18px] font-bold text-ink">
                  Brak przejazdów spełniających kryteria
                </p>
                <p className="mt-1 text-[13px] text-ink-500">
                  Zmień kierunek lub zmniejsz liczbę miejsc, aby wyświetlić dostępne przejazdy sąsiadów.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setDest('Wszystkie');
                    setSearchTo('');
                    setSeatsNeeded(1);
                  }}
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-ink px-5 text-[12.5px] font-bold text-white active:scale-95"
                >
                  Pokaż wszystkie przejazdy
                </button>
              </div>
            ) : (
              filteredRides.map((r) => {
                const isBooked = !!booked[r.id];
                const isOwnRide =
                  user &&
                  r.driver.toLowerCase() === user.name.toLowerCase() &&
                  r.id.startsWith('rd_');
                const availableSeats = Math.max(0, r.seats - (isBooked ? seatsNeeded : 0));

                return (
                  <article key={r.id} className="rounded-4xl bg-white p-5 shadow-card border border-mist-200 flex flex-col justify-between">
                    <div>
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center pt-1" aria-hidden>
                          <span className="h-2.5 w-2.5 rounded-full bg-ink" />
                          <span className="my-1 w-px flex-1 border-l-2 border-dashed border-mist-300" />
                          <span className="h-2.5 w-2.5 rounded-full border-2 border-ink" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-3">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="truncate text-[14.5px] font-semibold text-ink-700">{r.from}</p>
                            <p className="font-display text-[20px] font-semibold">{r.depart}</p>
                          </div>
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="truncate text-[14.5px] font-semibold text-ink-700">{r.to}</p>
                            <p className="font-display text-[20px] font-semibold text-ink-400">{r.arrive}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-3 border-t border-mist pt-3">
                        <img src={avatarUrl(r.driver)} alt="" className="h-10 w-10 rounded-2xl bg-sand-100" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13.5px] font-bold text-ink">
                            {r.driver} {r.driverAs}
                          </p>
                          <p className="flex items-center gap-1 text-[11.5px] text-ink-400">
                            <Car className="h-3.5 w-3.5 text-ink-400" aria-hidden />
                            {r.car} · {day === 'today' ? 'Dziś' : 'Jutro'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-[20px] font-semibold">{r.price} zł</p>
                          <p className="flex items-center justify-end gap-1 text-[11px] text-ink-400">
                            <Users className="h-3 w-3" aria-hidden />
                            {availableSeats} {availableSeats === 1 ? 'miejsce' : 'miejsca'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {isOwnRide ? (
                      <div className="mt-4 flex items-center justify-between gap-2 rounded-full bg-sand-100 px-4 py-2.5">
                        <span className="text-[12.5px] font-bold text-ink">Twój opublikowany przejazd</span>
                        {onDeleteRide && (
                          <button
                            type="button"
                            onClick={() => onDeleteRide(r.id)}
                            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11.5px] font-bold text-coral shadow-xs active:scale-95"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Usuń
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleBook(r.id)}
                        className={cn(
                          'mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full text-[13.5px] font-bold transition-transform active:scale-[0.98]',
                          isBooked ? 'bg-sky-100 text-sky-900' : 'bg-ink text-white hover:bg-ink-700',
                        )}
                      >
                        {isBooked ? (
                          <>
                            <Check className="h-4 w-4" aria-hidden /> Zarezerwowano ({seatsNeeded} os.) — kliknij, aby anulować
                          </>
                        ) : (
                          `Zarezerwuj miejsce (${seatsNeeded} os.)`
                        )}
                      </button>
                    )}
                  </article>
                );
              })
            )}
            <p className="col-span-full px-2 text-center text-[11.5px] text-ink-400 md:hidden">
              Zrzutkę na paliwo rozliczacie bezpośrednio z kierowcą.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
