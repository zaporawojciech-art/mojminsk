import { useState } from 'react';
import {
  ArrowUpDown,
  Calendar,
  Car,
  Check,
  ExternalLink,
  Minus,
  Navigation,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import {
  avatarUrl,
  formatResidentLabel,
  getRideDriverSeed,
  rides as initialRides,
  type Ride,
  type User,
} from '../data/mockData';
import { Chip, StandardTopBar, cn } from '../components/ui';
import { GooglePlaceAutocompleteInput } from '../components/GooglePlaceAutocompleteInput';
import { openGoogleMapsRoute } from '../services/googleMapsService';
import {
  formatRideDate,
  formatRideDateFull,
  getRideDateBadgeStyle,
  doesRideMatchDateFilter,
  getTodayIso,
} from '../utils/rideDateUtils';

function cleanCarDescription(carText: string): string {
  if (!carText) return 'Samochód osobowy';
  return carText.replace(/\s*·\s*(Jutro|Dziś|Dni robocze|Pn\s*–\s*Pt)\s*$/i, '').trim() || carText;
}

const dests = ['Wszystkie', 'Warszawa', 'Halinów', 'Sulejówek', 'Stojadła', 'Dębe Wielkie'];

interface RidesScreenProps {
  user?: User | null;
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
  const defaultOrigin = `Mińsk · ${user ? user.street.name : 'Centrum'}`;

  const [booked, setBooked] = useState<Record<string, boolean>>({});

  // Search ("Szukam") form state
  const [searchFrom, setSearchFrom] = useState(defaultOrigin);
  const [searchTo, setSearchTo] = useState('');
  const [dest, setDest] = useState('Wszystkie');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [seatsNeeded, setSeatsNeeded] = useState(1);

  const todayIso = getTodayIso();

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
    if (!user) {
      onAuthRequired?.(
        'Rezerwacja miejsca w przejeździe',
        'Sąsiedzki carpooling jest dostępny dla mieszkańców Mińska. Zaloguj się, aby wspólnie dojeżdżać do Warszawy.',
      );
      return;
    }
    setBooked((prev) => ({ ...prev, [rideId]: !prev[rideId] }));
  };

  const filteredRides = ridesList.filter((r) => {
    if (dest !== 'Wszystkie' && r.dest.toLowerCase() !== dest.toLowerCase()) {
      return false;
    }
    if (!doesRideMatchDateFilter(r.date, dateFilter)) {
      return false;
    }
    if (searchTo.trim() && dest === 'Wszystkie') {
      const q = searchTo.trim().toLowerCase();
      const words = q.split(/[\s,·-]+/).filter((w) => w.length >= 3);
      const matchTo =
        r.to.toLowerCase().includes(q) ||
        r.dest.toLowerCase().includes(q) ||
        words.some((w) => r.to.toLowerCase().includes(w) || r.dest.toLowerCase().includes(w));
      const matchFrom =
        r.from.toLowerCase().includes(q) ||
        words.some((w) => r.from.toLowerCase().includes(w));
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
        subtitle="Sąsiedzki carpooling"
      />

      {/* Desktop Header */}
      <div className="hidden md:flex items-end justify-between border-b border-mist-300/80 pb-4 mb-5">
        <div>
          <p className="text-[11.5px] font-bold uppercase tracking-wider text-ink-400">
            Strefa Przejazdu · Mińsk Mazowiecki ↔ Warszawa i powiat
          </p>
          <h1 className="mt-0.5 font-display text-[23px] font-extrabold tracking-tight text-ink">
            Sąsiedzki Carpooling
          </h1>
        </div>
        <p className="text-[12.5px] font-medium text-ink-500">
          Zrzutkę na paliwo rozliczacie bezpośrednio z kierowcą bez prowizji
        </p>
      </div>

      <div className="md:grid md:grid-cols-12 md:gap-6 lg:gap-7 items-start">
        {/* LEFT COLUMN: Search & Filter Form */}
        <div className="md:col-span-5 lg:col-span-4 space-y-4 md:sticky md:top-5">
          {/* Interactive Search & Filter Form */}
          <div className="mx-5 md:mx-0 rounded-4xl bg-white p-4 md:p-5 shadow-card border border-mist-200">
            <p className="hidden md:block text-[11px] font-extrabold uppercase tracking-wider text-ink-400 mb-3">
              Wyszukaj wspólny przejazd
            </p>
            <div className="relative space-y-2">
              {/* Skąd Input z Google Places */}
              <GooglePlaceAutocompleteInput
                label="SKĄD"
                variant="origin"
                value={searchFrom}
                onChange={setSearchFrom}
                placeholder="Np. Mińsk Maz. · Spacerowa"
                hasSwapButton
              />

              {/* Dokąd Input z Google Places */}
              <GooglePlaceAutocompleteInput
                label="DOKĄD"
                variant="destination"
                value={searchTo}
                onChange={(val) => {
                  setSearchTo(val);
                  if (dest !== 'Wszystkie') setDest('Wszystkie');
                }}
                placeholder="Dowolny kierunek (np. Warszawa, Halinów)"
                hasSwapButton
              />

              {/* Swap Origin <-> Destination Button */}
              <button
                type="button"
                onClick={handleSwapSearch}
                aria-label="Zamień kierunek"
                className="absolute right-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-card transition-transform active:scale-90 hover:bg-mist border border-mist-200"
              >
                <ArrowUpDown className="h-4 w-4" aria-hidden />
              </button>
            </div>

            {/* Opcja podglądu trasy w Google Maps */}
            {searchFrom.trim() && searchTo.trim() && (
              <div className="mt-2.5 pt-2 border-t border-mist-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => openGoogleMapsRoute(searchFrom, searchTo)}
                  className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-ink-600 hover:text-ink active:scale-98 transition-colors"
                >
                  <Navigation className="h-3.5 w-3.5 text-coral" />
                  <span>Sprawdź trasę w Google Maps</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </button>
              </div>
            )}

            {/* Day & Date Filter Controls */}
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
              {/* Date Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 flex-1 no-scrollbar">
                {(
                  [
                    { id: 'all', label: 'Wszystkie' },
                    { id: 'today', label: 'Dziś' },
                    { id: 'tomorrow', label: 'Jutro' },
                    { id: 'weekdays', label: 'Pn – Pt' },
                  ] as const
                ).map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDateFilter(d.id)}
                    aria-pressed={dateFilter === d.id}
                    className={cn(
                      'h-9 px-3 rounded-full text-[12px] font-bold transition-all whitespace-nowrap cursor-pointer',
                      dateFilter === d.id
                        ? 'bg-ink text-white shadow-xs'
                        : 'bg-mist text-ink-600 hover:bg-mist-200',
                    )}
                  >
                    {d.label}
                  </button>
                ))}

                {/* Native System Date Picker Button */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    aria-label="Wybierz dokładną datę wyjazdu z kalendarza"
                    className={cn(
                      'h-9 px-3 rounded-full text-[12px] font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer',
                      /^\d{4}-\d{2}-\d{2}$/.test(dateFilter)
                        ? 'bg-sky-100 text-sky-950 border border-sky-300 shadow-2xs font-extrabold'
                        : 'bg-mist text-ink-600 hover:bg-mist-200',
                    )}
                  >
                    <Calendar className="h-3.5 w-3.5 text-ink-600 shrink-0" />
                    <span>
                      {/^\d{4}-\d{2}-\d{2}$/.test(dateFilter)
                        ? formatRideDate(dateFilter)
                        : 'Data 📅'}
                    </span>
                  </button>
                  <input
                    type="date"
                    min={todayIso}
                    value={/^\d{4}-\d{2}-\d{2}$/.test(dateFilter) ? dateFilter : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        setDateFilter(e.target.value);
                      }
                    }}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                  />
                </div>

                {/^\d{4}-\d{2}-\d{2}$/.test(dateFilter) && (
                  <button
                    type="button"
                    onClick={() => setDateFilter('all')}
                    aria-label="Wyczyść filtr wybranej daty"
                    className="grid h-7 w-7 place-items-center rounded-full bg-mist-300 text-ink-600 hover:bg-mist-400 text-[11px] font-bold cursor-pointer shrink-0"
                    title="Wyczyść datę"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Seats Stepper */}
              <div className="flex h-9 items-center justify-between sm:justify-start gap-1.5 rounded-full bg-mist px-2 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setSeatsNeeded((s) => Math.max(1, s - 1))}
                  aria-label="Mniej miejsc"
                  className="grid h-6 w-6 place-items-center rounded-full bg-white text-ink shadow-xs active:scale-90 disabled:opacity-40"
                  disabled={seatsNeeded <= 1}
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="min-w-[46px] text-center text-[12px] font-bold text-ink">
                  {seatsNeeded} {seatsNeeded === 1 ? 'osoba' : 'osoby'}
                </span>
                <button
                  type="button"
                  onClick={() => setSeatsNeeded((s) => Math.min(4, s + 1))}
                  aria-label="Więcej miejsc"
                  className="grid h-6 w-6 place-items-center rounded-full bg-white text-ink shadow-xs active:scale-90 disabled:opacity-40"
                  disabled={seatsNeeded >= 4}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Active custom date summary alert badge */}
            {/^\d{4}-\d{2}-\d{2}$/.test(dateFilter) && (
              <div className="mt-2.5 flex items-center justify-between rounded-xl bg-sky-50/90 px-3 py-1.5 border border-sky-200/80 text-[11.5px]">
                <span className="font-medium text-sky-950 flex items-center gap-1.5 truncate">
                  <Calendar className="h-3.5 w-3.5 text-sky-700 shrink-0" />
                  <span className="truncate">
                    Wybrana data: <b className="font-extrabold">{formatRideDateFull(dateFilter)}</b>
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setDateFilter('all')}
                  className="text-sky-700 font-bold hover:underline cursor-pointer shrink-0 ml-2"
                >
                  Wszystkie dni
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Destination Chips & Matching Rides Grid */}
        <div className="md:col-span-7 lg:col-span-8">
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
              <div className="col-span-full rounded-4xl bg-white p-8 text-center shadow-card border border-mist-200">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-sky-50 text-sky-600 mb-3">
                  <Car className="h-6 w-6" />
                </div>
                <p className="font-display text-[18px] font-bold text-ink">
                  {ridesList.length === 0 ? 'Bądź pierwszym kierowcą w Mińsku!' : 'Brak przejazdów spełniających kryteria'}
                </p>
                <p className="mt-1 text-[13px] text-ink-500 max-w-md mx-auto">
                  {ridesList.length === 0
                    ? 'Dojeżdżasz codziennie do Warszawy, Halinowa lub szkół? Zaoferuj wolne miejsca sąsiadom i podziel się kosztami paliwa.'
                    : 'Zmień kierunek lub zmniejsz liczbę miejsc, aby wyświetlić dostępne przejazdy sąsiadów.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setDest('Wszystkie');
                    setSearchTo('');
                    setDateFilter('all');
                    setSeatsNeeded(1);
                  }}
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-ink px-5 text-[12.5px] font-bold text-white active:scale-95 cursor-pointer"
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
                const rideDateLabel = formatRideDate(r.date);
                const dateStyle = getRideDateBadgeStyle(r.date);

                return (
                  <article
                    key={r.id}
                    className="rounded-4xl bg-white p-5 shadow-card border border-mist-200 flex flex-col justify-between hover:border-mist-300 transition-colors"
                  >
                    <div>
                      {/* Top Header: Prominent Date Badge + Seats Badge */}
                      <div className="flex items-center justify-between gap-2 border-b border-mist/80 pb-3 mb-3.5">
                        <div
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-extrabold border shadow-2xs',
                            dateStyle.bg,
                            dateStyle.text,
                            dateStyle.border,
                          )}
                        >
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          <span>{rideDateLabel}</span>
                        </div>

                        <div className="flex items-center gap-1 text-[11.5px] font-semibold text-ink-500">
                          <Users className="h-3.5 w-3.5 text-ink-400" />
                          <span>
                            <b className="text-ink">{availableSeats}</b>{' '}
                            {availableSeats === 1
                              ? 'wolne miejsce'
                              : availableSeats >= 2 && availableSeats <= 4
                              ? 'wolne miejsca'
                              : 'wolnych miejsc'}
                          </span>
                        </div>
                      </div>

                      {/* Route & Times */}
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center pt-1" aria-hidden>
                          <span className="h-2.5 w-2.5 rounded-full bg-ink" />
                          <span className="my-1 w-px flex-1 border-l-2 border-dashed border-mist-300" />
                          <span className="h-2.5 w-2.5 rounded-full border-2 border-ink" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-3">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="truncate text-[14.5px] font-semibold text-ink-700">{r.from}</p>
                            <div className="text-right shrink-0">
                              <span className="text-[10px] uppercase font-bold text-ink-400 block -mb-0.5">wyjazd</span>
                              <p className="font-display text-[20px] font-extrabold text-ink leading-tight">{r.depart}</p>
                            </div>
                          </div>
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="truncate text-[14.5px] font-semibold text-ink-700">{r.to}</p>
                            <div className="text-right shrink-0">
                              <span className="text-[10px] uppercase font-bold text-ink-400 block -mb-0.5">przyjazd</span>
                              <p className="font-display text-[20px] font-semibold text-ink-400 leading-tight">{r.arrive}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Driver & Car Details */}
                      <div className="mt-4 flex items-center gap-3 border-t border-mist pt-3">
                        <img
                          src={avatarUrl(getRideDriverSeed(r, user))}
                          alt=""
                          className="h-10 w-10 rounded-2xl bg-sand-100 object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13.5px] font-bold text-ink">
                            {r.driver}
                          </p>
                          <p className="truncate text-[11.5px] font-medium text-ink-500">
                            {formatResidentLabel(r.driverAs)}
                          </p>
                          <p className="flex items-center gap-1.5 text-[11.5px] text-ink-500 mt-0.5">
                            <Car className="h-3.5 w-3.5 text-ink-400 shrink-0" aria-hidden />
                            <span className="truncate">{cleanCarDescription(r.car)}</span>
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-display text-[20px] font-extrabold text-ink leading-none">{r.price} zł</p>
                          <p className="mt-0.5 text-[10.5px] font-semibold text-ink-400">
                            zrzutka / os.
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
