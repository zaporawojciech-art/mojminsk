import { useMemo, useState } from 'react';
import {
  Armchair,
  ArrowDownAZ,
  ArrowUpDown,
  Award,
  Car,
  Check,
  ChevronRight,
  Clock,
  Hammer,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Trees,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { avatarUrl, type User } from '../data/mockData';
import {
  SERVICE_CATEGORIES,
  computeProviderRatingStats,
  filterAndSortServiceProviders,
  getServiceCategoryById,
  type ServiceCategoryId,
  type ServiceProvider,
  type ServiceSortOption,
} from '../data/servicesData';
import { StandardTopBar, cn } from '../components/ui';
import { AppLink } from '../components/AppLink';
import { buildServiceProviderUrl } from '../router/urlUtils';

export const SERVICE_CATEGORY_ICONS: Record<ServiceCategoryId, LucideIcon> = {
  all: Sparkles,
  instalacje: Zap,
  remonty: Hammer,
  stolarz: Armchair,
  ogrod: Trees,
  auto: Car,
};

const SORT_OPTIONS: {
  id: ServiceSortOption;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
}[] = [
  { id: 'rating', label: 'Najwyżej oceniani', shortLabel: 'Ocena', icon: Star },
  { id: 'reviews', label: 'Najwięcej opinii', shortLabel: 'Opinie', icon: MessageSquare },
  { id: 'experience', label: 'Największy staż', shortLabel: 'Staż', icon: Award },
  { id: 'alpha', label: 'Alfabetycznie A–Z', shortLabel: 'A–Z', icon: ArrowDownAZ },
];

/**
 * Renders either the provider's dedicated company logotype (if available)
 * or falls back to the resident's 3D/illustrated neighbor avatar.
 */
export function ProviderBrandMark({
  provider,
  size = 'md',
}: {
  provider: Pick<ServiceProvider, 'businessName' | 'name' | 'logoUrl' | 'avatarSeed'>;
  size?: 'sm' | 'md' | 'lg';
}) {
  const hasLogo = Boolean(provider.logoUrl);
  const px = size === 'sm' ? 40 : size === 'lg' ? 80 : 48;

  const dims =
    size === 'sm'
      ? 'h-10 w-10 rounded-xl'
      : size === 'lg'
        ? 'h-20 w-20 rounded-3xl'
        : 'h-12 w-12 rounded-2xl';

  if (hasLogo && provider.logoUrl) {
    return (
      <div
        className={cn(
          'relative shrink-0 overflow-hidden bg-white p-0.5 ring-1 ring-mist-200 shadow-2xs',
          dims,
        )}
        style={{ width: px, height: px, minWidth: px, minHeight: px, maxWidth: px, maxHeight: px }}
        title={`Logotyp firmy: ${provider.businessName}`}
      >
        <img
          src={provider.logoUrl}
          alt={`Logo ${provider.businessName}`}
          width={px}
          height={px}
          style={{ width: px, height: px, objectFit: 'cover' }}
          className="h-full w-full rounded-[inherit] object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden bg-sand-100 ring-1 ring-sand-300/80 shadow-2xs',
        dims,
      )}
      style={{ width: px, height: px, minWidth: px, minHeight: px, maxWidth: px, maxHeight: px }}
      title={`Profil wykonawcy: ${provider.name}`}
    >
      <img
        src={avatarUrl(provider.avatarSeed)}
        alt={provider.name}
        width={px}
        height={px}
        style={{ width: px, height: px, objectFit: 'cover' }}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

interface ServicesScreenProps {
  user: User | null;
  providers: ServiceProvider[];
  activeCategoryId?: ServiceCategoryId;
  onCategoryChange?: (categoryId: ServiceCategoryId) => void;
  onOpenProvider: (provider: ServiceProvider) => void;
  onAddProviderClick: () => void;
  onContactChat: (provider: ServiceProvider) => void;
  onApprovePendingProvider?: (providerId: string) => void;
  onProfile?: () => void;
}

export function ServicesScreen({
  user,
  providers,
  activeCategoryId = 'all',
  onCategoryChange,
  onOpenProvider,
  onAddProviderClick,
  onContactChat,
  onProfile,
}: ServicesScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategoryId>(activeCategoryId);
  const [sortBy, setSortBy] = useState<ServiceSortOption>('rating');

  // 1-CLICK SUBCATEGORY BADGE FILTERS (matching the badges on provider offers)
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAllSubcategories, setShowAllSubcategories] = useState(false);

  const currentCategory = onCategoryChange ? activeCategoryId : selectedCategory;

  const handleSelectCategory = (catId: ServiceCategoryId) => {
    setSelectedCategory(catId);
    setSelectedTags([]); // clear subcategory selection when switching main category
    setShowAllSubcategories(false);
    onCategoryChange?.(catId);
  };

  const toggleSubcategoryTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  // Verified providers scoped to the current main category
  const categoryScopedProviders = useMemo(() => {
    return providers.filter((p) => {
      const isOwnProfile =
        (user?.profileId && p.authorId === user.profileId) ||
        (user?.name && p.name.toLowerCase().includes(user.name.toLowerCase()));
      if (p.status !== 'verified' && !isOwnProfile) return false;
      if (currentCategory !== 'all' && p.categoryId !== currentCategory) return false;
      return true;
    });
  }, [providers, currentCategory, user?.profileId, user?.name]);

  // Count verified providers per category
  const categoryCounts = useMemo(() => {
    const counts: Record<ServiceCategoryId, number> = {
      all: 0,
      instalacje: 0,
      remonty: 0,
      stolarz: 0,
      ogrod: 0,
      auto: 0,
    };
    for (const p of providers) {
      if (p.status === 'verified') {
        counts.all += 1;
        counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
      }
    }
    return counts;
  }, [providers]);

  // Subcategory badges extracted directly from offers in the current category (with counts & category tone)
  const subcategoryBadges = useMemo(() => {
    const map = new Map<
      string,
      { count: number; categoryId: Exclude<ServiceCategoryId, 'all'> }
    >();

    for (const p of categoryScopedProviders) {
      for (const tag of p.tags) {
        const existing = map.get(tag);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(tag, { count: 1, categoryId: p.categoryId });
        }
      }
    }

    return Array.from(map.entries()).map(([tag, info]) => ({
      tag,
      count: info.count,
      categoryId: info.categoryId,
    }));
  }, [categoryScopedProviders]);

  const filteredProviders = useMemo(
    () =>
      filterAndSortServiceProviders(providers, {
        categoryId: currentCategory,
        searchQuery: '',
        sortBy,
        selectedTags,
        currentUserAuthorId: user?.profileId,
        currentUserName: user?.name,
      }),
    [providers, currentCategory, sortBy, selectedTags, user?.profileId, user?.name],
  );

  const activeCategoryMeta = getServiceCategoryById(currentCategory);
  const ActiveCategoryIcon = SERVICE_CATEGORY_ICONS[currentCategory] || Wrench;

  return (
    <div className="w-full pb-36 md:px-8 lg:px-12 md:py-6 md:pb-16">
      <StandardTopBar
        user={user}
        onProfile={onProfile}
        title="Usługi"
        subtitle="Sprawdzeni fachowcy i firmy z Mińska"
        action={
          <button
            type="button"
            onClick={onAddProviderClick}
            className="flex h-8 items-center gap-1 rounded-full bg-coral px-3 text-[11.5px] font-extrabold text-ink shadow-xs active:scale-95 transition-transform cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.6]" />
            <span>Dodaj profil</span>
          </button>
        }
      />

      {/* DESKTOP HEADER */}
      <div className="hidden md:flex items-center justify-between border-b border-mist-300/70 pb-4 mb-6">
        <div>
          <h1 className="font-display text-[23px] font-extrabold tracking-tight text-ink">
            Fachowcy i Usługi w Mińsku
          </h1>
          <p className="mt-0.5 text-[12.5px] font-medium text-ink-500">
            Zweryfikowani wykonawcy i lokalne firmy · opinie od sąsiadów
          </p>
        </div>

        <button
          type="button"
          onClick={onAddProviderClick}
          className="flex h-10 items-center gap-2 rounded-xl bg-coral px-4 text-[13px] font-extrabold text-ink shadow-xs hover:bg-coral-400 active:scale-[0.98] transition-all shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.6]" />
          <span>Dodaj swój profil</span>
        </button>
      </div>

      <div className="md:grid md:grid-cols-12 md:gap-6 lg:gap-8 items-start">
        {/* LEFT SIDEBAR (Desktop) — COLORFUL ICON CATEGORIES LIKE IN ADS */}
        <aside className="hidden md:block md:col-span-4 lg:col-span-3 md:sticky md:top-20">
          <div className="rounded-2xl bg-white p-4 shadow-card border border-mist-200">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-ink-400">
                Kategorie usług ({SERVICE_CATEGORIES.length - 1})
              </p>
              {currentCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => handleSelectCategory('all')}
                  className="text-[11px] font-bold text-coral-700 hover:underline cursor-pointer"
                >
                  Resetuj
                </button>
              )}
            </div>

            <div className="space-y-1">
              {SERVICE_CATEGORIES.map((cat) => {
                const Icon = SERVICE_CATEGORY_ICONS[cat.id] || Wrench;
                const active = currentCategory === cat.id;
                const count = categoryCounts[cat.id] ?? 0;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat.id)}
                    className={cn(
                      'flex w-full items-center justify-between gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all cursor-pointer',
                      active
                        ? 'bg-ink text-white font-bold shadow-xs'
                        : 'text-ink-700 hover:bg-mist/70 font-semibold',
                    )}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={cn(
                          'grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-colors',
                          active ? 'bg-white/20 text-white' : cn(cat.tone.bg, cat.tone.text),
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="truncate text-[12.5px]">{cat.label}</span>
                    </span>
                    <span
                      className={cn(
                        'rounded-md px-1.5 py-0.5 text-[10.5px] font-bold shrink-0',
                        active ? 'bg-coral text-ink' : 'bg-mist text-ink-500',
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT: 1-CLICK SUBCATEGORY BADGES, 1-CLICK SORT & LIST */}
        <div className="md:col-span-8 lg:col-span-9 mt-2 md:mt-0 space-y-3.5">
          {/* MOBILE HORIZONTAL CATEGORY BAR — COLORFUL ICON TILES LIKE IN ADS */}
          <div className="md:hidden">
            <div className="mb-2 flex items-center justify-between px-5">
              <div className="flex items-center gap-1.5">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-sand-200 text-ink">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <h2 className="font-display text-[15px] font-bold tracking-tight text-ink">
                  Kategorie usług
                </h2>
              </div>
              {currentCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => handleSelectCategory('all')}
                  className="text-[12px] font-bold text-coral-700"
                >
                  Pokaż wszystkie
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 pb-1.5">
              {SERVICE_CATEGORIES.map((cat) => {
                const Icon = SERVICE_CATEGORY_ICONS[cat.id] || Wrench;
                const active = currentCategory === cat.id;
                const count = categoryCounts[cat.id] ?? 0;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat.id)}
                    className={cn(
                      'group flex shrink-0 items-center gap-2.5 rounded-2xl py-2 pl-2 pr-3.5 transition-all active:scale-95 border cursor-pointer',
                      active
                        ? 'bg-ink text-white border-ink shadow-card'
                        : 'bg-white text-ink-700 border-mist-300 shadow-card hover:bg-mist/40',
                    )}
                  >
                    <span
                      className={cn(
                        'grid h-8 w-8 shrink-0 place-items-center rounded-xl transition-colors',
                        active ? 'bg-white/20 text-white' : cn(cat.tone.bg, cat.tone.text),
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="text-left min-w-0">
                      <span className="block truncate text-[12px] font-bold leading-tight">
                        {cat.shortLabel}
                      </span>
                      <span
                        className={cn(
                          'text-[9.5px] font-medium leading-none block mt-0.5',
                          active ? 'text-white/80' : 'text-ink-400',
                        )}
                      >
                        {count} {count === 1 ? 'wykonawca' : 'wykonawców'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 1-CLICK SUBCATEGORY BADGES + 1-CLICK SORT TOOLBAR */}
          <div className="mx-5 md:mx-0 rounded-2xl bg-white border border-mist-200 p-3.5 shadow-card space-y-3">
            {/* Row 1: Subcategory Badges (1-Click) */}
            {subcategoryBadges.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar md:flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedTags([])}
                  className={cn(
                    'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-xl px-3 text-[12px] font-bold transition-all cursor-pointer border',
                    selectedTags.length === 0
                      ? 'bg-ink text-white border-ink shadow-2xs'
                      : 'bg-mist/60 text-ink-600 border-mist-200 hover:bg-mist hover:text-ink',
                  )}
                >
                  <span>Wszystkie</span>
                  <span
                    className={cn(
                      'rounded-md px-1.5 py-0.2 text-[10px] font-extrabold',
                      selectedTags.length === 0
                        ? 'bg-white/20 text-white'
                        : 'bg-white text-ink-500',
                    )}
                  >
                    {categoryScopedProviders.length}
                  </span>
                </button>

                {(currentCategory === 'all' && !showAllSubcategories
                  ? subcategoryBadges.slice(0, 9)
                  : subcategoryBadges
                ).map(({ tag, count, categoryId }) => {
                  const isSelected = selectedTags.includes(tag);
                  const catTone = getServiceCategoryById(categoryId).tone;

                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleSubcategoryTag(tag)}
                      className={cn(
                        'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-xl px-3 text-[12px] font-semibold transition-all cursor-pointer border active:scale-95',
                        isSelected
                          ? cn(catTone.active, 'border-transparent font-bold shadow-2xs')
                          : 'bg-sand-50/80 text-ink-700 border-sand-200 hover:border-ink-300 hover:bg-sand-100',
                      )}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                      <span>{tag}</span>
                      <span
                        className={cn(
                          'text-[10.5px] font-bold',
                          isSelected ? 'text-white/80' : 'text-ink-400',
                        )}
                      >
                        ({count})
                      </span>
                    </button>
                  );
                })}

                {currentCategory === 'all' && subcategoryBadges.length > 9 && (
                  <button
                    type="button"
                    onClick={() => setShowAllSubcategories((v) => !v)}
                    className="inline-flex h-8 shrink-0 items-center gap-1 rounded-xl bg-mist/80 border border-mist-300 px-3 text-[11.5px] font-bold text-ink-700 hover:bg-mist-300/70 transition-colors cursor-pointer"
                  >
                    <span>
                      {showAllSubcategories
                        ? 'Pokaż mniej'
                        : `+ Więcej (${subcategoryBadges.length - 9})`}
                    </span>
                  </button>
                )}

                {selectedTags.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedTags([])}
                    className="inline-flex h-8 shrink-0 items-center gap-1 rounded-xl bg-coral/20 px-2.5 text-[11.5px] font-extrabold text-coral-800 hover:bg-coral/30 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Wyczyść ({selectedTags.length})</span>
                  </button>
                )}
              </div>
            )}

            {/* Row 2: 1-Click Sorting Pills */}
            <div className="pt-2.5 border-t border-mist-200/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="inline-flex items-center gap-1 mr-1 text-[10.5px] font-extrabold uppercase tracking-wider text-ink-400 shrink-0">
                  <ArrowUpDown className="h-3 w-3 text-ink-400" />
                  <span>Sortuj:</span>
                </span>

                {SORT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = sortBy === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSortBy(opt.id)}
                      className={cn(
                        'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-xl px-2.5 text-[11.5px] font-semibold transition-all cursor-pointer border active:scale-95',
                        active
                          ? 'bg-ink text-white border-ink font-bold shadow-2xs'
                          : 'bg-mist/60 text-ink-600 border-mist-200 hover:bg-mist hover:text-ink',
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-3 w-3 shrink-0',
                          active
                            ? opt.id === 'rating'
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-coral'
                            : 'text-ink-400',
                        )}
                      />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              <span className="hidden sm:inline-flex shrink-0 rounded-full bg-mist/70 border border-mist-200 px-2.5 py-0.5 text-[11px] font-bold text-ink-600">
                Wyników: {filteredProviders.length}
              </span>
            </div>
          </div>

          {/* ACTIVE CATEGORY HEADER BAR WITH COLORFUL ICON */}
          <div className="px-5 md:px-0 flex items-center justify-between gap-3 pt-0.5">
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={cn(
                  'grid h-10 w-10 shrink-0 place-items-center rounded-xl border',
                  activeCategoryMeta.tone.bg,
                  activeCategoryMeta.tone.text,
                  activeCategoryMeta.tone.border,
                )}
              >
                <ActiveCategoryIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-[17px] md:text-[19px] font-bold text-ink leading-tight">
                  {activeCategoryMeta.label}
                </h2>
                <p className="text-[12px] text-ink-500 truncate">{activeCategoryMeta.description}</p>
              </div>
            </div>
            <span className="sm:hidden shrink-0 rounded-full bg-white border border-mist-300 px-3 py-1 text-[11.5px] font-bold text-ink-600 shadow-2xs">
              Wyników: {filteredProviders.length}
            </span>
          </div>

          {/* PROVIDERS LIST */}
          {filteredProviders.length === 0 ? (
            <div className="mx-5 md:mx-0 rounded-3xl bg-white p-8 text-center shadow-card border border-mist-200">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-mist text-ink-500">
                <Wrench className="h-6 w-6" />
              </div>
              <h3 className="mt-3 font-display text-[19px] font-bold text-ink">
                Brak wykonawców w tej podkategorii
              </h3>
              <p className="mx-auto mt-1 max-w-md text-[13px] text-ink-500">
                Nie znaleźliśmy wykonawcy spełniającego podane kryteria. Wyczyść wybrane podkategorie lub dodaj profil sprawdzonego fachowca z Mińska.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                {(currentCategory !== 'all' || selectedTags.length > 0) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTags([]);
                      handleSelectCategory('all');
                    }}
                    className="rounded-full bg-mist px-4 py-2.5 text-[13px] font-bold text-ink hover:bg-mist-300 transition-colors cursor-pointer"
                  >
                    Pokaż wszystkie usługi
                  </button>
                )}
                <button
                  type="button"
                  onClick={onAddProviderClick}
                  className="rounded-full bg-coral px-4 py-2.5 text-[13px] font-extrabold text-ink hover:bg-coral-400 transition-colors cursor-pointer"
                >
                  + Dodaj swój profil
                </button>
              </div>
            </div>
          ) : (
            <div className="mx-5 md:mx-0 rounded-2xl bg-white border border-mist-200 divide-y divide-mist-200 overflow-hidden shadow-card">
              {filteredProviders.map((provider) => {
                const stats = computeProviderRatingStats(provider.reviews);
                const cat = getServiceCategoryById(provider.categoryId);
                const isPending = provider.status === 'pending_verification';
                const providerUrl = buildServiceProviderUrl(provider);

                return (
                  <article
                    key={provider.id}
                    className={cn(
                      'group p-3.5 md:px-4 md:py-3.5 transition-colors hover:bg-sand-50/50',
                      isPending && 'bg-amber-50/30',
                    )}
                  >
                    {isPending && (
                      <div className="mb-2.5 flex items-center justify-between gap-2 rounded-xl bg-amber-100/80 px-3 py-1.5 text-[11px] text-amber-950 border border-amber-300">
                        <span className="inline-flex items-center gap-1.5 font-semibold">
                          <Clock className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                          Twój profil oczekuje na weryfikację w Panelu Administratora
                        </span>
                        <AppLink
                          to="/admin"
                          className="shrink-0 rounded-lg bg-ink px-2.5 py-1 text-[10.5px] font-bold text-white hover:bg-ink-700 cursor-pointer"
                        >
                          Panel Admina
                        </AppLink>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      {/* LEFT: COMPACT LOGO OR AVATAR (48x48) */}
                      <AppLink
                        to={providerUrl}
                        onClick={() => onOpenProvider(provider)}
                        className="shrink-0 mt-0.5 cursor-pointer"
                      >
                        <ProviderBrandMark provider={provider} size="md" />
                      </AppLink>

                      {/* RIGHT: FULL CONTENT COLUMN */}
                      <div className="min-w-0 flex-1">
                        {/* TOP ROW: TITLE + BADGES ON LEFT, "ZOBACZ PROFIL" IN TOP-RIGHT CORNER */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <AppLink
                                to={providerUrl}
                                onClick={() => onOpenProvider(provider)}
                                className="font-display text-[15px] font-bold text-ink leading-snug hover:text-coral-700 transition-colors cursor-pointer"
                              >
                                {provider.businessName}
                              </AppLink>

                              {/* COLORFUL CATEGORY BADGE */}
                              <button
                                type="button"
                                onClick={() => handleSelectCategory(provider.categoryId)}
                                className={cn(
                                  'rounded-md px-2 py-0.5 text-[10.5px] font-bold border transition-opacity hover:opacity-85 cursor-pointer',
                                  cat.tone.bg,
                                  cat.tone.text,
                                  cat.tone.border,
                                )}
                              >
                                {cat.shortLabel}
                              </button>

                              {/* WARM AMBER RATING PILL */}
                              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 text-[11px] font-bold text-amber-950">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                                <span>{stats.count > 0 ? stats.average.toFixed(1) : 'Nowy'}</span>
                                {stats.count > 0 && (
                                  <span className="text-[10px] font-semibold text-amber-700">
                                    ({stats.count})
                                  </span>
                                )}
                              </span>

                              {/* EMERALD VERIFIED PILL */}
                              {!isPending && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                                  <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />
                                  <span>Zweryfikowany</span>
                                </span>
                              )}
                            </div>

                            <p className="mt-0.5 text-[11.5px] text-ink-500 flex flex-wrap items-center gap-x-1.5">
                              <span className="font-semibold text-ink-700">{provider.name}</span>
                              <span>·</span>
                              <span className="inline-flex items-center gap-0.5 text-ink-600">
                                <MapPin className="h-3 w-3 text-coral-600 shrink-0" />
                                ul. {provider.street}
                              </span>
                              <span>·</span>
                              <span>{provider.yearsExperience} l. doświadczenia</span>
                            </p>
                          </div>

                          {/* TOP-RIGHT CORNER: ZOBACZ PROFIL */}
                          <AppLink
                            to={providerUrl}
                            onClick={() => onOpenProvider(provider)}
                            className="shrink-0 inline-flex h-7 items-center gap-0.5 rounded-lg px-2 text-[11.5px] font-bold text-ink-600 hover:bg-mist hover:text-ink transition-colors cursor-pointer"
                          >
                            <span>Zobacz profil</span>
                            <ChevronRight className="h-3.5 w-3.5 text-ink-400" />
                          </AppLink>
                        </div>

                        {/* MIDDLE: MORE ROOM FOR DESCRIPTION TEXT */}
                        <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-600 line-clamp-2">
                          {provider.description}
                        </p>

                        {/* BOTTOM ROW: SUBCATEGORY BADGES ON LEFT + CZAT & ZADZWOŃ IN BOTTOM-RIGHT CORNER */}
                        <div className="mt-2.5 flex flex-wrap items-end justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                            {provider.tags.map((tag) => {
                              const isTagSelected = selectedTags.includes(tag);
                              return (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => toggleSubcategoryTag(tag)}
                                  title={`Filtruj po podkategorii: ${tag}`}
                                  className={cn(
                                    'rounded-md px-2 py-0.5 text-[10.5px] font-semibold transition-all cursor-pointer',
                                    isTagSelected
                                      ? cn(cat.tone.active, 'font-bold shadow-2xs')
                                      : 'bg-mist/80 text-ink-600 hover:bg-mist-300/70 hover:text-ink',
                                  )}
                                >
                                  {tag}
                                </button>
                              );
                            })}
                          </div>

                          {/* BOTTOM-RIGHT CORNER: CZAT & ZADZWOŃ */}
                          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                            <button
                              type="button"
                              onClick={() => onContactChat(provider)}
                              title="Napisz na czacie w mójMińsk"
                              className="flex h-8 items-center justify-center gap-1.5 rounded-xl border border-mist-300 bg-white px-2.5 text-[11.5px] font-bold text-ink hover:bg-mist/70 active:scale-[0.98] transition-all cursor-pointer"
                            >
                              <MessageCircle className="h-3.5 w-3.5 text-ink-600" />
                              <span>Czat</span>
                            </button>

                            <a
                              href={`tel:${provider.phone.replace(/\s+/g, '')}`}
                              title={`Zadzwoń: ${provider.phone}`}
                              className="flex h-8 items-center justify-center gap-1.5 rounded-xl bg-coral px-3 text-[11.5px] font-extrabold text-ink hover:bg-coral-400 active:scale-[0.98] transition-all cursor-pointer shadow-2xs"
                            >
                              <Phone className="h-3.5 w-3.5" />
                              <span>Zadzwoń</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
