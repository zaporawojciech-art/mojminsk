import { useRef, useState } from 'react';
import {
  ArrowUpDown,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  Heart,
  LayoutGrid,
  List,
  MapPin,
  MessageCircle,
  MessagesSquare,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import {
  ads as initialAds,
  avatarUrl,
  streets,
  type Ad,
  type User,
} from '../data/mockData';
import {
  Chip,
  Img,
  ProfileAvatarButton,
  ScreenHeader,
  SectionHeader,
  StreetPill,
  cn,
  zl,
} from '../components/ui';
import type { AdFilterState } from './AdFiltersModal';

const RECENTLY_VIEWED_KEY = 'mojminsk_recently_viewed_ads';

interface CategoryItem {
  id: string;
  label: string;
  filterCategory?: string;
  filterKind?: 'sell' | 'free' | 'lost';
  isAll?: boolean;
  image?: string;
  tone?: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'all',
    label: 'Wszystkie kategorie',
    isAll: true,
  },
  {
    id: 'free',
    label: 'Oddam za darmo',
    filterKind: 'free',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200&auto=format&fit=crop&q=75',
    tone: 'bg-sky-100',
  },
  {
    id: 'home',
    label: 'Dom i Meble',
    filterCategory: 'Meble & Dom',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&auto=format&fit=crop&q=75',
    tone: 'bg-sand-100',
  },
  {
    id: 'electronics',
    label: 'Elektronika',
    filterCategory: 'Elektronika',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=75',
    tone: 'bg-sky-100',
  },
  {
    id: 'kids',
    label: 'Dla Dzieci',
    filterCategory: 'Dziecięce',
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=200&auto=format&fit=crop&q=75',
    tone: 'bg-coral-50',
  },
  {
    id: 'sport',
    label: 'Sport i Rowery',
    filterCategory: 'Sport & Rowery',
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=200&auto=format&fit=crop&q=75',
    tone: 'bg-sand-100',
  },
  {
    id: 'moto',
    label: 'Motoryzacja i Opony',
    filterCategory: 'Motoryzacja',
    image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=200&auto=format&fit=crop&q=75',
    tone: 'bg-mist',
  },
  {
    id: 'garden',
    label: 'Ogród i Rośliny',
    filterCategory: 'Ogród & Narzędzia',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=200&auto=format&fit=crop&q=75',
    tone: 'bg-sky-100',
  },
  {
    id: 'lost',
    label: 'Zgubione / Znalezione',
    filterKind: 'lost',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&auto=format&fit=crop&q=75',
    tone: 'bg-coral-50',
  },
];

const SORT_LABELS: Record<AdFilterState['sortBy'], string> = {
  newest: 'Najnowsze',
  price_asc: 'Najtańsze',
  price_desc: 'Najdroższe',
  popular: 'Popularne',
};

