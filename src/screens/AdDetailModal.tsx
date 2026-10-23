import { useLayoutEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronLeft,
  Eye,
  Heart,
  MapPin,
  MessageCircle,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Tag,
  Trash2,
  Clock,
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
            <div className="rounded-3xl bg-white p-4 shadow-card">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-ink-400">Sprzedający sąsiad</h3>
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
              <div className="space-y-2 rounded-3xl bg-white p-4 shadow-card">
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-ink-400">
                  Zarządzaj swoim ogłoszeniem
                </h3>
                <div className="grid grid-cols-2 gap-2 pt-1">
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
                      className="rounded-2xl bg-amber-100 py-2.5 text-[12.5px] font-bold text-amber-900 active:scale-95"
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
          <div className="border-t border-mist bg-white px-5 py-3 pb-[max(env(safe-area-inset-bottom),14px)] shrink-0 shadow-float">
            <button
              onClick={() => {
                onClose();
                onChatClick?.(ad);
              }}
              className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-coral text-[15px] font-bold text-ink shadow-coral transition-transform active:scale-95"
            >
              <MessageCircle className="h-5 w-5" />
              Napisz do {ad.author} na czacie
            </button>
            <button
              onClick={() => onReportClick?.(ad)}
              className="mt-2 flex w-full items-center justify-center gap-1.5 text-[11px] font-semibold text-ink-400 hover:text-ink-600"
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
