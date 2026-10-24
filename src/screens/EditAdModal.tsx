import { useState } from 'react';
import {
  CheckCircle2,
  DollarSign,
  Gift,
  HelpCircle,
  Save,
} from 'lucide-react';
import { NativeHeader, cn } from '../components/ui';
import type { Ad, User } from '../data/mockData';

interface EditAdModalProps {
  ad: Ad;
  user: User;
  onClose: () => void;
  onAdUpdated: (ad: Ad) => void;
  isClosing?: boolean;
}

export function EditAdModal({ ad, user: _user, onClose, onAdUpdated, isClosing = false }: EditAdModalProps) {
  const [kind, setKind] = useState<'sell' | 'free' | 'lost'>(ad.kind);
  const [title, setTitle] = useState(ad.title);
  const [price, setPrice] = useState(ad.price !== null ? String(ad.price) : '');
  const [negotiable, setNegotiable] = useState(ad.negotiable ?? false);
  const [description, setDescription] = useState(ad.description ?? '');
  const [category, setCategory] = useState(ad.category ?? 'Meble & Dom');
  const [status, setStatus] = useState<'active' | 'reserved' | 'sold'>(ad.status ?? 'active');
  const initialPhotos = ad.images && ad.images.length > 0 ? ad.images : [ad.image];
  const [selectedImages, setSelectedImages] = useState<string[]>(initialPhotos);
  const [isSaved, setIsSaved] = useState(false);

  const rawPool = [
    ...initialPhotos,
    'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=900&q=80', // bike
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80', // sofa
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80', // book
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80', // pet
    'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=900&q=80', // toys
  ];
  const sampleImages = Array.from(new Set(rawPool)).slice(0, 6);

  const toggleImage = (imgUrl: string) => {
    setSelectedImages((prev) => {
      if (prev.includes(imgUrl)) {
        return prev.length > 1 ? prev.filter((item) => item !== imgUrl) : prev;
      }
      return [...prev, imgUrl];
    });
  };

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

    const photos = selectedImages.length > 0 ? selectedImages : [ad.image];
    const updatedAd: Ad = {
      ...ad,
      title: title.trim(),
      kind,
      price: kind === 'sell' && price ? parseFloat(price) : null,
      negotiable: kind === 'sell' ? negotiable : false,
      description: description.trim() || undefined,
      category,
      status,
      image: photos[0],
      images: photos,
    };

    setIsSaved(true);
    setTimeout(() => {
      onAdUpdated(updatedAd);
      onClose();
    }, 600);
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col bg-mist select-none',
        isClosing ? 'native-screen-exit' : 'native-screen-slide',
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden bg-mist">
        {/* Top Native Header */}
        <NativeHeader
          title="Edytuj ogłoszenie"
          backLabel="Wróć"
          onBack={onClose}
        />

        {isSaved ? (
          <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="mt-4 font-display text-[22px] font-bold text-ink">Zmiany zostały zapisane!</h3>
            <p className="mt-1 text-[13.5px] text-ink-500 max-w-[280px]">
              Twoje ogłoszenie zostało zaktualizowane dla wszystkich sąsiadów z Mińska.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="text-[12px] font-bold uppercase tracking-wider text-ink-500">
                  Typ ogłoszenia
                </label>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setKind('sell')}
                    className={cn(
                      'flex items-center justify-center gap-1.5 rounded-2xl p-3 text-[13px] font-bold transition-all',
                      kind === 'sell' ? 'bg-ink text-white shadow-card' : 'bg-white text-ink-700 hover:bg-mist-200',
                    )}
                  >
                    <DollarSign className="h-4 w-4 text-sand" />
                    Sprzedam
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setKind('free');
                      setPrice('');
                    }}
                    className={cn(
                      'flex items-center justify-center gap-1.5 rounded-2xl p-3 text-[13px] font-bold transition-all',
                      kind === 'free' ? 'bg-ink text-white shadow-card' : 'bg-white text-ink-700 hover:bg-mist-200',
                    )}
                  >
                    <Gift className="h-4 w-4 text-sky" />
                    Oddam
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setKind('lost');
                      setPrice('');
                    }}
                    className={cn(
                      'flex items-center justify-center gap-1.5 rounded-2xl p-3 text-[13px] font-bold transition-all',
                      kind === 'lost' ? 'bg-ink text-white shadow-card' : 'bg-white text-ink-700 hover:bg-mist-200',
                    )}
                  >
                    <HelpCircle className="h-4 w-4 text-coral" />
                    Zgubiłem
                  </button>
                </div>
              </div>

              {/* Status Switcher */}
              <div className="rounded-3xl bg-white p-4 shadow-card">
                <label className="text-[12px] font-bold uppercase tracking-wider text-ink-400">
                  Status ogłoszenia
                </label>
                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setStatus('active')}
                    className={cn(
                      'rounded-xl py-2 text-[12px] font-bold transition-all',
                      status === 'active' ? 'bg-emerald-600 text-white shadow' : 'bg-mist text-ink-600',
                    )}
                  >
                    Aktywne
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('reserved')}
                    className={cn(
                      'rounded-xl py-2 text-[12px] font-bold transition-all',
                      status === 'reserved' ? 'bg-amber-500 text-white shadow' : 'bg-mist text-ink-600',
                    )}
                  >
                    Zarezerwowane
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('sold')}
                    className={cn(
                      'rounded-xl py-2 text-[12px] font-bold transition-all',
                      status === 'sold' ? 'bg-ink text-white shadow' : 'bg-mist text-ink-600',
                    )}
                  >
                    Zakończone
                  </button>
                </div>
              </div>

              {/* Title & Price */}
              <div className="space-y-3 rounded-3xl bg-white p-4 shadow-card">
                <div>
                  <label className="text-[12px] font-bold text-ink-700">Tytuł ogłoszenia</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="np. Biurko dębowe, stan idealny"
                    className="mt-1 h-12 w-full rounded-2xl border border-mist-300 bg-mist/50 px-3.5 text-[15px] font-semibold text-ink outline-none focus:border-ink focus:bg-white"
                  />
                </div>

                {kind === 'sell' && (
                  <div>
                    <label className="text-[12px] font-bold text-ink-700">Cena (zł)</label>
                    <div className="mt-1 flex items-center gap-3">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="0.00"
                          className="h-12 w-full rounded-2xl border border-mist-300 bg-mist/50 px-3.5 pr-8 text-[16px] font-bold text-ink outline-none focus:border-ink focus:bg-white"
                        />
                        <span className="absolute right-3.5 top-3.5 text-[14px] font-bold text-ink-400">zł</span>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={negotiable}
                          onChange={(e) => setNegotiable(e.target.checked)}
                          className="h-4 w-4 rounded accent-coral"
                        />
                        <span className="text-[12.5px] font-semibold text-ink-600">Do negocjacji</span>
                      </label>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[12px] font-bold text-ink-700">Kategoria</label>
                  <div className="mt-1 relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-mist-300 bg-mist/50 px-3.5 text-[14px] font-semibold text-ink outline-none focus:border-ink focus:bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Photo Selector */}
              <div className="rounded-3xl bg-white p-4 shadow-card">
                <label className="text-[12px] font-bold uppercase tracking-wider text-ink-400 flex items-center justify-between">
                  <span>Zdjęcia w ofercie ({selectedImages.length})</span>
                  <span className="text-[11px] font-normal text-ink-500">Kliknij, aby dodać / usunąć</span>
                </label>
                <div className="mt-2.5 grid grid-cols-3 gap-2">
                  {sampleImages.map((imgUrl, i) => {
                    const orderIdx = selectedImages.indexOf(imgUrl);
                    const isSelected = orderIdx !== -1;
                    return (
                      <div
                        key={i}
                        onClick={() => toggleImage(imgUrl)}
                        className={cn(
                          'relative aspect-square cursor-pointer overflow-hidden rounded-2xl border-2 transition-all',
                          isSelected ? 'border-coral ring-2 ring-coral/40' : 'border-transparent opacity-70 hover:opacity-100',
                        )}
                      >
                        <img src={imgUrl} alt="" className="h-full w-full object-cover" />
                        {isSelected && (
                          <>
                            <div className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-coral text-ink text-[10.5px] font-extrabold shadow">
                              {orderIdx + 1}
                            </div>
                            {orderIdx === 0 && (
                              <span className="absolute inset-x-1 bottom-1 rounded-lg bg-black/70 py-0.5 text-center text-[9.5px] font-bold text-white backdrop-blur-xs">
                                Główne
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div className="rounded-3xl bg-white p-4 shadow-card">
                <label className="text-[12px] font-bold text-ink-700">Opis ogłoszenia</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Opisz stan przedmiotu, wymiary, piętro odbioru itp."
                  className="mt-1 w-full rounded-2xl border border-mist-300 bg-mist/50 p-3.5 text-[14px] text-ink outline-none focus:border-ink focus:bg-white resize-none"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-mist bg-white px-5 py-3 pb-[max(env(safe-area-inset-bottom),14px)] shrink-0 shadow-float">
              <button
                type="submit"
                disabled={!title.trim()}
                className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-coral text-[15px] font-bold text-ink shadow-coral transition-transform active:scale-95 disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                Zapisz zmiany w ogłoszeniu
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
