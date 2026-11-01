import { useState } from 'react';
import {
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CornerDownRight,
  Flag,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Wrench,
  X,
} from 'lucide-react';
import { NativeHeader, cn } from '../components/ui';
import { avatarUrl, type User } from '../data/mockData';
import {
  computeProviderRatingStats,
  getServiceCategoryById,
  type ServiceProvider,
  type ServiceReview,
} from '../data/servicesData';
import { buildServiceProviderUrl } from '../router/urlUtils';

interface ServiceProviderModalProps {
  provider: ServiceProvider;
  currentUser: User | null;
  onClose: () => void;
  onContactChat: (provider: ServiceProvider) => void;
  onAddReview: (providerId: string, review: Omit<ServiceReview, 'id' | 'providerId' | 'createdAt' | 'timeLabel'>) => void;
  onReplyToReview: (providerId: string, reviewId: string, replyText: string) => void;
  onTogglePromote?: (providerId: string) => void;
  onApprovePending?: (providerId: string) => void;
  onAuthRequired?: (title: string, desc: string) => void;
  isClosing?: boolean;
}

export function ServiceProviderModal({
  provider,
  currentUser,
  onClose,
  onContactChat,
  onAddReview,
  onReplyToReview,
  onApprovePending,
  onAuthRequired,
  isClosing = false,
}: ServiceProviderModalProps) {
  const stats = computeProviderRatingStats(provider.reviews);
  const category = getServiceCategoryById(provider.categoryId);
  const isPending = provider.status === 'pending_verification';

  // Lightbox state for portfolio gallery
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Add review form state
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [serviceTagInput, setServiceTagInput] = useState<string>(provider.tags[0] || '');
  const [commentInput, setCommentInput] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Provider reply state
  const [replyingToReviewId, setReplyingToReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Reported reviews state
  const [reportedReviewIds, setReportedReviewIds] = useState<Record<string, boolean>>({});
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
        'Wystaw opinię wykonawcy',
        'Opinie w Strefie Zaufanej Usługi mogą wystawiać wyłącznie zalogowani mieszkańcy Mińska Mazowieckiego i Gminy.',
      );
      return;
    }
    setReviewFormOpen((prev) => !prev);
    setReviewError(null);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const trimmed = commentInput.trim();
    if (trimmed.length < 10) {
      setReviewError('Napisz przynajmniej krótkie zdanie (min. 10 znaków), aby pomóc innym sąsiadom.');
      return;
    }

    onAddReview(provider.id, {
      authorId: currentUser.profileId,
      authorName: currentUser.name,
      authorStreet: currentUser.street.name,
      authorSeed: currentUser.seed,
      rating: ratingInput,
      comment: trimmed,
      serviceTag: serviceTagInput || undefined,
    });

    setCommentInput('');
    setReviewError(null);
    setReviewFormOpen(false);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 4000);
  };

  const handleSubmitReply = (reviewId: string) => {
    const trimmed = replyText.trim();
    if (!trimmed) return;
    onReplyToReview(provider.id, reviewId, trimmed);
    setReplyingToReviewId(null);
    setReplyText('');
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

            {/* 3. NEIGHBOR REVIEWS & RATING BREAKDOWN */}
            <section className="rounded-3xl bg-white p-5 md:p-6 shadow-card border border-mist-200">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-mist-200">
                <div>
                  <h2 className="font-display text-[18px] md:text-[20px] font-bold text-ink">
                    Opinie mieszkańców ({stats.count})
                  </h2>
                  <p className="text-[12px] text-ink-500">
                    Komentarze podpisane imieniem i ulicą sąsiada z Mińska Mazowieckiego
                  </p>
                </div>

                {!hasAlreadyReviewed ? (
                  <button
                    type="button"
                    onClick={handleOpenReviewForm}
                    className="flex h-10 items-center gap-1.5 rounded-xl bg-ink px-4 text-[12.5px] font-bold text-white shadow-xs hover:bg-ink-800 active:scale-95 transition-all cursor-pointer"
                  >
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{reviewFormOpen ? 'Zamknij formularz' : '+ Wystaw opinię'}</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 px-3 py-1.5 text-[11.5px] font-bold text-emerald-900">
                    <Check className="h-3.5 w-3.5 text-emerald-700" />
                    Dodałeś już swoją opinię
                  </span>
                )}
              </div>

              {reviewSuccess && (
                <div className="mt-4 rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-center gap-2.5 text-[12.5px] font-bold text-emerald-950">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-700 shrink-0" />
                  <span>Dziękujemy! Twoja sąsiedzka opinia została opublikowana na profilu wykonawcy.</span>
                </div>
              )}

              {/* RATING BREAKDOWN BARS */}
              {stats.count > 0 && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center rounded-2xl bg-mist/60 p-4 border border-mist-200/80">
                  <div className="sm:col-span-4 text-center sm:border-r sm:border-mist-300/80 sm:pr-4">
                    <p className="font-display text-[34px] font-extrabold text-ink leading-none">
                      {stats.average.toFixed(1)}
                    </p>
                    <div className="mt-1.5 flex items-center justify-center gap-0.5 text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            'h-4 w-4',
                            star <= Math.round(stats.average)
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-mist-300',
                          )}
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-[11.5px] font-semibold text-ink-500">
                      Na podstawie {stats.count}{' '}
                      {stats.count === 1 ? 'opinii' : 'opinii sąsiadów'}
                    </p>
                  </div>

                  <div className="sm:col-span-8 space-y-1.5">
                    {([5, 4, 3, 2, 1] as const).map((star) => {
                      const c = stats.distribution[star] || 0;
                      const pct = stats.count > 0 ? Math.round((c / stats.count) * 100) : 0;
                      return (
                        <div key={star} className="flex items-center gap-2.5 text-[11.5px]">
                          <span className="w-8 font-bold text-ink-700 flex items-center gap-0.5">
                            {star} <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                          </span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-mist-300/70">
                            <div
                              className="h-full rounded-full bg-amber-400 transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-9 text-right font-semibold text-ink-500">{c}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ADD REVIEW FORM */}
              {reviewFormOpen && currentUser && (
                <form
                  onSubmit={handleSubmitReview}
                  className="mt-4 rounded-3xl bg-mist/90 p-4 md:p-5 border border-mist-300 space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13.5px] font-bold text-ink">
                        Wystawiasz opinię jako: {currentUser.name} · Mieszkaniec Mińska · ul. {currentUser.street.name}
                      </p>
                      <p className="text-[11.5px] text-ink-500">
                        Twoja ocena pomoże innym mieszkańcom Mińska wybrać sprawdzonego fachowca.
                      </p>
                    </div>
                  </div>

                  {/* Interactive Stars */}
                  <div>
                    <label className="block text-[11.5px] font-bold uppercase tracking-wider text-ink-500 mb-1.5">
                      Twoja ocena (1–5 gwiazdek)
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const active = star <= (hoverRating ?? ratingInput);
                        return (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            onClick={() => setRatingInput(star)}
                            aria-label={`Ocena ${star} na 5`}
                            className="p-1 transition-transform active:scale-90 cursor-pointer"
                          >
                            <Star
                              className={cn(
                                'h-7 w-7 transition-colors',
                                active ? 'fill-amber-400 text-amber-500' : 'text-ink-300',
                              )}
                            />
                          </button>
                        );
                      })}
                      <span className="ml-2 text-[13px] font-extrabold text-ink">
                        {hoverRating ?? ratingInput} / 5
                      </span>
                    </div>
                  </div>

                  {/* Service Tag Picker */}
                  {provider.tags.length > 0 && (
                    <div>
                      <label className="block text-[11.5px] font-bold uppercase tracking-wider text-ink-500 mb-1.5">
                        Jakiej usługi dotyczyła realizacja?
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
                                'rounded-xl px-3 py-1.5 text-[11.5px] font-bold transition-colors cursor-pointer',
                                active
                                  ? 'bg-ink text-white'
                                  : 'bg-white text-ink-700 border border-mist-300 hover:bg-mist-200',
                              )}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Comment Textarea */}
                  <div>
                    <label
                      htmlFor="review-comment"
                      className="block text-[11.5px] font-bold uppercase tracking-wider text-ink-500 mb-1.5"
                    >
                      Komentarz sąsiedzki
                    </label>
                    <textarea
                      id="review-comment"
                      rows={3}
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Opisz krótko jak przebiegła współpraca, terminowość i jakość wykonania..."
                      className="w-full rounded-2xl border border-mist-300 bg-white p-3.5 text-[13px] text-ink placeholder:text-ink-400 focus:border-ink focus:outline-none"
                    />
                  </div>

                  {reviewError && (
                    <p className="text-[12px] font-bold text-coral-800">{reviewError}</p>
                  )}

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setReviewFormOpen(false)}
                      className="rounded-xl px-4 py-2 text-[12.5px] font-bold text-ink-600 hover:bg-mist-200 cursor-pointer"
                    >
                      Anuluj
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded-xl bg-coral px-5 py-2.5 text-[13px] font-extrabold text-ink shadow-xs hover:bg-coral-400 cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Opublikuj opinię</span>
                    </button>
                  </div>
                </form>
              )}

              {/* REVIEWS LIST */}
              <div className="mt-5 space-y-4">
                {provider.reviews.length === 0 ? (
                  <div className="rounded-2xl bg-mist/50 p-6 text-center">
                    <Sparkles className="mx-auto h-6 w-6 text-ink-400" />
                    <p className="mt-2 text-[13.5px] font-bold text-ink">
                      Ten wykonawca nie ma jeszcze opinii
                    </p>
                    <p className="mt-0.5 text-[12px] text-ink-500">
                      Korzystałeś z usług tego fachowca? Bądź pierwszym sąsiadem, który podzieli się opinią!
                    </p>
                  </div>
                ) : (
                  provider.reviews.map((review) => {
                    const isReported = reportedReviewIds[review.id];
                    const isReplying = replyingToReviewId === review.id;

                    return (
                      <article
                        key={review.id}
                        className="rounded-2xl border border-mist-200 bg-mist/30 p-4 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={avatarUrl(review.authorSeed)}
                              alt={review.authorName}
                              className="h-9 w-9 rounded-full bg-sand-100 object-cover ring-1 ring-mist-300"
                            />
                            <div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[13.5px] font-bold text-ink">
                                  {review.authorName}
                                </span>
                                <span className="text-[12px] font-semibold text-ink-500">
                                  · Mieszkaniec Mińska · ul. {review.authorStreet}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      className={cn(
                                        'h-3.5 w-3.5',
                                        s <= review.rating
                                          ? 'fill-amber-400 text-amber-500'
                                          : 'text-mist-300',
                                      )}
                                    />
                                  ))}
                                </div>
                                <span className="text-[11px] font-medium text-ink-400">
                                  · {review.timeLabel}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {review.serviceTag && (
                              <span className="hidden sm:inline-flex rounded-lg bg-white border border-mist-200 px-2.5 py-0.5 text-[10.5px] font-bold text-ink-600">
                                {review.serviceTag}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                setReportedReviewIds((prev) => ({ ...prev, [review.id]: true }))
                              }
                              title="Zgłoś naruszenie lub spam moderatorowi"
                              className="text-[11px] font-semibold text-ink-400 hover:text-coral-700 flex items-center gap-1 cursor-pointer"
                            >
                              <Flag className="h-3 w-3" />
                              <span>{isReported ? 'Zgłoszono do moderacji' : 'Zgłoś'}</span>
                            </button>
                          </div>
                        </div>

                        <p className="mt-3 text-[13px] leading-relaxed text-ink-700">
                          {review.comment}
                        </p>

                        {/* OFFICIAL PROVIDER REPLY */}
                        {review.providerReply ? (
                          <div className="mt-3 ml-3 sm:ml-6 rounded-2xl bg-white p-3.5 border border-mist-200 shadow-2xs">
                            <div className="flex items-center justify-between gap-2 text-[11.5px]">
                              <span className="inline-flex items-center gap-1.5 font-extrabold text-ink">
                                <CornerDownRight className="h-3.5 w-3.5 text-coral-700" />
                                <Wrench className="h-3 w-3 text-emerald-700" />
                                Odpowiedź wykonawcy ({provider.name})
                              </span>
                              {review.providerReplyAt && (
                                <span className="text-ink-400 font-medium">
                                  {review.providerReplyAt}
                                </span>
                              )}
                            </div>
                            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-600">
                              {review.providerReply}
                            </p>
                          </div>
                        ) : (
                          <div className="mt-2.5 flex items-center justify-end">
                            {!isReplying ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (!currentUser) {
                                    onAuthRequired?.(
                                      'Odpowiedź wykonawcy',
                                      'Zaloguj się na swoje konto w mójMińsk, aby odpowiedzieć pod recenzją klienta.',
                                    );
                                    return;
                                  }
                                  setReplyingToReviewId(review.id);
                                  setReplyText('');
                                }}
                                className="inline-flex items-center gap-1 text-[11.5px] font-bold text-ink-500 hover:text-ink cursor-pointer"
                              >
                                <CornerDownRight className="h-3 w-3" />
                                <span>Odpowiedz jako wykonawca</span>
                              </button>
                            ) : (
                              <div className="w-full mt-2 rounded-2xl bg-white p-3 border border-mist-300 space-y-2">
                                <p className="text-[11.5px] font-bold text-ink">
                                  Oficjalna odpowiedź wykonawcy ({provider.businessName}):
                                </p>
                                <textarea
                                  rows={2}
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Podziękuj za opinię lub odnieś się do komentarza sąsiada..."
                                  className="w-full rounded-xl border border-mist-300 p-2.5 text-[12.5px] text-ink focus:border-ink focus:outline-none"
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setReplyingToReviewId(null)}
                                    className="rounded-lg px-3 py-1 text-[11.5px] font-bold text-ink-500 hover:bg-mist cursor-pointer"
                                  >
                                    Anuluj
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSubmitReply(review.id)}
                                    className="rounded-lg bg-ink px-3.5 py-1 text-[11.5px] font-bold text-white hover:bg-ink-800 cursor-pointer"
                                  >
                                    Opublikuj odpowiedź
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </article>
                    );
                  })
                )}
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
