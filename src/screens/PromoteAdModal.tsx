import { useEffect, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Crown,
  Flame,
  Lock,
  Receipt,
  Smartphone,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Img, NativeHeader, cn, zl } from '../components/ui';
import type { Ad, User } from '../data/mockData';

interface PromoteAdModalProps {
  ad: Ad;
  user: User;
  onClose: () => void;
  onPromoted: (adId: string, plan: 'boost' | 'highlight' | 'vip') => void;
}

interface Plan {
  id: 'boost' | 'highlight' | 'vip';
  name: string;
  price: number;
  badge: string;
  duration: string;
  icon: typeof Zap;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'boost',
    name: 'Podbicie na górę',
    price: 4,
    badge: '1-Razowo',
    duration: 'Natychmiast',
    icon: Zap,
    features: ['Podbicie na samą górę listy ogłoszeń', 'Odświeżenie daty do "Przed chwilą"', 'Średnio 3x więcej wejść w ciągu 24h'],
  },
  {
    id: 'highlight',
    name: 'Wyróżnienie 7 dni',
    price: 9,
    badge: 'Polecane',
    duration: '7 dni',
    icon: Flame,
    popular: true,
    features: [
      'Złota odznaka "Wyróżnione" na liście',
      'Priorytetowe miejsce w wynikach wyszukiwania',
      'Wyróżniona ramka w Mińsku Mazowieckim',
      'Gwarancja szybszej sprzedaży',
    ],
  },
  {
    id: 'vip',
    name: 'Pakiet SuperSąsiad',
    price: 15,
    badge: 'Maksymalny zasięg',
    duration: '14 dni',
    icon: Crown,
    features: [
      'Wyróżnienie na liście przez pełne 14 dni',
      'Widoczność w strefie polecanych na ekranie Start',
      'Powiadomienie push do sąsiadów z Twojej ulicy',
      'Do 10x szybsza transakcja',
    ],
  },
];

