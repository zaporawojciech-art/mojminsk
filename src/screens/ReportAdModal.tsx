import { useState } from 'react';
import { CheckCircle2, ShieldAlert, X } from 'lucide-react';
import { cn } from '../components/ui';
import type { Ad } from '../data/mockData';

interface ReportAdModalProps {
  ad: Ad;
  onClose: () => void;
}

const reportReasons = [
  'Nieaktualne / przedmiot już sprzedany',
  'Podejrzenie oszustwa lub spamu',
  'Nieodpowiednie treści lub zdjęcia',
  'Błędna kategoria lub zły opis',
  'Brak kontaktu ze sprzedającym',
];

export function ReportAdModal({ ad, onClose }: ReportAdModalProps) {
  const [selectedReason, setSelectedReason] = useState(reportReasons[0]);
  const [details, setDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/75 backdrop-blur-sm sm:items-center">
      <div className="flex max-h-[92dvh] w-full max-w-[420px] flex-col rounded-t-[36px] bg-white p-5 shadow-float sm:rounded-[36px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-mist pb-3">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-coral-100 text-coral">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <h2 className="font-display text-[18px] font-bold text-ink">Zgłoś ogłoszenie</h2>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-mist text-ink hover:bg-mist-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="mt-4 font-display text-[20px] font-bold text-ink">Dziękujemy za zgłoszenie</h3>
            <p className="mt-2 text-[13px] text-ink-500">
              Administratorzy platformy <b>mójMińsk</b> przeanalizują ogłoszenie w ciągu kilku godzin. Dzięki Twojej czujności nasza społeczność jest bezpieczna.
            </p>
            <button
              onClick={onClose}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-ink text-[14px] font-bold text-white transition-transform active:scale-95"
            >
              Zamknij
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="rounded-2xl bg-mist p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400">Zgłaszane ogłoszenie</p>
              <p className="font-semibold text-[13.5px] text-ink truncate mt-0.5">{ad.title}</p>
              <p className="text-[11.5px] text-ink-500">Wystawca: {ad.author} · ul. {ad.street}</p>
            </div>

            <div>
              <label className="text-[12px] font-bold uppercase tracking-wider text-ink-400">
                Wybierz powód zgłoszenia
              </label>
              <div className="mt-2 space-y-1.5">
                {reportReasons.map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setSelectedReason(reason)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-2xl border p-3 text-left text-[13px] font-semibold transition-all',
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

            <label className="block">
              <span className="text-[12px] font-bold text-ink">
                Dodatkowe informacje <span className="text-ink-400 font-normal">(opcjonalnie)</span>
              </span>
              <textarea
                rows={2}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Napisz krótko, na czym polega problem..."
                className="mt-1 w-full rounded-2xl bg-mist p-3 text-[13px] outline-none focus:ring-2 focus:ring-ink"
              />
            </label>

            <button
              type="submit"
              className="flex h-12 w-full items-center justify-center rounded-full bg-coral text-[14px] font-bold text-ink shadow-coral transition-transform active:scale-95"
            >
              Prześlij zgłoszenie do moderacji
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
