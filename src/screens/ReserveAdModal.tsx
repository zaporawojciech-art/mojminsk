import { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Clock,
  HeartHandshake,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { Img, NativeHeader, cn, zl } from '../components/ui';
import type { Ad, User } from '../data/mockData';

interface ReserveAdModalProps {
  ad: Ad;
  user: User;
  onClose: () => void;
  onSuccess: (ad: Ad, reservationDetails: { spot: string; time: string; phone: string; note: string }) => void;
  isClosing?: boolean;
}

const pickupSpots = [
  { id: 'seller_address', title: 'Pod adresem sprzedającego', desc: 'Bezpośrednio pod blokiem/domem sąsiada' },
  { id: 'station', title: 'Dworzec PKP Mińsk Mazowiecki', desc: 'Plac przed dworcem / parking' },
  { id: 'market', title: 'Stary Rynek / Plac Kilińskiego', desc: 'Centrum miasta, bezpieczne publiczne miejsce' },
  { id: 'park', title: 'Park Dernałowiczów', desc: 'Główna aleja przy Pałacu' },
];

const timeOptions = [
  'Dziś po 18:00',
  'Jutro przed południem (10:00–13:00)',
  'Jutro popołudniu (16:00–19:00)',
  'W ten weekend (sobota/niedziela)',
];

export function ReserveAdModal({ ad, user: _user, onClose, onSuccess, isClosing = false }: ReserveAdModalProps) {
  const [selectedSpot, setSelectedSpot] = useState(pickupSpots[0].id);
  const [selectedTime, setSelectedTime] = useState(timeOptions[0]);
  const [phone, setPhone] = useState('501 234 567');
  const [note, setNote] = useState('Dzień dobry, chętnie odbiorę osobiście i zapłacę gotówką lub BLIKiem na miejscu.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const spotObj = pickupSpots.find((s) => s.id === selectedSpot)!;
  const spotName = spotObj.id === 'seller_address' ? `ul. ${ad.street}` : spotObj.title;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsDone(true);
      onSuccess(ad, {
        spot: spotName,
        time: selectedTime,
        phone,
        note,
      });
    }, 700);
  };

  return (
    <div
      className={cn(
        'fixed inset-0 md:relative md:inset-auto md:h-full md:w-full z-50 flex flex-col bg-mist select-none',
        isClosing ? 'native-screen-exit' : 'native-screen-slide',
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-md md:max-w-none flex-col overflow-hidden bg-mist">
        {/* Top Header */}
        <NativeHeader
          title="Rezerwacja"
          backLabel="Wróć"
          onBack={onClose}
        />

        {isDone ? (
          <div className="flex-1 flex flex-col justify-between p-6 text-center">
            <div className="my-auto space-y-4">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm animate-bounce">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <h3 className="font-display text-[24px] font-bold text-ink">Rezerwacja wysłana!</h3>
              <p className="text-[14px] text-ink-500 max-w-[280px] mx-auto leading-relaxed">
                Przedmiot został zarezerwowany. Sprzedający <b>{ad.author}</b> otrzymał wiadomość z Twoją propozycją terminu i miejsca.
              </p>

              {/* Reservation Confirmation Card */}
              <div className="mx-auto max-w-[320px] rounded-3xl bg-white p-4 text-left shadow-card space-y-2 border border-mist-300">
                <div className="flex items-center gap-3 border-b border-mist pb-2.5">
                  <Img src={ad.image} alt={ad.title} className="h-12 w-12 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-ink">{ad.title}</p>
                    <p className="text-[12px] font-extrabold text-coral">
                      {ad.price ? zl(ad.price) : 'Za darmo'}
                    </p>
                  </div>
                </div>
                <div className="text-[12px] space-y-1 pt-1 text-ink-600">
                  <p className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-coral shrink-0" />
                    <span><b>Miejsce:</b> {spotName}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-sky-700 shrink-0" />
                    <span><b>Termin:</b> {selectedTime}</span>
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-[14.5px] font-bold text-white shadow-sm hover:bg-ink-700 active:scale-[0.98] transition-all"
            >
              <MessageCircle className="h-4.5 w-4.5" />
              Przejdź do czatu
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 md:px-8 lg:px-12 md:py-6 space-y-4 md:space-y-0 md:grid md:grid-cols-12 md:gap-6 md:items-start">
              {/* LEFT COLUMN (Spot & Time options) */}
              <div className="space-y-4 md:col-span-7 lg:col-span-8">
                {/* Pickup location options */}
                <div className="rounded-3xl md:rounded-2xl md:border md:border-mist-200 bg-white p-4 md:p-5 shadow-card md:shadow-xs">
                  <h3 className="text-[12px] font-bold uppercase tracking-wider text-ink-400">
                    Proponowane miejsce odbioru w Mińsku
                  </h3>
                  <div className="mt-3 space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-2.5">
                    {pickupSpots.map((spot) => {
                      const isSelected = selectedSpot === spot.id;
                      return (
                        <div
                          key={spot.id}
                          onClick={() => setSelectedSpot(spot.id)}
                          className={cn(
                            'cursor-pointer rounded-2xl md:rounded-xl p-3 border-2 transition-all flex items-start justify-between gap-3',
                            isSelected
                              ? 'border-coral bg-coral-50/40 ring-1 ring-coral/20'
                              : 'border-transparent bg-mist/60 hover:bg-mist',
                          )}
                        >
                          <div className="min-w-0">
                            <p className="font-display text-[13.5px] font-bold text-ink">
                              {spot.id === 'seller_address' ? `ul. ${ad.street} (u sprzedającego)` : spot.title}
                            </p>
                            <p className="text-[11.5px] text-ink-500">{spot.desc}</p>
                          </div>
                          <div
                            className={cn(
                              'mt-0.5 grid h-5 w-5 place-items-center rounded-full border-2 shrink-0 transition-all',
                              isSelected ? 'border-coral bg-coral text-ink' : 'border-mist-300 bg-white',
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pickup time options */}
                <div className="rounded-3xl md:rounded-2xl md:border md:border-mist-200 bg-white p-4 md:p-5 shadow-card md:shadow-xs">
                  <h3 className="text-[12px] font-bold uppercase tracking-wider text-ink-400">
                    Kiedy możesz odebrać?
                  </h3>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {timeOptions.map((t) => {
                      const isSelected = selectedTime === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSelectedTime(t)}
                          className={cn(
                            'rounded-2xl md:rounded-xl p-3 text-left text-[12.5px] font-bold transition-all cursor-pointer',
                            isSelected ? 'bg-ink text-white shadow-card' : 'bg-mist text-ink-700 hover:bg-mist-200',
                          )}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN (Product summary, Contact & Submit) */}
              <div className="space-y-4 md:col-span-5 lg:col-span-4 md:sticky md:top-2">
                {/* Product mini header */}
                <div className="flex items-center gap-3 rounded-3xl md:rounded-2xl md:border md:border-mist-200 bg-white p-3 md:p-4 shadow-card md:shadow-xs">
                  <Img src={ad.image} alt={ad.title} className="h-14 w-14 rounded-2xl md:rounded-xl object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-bold text-ink">{ad.title}</p>
                    <p className="text-[12px] font-extrabold text-coral">
                      {ad.price ? zl(ad.price) : 'Za darmo'}
                    </p>
                    <p className="text-[11px] text-ink-500">Sprzedający: {ad.author} · ul. {ad.street}</p>
                  </div>
                </div>

                {/* Contact info & note */}
                <div className="rounded-3xl md:rounded-2xl md:border md:border-mist-200 bg-white p-4 md:p-5 shadow-card md:shadow-xs space-y-3">
                  <div>
                    <label className="text-[12px] font-bold text-ink-700 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-coral" />
                      Twój numer telefonu do kontaktu
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1 h-11 w-full rounded-xl border border-mist-300 bg-mist/50 px-3 text-[14px] font-bold text-ink outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[12px] font-bold text-ink-700">Wiadomość do sąsiada</label>
                    <textarea
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-mist-300 bg-mist/50 p-2.5 text-[13px] text-ink outline-none resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-[11.5px] text-ink-400 pt-1">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Bezpieczne sąsiedzkie spotkanie w Mińsku Mazowieckim</span>
                  </div>

                  {/* Desktop Submit Button */}
                  <div className="hidden md:block pt-3 border-t border-mist-200">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-[13.5px] font-bold text-white shadow-sm hover:bg-ink-800 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <HeartHandshake className="h-4 w-4 text-coral" />
                      {isSubmitting ? 'Wysyłanie rezerwacji...' : 'Potwierdź rezerwację'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Bottom Button */}
            <div className="md:hidden border-t border-mist bg-white px-4 py-2.5 pb-[max(env(safe-area-inset-bottom),14px)] shrink-0 shadow-float">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-[14.5px] font-bold text-white shadow-sm hover:bg-ink-700 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <HeartHandshake className="h-4.5 w-4.5 text-coral" />
                {isSubmitting ? 'Wysyłanie rezerwacji...' : 'Zarezerwuj'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
