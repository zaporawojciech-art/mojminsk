import { useState } from 'react';
import {
  ArrowUpDown,
  Car,
  Check,
  Clock,
  MapPin,
  Minus,
  Phone,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import { avatarUrl, rides as initialRides, type Ride, type User } from '../data/mockData';
import { Chip, ProfileAvatarButton, ScreenHeader, Segmented, cn } from '../components/ui';

const dests = ['Wszystkie', 'Warszawa', 'Halinów', 'Sulejówek', 'Stojadła', 'Dębe Wielkie'];

const popularDropoffs: Record<string, string> = {
  Warszawa: 'Warszawa · Rondo Wiatraczna',
  Halinów: 'Halinów · Centrum',
  Sulejówek: 'Sulejówek · PKP',
  Stojadła: 'Stojadła · Park Handlowy',
  'Dębe Wielkie': 'Dębe Wielkie · Urząd',
};

const addMinutes = (time: string, mins: number): string => {
  const [hStr, mStr] = time.split(':');
  const h = parseInt(hStr || '7', 10);
  const m = parseInt(mStr || '30', 10);
  const total = (h * 60 + m + mins) % (24 * 60);
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
};

export function RidesScreen({ user, onProfile }: { user?: User; onProfile?: () => void }) {
  const defaultOrigin = `Mińsk · ${user ? user.street.name : 'Spacerowa'}`;

  const [mode, setMode] = useState<'find' | 'offer'>('find');
  const [ridesList, setRidesList] = useState<Ride[]>(initialRides);
  const [booked, setBooked] = useState<Record<string, boolean>>({});

  // Search ("Szukam") form state
  const [searchFrom, setSearchFrom] = useState(defaultOrigin);
  const [searchTo, setSearchTo] = useState('');
  const [dest, setDest] = useState('Wszystkie');
  const [day, setDay] = useState<'today' | 'tomorrow'>('tomorrow');
  const [seatsNeeded, setSeatsNeeded] = useState(1);

  // Offer ("Oferuję") form state
  const [offerFrom, setOfferFrom] = useState(defaultOrigin);
  const [offerTo, setOfferTo] = useState('Warszawa · Rondo Wiatraczna');
  const [offerDestTag, setOfferDestTag] = useState('Warszawa');
  const [offerDay, setOfferDay] = useState<'today' | 'tomorrow'>('tomorrow');
  const [offerTime, setOfferTime] = useState('07:15');
  const [offerSeats, setOfferSeats] = useState(3);
  const [offerPrice, setOfferPrice] = useState('15');
  const [offerCar, setOfferCar] = useState('Skoda Octavia · szara');
  const [justPublished, setJustPublished] = useState(false);

  const handleSwapSearch = () => {
    setSearchFrom(searchTo || 'Warszawa · Centrum');
    setSearchTo(searchFrom);
    if (dest !== 'Wszystkie') {
      setDest('Wszystkie');
    }
  };

  const handleSwapOffer = () => {
    const prevFrom = offerFrom;
    setOfferFrom(offerTo);
    setOfferTo(prevFrom);
  };

  const handleSelectDestChip = (d: string) => {
    setDest(d);
    if (d === 'Wszystkie') {
      setSearchTo('');
    } else {
      setSearchTo(d);
    }
  };

  const handlePublishRide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerFrom.trim() || !offerTo.trim()) return;

    const detectedDest =
      dests.find(
        (d) =>
          d !== 'Wszystkie' &&
          (offerTo.toLowerCase().includes(d.toLowerCase()) ||
            offerFrom.toLowerCase().includes(d.toLowerCase())),
      ) ?? offerDestTag;

    const durationMins = detectedDest === 'Warszawa' ? 40 : 20;

    const newRide: Ride = {
      id: `rd_${Date.now()}`,
      driver: user ? user.name : 'Wojtek',
      driverAs: user ? user.street.as : 'ze Spacerowej',
      rating: 5.0,
      rides: 1,
      from: offerFrom.trim(),
      to: offerTo.trim(),
      dest: detectedDest,
      depart: offerTime || '07:15',
      arrive: addMinutes(offerTime || '07:15', durationMins),
      seats: offerSeats,
      price: Math.max(0, parseInt(offerPrice || '10', 10) || 10),
      car: offerCar.trim() || 'Samochód osobowy',
    };

    setRidesList((prev) => [newRide, ...prev]);
    setJustPublished(true);
    setTimeout(() => {
      setJustPublished(false);
      setDest('Wszystkie');
      setSearchTo('');
      setSeatsNeeded(1);
      setMode('find');
    }, 900);
  };

  const handleToggleBook = (rideId: string) => {
    setBooked((prev) => ({ ...prev, [rideId]: !prev[rideId] }));
  };

  const handleDeleteOwnRide = (rideId: string) => {
    setRidesList((prev) => prev.filter((r) => r.id !== rideId));
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
    <div className="pb-36">
      <ScreenHeader
        title="Przejazdy"
        subtitle="Sąsiedzki carpooling i taxi"
        right={user && onProfile ? <ProfileAvatarButton user={user} onClick={onProfile} /> : undefined}
      />

      {/* Nova Taxi Official Partner Banner */}
      <div className="mx-5 relative overflow-hidden rounded-4xl bg-ink p-5 text-white">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sand/20" aria-hidden />
        <div className="absolute -bottom-14 right-10 h-32 w-32 rounded-full bg-coral/25" aria-hidden />
        <span className="relative text-[10.5px] font-bold uppercase tracking-[.16em] text-sand">Oficjalny partner</span>
        <p className="relative mt-1 font-display text-[26px] font-semibold leading-none">Nova Taxi</p>
        <p className="relative mt-1.5 text-[13px] text-white/70">Podjazd w Mińsku w 5–10 min</p>
        <div className="relative mt-4 flex items-center gap-2">
          <a
            href="tel:+48257582222"
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-coral text-[14.5px] font-bold text-ink active:scale-[.98]"
          >
            <Phone className="h-4 w-4" aria-hidden />
            Zadzwoń po taxi
          </a>
          <span className="rounded-full border border-white/20 px-3 py-3 text-[11.5px] font-bold text-sand">
            −10% MOJMINSK
          </span>
        </div>
      </div>

      {/* Mode Switcher: Szukam vs Oferuję */}
      <div className="mt-6 px-5">
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { id: 'find', label: 'Szukam przejazdu' },
            { id: 'offer', label: 'Oferuję przejazd' },
          ]}
        />
      </div>

      {/* ====================================================================
       * TRYB 1: SZUKAM PRZEJAZDU (Interactive Search & Filter Form)
       * ==================================================================== */}
      {mode === 'find' && (
        <>
          <div className="mx-5 mt-4 rounded-4xl bg-white p-4 shadow-card">
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

          {/* Destination Quick Chips */}
          <div className="mt-5 flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar">
            {dests.map((d) => (
              <Chip key={d} active={dest === d} onClick={() => handleSelectDestChip(d)}>
                {d}
              </Chip>
            ))}
          </div>

          {/* Matching Rides List */}
          <div className="mt-4 space-y-3 px-5">
            {filteredRides.length === 0 ? (
              <div className="rounded-4xl bg-white p-6 text-center shadow-card">
                <p className="font-display text-[17px] font-bold text-ink">
                  Brak przejazdów spełniających kryteria
                </p>
                <p className="mt-1 text-[12.5px] text-ink-500">
                  Zmień kierunek, zmniejsz liczbę miejsc lub przełącz na zakładkę „Oferuję przejazd”, aby dodać własny kurs.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setDest('Wszystkie');
                    setSearchTo('');
                    setSeatsNeeded(1);
                  }}
                  className="mt-3.5 inline-flex h-10 items-center justify-center rounded-full bg-ink px-5 text-[12.5px] font-bold text-white active:scale-95"
                >
                  Pokaż wszystkie przejazdy
                </button>
              </div>
            ) : (
              filteredRides.map((r) => {
                const isBooked = !!booked[r.id];
                const isOwnRide = user && r.driver.toLowerCase() === user.name.toLowerCase() && r.id.startsWith('rd_');
                const availableSeats = Math.max(0, r.seats - (isBooked ? seatsNeeded : 0));

                return (
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
                        <p className="font-display text-[19px] font-semibold">{r.price} zł</p>
                        <p className="flex items-center justify-end gap-1 text-[11px] text-ink-400">
                          <Users className="h-3 w-3" aria-hidden />
                          {availableSeats} {availableSeats === 1 ? 'miejsce' : 'miejsca'}
                        </p>
                      </div>
                    </div>

                    {isOwnRide ? (
                      <div className="mt-3 flex items-center justify-between gap-2 rounded-full bg-sand-100 px-4 py-2.5">
                        <span className="text-[12.5px] font-bold text-ink">Twój opublikowany przejazd</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteOwnRide(r.id)}
                          className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11.5px] font-bold text-coral shadow-xs active:scale-95"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Usuń
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleBook(r.id)}
                        className={cn(
                          'mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full text-[13.5px] font-bold transition-transform active:scale-[0.98]',
                          isBooked ? 'bg-sky-100 text-sky-900' : 'bg-ink text-white',
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
            <p className="px-2 text-center text-[11.5px] text-ink-400">
              Zrzutkę na paliwo rozliczacie bezpośrednio z kierowcą.
            </p>
          </div>
        </>
      )}

      {/* ====================================================================
       * TRYB 2: OFERUJĘ PRZEJAZD (Full Driver Ride Creation Form)
       * ==================================================================== */}
      {mode === 'offer' && (
        <form onSubmit={handlePublishRide} className="mx-5 mt-4 space-y-4">
          <div className="rounded-4xl bg-white p-4 shadow-card space-y-3">
            <p className="text-[11.5px] font-extrabold uppercase tracking-wider text-ink-400">
              Trasa przejazdu
            </p>

            {/* Quick Destination Preset Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {dests
                .filter((d) => d !== 'Wszystkie')
                .map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setOfferDestTag(d);
                      setOfferTo(popularDropoffs[d] ?? d);
                    }}
                    className={cn(
                      'shrink-0 rounded-full px-3 py-1.5 text-[11.5px] font-bold transition-colors',
                      offerDestTag === d ? 'bg-ink text-white' : 'bg-mist text-ink-600 hover:text-ink',
                    )}
                  >
                    → {d}
                  </button>
                ))}
            </div>

            <div className="relative space-y-2">
              <label className="flex items-center gap-3 rounded-2xl bg-mist px-4 py-2.5 focus-within:ring-2 focus-within:ring-ink">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-ink" aria-hidden />
                <div className="min-w-0 flex-1 pr-10">
                  <span className="block text-[10.5px] font-bold uppercase tracking-wider text-ink-400">
                    Miejsce startu (Skąd)
                  </span>
                  <input
                    type="text"
                    required
                    value={offerFrom}
                    onChange={(e) => setOfferFrom(e.target.value)}
                    placeholder="Np. Mińsk · ul. Spacerowa / PKP"
                    className="w-full bg-transparent text-[14.5px] font-bold text-ink outline-none placeholder:font-medium placeholder:text-ink-400"
                  />
                </div>
              </label>

              <label className="flex items-center gap-3 rounded-2xl bg-mist px-4 py-2.5 focus-within:ring-2 focus-within:ring-ink">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-ink" aria-hidden />
                <div className="min-w-0 flex-1 pr-10">
                  <span className="block text-[10.5px] font-bold uppercase tracking-wider text-ink-400">
                    Miejsce docelowe (Dokąd)
                  </span>
                  <input
                    type="text"
                    required
                    value={offerTo}
                    onChange={(e) => setOfferTo(e.target.value)}
                    placeholder="Np. Warszawa · Rondo Wiatraczna"
                    className="w-full bg-transparent text-[14.5px] font-bold text-ink outline-none placeholder:font-medium placeholder:text-ink-400"
                  />
                </div>
              </label>

              <button
                type="button"
                onClick={handleSwapOffer}
                aria-label="Zamień kierunek"
                className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-card transition-transform active:scale-90 hover:bg-mist"
              >
                <ArrowUpDown className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>

          {/* Date, Time, Seats & Price Card */}
          <div className="rounded-4xl bg-white p-4 shadow-card space-y-3.5">
            <p className="text-[11.5px] font-extrabold uppercase tracking-wider text-ink-400">
              Termin i warunki przejazdu
            </p>

            {/* Day + Departure Time */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex rounded-2xl bg-mist p-1">
                {(['today', 'tomorrow'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setOfferDay(d)}
                    className={cn(
                      'flex-1 rounded-xl py-2 text-[12.5px] font-bold transition-all',
                      offerDay === d ? 'bg-white text-ink shadow-xs' : 'text-ink-500',
                    )}
                  >
                    {d === 'today' ? 'Dziś' : 'Jutro'}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2 rounded-2xl bg-mist px-3.5 py-2 focus-within:ring-2 focus-within:ring-ink">
                <Clock className="h-4 w-4 shrink-0 text-ink-500" />
                <div className="min-w-0 flex-1">
                  <span className="block text-[9.5px] font-bold uppercase text-ink-400">Wyjazd</span>
                  <input
                    type="time"
                    required
                    value={offerTime}
                    onChange={(e) => setOfferTime(e.target.value)}
                    className="w-full bg-transparent text-[14px] font-bold text-ink outline-none"
                  />
                </div>
              </label>
            </div>

            {/* Seats + Fuel contribution */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-mist px-3.5 py-2">
                <span className="block text-[9.5px] font-bold uppercase text-ink-400">Wolne miejsca</span>
                <div className="mt-1 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setOfferSeats((s) => Math.max(1, s - 1))}
                    disabled={offerSeats <= 1}
                    className="grid h-7 w-7 place-items-center rounded-full bg-white text-ink shadow-xs active:scale-90 disabled:opacity-40"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-[14px] font-bold text-ink">{offerSeats} os.</span>
                  <button
                    type="button"
                    onClick={() => setOfferSeats((s) => Math.min(4, s + 1))}
                    disabled={offerSeats >= 4}
                    className="grid h-7 w-7 place-items-center rounded-full bg-white text-ink shadow-xs active:scale-90 disabled:opacity-40"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <label className="rounded-2xl bg-mist px-3.5 py-2 focus-within:ring-2 focus-within:ring-ink">
                <span className="block text-[9.5px] font-bold uppercase text-ink-400">
                  Zrzutka na paliwo (zł/os.)
                </span>
                <div className="mt-1 flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="w-full bg-transparent text-[15px] font-bold text-ink outline-none"
                  />
                  <span className="text-[12.5px] font-bold text-ink-500">zł</span>
                </div>
              </label>
            </div>

            {/* Car model */}
            <label className="flex items-center gap-3 rounded-2xl bg-mist px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-ink">
              <Car className="h-4 w-4 shrink-0 text-ink-500" />
              <div className="min-w-0 flex-1">
                <span className="block text-[9.5px] font-bold uppercase text-ink-400">
                  Samochód (dla łatwiejszego rozpoznania)
                </span>
                <input
                  type="text"
                  value={offerCar}
                  onChange={(e) => setOfferCar(e.target.value)}
                  placeholder="Np. Toyota Corolla · srebrna"
                  className="w-full bg-transparent text-[13.5px] font-bold text-ink outline-none placeholder:font-medium placeholder:text-ink-400"
                />
              </div>
            </label>

            <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-500 pt-1">
              <MapPin className="h-3.5 w-3.5 text-coral" />
              Kierowca: {user ? `${user.name} ${user.street.as}` : 'Wojtek ze Spacerowej'}
            </div>

            <button
              type="submit"
              disabled={justPublished || !offerFrom.trim() || !offerTo.trim()}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-coral text-[14.5px] font-bold text-ink shadow-coral transition-transform active:scale-[0.98] disabled:bg-emerald-100 disabled:text-emerald-800 disabled:shadow-none"
            >
              {justPublished ? (
                <>
                  <Check className="h-4 w-4" aria-hidden /> Przejazd dodany na listę!
                </>
              ) : (
                'Opublikuj przejazd dla sąsiadów'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
