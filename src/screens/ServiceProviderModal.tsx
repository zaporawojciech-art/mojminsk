import { useState } from 'react';
import {
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

              {/* 3 KPI BOXES */}
              <div className="mt-5 grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-mist/80 p-3 text-center border border-mist-200">
                  <div className="flex items-center justify-center gap-1 text-amber-500">
                    <Star className="h-4 w-4 fill-amber-400" />
                    <span className="font-display text-[18px] font-extrabold text-ink">
                      {stats.count > 0 ? stats.average.toFixed(1) : '—'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10.5px] font-semibold text-ink-500">Średnia ocen</p>
                </div>

                <div className="rounded-2xl bg-mist/80 p-3 text-center border border-mist-200">
                  <p className="font-display text-[18px] font-extrabold text-ink">{stats.count}</p>
                  <p className="mt-0.5 text-[10.5px] font-semibold text-ink-500">
                    {stats.count === 1 ? 'Opinia' : stats.count < 5 ? 'Opinie' : 'Opinii'} sąsiadów
                  </p>
                </div>

                <div className="rounded-2xl bg-mist/80 p-3 text-center border border-mist-200">
                  <p className="font-display text-[18px] font-extrabold text-ink">
                    {provider.yearsExperience}{' '}
                    <span className="text-[12px] font-bold">
                      {provider.yearsExperience === 1 ? 'rok' : provider.yearsExperience < 5 ? 'lata' : 'lat'}
                    </span>
                  </p>
                  <p className="mt-0.5 text-[10.5px] font-semibold text-ink-500">Doświadczenia</p>
                </div>
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
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (Desktop 7-8 cols): DESCRIPTION, PORTFOLIO & REVIEWS */}
          <div className="md:col-span-7 lg:col-span-8 space-y-4">
            {/* 1. ABOUT & SPECIALIZATIONS */}
            <section className="rounded-3xl bg-white p-5 md:p-6 shadow-card border border-mist-200">
              <h2 className="font-display text-[18px] font-bold text-ink">
                Zakres usług
              </h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-700 whitespace-pre-line">
                {provider.description}
              </p>

              <div className="mt-4 pt-4 border-t border-mist-100">
                <div className="flex flex-wrap gap-1.5">
                  {provider.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg bg-mist px-2.5 py-1 text-[11.5px] font-semibold text-ink-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
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

            {/* 3. NEIGHBOR TRUST & MULTIDIMENSIONAL QUALITY EVALUATION (NO TEXT COMMENTS) */}
            <section className="rounded-3xl bg-white p-5 md:p-6 shadow-card border border-mist-200">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-mist-200">
                <div>
                  <h2 className="font-display text-[18px] md:text-[20px] font-bold text-ink">
                    Ocena jakości i zaufania ({stats.count})
                  </h2>
                  <p className="text-[12px] text-ink-500">
                    Wielowymiarowy indeks zaufania zweryfikowanych mieszkańców Mińska i Gminy
                  </p>
                </div>

                {!hasAlreadyReviewed ? (
                  <button
                    type="button"
                    onClick={handleOpenReviewForm}
                    className="flex h-10 items-center gap-1.5 rounded-xl bg-ink px-4 text-[12.5px] font-bold text-white shadow-xs hover:bg-ink-800 active:scale-95 transition-all cursor-pointer"
                  >
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{reviewFormOpen ? 'Zamknij formularz' : '+ Wystaw ocenę'}</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 px-3 py-1.5 text-[11.5px] font-bold text-emerald-900">
                    <Check className="h-3.5 w-3.5 text-emerald-700" />
                    Dodałeś już swoją ocenę
                  </span>
                )}
              </div>

              {reviewSuccess && (
                <div className="mt-4 rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-center gap-2.5 text-[12.5px] font-bold text-emerald-950">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-700 shrink-0" />
                  <span>Dziękujemy! Twoja ocena została zapisana i zaktualizowała indeks jakości wykonawcy.</span>
                </div>
              )}

              {/* STRICTLY CLOSED EVALUATION FORM (NO TEXT COMMENTS) */}
              {reviewFormOpen && currentUser && (
                <form
                  onSubmit={handleSubmitReview}
                  className="mt-4 rounded-3xl bg-mist/80 p-4 md:p-6 border border-mist-300 space-y-5"
                >
                  {/* Resident Identity Header */}
                  <div className="rounded-2xl bg-white p-3.5 border border-mist-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={avatarUrl(currentUser.seed)}
                        alt={currentUser.name}
                        className="h-9 w-9 rounded-full bg-sand-100 object-cover ring-1 ring-mist-300 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-ink truncate">
                          Wystawiasz ocenę jako: {currentUser.name}
                        </p>
                        <p className="text-[11.5px] text-ink-500 truncate">
                          Mieszkaniec Mińska · ul. {currentUser.street.name}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-900">
                      Formularz zamknięty
                    </span>
                  </div>

                  {/* STEP 1: SERVICE SCOPE PICKER */}
                  <div>
                    <label className="block text-[11.5px] font-bold uppercase tracking-wider text-ink-600 mb-2">
                      1. Jakiej usługi dotyczyła realizacja?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {provider.tags.map((tag) => {
                        const active = serviceTagInput === tag;
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setServiceTagInput(tag)}
                            className={cn(
                              'rounded-xl px-3.5 py-2 text-[12px] font-bold transition-all cursor-pointer',
                              active
                                ? 'bg-ink text-white shadow-xs scale-[1.02]'
                                : 'bg-white text-ink-700 border border-mist-300 hover:bg-mist-200',
                            )}
                          >
                            {tag}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setServiceTagInput('Inna usługa / zlecenie ogólne')}
                        className={cn(
                          'rounded-xl px-3.5 py-2 text-[12px] font-bold transition-all cursor-pointer',
                          serviceTagInput === 'Inna usługa / zlecenie ogólne'
                            ? 'bg-ink text-white shadow-xs scale-[1.02]'
                            : 'bg-white text-ink-700 border border-mist-300 hover:bg-mist-200',
                        )}
                      >
                        Inna usługa z branży
                      </button>
                    </div>
                  </div>

                  {/* STEP 2: 4 QUALITY PILLARS */}
                  <div className="space-y-2.5">
                    <label className="block text-[11.5px] font-bold uppercase tracking-wider text-ink-600">
                      2. Oceń 4 kluczowe filary współpracy (skala 1–5):
                    </label>

                    {/* Pillar A: Quality & Craftsmanship */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl bg-white p-3.5 border border-mist-300">
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 place-items-center rounded-xl bg-sky-100 text-sky-700">
                          <Wrench className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-[12.5px] font-bold text-ink">Jakość i fachowość wykonania</p>
                          <p className="text-[11px] font-semibold text-sky-700">{getRatingWord(qualityRating)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 self-end sm:self-auto">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setQualityRating(s)}
                            className="p-1 hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                            aria-label={`Jakość: ${s} na 5`}
                          >
                            <Star
                              className={cn(
                                'h-6 w-6 transition-colors',
                                s <= qualityRating ? 'fill-amber-400 text-amber-500' : 'text-mist-300',
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Pillar B: Punctuality */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl bg-white p-3.5 border border-mist-300">
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-100 text-amber-700">
                          <Clock className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-[12.5px] font-bold text-ink">Terminowość i punktualność</p>
                          <p className="text-[11px] font-semibold text-amber-700">{getRatingWord(punctualityRating)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 self-end sm:self-auto">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setPunctualityRating(s)}
                            className="p-1 hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                            aria-label={`Terminowość: ${s} na 5`}
                          >
                            <Star
                              className={cn(
                                'h-6 w-6 transition-colors',
                                s <= punctualityRating ? 'fill-amber-400 text-amber-500' : 'text-mist-300',
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Pillar C: Price Fairness */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl bg-white p-3.5 border border-mist-300">
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                          <BadgeCheck className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-[12.5px] font-bold text-ink">Przejrzystość i uczciwość wyceny</p>
                          <p className="text-[11px] font-semibold text-emerald-700">{getRatingWord(priceFairnessRating)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 self-end sm:self-auto">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setPriceFairnessRating(s)}
                            className="p-1 hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                            aria-label={`Wycena: ${s} na 5`}
                          >
                            <Star
                              className={cn(
                                'h-6 w-6 transition-colors',
                                s <= priceFairnessRating ? 'fill-amber-400 text-amber-500' : 'text-mist-300',
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Pillar D: Communication & Culture */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl bg-white p-3.5 border border-mist-300">
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-100 text-indigo-700">
                          <Smile className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-[12.5px] font-bold text-ink">Komunikacja i kultura pracy</p>
                          <p className="text-[11px] font-semibold text-indigo-700">{getRatingWord(communicationRating)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 self-end sm:self-auto">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setCommunicationRating(s)}
                            className="p-1 hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                            aria-label={`Komunikacja: ${s} na 5`}
                          >
                            <Star
                              className={cn(
                                'h-6 w-6 transition-colors',
                                s <= communicationRating ? 'fill-amber-400 text-amber-500' : 'text-mist-300',
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* STEP 3: CLOSED HIGHLIGHT BADGES */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <label className="block text-[11.5px] font-bold uppercase tracking-wider text-ink-600">
                        3. Co najbardziej wyróżnia tego fachowca? (wybierz do 3):
                      </label>
                      <span className="text-[11px] font-bold text-ink-500">
                        Wybrano: {selectedHighlights.length}/3
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {SERVICE_REVIEW_HIGHLIGHTS.map((hl) => {
                        const isSelected = selectedHighlights.includes(hl.id);
                        return (
                          <button
                            key={hl.id}
                            type="button"
                            onClick={() => handleToggleHighlight(hl.id)}
                            className={cn(
                              'flex items-center gap-2.5 rounded-2xl p-3 text-left transition-all cursor-pointer border',
                              isSelected
                                ? 'bg-ink text-white border-ink shadow-xs'
                                : 'bg-white text-ink-800 border-mist-300 hover:bg-mist-200',
                            )}
                          >
                            <span
                              className={cn(
                                'grid h-7 w-7 place-items-center rounded-xl shrink-0',
                                isSelected ? 'bg-white/20 text-white' : 'bg-mist-200 text-ink-700',
                              )}
                            >
                              {renderHighlightIcon(hl.iconName, 'h-4 w-4')}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-[12px] font-bold leading-tight">{hl.label}</p>
                              <p
                                className={cn(
                                  'text-[10.5px] truncate mt-0.5',
                                  isSelected ? 'text-white/80' : 'text-ink-400',
                                )}
                              >
                                {hl.description}
                              </p>
                            </div>
                            {isSelected && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* STEP 4: RECOMMENDATION */}
                  <div>
                    <label className="block text-[11.5px] font-bold uppercase tracking-wider text-ink-600 mb-2">
                      4. Czy polecasz tego wykonawcę sąsiadom z Mińska?
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setRecommendation('definitely')}
                        className={cn(
                          'flex flex-col items-center justify-center gap-1 rounded-2xl p-3 border transition-all cursor-pointer',
                          recommendation === 'definitely'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-ink-800 border-mist-300 hover:bg-mist-200',
                        )}
                      >
                        <ThumbsUp className="h-5 w-5" />
                        <span className="text-[11.5px] font-bold text-center leading-tight">Zdecydowanie tak</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRecommendation('rather')}
                        className={cn(
                          'flex flex-col items-center justify-center gap-1 rounded-2xl p-3 border transition-all cursor-pointer',
                          recommendation === 'rather'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-white text-ink-800 border-mist-300 hover:bg-mist-200',
                        )}
                      >
                        <Smile className="h-5 w-5" />
                        <span className="text-[11.5px] font-bold text-center leading-tight">Raczej tak</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRecommendation('not_recommended')}
                        className={cn(
                          'flex flex-col items-center justify-center gap-1 rounded-2xl p-3 border transition-all cursor-pointer',
                          recommendation === 'not_recommended'
                            ? 'bg-coral-700 text-white border-coral-700 shadow-xs'
                            : 'bg-white text-ink-800 border-mist-300 hover:bg-mist-200',
                        )}
                      >
                        <ThumbsDown className="h-5 w-5" />
                        <span className="text-[11.5px] font-bold text-center leading-tight">Nie polecam</span>
                      </button>
                    </div>
                  </div>

                  {reviewError && (
                    <p className="text-[12px] font-bold text-coral-800">{reviewError}</p>
                  )}

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setReviewFormOpen(false)}
                      className="rounded-xl px-4 py-2.5 text-[12.5px] font-bold text-ink-600 hover:bg-mist-200 cursor-pointer"
                    >
                      Anuluj
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded-xl bg-coral px-5 py-2.5 text-[13px] font-extrabold text-ink shadow-xs hover:bg-coral-400 active:scale-95 transition-all cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Zapisz ocenę wykonawcy</span>
                    </button>
                  </div>
                </form>
              )}

              {/* EMPTY STATE */}
              {stats.count === 0 && !reviewFormOpen && (
                <div className="mt-4 rounded-3xl bg-mist/60 p-6 text-center border border-mist-200">
                  <Sparkles className="mx-auto h-7 w-7 text-amber-500" />
                  <p className="mt-2.5 text-[14px] font-bold text-ink">
                    Ten wykonawca nie ma jeszcze ocen w Strefie Zaufanej Usługi
                  </p>
                  <p className="mt-1 text-[12px] text-ink-500 max-w-sm mx-auto">
                    Korzystałeś z usług tego fachowca? Bądź pierwszym mieszkańcem Mińska, który oceni jakość współpracy!
                  </p>
                  {!hasAlreadyReviewed && (
                    <button
                      type="button"
                      onClick={handleOpenReviewForm}
                      className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-[12.5px] font-bold text-white hover:bg-ink-800 transition-all cursor-pointer"
                    >
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>Wystaw pierwszą ocenę</span>
                    </button>
                  )}
                </div>
              )}

              {/* RICH EVALUATION DASHBOARD (WHEN REVIEWS EXIST) */}
              {stats.count > 0 && (
                <div className="mt-4 space-y-4">
                  {/* HERO SCORE & RECOMMENDATION BANNER */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center rounded-3xl bg-mist/70 p-4 md:p-5 border border-mist-200">
                    {/* Big Score */}
                    <div className="sm:col-span-5 text-center sm:border-r sm:border-mist-300 sm:pr-4">
                      <div className="inline-flex items-baseline gap-1">
                        <span className="font-display text-[42px] font-black text-ink leading-none">
                          {stats.average.toFixed(1)}
                        </span>
                        <span className="text-[16px] font-bold text-ink-400">/ 5.0</span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-center gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              'h-4.5 w-4.5',
                              star <= Math.round(stats.average)
                                ? 'fill-amber-400 text-amber-500'
                                : 'text-mist-300',
                            )}
                          />
                        ))}
                      </div>
                      <p className="mt-1.5 text-[11.5px] font-semibold text-ink-600">
                        Na podstawie {stats.count}{' '}
                        {stats.count === 1 ? 'oceny' : stats.count < 5 ? 'ocen' : 'ocen'} mieszkańców
                      </p>
                    </div>

                    {/* Recommendation KPI */}
                    <div className="sm:col-span-7 flex flex-col justify-center sm:pl-2 space-y-2">
                      <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-100/90 border border-emerald-300 px-3.5 py-2 text-[13px] font-extrabold text-emerald-950">
                        <ThumbsUp className="h-4 w-4 text-emerald-700 shrink-0" />
                        <span>{stats.recommendPercent}% sąsiadów poleca tego wykonawcę</span>
                      </div>
                      <p className="text-[11.5px] text-ink-500 leading-snug">
                        Indeks wyliczony z zamkniętych ankiet porealizacyjnych. Profil nie zawiera subiektywnych komentarzy — liczą się wyłącznie twarde fakty i jakość robót.
                      </p>
                    </div>
                  </div>

                  {/* 4 QUALITY PILLARS BREAKDOWN */}
                  <div className="rounded-3xl bg-white p-4 md:p-5 border border-mist-200 space-y-3">
                    <p className="text-[12px] font-bold uppercase tracking-wider text-ink-500">
                      Filary jakości i standardu pracy:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Quality */}
                      <div className="rounded-2xl bg-mist/50 p-3 border border-mist-200">
                        <div className="flex items-center justify-between text-[12px] mb-1.5">
                          <span className="font-bold text-ink flex items-center gap-1.5">
                            <Wrench className="h-3.5 w-3.5 text-sky-600" />
                            Jakość i fachowość
                          </span>
                          <span className="font-display font-extrabold text-ink">
                            {stats.dimensions.quality.toFixed(1)} / 5
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-mist-300/70">
                          <div
                            className="h-full rounded-full bg-sky-500 transition-all duration-500"
                            style={{ width: `${(stats.dimensions.quality / 5) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Punctuality */}
                      <div className="rounded-2xl bg-mist/50 p-3 border border-mist-200">
                        <div className="flex items-center justify-between text-[12px] mb-1.5">
                          <span className="font-bold text-ink flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-amber-600" />
                            Terminowość i czas
                          </span>
                          <span className="font-display font-extrabold text-ink">
                            {stats.dimensions.punctuality.toFixed(1)} / 5
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-mist-300/70">
                          <div
                            className="h-full rounded-full bg-amber-500 transition-all duration-500"
                            style={{ width: `${(stats.dimensions.punctuality / 5) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Price Fairness */}
                      <div className="rounded-2xl bg-mist/50 p-3 border border-mist-200">
                        <div className="flex items-center justify-between text-[12px] mb-1.5">
                          <span className="font-bold text-ink flex items-center gap-1.5">
                            <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
                            Uczciwość i wycena
                          </span>
                          <span className="font-display font-extrabold text-ink">
                            {stats.dimensions.priceFairness.toFixed(1)} / 5
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-mist-300/70">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${(stats.dimensions.priceFairness / 5) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Communication */}
                      <div className="rounded-2xl bg-mist/50 p-3 border border-mist-200">
                        <div className="flex items-center justify-between text-[12px] mb-1.5">
                          <span className="font-bold text-ink flex items-center gap-1.5">
                            <Smile className="h-3.5 w-3.5 text-indigo-600" />
                            Kultura i kontakt
                          </span>
                          <span className="font-display font-extrabold text-ink">
                            {stats.dimensions.communication.toFixed(1)} / 5
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-mist-300/70">
                          <div
                            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                            style={{ width: `${(stats.dimensions.communication / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TOP HIGHLIGHTS CONFIRMED BY RESIDENTS */}
                  {stats.topHighlights.length > 0 && (
                    <div className="rounded-3xl bg-white p-4 md:p-5 border border-mist-200 space-y-3">
                      <p className="text-[12px] font-bold uppercase tracking-wider text-ink-500">
                        Mocne strony potwierdzone przez sąsiadów:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {stats.topHighlights.map((hl) => (
                          <div
                            key={hl.id}
                            className="flex items-center justify-between gap-2 rounded-2xl bg-mist/40 px-3.5 py-2.5 border border-mist-200"
                          >
                            <span className="inline-flex items-center gap-2 text-[12px] font-bold text-ink">
                              <span className="grid h-6 w-6 place-items-center rounded-lg bg-emerald-100 text-emerald-800">
                                {renderHighlightIcon(hl.iconName, 'h-3.5 w-3.5')}
                              </span>
                              {hl.label}
                            </span>
                            <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-extrabold text-emerald-900">
                              {hl.percent}% sąsiadów
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* BREAKDOWN BY SCOPE OF SERVICES (ZAKRES USŁUG) */}
                  <div className="rounded-3xl bg-white p-4 md:p-5 border border-mist-200 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[12px] font-bold uppercase tracking-wider text-ink-500">
                        Oceny według zakresu usług:
                      </p>
                      <span className="text-[11px] font-semibold text-ink-400">
                        Sprawdzone realizacje
                      </span>
                    </div>

                    <div className="divide-y divide-mist-200 rounded-2xl border border-mist-200 overflow-hidden bg-mist/30">
                      {stats.servicesBreakdown.length > 0 ? (
                        stats.servicesBreakdown.map((item) => (
                          <div
                            key={item.tag}
                            className="flex items-center justify-between gap-3 p-3 bg-white hover:bg-sand-50/50 transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="text-[13px] font-bold text-ink truncate">{item.tag}</p>
                              <p className="text-[11px] text-ink-500">
                                {item.count} {item.count === 1 ? 'oceniona realizacja' : 'ocenione realizacje'}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 rounded-xl bg-amber-50 border border-amber-200 px-2.5 py-1 text-amber-950 font-bold text-[12px]">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                              <span>{item.avgRating.toFixed(1)}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-[12px] text-ink-500 text-center bg-white">
                          Oceny ogólne wykonawcy obejmują cały profil usługowy.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* NEIGHBORHOOD VERIFICATION & SECURITY PASSPORT */}
                  <div className="rounded-3xl bg-sand-50/70 p-4 border border-sand-300 flex items-start gap-3 text-[12px] text-ink-700">
                    <ShieldCheck className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-ink">
                        Weryfikacja tożsamości sąsiedzkiej mójMińsk
                      </p>
                      <p className="text-[11.5px] leading-relaxed text-ink-600">
                        W profilu wykonawcy zrezygnowaliśmy z otwartych, subiektywnych komentarzy. Wszystkie parametry jakości opierają się na zamkniętym formularzu wypełnianym przez zweryfikowanych mieszkańców.
                        {stats.verifiedStreets.length > 0 && (
                          <span className="block mt-1 font-semibold text-ink-800">
                            Oceny pochodzą z ulic: {stats.verifiedStreets.join(', ')}.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
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
