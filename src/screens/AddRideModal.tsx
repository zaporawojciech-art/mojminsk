import { useState } from 'react';
import {
  ArrowRight,
  ArrowUpDown,
  Car,
  CheckCircle2,
  Clock,
  MapPin,
  Minus,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import { NativeHeader, cn } from '../components/ui';
import type { Ride, User } from '../data/mockData';

interface AddRideModalProps {
  user: User;
  rides: Ride[];
  onClose: () => void;
  onRideCreated: (ride: Ride) => void;
  onDeleteRide?: (rideId: string) => void;
  isClosing?: boolean;
}

const destOptions = ['Warszawa', 'Halinów', 'Sulejówek', 'Stojadła', 'Dębe Wielkie'] as const;

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

export function AddRideModal({
  user,
  rides,
  onClose,
  onRideCreated,
  onDeleteRide,
  isClosing = false,
}: AddRideModalProps) {
  const defaultOrigin = `Mińsk · ${user.street.name}`;

  const [from, setFrom] = useState(defaultOrigin);
  const [to, setTo] = useState('Warszawa · Rondo Wiatraczna');
  const [destTag, setDestTag] = useState<string>('Warszawa');
  const [dayMode, setDayMode] = useState<'today' | 'tomorrow' | 'weekdays'>('tomorrow');
  const [departTime, setDepartTime] = useState('07:15');
  const [seats, setSeats] = useState(3);
  const [price, setPrice] = useState('15');
  const [car, setCar] = useState('Skoda Octavia · szara');
  const [isCreated, setIsCreated] = useState(false);

  const myRides = rides.filter(
    (r) => r.driver.toLowerCase() === user.name.toLowerCase(),
  );

  const detectedDest =
    destOptions.find(
      (d) =>
        to.toLowerCase().includes(d.toLowerCase()) ||
        from.toLowerCase().includes(d.toLowerCase()),
    ) ?? destTag;

  const estimatedDurationMins = detectedDest === 'Warszawa' ? 40 : 20;
  const estimatedArrival = addMinutes(departTime || '07:15', estimatedDurationMins);

  const handleSwapRoute = () => {
    setFrom(to);
    setTo(from);
  };

  const handleSelectDestPreset = (d: string) => {
    setDestTag(d);
    setTo(popularDropoffs[d] ?? d);
    if (!from.toLowerCase().includes('mińsk')) {
      setFrom(defaultOrigin);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from.trim() || !to.trim()) return;

    const newRide: Ride = {
      id: `rd_${Date.now()}`,
      driver: user.name,
      driverAs: user.street.as,
      rating: 5.0,
      rides: 1,
      from: from.trim(),
      to: to.trim(),
      dest: detectedDest,
      depart: departTime || '07:15',
      arrive: estimatedArrival,
      seats,
      price: Math.max(0, parseInt(price || '0', 10) || 0),
      car: car.trim() || 'Samochód osobowy',
    };

    setIsCreated(true);
    window.setTimeout(() => {
      onRideCreated(newRide);
      onClose();
    }, 450);
  };

  return (
    <div
      className={cn(
        'fixed inset-0 md:relative md:inset-auto md:h-full md:w-full z-50 flex flex-col bg-mist select-none',
        isClosing ? 'native-screen-exit' : 'native-screen-slide',
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-md md:max-w-none flex-col overflow-hidden bg-mist">
        <NativeHeader
          title="Dodaj przejazd"
          backLabel="Profil"
          onBack={onClose}
        />

        {isCreated ? (
          <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="mt-4 font-display text-[22px] font-bold text-ink">
              Przejazd opublikowany!
            </h3>
            <p className="mt-1 text-[13.5px] text-ink-500 max-w-[280px]">
              Sąsiedzi z ulicy {user.street.name} i całego Mińska mogą już rezerwować wolne miejsca w Twoim aucie.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 md:px-8 lg:px-12 md:py-6 space-y-3.5 md:space-y-0 md:grid md:grid-cols-12 md:gap-6 md:items-start">
              {/* LEFT COLUMN (Route, Date, Time, Seats, Price) */}
              <div className="space-y-3.5 md:space-y-4 md:col-span-7 lg:col-span-8">
                {/* Quick Destination Presets */}
                <div className="md:rounded-2xl md:border md:border-mist-200 md:bg-white md:p-4 md:shadow-xs">
                  <label className="text-[12px] font-bold uppercase tracking-wider text-ink-500">
                    Popularne kierunki z Mińska
                  </label>
                  <div className="mt-1.5 md:mt-2 flex flex-wrap gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                    {destOptions.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleSelectDestPreset(d)}
                        className={cn(
                          'shrink-0 rounded-full md:rounded-xl px-3.5 py-2 text-[12px] font-bold transition-all cursor-pointer',
                          destTag === d
                            ? 'bg-ink text-white shadow-card'
                            : 'bg-white md:bg-mist text-ink-700 hover:bg-mist-200',
                        )}
                      >
                        → {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card 1: Trasa przejazdu (Skąd <-> Dokąd) */}
                <div className="space-y-3 rounded-3xl md:rounded-2xl md:border md:border-mist-200 bg-white p-4 md:p-5 shadow-card md:shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-ink-700">Trasa przejazdu</span>
                    <span className="text-[11px] font-semibold text-ink-400">
                      Czas jazdy: ~{estimatedDurationMins} min
                    </span>
                  </div>

                  <div className="relative space-y-2">
                    {/* Skąd */}
                    <label className="flex items-center gap-3 rounded-2xl md:rounded-xl border border-mist-300 bg-mist/50 px-3.5 py-2.5 focus-within:border-ink focus-within:bg-white">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-ink" aria-hidden />
                      <div className="min-w-0 flex-1 pr-10">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-400">
                          Miejsce startu (Skąd)
                        </span>
                        <input
                          type="text"
                          required
                          value={from}
                          onChange={(e) => setFrom(e.target.value)}
                          placeholder="Np. Mińsk · Spacerowa / PKP"
                          className="w-full bg-transparent text-[14px] font-bold text-ink outline-none placeholder:font-medium placeholder:text-ink-400"
                        />
                      </div>
                    </label>

                    {/* Dokąd */}
                    <label className="flex items-center gap-3 rounded-2xl md:rounded-xl border border-mist-300 bg-mist/50 px-3.5 py-2.5 focus-within:border-ink focus-within:bg-white">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-ink" aria-hidden />
                      <div className="min-w-0 flex-1 pr-10">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-400">
                          Miejsce docelowe (Dokąd)
                        </span>
                        <input
                          type="text"
                          required
                          value={to}
                          onChange={(e) => setTo(e.target.value)}
                          placeholder="Np. Warszawa · Rondo Wiatraczna"
                          className="w-full bg-transparent text-[14px] font-bold text-ink outline-none placeholder:font-medium placeholder:text-ink-400"
                        />
                      </div>
                    </label>

                    {/* Swap button */}
                    <button
                      type="button"
                      onClick={handleSwapRoute}
                      aria-label="Odwróć kierunek trasy"
                      className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-mist-300 bg-white text-ink shadow-card transition-transform active:scale-90 hover:bg-mist cursor-pointer"
                    >
                      <ArrowUpDown className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </div>

                {/* Card 2: Termin, godzina, miejsca i zrzutka */}
                <div className="space-y-3.5 rounded-3xl md:rounded-2xl md:border md:border-mist-200 bg-white p-4 md:p-5 shadow-card md:shadow-xs">
                  <div>
                    <label className="text-[12px] font-bold text-ink-700">Kiedy jedziesz?</label>
                    <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                      {(
                        [
                          { id: 'today', label: 'Dziś' },
                          { id: 'tomorrow', label: 'Jutro' },
                          { id: 'weekdays', label: 'Pn – Pt' },
                        ] as const
                      ).map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setDayMode(d.id)}
                          className={cn(
                            'rounded-xl py-2 text-[12px] font-bold transition-all cursor-pointer',
                            dayMode === d.id
                              ? 'bg-ink text-white shadow-xs'
                              : 'bg-mist text-ink-600 hover:bg-mist-200',
                          )}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Departure & Arrival Time */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <label className="flex items-center gap-2.5 rounded-2xl md:rounded-xl border border-mist-300 bg-mist/50 px-3.5 py-2.5 focus-within:border-ink focus-within:bg-white">
                      <Clock className="h-4 w-4 shrink-0 text-ink-500" />
                      <div className="min-w-0 flex-1">
                        <span className="block text-[9.5px] font-bold uppercase text-ink-400">
                          Godzina wyjazdu
                        </span>
                        <input
                          type="time"
                          required
                          value={departTime}
                          onChange={(e) => setDepartTime(e.target.value)}
                          className="w-full bg-transparent text-[14.5px] font-extrabold text-ink outline-none"
                        />
                      </div>
                    </label>

                    <div className="flex flex-col justify-center rounded-2xl md:rounded-xl bg-mist/60 px-3.5 py-2.5">
                      <span className="block text-[9.5px] font-bold uppercase text-ink-400">
                        Szacowany przyjazd
                      </span>
                      <span className="mt-0.5 font-display text-[15px] font-bold text-ink-600">
                        ok. {estimatedArrival}
                      </span>
                    </div>
                  </div>

                  {/* Seats & Fuel Contribution */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-2xl md:rounded-xl border border-mist-300 bg-mist/50 px-3.5 py-2">
                      <span className="block text-[9.5px] font-bold uppercase text-ink-400">
                        Wolne miejsca
                      </span>
                      <div className="mt-1 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setSeats((s) => Math.max(1, s - 1))}
                          disabled={seats <= 1}
                          aria-label="Mniej miejsc"
                          className="grid h-7 w-7 place-items-center rounded-full bg-white text-ink shadow-xs active:scale-90 disabled:opacity-40 cursor-pointer"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-[14px] font-extrabold text-ink">{seats} os.</span>
                        <button
                          type="button"
                          onClick={() => setSeats((s) => Math.min(4, s + 1))}
                          disabled={seats >= 4}
                          aria-label="Więcej miejsc"
                          className="grid h-7 w-7 place-items-center rounded-full bg-white text-ink shadow-xs active:scale-90 disabled:opacity-40 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <label className="rounded-2xl md:rounded-xl border border-mist-300 bg-mist/50 px-3.5 py-2 focus-within:border-ink focus-within:bg-white">
                      <span className="block text-[9.5px] font-bold uppercase text-ink-400">
                        Zrzutka na paliwo
                      </span>
                      <div className="mt-1 flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          required
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="w-full bg-transparent text-[15px] font-extrabold text-ink outline-none"
                        />
                        <span className="text-[12px] font-bold text-ink-400">zł/os.</span>
                      </div>
                    </label>
                  </div>

                  {/* Quick Fuel Presets */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-ink-400 mr-1">Szybki wybór:</span>
                    {['0', '10', '15', '20'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPrice(p)}
                        className={cn(
                          'rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer',
                          price === p ? 'bg-sky text-ink' : 'bg-mist text-ink-600 hover:bg-mist-200',
                        )}
                      >
                        {p === '0' ? 'Za darmo' : `${p} zł`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN (Car, Driver Identity, My Active Rides & Submit) */}
              <div className="space-y-3.5 md:space-y-4 md:col-span-5 lg:col-span-4 md:sticky md:top-2">
                {/* Card 3: Samochód i identyfikacja sąsiedzka */}
                <div className="space-y-3 rounded-3xl md:rounded-2xl md:border md:border-mist-200 bg-white p-4 md:p-5 shadow-card md:shadow-xs">
                  <div>
                    <label className="text-[12px] font-bold text-ink-700">
                      Samochód (marka i kolor dla łatwiejszego rozpoznania)
                    </label>
                    <div className="relative mt-1">
                      <Car className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                      <input
                        type="text"
                        value={car}
                        onChange={(e) => setCar(e.target.value)}
                        placeholder="Np. Toyota Corolla · srebrna"
                        className="h-12 md:h-11 w-full rounded-2xl md:rounded-xl border border-mist-300 bg-mist/50 pl-10 pr-3.5 text-[13.5px] font-semibold text-ink outline-none focus:border-ink focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl md:rounded-xl bg-sand-100/80 px-3.5 py-2.5 text-[12px] font-semibold text-ink-700">
                    <MapPin className="h-4 w-4 shrink-0 text-coral-700" />
                    <span>
                      Kierowca: <strong className="font-bold text-ink">{user.name} {user.street.as}</strong> · Rozliczenie bezpośrednio między sąsiadami
                    </span>
                  </div>

                  {/* Desktop Submit Button */}
                  <div className="hidden md:block pt-3 border-t border-mist-200">
                    <button
                      type="submit"
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-[13.5px] font-bold text-white shadow-sm hover:bg-ink-800 transition-all cursor-pointer"
                    >
                      Opublikuj przejazd dla sąsiadów
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Card 4: Twoje aktywne przejazdy (jeśli użytkownik ma opublikowane trasy) */}
                {myRides.length > 0 && (
                  <div className="space-y-2.5 rounded-3xl md:rounded-2xl md:border md:border-mist-200 bg-white p-4 md:p-5 shadow-card md:shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-bold uppercase tracking-wider text-ink-400">
                        Twoje aktywne przejazdy ({myRides.length})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {myRides.map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between gap-3 rounded-2xl md:rounded-xl bg-mist/70 p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-bold text-ink">
                              {r.from} → {r.to}
                            </p>
                            <p className="mt-0.5 flex items-center gap-2 text-[11px] font-semibold text-ink-500">
                              <span>Wyjazd {r.depart}</span>
                              <span>·</span>
                              <span className="inline-flex items-center gap-0.5">
                                <Users className="h-3 w-3" /> {r.seats} msc.
                              </span>
                              <span>·</span>
                              <span className="font-bold text-ink">{r.price} zł/os.</span>
                            </p>
                          </div>
                          {onDeleteRide && (
                            <button
                              type="button"
                              onClick={() => onDeleteRide(r.id)}
                              aria-label="Usuń przejazd"
                              className="inline-flex h-8 items-center gap-1 rounded-xl bg-white px-2.5 text-[11px] font-bold text-coral shadow-xs active:scale-95 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Usuń
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Sticky Bottom Action Bar */}
            <div className="md:hidden border-t border-mist bg-white px-5 py-3 pb-[max(env(safe-area-inset-bottom),14px)] shrink-0 shadow-float">
              <button
                type="submit"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-[14px] font-bold text-white shadow-card transition-transform active:scale-95"
              >
                Opublikuj przejazd dla sąsiadów
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
