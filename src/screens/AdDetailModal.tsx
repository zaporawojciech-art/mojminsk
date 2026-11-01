import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Briefcase,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Edit3,
  ExternalLink,
  Eye,
  Heart,
  HeartHandshake,
  Mail,
  MapPin,
  Maximize2,
  MessageCircle,
  Phone,
  RefreshCw,
  Send,
  Share2,
  ShieldAlert,
  Tag,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Img, StreetPill, cn, zl } from '../components/ui';
import { avatarUrl, formatAdExactDate, getAdValidityInfo, type Ad, type User } from '../data/mockData';
import { incrementAdViewsInSupabase, renewAd14DaysInSupabase } from '../lib/supabase';

interface AdDetailModalProps {
  ad: Ad;
  user: User | null;
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
  onQuickApply?: (ad: Ad, details: { phone: string; note: string }) => void;
  isClosing?: boolean;
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback
  }
  try {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    const success = document.execCommand('copy');
    document.body.removeChild(el);
    return success;
  } catch {
    return false;
  }
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
  onQuickApply,
  isClosing = false,
}: AdDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Terminowość ogłoszenia (14 dni)
  const [adValidity, setAdValidity] = useState(() => getAdValidityInfo(ad));
  const [isRenewing, setIsRenewing] = useState(false);
  const [renewedSuccess, setRenewedSuccess] = useState(false);

  useEffect(() => {
    setAdValidity(getAdValidityInfo(ad));
  }, [ad]);

  const handleRenewAd = async () => {
    setIsRenewing(true);
    try {
      const res = await renewAd14DaysInSupabase(ad.id);
      if (res) {
        setAdValidity({
          daysLeft: 14,
          isExpired: false,
          label: 'Ważne jeszcze 14 dni',
          shortLabel: 'Jeszcze 14 dni',
        });
        setRenewedSuccess(true);
        setTimeout(() => setRenewedSuccess(false), 4000);
      }
    } finally {
      setIsRenewing(false);
    }
  };

  // Atomowy licznik wyświetleń z zabezpieczeniem w sessionStorage
  const [viewsCount, setViewsCount] = useState<number>(ad.views ?? 1);
  useEffect(() => {
    setViewsCount(ad.views ?? 1);
    if (typeof window === 'undefined') return;
    const viewKey = `mojminsk_ad_view_${ad.id}`;
    if (!sessionStorage.getItem(viewKey)) {
      sessionStorage.setItem(viewKey, '1');
      void incrementAdViewsInSupabase(ad.id).then((val) => {
        if (typeof val === 'number') {
          setViewsCount(val);
        }
      });
    }
  }, [ad.id, ad.views]);

  // Wykrywanie oferty pracy (Decyzje #37 i #40)
  const isJobOffer =
    ad.category === 'Praca' ||
    ad.title.toLowerCase().includes('praca') ||
    ad.title.toLowerCase().includes('zatrudnię') ||
    ad.title.toLowerCase().includes('monter') ||
    ad.title.toLowerCase().includes('kierowca');

  const [isJobApplyOpen, setIsJobApplyOpen] = useState(false);
  const [candidatePhone, setCandidatePhone] = useState(user?.phone || '501 234 567');
  const [candidateNote, setCandidateNote] = useState(
    'Dzień dobry, chętnie podejmę tę pracę. Mieszkam w Mińsku i jestem dyspozycyjny od zaraz.',
  );
  const [isApplying, setIsApplying] = useState(false);

  const handleJobApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setIsJobApplyOpen(false);
      if (onQuickApply) {
        onQuickApply(ad, {
          phone: candidatePhone,
          note: candidateNote,
        });
      } else if (onReserveClick) {
        onReserveClick(ad);
      } else if (onChatClick) {
        onChatClick(ad);
      }
    }, 400);
  };

  const isOwner = Boolean(
    ad.isOwner ||
      (user && (
        (user.profileId && ad.authorId && ad.authorId === user.profileId) ||
        (!ad.authorId && ad.author.toLowerCase().trim() === user.name.toLowerCase().trim())
      )),
  );
  const currentStatus = ad.status ?? 'active';
  const scrollRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const lightboxStageRef = useRef<HTMLDivElement>(null);

  const photos = ad.images && ad.images.length > 0 ? ad.images : [ad.image];
  const sellerSeed = (isOwner && user) ? user.seed : (ad.authorAvatarSeed || `${ad.author}-${ad.street}`);

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

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = `${ad.title} — mójMińsk`;
  const shareText = `Zobacz ogłoszenie sąsiedzkie w Mińsku Mazowieckim: ${ad.title}`;

  const triggerCopy = async () => {
    const ok = await copyTextToClipboard(shareUrl);
    if (ok) {
      setCopied(true);
      setShowShareToast(true);
      setTimeout(() => setCopied(false), 2500);
      setTimeout(() => setShowShareToast(false), 3000);
    }
  };

  const handleShare = async () => {
    // 1. Zawsze skopiuj link do schowka, aby użytkownik miał gwarancję działania
    await triggerCopy();
    // 2. Otwórz estetyczny moduł udostępniania z bezpośrednimi kanałami
    setIsShareOpen(true);
  };

  const triggerNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // user cancelled share
      }
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

            <div className="space-y-2 text-[11.5px] text-ink-500">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-semibold text-ink-700">
                  <Clock className="h-3.5 w-3.5 text-ink-400" />
                  <span>Dodano: {formatAdExactDate(ad.createdAt)}</span>
                  <span className="text-ink-400 font-normal">({ad.time})</span>
                </span>
                {ad.category && (
                  <span className="flex items-center gap-1 rounded-full bg-mist px-2.5 py-0.5 text-[11px] font-bold text-ink-600 shrink-0">
                    <Tag className="h-3 w-3 text-ink-400" />
                    {ad.category}
                  </span>
                )}
              </div>

              {/* Terminowość 14 dni */}
              <div className="flex items-center justify-between gap-2 rounded-xl bg-mist/50 px-3 py-1.5 border border-mist-200">
                <span className="flex items-center gap-1.5 font-bold text-ink-600">
                  <Calendar className="h-3.5 w-3.5 text-coral-700" />
                  <span>Termin ważności (14 dni):</span>
                </span>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-[10.5px] font-extrabold',
                    adValidity.isExpired
                      ? 'bg-ink text-white'
                      : adValidity.daysLeft <= 2
                        ? 'bg-coral-100 text-coral-800'
                        : 'bg-emerald-100 text-emerald-800',
                  )}
                >
                  {adValidity.label}
                </span>
              </div>

              {isOwner && (
                adValidity.isExpired ? (
                  <button
                    type="button"
                    onClick={handleRenewAd}
                    disabled={isRenewing}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-coral px-3 py-2 text-[12px] font-extrabold text-ink shadow-coral hover:bg-coral-400 active:scale-95 transition-all cursor-pointer"
                  >
                    <RefreshCw className={cn('h-3.5 w-3.5', isRenewing && 'animate-spin')} />
                    <span>{isRenewing ? 'Odnawianie...' : 'Przedłuż ogłoszenie o kolejne 14 dni'}</span>
                  </button>
                ) : renewedSuccess ? (
                  <p className="text-[11px] font-bold text-emerald-700 text-center">
                    Ogłoszenie zostało pomyślnie przedłużone o 14 dni!
                  </p>
                ) : null
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
                {viewsCount} wyświetleń
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
                isJobOffer ? (
                  <button
                    onClick={() => setIsJobApplyOpen(true)}
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-coral text-ink text-[14px] font-bold shadow-sm active:scale-95 transition-all"
                  >
                    <Briefcase className="h-4.5 w-4.5 text-ink shrink-0" />
                    Aplikuj 1-Click
                  </button>
                ) : (
                  <button
                    onClick={() => onReserveClick?.(ad)}
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-mist-300/80 bg-mist/70 text-[14px] font-bold text-ink"
                  >
                    <HeartHandshake className="h-4.5 w-4.5 text-coral shrink-0" />
                    Zarezerwuj
                  </button>
                )
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
              <div
                onClick={() => {
                  setIsZoomed(false);
                  setIsLightboxOpen(true);
                }}
                className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-ink-900 cursor-zoom-in group select-none"
                title="Kliknij, aby powiększyć zdjęcie"
              >
                <Img
                  src={photos[activePhotoIdx]}
                  alt={`${ad.title} — zdjęcie ${activePhotoIdx + 1}`}
                  className="h-full w-full object-contain bg-ink-900 cursor-zoom-in transition-transform duration-200 group-hover:scale-[1.01]"
                />

                {photos.length > 1 && (
                  <>
                    {activePhotoIdx > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePhotoIdx((i) => Math.max(0, i - 1));
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink shadow-md hover:bg-white transition-all cursor-pointer"
                        aria-label="Poprzednie zdjęcie"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                    )}
                    {activePhotoIdx < photos.length - 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePhotoIdx((i) => Math.min(photos.length - 1, i + 1));
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink shadow-md hover:bg-white transition-all cursor-pointer"
                        aria-label="Następne zdjęcie"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    )}
                  </>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsZoomed(false);
                    setIsLightboxOpen(true);
                  }}
                  className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-lg bg-black/70 px-3 py-1.5 text-[12px] font-bold text-white backdrop-blur-md hover:bg-black/85 transition-colors cursor-pointer"
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
                <span>Wyświetlenia: {viewsCount}</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (5 or 4 cols): Sticky Offer Summary, Contact CTA & Neighbor Profile */}
          <div className="col-span-12 lg:col-span-5 xl:col-span-4 space-y-4 sticky top-2">
            {/* Main Offer & Actions Card */}
            <div className="rounded-2xl bg-white p-5 shadow-card border border-mist-200">
              <div className="space-y-2 border-b border-mist-200 pb-3">
                <div className="flex items-center justify-between gap-2 text-[12px] text-ink-500">
                  <span className="flex items-center gap-1.5 font-semibold text-ink-700">
                    <Clock className="h-3.5 w-3.5 text-ink-400" />
                    <span>Dodano: {formatAdExactDate(ad.createdAt)}</span>
                    <span className="text-ink-400 font-normal">({ad.time})</span>
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

                {/* Terminowość 14 dni */}
                <div className="flex items-center justify-between gap-2 rounded-xl bg-mist/50 px-3 py-1.5 border border-mist-200 text-[11.5px]">
                  <span className="flex items-center gap-1.5 font-bold text-ink-600">
                    <Calendar className="h-3.5 w-3.5 text-coral-700" />
                    <span>Termin ważności (14 dni):</span>
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[10.5px] font-extrabold',
                      adValidity.isExpired
                        ? 'bg-ink text-white'
                        : adValidity.daysLeft <= 2
                          ? 'bg-coral-100 text-coral-800'
                          : 'bg-emerald-100 text-emerald-800',
                    )}
                  >
                    {adValidity.label}
                  </span>
                </div>

                {isOwner && (
                  adValidity.isExpired ? (
                    <button
                      type="button"
                      onClick={handleRenewAd}
                      disabled={isRenewing}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-coral px-3 py-2 text-[12px] font-extrabold text-ink shadow-coral hover:bg-coral-400 active:scale-95 transition-all cursor-pointer"
                    >
                      <RefreshCw className={cn('h-3.5 w-3.5', isRenewing && 'animate-spin')} />
                      <span>{isRenewing ? 'Odnawianie...' : 'Przedłuż ogłoszenie o kolejne 14 dni'}</span>
                    </button>
                  ) : renewedSuccess ? (
                    <p className="text-[11px] font-bold text-emerald-700 text-center">
                      Ogłoszenie zostało pomyślnie przedłużone o 14 dni!
                    </p>
                  ) : null
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
                    isJobOffer ? (
                      <button
                        type="button"
                        onClick={() => setIsJobApplyOpen(true)}
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-coral text-ink text-[13.5px] font-bold shadow-sm hover:bg-coral-400 transition-all active:scale-[0.99]"
                      >
                        <Briefcase className="h-4 w-4 text-ink" />
                        <span>Szybka Aplikacja 1-Click (Profil + Telefon)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onReserveClick?.(ad)}
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-mist-300 bg-mist/70 text-[13.5px] font-bold text-ink hover:bg-mist-300 transition-all active:scale-[0.99]"
                      >
                        <HeartHandshake className="h-4 w-4 text-coral-700" />
                        <span>Zarezerwuj odbiór osobisty</span>
                      </button>
                    )
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

      {/* Modal Szybkiej Aplikacji 1-Click dla Ofert Pracy */}
      {isJobApplyOpen && (
        <div className="fixed inset-0 z-[75] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-xs p-0 md:p-4">
          <div className="w-full max-w-lg rounded-t-3xl md:rounded-3xl bg-white p-5 md:p-6 shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-mist pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-coral/20 text-coral-800">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-[16px] font-bold text-ink">
                    Szybka Aplikacja (1-Click)
                  </h3>
                  <p className="text-[12px] text-ink-500">Do oferty pracodawcy z Mińska</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsJobApplyOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-mist text-ink-500 hover:text-ink cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleJobApplySubmit} className="mt-4 space-y-4">
              <div className="rounded-2xl bg-sand-50 p-3.5 border border-sand-200 text-[12.5px] text-ink-700">
                <p>
                  Pracodawca <strong className="font-bold text-ink">{ad.author}</strong> otrzyma Twoje zgłoszenie sąsiedzkie na czacie wewnętrznym:
                </p>
                {user && (
                  <div className="mt-2 flex items-center gap-2 font-bold text-ink">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-sand-200 text-[11px] text-coral-800">✓</span>
                    <span>{user.name} · Mieszkaniec Mińska · ul. {user.street.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[12px] font-bold text-ink-700 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-coral" />
                  Twój numer telefonu do kontaktu
                </label>
                <input
                  type="tel"
                  required
                  value={candidatePhone}
                  onChange={(e) => setCandidatePhone(e.target.value)}
                  placeholder="np. 501 234 567"
                  className="mt-1 h-11 w-full rounded-xl border border-mist-300 bg-mist/50 px-3.5 text-[14px] font-semibold text-ink outline-none focus:border-ink focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-ink-700">
                  Krótka notatka / dyspozycyjność (opcjonalnie)
                </label>
                <textarea
                  rows={3}
                  value={candidateNote}
                  onChange={(e) => setCandidateNote(e.target.value)}
                  placeholder="Napisz krótko o swoim doświadczeniu lub kiedy możesz zacząć..."
                  className="mt-1 w-full rounded-xl border border-mist-300 bg-mist/50 p-3 text-[13.5px] text-ink outline-none focus:border-ink focus:bg-white resize-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsJobApplyOpen(false)}
                  className="h-11 flex-1 rounded-xl border border-mist-300 bg-mist text-[13px] font-bold text-ink hover:bg-mist-200 transition-colors cursor-pointer"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={isApplying || !candidatePhone.trim()}
                  className="h-11 flex-1 flex items-center justify-center gap-2 rounded-xl bg-ink text-[13px] font-bold text-white hover:bg-ink-800 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  {isApplying ? 'Wysyłanie...' : 'Wyślij aplikację'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* MODUŁ UDOSTĘPNIANIA OGŁOSZENIA */}
      {isShareOpen && (
        <div
          className="fixed inset-0 z-[85] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={() => setIsShareOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl border border-mist-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-mist-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-ink text-white">
                  <Share2 className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-display text-[16px] font-bold text-ink leading-tight">
                    Udostępnij ogłoszenie
                  </h3>
                  <p className="text-[11px] text-ink-500 font-medium">
                    Poleć ofertę sąsiadom z Mińska Mazowieckiego
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsShareOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:text-ink hover:bg-mist transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Podgląd ogłoszenia */}
            <div className="mt-3 flex items-center gap-3 rounded-2xl bg-mist/40 p-3 border border-mist-200">
              <img
                src={ad.image}
                alt={ad.title}
                className="h-14 w-14 rounded-xl object-cover shrink-0 bg-mist border border-mist-200"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-ink">{ad.title}</p>
                <p className="font-display text-[14.5px] font-black text-ink mt-0.5">
                  {ad.kind === 'free' ? 'Za darmo' : zl(ad.price || 0)}
                </p>
                <p className="text-[11px] text-ink-500 truncate">ul. {ad.street} · {ad.author}</p>
              </div>
            </div>

            {/* Bezpośredni link + Kopiuj */}
            <div className="mt-4">
              <label className="text-[11px] font-bold uppercase tracking-wider text-ink-500 block mb-1.5">
                Bezpośredni link do ogłoszenia
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 rounded-xl bg-mist/60 border border-mist-200 px-3 py-2 text-[12px] font-mono text-ink truncate select-all focus:outline-none focus:ring-1 focus:ring-ink"
                />
                <button
                  type="button"
                  onClick={triggerCopy}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-bold transition-all cursor-pointer shadow-xs shrink-0',
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-ink text-white hover:bg-ink-800'
                  )}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? 'Skopiowano!' : 'Kopiuj'}</span>
                </button>
              </div>
            </div>

            {/* Kanały udostępniania */}
            <div className="mt-4 pt-3 border-t border-mist-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500 mb-2">
                Wyślij przez aplikację:
              </p>
              <div className="grid grid-cols-2 gap-2 text-[12px] font-bold">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200/80 p-2.5 hover:bg-emerald-100 transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-sky-50 text-sky-900 border border-sky-200/80 p-2.5 hover:bg-sky-100 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 text-sky-700" />
                  <span>Facebook</span>
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 p-2.5 hover:bg-slate-200 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 text-slate-700" />
                  <span>X (Twitter)</span>
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200/80 p-2.5 hover:bg-amber-100 transition-colors"
                >
                  <Mail className="h-4 w-4 text-amber-700" />
                  <span>E-mail</span>
                </a>
              </div>
            </div>

            {/* Natywne udostępnienie (telefon) */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={triggerNativeShare}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-mist hover:bg-mist-300 text-ink py-2 text-[12px] font-bold transition-colors cursor-pointer"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Więcej opcji telefonu...</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PŁYWAJĄCY TOAST POTWIERDZENIA */}
      {showShareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-2 rounded-2xl bg-ink text-white px-4 py-2.5 shadow-2xl border border-white/20 text-[12.5px] font-bold animate-in fade-in slide-in-from-bottom-4 duration-200 pointer-events-none">
          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Link do ogłoszenia został skopiowany do schowka!</span>
        </div>
      )}
    </div>
  );
}
