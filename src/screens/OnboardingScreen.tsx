import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Dices,
  Lock,
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
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [street, setStreet] = useState<Street | null>(streets[0]);
  const [query, setQuery] = useState('');
  const [seedN, setSeedN] = useState(1);
  const [phone, setPhone] = useState('');
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
  const [loginPhone, setLoginPhone] = useState('');
  const [loginSmsStep, setLoginSmsStep] = useState(false);
  const [loginSmsCode, setLoginSmsCode] = useState('');
  const [loginError, setLoginError] = useState('');

  // Filtrowanie i podpowiedzi ulic (pełna baza Mińska Mazowieckiego)
  const topStreets = streets.slice(0, 3);
  const filteredStreets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return streets.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 30);
  }, [query]);

  const displayName = name.trim() || 'Sąsiad';
  const avatarSeed = `${displayName}-${seedN}`;

  // Losowanie kolejnego awatara 3D
  const handleRerollAvatar = () => {
    setSeedN((prev) => prev + 1);
  };

  // Zakończenie rejestracji
  const handleFinishRegistration = () => {
    if (!street || !name.trim()) return;

    const newUser: User = {
      name: name.trim(),
      street,
      phone: phone.trim() || undefined,
      postalCode: postalCode.trim() || '05-300',
      city: city.trim() || 'Mińsk Mazowiecki',
      seed: avatarSeed,
      rerolls: 999,
      verified: true,
      trialDaysLeft: 999,
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
      verified: true,
    };
    onDone(loggedUser);
  };

  return (
    <div className="h-full md:h-screen w-full flex flex-col justify-center items-center md:p-4 lg:p-6 select-none bg-mist md:overflow-hidden">
      {/* KARTA GŁÓWNA - SZTYWNO DOPASOWANA DO OKNA BEZ SKROLLOWANIA NA DESKTOPIE */}
      <div className="w-full max-w-md md:max-w-4xl lg:max-w-5xl md:h-[610px] lg:h-[630px] bg-white md:rounded-3xl md:shadow-2xl md:overflow-hidden md:border md:border-mist-300 flex flex-col md:flex-row shadow-sm overflow-hidden">
        
        {/* =========================================================================
            LEWA KOLUMNA: BRAND & PODGLĄD TOŻSAMOŚCI (Desktop >= 768px)
            ========================================================================= */}
        <aside className="hidden md:flex md:w-5/12 bg-coral p-6 lg:p-7 flex-col justify-between relative overflow-hidden text-ink shrink-0 h-full">
          {/* Tło z bąblami dekoracyjnymi */}
          <div className="absolute -right-14 -top-14 h-56 w-56 rounded-full bg-sand/80 pointer-events-none" aria-hidden />
          <div className="absolute -left-10 bottom-16 h-36 w-36 rounded-full bg-sky/80 pointer-events-none" aria-hidden />

          {/* Top: Logo i przycisk demo */}
          <div className="relative z-10 flex items-center justify-between">
            <p className="font-display text-[24px] font-bold tracking-tight text-ink">
              mój<span className="text-white">Mińsk</span>
              <span className="text-sand-600">.</span>
            </p>
            <button
              type="button"
              onClick={() => onDone({ ...demoUser, isGuest: true, name: 'Gość', verified: true })}
              className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[11px] font-extrabold text-ink shadow-2xs border border-white hover:bg-sand-50 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="h-3 w-3 text-sand-700" />
              <span>Pomiń (demo)</span>
            </button>
          </div>

          {/* Środek: Hasło i atuty platformy */}
          <div className="relative z-10 space-y-4 my-auto">
            <div>
              <h1 className="font-display text-[26px] lg:text-[29px] font-bold leading-[1.1] tracking-tight text-ink">
                Twoi sąsiedzi. Bez spamu i hejtu.
              </h1>
              <p className="mt-1.5 text-[12.5px] font-medium text-ink/80 leading-snug">
                Mińsk Mazowiecki i sołectwa Gminy Mińsk Mazowiecki.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2.5 rounded-xl bg-white/40 px-3 py-2 border border-white/40">
                <ShieldCheck className="h-4 w-4 text-ink shrink-0" />
                <p className="text-[11.5px] font-bold text-ink">Tożsamość: <em>[Imię] z ulicy [Nazwa]</em></p>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl bg-white/40 px-3 py-2 border border-white/40">
                <Users className="h-4 w-4 text-ink shrink-0" />
                <p className="text-[11.5px] font-bold text-ink">Lokalne ogłoszenia C2C i carpooling</p>
              </div>
            </div>

            {/* Podgląd karty tożsamości na żywo */}
            <div className="rounded-2xl bg-white/90 p-3 shadow-2xs border border-white backdrop-blur-xs">
              <div className="flex items-center gap-3">
                <img
                  src={avatarUrl(avatarSeed)}
                  alt="Awatar"
                  className="h-12 w-12 rounded-xl bg-sand-100 object-cover ring-2 ring-white shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="inline-block rounded-full bg-coral-100 px-2 py-0.5 text-[9px] font-extrabold text-coral-800">
                    KARTA MIESZKAŃCA
                  </span>
                  <p className="font-display text-[14.5px] font-bold text-ink truncate mt-0.5">
                    {displayName} {street ? street.as : 'ze Spacerowej'}
                  </p>
                  <p className="text-[10.5px] text-ink-500 truncate">
                    {street ? `ul. ${street.name}` : 'Mińsk Mazowiecki'} · {city}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dół lewej kolumny: gwarancja bezpieczeństwa */}
          <div className="relative z-10 flex items-center gap-1.5 text-[11px] font-semibold text-ink/75 pt-2 border-t border-ink/10">
            <Lock className="h-3 w-3 shrink-0" />
            <span>Pełne dane adresowe szyfrowane w bazie (AES-256)</span>
          </div>
        </aside>

        {/* =========================================================================
            PRAWA KOLUMNA: FORMULARZ (DOPASOWANY PIONOWO BEZ SCROLLA)
            ========================================================================= */}
        <div className="w-full md:w-7/12 flex flex-col justify-between bg-white h-full overflow-y-auto md:overflow-hidden p-5 md:p-6 lg:p-7">
          <div>
            {/* Mobilny Header (tylko na ekranach < 768px) */}
            <header className="md:hidden relative overflow-hidden rounded-b-3xl bg-coral p-5 mb-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="font-display text-[20px] font-bold tracking-tight text-ink">
                  mój<span className="text-white">Mińsk</span>
                  <span className="text-sand-600">.</span>
                </p>

                <button
                  type="button"
                  onClick={() => onDone({ ...demoUser, isGuest: true, name: 'Gość', verified: true })}
                  className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-extrabold text-ink shadow-xs border border-white"
                >
                  <Sparkles className="h-3 w-3 text-sand-700" />
                  <span>Pomiń (demo)</span>
                </button>
              </div>

              <h1 className="mt-3 font-display text-[24px] font-bold leading-tight text-ink">
                Twoi sąsiedzi. Bez spamu.
              </h1>

              {/* Przełącznik Mobile */}
              <div className="mt-3 flex rounded-xl bg-ink/10 p-0.5 backdrop-blur-xs">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setLoginError('');
                  }}
                  className={cn(
                    'flex-1 rounded-lg py-1.5 text-center text-[12px] font-bold transition-all',
                    authMode === 'register' ? 'bg-white text-ink shadow-xs' : 'text-ink/80',
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
                    'flex-1 rounded-lg py-1.5 text-center text-[12px] font-bold transition-all',
                    authMode === 'login' ? 'bg-white text-ink shadow-xs' : 'text-ink/80',
                  )}
                >
                  Mam już konto
                </button>
              </div>
            </header>

            {/* Desktop Header & Przełącznik (widoczny na Desktopie >= 768px) */}
            <div className="hidden md:flex items-center justify-between pb-3 mb-3 border-b border-mist-200">
              <div>
                <h2 className="font-display text-[19px] font-bold text-ink">
                  {authMode === 'register' ? 'Dołącz do społeczności' : 'Zaloguj się do konta'}
                </h2>
                <p className="text-[11.5px] text-ink-500">
                  {authMode === 'register' ? 'Rejestracja zajmuje mniej niż 30 sekund.' : 'Wprowadź numer powiązany z kontem.'}
                </p>
              </div>

              {/* Przełącznik Desktop */}
              <div className="flex rounded-xl bg-mist p-0.5 border border-mist-300">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setLoginError('');
                  }}
                  className={cn(
                    'rounded-lg px-3 py-1 text-center text-[11.5px] font-bold transition-all cursor-pointer',
                    authMode === 'register' ? 'bg-white text-ink shadow-2xs' : 'text-ink-500 hover:text-ink',
                  )}
                >
                  Rejestracja
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setLoginError('');
                  }}
                  className={cn(
                    'rounded-lg px-3 py-1 text-center text-[11.5px] font-bold transition-all cursor-pointer',
                    authMode === 'login' ? 'bg-white text-ink shadow-2xs' : 'text-ink-500 hover:text-ink',
                  )}
                >
                  Logowanie
                </button>
              </div>
            </div>

            {/* =========================================================================
                LOGOWANIE
                ========================================================================= */}
            {authMode === 'login' ? (
              <div className="space-y-3 pt-2">
                {!loginSmsStep ? (
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
                    className="space-y-3 max-w-sm"
                  >
                    <div className="rounded-2xl bg-white p-3.5 shadow-2xs border border-mist-300 space-y-2">
                      <label className="text-[12px] font-bold text-ink-700 flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-coral" />
                        Twój numer telefonu
                      </label>
                      <input
                        type="tel"
                        required
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        placeholder="np. 500 123 456"
                        className="h-10 w-full rounded-xl border border-mist-300 bg-mist/40 px-3 text-[14px] font-bold text-ink outline-none focus:ring-2 focus:ring-ink"
                      />
                      <p className="text-[11px] text-ink-500">
                        Wyślemy jednorazowy 4-cyfrowy kod SMS.
                      </p>
                    </div>

                    {loginError && (
                      <p className="text-[11.5px] font-bold text-coral">{loginError}</p>
                    )}

                    <button
                      type="submit"
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-[13.5px] font-bold text-white shadow-xs hover:bg-ink-700 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      Wyślij kod SMS
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifySmsCode} className="space-y-3 max-w-sm">
                    <div className="rounded-2xl bg-white p-3.5 shadow-2xs border border-mist-300 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold text-ink">Kod z wiadomości SMS</span>
                        <button
                          type="button"
                          onClick={() => setLoginSmsStep(false)}
                          className="text-[11px] font-bold text-coral hover:underline cursor-pointer"
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
                        placeholder="1234"
                        className="h-11 w-full rounded-xl border border-mist-300 bg-mist/40 text-center font-display text-[18px] font-bold tracking-[0.25em] text-ink outline-none focus:ring-2 focus:ring-ink"
                      />
                      <p className="text-[10.5px] text-center text-ink-500">
                        Wpisz dowolny kod (np. <b>1234</b>).
                      </p>
                    </div>

                    {loginError && (
                      <p className="text-[11.5px] font-bold text-coral">{loginError}</p>
                    )}

                    <button
                      type="submit"
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-[13.5px] font-bold text-white shadow-xs hover:bg-ink-700 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      Zaloguj się do aplikacji
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                )}
              </div>
            ) : (
              /* =========================================================================
                 REJESTRACJA (KROKI 1, 2, 3 - ZOPTYMALIZOWANE BEZ SCROLLA)
                 ========================================================================= */
              <div>
                {/* Wskaźnik kroku */}
                {registerStep < 3 && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-mist-200">
                    {registerStep > 1 ? (
                      <button
                        type="button"
                        onClick={() => setRegisterStep((s) => (s - 1) as 1 | 2)}
                        className="flex items-center gap-1 text-[11.5px] font-bold text-ink-600 hover:text-ink active:scale-95 cursor-pointer"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        Wróć
                      </button>
                    ) : (
                      <span className="text-[11.5px] font-semibold text-ink-500">
                        Krok 1: Twoja tożsamość
                      </span>
                    )}
                    <span className="text-[11.5px] font-bold text-ink-400">
                      Krok {registerStep} z 2
                    </span>
                  </div>
                )}

                {/* --- KROK 1: IMIĘ, MIEJSCOWOŚĆ, ULICA I AWATAR --- */}
                {registerStep === 1 && (
                  <div className="space-y-2.5">
                    {/* Wiersz 1: Imię i Miejscowość w 2 kolumnach */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      <div className="rounded-2xl bg-white p-2.5 shadow-2xs border border-mist-300">
                        <label className="text-[11.5px] font-bold text-ink block">
                          Jak masz na imię?
                        </label>
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="np. Wojtek"
                          autoComplete="given-name"
                          className="mt-1 h-9 w-full rounded-xl border border-mist-300 bg-mist/40 px-3 text-[14px] font-bold text-ink outline-none focus:ring-2 focus:ring-ink"
                        />
                      </div>

                      <div className="rounded-2xl bg-white p-2.5 shadow-2xs border border-mist-300">
                        <div className="flex items-center justify-between">
                          <label className="text-[11.5px] font-bold text-ink block">
                            Miejscowość
                          </label>
                          <span className="rounded-full bg-sand-100 px-2 py-0.2 text-[10px] font-bold text-ink">
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
                    </div>

                    {/* Wiersz 2: Wybór ulicy */}
                    <div className="rounded-2xl bg-white p-2.5 shadow-2xs border border-mist-300">
                      {!isSelectedGmina ? (
                        <>
                          <div className="flex items-center justify-between">
                            <p className="text-[11.5px] font-bold text-ink">Przy jakiej ulicy mieszkasz?</p>
                            {street && (
                              <span className="rounded-full bg-sand-100 px-2 py-0.2 text-[10.5px] font-bold text-ink">
                                ul. {street.name}
                              </span>
                            )}
                          </div>

                          <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                            {topStreets.map((s) => {
                              const active = street?.name === s.name;
                              return (
                                <button
                                  key={s.name}
                                  type="button"
                                  onClick={() => setStreet(s)}
                                  className={cn(
                                    'rounded-xl p-1.5 text-left transition-all active:scale-95 border cursor-pointer',
                                    active
                                      ? 'bg-ink text-white border-ink shadow-2xs'
                                      : 'bg-mist/60 text-ink border-transparent hover:bg-mist',
                                  )}
                                >
                                  <div className="flex items-center justify-between">
                                    <p className="truncate text-[11.5px] font-bold">{s.name}</p>
                                    <span
                                      className={cn(
                                        'rounded px-1 text-[9px] font-bold',
                                        active ? 'bg-coral text-ink' : 'bg-sand-100 text-sand-700',
                                      )}
                                    >
                                      {s.neighbors}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Wpisz nazwę swojej ulicy (np. Warszawska, Prusa, Polna)…"
                            className="mt-2 h-8 w-full rounded-lg border border-mist-300 bg-mist/40 px-2.5 text-[12.5px] text-ink outline-none focus:ring-1 focus:ring-ink"
                          />

                          {filteredStreets.length > 0 ? (
                            <ul className="mt-1.5 max-h-28 overflow-y-auto rounded-xl border border-mist-300 bg-white shadow-sm divide-y divide-mist">
                              {filteredStreets.map((s) => (
                                <li key={s.name}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setStreet(s);
                                      setQuery('');
                                    }}
                                    className="flex w-full items-center justify-between px-2.5 py-1.5 text-left hover:bg-mist/60 text-[12px] font-bold text-ink cursor-pointer"
                                  >
                                    <span>ul. {s.name}</span>
                                    <span className="text-[10px] text-ink-400 font-normal">{s.neighbors} sąsiadów</span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          ) : query.trim() ? (
                            <div className="mt-1.5 rounded-xl border border-mist-300 bg-white p-2">
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
                                className="flex w-full items-center justify-between text-left cursor-pointer"
                              >
                                <span className="text-[12px] font-bold text-ink">Użyj: „{query.trim()}”</span>
                                <span className="rounded bg-sand-100 px-2 py-0.5 text-[10px] font-bold text-ink">
                                  Wybierz
                                </span>
                              </button>
                            </div>
                          ) : null}
                        </>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <p className="text-[11.5px] font-bold text-ink">
                              Miejscowość: <span className="text-coral-700">{city}</span>
                            </p>
                            <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9.5px] font-bold text-emerald-800">
                              Gmina Mińsk
                            </span>
                          </div>

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
                            placeholder="Ulica w miejscowości (opcjonalnie)"
                            className="h-8 w-full rounded-lg border border-mist-300 bg-mist/40 px-2.5 text-[12.5px] text-ink outline-none focus:ring-1 focus:ring-ink"
                          />
                        </div>
                      )}
                    </div>

                    {/* Wiersz 3: Awatar z przyciskiem losowania */}
                    <div className="rounded-2xl bg-white p-2.5 shadow-2xs border border-mist-300 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={avatarUrl(avatarSeed)}
                          alt="Awatar"
                          className="h-10 w-10 rounded-xl bg-mist object-cover ring-1 ring-mist-300"
                        />
                        <div>
                          <p className="text-[11.5px] font-bold text-ink">Awatar sąsiedzki</p>
                          <p className="text-[10px] text-ink-400">Wygenerowany dla Twojego profilu</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRerollAvatar}
                        title="Wylosuj inny awatar"
                        className="flex items-center gap-1 rounded-full bg-sand px-2.5 py-1 text-[11px] font-bold text-ink shadow-2xs hover:bg-sand-400 active:scale-95 transition-all cursor-pointer"
                      >
                        <Dices className="h-3.5 w-3.5" />
                        <span>Zmień</span>
                      </button>
                    </div>

                    {/* Przycisk przejścia do kroku 2 */}
                    <button
                      type="button"
                      disabled={!name.trim() || !street}
                      onClick={() => setRegisterStep(2)}
                      className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-ink text-[13.5px] font-bold text-white shadow-xs hover:bg-ink-700 active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer mt-1"
                    >
                      Dalej: Weryfikacja kontaktu
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* --- KROK 2: DANE KONTAKTOWE (TELEFON) --- */}
                {registerStep === 2 && (
                  <div className="space-y-3 pt-1">
                    <div className="rounded-2xl bg-white p-3.5 shadow-2xs border border-mist-300 space-y-2">
                      <label className="text-[12px] font-bold text-ink block">
                        Twój numer telefonu
                      </label>
                      <p className="text-[11px] text-ink-500 leading-snug">
                        Służy do logowania na nowym telefonie oraz kontaktu w sprawach sąsiedzkich.
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="flex h-10 items-center rounded-xl border border-mist-300 bg-mist/60 px-2.5 text-[13px] font-bold text-ink">
                          🇵🇱 +48
                        </span>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="np. 500 123 456"
                          className="h-10 flex-1 rounded-xl border border-mist-300 bg-mist/40 px-3 text-[14px] font-bold text-ink outline-none focus:ring-2 focus:ring-ink"
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl bg-sand-50 p-3 border border-sand-200 text-[11px] text-sand-800 leading-relaxed flex items-start gap-2">
                      <ShieldCheck className="h-4 w-4 text-sand-700 shrink-0 mt-0.5" />
                      <span>
                        Numer telefonu <b>nie jest upubliczniany w internecie</b>. Kontakt odbywa się przez wewnętrzny czat.
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={!phone.trim() || phone.replace(/\D/g, '').length < 7}
                      onClick={() => setRegisterStep(3)}
                      className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-ink text-[13.5px] font-bold text-white shadow-xs hover:bg-ink-700 active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer"
                    >
                      Utwórz konto mieszkańca
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* --- KROK 3: SUKCES I POWITANIE W SPOŁECZNOŚCI --- */}
                {registerStep === 3 && (
                  <div className="text-center py-4 space-y-3">
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600 shadow-2xs animate-bounce">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>

                    <div>
                      <h3 className="font-display text-[20px] font-bold text-ink">Witaj w mójMińsk!</h3>
                      <p className="text-[12px] text-ink-500 max-w-[280px] mx-auto mt-0.5 leading-snug">
                        Twoje konto sąsiedzkie zostało pomyślnie utworzone.
                      </p>
                    </div>

                    {/* Podsumowanie karty tożsamości */}
                    <div className="mx-auto max-w-[320px] rounded-2xl bg-white p-3 text-left shadow-2xs border border-mist-300 flex items-center gap-3">
                      <img
                        src={avatarUrl(avatarSeed)}
                        alt=""
                        className="h-11 w-11 rounded-xl bg-mist object-cover ring-1 ring-mist-300 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.2 text-[9px] font-bold text-emerald-800">
                          MIESZKANIEC MIŃSKA
                        </span>
                        <p className="font-display text-[14.5px] font-bold text-ink mt-0.5 truncate">
                          {displayName} {street?.as}
                        </p>
                        <p className="text-[10.5px] text-ink-400">
                          ul. {street?.name} · {city}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleFinishRegistration}
                      className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-ink text-[13.5px] font-bold text-white shadow-xs hover:bg-ink-700 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      Rozpocznij korzystanie z aplikacji
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stopka z informacją o regulaminie i RODO */}
          <footer className="pt-2 border-t border-mist-200 text-center">
            <p className="text-[10px] text-ink-400 leading-tight">
              Rejestrując się, akceptujesz Regulamin mójMińsk. Dane przetwarzane zgodnie z RODO (AES-256).
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
