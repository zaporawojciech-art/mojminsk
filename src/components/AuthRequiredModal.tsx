import { Lock, ShieldAlert, Sparkles, X } from 'lucide-react';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: () => void;
  onLogin: () => void;
  actionTitle?: string;
  actionDesc?: string;
}

export function AuthRequiredModal({
  isOpen,
  onClose,
  onRegister,
  onLogin,
  actionTitle = 'Wymagana rejestracja',
  actionDesc = 'Ta funkcja jest dostępna wyłącznie dla zarejestrowanych mieszkańców Mińska Mazowieckiego.',
}: AuthRequiredModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-5 backdrop-blur-xs animate-in fade-in duration-150 select-none"
    >
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-mist-300 text-center animate-in zoom-in-95 duration-150 space-y-4">
        {/* Zamknij 'X' */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Zamknij"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-mist text-ink-500 hover:text-ink active:scale-95 transition-transform"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Ikona Tarczy / Kłódki */}
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-coral-100 text-coral-700 shadow-sm">
          <ShieldAlert className="h-8 w-8" />
        </div>

        {/* Treść */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1 rounded-full bg-sand-100 px-2.5 py-0.5 text-[11px] font-extrabold text-sand-800">
            <Sparkles className="h-3 w-3" />
            Społeczność mójMińsk
          </div>
          <h3 className="font-display text-[20px] font-bold text-ink leading-tight">
            {actionTitle}
          </h3>
          <p className="text-[13px] text-ink-600 leading-relaxed pt-1">
            {actionDesc}
          </p>
        </div>

        {/* RODO / Zasada sąsiedzka */}
        <div className="rounded-2xl bg-mist/60 p-3 text-[11.5px] text-ink-500 text-left flex items-start gap-2 border border-mist-200">
          <Lock className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            W aplikacji nie ma anonimowych kont ani spamu. Po rejestracji inni widzą Cię bezpiecznie
            jako <b>Imię z ulicy</b> (np. Wojtek ze Spacerowej).
          </span>
        </div>

        {/* Przyciski Akcji */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => {
              onClose();
              onRegister();
            }}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-[14.5px] font-bold text-white shadow-sm hover:bg-ink-700 active:scale-[0.98] transition-all"
          >
            Zarejestruj się (1 minuta)
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onLogin();
            }}
            className="flex h-11 w-full items-center justify-center rounded-2xl border border-mist-300 bg-mist/40 text-[13.5px] font-bold text-ink hover:bg-mist active:scale-[0.98] transition-all"
          >
            Masz już konto? Zaloguj się
          </button>

          <button
            type="button"
            onClick={onClose}
            className="pt-1 text-[12px] font-semibold text-ink-400 hover:text-ink transition-colors"
          >
            Przeglądaj dalej jako gość
          </button>
        </div>
      </div>
    </div>
  );
}
