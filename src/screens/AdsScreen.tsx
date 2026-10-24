import { useState } from 'react';
import {
  Briefcase,
  Check,
  Heart,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  Plus,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { ads as initialAds, jobs as initialJobs, type Ad, type Job, type User } from '../data/mockData';
import { Chip, Img, ProfileAvatarButton, ScreenHeader, SearchField, Segmented, StreetPill, cn, toneBg, zl } from '../components/ui';
import type { AdFilterState } from './AdFiltersModal';

const filters = [
  { id: 'all', label: 'Wszystkie' },
  { id: 'saved', label: 'Obserwowane' },
  { id: 'sell', label: 'Sprzedam' },
  { id: 'free', label: 'Oddam' },
  { id: 'lost', label: 'Zgubione' },
] as const;

interface AdsScreenProps {
  user?: User;
  onProfile?: () => void;
  adsList?: Ad[];
  jobsList?: Job[];
  likedAds?: Record<string, boolean>;
  appliedJobs?: Record<string, boolean>;
  onToggleLike?: (adId: string) => void;
  onAdClick?: (ad: Ad) => void;
  onJobClick?: (job: Job) => void;
  onApplyJob?: (job: Job) => void;
  onAddClick?: () => void;
  onChatClick?: (ad: Ad) => void;
  onMyAdsClick?: () => void;
  onOpenFilters?: () => void;
  activeFiltersCount?: number;
  onOpenConversations?: () => void;
  conversationsUnreadCount?: number;
  filtersState?: AdFilterState;
}

export function AdsScreen({
  user,
  onProfile,
  adsList = initialAds,
  jobsList = initialJobs,
  likedAds = {},
  appliedJobs = {},
  onToggleLike,
  onAdClick,
  onJobClick,
  onApplyJob,
  onAddClick,
  onChatClick,
  onMyAdsClick,
  onOpenFilters,
  activeFiltersCount = 0,
  onOpenConversations,
  conversationsUnreadCount = 0,
  filtersState,
}: AdsScreenProps) {
  const [mode, setMode] = useState<'c2c' | 'jobs'>('c2c');
  const [filter, setFilter] = useState<(typeof filters)[number]['id']>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Count liked items
  const likedCount = adsList.filter((a) => !!likedAds[a.id]).length;

  // Filter and search logic for c2c ads
  let filteredAds = adsList.filter((a) => {
    // Kind / Saved filter
    if (filter === 'saved') {
      if (!likedAds[a.id]) return false;
    } else if (filter !== 'all') {
      if (a.kind !== filter) return false;
    }

    // Modal Filters
    if (filtersState) {
      if (filtersState.onlyPromoted && !a.promoted) return false;
      if (filtersState.onlyFree && a.kind !== 'free' && (a.price !== 0 && a.price !== null)) return false;
      if (filtersState.minPrice && (a.price === null || a.price < parseFloat(filtersState.minPrice))) return false;
      if (filtersState.maxPrice && (a.price === null || a.price > parseFloat(filtersState.maxPrice))) return false;
      if (filtersState.selectedCategory !== 'Wszystkie' && a.category !== filtersState.selectedCategory) return false;
      if (filtersState.selectedStreet !== 'all' && a.street.toLowerCase() !== filtersState.selectedStreet.toLowerCase()) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchStreet = a.street.toLowerCase().includes(q);
      const matchAuthor = a.author.toLowerCase().includes(q);
      const matchCategory = a.category?.toLowerCase().includes(q);
      return matchTitle || matchStreet || matchAuthor || matchCategory;
    }

    return true;
  });

  // Sorting
  filteredAds = [...filteredAds].sort((x, y) => {
    if (filtersState?.sortBy === 'price_asc') {
      const px = x.price ?? 0;
      const py = y.price ?? 0;
      return px - py;
    }
    if (filtersState?.sortBy === 'price_desc') {
      const px = x.price ?? 0;
      const py = y.price ?? 0;
      return py - px;
    }
    if (filtersState?.sortBy === 'popular') {
      return (y.views ?? 0) - (x.views ?? 0);
    }
    // Default: promoted first
    if (x.promoted && !y.promoted) return -1;
    if (!x.promoted && y.promoted) return 1;
    return 0;
  });

  // Filter and search logic for jobs
  const filteredJobs = jobsList.filter((j) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchPos = j.position.toLowerCase().includes(q);
    const matchComp = j.company.toLowerCase().includes(q);
    const matchTags = j.tags.some((t) => t.toLowerCase().includes(q));
    return matchPos || matchComp || matchTags;
  });

  const handleModeChange = (nextMode: 'c2c' | 'jobs') => {
    setMode(nextMode);
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const handleFilterChange = (nextFilter: (typeof filters)[number]['id']) => {
    setFilter(nextFilter);
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  return (
    <div className="pb-36">
      <ScreenHeader
        title="Ogłoszenia"
        subtitle="Od sąsiadów i mińskich firm"
        right={
          <div className="flex items-center gap-1.5">
            {onOpenConversations && (
              <button
                type="button"
                onClick={onOpenConversations}
                className="relative grid h-11 w-11 place-items-center rounded-full bg-white text-ink shadow-card transition-transform active:scale-95"
                title="Wiadomości o ogłoszeniach"
              >
                <MessagesSquare className="h-4 w-4 text-ink-700" />
                {conversationsUnreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-coral px-1 text-[9.5px] font-extrabold text-ink shadow">
                    {conversationsUnreadCount}
                  </span>
                )}
              </button>
            )}
            {onMyAdsClick && (
              <button
                onClick={onMyAdsClick}
                className="flex h-11 items-center gap-1 rounded-full bg-white px-3 text-[13px] font-bold text-ink shadow-card transition-transform active:scale-95"
                title="Moje ogłoszenia"
              >
                <Megaphone className="h-3.5 w-3.5 text-ink-700" />
                Moje
              </button>
            )}
            <button
              onClick={onAddClick}
              className="flex h-11 items-center gap-1 rounded-full bg-coral px-3.5 text-[13px] font-bold text-ink shadow-coral transition-transform active:scale-95"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Dodaj
            </button>
            {user && onProfile && <ProfileAvatarButton user={user} onClick={onProfile} />}
          </div>
        }
      />

      <div className="space-y-3 px-5">
        <Segmented
          value={mode}
          onChange={handleModeChange}
          options={[
            { id: 'c2c', label: 'Sąsiedzkie', badge: adsList.length },
            { id: 'jobs', label: 'Praca', badge: jobsList.length },
          ]}
        />
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SearchField
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={mode === 'c2c' ? 'Szukaj: rower, sofa, ulica…' : 'Stanowisko, firma, np. Motylek…'}
            />
          </div>
          {mode === 'c2c' && onOpenFilters && (
            <button
              type="button"
              onClick={onOpenFilters}
              aria-label="Filtry i sortowanie"
              className={cn(
                'relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition-all shadow-card active:scale-95',
                activeFiltersCount > 0 ? 'bg-ink text-white' : 'bg-white text-ink-700 hover:bg-mist-200',
              )}
            >
              <SlidersHorizontal className="h-5 w-5" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-coral text-[10.5px] font-extrabold text-ink shadow">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {mode === 'c2c' ? (
        <>
          {/* Filters Bar with Obserwowane Counter */}
          <div className="mt-4 flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar">
            {filters.map((f) => (
              <Chip key={f.id} active={filter === f.id} onClick={() => handleFilterChange(f.id)}>
                <span className="flex items-center gap-1.5">
                  {f.id === 'saved' && <Heart className={cn('h-3.5 w-3.5', filter === 'saved' ? 'fill-white' : 'text-coral')} />}
                  {f.label}
                  {f.id === 'saved' && likedCount > 0 && (
                    <span className={cn('rounded-full px-1.5 text-[10.5px]', filter === 'saved' ? 'bg-coral text-ink' : 'bg-mist text-ink-600')}>
                      {likedCount}
                    </span>
                  )}
                </span>
              </Chip>
            ))}
          </div>

          {filteredAds.length === 0 ? (
            <div className="mx-5 mt-6 rounded-3xl bg-white p-8 text-center shadow-card">
              {filter === 'saved' ? (
                <>
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-coral-50 text-coral">
                    <Heart className="h-6 w-6" />
                  </div>
                  <p className="mt-3 font-display text-[17px] font-bold text-ink">Brak obserwowanych ogłoszeń</p>
                  <p className="mt-1 text-[13px] text-ink-500">
                    Kliknij serduszko na dowolnym ogłoszeniu sąsiada, aby zapisać je na później.
                  </p>
                  <button
                    onClick={() => setFilter('all')}
                    className="mt-4 rounded-full bg-ink px-4 py-2 text-[12.5px] font-bold text-white"
                  >
                    Przeglądaj wszystkie
                  </button>
                </>
              ) : (
                <>
                  <p className="font-display text-[17px] font-bold text-ink">Brak wyników</p>
                  <p className="mt-1 text-[13px] text-ink-500">
                    Nie znaleźliśmy ogłoszeń spełniających wybrane kryteria w Mińsku.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 px-5">
              {filteredAds.map((a) => {
                const isItemLiked = !!likedAds[a.id];
                return (
                  <article
                    key={a.id}
                    className={cn(
                      'group relative flex flex-col justify-between rounded-3xl p-2.5 shadow-card transition-shadow hover:shadow-float',
                      a.promoted
                        ? 'bg-gradient-to-b from-amber-50/70 to-white border-2 border-amber-300 ring-1 ring-amber-200'
                        : 'bg-white',
                    )}
                  >
                    <div>
                      {/* Thumbnail Container */}
                      <div
                        onClick={() => onAdClick?.(a)}
                        className="relative cursor-pointer overflow-hidden rounded-2xl bg-mist"
                      >
                        <Img
                          src={a.image}
                          alt={a.title}
                          className="aspect-[4/5] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleLike?.(a.id);
                          }}
                          aria-label="Obserwuj"
                          aria-pressed={isItemLiked}
                          className="absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-full bg-white/90 backdrop-blur shadow-sm transition-transform active:scale-90"
                        >
                          <Heart
                            className={cn('h-4 w-4 transition-colors', isItemLiked && 'fill-coral text-coral')}
                            aria-hidden
                          />
                        </button>

                        {/* Promoted Golden Badge */}
                        {a.promoted && (
                          <span className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-2 py-0.5 text-[9.5px] font-extrabold text-ink shadow">
                            <Sparkles className="h-3 w-3" />
                            Wyróżnione
                          </span>
                        )}

                        {/* Status / Kind Badge */}
                        {a.status === 'reserved' ? (
                          <span className={cn('absolute left-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-ink shadow', a.promoted ? 'top-8' : 'top-2')}>
                            Zarezerwowane
                          </span>
                        ) : a.status === 'sold' ? (
                          <span className={cn('absolute left-2 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-white shadow', a.promoted ? 'top-8' : 'top-2')}>
                            Sprzedane
                          </span>
                        ) : a.kind !== 'sell' ? (
                          <span
                            className={cn(
                              'absolute left-2 rounded-full px-2 py-0.5 text-[10.5px] font-bold shadow',
                              a.promoted ? 'top-8' : 'top-2',
                              a.kind === 'free' ? 'bg-sky text-ink' : 'bg-coral text-ink',
                            )}
                          >
                            {a.kind === 'free' ? 'Oddam' : 'Zaginął'}
                          </span>
                        ) : null}
                      </div>

                      {/* Content Preview */}
                      <div className="px-1 pb-1 pt-2.5">
                        <div
                          onClick={() => onAdClick?.(a)}
                          className="cursor-pointer"
                        >
                          <p className="font-display text-[18px] font-semibold leading-none text-ink">
                            {a.price ? zl(a.price) : a.kind === 'free' ? 'Za darmo' : 'Pomóż'}
                          </p>
                          <p className="mt-1 line-clamp-2 min-h-[2.5em] text-[13px] font-semibold leading-snug text-ink-700">
                            {a.title}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-1">
                          <StreetPill street={a.street} />
                          <span className="text-[10.5px] text-ink-400">{a.time}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onChatClick?.(a)}
                      className="mt-2.5 flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-mist text-[12px] font-bold text-ink hover:bg-mist-200 transition-colors"
                    >
                      <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                      Napisz do {a.author}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Jobs List */
        <div className="mt-4 space-y-3 px-5">
          {filteredJobs.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-center shadow-card">
              <p className="font-display text-[17px] font-bold text-ink">Brak ofert pracy</p>
              <p className="mt-1 text-[13px] text-ink-500">
                Nie znaleźliśmy pasujących ogłoszeń pracodawców.
              </p>
            </div>
          ) : (
            filteredJobs.map((j) => {
              const hasApplied = !!appliedJobs[j.id];
              return (
                <article
                  key={j.id}
                  className="rounded-4xl bg-white p-4 shadow-card hover:shadow-float transition-shadow"
                >
                  <div
                    onClick={() => onJobClick?.(j)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          'grid h-12 w-12 shrink-0 place-items-center rounded-2xl font-display text-[18px] font-semibold',
                          toneBg[j.tone],
                        )}
                      >
                        {j.company.slice(0, 2)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-semibold text-ink-400">{j.company}</p>
                        <p className="text-[16.5px] font-bold leading-tight text-ink hover:text-coral transition-colors">
                          {j.position}
                        </p>
                      </div>
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-ink-400">
                        {j.time}
                      </span>
                    </div>
                    <p className="mt-3 font-display text-[22px] font-semibold text-ink">
                      {j.salary} <span className="font-sans text-[12px] font-medium text-ink-400">{j.period}</span>
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {j.tags.map((t) => (
                        <span key={t} className="rounded-full bg-mist px-2.5 py-1 text-[11.5px] font-semibold text-ink-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => onApplyJob ? onApplyJob(j) : null}
                    disabled={hasApplied}
                    className={cn(
                      'mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full text-[14px] font-bold transition-colors',
                      hasApplied ? 'bg-sky-100 text-sky-700' : 'bg-ink text-white active:scale-[.99]',
                    )}
                  >
                    {hasApplied ? (
                      <>
                        <Check className="h-4 w-4" aria-hidden /> Zgłoszenie wysłane
                      </>
                    ) : (
                      'Aplikuj jednym kliknięciem (1-Click)'
                    )}
                  </button>
                  {!hasApplied && (
                    <p className="mt-2 text-center text-[11px] text-ink-400">
                      Pracodawca dostanie: imię, ulicę i telefon
                    </p>
                  )}
                </article>
              );
            })
          )}

          {/* Business Banner: Post a Job with 1-Click BLIK */}
          <div className="flex items-center gap-3 rounded-4xl bg-sand-100 p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sand">
              <Briefcase className="h-5 w-5" aria-hidden />
            </span>
            <div className="flex-1">
              <p className="text-[14px] font-bold text-ink flex items-center gap-1.5">
                Szukasz pracownika w Mińsku?
                <Sparkles className="h-3.5 w-3.5 text-coral" />
              </p>
              <p className="text-[12px] text-ink-500">Oferta na 14 dni za 10 zł (BLIK)</p>
            </div>
            <button
              onClick={onAddClick}
              className="rounded-full bg-ink px-4 py-2.5 text-[12.5px] font-bold text-white transition-transform active:scale-95"
            >
              BLIK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
