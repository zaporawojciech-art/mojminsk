import { QrCode, Smartphone } from 'lucide-react';

/**
 * Minimalistyczny, subtelny ekran informacyjny dla użytkowników wchodzących przez Desktop (≥ 768px).
 */
export function DesktopMobileOnlyBarrier() {
  const appUrl =
    typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? window.location.origin
      : 'https://mojminsk.app';

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=4&color=1F1D2B&bgcolor=FFFFFF&data=${encodeURIComponent(
    appUrl,
  )}`;

  return (
    <div
      role="region"
      aria-label="Platforma dostępna wyłącznie na urządzeniach mobilnych"
      className="fixed inset-0 z-[10000] hidden md:flex flex-col items-center justify-center bg-mist p-6 select-none"
    >
      <div className="w-full max-w-[380px] rounded-3xl border border-mist-300/80 bg-white p-8 text-center shadow-card">
        {/* Subtelne logo */}
        <p className="font-display text-[18px] font-bold tracking-tight text-ink">
          mój<span className="text-coral">Mińsk</span>
          <span className="text-sand-600">.</span>
        </p>

        {/* Ikona smartfona */}
        <div className="mx-auto mt-6 grid h-14 w-14 place-items-center rounded-2xl bg-coral-100 text-coral-700">
          <Smartphone className="h-6 w-6" aria-hidden />
        </div>

        {/* Nagłówek i krótki komunikat */}
        <h1 className="mt-5 font-display text-[22px] font-bold leading-snug tracking-tight text-ink">
          Tylko na telefonie
        </h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-500">
          Platforma jest dostępna wyłącznie na urządzeniach mobilnych. Otwórz
          stronę na smartfonie, aby korzystać z aplikacji.
        </p>

        {/* Dyskretny boks z kodem QR i adresem */}
        <div className="mt-6 flex items-center gap-3.5 rounded-2xl border border-mist-200 bg-mist/60 p-3 text-left">
          <div className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-white p-1.5 shadow-xs">
            <img
              src={qrSrc}
              alt="Kod QR mójMińsk"
              className="h-full w-full object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
            <QrCode
              className="absolute -z-10 h-6 w-6 text-ink-400"
              aria-hidden
            />
          </div>

          <div className="min-w-0">
            <p className="text-[12.5px] font-bold text-ink">
              Zeskanuj aparatem telefonu
            </p>
            <p className="mt-0.5 text-[12px] text-ink-500">
              lub wpisz <span className="font-semibold text-ink">mojminsk.app</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
