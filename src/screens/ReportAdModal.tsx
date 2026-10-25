import { useState } from 'react';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { NativeHeader, cn } from '../components/ui';
import type { Ad } from '../data/mockData';

interface ReportAdModalProps {
  ad: Ad;
  onClose: () => void;
  isClosing?: boolean;
}

const reportReasons = [
  'Nieaktualne / przedmiot już sprzedany',
  'Podejrzenie oszustwa lub spamu',
  'Nieodpowiednie treści lub zdjęcia',
  'Błędna kategoria lub zły opis',
  'Brak kontaktu ze sprzedającym',
];

export function ReportAdModal({ ad, onClose, isClosing = false }: ReportAdModalProps) {
  const [selectedReason, setSelectedReason] = useState(reportReasons[0]);
  const [details, setDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col bg-mist select-none',
        isClosing ? 'native-screen-exit' : 'native-screen-slide',
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden bg-mist">
        {/* Native Top Navigation Bar */}
        <NativeHeader title="Zgłoś ogłoszenie" backLabel="Wróć" onBack={onClose} />

        {isSubmitted ? (
          <div className="flex-1 flex flex-col justify-center items-center p-6 text-center space-y-4">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="font-display text-[22px] font-bold text-ink">Dziękujemy za zgłoszenie</h3>
            <p className="text-[13.5px] text-ink-500 max-w-[280px]">
              Administratorzy platformy <b>mójMińsk</b> przeanalizują ogłoszenie w ciągu kilku godzin. Dzięki Twojej czujności nasza społeczność jest bezpieczna.
            </p>
            <button
              onClick={onClose}
              className="mt-4 flex h-12 w-full max-w-[260px] items-center justify-center rounded-full bg-ink text-[14px] font-bold text-white transition-transform active:scale-95"
            >
              Zamknij
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-3.5">
              <div className="rounded-3xl bg-white p-4 shadow-card">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400">Zgłaszane ogłoszenie</p>
                <p className="font-semibold text-[14px] text-ink truncate mt-0.5">{ad.title}</p>
                <p className="text-[12px] text-ink-500">Wystawca: {ad.author} · ul. {ad.street}</p>
              </div>

              <div className="rounded-3xl bg-white p-4 shadow-card">
                <label className="text-[12px] font-bold uppercase tracking-wider text-ink-400">
                  Wybierz powód zgłoszenia
                </label>
                <div className="mt-2.5 space-y-2">
                  {reportReasons.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setSelectedReason(reason)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-2xl border p-3.5 text-left text-[13px] font-semibold transition-all',
                        selectedReason === reason
                          ? 'border-ink bg-mist text-ink ring-1 ring-ink'
                          : 'border-mist bg-white text-ink-600 hover:bg-mist/50',
                      )}
                    >
                      <span>{reason}</span>
                      <span
                        className={cn(
                          'h-4 w-4 rounded-full border-2 grid place-items-center',
                          selectedReason === reason ? 'border-ink bg-ink text-white text-[10px]' : 'border-mist',
                        )}
                      >
                        {selectedReason === reason && '✓'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-white p-4 shadow-card">
                <label className="block">
                  <span className="text-[12px] font-bold text-ink">
                    Dodatkowe informacje <span className="text-ink-400 font-normal">(opcjonalnie)</span>
                  </span>
                  <textarea
                    rows={3}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Napisz krótko, na czym polega problem..."
                    className="mt-1.5 w-full rounded-2xl border border-mist-300 bg-mist/50 p-3.5 text-[13.5px] outline-none focus:border-ink focus:bg-white"
                  />
                </label>
              </div>
            </div>

            <div className="border-t border-mist bg-white px-5 py-3 pb-[max(env(safe-area-inset-bottom),14px)] shrink-0 shadow-float">
              <button
                type="submit"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-coral text-[14px] font-bold text-ink shadow-coral transition-transform active:scale-95"
              >
                <ShieldAlert className="h-4 w-4" />
                Prześlij zgłoszenie do moderacji
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
