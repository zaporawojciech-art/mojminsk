import { useState } from 'react';
import {
  ArrowRight,
  DollarSign,
  Gift,
  HelpCircle,
  MapPin,
  X,
} from 'lucide-react';
import { cn } from '../components/ui';
import type { Ad, Job, User } from '../data/mockData';

interface AddAdModalProps {
  user: User;
  onClose: () => void;
  onAdCreated: (ad: Ad) => void;
  onJobCreated?: (job: Job) => void;
}

export function AddAdModal({ user, onClose, onAdCreated, onJobCreated }: AddAdModalProps) {
  const [type, setType] = useState<'neighbor' | 'job'>('neighbor');
  const [kind, setKind] = useState<'sell' | 'free' | 'lost'>('sell');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Meble & Dom');
  const [companyName, setCompanyName] = useState('');
  const [salary, setSalary] = useState('');
  const [imageIndex, setImageIndex] = useState(0);

  const sampleImages = [
    'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=600&q=80', // bike
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80', // sofa
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80', // book
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80', // dog
  ];

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
      const newAd: Ad = {
        id: `ad_${Date.now()}`,
        title: title.trim(),
        price: kind === 'sell' && price ? parseFloat(price) : null,
        kind,
        street: user.street.name,
        time: 'Przed chwilą',
        image: sampleImages[imageIndex],
        author: `${user.name} ${user.street.as}`,
      };
      onAdCreated(newAd);
      onClose();
    } else {
      if (onJobCreated) {
        const newJob: Job = {
          id: `job_${Date.now()}`,
          company: companyName.trim() || 'Lokalna firma',
          position: title.trim(),
          salary: salary.trim() || 'Do negocjacji',
          period: 'brutto / mies.',
          tags: ['Pełny etat', `ul. ${user.street.name}`],
          time: 'Dziś',
          tone: 'coral',
        };
        onJobCreated(newJob);
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/75 backdrop-blur-sm sm:items-center">
      <div className="max-h-[92dvh] w-full max-w-[440px] overflow-y-auto rounded-t-[36px] bg-white p-5 shadow-float sm:rounded-[36px]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-mist">
          <div>
            <h2 className="font-display text-[20px] font-semibold text-ink">Nowe ogłoszenie</h2>
            <p className="text-[12px] text-ink-500">Dodajesz jako: {user.name} {user.street.as}</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-mist text-ink hover:bg-mist-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
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

              {/* Photo Selector */}
              <div>
                <span className="text-[12px] font-bold text-ink">Zdjęcie przedmiotu</span>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {sampleImages.map((src, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setImageIndex(i)}
                      className={cn(
                        'relative aspect-square overflow-hidden rounded-2xl border-2 transition-all',
                        imageIndex === i ? 'border-coral ring-2 ring-coral' : 'border-transparent opacity-60',
                      )}
                    >
                      <img src={src} alt="Podgląd" className="h-full w-full object-cover" />
                      {imageIndex === i && (
                        <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-coral text-ink text-[10px] font-bold">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
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
            {type === 'neighbor' ? 'Opublikuj ogłoszenie' : 'Opłać BLIK-iem 10 zł i opublikuj'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
