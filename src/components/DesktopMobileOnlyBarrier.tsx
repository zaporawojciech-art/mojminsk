import {
  Bell,
  Check,
  Lock,
  MapPin,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from 'lucide-react';

/**
 * Widok informacyjny dla użytkowników wchodzących przez komputer (Desktop ≥ 768px).
 * Zaprojektowany w 100% zgodnie z systemem UI/CSS platformy mójMińsk
 * (OnboardingScreen, InstallAppModal, AuthRequiredModal).
 */
export function DesktopMobileOnlyBarrier() {
  const appUrl =
    typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? window.location.origin
      : 'https://mojminsk.app';

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=6&color=1F1D2B&bgcolor=FFFFFF&data=${encodeURIComponent(
    appUrl,
  )}`;

  return (
    <div
      role="region"
      aria-label="Platforma dostępna wyłącznie na urządzeniach mobilnych"
      className="fixed inset-0 z-[10000] hidden md:flex items-center justify-center overflow-y-auto bg-mist p-6 select-none"
    >
      {/* Główny kontener w proporcjach i stylu platformy mójMińsk */}
      <div className="w-full max-w-[460px] overflow-hidden rounded-[36px] border border-mist-300 bg-white shadow-2xl">
        {/* 1. Header koralowy — identyczny styl jak w OnboardingScreen */}
        <header className="relative overflow-hidden rounded-b-[36px] bg-coral px-6 pb-6 pt-6 shadow-sm">
          <div
            className="absolute -right-16 top-6 h-52 w-52 rounded-full bg-sand/90"
            aria-hidden
          />
          <div
            className="absolute -right-4 top-32 h-24 w-24 rounded-full bg-sky"
            aria-hidden
          />
          <div
            className="absolute right-28 top-4 h-10 w-10 rounded-full bg-mist"
            aria-hidden
          />

          <div className="relative flex items-center justify-between">
            <p className="font-display text-[22px] font-bold tracking-tight text-ink">
              mój<span className="text-white">Mińsk</span>
              <span className="text-sand-600">.</span>
            </p>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white px-3 py-1 text-[11.5px] font-extrabold text-ink shadow-sm">
              <Smartphone className="h-3.5 w-3.5 text-coral-700" aria-hidden />
              <span>Tylko Mobile</span>
            </span>
          </div>

          <h1 className="relative mt-5 max-w-[300px] font-display text-[30px] font-bold leading-[1.06] tracking-tight text-ink">
            Platforma wyłącznie na telefon.
          </h1>
          <p className="relative mt-2 max-w-[290px] text-[13.5px] font-medium leading-snug text-ink/80">
            Aplikacja mójMińsk jest dostępna wyłącznie na urządzeniach
            mobilnych (iOS oraz Android).
          </p>
        </header>

        {/* 2. Zawartość karty — styl identyczny z InstallAppModal i AuthRequiredModal */}
        <div className="space-y-4 px-6 pb-6 pt-5">
          {/* 3 kafelki cech (wzorzec z InstallAppModal) */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-mist/70 p-2.5 text-center">
              <span className="mx-auto grid h-8 w-8 place-items-center rounded-xl bg-coral-100 text-coral-700">
                <Smartphone className="h-4 w-4" aria-hidden />
              </span>
              <p className="mt-1.5 font-display text-[12px] font-bold text-ink">
                W kieszeni
              </p>
              <p className="text-[10px] text-ink-400">iOS & Android</p>
            </div>

            <div className="rounded-2xl bg-mist/70 p-2.5 text-center">
              <span className="mx-auto grid h-8 w-8 place-items-center rounded-xl bg-sky-100 text-sky-700">
                <MapPin className="h-4 w-4" aria-hidden />
              </span>
              <p className="mt-1.5 font-display text-[12px] font-bold text-ink">
                Mińsk i Gmina
              </p>
              <p className="text-[10px] text-ink-400">Lokalne ulice</p>
            </div>

            <div className="rounded-2xl bg-mist/70 p-2.5 text-center">
              <span className="mx-auto grid h-8 w-8 place-items-center rounded-xl bg-sand-100 text-ink">
                <ShieldCheck className="h-4 w-4" aria-hidden />
              </span>
              <p className="mt-1.5 font-display text-[12px] font-bold text-ink">
                Bez spamu
              </p>
              <p className="text-[10px] text-ink-400">Zweryfikowani</p>
            </div>
          </div>

          {/* Karta z kodem QR i krokami (wzorzec z InstallAppModal: bg-sand-100/60 + białe karty shadow-card) */}
          <div className="rounded-3xl border border-mist-300 bg-sand-100/60 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
                  Jak otworzyć aplikację?
                </p>
                <p className="mt-0.5 font-display text-[15px] font-bold text-ink">
                  Przejdź na swój smartfon:
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-extrabold text-sand-700 shadow-xs">
                <Sparkles className="h-3 w-3" aria-hidden />
                30 sekund
              </span>
            </div>

            {/* Karta QR wewnątrz boksu */}
            <div className="mt-3 flex items-center gap-3.5 rounded-2xl bg-white p-3 shadow-card">
              <div className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-mist-200 bg-mist/40 p-1.5">
                <img
                  src={qrSrc}
                  alt="Kod QR do otwarcia aplikacji mójMińsk na telefonie"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
                <QrCode
                  className="absolute -z-10 h-8 w-8 text-ink-400"
                  aria-hidden
                />
              </div>

              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-coral-100 px-2 py-0.5 text-[10px] font-extrabold text-coral-700">
                  Krok 1 · Aparat
                </span>
                <p className="mt-1 font-display text-[14px] font-bold leading-snug text-ink">
                  Zeskanuj kod QR telefonem
                </p>
                <p className="mt-0.5 text-[12px] leading-snug text-ink-500">
                  Lub wpisz w przeglądarce mobilnej:{' '}
                  <b className="text-ink">mojminsk.app</b>
                </p>
              </div>
            </div>

            {/* Kroki 2 i 3 */}
            <ol className="mt-2.5 space-y-2 text-[12.5px] text-ink-700">
              <li className="flex items-center gap-3 rounded-2xl bg-white p-2.5 shadow-card">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-sky-100 text-sky-700">
                  <Bell className="h-3.5 w-3.5" aria-hidden />
                </span>
                <span className="leading-snug">
                  <b>Dodaj do ekranu głównego</b>, aby korzystać w pełnym ekranie.
                </span>
              </li>

              <li className="flex items-center gap-3 rounded-2xl bg-white p-2.5 shadow-card">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-sand text-ink">
                  <Check className="h-3.5 w-3.5" aria-hidden />
                </span>
                <span className="leading-snug">
                  Wybierz swoją <b>ulicę w Mińsku</b> lub miejscowość w Gminie.
                </span>
              </li>
            </ol>
          </div>

          {/* Dolna notka informacyjna (wzorzec z AuthRequiredModal) */}
          <div className="flex items-start gap-2.5 rounded-2xl border border-mist-200 bg-mist/60 p-3 text-left text-[11.5px] text-ink-500">
            <Lock
              className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
              aria-hidden
            />
            <span>
              Brak wersji komputerowej jest celowy — aplikacja <b className="text-ink">mójMińsk</b>{' '}
              służy do szybkiego kontaktu sąsiedzkiego, rozkładów ZDiTM i zakupów pod ręką.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
