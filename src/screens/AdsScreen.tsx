import { useState } from 'react';
import {
  Armchair,
  ArrowUpDown,
  Baby,
  Bike,
  Camera,
  Car,
  Check,
  ChevronDown,
  ChevronRight,
  Gift,
  Heart,
  HelpCircle,
  Laptop,
  LayoutGrid,
  Leaf,
  List,
  MapPin,
  MessageCircle,
  MessagesSquare,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
  type LucideIcon,
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
  icon: LucideIcon;
  badge?: string;
  tone: {
    bg: string;
    text: string;
    active: string;
  };
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'all',
    label: 'Wszystkie',
    isAll: true,
    icon: Sparkles,
    tone: {
      bg: 'bg-sand-100',
      text: 'text-sand-900',
      active: 'bg-ink text-white',
    },
  },
  {
    id: 'free',
    label: 'Oddam za darmo',
    filterKind: 'free',
    icon: Gift,
    badge: 'Sąsiedzkie',
    tone: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-900',
      active: 'bg-emerald-700 text-white',
    },
  },
  {
    id: 'home',
    label: 'Dom i Meble',
    filterCategory: 'Meble & Dom',
    icon: Armchair,
    tone: {
      bg: 'bg-amber-100',
      text: 'text-amber-900',
      active: 'bg-amber-700 text-white',
    },
  },
  {
    id: 'electronics',
    label: 'Elektronika',
    filterCategory: 'Elektronika',
    icon: Laptop,
    tone: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-900',
      active: 'bg-indigo-700 text-white',
    },
  },
  {
    id: 'kids',
    label: 'Dla Dzieci',
    filterCategory: 'Dziecięce',
    icon: Baby,
    tone: {
      bg: 'bg-pink-100',
      text: 'text-pink-900',
      active: 'bg-pink-700 text-white',
    },
  },
  {
    id: 'sport',
    label: 'Sport i Rowery',
    filterCategory: 'Sport & Rowery',
    icon: Bike,
    tone: {
      bg: 'bg-sky-100',
      text: 'text-sky-900',
      active: 'bg-sky-700 text-white',
    },
  },
  {
    id: 'garden',
    label: 'Ogród i Rośliny',
    filterCategory: 'Ogród & Narzędzia',
    icon: Leaf,
    tone: {
      bg: 'bg-teal-100',
      text: 'text-teal-900',
      active: 'bg-teal-700 text-white',
    },
  },
  {
    id: 'moto',
    label: 'Motoryzacja',
    filterCategory: 'Motoryzacja',
    icon: Car,
    tone: {
      bg: 'bg-stone-200',
      text: 'text-stone-900',
      active: 'bg-stone-800 text-white',
    },
  },
  {
    id: 'lost',
    label: 'Zgubione / Znalezione',
    filterKind: 'lost',
    icon: HelpCircle,
    tone: {
      bg: 'bg-coral-100',
      text: 'text-coral-900',
      active: 'bg-coral text-ink',
    },
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

  const getCategoryCount = (cat: CategoryItem) => {
    if (cat.isAll) return adsList.length;
    return adsList.filter((a) => {
      if (cat.filterKind) return a.kind === cat.filterKind;
      if (cat.filterCategory) return a.category === cat.filterCategory;
      return true;
    }).length;
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

      {/* SECTION 1: Kategorie sąsiedzkie (Nowoczesny pasek 1-rzędowy Vinted / Airbnb) */}
      <section className="mt-3">
        <div className="mb-2 flex items-center justify-between px-5">
          <div className="flex items-center gap-1.5">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-sand-200 text-ink">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <h2 className="font-display text-[15.5px] font-bold tracking-tight text-ink">
              Kategorie w Mińsku
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setAllCategoriesSheetOpen(true)}
            className="flex items-center gap-0.5 text-[12px] font-bold text-ink-500 hover:text-ink active:opacity-60"
          >
            Wszystkie ({CATEGORIES.length})
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto px-5 pb-1.5 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = cat.isAll
              ? selectedCatId === 'all' && quickFilter === 'all'
              : selectedCatId === cat.id;
            const count = getCategoryCount(cat);

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectCategory(cat)}
                className={cn(
                  'group flex shrink-0 items-center gap-2.5 rounded-2xl py-2 pl-2 pr-3.5 transition-all active:scale-95 border',
                  isSelected
                    ? 'bg-ink text-white border-ink shadow-card'
                    : 'bg-white text-ink-700 border-mist-300 shadow-card hover:bg-mist/40',
                )}
              >
                <span
                  className={cn(
                    'grid h-8.5 w-8.5 shrink-0 place-items-center rounded-xl transition-colors',
                    isSelected
                      ? 'bg-white/20 text-white'
                      : cn(cat.tone.bg, cat.tone.text),
                  )}
                >
                  <cat.icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[12px] font-bold leading-tight">{cat.label}</span>
                    {cat.badge && !isSelected && (
                      <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[8.5px] font-extrabold text-emerald-800">
                        {cat.badge}
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-[9.5px] font-medium leading-none block mt-0.5',
                      isSelected ? 'text-white/80' : 'text-ink-400',
                    )}
                  >
                    {count} {count === 1 ? 'oferta' : count < 5 ? 'oferty' : 'ofert'}
                  </span>
                </div>
              </button>
            );
          })}
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
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-[17px] font-bold tracking-tight text-ink truncate">
              {quickFilter === 'saved'
                ? 'Obserwowane'
                : activeCategoryObj && !activeCategoryObj.isAll
                  ? activeCategoryObj.label
                  : 'Wszystkie ogłoszenia'}
            </h2>
            <span className="rounded-full bg-mist-300 px-2 py-0.5 text-[10.5px] font-bold text-ink-700">
              {filteredAds.length}
            </span>
          </div>
          <p className="text-[11px] font-medium text-ink-400 mt-0.5">
            Mińsk Mazowiecki · bezpośrednio od sąsiadów
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setSortDropdownOpen((prev) => !prev)}
            className="flex h-8.5 items-center gap-1 rounded-full bg-white px-3 text-[11px] font-bold text-ink shadow-card active:scale-95 border border-mist-300"
          >
            <ArrowUpDown className="h-3 w-3 text-ink-500" />
            <span className="max-w-[70px] truncate">{SORT_LABELS[activeSort]}</span>
          </button>

          <div className="flex rounded-full bg-white p-0.5 shadow-card border border-mist-300">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Widok kafelków"
              className={cn(
                'grid h-7.5 w-7.5 place-items-center rounded-full transition-colors',
                viewMode === 'grid' ? 'bg-ink text-white' : 'text-ink-400 hover:text-ink',
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="Widok listy"
              className={cn(
                'grid h-7.5 w-7.5 place-items-center rounded-full transition-colors',
                viewMode === 'list' ? 'bg-ink text-white' : 'text-ink-400 hover:text-ink',
              )}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {sortDropdownOpen && (
          <div className="absolute right-5 top-11 z-30 w-48 rounded-2xl bg-white p-1.5 shadow-float border border-mist-300">
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
            className="mt-4 rounded-full bg-ink px-4 py-2 text-[12.5px] font-bold text-white shadow-card active:scale-95"
          >
            Przeglądaj wszystkie
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* 2-Column Mosaic Grid (Vinted / Airbnb neighborly style) */
        <div className="mt-3 grid grid-cols-2 gap-3 px-5">
          {filteredAds.map((a) => {
            const isItemLiked = !!likedAds[a.id];
            const photoCount = a.images?.length ?? 1;
            return (
              <article
                key={a.id}
                className="group relative flex flex-col justify-between rounded-3xl bg-white p-3 shadow-card transition-all hover:shadow-float active:scale-[0.99] border border-mist-200"
              >
                <div>
                  {/* Neighbor Identity Header (Avatar + Name + Street + Time) */}
                  <div className="mb-2 flex items-center justify-between gap-1.5 px-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <img
                        src={avatarUrl(a.author)}
                        alt={a.author}
                        className="h-6 w-6 shrink-0 rounded-full bg-sand-100 object-cover ring-1 ring-mist-300"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-[11.5px] font-bold text-ink leading-tight">{a.author}</p>
                        <p className="truncate text-[9.5px] font-medium text-ink-400 leading-none">ul. {a.street}</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-[9.5px] font-medium text-ink-400">{a.time}</span>
                  </div>

                  {/* Photo with rounded corners and badges */}
                  <div
                    onClick={() => handleOpenAd(a)}
                    className="relative cursor-pointer overflow-hidden rounded-2xl bg-mist"
                  >
                    <Img
                      src={a.image}
                      alt={a.title}
                      className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Obserwuj Heart Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLike?.(a.id);
                      }}
                      aria-label="Obserwuj"
                      aria-pressed={isItemLiked}
                      className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 backdrop-blur shadow-sm transition-transform active:scale-90"
                    >
                      <Heart
                        className={cn('h-3.5 w-3.5 transition-colors', isItemLiked && 'fill-coral text-coral')}
                        aria-hidden
                      />
                    </button>

                    {/* Status Badges */}
                    {a.status === 'reserved' ? (
                      <span className="absolute left-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-extrabold text-ink shadow">
                        Zarezerwowane
                      </span>
                    ) : a.status === 'sold' ? (
                      <span className="absolute left-2 top-2 rounded-full bg-ink px-2 py-0.5 text-[9px] font-extrabold text-white shadow">
                        Sprzedane
                      </span>
                    ) : a.kind === 'free' ? (
                      <span className="absolute left-2 top-2 rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-extrabold text-white shadow">
                        Oddam za darmo
                      </span>
                    ) : a.kind === 'lost' ? (
                      <span className="absolute left-2 top-2 rounded-full bg-coral px-2 py-0.5 text-[9px] font-extrabold text-ink shadow">
                        Zaginął
                      </span>
                    ) : null}

                    {/* Photo Count */}
                    {photoCount > 1 && (
                      <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-xs">
                        <Camera className="h-2.5 w-2.5" />
                        {photoCount}
                      </span>
                    )}
                  </div>

                  {/* Title & Price */}
                  <div onClick={() => handleOpenAd(a)} className="cursor-pointer pt-2.5 px-0.5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <p className="font-display text-[17px] font-bold leading-none text-ink">
                        {a.price ? zl(a.price) : a.kind === 'free' ? 'Za darmo' : 'Pomóż'}
                      </p>
                      {a.negotiable && (
                        <span className="text-[10px] font-semibold text-ink-400">do neg.</span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 min-h-[2.4em] text-[12.5px] font-semibold leading-snug text-ink-700">
                      {a.title}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Condition / Location + Discreet Chat Micro-Pill */}
                <div className="mt-2.5 flex items-center justify-between gap-1 border-t border-mist/80 pt-2 px-0.5">
                  <span className="truncate text-[10px] font-semibold text-ink-400">
                    {a.condition || `Mińsk`}
                  </span>
                  <button
                    type="button"
                    onClick={() => onChatClick?.(a)}
                    className="flex items-center gap-1 rounded-full bg-mist px-2.5 py-1 text-[11px] font-bold text-ink transition-colors hover:bg-mist-300 active:scale-95"
                    title={`Napisz do ${a.author}`}
                  >
                    <MessageCircle className="h-3 w-3 text-ink-700" />
                    <span>Napisz</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Horizontal List View (Vinted / Airbnb neighborly style) */
        <div className="mt-3 space-y-3 px-5">
          {filteredAds.map((a) => {
            const isItemLiked = !!likedAds[a.id];
            const photoCount = a.images?.length ?? 1;
            return (
              <article
                key={a.id}
                onClick={() => handleOpenAd(a)}
                className="flex cursor-pointer gap-3.5 rounded-3xl bg-white p-3 shadow-card transition-all hover:shadow-float active:scale-[0.99] border border-mist-200"
              >
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-mist">
                  <Img src={a.image} alt={a.title} className="h-full w-full object-cover" />
                  {photoCount > 1 && (
                    <span className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">
                      <Camera className="h-2.5 w-2.5" />
                      {photoCount}
                    </span>
                  )}
                  {a.kind === 'free' && (
                    <span className="absolute top-1.5 left-1.5 rounded-full bg-emerald-600 px-2 py-0.5 text-[8.5px] font-extrabold text-white shadow">
                      Oddam
                    </span>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    {/* Neighbor Header */}
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <img
                          src={avatarUrl(a.author)}
                          alt={a.author}
                          className="h-4.5 w-4.5 shrink-0 rounded-full bg-sand-100 object-cover"
                        />
                        <span className="truncate text-[11px] font-bold text-ink-700">{a.author}</span>
                        <span className="text-[10px] text-ink-400">· ul. {a.street}</span>
                      </div>
                      <span className="text-[9.5px] text-ink-400 shrink-0">{a.time}</span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <p className="font-display text-[17px] font-bold leading-none text-ink">
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
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-mist text-ink"
                      >
                        <Heart className={cn('h-3.5 w-3.5', isItemLiked && 'fill-coral text-coral')} />
                      </button>
                    </div>

                    <p className="mt-1 line-clamp-1 text-[12.5px] font-semibold text-ink-700">
                      {a.title}
                    </p>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2 border-t border-mist/80 pt-1.5">
                    <span className="text-[10px] font-medium text-ink-400">
                      {a.condition || `Mińsk Mazowiecki`}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChatClick?.(a);
                      }}
                      className="flex shrink-0 items-center gap-1 rounded-full bg-mist px-2.5 py-1 text-[11px] font-bold text-ink hover:bg-mist-300"
                    >
                      <MessageCircle className="h-3 w-3" />
                      <span>Napisz</span>
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
                const count = getCategoryCount(cat);

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
                          'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
                          cat.tone.bg,
                          cat.tone.text,
                        )}
                      >
                        <cat.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-ink">{cat.label}</p>
                        <p className="text-[11.5px] text-ink-400">
                          {count} {count === 1 ? 'oferta' : count < 5 ? 'oferty' : 'ofert'}
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
