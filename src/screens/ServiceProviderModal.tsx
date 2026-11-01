import { useState } from 'react';
import {
  Award,
  BadgeCheck,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileCheck,
  Lightbulb,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Share2,
  ShieldCheck,
  Smile,
  Sparkles,
  Star,
  ThumbsDown,
  ThumbsUp,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { NativeHeader, cn } from '../components/ui';
import { avatarUrl, type User } from '../data/mockData';
import {
  computeProviderRatingStats,
  getServiceCategoryById,
  SERVICE_REVIEW_HIGHLIGHTS,
  type ServiceProvider,
  type ServiceRecommendation,
  type ServiceReview,
} from '../data/servicesData';
import { buildServiceProviderUrl } from '../router/urlUtils';

interface ServiceProviderModalProps {
  provider: ServiceProvider;
  currentUser: User | null;
  onClose: () => void;
  onContactChat: (provider: ServiceProvider) => void;
  onAddReview: (providerId: string, review: Omit<ServiceReview, 'id' | 'providerId' | 'createdAt' | 'timeLabel'>) => void;
  onReplyToReview?: (providerId: string, reviewId: string, replyText: string) => void;
  onTogglePromote?: (providerId: string) => void;
  onApprovePending?: (providerId: string) => void;
  onAuthRequired?: (title: string, desc: string) => void;
  isClosing?: boolean;
}

function renderHighlightIcon(iconName: string, className?: string) {
  switch (iconName) {
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'BadgeCheck':
      return <BadgeCheck className={className} />;
    case 'Lightbulb':
      return <Lightbulb className={className} />;
    case 'Clock':
      return <Clock className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'Wrench':
      return <Wrench className={className} />;
    case 'Smile':
      return <Smile className={className} />;
    case 'FileCheck':
      return <FileCheck className={className} />;
    default:
      return <Sparkles className={className} />;
  }
}

function getRatingWord(val: number): string {
  switch (val) {
    case 5:
      return 'Perfekcyjna (5/5)';
    case 4:
      return 'Bardzo dobra (4/5)';
    case 3:
      return 'Przeciętna (3/5)';
    case 2:
      return 'Do poprawy (2/5)';
    case 1:
      return 'Niezadowalająca (1/5)';
    default:
      return `${val}/5`;
  }
}

export function ServiceProviderModal({
  provider,
  currentUser,
  onClose,
  onContactChat,
  onAddReview,
  onApprovePending,
  onAuthRequired,
  isClosing = false,
}: ServiceProviderModalProps) {
  const stats = computeProviderRatingStats(provider.reviews);
  const category = getServiceCategoryById(provider.categoryId);
  const isPending = provider.status === 'pending_verification';

  // Dynamic Neighborhood Proximity & Trust calculation
  const userStreet = currentUser?.street?.name?.trim();
  const directStreetReviews = userStreet
    ? provider.reviews.filter(
        (r) =>
          r.authorStreet &&
          (r.authorStreet.toLowerCase().includes(userStreet.toLowerCase()) ||
            userStreet.toLowerCase().includes(r.authorStreet.toLowerCase())),
      )
    : [];
  const hasDirectStreetMatch = directStreetReviews.length > 0;
  const isSameBaseStreet = !!(
    userStreet &&
    (provider.street.toLowerCase().includes(userStreet.toLowerCase()) ||
      userStreet.toLowerCase().includes(provider.street.toLowerCase()))
  );

  // Lightbox state for portfolio gallery
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Closed evaluation form state
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [serviceTagInput, setServiceTagInput] = useState<string>(provider.tags[0] || 'Usługa ogólna');
  const [qualityRating, setQualityRating] = useState<number>(5);
  const [punctualityRating, setPunctualityRating] = useState<number>(5);
  const [priceFairnessRating, setPriceFairnessRating] = useState<number>(5);
  const [communicationRating, setCommunicationRating] = useState<number>(5);
  const [recommendation, setRecommendation] = useState<ServiceRecommendation>('definitely');
  const [selectedHighlights, setSelectedHighlights] = useState<string[]>(['cleanliness', 'fair_price']);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const hasAlreadyReviewed = Boolean(
    currentUser &&
      provider.reviews.some(
        (r) =>
          (r.authorId && currentUser.profileId && r.authorId === currentUser.profileId) ||
          (r.authorName.toLowerCase() === currentUser.name.toLowerCase() &&
            r.authorStreet.toLowerCase() === currentUser.street.name.toLowerCase()),
      ),
  );

  const handleOpenReviewForm = () => {
    if (!currentUser) {
      onAuthRequired?.(
        'Oceń wykonawcę',
        'Oceny w Strefie Zaufanej Usługi mogą wystawiać wyłącznie zalogowani mieszkańcy Mińska Mazowieckiego i Gminy.',
      );
      return;
    }
    setReviewFormOpen((prev) => !prev);
    setReviewError(null);
  };

  const handleToggleHighlight = (id: string) => {
    setSelectedHighlights((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!serviceTagInput) {
      setReviewError('Wybierz usługę z zakresu prac wykonawcy.');
      return;
    }

    const calculatedAvg =
      Math.round(((qualityRating + punctualityRating + priceFairnessRating + communicationRating) / 4) * 10) / 10;

    onAddReview(provider.id, {
      authorId: currentUser.profileId,
      authorName: currentUser.name,
      authorStreet: currentUser.street.name,
      authorSeed: currentUser.seed,
      rating: calculatedAvg,
      qualityRating,
      punctualityRating,
      priceFairnessRating,
      communicationRating,
      recommendation,
      highlightTags: selectedHighlights,
      serviceTag: serviceTagInput,
      comment: '',
    });

    setReviewError(null);
    setReviewFormOpen(false);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 4500);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${buildServiceProviderUrl(provider)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${provider.businessName} — Strefa Zaufanej Usługi mójMińsk`,
          text: `Polecany wykonawca w Mińsku Mazowieckim: ${provider.businessName} (${provider.name}, ul. ${provider.street})`,
          url,
        });
        return;
      } catch {
        // fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {
      // ignore
    }
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
          title="Profil wykonawcy"
          backLabel="Katalog usług"
          onBack={onClose}
          right={
            <button
              type="button"
              onClick={handleShare}
              className="flex h-9 items-center gap-1.5 rounded-full bg-white px-3 text-[12px] font-bold text-ink shadow-card hover:bg-mist-200 active:scale-95 transition-all cursor-pointer"
            >
              {copiedShare ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Skopiowano</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 text-ink-600" />
                  <span>Udostępnij</span>
                </>
              )}
            </button>
          }
        />

        {/* MAIN SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 md:px-8 lg:px-12 md:py-7 space-y-4 md:space-y-0 md:grid md:grid-cols-12 md:gap-6 lg:gap-8 md:items-start pb-32 md:pb-12">
          {/* LEFT COLUMN (Desktop 5 cols): IDENTITY, VERIFICATION PASSPORT & CONTACT */}
          <div className="md:col-span-5 lg:col-span-4 space-y-4 md:sticky md:top-6">
            {/* HERO PROFILE CARD */}
            <div className="rounded-4xl md:rounded-3xl bg-white p-5 md:p-6 shadow-card border border-mist-200">
              {/* Verification & Category Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                {isPending ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-extrabold text-amber-900">
                    <Clock className="h-3.5 w-3.5 text-amber-700" />
                    Oczekuje na weryfikację Admina
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-extrabold text-emerald-900">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                    Zweryfikowany przez mójMińsk
                  </span>
                )}

                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-[11px] font-bold',
                    category.tone.bg,
                    category.tone.text,
                  )}
                >
                  {category.shortLabel}
                </span>
              </div>

              {isPending && onApprovePending && (
                <div className="mb-4 rounded-2xl bg-amber-50 border border-amber-300 p-3 text-[12px] text-amber-950">
                  <p className="font-bold">Status: Weryfikacja przez Administratora</p>
                  <p className="mt-0.5 text-amber-800">
                    Każdy profil wykonawcy w mójMińsk jest sprawdzany przed publikacją.
                  </p>
                  <button
                    type="button"
                    onClick={() => onApprovePending(provider.id)}
                    className="mt-2 w-full rounded-xl bg-ink py-2 text-[12px] font-bold text-white hover:bg-ink-800 cursor-pointer"
                  >
                    Zatwierdź profil teraz (Demo Admina)
                  </button>
                </div>
              )}

              {/* Company Logo or Resident Avatar & Name */}
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0">
                  {provider.logoUrl ? (
                    <div className="h-full w-full rounded-3xl bg-white p-1 shadow-sm ring-2 ring-mist-200 overflow-hidden">
                      <img
                        src={provider.logoUrl}
                        alt={`Logo ${provider.businessName}`}
                        className="h-full w-full rounded-2xl object-cover"
                      />
                    </div>
                  ) : (
                    <img
                      src={avatarUrl(provider.avatarSeed)}
                      alt={provider.name}
                      className="h-full w-full rounded-3xl bg-sand-100 object-cover shadow-sm ring-4 ring-mist"
                    />
                  )}
                  {!isPending && (
                    <span
                      title="Zweryfikowany Wykonawca"
                      className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-emerald-600 text-white ring-2 ring-white shadow-xs"
                    >
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <h1 className="font-display text-[20px] md:text-[22px] font-extrabold text-ink leading-tight">
                    {provider.businessName}
                  </h1>
                  <p className="mt-1 text-[13.5px] font-bold text-ink-700">{provider.name}</p>
                  <div className="mt-1 flex items-center gap-1.5 text-[12px] font-semibold text-ink-500">
                    <MapPin className="h-3.5 w-3.5 text-coral-700 shrink-0" />
                    <span>
                      ul. {provider.street} · {provider.city}
                    </span>
                  </div>
                </div>
              </div>

              {/* DYNAMICZNY KONTEKST GEOGRAFICZNY I DOWÓD SĄSIEDZKI (HYPERLOCAL TRUST BOX) */}
              <div className="mt-4.5 rounded-3xl bg-gradient-to-br from-emerald-50/70 via-sand-50/90 to-sand-100/80 p-4 border border-emerald-200/80 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 border border-emerald-300 px-2.5 py-0.5 text-[10.5px] font-extrabold text-emerald-950 uppercase tracking-wide">
                    <MapPin className="h-3 w-3 text-emerald-700 shrink-0" />
                    {hasDirectStreetMatch
                      ? `Dowód sąsiedzki: ul. ${userStreet}`
                      : isSameBaseStreet
                      ? `Twój sąsiad z ul. ${userStreet}`
                      : userStreet
                      ? `Dojazd: ul. ${userStreet}`
                      : 'Dowód sąsiedzki z Mińska'}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Zweryfikowane
                  </span>
                </div>

                {hasDirectStreetMatch ? (
                  <div>
                    <h3 className="text-[13.5px] font-extrabold text-ink leading-tight">
                      Wykonawca zrealizował {directStreetReviews.length} {directStreetReviews.length === 1 ? 'zlecenie' : directStreetReviews.length < 5 ? 'zlecenia' : 'zleceń'} bezpośrednio na Twojej ulicy!
                    </h3>
                    <p className="mt-1 text-[11.5px] text-ink-700 leading-snug">
                      Sąsiad <strong className="text-ink">{directStreetReviews[0].authorName}</strong> potwierdził wykonanie ({directStreetReviews[0].serviceTag || 'Usługa'}) z oceną{' '}
                      <span className="inline-flex items-center gap-0.5 font-black text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded-md border border-amber-300 text-[11px]">
                        ★ {directStreetReviews[0].rating.toFixed(1)}
                      </span>
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>100% sąsiadów z Twojego rejonu poleca tego wykonawcę</span>
                    </div>
                  </div>
                ) : isSameBaseStreet ? (
                  <div>
                    <h3 className="text-[13.5px] font-extrabold text-ink leading-tight">
                      Ten fachowiec ma bazę na Twojej ulicy (ul. {userStreet})!
                    </h3>
                    <p className="mt-1 text-[11.5px] text-ink-700 leading-snug">
                      Brak opłat za dojazd, najszybszy czas reakcji i bezpośrednia pomoc sąsiedzka na miejscu.
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Lokalny rzemieślnik z Twojego bezpośredniego sąsiedztwa</span>
                    </div>
                  </div>
                ) : userStreet ? (
                  <div>
                    <h3 className="text-[13.5px] font-extrabold text-ink leading-tight">
                      Obsługuje Twój rejon: dojazd na ul. {userStreet}
                    </h3>
                    <p className="mt-1 text-[11.5px] text-ink-700 leading-snug">
                      Baza fachowca: <strong>ul. {provider.street}</strong> · Potwierdzone realizacje u sąsiadów m.in. z ulic:
                    </p>
                    {stats.verifiedStreets.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {stats.verifiedStreets.slice(0, 3).map((st) => (
                          <span
                            key={st}
                            className="rounded-lg bg-white/90 border border-sand-300 px-2 py-0.5 text-[10.5px] font-bold text-ink-800"
                          >
                            ul. {st}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Średnia ocen sąsiadów: {stats.average > 0 ? stats.average.toFixed(1) : '5.0'} / 5.0 ({stats.recommendPercent}% poleceń)</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-[13.5px] font-extrabold text-ink leading-tight">
                      Sprawdzone realizacje u sąsiadów w Mińsku
                    </h3>
                    <p className="mt-1 text-[11.5px] text-ink-700 leading-snug">
                      Wykonawca zrealizował potwierdzone prace m.in. na ulicach:
                    </p>
                    {stats.verifiedStreets.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {stats.verifiedStreets.slice(0, 3).map((st) => (
                          <span
                            key={st}
                            className="rounded-lg bg-white/90 border border-sand-300 px-2 py-0.5 text-[10.5px] font-bold text-ink-800"
                          >
                            ul. {st}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>{stats.count} {stats.count === 1 ? 'zweryfikowana ocena sąsiedzka' : stats.count < 5 ? 'zweryfikowane oceny sąsiedzkie' : 'zweryfikowanych ocen sąsiedzkich'}</span>
                    </div>
                  </div>
                )}

                {/* Szybkie Zapytanie 1-Click CTA */}
                <button
                  type="button"
                  onClick={() => {
                    if (!currentUser && onAuthRequired) {
                      onAuthRequired(
                        'Zapytaj o termin',
                        'Zaloguj się kontem sąsiedzkim, aby błyskawicznie skontaktować się z wykonawcą na czacie mójMińsk.',
                      );
                    } else {
                      onContactChat(provider);
                    }
                  }}
                  className="mt-1 w-full flex items-center justify-center gap-2 rounded-2xl bg-ink text-white py-2.5 px-3.5 text-[12.5px] font-extrabold hover:bg-ink-800 active:scale-[0.99] transition-all shadow-xs cursor-pointer"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  <span>
                    {userStreet
                      ? `Zapytaj o wolny termin na ul. ${userStreet} ➔`
                      : 'Zapytaj o wolny termin wykonania prac ➔'}
                  </span>
                </button>
              </div>

              {/* SĄSIEDZKI INDEKS JAKOŚCI I ZAUFANIA WPROJEKTOWANY W KARTĘ USŁUGI */}
              <div className="mt-5 rounded-3xl bg-mist/70 p-4 md:p-4.5 border border-mist-300 space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-600 flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-amber-500" />
                    Indeks Jakości i Zaufania
                  </span>
                  {!hasAlreadyReviewed ? (
                    <button
                      type="button"
                      onClick={handleOpenReviewForm}
                      className="text-[11.5px] font-bold text-coral-800 hover:text-coral-950 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                      <span>{reviewFormOpen ? 'Zamknij formularz' : '+ Oceń fachowca'}</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                      <Check className="h-3 w-3 text-emerald-600" />
                      Twoja ocena zapisana
                    </span>
                  )}
                </div>

                {reviewSuccess && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 flex items-center gap-2 text-[11.5px] font-bold text-emerald-950">
                    <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                    <span>Dziękujemy! Twoja ocena została zapisana w karcie usługi.</span>
                  </div>
                )}

                {/* Score & Recommendation Row */}
                <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-mist-200 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-[30px] font-black text-ink leading-none">
                        {stats.count > 0 ? stats.average.toFixed(1) : '—'}
                      </span>
                      <span className="text-[13px] font-bold text-ink-400">/ 5.0</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              'h-3.5 w-3.5',
                              star <= Math.round(stats.average)
                                ? 'fill-amber-400 text-amber-500'
                                : 'text-mist-300',
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-[11px] font-semibold text-ink-500 mt-0.5">
                        {stats.count > 0
                          ? `${stats.count} ${stats.count === 1 ? 'ocena sąsiada' : stats.count < 5 ? 'oceny sąsiadów' : 'ocen sąsiadów'}`
                          : 'Brak ocen (bądź pierwszy)'}
                      </p>
                    </div>
                  </div>

                  {stats.count > 0 ? (
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11.5px] font-extrabold text-emerald-900">
                        <ThumbsUp className="h-3 w-3 text-emerald-600 shrink-0" />
                        <span>{stats.recommendPercent}% poleceń</span>
                      </span>
                      <p className="text-[10.5px] text-ink-500 font-semibold mt-0.5">
                        {provider.yearsExperience} {provider.yearsExperience === 1 ? 'rok' : provider.yearsExperience < 5 ? 'lata' : 'lat'} dośw.
                      </p>
                    </div>
                  ) : (
                    <span className="text-[11.5px] font-semibold text-ink-500">
                      {provider.yearsExperience} l. doświadczenia
                    </span>
                  )}
                </div>

                {/* 4 Quality Pillars Breakdown inside Card */}
                {stats.count > 0 && (
                  <div className="space-y-2 pt-1">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-700">
                      Standard pracy w ocenach sąsiadów:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11.5px]">
                      {/* Fachowość */}
                      <div className="bg-white p-2.5 rounded-xl border border-mist-300 shadow-2xs">
                        <div className="flex items-center justify-between text-ink font-bold mb-1.5">
                          <span className="flex items-center gap-1.5 text-ink-800">
                            <Wrench className="h-3 w-3 text-sky-700 shrink-0" />
                            Fachowość
                          </span>
                          <span className="font-extrabold text-ink text-[12.5px]">{stats.dimensions.quality.toFixed(1)}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-mist-200">
                          <div
                            className="h-full rounded-full bg-sky-600"
                            style={{ width: `${(stats.dimensions.quality / 5) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Terminowość */}
                      <div className="bg-white p-2.5 rounded-xl border border-mist-300 shadow-2xs">
                        <div className="flex items-center justify-between text-ink font-bold mb-1.5">
                          <span className="flex items-center gap-1.5 text-ink-800">
                            <Clock className="h-3 w-3 text-amber-700 shrink-0" />
                            Terminowość
                          </span>
                          <span className="font-extrabold text-ink text-[12.5px]">{stats.dimensions.punctuality.toFixed(1)}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-mist-200">
                          <div
                            className="h-full rounded-full bg-amber-500"
                            style={{ width: `${(stats.dimensions.punctuality / 5) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Wycena */}
                      <div className="bg-white p-2.5 rounded-xl border border-mist-300 shadow-2xs">
                        <div className="flex items-center justify-between text-ink font-bold mb-1.5">
                          <span className="flex items-center gap-1.5 text-ink-800">
                            <BadgeCheck className="h-3 w-3 text-emerald-700 shrink-0" />
                            Uczciwa cena
                          </span>
                          <span className="font-extrabold text-ink text-[12.5px]">{stats.dimensions.priceFairness.toFixed(1)}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-mist-200">
                          <div
                            className="h-full rounded-full bg-emerald-600"
                            style={{ width: `${(stats.dimensions.priceFairness / 5) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Kontakt */}
                      <div className="bg-white p-2.5 rounded-xl border border-mist-300 shadow-2xs">
                        <div className="flex items-center justify-between text-ink font-bold mb-1.5">
                          <span className="flex items-center gap-1.5 text-ink-800">
                            <Smile className="h-3 w-3 text-indigo-700 shrink-0" />
                            Kontakt
                          </span>
                          <span className="font-extrabold text-ink text-[12.5px]">{stats.dimensions.communication.toFixed(1)}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-mist-200">
                          <div
                            className="h-full rounded-full bg-indigo-600"
                            style={{ width: `${(stats.dimensions.communication / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Top Highlights inside Card */}
                {stats.topHighlights.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {stats.topHighlights.slice(0, 3).map((hl) => (
                      <span
                        key={hl.id}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-mist-300 px-2.5 py-1 text-[11px] font-bold text-ink-900 shadow-2xs"
                      >
                        {renderHighlightIcon(hl.iconName, 'h-3.5 w-3.5 text-emerald-700')}
                        <span>{hl.shortLabel}</span>
                        <span className="text-emerald-800 font-black">({hl.percent}%)</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Closed evaluation form expanded inside the card */}
                {reviewFormOpen && currentUser && (
                  <form
                    onSubmit={handleSubmitReview}
                    className="mt-3 rounded-2xl bg-white p-4 border border-mist-300 space-y-4"
                  >
                    <div className="border-b border-mist-200 pb-2.5">
                      <p className="text-[12.5px] font-bold text-ink">
                        Wystawiasz ocenę jako: {currentUser.name}
                      </p>
                      <p className="text-[11px] text-ink-500">
                        Mieszkaniec Mińska · ul. {currentUser.street.name}
                      </p>
                    </div>

                    {/* Step 1: Service */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-600 mb-1.5">
                        1. Wybierz realizowaną usługę:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {provider.tags.map((tag) => {
                          const active = serviceTagInput === tag;
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => setServiceTagInput(tag)}
                              className={cn(
                                'rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer',
                                active
                                  ? 'bg-ink text-white shadow-xs'
                                  : 'bg-mist text-ink-700 border border-mist-300 hover:bg-mist-200',
                              )}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 2: 4 Pillars */}
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-600">
                        2. Oceń 4 filary jakości:
                      </label>

                      {/* Quality */}
                      <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-mist/50 border border-mist-200">
                        <div>
                          <p className="text-[11.5px] font-bold text-ink">Fachowość</p>
                          <p className="text-[10px] text-sky-700 font-semibold">{getRatingWord(qualityRating)}</p>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setQualityRating(s)}
                              className="p-0.5 cursor-pointer"
                            >
                              <Star
                                className={cn(
                                  'h-4.5 w-4.5',
                                  s <= qualityRating ? 'fill-amber-400 text-amber-500' : 'text-mist-300',
                                )}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Punctuality */}
                      <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-mist/50 border border-mist-200">
                        <div>
                          <p className="text-[11.5px] font-bold text-ink">Terminowość</p>
                          <p className="text-[10px] text-amber-700 font-semibold">{getRatingWord(punctualityRating)}</p>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setPunctualityRating(s)}
                              className="p-0.5 cursor-pointer"
                            >
                              <Star
                                className={cn(
                                  'h-4.5 w-4.5',
                                  s <= punctualityRating ? 'fill-amber-400 text-amber-500' : 'text-mist-300',
                                )}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-mist/50 border border-mist-200">
                        <div>
                          <p className="text-[11.5px] font-bold text-ink">Uczciwa wycena</p>
                          <p className="text-[10px] text-emerald-700 font-semibold">{getRatingWord(priceFairnessRating)}</p>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setPriceFairnessRating(s)}
                              className="p-0.5 cursor-pointer"
                            >
                              <Star
                                className={cn(
                                  'h-4.5 w-4.5',
                                  s <= priceFairnessRating ? 'fill-amber-400 text-amber-500' : 'text-mist-300',
                                )}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Communication */}
                      <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-mist/50 border border-mist-200">
                        <div>
                          <p className="text-[11.5px] font-bold text-ink">Kultura i kontakt</p>
                          <p className="text-[10px] text-indigo-700 font-semibold">{getRatingWord(communicationRating)}</p>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setCommunicationRating(s)}
                              className="p-0.5 cursor-pointer"
                            >
                              <Star
                                className={cn(
                                  'h-4.5 w-4.5',
                                  s <= communicationRating ? 'fill-amber-400 text-amber-500' : 'text-mist-300',
                                )}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Highlights */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-600 mb-1.5">
                        3. Wybierz atuty wykonawcy (do 3):
                      </label>
                      <div className="grid grid-cols-1 gap-1.5">
                        {SERVICE_REVIEW_HIGHLIGHTS.slice(0, 6).map((hl) => {
                          const isSelected = selectedHighlights.includes(hl.id);
                          return (
                            <button
                              key={hl.id}
                              type="button"
                              onClick={() => handleToggleHighlight(hl.id)}
                              className={cn(
                                'flex items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-[11px] font-bold border transition-all cursor-pointer',
                                isSelected
                                  ? 'bg-ink text-white border-ink'
                                  : 'bg-mist/40 text-ink-800 border-mist-300 hover:bg-mist-200',
                              )}
                            >
                              <span className="flex items-center gap-1.5">
                                {renderHighlightIcon(hl.iconName, 'h-3.5 w-3.5')}
                                <span>{hl.label}</span>
                              </span>
                              {isSelected && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 4: Recommendation */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-600 mb-1.5">
                        4. Czy polecasz wykonawcę sąsiadom?
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setRecommendation('definitely')}
                          className={cn(
                            'flex items-center justify-center gap-1 p-2 rounded-xl border text-[11px] font-bold text-center cursor-pointer',
                            recommendation === 'definitely'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-mist text-ink-800 border-mist-300',
                          )}
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span>Polecam</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRecommendation('rather')}
                          className={cn(
                            'p-2 rounded-xl border text-[11px] font-bold text-center cursor-pointer',
                            recommendation === 'rather'
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-mist text-ink-800 border-mist-300',
                          )}
                        >
                          👌 Raczej tak
                        </button>
                        <button
                          type="button"
                          onClick={() => setRecommendation('not_recommended')}
                          className={cn(
                            'flex items-center justify-center gap-1 p-2 rounded-xl border text-[11px] font-bold text-center cursor-pointer',
                            recommendation === 'not_recommended'
                              ? 'bg-coral-700 text-white border-coral-700'
                              : 'bg-mist text-ink-800 border-mist-300',
                          )}
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                          <span>Nie</span>
                        </button>
                      </div>
                    </div>

                    {reviewError && (
                      <p className="text-[11.5px] font-bold text-coral-800">{reviewError}</p>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setReviewFormOpen(false)}
                        className="rounded-xl px-3 py-1.5 text-[11.5px] font-bold text-ink-600 hover:bg-mist-200 cursor-pointer"
                      >
                        Anuluj
                      </button>
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 rounded-xl bg-coral px-4 py-1.5 text-[12px] font-extrabold text-ink shadow-xs hover:bg-coral-400 cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Zapisz ocenę</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* DESKTOP CONTACT BUTTONS */}
              <div className="hidden md:flex flex-col gap-2.5 mt-5 pt-5 border-t border-mist-200">
                <a
                  href={`tel:${provider.phone.replace(/\s+/g, '')}`}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-coral text-[14px] font-extrabold text-ink shadow-sm hover:bg-coral-400 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Phone className="h-4 w-4" />
                  <span>Zadzwoń teraz: {provider.phone}</span>
                </a>

                <button
                  type="button"
                  onClick={() => onContactChat(provider)}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-[13.5px] font-bold text-white shadow-sm hover:bg-ink-800 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4 text-coral-300" />
                  <span>Napisz na czacie w mójMińsk</span>
                </button>

                <div className="mt-1 flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-800">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>
                    {userStreet
                      ? `Bezpieczne zlecenie sąsiedzkie na ul. ${userStreet}`
                      : 'Bezpieczne zlecenie sąsiedzkie w Mińsku'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (Desktop 7-8 cols): DESCRIPTION, PORTFOLIO & REVIEWS */}
          <div className="md:col-span-7 lg:col-span-8 space-y-4">
            {/* 1. ABOUT & SPECIALIZATIONS + RATINGS PER SERVICE SCOPE */}
            <section className="rounded-3xl bg-white p-5 md:p-6 shadow-card border border-mist-200 space-y-4">
              <div>
                <h2 className="font-display text-[18px] font-bold text-ink">
                  Zakres usług
                </h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-700 whitespace-pre-line">
                  {provider.description}
                </p>

                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {provider.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-xl bg-sand-100 border border-sand-300 px-3 py-1 text-[12px] font-bold text-ink-900 shadow-2xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Scope of service breakdown linking services to actual evaluated jobs */}
              {stats.servicesBreakdown.length > 0 && (
                <div className="pt-4 border-t border-mist-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                        <BadgeCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-[14px] font-bold text-ink leading-tight">
                          Sprawdzone realizacje według usług
                        </h3>
                        <p className="text-[11.5px] text-ink-500">
                          Średnia ocen sąsiadów w konkretnych pracach
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-900">
                      <ShieldCheck className="h-3 w-3 text-emerald-700" />
                      Zweryfikowane oceny
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {stats.servicesBreakdown.map((item) => {
                      const isHigh = item.avgRating >= 4.5;
                      const isMid = item.avgRating >= 3.0 && item.avgRating < 4.5;

                      return (
                        <div
                          key={item.tag}
                          className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-sand-50/70 border border-sand-300 shadow-2xs hover:border-ink-400 hover:bg-sand-50 transition-all"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-[13.5px] font-extrabold text-ink truncate leading-tight">
                              {item.tag}
                            </p>
                            <p className="text-[11.5px] font-semibold text-ink-600 flex items-center gap-1 mt-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span>
                                {item.count} {item.count === 1 ? 'oceniona realizacja' : 'ocenione realizacje'}
                              </span>
                            </p>
                          </div>

                          <div
                            className={cn(
                              'flex items-center gap-1.5 shrink-0 rounded-xl px-2.5 py-1.5 font-black border shadow-2xs',
                              isHigh && 'bg-amber-100 border-amber-300 text-ink',
                              isMid && 'bg-amber-50 border-amber-300 text-amber-950',
                              !isHigh && !isMid && 'bg-rose-50 border-rose-300 text-rose-950',
                            )}
                          >
                            <Star
                              className={cn(
                                'h-4 w-4',
                                isHigh ? 'fill-amber-500 text-amber-500' : 'fill-amber-400 text-amber-500',
                              )}
                            />
                            <span className="font-display text-[15px]">{item.avgRating.toFixed(1)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* 2. PORTFOLIO GALLERY (Up to 6 realizations) */}
            {provider.portfolio.length > 0 && (
              <section className="rounded-3xl bg-white p-5 md:p-6 shadow-card border border-mist-200">
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <div>
                    <h2 className="font-display text-[18px] font-bold text-ink flex items-center gap-2">
                      <Camera className="h-5 w-5 text-coral-700" />
                      <span>Realizacje u sąsiadów ({provider.portfolio.length})</span>
                    </h2>
                    <p className="text-[12px] text-ink-500">
                      Zdjęcia wykonanych prac na terenie Mińska Mazowieckiego i okolic
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {provider.portfolio.slice(0, 6).map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLightboxIndex(idx)}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-mist-200 bg-mist/40 text-left transition-all hover:shadow-md cursor-pointer"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-mist">
                        <img
                          src={item.imageUrl}
                          alt={item.caption}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        {item.locationLabel && (
                          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-lg bg-ink/80 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white">
                            <MapPin className="h-2.5 w-2.5 text-coral-300" />
                            {item.locationLabel}
                          </span>
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="text-[12px] font-bold text-ink line-clamp-2 leading-snug">
                          {item.caption}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* 3. NEIGHBORHOOD VERIFICATION & SECURITY PASSPORT */}
            <section className="rounded-3xl bg-sand-50/70 p-4 md:p-5 border border-sand-300 flex items-start gap-3.5 text-[12px] text-ink-700">
              <ShieldCheck className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-ink text-[13px]">
                  Weryfikacja tożsamości sąsiedzkiej mójMińsk
                </p>
                <p className="text-[11.5px] leading-relaxed text-ink-600">
                  W profilu wykonawcy zrezygnowaliśmy z otwartych, subiektywnych komentarzy i hejtu. Wszystkie parametry jakości opierają się na zamkniętym formularzu wypełnianym przez zweryfikowanych mieszkańców.
                  {stats.verifiedStreets.length > 0 && (
                    <span className="block mt-1 font-semibold text-ink-800">
                      Oceny pochodzą od sąsiadów z ulic: {stats.verifiedStreets.join(', ')}.
                    </span>
                  )}
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* MOBILE STICKY BOTTOM CONTACT BAR */}
        <div className="md:hidden border-t border-mist-300 bg-white px-5 py-3 pb-[max(env(safe-area-inset-bottom),14px)] shrink-0 shadow-float flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onContactChat(provider)}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-ink text-[13.5px] font-bold text-white shadow-sm active:scale-[0.98] transition-all cursor-pointer"
          >
            <MessageCircle className="h-4 w-4 text-coral-300" />
            <span>Napisz na czacie</span>
          </button>

          <a
            href={`tel:${provider.phone.replace(/\s+/g, '')}`}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-coral text-[14px] font-extrabold text-ink shadow-sm active:scale-[0.98] transition-all cursor-pointer"
          >
            <Phone className="h-4 w-4" />
            <span>Zadzwoń teraz</span>
          </a>
        </div>
      </div>

      {/* PORTFOLIO LIGHTBOX OVERLAY */}
      {lightboxIndex !== null && provider.portfolio[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-ink/95 p-4 backdrop-blur-sm"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            aria-label="Zamknij podgląd zdjęcia"
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="relative max-w-3xl w-full overflow-hidden rounded-3xl bg-ink-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={provider.portfolio[lightboxIndex].imageUrl}
              alt={provider.portfolio[lightboxIndex].caption}
              className="max-h-[72vh] w-full object-contain bg-black"
            />
            <div className="p-4 bg-ink text-white flex items-center justify-between gap-4">
              <div>
                <p className="text-[14px] font-bold">{provider.portfolio[lightboxIndex].caption}</p>
                {provider.portfolio[lightboxIndex].locationLabel && (
                  <p className="mt-0.5 text-[12px] text-sand flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-coral" />
                    {provider.portfolio[lightboxIndex].locationLabel}
                  </p>
                )}
              </div>

              {provider.portfolio.length > 1 && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex(
                        (lightboxIndex - 1 + provider.portfolio.length) % provider.portfolio.length,
                      )
                    }
                    className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-[12px] font-bold text-white/80">
                    {lightboxIndex + 1} / {provider.portfolio.length}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex((lightboxIndex + 1) % provider.portfolio.length)
                    }
                    className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25 cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
