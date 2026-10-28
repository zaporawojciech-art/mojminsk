import { useLayoutEffect, useRef, useState } from 'react';
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

  const isOwner = ad.isOwner || ad.author.toLowerCase().includes(user.name.toLowerCase());
  const currentStatus = ad.status ?? 'active';
  const scrollRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const lightboxStageRef = useRef<HTMLDivElement>(null);

  const photos = ad.images && ad.images.length > 0 ? ad.images : [ad.image];

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

  const handleLightboxScroll = () => {
    if (!lightboxStageRef.current) return;
    const { scrollLeft, clientWidth } = lightboxStageRef.current;
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

  const floatBtn =
    'grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink shadow-md backdrop-blur transition-transform active:scale-90';

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col bg-mist select-none',
        isClosing ? 'native-screen-exit' : 'native-screen-slide',
      )}
    >
      <div className="relative mx-auto flex h-full w-full max-w-md flex-col overflow-hidden bg-mist">
        {/* Floating controls over the full-bleed photo (stay visible while scrolling) */}
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
          {/* OLX-Style Hero Carousel */}
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
                    setTimeout(() => {
                      if (lightboxStageRef.current) {
                        const width = lightboxStageRef.current.clientWidth;
                        lightboxStageRef.current.scrollTo({ left: width * activePhotoIdx, behavior: 'auto' });
                      }
                    }, 0);
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

            {/* Prev / Next Carousel Arrows (when multiple photos) */}
            {photos.length > 1 && (
              <>
                {activePhotoIdx > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollToPhoto(activePhotoIdx - 1);
                    }}
                    aria-label="Poprzednie zdjęcie"
                    className="absolute left-3 top-1/2 z-20 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur-xs transition-transform active:scale-90 hover:bg-black/65"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}
                {activePhotoIdx < photos.length - 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollToPhoto(activePhotoIdx + 1);
                    }}
                    aria-label="Następne zdjęcie"
                    className="absolute right-3 top-1/2 z-20 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur-xs transition-transform active:scale-90 hover:bg-black/65"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                )}
              </>
            )}

            {/* Badges & Photo Counter Bar (positioned above the -mt-7 rounded sheet overlap) */}
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
                {ad.kind === 'lost' && (
                  <span className="rounded-full bg-coral px-2.5 py-1 text-[10.5px] font-bold text-ink shadow">
                    Zaginął / Pomóż
                  </span>
                )}
              </div>

              {/* OLX-style Photo Counter + Fullscreen Trigger */}
              <button
                type="button"
                onClick={() => {
                  setIsZoomed(false);
                  setIsLightboxOpen(true);
                }}
                className="pointer-events-auto flex shrink-0 items-center gap-1.5 rounded-full bg-black/65 px-3 py-1 text-[11.5px] font-bold text-white backdrop-blur-md shadow transition-transform active:scale-95"
              >
                <span>
                  {activePhotoIdx + 1} / {photos.length}
                </span>
                <Maximize2 className="h-3 w-3 opacity-85" />
              </button>
            </div>

            {/* Carousel Pagination Dots */}
            {photos.length > 1 && (
              <div className="pointer-events-none absolute inset-x-0 bottom-9 z-10 flex justify-center gap-1.5">
                {photos.map((_, idx) => (
                  <span
                    key={idx}
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      idx === activePhotoIdx ? 'w-4 bg-white shadow-xs' : 'w-1.5 bg-white/50',
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          {/* OLX-Style Overlapping Sheet: slides with rounded top corners directly onto the photo */}
          <div className="relative z-20 -mt-7 rounded-t-[28px] bg-white px-5 pb-5 pt-3.5 shadow-[0_-8px_24px_rgba(17,22,29,0.1)]">
            {/* Subtle sheet handle */}
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-mist-300" />

            {/* Thumbnail Strip (if multiple photos) */}
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
                        : 'border-transparent opacity-65 hover:opacity-100',
                    )}
                  >
                    <Img src={thumb} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setIsZoomed(false);
                    setIsLightboxOpen(true);
                    setTimeout(() => {
                      if (lightboxStageRef.current) {
                        const width = lightboxStageRef.current.clientWidth;
                        lightboxStageRef.current.scrollTo({ left: width * activePhotoIdx, behavior: 'auto' });
                      }
                    }, 0);
                  }}
                  className="flex h-12 shrink-0 items-center gap-1 rounded-xl bg-mist px-3 text-[11px] font-bold text-ink-600 active:scale-95"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  Pełny ekran
                </button>
              </div>
            )}

            {/* Timestamp & Category Row */}
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

            {/* Title (OLX places title & big price prominently in the top sheet) */}
            <h1 className="mt-1.5 text-[18px] font-bold leading-snug text-ink">{ad.title}</h1>

            {/* Price & Negotiable Badge */}
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

            {/* Street & Views Footer inside Top Sheet */}
            <div className="mt-4 flex items-center justify-between border-t border-mist pt-3">
              <StreetPill street={`ul. ${ad.street}`} className="bg-sand-100 text-ink-700 text-[12px]" />
              <span className="flex items-center gap-1 text-[11.5px] font-medium text-ink-400">
                <Eye className="h-3.5 w-3.5" />
                {ad.views ?? 38} wyświetleń
              </span>
            </div>
          </div>

          {/* Remaining Details Body */}
          <div className="space-y-3.5 p-4">
            {/* Description */}
            <div className="rounded-3xl bg-white p-4 shadow-card">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-ink-400">Opis ogłoszenia</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-700 whitespace-pre-line">
                {ad.description ||
                  'Ogłoszenie dodane przez mieszkańca Mińska Mazowieckiego. Skontaktuj się ze sprzedającym na czacie, aby ustalić dogodny termin i miejsce odbioru.'}
              </p>
            </div>

            {/* Neighbor Profile Card */}
            {(() => {
              const sellerSeed = isOwner ? user.seed : `${ad.author}-${ad.street}`;
              return (
                <div
                  onClick={() => onSellerClick?.(ad.author, ad.street)}
                  className="group cursor-pointer rounded-3xl bg-white p-4 shadow-card transition-all hover:shadow-float active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-[12px] font-bold uppercase tracking-wider text-ink-400">Sprzedający sąsiad</h3>
                    <span className="flex items-center gap-1 text-[11.5px] font-bold text-ink-500 group-hover:text-ink transition-colors">
                      Zobacz profil
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0">
                      <img
                        src={avatarUrl(sellerSeed)}
                        alt={ad.author}
                        className="h-12 w-12 rounded-2xl bg-sand-100 object-cover ring-1 ring-mist-300"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-bold text-ink">{ad.author}</p>
                      <p className="text-[12px] text-ink-500">Mieszkaniec Mińska · ul. {ad.street}</p>
                    </div>
                    <span className="rounded-full bg-mist px-2.5 py-1 text-[10.5px] font-bold text-ink-500">
                      Odpowiada w ~15 min
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Local Safety Card */}
            <div className="flex items-start gap-3 rounded-3xl bg-sand-100 p-4">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-sand-700" />
              <div className="text-[12px] leading-snug text-ink-700">
                <p className="font-bold">Odbiór osobisty w Mińsku Mazowieckim</p>
                <p className="mt-0.5 text-ink-500">
                  Spotkajcie się na osiedlu, sprawdźcie przedmiot na żywo i rozliczcie się bezpośrednio bez żadnych opłat.
                </p>
              </div>
            </div>

            {/* Owner Management Controls */}
            {isOwner && (
              <div className="space-y-3 rounded-3xl bg-white p-4 shadow-card">
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-ink-400">
                  Zarządzaj swoim ogłoszeniem
                </h3>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => onEditClick?.(ad)}
                  className="flex h-11 w-full items-center justify-center gap-1.5 rounded-2xl bg-mist px-3 text-[13px] font-bold text-ink hover:bg-mist-200 transition-all active:scale-95"
                >
                  <Edit3 className="h-4 w-4" />
                  Edytuj treść ogłoszenia
                </button>

                <div className="grid grid-cols-2 gap-2 border-t border-mist pt-2">
                  {currentStatus !== 'active' && (
                    <button
                      onClick={() => onStatusChange?.(ad.id, 'active')}
                      className="rounded-2xl border border-mist bg-mist py-2.5 text-[12.5px] font-bold text-ink active:scale-95"
                    >
                      Przywróć aktywne
                    </button>
                  )}
                  {currentStatus !== 'reserved' && (
                    <button
                      onClick={() => onStatusChange?.(ad.id, 'reserved')}
                      className="rounded-2xl bg-amber-50 py-2.5 text-[12.5px] font-bold text-amber-900 border border-amber-200 active:scale-95"
                    >
                      Oznacz jako zarezerwowane
                    </button>
                  )}
                  {currentStatus !== 'sold' && (
                    <button
                      onClick={() => onStatusChange?.(ad.id, 'sold')}
                      className="rounded-2xl bg-mist-300 py-2.5 text-[12.5px] font-bold text-ink active:scale-95"
                    >
                      Oznacz jako sprzedane
                    </button>
                  )}
                </div>
                {onDelete && (
                  <button
                    onClick={() => {
                      if (window.confirm('Czy na pewno chcesz usunąć to ogłoszenie?')) {
                        onDelete(ad.id);
                        onClose();
                      }
                    }}
                    className="flex w-full items-center justify-center gap-1.5 rounded-2xl py-2 text-[12px] font-bold text-coral hover:bg-coral-50 active:scale-95"
                  >
                    <Trash2 className="h-4 w-4" />
                    Usuń ogłoszenie
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pinned Bottom Action Bar (Native App Style) */}
        {!isOwner && (
          <div className="border-t border-mist bg-white px-4 py-2.5 pb-[max(env(safe-area-inset-bottom),14px)] shrink-0 shadow-float space-y-2">
            <div className="flex items-center gap-2.5">
              {currentStatus !== 'sold' && (
                <button
                  onClick={() => onReserveClick?.(ad)}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-mist-300/80 bg-mist/70 text-[14px] font-bold text-ink hover:bg-mist active:scale-[0.98] transition-all"
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
                className={cn(
                  'flex h-12 items-center justify-center gap-2 rounded-2xl text-[14px] font-bold transition-all active:scale-[0.98]',
                  currentStatus === 'sold'
                    ? 'w-full bg-mist text-ink-600'
                    : 'flex-1 bg-ink text-white shadow-sm hover:bg-ink-700',
                )}
              >
                <MessageCircle className="h-4.5 w-4.5 shrink-0" />
                Czat
              </button>
            </div>
            <button
              onClick={() => onReportClick?.(ad)}
              className="flex w-full items-center justify-center gap-1.5 text-[11px] font-medium text-ink-400 hover:text-ink-600"
            >
              <ShieldAlert className="h-3 w-3" />
              Zgłoś nieaktualne lub naruszenie
            </button>
          </div>
        )}

        {/* Full-Screen Photo Lightbox (OLX Style Full Display) */}
        {isLightboxOpen && (
          <div className="fixed inset-0 z-[80] flex flex-col bg-black/95 backdrop-blur-md">
            <div className="mx-auto flex h-full w-full max-w-md flex-col justify-between overflow-hidden">
              {/* Top Lightbox Bar */}
              <div className="flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),14px)] pb-3 text-white">
                <span className="rounded-full bg-white/15 px-3 py-1 text-[13px] font-bold">
                  {activePhotoIdx + 1} / {photos.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsZoomed((z) => !z)}
                    aria-label={isZoomed ? 'Pomniejsz zdjęcie' : 'Powiększ zdjęcie'}
                    className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white transition-transform active:scale-90 hover:bg-white/25"
                  >
                    {isZoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsZoomed(false);
                      setIsLightboxOpen(false);
                    }}
                    aria-label="Zamknij podgląd zdjęcia"
                    className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white transition-transform active:scale-90 hover:bg-white/25"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Main Full-Screen Image Stage */}
              <div className="relative flex flex-1 items-center justify-center overflow-hidden">
                <div
                  ref={lightboxStageRef}
                  onScroll={handleLightboxScroll}
                  className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scrollbar-none"
                >
                  {photos.map((photoUrl, idx) => (
                    <div
                      key={idx}
                      className="flex h-full w-full shrink-0 snap-center items-center justify-center p-2"
                    >
                      <img
                        src={photoUrl}
                        alt={`${ad.title} — pełny ekran ${idx + 1}`}
                        onClick={() => setIsZoomed((z) => !z)}
                        className={cn(
                          'max-h-full max-w-full object-contain transition-transform duration-200 select-none',
                          isZoomed && idx === activePhotoIdx ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in',
                        )}
                      />
                    </div>
                  ))}
                </div>

                {photos.length > 1 && !isZoomed && (
                  <>
                    {activePhotoIdx > 0 && (
                      <button
                        type="button"
                        onClick={() => scrollToPhoto(activePhotoIdx - 1)}
                        aria-label="Poprzednie zdjęcie"
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 grid h-11 w-11 place-items-center rounded-full bg-white/20 text-white backdrop-blur-xs transition-transform active:scale-90 hover:bg-white/30"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                    )}
                    {activePhotoIdx < photos.length - 1 && (
                      <button
                        type="button"
                        onClick={() => scrollToPhoto(activePhotoIdx + 1)}
                        aria-label="Następne zdjęcie"
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 grid h-11 w-11 place-items-center rounded-full bg-white/20 text-white backdrop-blur-xs transition-transform active:scale-90 hover:bg-white/30"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Bottom Lightbox Thumbnails & Caption */}
              <div className="space-y-3 bg-gradient-to-t from-black via-black/90 to-transparent px-4 pt-3 pb-[max(env(safe-area-inset-bottom),16px)]">
                <div className="flex items-baseline justify-between gap-2 text-white">
                  <p className="truncate text-[14px] font-bold">{ad.title}</p>
                  <span className="shrink-0 font-display text-[16px] font-extrabold text-coral">
                    {ad.price ? zl(ad.price) : ad.kind === 'free' ? 'Za darmo' : ''}
                  </span>
                </div>

                {photos.length > 1 && (
                  <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 scrollbar-none">
                    {photos.map((thumb, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setIsZoomed(false);
                          scrollToPhoto(idx);
                        }}
                        className={cn(
                          'relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all',
                          idx === activePhotoIdx
                            ? 'border-coral scale-105 opacity-100'
                            : 'border-white/20 opacity-50 hover:opacity-80',
                        )}
                      >
                        <img src={thumb} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
