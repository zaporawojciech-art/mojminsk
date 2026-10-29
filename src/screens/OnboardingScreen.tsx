import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Dices,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import {
  avatarUrl,
  demoUser,
  formatNeighborCount,
  gminaLocalityAs,
  streets,
  type Street,
  type User,
} from '../data/mockData';
import { CityDropdown, cn } from '../components/ui';
import { fetchStreetsFromSupabase } from '../lib/supabase';

interface OnboardingScreenProps {
  onDone: (user: User) => void;
}

export function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  // Domyślny widok to LOGOWANIE, z wyraźnym CTA do rejestracji
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Dynamiczna lista ulic (zsynchronizowana z bazą Supabase)
  const [allStreets, setAllStreets] = useState<Street[]>(streets);

  useEffect(() => {
    let isMounted = true;
    fetchStreetsFromSupabase().then((data) => {
      if (isMounted && data && data.length > 0) {
        setAllStreets(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // --- STAN LOGOWANIA ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- STAN REJESTRACJI ---
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [street, setStreet] = useState<Street | null>(streets[0]);
  const [query, setQuery] = useState('');
  const [seedN, setSeedN] = useState(1);
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
        neighbors: 0,
      });
    } else {
      setStreet(allStreets[0] || streets[0]);
    }
  };

  // 3 przykładowe ulice do szybkiego wyboru
  const topStreets = useMemo(() => {
    const list = [...allStreets];
    const hasNeighbors = list.some((s) => s.neighbors > 0);
    if (hasNeighbors) {
      return list.sort((a, b) => b.neighbors - a.neighbors).slice(0, 3);
    }
    return list.slice(0, 3);
  }, [allStreets]);

  // Filtrowanie i podpowiedzi ulic (pełna baza Mińska Mazowieckiego)
  const filteredStreets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allStreets.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 30);
  }, [query, allStreets]);

  const displayName = name.trim() || 'Sąsiad';
  const avatarSeed = `${displayName}-${seedN}`;

  // Losowanie kolejnego awatara 3D
  const handleRerollAvatar = () => {
    setSeedN((prev) => prev + 1);
  };

  // Obsługa logowania
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = loginEmail.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setLoginError('Wprowadź prawidłowy adres e-mail');
      return;
    }
    if (loginPassword.length < 6) {
      setLoginError('Hasło musi mieć co najmniej 6 znaków');
      return;
    }
    setLoginError('');

    const emailPrefix = trimmedEmail.split('@')[0];
    const formattedName = emailPrefix
      ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)
      : demoUser.name;

    const loggedUser: User = {
      ...demoUser,
      name: formattedName,
      email: trimmedEmail,
      verified: true,
    };
    onDone(loggedUser);
  };

  // Zakończenie rejestracji
  const handleFinishRegistration = () => {
    if (!street || !name.trim()) return;

    const newUser: User = {
      name: name.trim(),
      email: email.trim(),
      street,
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

  return (
    <div className="min-h-full w-full flex flex-col justify-center items-center py-8 px-4 sm:px-6 relative selection:bg-coral-100 selection:text-coral-800">
      {/* Subtelne tło dekoracyjne */}
      <div
        className="absolute top-12 -left-20 w-80 h-80 rounded-full bg-sand/30 blur-3xl pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute bottom-12 -right-20 w-80 h-80 rounded-full bg-sky/30 blur-3xl pointer-events-none"
        aria-hidden
      />

      {/* Nagłówek marki */}
      <div className="flex flex-col items-center mb-6 text-center select-none relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white shadow-2xs border border-mist-300 text-[11.5px] font-bold text-ink-500 mb-3">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Mińsk Mazowiecki & Gmina</span>
        </div>
        <p className="font-display text-[32px] sm:text-[36px] font-bold tracking-tight text-ink leading-none">
          mój<span className="text-coral">Mińsk</span>
          <span className="text-sand-600">.</span>
        </p>
        <p className="text-[13px] font-medium text-ink-500 mt-1.5 max-w-sm">
          Lokalna platforma sąsiedzka z prawdziwą tożsamością ulic
        </p>
      </div>

      {/* =========================================================================
          WIDOK 1: LOGOWANIE (GŁÓWNY WIDOK)
          ========================================================================= */}
      {authMode === 'login' ? (
        <div className="w-full max-w-[430px] bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-mist-200/90 relative z-10 transition-all">
          <div className="mb-6">
            <h1 className="font-display text-[22px] font-bold text-ink tracking-tight">
              Zaloguj się
            </h1>
            <p className="text-[13px] text-ink-500 mt-1">
              Wprowadź swój e-mail i hasło powiązane z kontem.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-ink-700 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-coral" />
                Adres e-mail
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="twoj.email@przyklad.pl"
                className="h-11 w-full rounded-xl border border-mist-300 bg-mist/30 px-3.5 text-[14px] font-medium text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-bold text-ink-700 flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-coral" />
                  Hasło
                </label>
              </div>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 w-full rounded-xl border border-mist-300 bg-mist/30 px-3.5 text-[14px] font-medium text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10 transition-all"
              />
            </div>

            {loginError && (
              <div className="rounded-xl bg-coral-50 p-2.5 text-[12px] font-semibold text-coral-700 border border-coral-200">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-ink text-white font-bold text-[14px] shadow-sm hover:bg-ink-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              <span>Zaloguj się</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-mist-200" />
            </div>
            <span className="relative bg-white px-3 text-[11px] font-bold text-ink-400 uppercase tracking-wider">
              lub
            </span>
          </div>

          {/* Dostęp demo */}
          <button
            type="button"
            onClick={() => onDone({ ...demoUser, isGuest: true, name: 'Gość', verified: true })}
            className="w-full h-10 rounded-xl bg-mist/60 hover:bg-mist text-ink font-bold text-[12.5px] transition-all flex items-center justify-center gap-2 border border-mist-300 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-coral" />
            <span>Wypróbuj wersję demonstracyjną (jako Gość)</span>
          </button>

          {/* Główny blok CTA do rejestracji */}
          <div className="mt-6 pt-5 border-t border-mist-200 text-center">
            <p className="text-[12.5px] font-medium text-ink-500">
              Nie masz jeszcze konta mieszkańca?
            </p>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setRegisterStep(1);
                setLoginError('');
              }}
              className="mt-2.5 w-full h-11 rounded-xl bg-coral/10 hover:bg-coral/20 text-coral-700 font-bold text-[13.5px] border border-coral-200 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Utwórz bezpłatne konto mieszkańca</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        /* =========================================================================
           WIDOK 2: REJESTRACJA (3 PRZEJRZYSTE KROKI)
           ========================================================================= */
        <div className="w-full max-w-[480px] bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-mist-200/90 relative z-10 transition-all">
          {/* Pasek nawigacji powrotu i wskaźnik kroku */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => {
                if (registerStep > 1) {
                  setRegisterStep((s) => (s - 1) as 1 | 2);
                } else {
                  setAuthMode('login');
                  setLoginError('');
                }
              }}
              className="flex items-center gap-1 text-[12px] font-bold text-ink-500 hover:text-ink cursor-pointer transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>{registerStep > 1 ? 'Poprzedni krok' : 'Wróć do logowania'}</span>
            </button>

            {/* Wizualny pasek postępu (3 kropki) */}
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  registerStep === 1 ? 'w-6 bg-coral' : 'w-2 bg-mist-300',
                )}
              />
              <span
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  registerStep === 2 ? 'w-6 bg-coral' : 'w-2 bg-mist-300',
                )}
              />
              <span
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  registerStep === 3 ? 'w-6 bg-coral' : 'w-2 bg-mist-300',
                )}
              />
            </div>
          </div>

          {/* Tytuł kroku */}
          <div className="mb-5">
            <h1 className="font-display text-[21px] font-bold text-ink tracking-tight">
              {registerStep === 1 && 'Twoje dane logowania'}
              {registerStep === 2 && 'Wybierz swoją ulicę'}
              {registerStep === 3 && 'Karta tożsamości sąsiedzkiej'}
            </h1>
            <p className="text-[12.5px] text-ink-500 mt-0.5">
              {registerStep === 1 && 'Podaj imię oraz dane dostępowe do Twojego konta.'}
              {registerStep === 2 && 'Wybierz miejscowość i ulicę w Mińsku Mazowieckim.'}
              {registerStep === 3 && 'Sprawdź jak będziesz widoczny dla sąsiadów.'}
            </p>
          </div>

          {/* --- KROK 1: IMIĘ, E-MAIL, HASŁO --- */}
          {registerStep === 1 && (
            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-ink-700 flex items-center gap-1.5">
                  <UserIcon className="h-3.5 w-3.5 text-coral" />
                  Jak masz na imię?
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="np. Wojciech"
                  autoComplete="given-name"
                  className="h-11 w-full rounded-xl border border-mist-300 bg-mist/30 px-3.5 text-[14px] font-medium text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-ink-700 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-coral" />
                  Adres e-mail
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="twoj.email@przyklad.pl"
                  className="h-11 w-full rounded-xl border border-mist-300 bg-mist/30 px-3.5 text-[14px] font-medium text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-ink-700 flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-coral" />
                  Hasło (min. 6 znaków)
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Wpisz bezpieczne hasło"
                  className="h-11 w-full rounded-xl border border-mist-300 bg-mist/30 px-3.5 text-[14px] font-medium text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10 transition-all"
                />
              </div>

              <button
                type="button"
                disabled={!name.trim() || !email.trim() || !email.includes('@') || password.length < 6}
                onClick={() => setRegisterStep(2)}
                className="w-full h-11 rounded-xl bg-ink text-white font-bold text-[14px] shadow-sm hover:bg-ink-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer mt-2"
              >
                <span>Dalej: Wybierz swoją ulicę</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* --- KROK 2: MIEJSCOWOŚĆ I ULICA --- */}
          {registerStep === 2 && (
            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-ink-700 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-coral" />
                  Miejscowość / Miasto
                </label>
                <CityDropdown
                  value={city}
                  onChange={handleCitySelect}
                  variant="full"
                  triggerClassName="!h-11 !rounded-xl !border !border-mist-300 !bg-mist/30 !px-3.5 !text-[14px] !font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-ink-700 flex items-center justify-between">
                  <span>Przy jakiej ulicy mieszkasz?</span>
                  {street && (
                    <span className="rounded-full bg-sand-100 px-2 py-0.2 text-[10px] font-bold text-ink">
                      ul. {street.name}
                    </span>
                  )}
                </label>

                {!isSelectedGmina ? (
                  <>
                    {/* 3 polecane / popularne ulice */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {topStreets.map((s) => {
                        const active = street?.name === s.name;
                        return (
                          <button
                            key={s.name}
                            type="button"
                            onClick={() => setStreet(s)}
                            className={cn(
                              'rounded-xl p-2 text-left transition-all active:scale-95 border cursor-pointer',
                              active
                                ? 'bg-ink text-white border-ink shadow-2xs'
                                : 'bg-mist/40 text-ink border-transparent hover:bg-mist',
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <p className="truncate text-[11.5px] font-bold">{s.name}</p>
                              <span
                                className={cn(
                                  'rounded px-1 text-[9px] font-bold',
                                  active
                                    ? 'bg-coral text-ink'
                                    : s.neighbors > 0
                                    ? 'bg-coral-100 text-coral-800'
                                    : 'bg-sand-100 text-sand-700',
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
                      placeholder="Wyszukaj ulicę (np. Warszawska, Prusa, Polna)…"
                      className="h-10 w-full rounded-xl border border-mist-300 bg-mist/30 px-3 text-[13px] font-medium text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10 transition-all mt-1"
                    />

                    {filteredStreets.length > 0 ? (
                      <ul className="max-h-32 overflow-y-auto rounded-xl border border-mist-300 bg-white shadow-sm divide-y divide-mist">
                        {filteredStreets.map((s) => (
                          <li key={s.name}>
                            <button
                              type="button"
                              onClick={() => {
                                setStreet(s);
                                setQuery('');
                              }}
                              className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-mist/50 text-[12.5px] font-bold text-ink cursor-pointer"
                            >
                              <span>ul. {s.name}</span>
                              <span
                                className={cn(
                                  'text-[10px]',
                                  s.neighbors > 0
                                    ? 'text-ink-500 font-semibold'
                                    : 'text-coral-600 font-bold italic',
                                )}
                              >
                                {formatNeighborCount(s.neighbors)}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : query.trim() ? (
                      <div className="rounded-xl border border-mist-300 bg-white p-2">
                        <button
                          type="button"
                          onClick={() => {
                            const qClean = query.trim();
                            const customStreet: Street = {
                              name: qClean,
                              as: `z ${qClean}`,
                              neighbors: 0,
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
                    <input
                      value={query}
                      onChange={(e) => {
                        const q = e.target.value;
                        setQuery(q);
                        if (q.trim()) {
                          setStreet({
                            name: `${q.trim()}, ${city}`,
                            as: `z ${q.trim()} (${city})`,
                            neighbors: 0,
                          });
                        } else {
                          const asForm = gminaLocalityAs[city] || `z ${city}`;
                          setStreet({
                            name: city,
                            as: asForm,
                            neighbors: 0,
                          });
                        }
                      }}
                      placeholder="Nazwa ulicy lub sołectwa (opcjonalnie)"
                      className="h-10 w-full rounded-xl border border-mist-300 bg-mist/30 px-3 text-[13px] font-medium text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10 transition-all"
                    />
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={!street}
                onClick={() => setRegisterStep(3)}
                className="w-full h-11 rounded-xl bg-ink text-white font-bold text-[14px] shadow-sm hover:bg-ink-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer mt-2"
              >
                <span>Dalej: Podsumowanie tożsamości</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* --- KROK 3: TOŻSAMOŚĆ & AWATAR 3D --- */}
          {registerStep === 3 && (
            <div className="space-y-4">
              {/* Podgląd karty tożsamości */}
              <div className="rounded-2xl bg-mist/30 p-4 border border-mist-300 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={avatarUrl(avatarSeed)}
                    alt="Awatar"
                    className="h-13 w-13 rounded-2xl bg-sand-100 object-cover ring-2 ring-white shadow-2xs shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="inline-block rounded-full bg-coral-100 px-2 py-0.2 text-[9px] font-extrabold text-coral-800">
                      TWOJA TOŻSAMOŚĆ W APLIKACJI
                    </span>
                    <p className="font-display text-[15px] font-bold text-ink truncate mt-0.5">
                      {displayName} {street?.as}
                    </p>
                    <p className="text-[11.5px] text-ink-500 truncate">
                      ul. {street?.name} · {city}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRerollAvatar}
                  title="Wylosuj inny awatar"
                  className="flex items-center gap-1 rounded-xl bg-white border border-mist-300 px-2.5 py-1.5 text-[11px] font-bold text-ink shadow-2xs hover:bg-sand-50 active:scale-95 transition-all cursor-pointer shrink-0 ml-2"
                >
                  <Dices className="h-3.5 w-3.5 text-coral" />
                  <span>Zmień</span>
                </button>
              </div>

              {/* Informacja o bezpieczeństwie */}
              <div className="rounded-2xl bg-sand-50 p-3 border border-sand-200 text-[11.5px] text-sand-800 leading-relaxed flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-sand-700 shrink-0 mt-0.5" />
                <span>
                  Sąsiedzi widzą wyłącznie Twoje <b>imię i nazwę ulicy</b>. Twój adres e-mail oraz dane logowania są w pełni poufne i szyfrowane (AES-256).
                </span>
              </div>

              <button
                type="button"
                onClick={handleFinishRegistration}
                className="w-full h-12 rounded-xl bg-ink text-white font-bold text-[14px] shadow-sm hover:bg-ink-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Utwórz konto mieszkańca</span>
              </button>
            </div>
          )}

          {/* Dolny link powrotny do logowania */}
          <div className="mt-5 pt-4 border-t border-mist-200 text-center">
            <span className="text-[12.5px] text-ink-500">Masz już konto? </span>
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setLoginError('');
              }}
              className="text-[12.5px] font-bold text-ink hover:text-coral transition-colors cursor-pointer underline underline-offset-2"
            >
              Zaloguj się
            </button>
          </div>
        </div>
      )}

      {/* Stopka pod kartą */}
      <footer className="mt-6 text-center select-none text-[11px] text-ink-400 flex items-center gap-1.5 relative z-10">
        <Lock className="h-3 w-3" />
        <span>Bezpieczne połączenie SSL · RODO AES-256 · mójMińsk.app</span>
      </footer>
    </div>
  );
}