const QUICK_FILTERS = [
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
  likedAds?: Record<string, boolean>;
  onToggleLike?: (adId: string) => void;
  onAdClick?: (ad: Ad) => void;
  onChatClick?: (ad: Ad) => void;
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
  likedAds = {},
  onToggleLike,
  onAdClick,
  onChatClick,
  onOpenFilters,
  activeFiltersCount = 0,
  onOpenConversations,
  conversationsUnreadCount = 0,
  filtersState,
}: AdsScreenProps) {
  const [quickFilter, setQuickFilter] = useState<(typeof QUICK_FILTERS)[number]['id']>('all');
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [localStreetFilter, setLocalStreetFilter] = useState<string>('all');
  const [streetPickerOpen, setStreetPickerOpen] = useState(false);
  const [allCategoriesSheetOpen, setAllCategoriesSheetOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [localSort, setLocalSort] = useState<AdFilterState['sortBy'] | null>(null);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Horizontal scroll progress for 2-row category grid
  const catScrollRef = useRef<HTMLDivElement>(null);
  const [catScrollProgress, setCatScrollProgress] = useState(0);

  // Recently viewed ads
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(RECENTLY_VIEWED_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return ['a1', 'a7', 'a3', 'a5'];
  });

  const handleOpenAd = (ad: Ad) => {
    setRecentlyViewedIds((prev) => {
      const updated = [ad.id, ...prev.filter((id) => id !== ad.id)].slice(0, 8);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
      return updated;
    });
    onAdClick?.(ad);
  };

  const handleClearRecentlyViewed = () => {
    setRecentlyViewedIds([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify([]));
      } catch {
        // ignore
      }
    }
  };

  const handleCatScroll = () => {
    const el = catScrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) {
      setCatScrollProgress(0);
      return;
    }
    setCatScrollProgress(Math.min(1, Math.max(0, el.scrollLeft / maxScroll)));
  };

  const handleSelectCategory = (cat: CategoryItem) => {
    if (cat.isAll) {
      if (selectedCatId !== 'all' || quickFilter !== 'all') {
        setSelectedCatId('all');
        setQuickFilter('all');
      } else {
        setAllCategoriesSheetOpen(true);
      }
      return;
    }
    setQuickFilter('all');
    setSelectedCatId((prev) => (prev === cat.id ? 'all' : cat.id));
  };

  const likedCount = adsList.filter((a) => !!likedAds[a.id]).length;
  const activeSort = localSort ?? filtersState?.sortBy ?? 'newest';
  const effectiveStreet =
    localStreetFilter !== 'all'
      ? localStreetFilter
      : filtersState && filtersState.selectedStreet !== 'all'
        ? filtersState.selectedStreet
        : 'all';

  const activeCategoryObj = CATEGORIES.find((c) => c.id === selectedCatId);

  // Filter C2C ads
  let filteredAds = adsList.filter((a) => {
    if (quickFilter === 'saved') {
      if (!likedAds[a.id]) return false;
    } else if (quickFilter !== 'all') {
      if (a.kind !== quickFilter) return false;
    }

    if (activeCategoryObj && !activeCategoryObj.isAll) {
      if (activeCategoryObj.filterKind && a.kind !== activeCategoryObj.filterKind) return false;
      if (activeCategoryObj.filterCategory && a.category !== activeCategoryObj.filterCategory) return false;
    }

    if (effectiveStreet !== 'all' && a.street.toLowerCase() !== effectiveStreet.toLowerCase()) {
      return false;
    }

    if (filtersState) {
      if (filtersState.onlyPromoted && !a.promoted) return false;
      if (filtersState.onlyFree && a.kind !== 'free' && a.price !== 0 && a.price !== null) return false;
      if (filtersState.minPrice && (a.price === null || a.price < parseFloat(filtersState.minPrice))) return false;
      if (filtersState.maxPrice && (a.price === null || a.price > parseFloat(filtersState.maxPrice))) return false;
      if (
        selectedCatId === 'all' &&
        filtersState.selectedCategory !== 'Wszystkie' &&
        a.category !== filtersState.selectedCategory
      ) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchStreet = a.street.toLowerCase().includes(q);
      const matchAuthor = a.author.toLowerCase().includes(q);
      const matchCategory = a.category?.toLowerCase().includes(q);
      const matchDesc = a.description?.toLowerCase().includes(q);
      return matchTitle || matchStreet || matchAuthor || matchCategory || matchDesc;
    }

    return true;
  });

  // Sort C2C ads
  filteredAds = [...filteredAds].sort((x, y) => {
    if (activeSort === 'price_asc') return (x.price ?? 0) - (y.price ?? 0);
    if (activeSort === 'price_desc') return (y.price ?? 0) - (x.price ?? 0);
    if (activeSort === 'popular') return (y.views ?? 0) - (x.views ?? 0);
    if (x.promoted && !y.promoted) return -1;
    if (!x.promoted && y.promoted) return 1;
    return 0;
  });

  const recentlyViewedAds = recentlyViewedIds
    .map((id) => adsList.find((a) => a.id === id))
    .filter((a): a is Ad => Boolean(a));

  const isDefaultView =
    selectedCatId === 'all' &&
    quickFilter === 'all' &&
    !searchQuery.trim() &&
    effectiveStreet === 'all' &&
    activeFiltersCount === 0;

  const resetAllLocalFilters = () => {
    setSelectedCatId('all');
    setQuickFilter('all');
    setSearchQuery('');
    setLocalStreetFilter('all');
    setLocalSort(null);
  };

  return (
    <div className="pb-36">
      {/* Native mójMińsk Header */}
      <ScreenHeader
        title="Ogłoszenia"
        subtitle="Kupuj, sprzedawaj i oddawaj po sąsiedzku"
        right={
          <div className="flex items-center gap-2">
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
            {user && onProfile && <ProfileAvatarButton user={user} onClick={onProfile} />}
          </div>
        }
      />

      {/* Search + Street Filter + Filters Button */}
      <div className="space-y-3 px-5">
        <div className="flex items-center gap-2">
          <label className="flex h-12 flex-1 items-center gap-2.5 rounded-full bg-white pl-4 pr-2.5 shadow-card focus-within:ring-2 focus-within:ring-ink">
            <Search className="h-[18px] w-[18px] shrink-0 text-ink-400" aria-hidden />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj: rower, sofa, ulica…"
              className="min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-400"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-mist text-ink-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStreetPickerOpen((prev) => !prev)}
                className={cn(
                  'flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors',
                  effectiveStreet !== 'all' ? 'bg-ink text-white' : 'bg-mist text-ink-600',
                )}
                title="Filtruj po ulicy"
              >
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="max-w-[78px] truncate">
                  {effectiveStreet === 'all' ? 'Cały Mińsk' : effectiveStreet}
                </span>
                <ChevronDown className="h-3 w-3 shrink-0 opacity-70" />
              </button>
            )}
          </label>

          {onOpenFilters && (
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

        {/* Expandable Quick Street Selector */}
        {streetPickerOpen && (
          <div className="rounded-3xl bg-white p-3.5 shadow-card space-y-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-400">
                Ulica w Mińsku Mazowieckim
              </p>
              <button
                type="button"
                onClick={() => setStreetPickerOpen(false)}
                className="text-[11.5px] font-bold text-ink-500"
              >
                Zamknij
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto py-0.5">
              <button
                type="button"
                onClick={() => {
                  setLocalStreetFilter('all');
                  setStreetPickerOpen(false);
                }}
                className={cn(
                  'rounded-full px-3 py-1 text-[11.5px] font-bold transition-colors',
                  effectiveStreet === 'all' ? 'bg-ink text-white' : 'bg-mist text-ink-700',
                )}
              >
                Cały Mińsk Maz.
              </button>
              {streets.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => {
                    setLocalStreetFilter(s.name);
                    setStreetPickerOpen(false);
                  }}
                  className={cn(
                    'rounded-full px-3 py-1 text-[11.5px] font-semibold transition-colors',
                    effectiveStreet.toLowerCase() === s.name.toLowerCase()
                      ? 'bg-ink text-white font-bold'
                      : 'bg-mist text-ink-700 hover:bg-mist-200',
                  )}
                >
                  ul. {s.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 1: Przeglądaj kategorie (OLX 2-row horizontal grid adapted to mójMińsk UI) */}
      <section className="mx-5 mt-4 rounded-3xl bg-white p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-[17.5px] font-bold tracking-tight text-ink">
            Przeglądaj kategorie
          </h2>
          <button
            type="button"
            onClick={() => setAllCategoriesSheetOpen(true)}
            className="flex items-center gap-0.5 text-[12px] font-bold text-ink-500 active:opacity-60"
          >
            Wszystkie
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div
          ref={catScrollRef}
          onScroll={handleCatScroll}
          className="grid grid-rows-2 grid-flow-col auto-cols-[76px] gap-x-3 gap-y-3.5 overflow-x-auto pb-1.5 no-scrollbar"
        >
          {CATEGORIES.map((cat) => {
            const isSelected = cat.isAll
              ? selectedCatId === 'all' && quickFilter === 'all'
              : selectedCatId === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectCategory(cat)}
                className="group flex flex-col items-center focus:outline-none"
              >
                <div
                  className={cn(
                    'relative grid h-15 w-15 place-items-center rounded-full overflow-hidden transition-all duration-150 active:scale-95',
                    isSelected && !cat.isAll
                      ? 'ring-2 ring-ink bg-coral-100 shadow-sm'
                      : cat.tone || 'bg-mist',
                  )}
                >
                  {cat.isAll ? (
                    <svg
                      viewBox="0 0 28 28"
                      fill="none"
                      className="h-6 w-6 text-ink"
                      stroke="currentColor"
                      strokeWidth="2.1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="4" y="4" width="8" height="8" rx="2" />
                      <rect x="4" y="16" width="8" height="8" rx="2" />
                      <rect x="16" y="16" width="8" height="8" rx="2" />
                      <path d="M20 4v8M16 8h8" />
                    </svg>
                  ) : (
                    <Img
                      src={cat.image!}
                      alt={cat.label}
                      className="h-11 w-11 rounded-full object-cover shadow-xs"
                    />
                  )}
                </div>
                <span
                  className={cn(
                    'mt-1.5 text-center text-[11px] leading-[1.2] line-clamp-2 max-w-[74px]',
                    isSelected && !cat.isAll ? 'font-extrabold text-ink' : 'font-semibold text-ink-700',
                  )}
                >
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Horizontal Scroll Progress Pill Indicator */}
        <div className="mt-2 flex justify-center">
          <div className="h-1 w-11 rounded-full bg-mist-200 overflow-hidden">
            <div
              className="h-full w-1/2 rounded-full bg-ink-400 transition-transform duration-75"
              style={{ transform: `translateX(${catScrollProgress * 100}%)` }}
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: Ostatnio oglądane ogłoszenia */}
      {isDefaultView && recentlyViewedAds.length > 0 && (
        <section className="mt-5">
          <SectionHeader
            title="Ostatnio oglądane"
            action="Wyczyść"
            onAction={handleClearRecentlyViewed}
          />
          <div className="flex gap-3 overflow-x-auto px-5 pb-1 no-scrollbar">
            {recentlyViewedAds.map((ad) => {
              const isLiked = !!likedAds[ad.id];
              return (
                <article
                  key={`recent_${ad.id}`}
                  onClick={() => handleOpenAd(ad)}
                  className="w-44 shrink-0 cursor-pointer rounded-3xl bg-white p-2.5 shadow-card transition-transform active:scale-[0.98]"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-mist">
                    <Img src={ad.image} alt={ad.title} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLike?.(ad.id);
                      }}
                      aria-label="Obserwuj"
                      className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-full bg-white/90 backdrop-blur shadow-2xs"
                    >
                      <Heart className={cn('h-3.5 w-3.5', isLiked && 'fill-coral text-coral')} />
                    </button>
                  </div>
                  <div className="pt-2 px-0.5">
                    <p className="font-display text-[15.5px] font-semibold leading-none text-ink">
                      {ad.price ? zl(ad.price) : ad.kind === 'free' ? 'Za darmo' : 'Pomóż'}
                    </p>
                    <p className="mt-1 line-clamp-2 min-h-[2.4em] text-[12px] font-semibold leading-snug text-ink-700">
                      {ad.title}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <img
                        src={avatarUrl(ad.author)}
                        alt={ad.author}
                        className="h-4 w-4 rounded-full bg-sand-100 object-cover shrink-0"
                      />
                      <span className="truncate text-[10.5px] font-semibold text-ink-400">
                        {ad.author} · ul. {ad.street}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Quick Filters Bar (Chips) */}
      <div className="mt-4 flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar">
        {QUICK_FILTERS.map((f) => (
          <Chip key={f.id} active={quickFilter === f.id} onClick={() => setQuickFilter(f.id)}>
            <span className="flex items-center gap-1.5">
              {f.id === 'saved' && (
                <Heart className={cn('h-3.5 w-3.5', quickFilter === 'saved' ? 'fill-white' : 'text-coral')} />
              )}
              {f.label}
              {f.id === 'saved' && likedCount > 0 && (
                <span
                  className={cn(
                    'rounded-full px-1.5 text-[10.5px]',
                    quickFilter === 'saved' ? 'bg-coral text-ink' : 'bg-mist text-ink-600',
                  )}
                >
                  {likedCount}
                </span>
              )}
            </span>
          </Chip>
        ))}
      </div>

      {/* Active Category / Street Filter Pills */}
      {(selectedCatId !== 'all' || effectiveStreet !== 'all') && (
        <div className="mx-5 mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white px-3.5 py-2 shadow-card">
          <div className="flex flex-wrap items-center gap-1.5 text-[11.5px] font-bold text-ink">
            {activeCategoryObj && !activeCategoryObj.isAll && (
              <span className="inline-flex items-center gap-1 rounded-full bg-mist px-2.5 py-1">
                {activeCategoryObj.label}
                <button type="button" onClick={() => setSelectedCatId('all')}>
                  <X className="h-3 w-3 text-ink-500" />
                </button>
              </span>
            )}
            {effectiveStreet !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-mist px-2.5 py-1">
                ul. {effectiveStreet}
                <button type="button" onClick={() => setLocalStreetFilter('all')}>
                  <X className="h-3 w-3 text-ink-500" />
                </button>
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={resetAllLocalFilters}
            className="text-[11.5px] font-bold text-coral"
          >
            Wyczyść
          </button>
        </div>
      )}

      {/* Results Count + Sort & View Switcher Toolbar */}
      <div className="relative mt-4 flex items-center justify-between px-5">
        <div>
          <h2 className="font-display text-[18px] font-semibold tracking-tight text-ink">
            {quickFilter === 'saved'
              ? 'Obserwowane ogłoszenia'
              : activeCategoryObj && !activeCategoryObj.isAll
                ? activeCategoryObj.label
                : 'Ogłoszenia sąsiadów'}
          </h2>
          <p className="text-[11.5px] font-medium text-ink-400">
            Znaleźliśmy {filteredAds.length}{' '}
            {filteredAds.length === 1 ? 'ogłoszenie' : filteredAds.length < 5 ? 'ogłoszenia' : 'ogłoszeń'}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSortDropdownOpen((prev) => !prev)}
            className="flex h-9 items-center gap-1.5 rounded-full bg-white px-3 text-[11.5px] font-bold text-ink shadow-card active:scale-95"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-ink-500" />
            <span>{SORT_LABELS[activeSort]}</span>
          </button>

          <div className="flex rounded-full bg-white p-0.5 shadow-card">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Widok kafelków"
              className={cn(
                'grid h-8 w-8 place-items-center rounded-full transition-colors',
                viewMode === 'grid' ? 'bg-ink text-white' : 'text-ink-400',
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="Widok listy"
              className={cn(
                'grid h-8 w-8 place-items-center rounded-full transition-colors',
                viewMode === 'list' ? 'bg-ink text-white' : 'text-ink-400',
              )}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {sortDropdownOpen && (
          <div className="absolute right-5 top-11 z-30 w-48 rounded-2xl bg-white p-1.5 shadow-float">
            {(Object.keys(SORT_LABELS) as Array<AdFilterState['sortBy']>).map((sortKey) => (
              <button
                key={sortKey}
                type="button"
                onClick={() => {
                  setLocalSort(sortKey);
                  setSortDropdownOpen(false);
                }}
                className={cn(
                  'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[12.5px] font-bold',
                  activeSort === sortKey ? 'bg-mist text-ink' : 'text-ink-600 hover:bg-mist/60',
                )}
              >
                <span>{SORT_LABELS[sortKey]}</span>
                {activeSort === sortKey && <Check className="h-4 w-4 text-coral" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Ads Listing */}
      {filteredAds.length === 0 ? (
        <div className="mx-5 mt-4 rounded-3xl bg-white p-8 text-center shadow-card">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-coral-50 text-coral">
            <Heart className="h-6 w-6" />
          </div>
          <p className="mt-3 font-display text-[17px] font-bold text-ink">
            {quickFilter === 'saved' ? 'Brak obserwowanych ogłoszeń' : 'Brak wyników'}
          </p>
          <p className="mt-1 text-[13px] text-ink-500">
            {quickFilter === 'saved'
              ? 'Kliknij serduszko na dowolnym ogłoszeniu sąsiada, aby zapisać je na później.'
              : 'Nie znaleźliśmy ogłoszeń spełniających wybrane kryteria w Mińsku.'}
          </p>
          <button
            onClick={resetAllLocalFilters}
            className="mt-4 rounded-full bg-ink px-4 py-2 text-[12.5px] font-bold text-white"
          >
            Przeglądaj wszystkie
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* 2-Column Mosaic Grid (mójMińsk Card Style + Neighbor Avatar + OLX details) */
        <div className="mt-3 grid grid-cols-2 gap-3 px-5">
          {filteredAds.map((a) => {
            const isItemLiked = !!likedAds[a.id];
            const photoCount = a.images?.length ?? 1;
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
                  <div
                    onClick={() => handleOpenAd(a)}
                    className="relative cursor-pointer overflow-hidden rounded-2xl bg-mist"
                  >
                    <Img
                      src={a.image}
                      alt={a.title}
                      className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLike?.(a.id);
                      }}
                      aria-label="Obserwuj"
                      aria-pressed={isItemLiked}
                      className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-white/90 backdrop-blur shadow-sm transition-transform active:scale-90"
                    >
                      <Heart
                        className={cn('h-4 w-4 transition-colors', isItemLiked && 'fill-coral text-coral')}
                        aria-hidden
                      />
                    </button>

                    {a.promoted && (
                      <span className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-2 py-0.5 text-[9.5px] font-extrabold text-ink shadow">
                        <Sparkles className="h-3 w-3" />
                        Wyróżnione
                      </span>
                    )}

                    {photoCount > 1 && (
                      <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[9.5px] font-bold text-white backdrop-blur-xs">
                        <Camera className="h-2.5 w-2.5" />
                        {photoCount}
                      </span>
                    )}

                    {a.status === 'reserved' ? (
                      <span
                        className={cn(
                          'absolute left-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-ink shadow',
                          a.promoted ? 'top-8' : 'top-2',
                        )}
                      >
                        Zarezerwowane
                      </span>
                    ) : a.status === 'sold' ? (
                      <span
                        className={cn(
                          'absolute left-2 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-white shadow',
                          a.promoted ? 'top-8' : 'top-2',
                        )}
                      >
                        Sprzedane
                      </span>
                    ) : a.kind !== 'sell' ? (
                      <span
                        className={cn(
                          'absolute left-2 rounded-full px-2 py-0.5 text-[10px] font-bold shadow',
                          a.promoted ? 'top-8' : 'top-2',
                          a.kind === 'free' ? 'bg-sky text-ink' : 'bg-coral text-ink',
                        )}
                      >
                        {a.kind === 'free' ? 'Oddam' : 'Zaginął'}
                      </span>
                    ) : null}
                  </div>

                  <div className="px-1 pb-1 pt-2.5">
                    <div onClick={() => handleOpenAd(a)} className="cursor-pointer">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <p className="font-display text-[17.5px] font-semibold leading-none text-ink">
                          {a.price ? zl(a.price) : a.kind === 'free' ? 'Za darmo' : 'Pomóż'}
                        </p>
                        {a.negotiable && (
                          <span className="text-[10px] font-semibold text-ink-400">do negocjacji</span>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 min-h-[2.5em] text-[12.5px] font-semibold leading-snug text-ink-700">
                        {a.title}
                      </p>
                    </div>

                    {/* Neighbor Identity Row (Avatar + Name + StreetPill) */}
                    <div className="mt-2 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <img
                          src={avatarUrl(a.author)}
                          alt={a.author}
                          className="h-5 w-5 shrink-0 rounded-full bg-sand-100 object-cover"
                        />
                        <span className="truncate text-[11px] font-bold text-ink-700">{a.author}</span>
                      </div>
                      <span className="shrink-0 text-[10px] text-ink-400">{a.time}</span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between gap-1">
                      <StreetPill street={a.street} />
                      {a.condition && (
                        <span className="truncate text-[9.5px] font-semibold text-ink-400">
                          {a.condition}
                        </span>
                      )}
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
      ) : (
        /* Horizontal List View (mójMińsk Card Style + Neighbor Avatar) */
        <div className="mt-3 space-y-3 px-5">
          {filteredAds.map((a) => {
            const isItemLiked = !!likedAds[a.id];
            const photoCount = a.images?.length ?? 1;
            return (
              <article
                key={a.id}
                onClick={() => handleOpenAd(a)}
                className={cn(
                  'flex cursor-pointer gap-3.5 rounded-3xl p-3 shadow-card transition-shadow hover:shadow-float',
                  a.promoted
                    ? 'bg-gradient-to-r from-amber-50/70 to-white border-2 border-amber-300'
                    : 'bg-white',
                )}
              >
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-mist">
                  <Img src={a.image} alt={a.title} className="h-full w-full object-cover" />
                  {a.promoted && (
                    <span className="absolute left-1.5 top-1.5 flex items-center gap-0.5 rounded-full bg-amber-400 px-1.5 py-0.5 text-[8.5px] font-extrabold text-ink shadow">
                      <Sparkles className="h-2.5 w-2.5" />
                      Top
                    </span>
                  )}
                  {photoCount > 1 && (
                    <span className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[9px] font-bold text-white">
                      <Camera className="h-2.5 w-2.5" />
                      {photoCount}
                    </span>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <p className="font-display text-[17.5px] font-semibold leading-none text-ink">
                          {a.price ? zl(a.price) : a.kind === 'free' ? 'Za darmo' : 'Pomóż'}
                        </p>
                        {a.negotiable && (
                          <span className="text-[10px] font-semibold text-ink-400">do negocjacji</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLike?.(a.id);
                        }}
                        aria-label="Obserwuj"
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mist text-ink"
                      >
                        <Heart className={cn('h-3.5 w-3.5', isItemLiked && 'fill-coral text-coral')} />
                      </button>
                    </div>

                    <p className="mt-1 line-clamp-2 text-[13px] font-semibold leading-snug text-ink-700">
                      {a.title}
                    </p>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <img
                        src={avatarUrl(a.author)}
                        alt={a.author}
                        className="h-5 w-5 shrink-0 rounded-full bg-sand-100 object-cover"
                      />
                      <span className="truncate text-[11px] font-bold text-ink-700">{a.author}</span>
                      <StreetPill street={a.street} />
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChatClick?.(a);
                      }}
                      className="flex shrink-0 items-center gap-1 rounded-full bg-mist px-3 py-1.5 text-[11.5px] font-bold text-ink hover:bg-mist-200"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Czat
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Bottom Sheet: Wszystkie kategorie */}
      {allCategoriesSheetOpen && (
        <div
          onClick={() => setAllCategoriesSheetOpen(false)}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-4xl bg-white p-5 pb-8 shadow-float max-h-[82vh] flex flex-col"
          >
            <div className="flex items-center justify-between pb-3 border-b border-mist">
              <h3 className="font-display text-[19px] font-bold text-ink">Wszystkie kategorie</h3>
              <button
                type="button"
                onClick={() => setAllCategoriesSheetOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-mist text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-2 overflow-y-auto divide-y divide-mist">
              {CATEGORIES.map((cat) => {
                const count = cat.isAll
                  ? adsList.length
                  : adsList.filter((a) =>
                      cat.filterKind ? a.kind === cat.filterKind : a.category === cat.filterCategory,
                    ).length;

                return (
                  <button
                    key={`sheet_${cat.id}`}
                    type="button"
                    onClick={() => {
                      if (cat.isAll) {
                        setSelectedCatId('all');
                        setQuickFilter('all');
                      } else {
                        handleSelectCategory(cat);
                      }
                      setAllCategoriesSheetOpen(false);
                    }}
                    className="flex w-full items-center justify-between py-3 px-2 text-left rounded-2xl hover:bg-mist/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'grid h-11 w-11 shrink-0 place-items-center rounded-full overflow-hidden',
                          cat.tone || 'bg-mist',
                        )}
                      >
                        {cat.isAll ? (
                          <LayoutGrid className="h-5 w-5 text-ink" />
                        ) : (
                          <Img src={cat.image!} alt={cat.label} className="h-9 w-9 rounded-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-ink">{cat.label}</p>
                        <p className="text-[11.5px] text-ink-400">
                          {count} {count === 1 ? 'ogłoszenie' : count < 5 ? 'ogłoszenia' : 'ogłoszeń'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-ink-400" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
