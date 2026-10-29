import { useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  DollarSign,
  Gift,
  HelpCircle,
  Loader2,
  Save,
  Trash2,
} from 'lucide-react';
import { NativeHeader, cn } from '../components/ui';
import type { Ad, User } from '../data/mockData';
import { uploadAdImage } from '../lib/storage';

interface EditAdModalProps {
  ad: Ad;
  user: User;
  onClose: () => void;
  onAdUpdated: (ad: Ad) => void;
  isClosing?: boolean;
}

export function EditAdModal({ ad, user, onClose, onAdUpdated, isClosing = false }: EditAdModalProps) {
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

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setSelectedImages((prev) => {
      const next = prev.filter((_, i) => i !== indexToRemove);
      return next.length > 0 ? next : [ad.image];
    });
  };

  const categories = [
    'Meble & Dom',
    'Dziecięce',
    'Elektronika',
    'Sport & Rowery',
    'Ogród & Narzędzia',
    'Motoryzacja',
    'Praca',
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
        'fixed inset-0 md:relative md:inset-auto md:h-full md:w-full z-50 flex flex-col bg-mist select-none',
        isClosing ? 'native-screen-exit' : 'native-screen-slide',
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-md md:max-w-none flex-col overflow-hidden bg-mist">
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
            <div className="flex-1 overflow-y-auto overscroll-contain p-5 md:px-8 lg:px-12 md:py-6 space-y-4 md:space-y-0 md:grid md:grid-cols-12 md:gap-6 md:items-start">
              {/* LEFT COLUMN (Form Fields on Desktop) */}
              <div className="space-y-4 md:col-span-7 lg:col-span-8">
                {/* Type & Status Switcher Row */}
                <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
                  {/* Type Switcher */}
                  <div className="md:rounded-2xl md:border md:border-mist-200 md:bg-white md:p-4 md:shadow-xs">
                    <label className="text-[12px] font-bold uppercase tracking-wider text-ink-500">
                      Typ ogłoszenia
                    </label>
                    <div className="mt-1.5 md:mt-2 grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setKind('sell')}
                        className={cn(
                          'flex items-center justify-center gap-1.5 rounded-2xl md:rounded-xl p-3 md:py-2.5 text-[12.5px] font-bold transition-all cursor-pointer',
                          kind === 'sell' ? 'bg-ink text-white shadow-card' : 'bg-white md:bg-mist text-ink-700 hover:bg-mist-200',
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
                          'flex items-center justify-center gap-1.5 rounded-2xl md:rounded-xl p-3 md:py-2.5 text-[12.5px] font-bold transition-all cursor-pointer',
                          kind === 'free' ? 'bg-ink text-white shadow-card' : 'bg-white md:bg-mist text-ink-700 hover:bg-mist-200',
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
                          'flex items-center justify-center gap-1.5 rounded-2xl md:rounded-xl p-3 md:py-2.5 text-[12.5px] font-bold transition-all cursor-pointer',
                          kind === 'lost' ? 'bg-ink text-white shadow-card' : 'bg-white md:bg-mist text-ink-700 hover:bg-mist-200',
                        )}
                      >
                        <HelpCircle className="h-4 w-4 text-coral" />
                        Zgubiłem
                      </button>
                    </div>
                  </div>

                  {/* Status Switcher */}
                  <div className="rounded-3xl md:rounded-2xl md:border md:border-mist-200 bg-white p-4 shadow-card md:shadow-xs">
                    <label className="text-[12px] font-bold uppercase tracking-wider text-ink-400">
                      Status ogłoszenia
                    </label>
                    <div className="mt-2 grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setStatus('active')}
                        className={cn(
                          'rounded-xl py-2.5 text-[12px] font-bold transition-all cursor-pointer',
                          status === 'active' ? 'bg-emerald-600 text-white shadow' : 'bg-mist text-ink-600',
                        )}
                      >
                        Aktywne
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus('reserved')}
                        className={cn(
                          'rounded-xl py-2.5 text-[12px] font-bold transition-all cursor-pointer',
                          status === 'reserved' ? 'bg-amber-500 text-white shadow' : 'bg-mist text-ink-600',
                        )}
                      >
                        Zarezerwowane
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus('sold')}
                        className={cn(
                          'rounded-xl py-2.5 text-[12px] font-bold transition-all cursor-pointer',
                          status === 'sold' ? 'bg-ink text-white shadow' : 'bg-mist text-ink-600',
                        )}
                      >
                        Zakończone
                      </button>
                    </div>
                  </div>
                </div>

                {/* Title & Price */}
                <div className="space-y-3 md:space-y-4 rounded-3xl md:rounded-2xl md:border md:border-mist-200 bg-white p-4 md:p-5 shadow-card md:shadow-xs">
                  <div>
                    <label className="text-[12px] font-bold text-ink-700">Tytuł ogłoszenia</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="np. Biurko dębowe, stan idealny"
                      className="mt-1 h-12 md:h-11 w-full rounded-2xl md:rounded-xl border border-mist-300 bg-mist/50 px-3.5 text-[15px] font-semibold text-ink outline-none focus:border-ink focus:bg-white"
                    />
                  </div>

                  <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
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
                              className="h-12 md:h-11 w-full rounded-2xl md:rounded-xl border border-mist-300 bg-mist/50 px-3.5 pr-8 text-[16px] font-bold text-ink outline-none focus:border-ink focus:bg-white"
                            />
                            <span className="absolute right-3.5 top-3 text-[14px] font-bold text-ink-400">zł</span>
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

                    <div className={cn(kind !== 'sell' && 'md:col-span-2')}>
                      <label className="text-[12px] font-bold text-ink-700">Kategoria</label>
                      <div className="mt-1 relative">
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="h-12 md:h-11 w-full rounded-2xl md:rounded-xl border border-mist-300 bg-mist/50 px-3.5 text-[14px] font-semibold text-ink outline-none focus:border-ink focus:bg-white"
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
                </div>

                {/* Description */}
                <div className="rounded-3xl md:rounded-2xl md:border md:border-mist-200 bg-white p-4 md:p-5 shadow-card md:shadow-xs">
                  <label className="text-[12px] font-bold text-ink-700">Opis ogłoszenia</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Opisz stan przedmiotu, wymiary, piętro odbioru itp."
                    className="mt-1 w-full rounded-2xl md:rounded-xl border border-mist-300 bg-mist/50 p-3.5 text-[14px] text-ink outline-none focus:border-ink focus:bg-white resize-none"
                  />
                </div>
              </div>

              {/* RIGHT COLUMN (Photo Selector & Desktop Save CTA) */}
              <div className="space-y-4 md:col-span-5 lg:col-span-4 md:sticky md:top-2">
                {/* Photo Selector */}
                <div className="rounded-3xl md:rounded-2xl md:border md:border-mist-200 bg-white p-4 md:p-5 shadow-card md:shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-ink-700">
                      Zdjęcia ogłoszenia ({selectedImages.length}/6)
                    </span>
                    <span className="text-[11px] font-medium text-ink-400">
                      Zmień lub dodaj nowe
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
                        'w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-3 text-[12.5px] font-bold transition-all cursor-pointer',
                        uploading
                          ? 'border-mist-300 bg-mist/60 text-ink-400 cursor-not-allowed'
                          : 'border-mist-300 bg-sand-50/70 text-ink hover:border-coral hover:bg-sand-100',
                      )}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4.5 w-4.5 text-coral animate-spin" />
                          <span>Wgrywanie zdjęć...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="h-4.5 w-4.5 text-coral shrink-0" />
                          <span>Dodaj nowe zdjęcia z telefonu</span>
                        </>
                      )}
                    </button>
                  </div>

                  {uploadError && (
                    <div className="mt-2 rounded-xl bg-coral/15 p-2.5 text-[12px] font-medium text-coral-800">
                      {uploadError}
                    </div>
                  )}

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {selectedImages.map((imgUrl, i) => (
                      <div
                        key={i}
                        className="relative aspect-square overflow-hidden rounded-2xl md:rounded-xl border border-mist-200 ring-1 ring-mist-300 group"
                      >
                        <img src={imgUrl} alt="" className="h-full w-full object-cover" />
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

                  {/* Desktop Save Button */}
                  <div className="hidden md:block mt-4 pt-4 border-t border-mist-200">
                    <button
                      type="submit"
                      disabled={uploading || !title.trim()}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-[13.5px] font-bold text-white shadow-sm hover:bg-ink-800 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Zapisywanie...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Zapisz zmiany
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Bottom Actions */}
            <div className="md:hidden border-t border-mist bg-white px-4 py-2.5 pb-[max(env(safe-area-inset-bottom),14px)] shrink-0 shadow-float">
              <button
                type="submit"
                disabled={uploading || !title.trim()}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-[14.5px] font-bold text-white shadow-sm hover:bg-ink-700 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    Zapisywanie...
                  </>
                ) : (
                  <>
                    <Save className="h-4.5 w-4.5" />
                    Zapisz zmiany
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
