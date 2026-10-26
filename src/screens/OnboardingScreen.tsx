import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Dices,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { avatarUrl, demoUser, gminaLocalityAs, streets, type Street, type User } from '../data/mockData';
import { CityDropdown, cn } from '../components/ui';

interface OnboardingScreenProps {
  onDone: (user: User) => void;
}

export function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  // Tryb: Rejestracja ('register') lub Logowanie ('login')
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');

  // --- STAN REJESTRACJI ---
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3 | 4>(1);
  const [name, setName] = useState('');
  const [street, setStreet] = useState<Street | null>(streets[0]);
  const [query, setQuery] = useState('');
  const [seedN, setSeedN] = useState(1);
  const [phone, setPhone] = useState('');
  const [surname, setSurname] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [postalCode, setPostalCode] = useState('05-300');
  const [city, setCity] = useState('Mińsk Mazowiecki');

  const isSelectedGmina = city !== 'Mińsk Mazowiecki';

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
    setPostalCode('05-300');
    if (selectedCity !== 'Mińsk Mazowiecki') {
      const asForm = gminaLocalityAs[selectedCity] || `z ${selectedCity}`;
      setStreet({
        name: selectedCity,
        as: asForm,
        neighbors: 35,
      });
    } else {
      setStreet(streets[0]);
    }
  };

  // --- STAN LOGOWANIA ---
  const [loginMethod, setLoginMethod] = useState<'phone' | 'pin'>('phone');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginSmsStep, setLoginSmsStep] = useState(false);
  const [loginSmsCode, setLoginSmsCode] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [loginError, setLoginError] = useState('');

  // Filtrowanie i podpowiedzi ulic
  const topStreets = streets.slice(0, 3);
  const filteredStreets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return streets.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 5);
  }, [query]);

  const displayName = name.trim() || 'Sąsiad';
  const avatarSeed = `${displayName}-${seedN}`;

  // Losowanie kolejnego awatara 3D
  const handleRerollAvatar = () => {
    setSeedN((prev) => prev + 1);
  };

  // Zakończenie rejestracji
  const handleFinishRegistration = () => {
    if (!street || !name.trim() || !surname.trim() || !houseNumber.trim()) return;

    const newUser: User = {
      name: name.trim(),
      surname: surname.trim(),
      street,
      houseNumber: houseNumber.trim(),
      flatNumber: flatNumber.trim() || undefined,
      phone: phone.trim() || undefined,
      postalCode: postalCode.trim() || '05-300',
      city: city.trim() || 'Mińsk Mazowiecki',
      seed: avatarSeed,
      rerolls: 999,
      verified: false,
      trialDaysLeft: 14,
      privacy: {
        showStats: true,
        showPastAds: true,
        showRides: true,
      },
    };

    onDone(newUser);
  };

  // Logowanie kodem SMS (symulacja)
  const handleVerifySmsCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginSmsCode.length < 4) {
      setLoginError('Wprowadź 4-cyfrowy kod SMS');
      return;
    }
    // Zalogowanie przykładowego lub wcześniej zarejestrowanego użytkownika
    const loggedUser: User = {
      ...demoUser,
      phone: loginPhone || demoUser.phone,
    };
    onDone(loggedUser);
  };

  // Logowanie kodem PIN z listu
  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPin.length !== 6) {
      setLoginError('Kod PIN z listu musi mieć dokładnie 6 cyfr');
      return;
    }
    // Pomyślna weryfikacja PIN z listu
    const verifiedUser: User = {
      ...demoUser,
      verified: true,
      activationPin: loginPin,
      trialDaysLeft: 14,
    };
    onDone(verifiedUser);
  };

  return (
    <div className="min-h-full flex flex-col justify-between pb-8 select-none">
      {/* 1. Header z logo i przełącznikiem trybów */}
      <div>
        <header className="relative overflow-hidden rounded-b-[36px] bg-coral px-6 pb-6 pt-[max(env(safe-area-inset-top),20px)] shadow-sm">
          <div className="absolute -right-16 top-6 h-52 w-52 rounded-full bg-sand/90" aria-hidden />
          <div className="absolute -right-4 top-32 h-24 w-24 rounded-full bg-sky" aria-hidden />
          <div className="absolute right-28 top-4 h-10 w-10 rounded-full bg-mist" aria-hidden />

          <div className="relative flex items-center justify-between">
            <p className="font-display text-[22px] font-bold tracking-tight text-ink">
              mój<span className="text-white">Mińsk</span>
              <span className="text-sand-600">.</span>
            </p>

            <button
              type="button"
              onClick={() => onDone({ ...demoUser, isGuest: true, name: 'Gość' })}
              className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[12px] font-extrabold text-ink shadow-md border border-white/80 hover:bg-sand-50 active:scale-95 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5 text-sand-700" />
              <span>Pomiń (demo)</span>
            </button>
          </div>

          <h1 className="relative mt-5 max-w-[280px] font-display text-[32px] font-bold leading-[1.05] tracking-tight text-ink">
            Twoi sąsiedzi. Bez spamu.
          </h1>
          <p className="relative mt-2 max-w-[270px] text-[13.5px] font-medium text-ink/80 leading-snug">
            Zweryfikowana społeczność mieszkańców Mińska Mazowieckiego.
          </p>

          {/* Przełącznik: Rejestracja vs Logowanie */}
          <div className="relative mt-5 flex rounded-2xl bg-ink/10 p-1 backdrop-blur-xs">
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setLoginError('');
              }}
              className={cn(
                'flex-1 rounded-xl py-2 text-center text-[13px] font-bold transition-all',
                authMode === 'register'
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-ink/80 hover:text-ink',
              )}
            >
              Zarejestruj się
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setLoginError('');
              }}
              className={cn(
                'flex-1 rounded-xl py-2 text-center text-[13px] font-bold transition-all',
                authMode === 'login'
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-ink/80 hover:text-ink',
              )}
            >
              Mam już konto
            </button>
          </div>
        </header>

        {/* =========================================================================
            WIDOK LOGOWANIA (LOGIN FLOW)
            ========================================================================= */}
        {authMode === 'login' ? (
          <div className="px-5 pt-6 space-y-4">
            <div className="flex rounded-2xl bg-mist p-1 border border-mist-300">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('phone');
                  setLoginSmsStep(false);
                  setLoginError('');
                }}
                className={cn(
                  'flex-1 rounded-xl py-2 text-[12.5px] font-bold transition-all',
                  loginMethod === 'phone' ? 'bg-white text-ink shadow-sm' : 'text-ink-500',
                )}
              >
                Numer telefonu (SMS)
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('pin');
                  setLoginError('');
                }}
                className={cn(
                  'flex-1 rounded-xl py-2 text-[12.5px] font-bold transition-all',
                  loginMethod === 'pin' ? 'bg-white text-ink shadow-sm' : 'text-ink-500',
                )}
              >
                Kod PIN z listu
              </button>
            </div>

            {loginMethod === 'phone' ? (
              !loginSmsStep ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!loginPhone.trim()) {
                      setLoginError('Wprowadź numer telefonu');
                      return;
                    }
                    setLoginError('');
                    setLoginSmsStep(true);
                  }}
                  className="space-y-4 pt-2"
                >
                  <div className="rounded-3xl bg-white p-4 shadow-card border border-mist-300 space-y-2">
                    <label className="text-[12.5px] font-bold text-ink-700 flex items-center gap-1.5">
                      <Phone className="h-4 w-4 text-coral" />
                      Twój numer telefonu
                    </label>
                    <input
                      type="tel"
                      required
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      placeholder="np. 500 123 456"
                      className="h-12 w-full rounded-2xl border border-mist-300 bg-mist/40 px-4 text-[15px] font-bold text-ink outline-none focus:ring-2 focus:ring-ink"
                    />
                    <p className="text-[11.5px] text-ink-500">
                      Wyślemy jednorazowy 4-cyfrowy kod SMS, aby zweryfikować Twoje konto.
                    </p>
                  </div>

                  {loginError && (
                    <p className="text-[12px] font-bold text-coral text-center">{loginError}</p>
                  )}

                  <button
                    type="submit"
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-[14.5px] font-bold text-white shadow-sm hover:bg-ink-700 active:scale-[0.98] transition-all"
                  >
                    Wyślij kod SMS
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifySmsCode} className="space-y-4 pt-2">
                  <div className="rounded-3xl bg-white p-4 shadow-card border border-mist-300 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[12.5px] font-bold text-ink">Kod z wiadomości SMS</span>
                      <button
                        type="button"
                        onClick={() => setLoginSmsStep(false)}
                        className="text-[11.5px] font-bold text-coral hover:underline"
                      >
                        Zmień numer
                      </button>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={loginSmsCode}
                      onChange={(e) => setLoginSmsCode(e.target.value)}
                      placeholder="Wpisz np. 1234"
                      className="h-14 w-full rounded-2xl border border-mist-300 bg-mist/40 text-center font-display text-[22px] font-bold tracking-[0.3em] text-ink outline-none focus:ring-2 focus:ring-ink"
                    />
                    <p className="text-[11.5px] text-center text-ink-500">
                      W wersji testowej możesz wpisać dowolny 4-cyfrowy kod (np. <b>1234</b>).
                    </p>
                  </div>

                  {loginError && (
                    <p className="text-[12px] font-bold text-coral text-center">{loginError}</p>
                  )}

                  <button
                    type="submit"
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-[14.5px] font-bold text-white shadow-sm hover:bg-ink-700 active:scale-[0.98] transition-all"
                  >
                    Zaloguj się do aplikacji
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              )
            ) : (
              <form onSubmit={handleVerifyPin} className="space-y-4 pt-2">
                <div className="rounded-3xl bg-white p-4 shadow-card border border-mist-300 space-y-3">
                  <label className="text-[12.5px] font-bold text-ink-700 flex items-center gap-1.5">
                    <KeyRound className="h-4 w-4 text-coral" />
                    6-cyfrowy kod PIN z listu powitalnego
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="np. 849201"
                    className="h-14 w-full rounded-2xl border border-mist-300 bg-mist/40 text-center font-display text-[22px] font-bold tracking-[0.35em] text-ink outline-none focus:ring-2 focus:ring-ink"
                  />
                  <p className="text-[11.5px] text-ink-500 leading-snug">
                    Wprowadź kod otrzymany w skrzynce pocztowej. Kod loguje Cię i natychmiast
                    odblokowuje status <b>Zweryfikowanego Mieszkańca</b>.
                  </p>
                </div>

                {loginError && (
                  <p className="text-[12px] font-bold text-coral text-center">{loginError}</p>
                )}

                <button
                  type="submit"
                  disabled={loginPin.length !== 6}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-[14.5px] font-bold text-white shadow-sm hover:bg-ink-700 active:scale-[0.98] transition-all disabled:opacity-40"
                >
                  Aktywuj i zaloguj
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                </button>
              </form>
            )}
          </div>
        ) : (
          /* =========================================================================
             WIDOK REJESTRACJI (REGISTRATION FLOW - KROKI 1, 2, 3, 4)
             ========================================================================= */
          <div className="px-5 pt-4">
            {/* Pasek postępu kroków */}
            {registerStep < 4 && (
              <div className="flex items-center justify-between pb-3">
                {registerStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setRegisterStep((s) => (s - 1) as 1 | 2 | 3)}
                    className="flex items-center gap-1 text-[12px] font-bold text-ink-600 hover:text-ink active:scale-95"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Wróć
                  </button>
                ) : (
                  <span className="text-[11.5px] font-semibold text-ink-400">Rejestracja</span>
                )}
                <span className="text-[12px] font-bold text-ink-500">
                  Krok {registerStep} z 3
                </span>
              </div>
            )}

            {/* --- KROK 1: IMIĘ, MIEJSCOWOŚĆ W GMINIE / ULICA I AWATAR 3D --- */}
            {registerStep === 1 && (
              <div className="space-y-4">
                <div className="rounded-3xl bg-white p-4 shadow-card border border-mist-300">
                  <label className="text-[13px] font-bold text-ink block">Jak masz na imię?</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="np. Wojtek"
                    autoComplete="given-name"
                    className="mt-2 h-12 w-full rounded-2xl border border-mist-300 bg-mist/40 px-4 text-[16px] font-bold text-ink outline-none focus:ring-2 focus:ring-ink"
                  />
                </div>

                {/* OSTYLOWANY DROPDOWN WYBORU MIEJSCOWOŚCI W GMINIE / MIASTA */}
                <div className="rounded-3xl bg-white p-4 shadow-card border border-mist-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-bold text-ink block">
                      Miejscowość w gminie / miasto
                    </label>
                    <span className="rounded-full bg-sand-100 px-2.5 py-0.5 text-[11px] font-bold text-ink">
                      {city}
                    </span>
                  </div>

                  <div className="mt-1">
                    <CityDropdown
                      value={city}
                      onChange={handleCitySelect}
                      variant="full"
                    />
                  </div>
                </div>

                {/* SEKCJA ULICY: DLA MIASTA LUB WSI W GMINIE */}
                <div className="rounded-3xl bg-white p-4 shadow-card border border-mist-300">
                  {!isSelectedGmina ? (
                    <>
                      <p className="text-[13px] font-bold text-ink">Przy jakiej ulicy mieszkasz?</p>
                      <p className="text-[11.5px] text-ink-400 mt-0.5">Wybierz z popularnych lub wyszukaj poniżej:</p>

                      <div className="mt-2.5 grid grid-cols-3 gap-2">
                        {topStreets.map((s) => {
                          const active = street?.name === s.name;
                          return (
                            <button
                              key={s.name}
                              type="button"
                              onClick={() => setStreet(s)}
                              className={cn(
                                'rounded-2xl p-2.5 text-left transition-all active:scale-95 border',
                                active
                                  ? 'bg-ink text-white border-ink shadow-sm'
                                  : 'bg-mist/60 text-ink border-transparent hover:bg-mist',
                              )}
                            >
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                                  active ? 'bg-coral text-ink' : 'bg-sand-100 text-sand-700',
                                )}
                              >
                                <Users className="h-3 w-3" />
                                {s.neighbors}
                              </span>
                              <p className="mt-1.5 truncate text-[13px] font-bold">{s.name}</p>
                            </button>
                          );
                        })}
                      </div>

                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Szukaj innej ulicy w Mińsku…"
                        className="mt-3 h-11 w-full rounded-xl border border-mist-300 bg-mist/40 px-3.5 text-[13.5px] text-ink outline-none focus:ring-2 focus:ring-ink"
                      />

                      {filteredStreets.length > 0 ? (
                        <ul className="mt-2 overflow-hidden rounded-2xl border border-mist-300 bg-white">
                          {filteredStreets.map((s) => (
                            <li key={s.name}>
                              <button
                                type="button"
                                onClick={() => {
                                  setStreet(s);
                                  setQuery('');
                                }}
                                className="flex w-full items-center justify-between border-b border-mist px-3.5 py-2.5 text-left last:border-0 hover:bg-mist/60"
                              >
                                <span className="text-[13.5px] font-bold text-ink">ul. {s.name}</span>
                                <span className="text-[11.5px] text-ink-400">{s.neighbors} sąsiadów</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : query.trim() ? (
                        <div className="mt-2 rounded-2xl border border-mist-300 bg-white p-3">
                          <button
                            type="button"
                            onClick={() => {
                              const qClean = query.trim();
                              const customStreet: Street = {
                                name: qClean,
                                as: `z ${qClean}`,
                                neighbors: 1,
                              };
                              setStreet(customStreet);
                              setQuery('');
                            }}
                            className="flex w-full items-center justify-between text-left"
                          >
                            <div>
                              <p className="text-[13px] font-bold text-ink">Użyj: „{query.trim()}”</p>
                              <p className="text-[11px] text-ink-500">Ulica w Mińsku Mazowieckim</p>
                            </div>
                            <span className="rounded-full bg-sand-100 px-2.5 py-1 text-[11px] font-bold text-ink">
                              Wybierz
                            </span>
                          </button>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[13px] font-bold text-ink">
                            Miejscowość: <span className="text-coral-700">{city}</span>
                          </p>
                          <p className="text-[11.5px] text-ink-400 mt-0.5">
                            Sołectwo w Gminie Mińsk Mazowiecki
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                          Gmina Mińsk
                        </span>
                      </div>

                      <div>
                        <label className="text-[12px] font-bold text-ink-600 block">
                          Ulica w {city} (opcjonalnie)
                        </label>
                        <input
                          value={query}
                          onChange={(e) => {
                            const q = e.target.value;
                            setQuery(q);
                            if (q.trim()) {
                              setStreet({
                                name: `${q.trim()}, ${city}`,
                                as: `z ${q.trim()} (${city})`,
                                neighbors: 1,
                              });
                            } else {
                              const asForm = gminaLocalityAs[city] || `z ${city}`;
                              setStreet({
                                name: city,
                                as: asForm,
                                neighbors: 35,
                              });
                            }
                          }}
                          placeholder="np. Warszawska, Wspólna (lub zostaw puste)"
                          className="mt-1.5 h-11 w-full rounded-xl border border-mist-300 bg-mist/40 px-3.5 text-[13.5px] text-ink outline-none focus:ring-2 focus:ring-ink"
                        />
                        <p className="text-[11px] text-ink-400 mt-1">
                          Jeśli podasz ulicę, Twój podpis to np. <em>{displayName} z {query.trim() || 'Głównej'} ({city})</em>. Bez ulicy: <em>{displayName} {gminaLocalityAs[city] || `z ${city}`}</em>.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* PODGLĄD TOŻSAMOŚCI SĄSIEDZKIEJ (KLUCZOWY MODUŁ AGENTS.MD) */}
                <div className="rounded-3xl bg-white p-4 shadow-card border border-mist-300">
                  <div className="flex items-center gap-3.5">
                    <div className="relative shrink-0">
                      <img
                        src={avatarUrl(avatarSeed)}
                        alt="Twój awatar 3D"
                        className="h-16 w-16 rounded-2xl bg-mist object-cover ring-2 ring-mist-300"
                      />
                      <button
                        type="button"
                        onClick={handleRerollAvatar}
                        title="Wylosuj inny awatar"
                        className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-sand text-ink shadow-sm hover:scale-105 active:scale-95 transition-transform"
                      >
                        <Dices className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="inline-flex items-center gap-1 rounded-full bg-coral-50 px-2 py-0.5 text-[10.5px] font-bold text-coral-700">
                        <Sparkles className="h-3 w-3" />
                        Twoja publiczna tożsamość
                      </span>
                      <p className="mt-1 font-display text-[17px] font-bold leading-tight text-ink truncate">
                        {displayName} {street ? street.as : 'ze Spacerowej'}
                      </p>
                      <p className="text-[11px] text-ink-500 mt-0.5">
                        Tylko w ten sposób będziesz widoczny dla innych mieszkańców.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!name.trim() || !street}
                  onClick={() => setRegisterStep(2)}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-[14.5px] font-bold text-white shadow-sm hover:bg-ink-700 active:scale-[0.98] transition-all disabled:opacity-40"
                >
                  Dalej: Numer telefonu
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* --- KROK 2: DANE KONTAKTOWE (TELEFON) --- */}
            {registerStep === 2 && (
              <div className="space-y-4">
                <div className="rounded-3xl bg-white p-4 shadow-card border border-mist-300 space-y-3">
                  <label className="text-[13px] font-bold text-ink block">
                    Twój numer telefonu
                  </label>
                  <p className="text-[12px] text-ink-500 leading-snug">
                    Służy do logowania na nowym telefonie oraz kontaktu w sprawach sąsiedzkich (np.
                    odbiór ogłoszenia).
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="flex h-12 items-center rounded-2xl border border-mist-300 bg-mist/60 px-3 text-[14px] font-bold text-ink">
                      🇵🇱 +48
                    </span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="np. 500 123 456"
                      className="h-12 flex-1 rounded-2xl border border-mist-300 bg-mist/40 px-4 text-[15px] font-bold text-ink outline-none focus:ring-2 focus:ring-ink"
                    />
                  </div>
                </div>

                <div className="rounded-3xl bg-sand-50 p-4 border border-sand-200 text-[12px] text-sand-800 leading-relaxed flex items-start gap-2.5">
                  <ShieldCheck className="h-5 w-5 text-sand-700 shrink-0 mt-0.5" />
                  <span>
                    Twój numer telefonu <b>nie jest upubliczniany w internecie</b>. Inni sąsiedzi
                    kontaktują się z Tobą przez wewnętrzny czat w aplikacji.
                  </span>
                </div>

                <button
                  type="button"
                  disabled={!phone.trim() || phone.replace(/\D/g, '').length < 7}
                  onClick={() => setRegisterStep(3)}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-[14.5px] font-bold text-white shadow-sm hover:bg-ink-700 active:scale-[0.98] transition-all disabled:opacity-40"
                >
                  Dalej: Adres do listu
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* --- KROK 3: PEŁNY ADRES DO WYSYŁKI LISTU (FIZYCZNA WERYFIKACJA) --- */}
            {registerStep === 3 && (
              <div className="space-y-4">
                <div className="rounded-3xl bg-white p-4 shadow-card border border-mist-300 space-y-3">
                  <div>
                    <span className="text-[12px] font-bold uppercase tracking-wider text-ink-400">
                      Adres doręczenia listu powitalnego
                    </span>
                    <h3 className="font-display text-[16px] font-bold text-ink mt-0.5">
                      Dane dla listonosza Poczty Polskiej
                    </h3>
                  </div>

                  <div>
                    <label className="text-[12px] font-bold text-ink-700">Nazwisko (wymagane na skrzynkę)</label>
                    <input
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      placeholder="np. Kowalski"
                      className="mt-1 h-11 w-full rounded-xl border border-mist-300 bg-mist/40 px-3 text-[14px] font-bold text-ink outline-none focus:ring-2 focus:ring-ink"
                    />
                  </div>

                  <div className="flex h-11 items-center gap-2 rounded-xl border border-mist-300 bg-mist/60 px-3 text-[13.5px] font-bold text-ink-600">
                    <MapPin className="h-4 w-4 text-coral shrink-0" />
                    <span>ul. {street?.name}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[12px] font-bold text-ink-700">Nr budynku *</label>
                      <input
                        value={houseNumber}
                        onChange={(e) => setHouseNumber(e.target.value)}
                        placeholder="np. 14 lub 14A"
                        className="mt-1 h-11 w-full rounded-xl border border-mist-300 bg-mist/40 px-3 text-[14px] font-bold text-ink outline-none focus:ring-2 focus:ring-ink"
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-bold text-ink-700">Nr lokalu (opcjonalnie)</label>
                      <input
                        value={flatNumber}
                        onChange={(e) => setFlatNumber(e.target.value)}
                        placeholder="np. 28"
                        className="mt-1 h-11 w-full rounded-xl border border-mist-300 bg-mist/40 px-3 text-[14px] font-bold text-ink outline-none focus:ring-2 focus:ring-ink"
                      />
                    </div>
                  </div>

                  {/* OSTYLOWANY DROPDOWN WYBORU MIEJSCOWOŚCI W GMINIE LUB MIASTA */}
                  <div className="space-y-2 pt-1">
                    <label className="text-[12px] font-bold text-ink-700 block">
                      Miejscowość w gminie / miasto *
                    </label>

                    <CityDropdown
                      value={city}
                      onChange={handleCitySelect}
                      variant="full"
                    />

                    <div className="flex h-10 items-center justify-between rounded-xl bg-mist/60 px-3.5 text-[12px] font-semibold text-ink-600">
                      <span>Adres do listu:</span>
                      <strong className="text-ink font-bold">
                        {postalCode} {city}
                      </strong>
                    </div>

                    <p className="text-[11px] text-ink-400 leading-snug">
                      Darmowy list powitalny z kodem PIN i kuponami doręczamy na terenie całego <strong>Mińska Mazowieckiego</strong> oraz <strong>Gminy Mińsk Mazowiecki</strong>.
                    </p>
                  </div>
                </div>

                {/* BANNER RODO I SZYFROWANIA DANYCH */}
                <div className="rounded-2xl bg-white p-3.5 shadow-xs border border-mist-300 flex items-start gap-2.5 text-[11.5px] text-ink-600 leading-snug">
                  <Lock className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <b>Gwarancja prywatności RODO:</b> Twoje nazwisko, numer budynku i lokalu są{' '}
                    <b>szyfrowane w bazie danych (AES-256)</b> i widoczne wyłącznie dla Administratora
                    do nadania listu. Sąsiedzi w aplikacji widzą wyłącznie:{' '}
                    <strong className="text-ink font-bold">
                      {displayName} {street?.as}
                    </strong>
                    .
                  </span>
                </div>

                {/* KORZYŚCI Z LISTU (KUPONY + 14 DNI) */}
                <div className="rounded-2xl bg-sky-50 p-3.5 border border-sky-200 flex items-start gap-2.5 text-[12px] text-sky-950 leading-snug">
                  <Mail className="h-4 w-4 text-sky-700 shrink-0 mt-0.5" />
                  <span>
                    List z <b>6-cyfrowym kodem PIN</b> i <b>5 kuponami rabatowymi</b> (m.in. Motylek
                    Market) przyjdzie w ciągu 3–5 dni. Od razu masz{' '}
                    <b>14 dni pełnego dostępu testowego</b>!
                  </span>
                </div>

                <button
                  type="button"
                  disabled={!surname.trim() || !houseNumber.trim() || !postalCode.trim() || !city.trim()}
                  onClick={() => setRegisterStep(4)}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-[14.5px] font-bold text-white shadow-sm hover:bg-ink-700 active:scale-[0.98] transition-all disabled:opacity-40"
                >
                  Zarejestruj konto i wejdź
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* --- KROK 4: SUKCES I POWITANIE W SPOŁECZNOŚCI --- */}
            {registerStep === 4 && (
              <div className="text-center py-4 space-y-4">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm animate-bounce">
                  <CheckCircle2 className="h-11 w-11" />
                </div>

                <div>
                  <h3 className="font-display text-[24px] font-bold text-ink">Witaj w mójMińsk!</h3>
                  <p className="text-[13.5px] text-ink-500 max-w-[280px] mx-auto mt-1 leading-snug">
                    Twoje konto zostało utworzone. List powitalny jest przygotowywany do wysyłki.
                  </p>
                </div>

                {/* Podsumowanie karty tożsamości */}
                <div className="mx-auto max-w-[320px] rounded-3xl bg-white p-4 text-left shadow-card border border-mist-300 flex items-center gap-3.5">
                  <img
                    src={avatarUrl(avatarSeed)}
                    alt=""
                    className="h-14 w-14 rounded-2xl bg-mist object-cover ring-2 ring-mist-300 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="inline-block rounded-full bg-sand-100 px-2 py-0.5 text-[10px] font-bold text-sand-800">
                      DOSTĘP TYMCZASOWY (14 DNI)
                    </span>
                    <p className="font-display text-[16px] font-bold text-ink mt-0.5 truncate">
                      {displayName} {street?.as}
                    </p>
                    <p className="text-[11.5px] text-ink-400">
                      ul. {street?.name} · {postalCode} {city}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFinishRegistration}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-[14.5px] font-bold text-white shadow-sm hover:bg-ink-700 active:scale-[0.98] transition-all"
                >
                  Rozpocznij korzystanie z aplikacji
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer z polityką prywatności */}
      <footer className="px-6 pt-4 text-center">
        <p className="text-[11px] text-ink-400 leading-tight">
          Rejestrując się, akceptujesz Regulamin i Zasadę Sąsiedzkiej Rzetelności mójMińsk.
          Wszystkie dane osobowe są przetwarzane zgodnie z RODO.
        </p>
      </footer>
    </div>
  );
}
