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
  MessageCircle,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
} from 'lucide-react';
import { Img, StreetPill, cn, zl } from '../components/ui';
import type { Ad, User } from '../data/mockData';

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
  onPromoteClick?: (ad: Ad) => void;
  onReserveClick?: (ad: Ad) => void;
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
  onPromoteClick,
  onReserveClick,
}: AdDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const isOwner = ad.isOwner || ad.author.toLowerCase().includes(user.name.toLowerCase());
  const currentStatus = ad.status ?? 'active';
  const scrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [ad.id]);

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
    'grid h-11 w-11 place-items-center rounded-full bg-white/90 text-ink shadow-md backdrop-blur transition-transform active:scale-90';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-mist native-screen-slide select-none">
      <div className="relative mx-auto flex h-full w-full max-w-md flex-col overflow-hidden bg-mist">
        {/* Floating controls over the full-bleed photo (stay visible while scrolling) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),12px)]">
          <button type="button" onClick={onClose} aria-label="Wróć do ogłoszeń" className={cn(floatBtn, 'pointer-events-auto')}>
            <ChevronLeft className="h-6 w-6" aria-hidden />
          </button>
          <div className="pointer-events-auto flex items-center gap-2">
            <button type="button" onClick={handleShare} aria-label="Udostępnij" className={floatBtn}>
              {copied ? <Check className="h-5 w-5 text-emerald-600" aria-hidden /> : <Share2 className="h-5 w-5" aria-hidden />}
            </button>
            <button
              type="button"
              onClick={() => onToggleLike?.(ad.id)}
              aria-label={isLiked ? 'Usuń z obserwowanych' : 'Obserwuj'}
              className={floatBtn}
            >
              <Heart className={cn('h-5 w-5 transition-colors', isLiked && 'fill-coral text-coral')} aria-hidden />
            </button>
          </div>
        </div>

        {/* Scrollable Screen Content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain pb-24">
          {/* Hero Image: edge to edge, starts at the very top of the screen */}
          <div className="relative aspect-[4/5] w-full bg-mist-200">
            <Img src={ad.image} alt={ad.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/45" />

            {/* Badges on Image */}
            <div className="absolute bottom-3 left-4 flex flex-wrap items-center gap-2">
              {ad.promoted && (
                <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1 text-[11px] font-extrabold text-ink shadow-md">
                  <Sparkles className="h-3.5 w-3.5" />
                  Wyróżnione
                </span>
              )}
              {currentStatus === 'reserved' && (
                <span className="rounded-full bg-amber-400 px-3 py-1 text-[11px] font-bold text-ink shadow">
                  Zarezerwowane
                </span>
              )}
              {currentStatus === 'sold' && (
                <span className="rounded-full bg-ink-700 px-3 py-1 text-[11px] font-bold text-white shadow">
                  Zakończone / Sprzedane
                </span>
              )}
              {ad.kind === 'free' && (
                <span className="rounded-full bg-sky px-3 py-1 text-[11px] font-bold text-ink shadow">
                  Oddam za darmo
                </span>
              )}
              {ad.kind === 'lost' && (
                <span className="rounded-full bg-coral px-3 py-1 text-[11px] font-bold text-ink shadow">
                  Zaginął / Pomóż
                </span>
              )}
              {ad.category && (
                <span className="flex items-center gap-1 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[11px] font-bold text-ink shadow">
                  <Tag className="h-3 w-3" />
                  {ad.category}
                </span>
              )}
            </div>
          </div>

          {/* Details Body */}
          <div className="space-y-4 p-4">
            {/* Price & Meta Card */}
            <div className="rounded-3xl bg-white p-4 shadow-card">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-display text-[28px] font-extrabold leading-none text-ink">
                  {ad.price ? zl(ad.price) : ad.kind === 'free' ? 'Za darmo' : 'Zgłoszenie'}
                </span>
                <span className="flex items-center gap-1 text-[11.5px] text-ink-400">
                  <Clock className="h-3.5 w-3.5" />
                  {ad.time}
                </span>
              </div>
              <h1 className="mt-2 text-[17px] font-bold leading-snug text-ink">{ad.title}</h1>
              <div className="mt-3 flex items-center justify-between border-t border-mist pt-3">
                <StreetPill street={`ul. ${ad.street}`} className="bg-sand-100 text-ink-700 text-[12px]" />
                <span className="flex items-center gap-1 text-[11.5px] font-medium text-ink-400">
                  <Eye className="h-3.5 w-3.5" />
                  {ad.views ?? 38} wyświetleń
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-3xl bg-white p-4 shadow-card">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-ink-400">Opis ogłoszenia</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-700 whitespace-pre-line">
                {ad.description ||
                  'Ogłoszenie dodane przez mieszkańca Mińska Mazowieckiego. Skontaktuj się ze sprzedającym na czacie, aby ustalić dogodny termin i miejsce odbioru.'}
              </p>
            </div>

            {/* Neighbor Profile Card */}
            <div
              onClick={() => onSellerClick?.(ad.author, ad.street)}
              className="group cursor-pointer rounded-3xl bg-white p-4 shadow-card transition-all hover:shadow-float active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-ink-400">Sprzedający sąsiad</h3>
                <span className="flex items-center gap-1 text-[11.5px] font-bold text-coral group-hover:underline">
                  Profil sąsiada
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-coral font-display text-[18px] font-bold text-ink">
                  {ad.author.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[15px] font-bold text-ink">{ad.author}</p>
                    <span title="Zweryfikowany adres">
                      <ShieldCheck className="h-4 w-4 text-sky-700" />
                    </span>
                  </div>
                  <p className="text-[12px] text-ink-500">Mieszkaniec Mińska · ul. {ad.street}</p>
                </div>
                <span className="rounded-full bg-mist px-2.5 py-1 text-[10.5px] font-bold text-ink-500">
                  Odpowiada w ~15 min
                </span>
              </div>
            </div>

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

                {/* Edit & Promote Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onEditClick?.(ad)}
                    className="flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-mist px-3 text-[13px] font-bold text-ink hover:bg-mist-200 transition-all active:scale-95"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edytuj treść
                  </button>
                  <button
                    type="button"
                    onClick={() => onPromoteClick?.(ad)}
                    className="flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-amber-100 px-3 text-[13px] font-bold text-amber-900 hover:bg-amber-200 transition-all active:scale-95"
                  >
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    Wyróżnij (BLIK)
                  </button>
                </div>

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
          <div className="border-t border-mist bg-white px-5 py-3 pb-[max(env(safe-area-inset-bottom),14px)] shrink-0 shadow-float space-y-2">
            <div className="flex items-center gap-2">
              {currentStatus !== 'sold' && (
                <button
                  onClick={() => onReserveClick?.(ad)}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-coral text-[14px] font-bold text-ink shadow-coral transition-transform active:scale-95"
                >
                  <HeartHandshake className="h-4 w-4" />
                  Zarezerwuj & Odbiór
                </button>
              )}
              <button
                onClick={() => {
                  onClose();
                  onChatClick?.(ad);
                }}
                className={cn(
                  'flex h-12 items-center justify-center gap-1.5 rounded-full text-[14px] font-bold transition-transform active:scale-95',
                  currentStatus === 'sold'
                    ? 'w-full bg-mist text-ink-600'
                    : 'flex-1 bg-ink text-white',
                )}
              >
                <MessageCircle className="h-4 w-4" />
                Czat
              </button>
            </div>
            <button
              onClick={() => onReportClick?.(ad)}
              className="flex w-full items-center justify-center gap-1.5 text-[11px] font-semibold text-ink-400 hover:text-ink-600"
            >
              <ShieldAlert className="h-3 w-3" />
              Zgłoś nieaktualne lub naruszenie
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
