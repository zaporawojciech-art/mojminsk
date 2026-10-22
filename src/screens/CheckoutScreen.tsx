import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Store,
  Tag,
  Zap,
} from 'lucide-react';
import type { CartLine } from '../components/Cart';
import { cn, zl } from '../components/ui';
import type { User } from '../data/mockData';

interface CheckoutScreenProps {
  lines: CartLine[];
  user: User;
  onBack: () => void;
  onSuccess: () => void;
}

export function CheckoutScreen({ lines, user, onBack, onSuccess }: CheckoutScreenProps) {
  // Steps: 'form' -> 'blik_pending' -> 'tracking'
  const [step, setStep] = useState<'form' | 'blik_pending' | 'tracking'>('form');
  const [deliveryMethod, setDeliveryMethod] = useState<'courier' | 'pickup'>('courier');
  const [deliveryTime, setDeliveryTime] = useState<'asap' | 'schedule'>('asap');
  const [addressNote, setAddressNote] = useState('Kod do domofonu: 42#, 2. piętro. Proszę zostawić pod drzwiami.');
  const [phone, setPhone] = useState('501 234 567');
  const [paymentMethod, setPaymentMethod] = useState<'blik' | 'apple_pay' | 'card' | 'cash'>('blik');
  const [blikCode, setBlikCode] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [blikTimer, setBlikTimer] = useState(118);

  const subtotal = lines.reduce((acc, l) => acc + l.qty * l.product.price, 0);
  const deliveryFee = deliveryMethod === 'pickup' ? 0 : subtotal >= 120 ? 0 : 6.99;
  const serviceFee = 1.99;
  const discountValue = discountApplied ? 15 : 0;
  const finalTotal = Math.max(0, subtotal + deliveryFee + serviceFee - discountValue);

  // BLIK timer countdown
  useEffect(() => {
    if (step !== 'blik_pending') return;
    const interval = setInterval(() => {
      setBlikTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setStep('tracking');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const handleApplyDiscount = () => {
    if (discountCode.trim().toUpperCase() === 'MINSK15' || discountCode.trim().toLowerCase() === 'motylek') {
      setDiscountApplied(true);
    }
  };

  const handleStartPayment = () => {
    if (paymentMethod === 'blik') {
      setStep('blik_pending');
      setBlikTimer(118);
    } else {
      setStep('tracking');
    }
  };

  if (step === 'tracking') {
    return (
      <div className="min-h-full bg-mist pb-12">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-mist-300 bg-white/95 px-5 py-3.5 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-coral-100 text-coral-700">
              <Bike className="h-5 w-5 animate-bounce" />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-coral-700">Zamówienie #MM-8492</p>
              <h1 className="font-display text-[17px] font-semibold leading-tight">Kurier w drodze</h1>
            </div>
          </div>
          <button
            onClick={() => {
              onSuccess();
              onBack();
            }}
            className="rounded-full bg-mist px-3 py-1.5 text-[12px] font-bold text-ink hover:bg-mist-200"
          >
            Zamknij
          </button>
        </header>

        <div className="space-y-4 p-5">
          {/* Status Hero Card */}
          <div className="relative overflow-hidden rounded-4xl bg-ink p-5 text-white shadow-float">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-coral/20 blur-2xl" />
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-sand">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sand opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-sand" />
                </span>
                Szacowany czas dostawy
              </span>
              <span className="text-[12px] font-semibold text-white/60">Mińsk Maz.</span>
            </div>
            <p className="mt-3 font-display text-[38px] font-semibold tracking-tight text-white">24–32 min</p>
            <p className="mt-0.5 text-[13px] text-white/70">
              Dostawa na adres: <span className="font-semibold text-white">ul. {user.street.name}</span>
            </p>

            {/* Progress bar */}
            <div className="mt-5 space-y-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
                <div className="h-full w-2/3 rounded-full bg-coral transition-all duration-1000" />
              </div>
              <div className="flex justify-between text-[11px] font-medium text-white/60">
                <span>Przyjęte</span>
                <span className="font-bold text-sand">W drodze</span>
                <span>Doręczone</span>
              </div>
            </div>
          </div>

          {/* Courier Info Card */}
          <div className="flex items-center justify-between rounded-3xl bg-white p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-coral font-display text-[18px] font-bold text-ink">
                  K
                </div>
                <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] text-white">
                  🚴
                </span>
              </div>
              <div>
                <p className="text-[14px] font-bold text-ink">Kacper (Flota mójMińsk)</p>
                <p className="text-[12px] text-ink-500">Rower cargo · 4.9 ★ (142 kursy)</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href="tel:500123456"
                className="grid h-10 w-10 place-items-center rounded-full bg-mist text-ink transition-transform active:scale-95"
                aria-label="Zadzwoń do kuriera"
              >
                <Phone className="h-4 w-4" />
              </a>
              <button
                onClick={() => alert('Wiadomość wysłana do kuriera: "Proszę zadzwonić domofonem"')}
                className="grid h-10 w-10 place-items-center rounded-full bg-coral text-ink transition-transform active:scale-95"
                aria-label="Napisz do kuriera"
              >
                <MessageCircle className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Timeline details */}
          <div className="rounded-3xl bg-white p-5 shadow-card">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-ink-400">Status realizacji</h2>
            <div className="mt-4 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-[13.5px] font-bold text-ink">Zamówienie opłacone BLIK-iem</p>
                  <p className="text-[11.5px] text-ink-400">12:34 · Kod autoryzacji #91823</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-[13.5px] font-bold text-ink">Skompletowane w Motylek Market</p>
                  <p className="text-[11.5px] text-ink-400">12:41 · ul. Siennicka (spakowano torbę papierową)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-coral text-[10px] font-bold text-ink">
                  3
                </span>
                <div>
                  <p className="text-[13.5px] font-bold text-coral-700">Kurier jedzie w kierunku ul. {user.street.name}</p>
                  <p className="text-[11.5px] text-ink-500">Mija rondo przy ul. Warszawskiej · 6 min do celu</p>
                </div>
              </div>
              <div className="flex items-start gap-3 opacity-40">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-mist-300 text-[10px] font-bold text-ink">
                  4
                </span>
                <div>
                  <p className="text-[13.5px] font-bold text-ink">Doręczenie pod drzwi</p>
                  <p className="text-[11.5px] text-ink-400">Przekazanie zakupów</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ordered items breakdown */}
          <div className="rounded-3xl bg-white p-4 shadow-card">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-ink-400">Zawartość torby</h2>
            <div className="mt-3 divide-y divide-mist">
              {lines.map((l) => (
                <div key={l.product.id} className="flex items-center justify-between py-2 text-[13px]">
                  <span className="font-medium text-ink">
                    {l.qty}x {l.product.name}
                  </span>
                  <span className="font-bold text-ink">{zl(l.qty * l.product.price)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 border-t border-mist pt-2 flex justify-between font-bold text-[14px]">
              <span>Zapłacono:</span>
              <span className="text-coral-700">{zl(finalTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-mist pb-12">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-mist-300 bg-white/95 px-5 py-3.5 backdrop-blur">
        <button
          onClick={onBack}
          aria-label="Wróć do koszyka"
          className="grid h-10 w-10 place-items-center rounded-full bg-mist text-ink transition-transform active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-[18px] font-semibold">Kasa i dostawa</h1>
        <span className="text-[12px] font-bold text-ink-400">Krok 1 z 2</span>
      </header>

      {/* Main Form */}
      <div className="space-y-4 p-5">
        {/* Delivery Method Segmented */}
        <div className="rounded-3xl bg-white p-2 shadow-card">
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-mist p-1">
            <button
              onClick={() => setDeliveryMethod('courier')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-bold transition-all',
                deliveryMethod === 'courier' ? 'bg-white text-ink shadow-card' : 'text-ink-500',
              )}
            >
              <Bike className="h-4 w-4 text-coral" />
              Kurier mójMińsk
            </button>
            <button
              onClick={() => setDeliveryMethod('pickup')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-bold transition-all',
                deliveryMethod === 'pickup' ? 'bg-white text-ink shadow-card' : 'text-ink-500',
              )}
            >
              <Store className="h-4 w-4 text-sky-700" />
              Odbiór (0 zł)
            </button>
          </div>
        </div>

        {/* Delivery Address Card */}
        {deliveryMethod === 'courier' ? (
          <div className="rounded-3xl bg-white p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-ink-400">
                <MapPin className="h-4 w-4 text-coral" />
                Adres dostawy
              </div>
              <span className="rounded-full bg-sand-100 px-2.5 py-0.5 text-[11px] font-bold text-sand-700">
                Zweryfikowany adres
              </span>
            </div>
            <p className="mt-2 text-[16px] font-bold text-ink">
              ul. {user.street.name} (Mińsk Mazowiecki)
            </p>
            <label className="mt-3 block">
              <span className="text-[12px] font-semibold text-ink-500">Wskazówki dla kuriera:</span>
              <input
                type="text"
                value={addressNote}
                onChange={(e) => setAddressNote(e.target.value)}
                placeholder="Np. piętro, kod do domofonu, zostaw pod drzwiami"
                className="mt-1 h-12 w-full rounded-2xl bg-mist px-3.5 text-[13.5px] outline-none focus:ring-2 focus:ring-ink"
              />
            </label>
            <label className="mt-2 block">
              <span className="text-[12px] font-semibold text-ink-500">Numer telefonu do kontaktu:</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 h-12 w-full rounded-2xl bg-mist px-3.5 text-[13.5px] font-medium outline-none focus:ring-2 focus:ring-ink"
              />
            </label>
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-4 shadow-card">
            <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-sky-700">
              <Store className="h-4 w-4" />
              Punkt odbioru osobistego
            </div>
            <p className="mt-2 text-[15px] font-bold text-ink">Motylek Market · ul. Siennicka 14</p>
            <p className="mt-0.5 text-[12.5px] text-ink-500">
              Odbiór gotowy w 20 minut przy kasie nr 1 (bez kolejki)
            </p>
          </div>
        )}

        {/* Delivery Time Window */}
        <div className="rounded-3xl bg-white p-4 shadow-card">
          <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-ink-400">
            <Clock className="h-4 w-4 text-sand-700" />
            Kiedy dostarczyć?
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <button
              onClick={() => setDeliveryTime('asap')}
              className={cn(
                'rounded-2xl border p-3 text-left transition-all',
                deliveryTime === 'asap' ? 'border-ink bg-sand-50' : 'border-mist bg-white',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-ink">Jak najszybciej</span>
                <Zap className="h-3.5 w-3.5 text-coral" />
              </div>
              <p className="mt-1 text-[11.5px] text-ink-500">ok. 30–40 min</p>
            </button>
            <button
              onClick={() => setDeliveryTime('schedule')}
              className={cn(
                'rounded-2xl border p-3 text-left transition-all',
                deliveryTime === 'schedule' ? 'border-ink bg-sand-50' : 'border-mist bg-white',
              )}
            >
              <span className="text-[13px] font-bold text-ink">Dzisiaj 18:00–19:00</span>
              <p className="mt-1 text-[11.5px] text-ink-500">Planowana dostawa</p>
            </button>
          </div>
        </div>

        {/* Voucher / Promo code */}
        <div className="rounded-3xl bg-white p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-ink-400">
              <Tag className="h-4 w-4 text-coral" />
              Kupon z listu powitalnego
            </div>
            {discountApplied ? (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                -15 zł aktywne!
              </span>
            ) : (
              <span className="text-[11px] text-ink-400">Wpisz: MINSK15</span>
            )}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="Kod rabatowy (np. MINSK15)"
              className="h-12 flex-1 rounded-2xl bg-mist px-3.5 text-[13.5px] uppercase outline-none focus:ring-2 focus:ring-ink"
            />
            <button
              onClick={handleApplyDiscount}
              disabled={discountApplied || !discountCode.trim()}
              className="rounded-2xl bg-ink px-4 text-[13px] font-bold text-white transition-transform active:scale-95 disabled:opacity-40"
            >
              Zastosuj
            </button>
          </div>
          {discountApplied && (
            <p className="mt-2 flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              Rabat -15 zł od Motylek Market został naliczony do koszyka!
            </p>
          )}
        </div>

        {/* Payment Methods */}
        <div className="rounded-3xl bg-white p-4 shadow-card">
          <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-ink-400">
            <CreditCard className="h-4 w-4 text-sky-700" />
            Wybierz metodę płatności
          </div>
          <div className="mt-3 space-y-2">
            {/* BLIK */}
            <div
              onClick={() => setPaymentMethod('blik')}
              className={cn(
                'cursor-pointer rounded-2xl border p-3.5 transition-all',
                paymentMethod === 'blik' ? 'border-coral bg-coral-50' : 'border-mist bg-white',
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-ink px-2.5 py-1 text-[12px] font-extrabold tracking-wider text-white">
                    BLIK
                  </span>
                  <span className="text-[14px] font-bold text-ink">Kod BLIK (zalecane)</span>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'blik'}
                  onChange={() => setPaymentMethod('blik')}
                  className="h-4 w-4 accent-coral"
                />
              </div>

              {paymentMethod === 'blik' && (
                <div className="mt-3 border-t border-coral-100 pt-3">
                  <label className="block">
                    <span className="text-[12px] font-semibold text-ink-700">Wpisz 6-cyfrowy kod z banku:</span>
                    <input
                      type="text"
                      maxLength={6}
                      value={blikCode}
                      onChange={(e) => setBlikCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • •   • • •"
                      className="mt-1 h-12 w-full rounded-2xl bg-white text-center font-display text-[22px] font-bold tracking-[0.3em] text-ink shadow-sm outline-none focus:ring-2 focus:ring-coral"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Apple Pay / Google Pay */}
            <div
              onClick={() => setPaymentMethod('apple_pay')}
              className={cn(
                'flex cursor-pointer items-center justify-between rounded-2xl border p-3.5 transition-all',
                paymentMethod === 'apple_pay' ? 'border-ink bg-mist' : 'border-mist bg-white',
              )}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-7 w-10 place-items-center rounded bg-ink text-[12px] font-bold text-white">
                   Pay
                </span>
                <span className="text-[13.5px] font-bold text-ink">Apple Pay / Google Pay</span>
              </div>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'apple_pay'}
                onChange={() => setPaymentMethod('apple_pay')}
                className="h-4 w-4 accent-ink"
              />
            </div>

            {/* Karta */}
            <div
              onClick={() => setPaymentMethod('card')}
              className={cn(
                'flex cursor-pointer items-center justify-between rounded-2xl border p-3.5 transition-all',
                paymentMethod === 'card' ? 'border-ink bg-mist' : 'border-mist bg-white',
              )}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-ink-500" />
                <span className="text-[13.5px] font-bold text-ink">Karta płatnicza online</span>
              </div>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'card'}
                onChange={() => setPaymentMethod('card')}
                className="h-4 w-4 accent-ink"
              />
            </div>
          </div>
        </div>

        {/* Cost Summary */}
        <div className="rounded-3xl bg-white p-4 shadow-card">
          <dl className="space-y-2 text-[13px]">
            <div className="flex justify-between text-ink-500">
              <dt>Wartość produktów ({lines.reduce((s, l) => s + l.qty, 0)} szt.)</dt>
              <dd>{zl(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-ink-500">
              <dt>Dostawa kurierem</dt>
              <dd className={deliveryFee === 0 ? 'font-bold text-emerald-700' : ''}>
                {deliveryFee === 0 ? 'Gratis' : zl(deliveryFee)}
              </dd>
            </div>
            <div className="flex justify-between text-ink-500">
              <dt>Opłata serwisowa</dt>
              <dd>{zl(serviceFee)}</dd>
            </div>
            {discountApplied && (
              <div className="flex justify-between font-bold text-emerald-700">
                <dt>Kupon powitalny (MINSK15)</dt>
                <dd>- {zl(discountValue)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-mist pt-2 text-[17px] font-bold text-ink">
              <dt>Razem do zapłaty</dt>
              <dd className="text-coral-700">{zl(finalTotal)}</dd>
            </div>
          </dl>
        </div>

        {/* Security badge */}
        <p className="flex items-center justify-center gap-2 text-[11.5px] font-medium text-ink-500">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Szyfrowana transakcja · Bezpieczny BLIK przez system mójMińsk
        </p>

        {/* CTA */}
        <button
          disabled={paymentMethod === 'blik' && blikCode.length !== 6}
          onClick={handleStartPayment}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-coral text-[16px] font-bold text-ink shadow-coral transition-transform active:scale-[.98] disabled:opacity-40"
        >
          {paymentMethod === 'blik' ? `Zapłać BLIK-iem ${zl(finalTotal)}` : `Zamów i zapłać ${zl(finalTotal)}`}
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      {/* BLIK Waiting Modal Overlay */}
      {step === 'blik_pending' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 p-5 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-4xl bg-white p-6 text-center shadow-float">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-coral font-display text-[22px] font-extrabold text-ink animate-pulse">
              BLIK
            </span>
            <h2 className="mt-4 font-display text-[20px] font-semibold leading-tight">
              Potwierdź płatność w aplikacji swojego banku
            </h2>
            <p className="mt-2 text-[13.5px] text-ink-500">
              Otwórz aplikację banku na telefonie i zaakceptuj transakcję na kwotę <b>{zl(finalTotal)}</b>.
            </p>

            <div className="mt-5 rounded-2xl bg-mist p-3">
              <span className="text-[12px] font-semibold text-ink-400">Pozostały czas na autoryzację:</span>
              <p className="font-display text-[28px] font-bold tabular-nums text-coral-700">
                {Math.floor(blikTimer / 60)}:{(blikTimer % 60).toString().padStart(2, '0')}
              </p>
            </div>

            <button
              onClick={() => setStep('tracking')}
              className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-ink text-[14px] font-bold text-white transition-transform active:scale-95"
            >
              Potwierdziłem w banku (Symuluj sukces)
              <CheckCircle2 className="h-4 w-4 text-sand" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
