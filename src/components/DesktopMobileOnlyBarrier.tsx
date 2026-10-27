import {
  MapPin,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from 'lucide-react';

/**
 * Bariera / Infografika dla użytkowników wchodzących przez komputer (Desktop ≥ 768px).
 * Platforma mójMińsk działa wyłącznie na urządzeniach mobilnych.
 */
export function DesktopMobileOnlyBarrier() {
  const appUrl =
    typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? window.location.origin
      : 'https://mojminsk.app';

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&color=1F1D2B&bgcolor=FFFFFF&data=${encodeURIComponent(
    appUrl,
  )}`;

  return (
    <div
      role="region"
      aria-label="Aplikacja dostępna wyłącznie na urządzeniach mobilnych"
      className="fixed inset-0 z-[10000] hidden md:flex items-center justify-center overflow-hidden bg-mist p-6 lg:p-10 select-none"
    >
      {/* Dekoracyjne koła w tle (paleta mójMińsk) */}
      <div
        className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-coral/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-sky/25 blur-3xl"
        aria-hidden
      />

      {/* Główna karta infografiki */}
      <div className="relative z-10 grid w-full max-w-[940px] grid-cols-[1.05fr_0.95fr] overflow-hidden rounded-[40px] bg-white shadow-2xl border border-mist-300">
        {/* LEWA STRONA: Komunikat i wartości platformy */}
        <div className="flex flex-col justify-between p-10 lg:p-12">
          <div>
            {/* Logo mójMińsk */}
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-coral font-display text-[20px] font-bold text-ink shadow-coral">
                mM
              </div>
              <div>
                <p className="font-display text-[23px] font-bold tracking-tight text-ink leading-none">
                  mójMińsk<span className="text-coral">.</span>
                </p>
                <p className="mt-0.5 text-[11.5px] font-semibold text-ink-400">
                  Mińsk Mazowiecki i Gmina
                </p>
              </div>
            </div>

            {/* Badge Mobile-Only */}
            <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-coral-100 px-3.5 py-1.5 text-[12px] font-extrabold text-coral-800">
              <Smartphone className="h-4 w-4 text-coral-700" aria-hidden />
              <span>Tylko na smartfonach (iOS & Android)</span>
            </div>

            {/* Nagłówek główny */}
            <h1 className="mt-4 font-display text-[36px] lg:text-[40px] font-bold leading-[1.06] tracking-tight text-ink">
              Platforma dostępna wyłącznie na urządzeniach mobilnych.
            </h1>

            <p className="mt-3.5 text-[14.5px] leading-relaxed text-ink-500">
              <strong className="font-bold text-ink">mójMińsk</strong> to kieszonkowa aplikacja sąsiedzka zaprojektowana specjalnie na ekrany telefonów. Otwórz tę stronę na swoim smartfonie, aby dołączyć do sąsiadów ze swojej ulicy.
            </p>
          </div>

          {/* Dolny blok: QR Kod + instrukcja */}
          <div className="mt-8 flex items-center gap-5 rounded-3xl bg-mist/70 p-4 border border-mist-300">
            <div className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white p-2 shadow-card">
              <img
                src={qrSrc}
                alt="Kod QR do otwarcia aplikacji mójMińsk na telefonie"
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              <QrCode className="absolute -z-10 h-10 w-10 text-ink-400" aria-hidden />
            </div>

            <div className="min-w-0">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-coral-700">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Szybkie przejście na telefon
              </span>
              <p className="mt-0.5 font-display text-[16px] font-bold text-ink leading-snug">
                Zeskanuj kod QR aparatem telefonu
              </p>
              <p className="mt-1 text-[12.5px] text-ink-500 leading-snug">
                Lub wpisz w przeglądarce w telefonie adres:{' '}
                <strong className="font-bold text-ink underline decoration-coral decoration-2 underline-offset-2">
                  mojminsk.app
                </strong>
              </p>
            </div>
          </div>
        </div>

        {/* PRAWA STRONA: Wizualna infografika smartfona mójMińsk */}
        <div className="relative flex flex-col items-center justify-center overflow-hidden bg-coral p-10 text-ink">
          {/* Geometryczne kształty w tle */}
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-sand/85" aria-hidden />
          <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-sky/80" aria-hidden />
          <div className="absolute right-12 bottom-16 h-16 w-16 rounded-full bg-white/40" aria-hidden />

          {/* Ilustracja / Makieta telefonu */}
          <div className="relative z-10 w-[260px] rounded-[40px] border-[7px] border-ink bg-mist p-3.5 shadow-[0_28px_60px_-15px_rgba(31,29,43,0.45)]">
            {/* Dynamic Island / Głośnik */}
            <div className="mx-auto mb-3 h-4 w-20 rounded-full bg-ink" aria-hidden />

            {/* Wnętrze ekranu makiety */}
            <div className="space-y-2.5">
              {/* Mini Karta Pogody */}
              <div className="rounded-3xl bg-sky p-3.5 text-ink shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-ink/75">
                    <MapPin className="h-3 w-3" />
                    Mińsk Mazowiecki
                  </span>
                  <span className="rounded-full bg-white/80 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700">
                    PM2.5 Dobre
                  </span>
                </div>
                <p className="mt-1 font-display text-[28px] font-bold leading-none">19°C</p>
                <p className="mt-0.5 text-[10.5px] font-semibold text-ink/80">
                  Słonecznie · Odczuwalna 18°
                </p>
              </div>

              {/* Mini Karta Tożsamości Sąsiedzkiej */}
              <div className="flex items-center gap-2.5 rounded-2xl bg-white p-2.5 shadow-xs">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sand font-display text-[13px] font-bold text-ink">
                  W
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="truncate text-[11.5px] font-bold text-ink">
                      Wojtek ze Spacerowej
                    </p>
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  </div>
                  <p className="truncate text-[10px] text-ink-400">
                    Zweryfikowany listem pocztowym
                  </p>
                </div>
              </div>

              {/* Mini Moduły Siatka */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-sand p-2.5">
                  <p className="text-[9.5px] font-extrabold uppercase text-ink/60">Sklep</p>
                  <p className="mt-0.5 font-display text-[12px] font-bold text-ink leading-tight">
                    Motylek Market
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-2.5">
                  <p className="text-[9.5px] font-extrabold uppercase text-coral">ZDiTM</p>
                  <p className="mt-0.5 font-display text-[12px] font-bold text-ink leading-tight">
                    M2 · za 4 min
                  </p>
                </div>
              </div>

              {/* Mini Bottom Nav */}
              <div className="mt-1 flex items-center justify-between rounded-full bg-ink px-3 py-2 text-white">
                <span className="rounded-full bg-coral px-2.5 py-1 text-[9.5px] font-extrabold text-ink">
                  Start
                </span>
                <span className=" h-1.5 w-1.5 rounded-full bg-white/40" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
              </div>
            </div>
          </div>

          <p className="relative z-10 mt-5 text-center text-[12px] font-bold text-ink/80">
            Zaprojektowano w 100% pod obsługę jedną ręką
          </p>
        </div>
      </div>
    </div>
  );
}
