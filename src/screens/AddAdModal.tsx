import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Gift,
  HelpCircle,
  Loader2,
  Lock,
  MapPin,
  Receipt,
  Smartphone,
} from 'lucide-react';
import { NativeHeader, cn } from '../components/ui';
import type { Ad, Job, User } from '../data/mockData';

interface AddAdModalProps {
  user: User;
  onClose: () => void;
  onAdCreated: (ad: Ad) => void;
  onJobCreated?: (job: Job) => void;
  isClosing?: boolean;
}

export function AddAdModal({
  user,
  onClose,
  onAdCreated,
  onJobCreated,
  isClosing = false,
}: AddAdModalProps) {
  const [step, setStep] = useState<'form' | 'blik' | 'confirming' | 'paid_success'>('form');
  const [type, setType] = useState<'neighbor' | 'job'>('neighbor');
  const [kind, setKind] = useState<'sell' | 'free' | 'lost'>('sell');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Meble & Dom');
  const [companyName, setCompanyName] = useState('');
  const [salary, setSalary] = useState('');
  const sampleImages = [
    'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=900&q=80', // bike
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80', // sofa
    'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=900&q=80', // desk
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80', // book
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80', // dog
    'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=900&q=80', // lego
  ];

  const [selectedImages, setSelectedImages] = useState<string[]>([
    sampleImages[0],
    sampleImages[1],
  ]);

  const toggleSampleImage = (src: string) => {
    setSelectedImages((prev) => {
      if (prev.includes(src)) {
        return prev.length > 1 ? prev.filter((item) => item !== src) : prev;
      }
      return [...prev, src];
    });
  };

  // BLIK state
  const [blikCode, setBlikCode] = useState('');
  const [needInvoice, setNeedInvoice] = useState(false);
  const [nip, setNip] = useState('');
  const [createdJobCache, setCreatedJobCache] = useState<Job | null>(null);

  const categories = [
    'Meble & Dom',
    'Dziecięce',
    'Elektronika',
    'Sport & Rowery',
    'Ogród & Narzędzia',
    'Oddam za darmo',
    'Zgubiłem / Znalazłem',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (type === 'neighbor') {
      const photos = selectedImages.length > 0 ? selectedImages : [sampleImages[0]];
      const newAd: Ad = {
        id: `ad_${Date.now()}`,
        title: title.trim(),
        price: kind === 'sell' && price ? parseFloat(price) : null,
        kind,
        street: user.street.name,
        time: 'Przed chwilą',
        image: photos[0],
        images: photos,
        author: `${user.name} ${user.street.as}`,
        description: description.trim() || undefined,
        category,
        status: 'active',
        views: 1,
        isOwner: true,
      };
      onAdCreated(newAd);
      onClose();
    } else {
      // Job posting flow: prepare job data and proceed to BLIK payment step
      const newJob: Job = {
        id: `job_${Date.now()}`,
        company: companyName.trim() || 'Lokalna firma',
        position: title.trim(),
        salary: salary.trim() || 'Do negocjacji',
        period: 'brutto / mies.',
        tags: ['Pełny etat', `ul. ${user.street.name}`],
        time: 'Dziś',
        tone: 'coral',
        description: description.trim() || undefined,
        address: `ul. ${user.street.name}, Mińsk Mazowiecki`,
        isOwner: true,
      };
      setCreatedJobCache(newJob);
      setStep('blik');
    }
  };

  const handleBlikPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (blikCode.replace(/\s/g, '').length !== 6) return;

    setStep('confirming');
    setTimeout(() => {
      if (createdJobCache && onJobCreated) {
        onJobCreated(createdJobCache);
      }
      setStep('paid_success');
    }, 1800);
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col bg-white select-none',
        isClosing ? 'native-modal-exit' : 'native-modal-slide',
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden bg-white">
        {/* Native Modal Navigation Bar */}
        <NativeHeader
          title={step === 'form' ? 'Nowe ogłoszenie' : 'Płatność BLIK'}
          backLabel="Anuluj"
          onBack={onClose}
        />

        {/* Step: BLIK payment */}
        {step === 'blik' && (
          <form onSubmit={handleBlikPay} className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-4">
            <div className="rounded-2xl bg-sand-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-[16px] font-bold text-ink">Publikacja oferty pracy</p>
                  <p className="text-[12px] text-ink-500">Emisja przez 14 dni w sekcji Praca</p>
                </div>
                <span className="font-display text-[22px] font-extrabold text-ink">10,00 zł</span>
              </div>
            </div>

            <div className="rounded-2xl bg-mist p-3.5 text-[12.5px] text-ink-700">
              <p className="font-bold">{createdJobCache?.position}</p>
              <p className="text-ink-500">{createdJobCache?.company} · {createdJobCache?.address}</p>
            </div>

            {/* BLIK Code Input */}
            <label className="block">
              <span className="text-[12px] font-bold text-ink flex items-center gap-1.5">
                <Smartphone className="h-4 w-4 text-coral" />
                Wpisz 6-cyfrowy kod BLIK
              </span>
              <input
                type="text"
                autoFocus
                required
                maxLength={7}
                value={blikCode}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setBlikCode(raw.length > 3 ? `${raw.slice(0, 3)} ${raw.slice(3)}` : raw);
                }}
                placeholder="000 000"
                className="mt-1 h-14 w-full rounded-2xl bg-mist px-4 text-center font-display text-[24px] font-bold tracking-[.3em] outline-none placeholder:text-ink-300 focus:ring-2 focus:ring-ink"
              />
            </label>

            {/* Invoice Toggle */}
            <div className="rounded-2xl border border-mist p-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={needInvoice}
                  onChange={(e) => setNeedInvoice(e.target.checked)}
                  className="h-4 w-4 rounded accent-ink"
                />
                <span className="text-[12.5px] font-bold text-ink flex items-center gap-1">
                  <Receipt className="h-3.5 w-3.5 text-ink-400" />
                  Chcę fakturę VAT na mińską firmę
                </span>
              </label>

              {needInvoice && (
                <div className="mt-2.5 pt-2.5 border-t border-mist space-y-2">
                  <input
                    type="text"
                    required={needInvoice}
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="Numer NIP firmy"
                    className="h-10 w-full rounded-xl bg-mist px-3 text-[13px] outline-none"
                  />
                  <p className="text-[11px] text-ink-400">E-faktura zostanie wygenerowana automatycznie po opłaceniu.</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={blikCode.replace(/\s/g, '').length !== 6}
              className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-bold text-white shadow-card transition-transform active:scale-95 disabled:opacity-40"
            >
              <Lock className="h-4 w-4" />
              Zapłać 10,00 zł i aktywuj ofertę
            </button>
          </form>
        )}

        {/* Step: BLIK Confirming */}
        {step === 'confirming' && (
          <div className="flex-1 flex flex-col justify-center items-center p-6 text-center space-y-4">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sand-100 text-sand-700 animate-pulse">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <h3 className="font-display text-[20px] font-bold text-ink">Potwierdź płatność w banku</h3>
            <p className="text-[13.5px] text-ink-500 max-w-[280px] mx-auto">
              Otwórz aplikację swojego banku i zatwierdź transakcję <b>10,00 zł</b> dla <b>mójMińsk</b>.
            </p>
            <div className="inline-block rounded-full bg-mist px-4 py-1.5 text-[12px] font-bold text-ink-600">
              Kod BLIK: {blikCode}
            </div>
          </div>
        )}

        {/* Step: Payment Success */}
        {step === 'paid_success' && (
          <div className="flex-1 flex flex-col justify-center items-center p-6 text-center space-y-4">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="font-display text-[22px] font-extrabold text-ink">Oferta pracy opłacona!</h3>
            <p className="text-[13.5px] text-ink-500">
              Twoje ogłoszenie zostało opublikowane na 14 dni. Mieszkańcy Mińska mogą już aplikować 1-kliknięciem!
            </p>
            <button
              onClick={onClose}
              className="mt-4 flex h-12 w-full max-w-[300px] items-center justify-center rounded-full bg-ink text-[14px] font-bold text-white transition-transform active:scale-95"
            >
              Zobacz ogłoszenie na liście
            </button>
          </div>
        )}

        {/* Step: Main Form */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 pb-[max(env(safe-area-inset-bottom),20px)]">
            {/* Type Toggle: Neighbor vs Job */}
            <div className="grid grid-cols-2 gap-1 rounded-2xl bg-mist p-1">
              <button
                type="button"
                onClick={() => setType('neighbor')}
                className={cn(
                  'rounded-xl py-2.5 text-[13px] font-bold transition-all',
                  type === 'neighbor' ? 'bg-white text-ink shadow-sm' : 'text-ink-500',
                )}
              >
                Sąsiedzkie (Darmowe)
              </button>
              <button
                type="button"
                onClick={() => setType('job')}
                className={cn(
                  'rounded-xl py-2.5 text-[13px] font-bold transition-all',
                  type === 'job' ? 'bg-white text-ink shadow-sm' : 'text-ink-500',
                )}
              >
                Praca / Firma (10 zł)
              </button>
            </div>

            {type === 'neighbor' ? (
              <>
                {/* Kind Selector */}
                <div>
                  <label className="text-[12px] font-bold uppercase tracking-wider text-ink-400">
                    Rodzaj ogłoszenia
                  </label>
                  <div className="mt-1.5 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setKind('sell')}
                      className={cn(
                        'flex items-center justify-center gap-1.5 rounded-2xl border p-2.5 text-[12.5px] font-bold transition-all',
                        kind === 'sell' ? 'border-ink bg-sand-100 text-ink' : 'border-mist bg-white text-ink-500',
                      )}
                    >
                      <DollarSign className="h-3.5 w-3.5 text-sand-700" />
                      Sprzedam
                    </button>
                    <button
                      type="button"
                      onClick={() => setKind('free')}
                      className={cn(
                        'flex items-center justify-center gap-1.5 rounded-2xl border p-2.5 text-[12.5px] font-bold transition-all',
                        kind === 'free' ? 'border-ink bg-sky-100 text-ink' : 'border-mist bg-white text-ink-500',
                      )}
                    >
                      <Gift className="h-3.5 w-3.5 text-sky-700" />
                      Oddam
                    </button>
                    <button
                      type="button"
                      onClick={() => setKind('lost')}
                      className={cn(
                        'flex items-center justify-center gap-1.5 rounded-2xl border p-2.5 text-[12.5px] font-bold transition-all',
                        kind === 'lost' ? 'border-ink bg-coral-100 text-ink' : 'border-mist bg-white text-ink-500',
                      )}
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-coral-700" />
                      Zgubione
                    </button>
                  </div>
                </div>

                {/* Title input */}
                <label className="block">
                  <span className="text-[12px] font-bold text-ink">Tytuł ogłoszenia</span>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Np. Rower dziecięcy Woom 3, stan bdb"
                    className="mt-1 h-12 w-full rounded-2xl bg-mist px-4 text-[14px] outline-none focus:ring-2 focus:ring-ink"
                  />
                </label>

                {/* Category */}
                <div>
                  <label className="text-[12px] font-bold text-ink">Kategoria</label>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {categories.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        className={cn(
                          'rounded-full px-3 py-1.5 text-[11.5px] font-bold transition-all',
                          category === c ? 'bg-ink text-white' : 'bg-mist text-ink-600 hover:bg-mist-200',
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price input (only if sell) */}
                {kind === 'sell' && (
                  <label className="block">
                    <span className="text-[12px] font-bold text-ink">Cena (zł)</span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Wpisz kwotę, np. 150"
                      className="mt-1 h-12 w-full rounded-2xl bg-mist px-4 text-[14px] outline-none focus:ring-2 focus:ring-ink"
                    />
                  </label>
                )}

                {/* Description */}
                <label className="block">
                  <span className="text-[12px] font-bold text-ink">Opis</span>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Opisz stan, odbiór osobisty, wymiary itp."
                    className="mt-1 w-full rounded-2xl bg-mist p-3.5 text-[14px] outline-none focus:ring-2 focus:ring-ink"
                  />
                </label>

                {/* Photo Selector (Multiple Photos) */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-ink">
                      Zdjęcia w ofercie ({selectedImages.length})
                    </span>
                    <span className="text-[11px] font-medium text-ink-400">
                      Klikaj, aby dodać więcej zdjęć do karuzeli
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {sampleImages.map((src, i) => {
                      const orderIdx = selectedImages.indexOf(src);
                      const isSelected = orderIdx !== -1;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => toggleSampleImage(src)}
                          className={cn(
                            'relative aspect-square overflow-hidden rounded-2xl border-2 transition-all',
                            isSelected ? 'border-coral ring-2 ring-coral/40' : 'border-transparent opacity-60 hover:opacity-90',
                          )}
                        >
                          <img src={src} alt="Podgląd" className="h-full w-full object-cover" />
                          {isSelected && (
                            <>
                              <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-coral text-ink text-[10.5px] font-extrabold shadow">
                                {orderIdx + 1}
                              </span>
                              {orderIdx === 0 && (
                                <span className="absolute inset-x-1 bottom-1 rounded-lg bg-black/70 py-0.5 text-center text-[9.5px] font-bold text-white backdrop-blur-xs">
                                  Główne
                                </span>
                              )}
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              /* Job form */
              <>
                <label className="block">
                  <span className="text-[12px] font-bold text-ink">Stanowisko</span>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Np. Kucharz / Pizzaiolo, Sprzedawca"
                    className="mt-1 h-12 w-full rounded-2xl bg-mist px-4 text-[14px] outline-none focus:ring-2 focus:ring-ink"
                  />
                </label>
                <label className="block">
                  <span className="text-[12px] font-bold text-ink">Nazwa mińskiej firmy</span>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Np. Restauracja Bella Ciao, Motylek Market"
                    className="mt-1 h-12 w-full rounded-2xl bg-mist px-4 text-[14px] outline-none focus:ring-2 focus:ring-ink"
                  />
                </label>
                <label className="block">
                  <span className="text-[12px] font-bold text-ink">Wynagrodzenie</span>
                  <input
                    type="text"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="Np. 5 200 – 6 500 zł"
                    className="mt-1 h-12 w-full rounded-2xl bg-mist px-4 text-[14px] outline-none focus:ring-2 focus:ring-ink"
                  />
                </label>
                <label className="block">
                  <span className="text-[12px] font-bold text-ink">Opis i wymagania</span>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Krótki opis stanowiska, godziny pracy, wymagane doświadczenie..."
                    className="mt-1 w-full rounded-2xl bg-mist p-3.5 text-[14px] outline-none focus:ring-2 focus:ring-ink"
                  />
                </label>
                <div className="rounded-2xl bg-sand-100 p-3 text-[12px] text-ink-700">
                  Publikacja ogłoszenia o pracę na 14 dni kosztuje <b>10 zł brutto</b> (płatność One-Click BLIK).
                </div>
              </>
            )}

            {/* Location badge */}
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-500">
              <MapPin className="h-4 w-4 text-coral" />
              Lokalizacja ogłoszenia: ul. {user.street.name} (Mińsk Maz.)
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-coral text-[15px] font-bold text-ink shadow-coral transition-transform active:scale-95"
            >
              {type === 'neighbor' ? 'Opublikuj ogłoszenie' : 'Przejdź do płatności BLIK (10 zł)'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
