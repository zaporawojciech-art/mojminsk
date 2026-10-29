import { useRef, useState } from 'react';
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  DollarSign,
  Gift,
  HelpCircle,
  Loader2,
  MapPin,
  Trash2,
} from 'lucide-react';
import { NativeHeader, cn } from '../components/ui';
import type { Ad, User } from '../data/mockData';
import { uploadAdImage } from '../lib/storage';

interface AddAdModalProps {
  user: User;
  onClose: () => void;
  onAdCreated: (ad: Ad) => void;
  isClosing?: boolean;
}

export function AddAdModal({
  user,
  onClose,
  onAdCreated,
  isClosing = false,
}: AddAdModalProps) {
  const [kind, setKind] = useState<'sell' | 'free' | 'lost'>('sell');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [negotiable, setNegotiable] = useState(false);
  const [condition, setCondition] = useState<'Nowe' | 'Bardzo dobry' | 'Używane'>('Bardzo dobry');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Meble & Dom');
  const [isCreated, setIsCreated] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleImages = [
    'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=900&q=80', // bike
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80', // sofa
    'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=900&q=80', // desk
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80', // book
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80', // dog
    'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=900&q=80', // lego
  ];

  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    try {
      const uploadedUrls: string[] = [];
      for (const file of files.slice(0, 5)) {
        const url = await uploadAdImage(file, user.profileId);
        uploadedUrls.push(url);
      }
      setSelectedImages((prev) => [...uploadedUrls, ...prev].slice(0, 6));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Nie udało się wgrać zdjęcia.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const toggleSampleImage = (src: string) => {
    setSelectedImages((prev) => {
      if (prev.includes(src)) {
        return prev.filter((item) => item !== src);
      }
      return [...prev, src].slice(0, 6);
    });
  };

  const categories = [
    'Meble & Dom',
    'Elektronika',
    'Dziecięce',
    'Sport & Rowery',
    'Ogród & Narzędzia',
    'Motoryzacja',
    'Praca',
    'Oddam za darmo',
    'Zgubiłem / Znalazłem',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || uploading) return;

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
      author: user.name,
      authorId: user.profileId,
      description: description.trim() || undefined,
      category,
      condition: kind !== 'lost' && category !== 'Praca' ? condition : undefined,
      negotiable: kind === 'sell' ? negotiable : undefined,
      status: 'active',
      views: 1,
      isOwner: true,
    };

    setIsCreated(true);
    window.setTimeout(() => {
      onAdCreated(newAd);
      onClose();
    }, 450);
  };

  return (
    <div
      className={cn(
        'fixed inset-0 md:relative md:inset-auto md:h-full md:w-full z-50 flex flex-col bg-mist select-none',
        isClosing ? 'native-screen-exit' : 'native-screen-slide',
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-md md:max-w-none flex-col overflow-hidden bg-mist">
        <NativeHeader
          title="Dodaj ogłoszenie"
          backLabel="Wróć"
          onBack={onClose}
        />

        {isCreated ? (
          <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="mt-4 font-display text-[22px] font-bold text-ink">
              Ogłoszenie opublikowane!
            </h3>
            <p className="mt-1 text-[13.5px] text-ink-500 max-w-[280px]">
              Twoja oferta jest już widoczna dla sąsiadów z ulicy {user.street.name} i całego Mińska.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 md:px-8 lg:px-12 md:py-6 space-y-3.5 md:space-y-0 md:grid md:grid-cols-12 md:gap-6 md:items-start">
              {/* LEFT COLUMN (Form Fields on Desktop) */}
              <div className="space-y-3.5 md:space-y-4 md:col-span-7 lg:col-span-8">
                {/* Kind Selector */}
                <div className="md:rounded-2xl md:border md:border-mist-200 md:bg-white md:p-5 md:shadow-xs">
                  <label className="text-[12px] font-bold uppercase tracking-wider text-ink-500">
                    Rodzaj ogłoszenia
                  </label>
                  <div className="mt-1.5 md:mt-2.5 grid grid-cols-3 gap-2 md:gap-3">
                    <button
                      type="button"
                      onClick={() => setKind('sell')}
                      className={cn(
                        'flex items-center justify-center gap-1.5 rounded-2xl md:rounded-xl p-3 text-[13px] font-bold transition-all cursor-pointer',
                        kind === 'sell'
                          ? 'bg-ink text-white shadow-card'
                          : 'bg-white md:bg-mist text-ink-700 hover:bg-mist-200',
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
                        'flex items-center justify-center gap-1.5 rounded-2xl md:rounded-xl p-3 text-[13px] font-bold transition-all cursor-pointer',
                        kind === 'free'
                          ? 'bg-ink text-white shadow-card'
                          : 'bg-white md:bg-mist text-ink-700 hover:bg-mist-200',
                      )}
                    >
                      <Gift className="h-4 w-4 text-sky" />
                      Oddam za darmo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setKind('lost');
                        setPrice('');
                      }}
                      className={cn(
                        'flex items-center justify-center gap-1.5 rounded-2xl md:rounded-xl p-3 text-[13px] font-bold transition-all cursor-pointer',
                        kind === 'lost'
                          ? 'bg-ink text-white shadow-card'
                          : 'bg-white md:bg-mist text-ink-700 hover:bg-mist-200',
                      )}
                    >
                      <HelpCircle className="h-4 w-4 text-coral" />
                      Zgubione / Znalezione
                    </button>
                  </div>
                </div>

                {/* Main Details Card: Title, Price & Condition */}
                <div className="space-y-3 md:space-y-4 rounded-3xl md:rounded-2xl md:border md:border-mist-200 bg-white p-4 md:p-5 shadow-card md:shadow-xs">
                  <div>
                    <label className="text-[12px] font-bold text-ink-700">Tytuł ogłoszenia</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Np. Rower dziecięcy Woom 3, stan bdb"
                      className="mt-1 h-12 md:h-11 w-full rounded-2xl md:rounded-xl border border-mist-300 bg-mist/50 px-3.5 text-[14px] font-semibold text-ink outline-none focus:border-ink focus:bg-white"
                    />
                  </div>

                  <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
                    {kind === 'sell' && (
                      <div>
                        <label className="text-[12px] font-bold text-ink-700">Cena (zł)</label>
                        <div className="mt-1 flex items-center gap-2.5">
                          <div className="relative flex-1">
                            <input
                              type="number"
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                              placeholder="np. 150"
                              className="h-12 md:h-11 w-full rounded-2xl md:rounded-xl border border-mist-300 bg-mist/50 px-3.5 pr-10 text-[15px] font-extrabold text-ink outline-none focus:border-ink focus:bg-white"
                            />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] font-bold text-ink-400">
                              zł
                            </span>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer select-none rounded-2xl md:rounded-xl border border-mist-300 bg-mist/40 px-3.5 h-12 md:h-11 shrink-0">
                            <input
                              type="checkbox"
                              checked={negotiable}
                              onChange={(e) => setNegotiable(e.target.checked)}
                              className="h-4 w-4 rounded accent-ink"
                            />
                            <span className="text-[12px] font-bold text-ink-700">Do negocjacji</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {kind !== 'lost' && (
                      <div className={cn(kind !== 'sell' && 'md:col-span-2')}>
                        <label className="text-[12px] font-bold text-ink-700">Stan przedmiotu</label>
                        <div className="mt-1 grid grid-cols-3 gap-1.5">
                          {(['Nowe', 'Bardzo dobry', 'Używane'] as const).map((cond) => (
                            <button
                              key={cond}
                              type="button"
                              onClick={() => setCondition(cond)}
                              className={cn(
                                'h-10 md:h-11 rounded-xl text-[12px] font-bold transition-all cursor-pointer',
                                condition === cond
                                  ? 'bg-ink text-white shadow-xs'
                                  : 'bg-mist text-ink-600 hover:bg-mist-200',
                              )}
                            >
                              {cond}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Category & Description Card */}
                <div className="space-y-3 md:space-y-4 rounded-3xl md:rounded-2xl md:border md:border-mist-200 bg-white p-4 md:p-5 shadow-card md:shadow-xs">
                  <div>
                    <label className="text-[12px] font-bold text-ink-700">Kategoria</label>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {categories.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCategory(c)}
                          className={cn(
                            'rounded-full md:rounded-xl px-3 py-1.5 text-[11.5px] font-bold transition-all cursor-pointer',
                            category === c
                              ? 'bg-ink text-white'
                              : 'bg-mist text-ink-600 hover:bg-mist-200',
                          )}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[12px] font-bold text-ink-700">Opis ogłoszenia</label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Opisz stan przedmiotu, wymiary oraz preferowane godziny odbioru osobistego..."
                      className="mt-1 w-full rounded-2xl md:rounded-xl border border-mist-300 bg-mist/50 p-3.5 text-[13.5px] leading-relaxed text-ink outline-none focus:border-ink focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN (Photos, Location Badge & Desktop Submit) */}
              <div className="space-y-3.5 md:space-y-4 md:col-span-5 lg:col-span-4 md:sticky md:top-2">
                {/* Photos Card */}
                <div className="rounded-3xl md:rounded-2xl md:border md:border-mist-200 bg-white p-4 md:p-5 shadow-card md:shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-ink-700">
                      Zdjęcia ogłoszenia ({selectedImages.length}/6)
                    </span>
                    <span className="text-[11px] font-medium text-ink-400">
                      Z aparatu lub galerii
                    </span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFilesSelected}
                    className="hidden"
                  />

                  <div className="mt-2.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className={cn(
                        'w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-4 text-[13px] font-bold transition-all cursor-pointer',
                        uploading
                          ? 'border-mist-300 bg-mist/60 text-ink-400 cursor-not-allowed'
                          : 'border-mist-300 bg-sand-50/70 text-ink hover:border-coral hover:bg-sand-100',
                      )}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-5 w-5 text-coral animate-spin" />
                          <span>Wgrywanie zdjęć do chmury...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="h-5 w-5 text-coral shrink-0" />
                          <span>Wybierz lub zrób zdjęcie telefonem</span>
                        </>
                      )}
                    </button>
                  </div>

                  {uploadError && (
                    <div className="mt-2 rounded-xl bg-coral/15 p-2.5 text-[12px] font-medium text-coral-800">
                      {uploadError}
                    </div>
                  )}

                  {selectedImages.length > 0 ? (
                    <div className="mt-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400 mb-1.5">
                        Wybrane zdjęcia (pierwsze to miniaturka):
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedImages.map((src, i) => (
                          <div
                            key={i}
                            className="relative aspect-square overflow-hidden rounded-2xl md:rounded-xl border border-mist-200 ring-1 ring-mist-300 group"
                          >
                            <img src={src} alt="Zdjęcie" className="h-full w-full object-cover" />
                            {i === 0 && (
                              <span className="absolute inset-x-1 bottom-1 rounded-lg bg-black/75 py-0.5 text-center text-[9.5px] font-bold text-white backdrop-blur-xs">
                                Główne
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(i)}
                              aria-label="Usuń zdjęcie"
                              className="absolute top-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-ink/80 text-white hover:bg-coral transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3.5 pt-3 border-t border-mist-200">
                      <p className="text-[11.5px] font-medium text-ink-500 mb-2">
                        Lub wybierz gotowe zdjęcie poglądowe:
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {sampleImages.map((src, i) => {
                          const isSelected = selectedImages.includes(src);
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => toggleSampleImage(src)}
                              className={cn(
                                'relative aspect-square overflow-hidden rounded-2xl md:rounded-xl border-2 transition-all cursor-pointer',
                                isSelected
                                  ? 'border-coral ring-2 ring-coral/40'
                                  : 'border-transparent opacity-60 hover:opacity-90',
                              )}
                            >
                              <img src={src} alt="Podgląd" className="h-full w-full object-cover" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Street Location Badge */}
                  <div className="mt-3.5 flex items-center gap-2 rounded-2xl md:rounded-xl bg-sand-100/80 px-3.5 py-2.5 text-[12px] font-semibold text-ink-700">
                    <MapPin className="h-4 w-4 shrink-0 text-coral-700" />
                    <span>
                      Lokalizacja: <strong className="font-bold text-ink">ul. {user.street.name}</strong> · Mińsk Mazowiecki
                    </span>
                  </div>

                  {/* Desktop Submit Button inside right card */}
                  <div className="hidden md:block mt-4 pt-4 border-t border-mist-200">
                    <button
                      type="submit"
                      disabled={uploading || !title.trim()}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-[13.5px] font-bold text-white shadow-sm hover:bg-ink-800 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Wgrywanie zdjęć...
                        </>
                      ) : (
                        <>
                          Opublikuj ogłoszenie
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Sticky Bottom Action Bar */}
            <div className="md:hidden border-t border-mist bg-white px-5 py-3 pb-[max(env(safe-area-inset-bottom),14px)] shrink-0 shadow-float">
              <button
                type="submit"
                disabled={uploading || !title.trim()}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-[14px] font-bold text-white shadow-card transition-transform active:scale-95 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Wgrywanie zdjęć...
                  </>
                ) : (
                  <>
                    Opublikuj ogłoszenie
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
