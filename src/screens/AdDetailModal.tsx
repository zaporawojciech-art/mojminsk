import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  Eye,
  Heart,
  HeartHandshake,
  MapPin,
  Maximize2,
  MessageCircle,
  Share2,
  ShieldAlert,
  Tag,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Img, StreetPill, cn, zl } from '../components/ui';
import { avatarUrl, type Ad, type User } from '../data/mockData';

interface AdDetailModalProps {
  ad: Ad;
  user: User;
  isLiked?: boolean;
  onClose: () => void;
  onToggleLike?: (adId: string) => void;
  onChatClick?: (ad: Ad) => void;
  onReportClick?: (ad: Ad) => void;
  onStatusChange?: (adId: string, status: 'active' | 'reserved' | 'sold') => void;
  onDelete?: (adId: string) => void;
  onSellerClick?: (sellerName: string, sellerStreet: string) => void;
  onEditClick?: (ad: Ad) => void;
  onReserveClick?: (ad: Ad) => void;
  isClosing?: boolean;
}

export function AdDetailModal({
  ad,
  user,
  isLiked = false,
  onClose,
  onToggleLike,
  onChatClick,
  onReportClick,
  onStatusChange,
  onDelete,
  onSellerClick,
  onEditClick,
  onReserveClick,
  isClosing = false,
}: AdDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const isOwner = Boolean(
    ad.isOwner ||
      (user.profileId && ad.authorId && ad.authorId === user.profileId) ||
      (!ad.authorId && ad.author.toLowerCase().trim() === user.name.toLowerCase().trim()),
  );
  const currentStatus = ad.status ?? 'active';
  const scrollRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const lightboxStageRef = useRef<HTMLDivElement>(null);

  const photos = ad.images && ad.images.length > 0 ? ad.images : [ad.image];
  const sellerSeed = isOwner ? user.seed : `${ad.author}-${ad.street}`;

  useLayoutEffect(() => {
    setActivePhotoIdx(0);
    setIsLightboxOpen(false);
    setIsZoomed(false);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = 0;
    }
    if (lightboxStageRef.current) {
      lightboxStageRef.current.scrollLeft = 0;
    }
  }, [ad.id]);

  const scrollToPhoto = (idx: number) => {
    const clamped = Math.max(0, Math.min(photos.length - 1, idx));
    setActivePhotoIdx(clamped);
    if (carouselRef.current) {
      const width = carouselRef.current.clientWidth;
      carouselRef.current.scrollTo({ left: width * clamped, behavior: 'smooth' });
    }
    if (lightboxStageRef.current) {
      const width = lightboxStageRef.current.clientWidth;
      lightboxStageRef.current.scrollTo({ left: width * clamped, behavior: 'smooth' });
    }
  };

  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, clientWidth } = carouselRef.current;
    if (clientWidth === 0) return;
    const idx = Math.round(scrollLeft / clientWidth);
    if (idx !== activePhotoIdx && idx >= 0 && idx < photos.length) {
      setActivePhotoIdx(idx);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${ad.title} — mójMińsk`,
      text: `Zobacz ogłoszenie sąsiedzkie w Mińsku Mazowieckim: ${ad.title}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled share
      }
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const floatBtn =
    'grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink shadow-md backdrop-blur transition-transform active:scale-90';

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col bg-mist select-none overflow-hidden',
        isClosing ? 'native-screen-exit' : 'native-screen-slide',
      )}
    >
      {/* =====================================================================
       * 1. MOBILE VIEW (< 768px) — Native Mobile Sheet & Carousel
       * =================================================================== */}
      <div className="relative mx-auto flex h-full w-full max-w-md flex-col overflow-hidden bg-mist md:hidden">
        {/* Floating controls over the full-bleed photo */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),12px)]">
          <button
            type="button"
            onClick={onClose}
            aria-label="Wróć do ogłoszeń"
            className={cn(floatBtn, 'pointer-events-auto')}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <div className="pointer-events-auto flex items-center gap-2">
            <button type="button" onClick={handleShare} aria-label="Udostępnij" className={floatBtn}>
              {copied ? (
                <Check className="h-4 w-4 text-emerald-600" aria-hidden />
              ) : (
                <Share2 className="h-4 w-4" aria-hidden />
              )}
            </button>
            <button
              type="button"
              onClick={() => onToggleLike?.(ad.id)}
              aria-label={isLiked ? 'Usuń z obserwowanych' : 'Obserwuj'}
              className={floatBtn}
            >
              <Heart
                className={cn('h-4 w-4 transition-colors', isLiked && 'fill-coral text-coral')}
                aria-hidden
              />
            </button>
          </div>
        </div>

        {/* Scrollable Screen Content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain pb-24">
          <div className="relative aspect-[4/4.3] w-full bg-ink-900 overflow-hidden">
            <div
              ref={carouselRef}
              onScroll={handleCarouselScroll}
              className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scrollbar-none"
            >
              {photos.map((photoUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setIsZoomed(false);
                    setIsLightboxOpen(true);
                  }}
                  className="relative h-full w-full shrink-0 snap-center cursor-zoom-in"
                >
                  <Img
                    src={photoUrl}
                    alt={`${ad.title} — zdjęcie ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
                </div>
              ))}
            </div>

            <div className="pointer-events-none absolute inset-x-4 bottom-10 z-20 flex items-end justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {currentStatus === 'reserved' && (
                  <span className="rounded-full bg-amber-400 px-2.5 py-1 text-[10.5px] font-bold text-ink shadow">
                    Zarezerwowane
                  </span>
                )}
                {currentStatus === 'sold' && (
                  <span className="rounded-full bg-ink-800/90 backdrop-blur-xs px-2.5 py-1 text-[10.5px] font-bold text-white shadow">
                    Zakończone / Sprzedane
                  </span>
                )}
                {ad.kind === 'free' && (
                  <span className="rounded-full bg-sky px-2.5 py-1 text-[10.5px] font-bold text-ink shadow">
                    Oddam za darmo
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsZoomed(false);
                  setIsLightboxOpen(true);
                }}
                className="pointer-events-auto flex shrink-0 items-center gap-1.5 rounded-full bg-black/65 px-3 py-1 text-[11.5px] font-bold text-white backdrop-blur-md shadow"
              >
                <span>
                  {activePhotoIdx + 1} / {photos.length}
                </span>
                <Maximize2 className="h-3 w-3 opacity-85" />
              </button>
            </div>
          </div>

          <div className="relative z-20 -mt-7 rounded-t-[28px] bg-white px-5 pb-5 pt-3.5 shadow-[0_-8px_24px_rgba(17,22,29,0.1)]">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-mist-300" />

            {photos.length > 1 && (
              <div className="mb-3.5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {photos.map((thumb, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => scrollToPhoto(idx)}
                    className={cn(
                      'relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border-2 transition-all',
                      idx === activePhotoIdx
                        ? 'border-coral ring-2 ring-coral/30 scale-[1.03]'
                        : 'border-transparent opacity-65',
                    )}
                  >
                    <Img src={thumb} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between gap-2 text-[11.5px] text-ink-400">
              <span className="flex items-center gap-1 font-medium">
                <Clock className="h-3.5 w-3.5" />
                Dodano: {ad.time}
              </span>
              {ad.category && (
                <span className="flex items-center gap-1 rounded-full bg-mist px-2.5 py-0.5 text-[11px] font-bold text-ink-600">
                  <Tag className="h-3 w-3 text-ink-400" />
                  {ad.category}
                </span>
              )}
            </div>

            <h1 className="mt-1.5 text-[18px] font-bold leading-snug text-ink">{ad.title}</h1>

            <div className="mt-2 flex flex-wrap items-baseline gap-2.5">
              <span className="font-display text-[28px] font-extrabold leading-none text-ink">
                {ad.price ? zl(ad.price) : ad.kind === 'free' ? 'Za darmo' : 'Zgłoszenie'}
              </span>
              {ad.negotiable && (
                <span className="rounded-lg bg-sand-100 px-2 py-0.5 text-[11px] font-bold text-sand-900">
                  Do negocjacji
                </span>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-mist pt-3">
              <StreetPill street={`ul. ${ad.street}`} className="bg-sand-100 text-ink-700 text-[12px]" />
              <span className="flex items-center gap-1 text-[11.5px] font-medium text-ink-400">
                <Eye className="h-3.5 w-3.5" />
                {ad.views ?? 38} wyświetleń
              </span>
            </div>
          </div>

          <div className="space-y-3.5 p-4">
            <div className="rounded-3xl bg-white p-4 shadow-card">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-ink-400">Opis ogłoszenia</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-700 whitespace-pre-line">
                {ad.description ||
                  'Ogłoszenie dodane przez mieszkańca Mińska Mazowieckiego. Skontaktuj się ze sprzedającym na czacie, aby ustalić dogodny termin i miejsce odbioru.'}
              </p>
            </div>

            <div
              onClick={() => onSellerClick?.(ad.author, ad.street)}
              className="group cursor-pointer rounded-3xl bg-white p-4 shadow-card"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-ink-400">Sprzedający sąsiad</h3>
                <span className="flex items-center gap-1 text-[11.5px] font-bold text-ink-500">
                  Zobacz profil
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={avatarUrl(sellerSeed)}
                  alt={ad.author}
                  className="h-12 w-12 rounded-2xl bg-sand-100 object-cover ring-1 ring-mist-300"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold text-ink">{ad.author}</p>
                  <p className="text-[12px] text-ink-500">Mieszkaniec Mińska · ul. {ad.street}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!isOwner && (
          <div className="border-t border-mist bg-white px-4 py-2.5 pb-[max(env(safe-area-inset-bottom),14px)] shrink-0 shadow-float space-y-2">
            <div className="flex items-center gap-2.5">
              {currentStatus !== 'sold' && (
                <button
                  onClick={() => onReserveClick?.(ad)}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-mist-300/80 bg-mist/70 text-[14px] font-bold text-ink"
                >
                  <HeartHandshake className="h-4.5 w-4.5 text-coral shrink-0" />
                  Zarezerwuj
                </button>
              )}
              <button
                onClick={() => {
                  onClose();
                  onChatClick?.(ad);
                }}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-ink text-white text-[14px] font-bold"
              >
                <MessageCircle className="h-4.5 w-4.5 shrink-0" />
                Czat
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
       * 2. DESKTOP VIEW (>= 768px) — Full-Width OLX / Allegro Product Subpage
       * =================================================================== */}
      <div className="hidden md:block flex-1 overflow-y-auto w-full px-8 lg:px-12 py-5">
        {/* Top Breadcrumb & Action Bar */}
        <div className="mb-5 flex items-center justify-between border-b border-mist-300 pb-3.5">
          <div className="flex items-center gap-3 text-[13px]">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 font-bold text-ink shadow-card border border-mist-300 hover:bg-mist transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Wróć do ogłoszeń</span>
            </button>
            <span className="text-ink-300">/</span>
            <span className="font-semibold text-ink-500">{ad.category || 'Ogłoszenia sąsiedzkie'}</span>
            <span className="text-ink-300">/</span>
            <span className="font-semibold text-ink-700 truncate max-w-md">{ad.title}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[12.5px] font-bold text-ink shadow-card border border-mist-300 hover:bg-mist transition-colors"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4 text-ink-600" />}
              <span>{copied ? 'Skopiowano link' : 'Udostępnij'}</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleLike?.(ad.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[12.5px] font-bold shadow-card border transition-colors',
                isLiked
                  ? 'bg-coral-50 border-coral text-coral-800'
                  : 'bg-white border-mist-300 text-ink hover:bg-mist',
              )}
            >
              <Heart className={cn('h-4 w-4', isLiked && 'fill-coral text-coral')} />
              <span>{isLiked ? 'Obserwujesz' : 'Obserwuj'}</span>
            </button>
          </div>
        </div>

        {/* 12-Column Product Layout (Left 8 cols: Photo Stage + Description | Right 4 cols: Sticky Buy/Contact Box + Seller) */}
        <div className="grid grid-cols-12 gap-6 items-start pb-12">
          {/* LEFT COLUMN (7 or 8 cols): Large Gallery + Full Description */}
          <div className="col-span-12 lg:col-span-7 xl:col-span-8 space-y-5">
            {/* Photo Gallery Card */}
            <div className="rounded-2xl bg-white p-4 shadow-card border border-mist-200">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-ink-900">
                <Img
                  src={photos[activePhotoIdx]}
                  alt={`${ad.title} — zdjęcie ${activePhotoIdx + 1}`}
                  className="h-full w-full object-contain bg-ink-900 cursor-zoom-in"
                />

                {photos.length > 1 && (
                  <>
                    {activePhotoIdx > 0 && (
                      <button
                        type="button"
                        onClick={() => setActivePhotoIdx((i) => Math.max(0, i - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink shadow-md hover:bg-white transition-all"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                    )}
                    {activePhotoIdx < photos.length - 1 && (
                      <button
                        type="button"
                        onClick={() => setActivePhotoIdx((i) => Math.min(photos.length - 1, i + 1))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink shadow-md hover:bg-white transition-all"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    )}
                  </>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsZoomed(false);
                    setIsLightboxOpen(true);
                  }}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/70 px-3 py-1.5 text-[12px] font-bold text-white backdrop-blur-md hover:bg-black/85 transition-colors"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>Powiększ ({activePhotoIdx + 1}/{photos.length})</span>
                </button>
              </div>

              {/* Thumbnails Strip */}
              {photos.length > 1 && (
                <div className="mt-3 flex items-center gap-2.5 overflow-x-auto pt-1">
                  {photos.map((thumb, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePhotoIdx(idx)}
                      className={cn(
                        'relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                        idx === activePhotoIdx
                          ? 'border-ink ring-2 ring-ink/20'
                          : 'border-transparent opacity-65 hover:opacity-100',
                      )}
                    >
                      <Img src={thumb} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Full Description & Parameters Card */}
            <div className="rounded-2xl bg-white p-6 shadow-card border border-mist-200">
              <div className="flex flex-wrap items-center gap-3 border-b border-mist pb-4 mb-4">
                <span className="rounded-lg bg-mist px-3 py-1 text-[12px] font-bold text-ink-700">
                  Kategoria: {ad.category || 'Ogłoszenia lokalne'}
                </span>
                {ad.condition && (
                  <span className="rounded-lg bg-mist px-3 py-1 text-[12px] font-bold text-ink-700">
                    Stan: {ad.condition}
                  </span>
                )}
                <span className="rounded-lg bg-mist px-3 py-1 text-[12px] font-bold text-ink-700">
                  Lokalizacja: Mińsk Mazowiecki, ul. {ad.street}
                </span>
              </div>

              <h2 className="font-display text-[17px] font-extrabold text-ink">
                Opis ogłoszenia
              </h2>
              <p className="mt-2.5 text-[14px] leading-relaxed text-ink-700 whitespace-pre-line">
                {ad.description ||
                  'Ogłoszenie dodane przez mieszkańca Mińska Mazowieckiego. Skontaktuj się ze sprzedającym na czacie, aby ustalić dogodny termin i miejsce odbioru osobistego na osiedlu.'}
              </p>

              <div className="mt-6 flex items-center justify-between border-t border-mist pt-3 text-[11.5px] text-ink-400">
                <span>ID ogłoszenia: #{ad.id.toUpperCase()}</span>
                <span>Wyświetlenia: {ad.views ?? 38}</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (5 or 4 cols): Sticky Offer Summary, Contact CTA & Neighbor Profile */}
          <div className="col-span-12 lg:col-span-5 xl:col-span-4 space-y-4 sticky top-2">
            {/* Main Offer & Actions Card */}
            <div className="rounded-2xl bg-white p-5 shadow-card border border-mist-200">
              <div className="flex items-center justify-between gap-2 text-[12px] text-ink-400">
                <span className="flex items-center gap-1 font-semibold">
                  <Clock className="h-3.5 w-3.5" />
                  Dodano {ad.time}
                </span>
                {currentStatus === 'reserved' && (
                  <span className="rounded-md bg-amber-400 px-2 py-0.5 text-[11px] font-extrabold text-ink">
                    Zarezerwowane
                  </span>
                )}
                {currentStatus === 'sold' && (
                  <span className="rounded-md bg-ink px-2 py-0.5 text-[11px] font-extrabold text-white">
                    Sprzedane
                  </span>
                )}
              </div>

              <h1 className="mt-2 font-display text-[21px] font-extrabold leading-snug text-ink">
                {ad.title}
              </h1>

              <div className="mt-3 flex items-baseline gap-2.5">
                <span className="font-display text-[30px] font-extrabold leading-none text-ink">
                  {ad.price ? zl(ad.price) : ad.kind === 'free' ? 'Za darmo' : 'Zgłoszenie'}
                </span>
                {ad.negotiable && (
                  <span className="rounded-md bg-sand-100 px-2 py-0.5 text-[11px] font-bold text-sand-900">
                    Do negocjacji
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <StreetPill street={`Mińsk Maz. · ul. ${ad.street}`} className="bg-sand-100 text-ink-800 text-[12px] py-1 px-2.5" />
              </div>

              {/* Action Buttons */}
              {!isOwner ? (
                <div className="mt-5 space-y-2.5 border-t border-mist pt-4">
                  <button
                    type="button"
                    onClick={() => onChatClick?.(ad)}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-[13.5px] font-bold text-white shadow-sm hover:bg-ink-700 transition-all active:scale-[0.99]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Napisz wiadomość do sąsiada</span>
                  </button>

                  {currentStatus !== 'sold' && (
                    <button
                      type="button"
                      onClick={() => onReserveClick?.(ad)}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-mist-300 bg-mist/70 text-[13.5px] font-bold text-ink hover:bg-mist-300 transition-all active:scale-[0.99]"
                    >
                      <HeartHandshake className="h-4 w-4 text-coral-700" />
                      <span>Zarezerwuj odbiór osobisty</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-5 space-y-2.5 border-t border-mist pt-4">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-400">
                    Zarządzaj swoim ogłoszeniem
                  </p>
                  <button
                    type="button"
                    onClick={() => onEditClick?.(ad)}
                    className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-mist text-[12.5px] font-bold text-ink hover:bg-mist-300 transition-colors"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edytuj ogłoszenie</span>
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    {currentStatus !== 'reserved' && (
                      <button
                        type="button"
                        onClick={() => onStatusChange?.(ad.id, 'reserved')}
                        className="rounded-xl bg-amber-50 py-2 text-[12px] font-bold text-amber-900 border border-amber-200"
                      >
                        Oznacz zarezerwowane
                      </button>
                    )}
                    {currentStatus !== 'sold' && (
                      <button
                        type="button"
                        onClick={() => onStatusChange?.(ad.id, 'sold')}
                        className="rounded-xl bg-mist-300 py-2 text-[12px] font-bold text-ink"
                      >
                        Oznacz sprzedane
                      </button>
                    )}
                  </div>
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Czy na pewno chcesz usunąć to ogłoszenie?')) {
                          onDelete(ad.id);
                          onClose();
                        }
                      }}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-bold text-coral hover:bg-coral-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Usuń ogłoszenie</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Neighbor Seller Card */}
            <div
              onClick={() => onSellerClick?.(ad.author, ad.street)}
              className="group cursor-pointer rounded-2xl bg-white p-5 shadow-card border border-mist-200 hover:border-ink/25 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-400">
                  Sprzedający sąsiad
                </span>
                <span className="flex items-center gap-1 text-[12px] font-bold text-coral-700 group-hover:underline">
                  Profil i inne oferty <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>

              <div className="flex items-center gap-3.5">
                <img
                  src={avatarUrl(sellerSeed)}
                  alt={ad.author}
                  className="h-12 w-12 rounded-xl bg-sand-100 object-cover ring-1 ring-mist-300 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold text-ink">{ad.author}</p>
                  <p className="text-[12px] font-medium text-ink-500">
                    Mieszkaniec Mińska · ul. {ad.street}
                  </p>
                  <p className="mt-1 inline-block rounded bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold text-emerald-800">
                    Zwykle odpowiada w ~15 min
                  </p>
                </div>
              </div>
            </div>

            {/* Local Pickup Info + Report */}
            <div className="rounded-2xl bg-sand-100/80 p-4 border border-sand-200 flex items-start gap-3">
              <MapPin className="mt-0.5 h-4.5 w-4.5 shrink-0 text-sand-800" />
              <div className="text-[12px] leading-snug text-ink-700">
                <p className="font-bold text-ink">Bezpieczny odbiór po sąsiedzku</p>
                <p className="mt-0.5 text-ink-500">
                  Spotkajcie się bezpośrednio w Mińsku Mazowieckim bez pośredników i ukrytych kosztów wysyłki.
                </p>
              </div>
            </div>

            {!isOwner && (
              <button
                type="button"
                onClick={() => onReportClick?.(ad)}
                className="flex w-full items-center justify-center gap-1.5 py-1 text-[11.5px] font-semibold text-ink-400 hover:text-ink-600"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Zgłoś nieaktualne ogłoszenie lub naruszenie</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Full-Screen Photo Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[80] flex flex-col bg-black/95 backdrop-blur-md">
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-4 pb-3 text-white">
              <span className="rounded-full bg-white/15 px-3 py-1 text-[13px] font-bold">
                {activePhotoIdx + 1} / {photos.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsZoomed((z) => !z)}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25"
                >
                  {isZoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsZoomed(false);
                    setIsLightboxOpen(false);
                  }}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
              <img
                src={photos[activePhotoIdx]}
                alt={ad.title}
                onClick={() => setIsZoomed((z) => !z)}
                className={cn(
                  'max-h-full max-w-full object-contain transition-transform duration-200 select-none',
                  isZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in',
                )}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
