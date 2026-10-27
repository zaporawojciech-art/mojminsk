import { QrCode } from 'lucide-react';

/**
 * Infografika dla użytkowników wchodzących przez komputer (Desktop ≥ 768px).
 * Platforma mójMińsk działa wyłącznie na urządzeniach mobilnych.
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
      className="fixed inset-0 z-[10000] hidden md:flex flex-col items-center justify-between overflow-hidden bg-ink px-6 py-8 text-white select-none"
    >
      {/* Tło: subtelna siatka + kolorowe poświaty z palety mójMińsk */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #FFFFFF 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-coral/20 blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-36 left-1/4 h-[320px] w-[480px] rounded-full bg-sky/15 blur-[110px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-36 right-1/4 h-[320px] w-[480px] rounded-full bg-sand/15 blur-[110px]"
        aria-hidden
      />

      {/* GÓRA: Logo marki */}
      <header className="relative z-10 flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2 backdrop-blur-md">
        <span className="font-display text-[20px] font-bold tracking-tight text-white">
          mój<span className="text-coral">Mińsk</span>
          <span className="text-sand">.</span>
        </span>
        <span className="h-3.5 w-[1px] bg-white/15" aria-hidden />
        <span className="text-[11.5px] font-semibold text-white/65">
          Mińsk Mazowiecki i Gmina
        </span>
      </header>

      {/* ŚRODEK: Główna Infografika Wektorowa (Desktop ✕ -> Smartfon ✓) + Komunikat */}
      <div className="relative z-10 my-auto flex w-full max-w-[760px] flex-col items-center text-center">
        {/* Ilustracja wektorowa SVG: Komputer przekreślony vs Smartfon aktywny */}
        <div className="relative mb-7 flex items-center justify-center">
          <svg
            viewBox="0 0 460 190"
            className="h-[168px] w-auto overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* --- LEWA STRONA: Laptop / Desktop (Niedostępny) --- */}
            <g opacity="0.48" transform="translate(20, 32)">
              {/* Ekran monitora */}
              <rect
                x="14"
                y="8"
                width="132"
                height="86"
                rx="12"
                fill="#2A2738"
                stroke="#6B6879"
                strokeWidth="3"
              />
              {/* Pasek okna */}
              <circle cx="28" cy="21" r="3" fill="#6B6879" />
              <circle cx="38" cy="21" r="3" fill="#6B6879" />
              <circle cx="48" cy="21" r="3" fill="#6B6879" />
              {/* Linie szkieletu na monitorze */}
              <rect x="28" y="36" width="60" height="8" rx="4" fill="#3B3848" />
              <rect x="28" y="52" width="104" height="6" rx="3" fill="#3B3848" />
              <rect x="28" y="64" width="84" height="6" rx="3" fill="#3B3848" />
              {/* Podstawa laptopa */}
              <path
                d="M2 96H158C161.314 96 164 98.6863 164 102C164 106.418 160.418 110 156 110H4C-0.418278 110 -4 106.418 -4 102C-4 98.6863 -1.31371 96 2 96Z"
                fill="#3B3848"
              />
              {/* Plakietka ✕ */}
              <circle
                cx="142"
                cy="14"
                r="16"
                fill="#1F1D2B"
                stroke="#F26659"
                strokeWidth="2.5"
              />
              <path
                d="M137 9L147 19M147 9L137 19"
                stroke="#F26659"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Podpis pod laptopem */}
              <text
                x="80"
                y="134"
                textAnchor="middle"
                fill="#918EA0"
                fontSize="11"
                fontWeight="700"
                letterSpacing="0.06em"
              >
                KOMPUTER (BRAK)
              </text>
            </g>

            {/* --- ŚRODEK: Zakrzywiona strzałka transformacji --- */}
            <g transform="translate(198, 72)">
              <path
                d="M4 22C22 6 44 6 62 22"
                stroke="#EBC999"
                strokeWidth="3"
                strokeDasharray="5 5"
                strokeLinecap="round"
              />
              <path
                d="M55 14L64 23L53 27"
                stroke="#EBC999"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            {/* --- PRAWA STRONA: Smartfon (Aktywny) --- */}
            <g transform="translate(278, 8)">
              {/* Dekoracyjne kółka wokół telefonu */}
              <circle cx="122" cy="28" r="24" fill="#EBC999" fillOpacity="0.22" />
              <circle cx="14" cy="118" r="20" fill="#8CA9D3" fillOpacity="0.25" />

              {/* Obudowa smartfona */}
              <rect
                x="24"
                y="4"
                width="88"
                height="144"
                rx="22"
                fill="#F0EFF4"
                stroke="#1F1D2B"
                strokeWidth="5"
              />
              {/* Górny header koralowy na ekranie telefonu */}
              <path
                d="M29 24C29 15.7157 35.7157 9 44 9H92C100.284 9 107 15.7157 107 24V58C107 64.6274 101.627 70 95 70H41C34.3726 70 29 64.6274 29 58V24Z"
                fill="#F26659"
              />
              {/* Głośnik / Dynamic Island */}
              <rect x="54" y="15" width="28" height="5" rx="2.5" fill="#1F1D2B" />

              {/* Ikona pinezki lokalizacji na ekranie */}
              <circle cx="68" cy="43" r="13" fill="#FFFFFF" />
              <circle cx="68" cy="43" r="5" fill="#F26659" />

              {/* Karty wewnątrz ekranu telefonu */}
              <rect x="37" y="78" width="62" height="20" rx="7" fill="#FFFFFF" />
              <circle cx="47" cy="88" r="5" fill="#EBC999" />
              <rect x="56" y="84" width="34" height="4" rx="2" fill="#1F1D2B" />
              <rect x="56" y="91" width="22" height="3" rx="1.5" fill="#918EA0" />

              <rect x="37" y="104" width="29" height="22" rx="7" fill="#8CA9D3" />
              <rect x="70" y="104" width="29" height="22" rx="7" fill="#EBC999" />

              {/* Dolna kapsuła nawigacji */}
              <rect x="43" y="133" width="50" height="8" rx="4" fill="#1F1D2B" />

              {/* Zielony znaczek aktywności ✓ */}
              <circle
                cx="108"
                cy="18"
                r="16"
                fill="#10B981"
                stroke="#1F1D2B"
                strokeWidth="3"
              />
              <path
                d="M101.5 18.5L106 23L115 14"
                stroke="#FFFFFF"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Podpis pod smartfonem */}
              <text
                x="68"
                y="168"
                textAnchor="middle"
                fill="#EBC999"
                fontSize="11"
                fontWeight="800"
                letterSpacing="0.06em"
              >
                TYLKO SMARTFON
              </text>
            </g>
          </svg>
        </div>

        {/* Pigułka statusu */}
        <div className="inline-flex items-center gap-2 rounded-full bg-coral/15 border border-coral/35 px-4 py-1.5 text-[12px] font-extrabold uppercase tracking-wider text-coral-200">
          <span className="h-2 w-2 rounded-full bg-coral animate-ping" />
          <span>Aplikacja wyłącznie mobilna (iOS & Android)</span>
        </div>

        {/* Główny nagłówek */}
        <h1 className="mt-4 font-display text-[36px] lg:text-[44px] font-bold leading-[1.08] tracking-tight text-white">
          Platforma dostępna wyłącznie{' '}
          <span className="text-sand">na urządzeniach mobilnych.</span>
        </h1>

        <p className="mt-3 max-w-[540px] text-[15px] leading-relaxed text-white/70">
          <strong className="font-bold text-white">mójMińsk</strong> został
          zaprojektowany od podstaw jako aplikacja kieszonkowa do obsługi w
          telefonie. Otwórz stronę na swoim smartfonie, aby korzystać z
          platformy.
        </p>

        {/* Infografika krok po kroku + Kod QR w jednym pasie */}
        <div className="mt-8 grid w-full grid-cols-[1fr_auto] items-center gap-5 rounded-[32px] border border-white/12 bg-white/[0.06] p-5 text-left backdrop-blur-md">
          {/* 3 kroki infografiki */}
          <div className="grid grid-cols-3 gap-4 pr-2">
            <div className="rounded-2xl bg-white/[0.05] p-3.5 border border-white/10">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-coral font-display text-[13px] font-bold text-ink">
                1
              </span>
              <p className="mt-2.5 font-display text-[14px] font-bold text-white leading-snug">
                Weź telefon do ręki
              </p>
              <p className="mt-1 text-[12px] text-white/60 leading-snug">
                Działa na każdym smartfonie z systemem iOS lub Android.
              </p>
            </div>

            <div className="rounded-2xl bg-white/[0.05] p-3.5 border border-white/10">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-sand font-display text-[13px] font-bold text-ink">
                2
              </span>
              <p className="mt-2.5 font-display text-[14px] font-bold text-white leading-snug">
                Zeskanuj kod QR
              </p>
              <p className="mt-1 text-[12px] text-white/60 leading-snug">
                Skieruj aparat na kod obok lub wpisz{' '}
                <strong className="text-sand font-bold">mojminsk.app</strong>.
              </p>
            </div>

            <div className="rounded-2xl bg-white/[0.05] p-3.5 border border-white/10">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-sky font-display text-[13px] font-bold text-ink">
                3
              </span>
              <p className="mt-2.5 font-display text-[14px] font-bold text-white leading-snug">
                Dołącz do ulicy
              </p>
              <p className="mt-1 text-[12px] text-white/60 leading-snug">
                Wybierz swoją ulicę w Mińsku lub miejscowość w Gminie.
              </p>
            </div>
          </div>

          {/* Karta z kodem QR */}
          <div className="flex items-center gap-3.5 rounded-2xl bg-white p-3 text-ink shadow-xl">
            <div className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-mist/50 p-1">
              <img
                src={qrSrc}
                alt="Kod QR do otwarcia mójMińsk na telefonie"
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              <QrCode className="absolute -z-10 h-8 w-8 text-ink-400" aria-hidden />
            </div>
            <div className="pr-2">
              <span className="inline-block rounded-md bg-coral/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-coral-700">
                Aparat telefonu
              </span>
              <p className="mt-1 font-display text-[14px] font-bold leading-tight text-ink">
                Zeskanuj i otwórz
              </p>
              <p className="mt-0.5 text-[11.5px] font-bold text-ink-500">
                mojminsk.app
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DÓŁ: Stopka informacyjna */}
      <footer className="relative z-10 text-[12px] font-medium text-white/45">
        mójMińsk.app · Lokalna platforma sąsiedzka wyłącznie na smartfony
      </footer>
    </div>
  );
}