export function PromoteAdModal({ ad, user: _user, onClose, onPromoted }: PromoteAdModalProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<'boost' | 'highlight' | 'vip'>('highlight');
  const [step, setStep] = useState<'plans' | 'blik' | 'confirming' | 'success'>('plans');
  const [blikCode, setBlikCode] = useState('');
  const [needInvoice, setNeedInvoice] = useState(false);
  const [nip, setNip] = useState('');
  const [timer, setTimer] = useState(115);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId)!;

  // BLIK countdown simulation
  useEffect(() => {
    if (step !== 'confirming') return;
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setStep('success');
          onPromoted(ad.id, selectedPlanId);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step, ad.id, selectedPlanId, onPromoted]);

  const handleStartBlik = (e: React.FormEvent) => {
    e.preventDefault();
    if (blikCode.replace(/\s/g, '').length !== 6) return;
    setStep('confirming');
    setTimer(118);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-mist native-screen-slide select-none">
      <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden bg-mist">
        {/* Top Native Header */}
        <NativeHeader
          title={step === 'success' ? 'Wyróżnienie aktywne' : 'Wyróżnij ogłoszenie'}
          backLabel="Wróć"
          onBack={onClose}
        />

        {step === 'plans' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-4">
              {/* Ad mini preview card */}
              <div className="flex items-center gap-3 rounded-3xl bg-white p-3 shadow-card">
                <Img src={ad.image} alt={ad.title} className="h-14 w-14 rounded-2xl object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-bold text-ink">{ad.title}</p>
                  <p className="text-[12px] font-extrabold text-coral">
                    {ad.price ? zl(ad.price) : ad.kind === 'free' ? 'Za darmo' : 'Zgłoszenie'}
                  </p>
                  <p className="text-[10.5px] text-ink-400">ul. {ad.street} · Mińsk Mazowiecki</p>
                </div>
              </div>

              {/* Header pitch */}
              <div className="text-center pt-1">
                <h2 className="font-display text-[22px] font-bold text-ink leading-tight">
                  Sprzedaj do 5× szybciej sąsiadom
                </h2>
                <p className="mt-1 text-[13px] text-ink-500">
                  Wybierz pakiet promowania dopasowany do Twojej oferty.
                </p>
              </div>

              {/* Plans selection list */}
              <div className="space-y-3 pt-1">
                {plans.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  const Icon = plan.icon;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={cn(
                        'relative cursor-pointer rounded-3xl p-4 transition-all shadow-card border-2',
                        isSelected
                          ? 'border-coral bg-white ring-2 ring-coral/20'
                          : 'border-transparent bg-white hover:border-mist-300',
                      )}
                    >
                      {plan.popular && (
                        <span className="absolute -top-2.5 right-4 rounded-full bg-coral px-3 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wide text-ink shadow">
                          Najczęściej wybierany
                        </span>
                      )}

                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              'grid h-11 w-11 shrink-0 place-items-center rounded-2xl',
                              plan.id === 'vip'
                                ? 'bg-amber-100 text-amber-700'
                                : plan.id === 'highlight'
                                ? 'bg-coral-100 text-coral'
                                : 'bg-sky-100 text-sky-700',
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-display text-[16.5px] font-bold text-ink">{plan.name}</h3>
                              <span className="rounded-full bg-mist px-2 py-0.5 text-[10px] font-bold text-ink-600">
                                {plan.duration}
                              </span>
                            </div>
                            <p className="mt-0.5 font-display text-[19px] font-extrabold text-ink">
                              {zl(plan.price)}
                              <span className="font-sans text-[11px] font-medium text-ink-400"> / płatność BLIK</span>
                            </p>
                          </div>
                        </div>

                        <div
                          className={cn(
                            'mt-1 grid h-6 w-6 place-items-center rounded-full border-2 transition-all',
                            isSelected ? 'border-coral bg-coral text-ink' : 'border-mist-300 bg-white',
                          )}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      <ul className="mt-3.5 space-y-1.5 border-t border-mist pt-3">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-[12px] text-ink-600">
                            <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {/* Trust badge */}
              <div className="flex items-center justify-center gap-1.5 text-[11.5px] text-ink-400 pb-2">
                <Lock className="h-3.5 w-3.5 text-emerald-600" />
                <span>Bezpieczna płatność BLIK · Faktura VAT na życzenie</span>
              </div>
            </div>

            {/* Bottom Proceed Button */}
            <div className="border-t border-mist bg-white px-5 py-3 pb-[max(env(safe-area-inset-bottom),14px)] shrink-0 shadow-float">
              <button
                type="button"
                onClick={() => setStep('blik')}
                className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-coral text-[15px] font-bold text-ink shadow-coral transition-transform active:scale-95"
              >
                Przejdź do płatności BLIK · {zl(selectedPlan.price)}
              </button>
            </div>
          </div>
        )}

        {step === 'blik' && (
          <form onSubmit={handleStartBlik} className="flex-1 flex flex-col justify-between p-5">
            <div className="space-y-4">
              {/* Order summary pill */}
              <div className="rounded-3xl bg-white p-4 shadow-card">
                <div className="flex items-center justify-between text-[13px] text-ink-500">
                  <span>Wybrany pakiet:</span>
                  <span className="font-bold text-ink">{selectedPlan.name}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[13px] text-ink-500">
                  <span>Czas trwania:</span>
                  <span className="font-semibold text-ink">{selectedPlan.duration}</span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-mist pt-2">
                  <span className="font-display text-[15px] font-bold text-ink">Do zapłaty:</span>
                  <span className="font-display text-[22px] font-extrabold text-coral">{zl(selectedPlan.price)}</span>
                </div>
              </div>

              {/* BLIK Input Card */}
              <div className="rounded-4xl bg-ink p-6 text-white shadow-float text-center space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-[12px] font-bold text-sand">
                  <Smartphone className="h-4 w-4" />
                  Wpisz 6-cyfrowy kod z aplikacji banku
                </div>

                <div className="mx-auto max-w-[240px]">
                  <input
                    type="tel"
                    maxLength={6}
                    autoFocus
                    value={blikCode}
                    onChange={(e) => setBlikCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="______"
                    className="h-16 w-full rounded-2xl bg-white/10 text-center font-display text-[32px] font-bold tracking-[0.3em] text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-coral"
                  />
                </div>

                <p className="text-[12px] text-white/70">
                  Płatność zostanie zaksięgowana natychmiast, a Twoje ogłoszenie zostanie wyróżnione w całym Mińsku.
                </p>
              </div>

              {/* Invoice option */}
              <div className="rounded-3xl bg-white p-4 shadow-card">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={needInvoice}
                    onChange={(e) => setNeedInvoice(e.target.checked)}
                    className="h-4 w-4 rounded accent-coral"
                  />
                  <span className="text-[13px] font-semibold text-ink flex items-center gap-1.5">
                    <Receipt className="h-4 w-4 text-ink-400" />
                    Chcę otrzymać fakturę VAT na firmę
                  </span>
                </label>
                {needInvoice && (
                  <div className="mt-3 pt-3 border-t border-mist">
                    <label className="text-[11.5px] font-bold text-ink-500">NIP firmy</label>
                    <input
                      type="text"
                      value={nip}
                      onChange={(e) => setNip(e.target.value)}
                      placeholder="np. 8221234567"
                      className="mt-1 h-11 w-full rounded-xl border border-mist-300 bg-mist/50 px-3 text-[14px] font-semibold text-ink outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <button
                type="submit"
                disabled={blikCode.length !== 6}
                className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-coral text-[15px] font-bold text-ink shadow-coral transition-transform active:scale-95 disabled:opacity-40"
              >
                Potwierdź kod BLIK i opłać
              </button>
              <button
                type="button"
                onClick={() => setStep('plans')}
                className="flex h-11 w-full items-center justify-center text-[13px] font-semibold text-ink-500"
              >
                Zmień pakiet
              </button>
            </div>
          </form>
        )}

        {step === 'confirming' && (
          <div className="flex-1 flex flex-col justify-center items-center p-6 text-center space-y-6">
            <div className="relative">
              <div className="grid h-24 w-24 place-items-center rounded-full bg-coral-100 text-coral shadow-inner">
                <Smartphone className="h-12 w-12 animate-pulse" />
              </div>
              <span className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-ink text-white text-[12px] font-extrabold shadow">
                {timer}s
              </span>
            </div>

            <div>
              <h3 className="font-display text-[24px] font-bold text-ink">Potwierdź w aplikacji banku</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-500 max-w-[280px]">
                Otwórz aplikację swojego banku w telefonie i zatwierdź płatność <b>{zl(selectedPlan.price)}</b> dla mójMińsk.
              </p>
            </div>

            <div className="w-full max-w-[260px] rounded-2xl bg-white p-3 shadow-card text-[12px] text-ink-600">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-ping mr-2" />
              Oczekiwanie na autoryzację banku...
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="flex-1 flex flex-col justify-between p-6 text-center">
            <div className="my-auto space-y-4">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm animate-bounce">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <h3 className="font-display text-[26px] font-bold text-ink">Ogłoszenie wyróżnione!</h3>
              <p className="text-[14px] leading-relaxed text-ink-500 max-w-[280px] mx-auto">
                Płatność BLIK przyjęta. Pakiet <b>{selectedPlan.name}</b> jest już aktywny. Twoje ogłoszenie wyświetla się na samej górze w Mińsku Mazowieckim.
              </p>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-1 text-[12px] font-bold text-amber-900">
                <Sparkles className="h-4 w-4 text-amber-600" />
                Odznaka "Wyróżnione" aktywna przez {selectedPlan.duration}
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-13 w-full items-center justify-center rounded-full bg-ink text-[15px] font-bold text-white shadow-card transition-transform active:scale-95"
            >
              Wróć do ogłoszeń
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
