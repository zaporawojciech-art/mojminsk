import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageSquareWarning,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Star,
  Tag,
  Trash2,
  UserCheck,
  Wrench,
  X,
} from 'lucide-react';
import type { Ad, Post, User } from '../data/mockData';
import { formatAdExactDate } from '../data/mockData';
import { signInAdmin, signOut } from '../lib/auth';
import {
  SERVICE_CATEGORIES,
  computeProviderRatingStats,
  getServiceCategoryById,
  type ServiceCategoryId,
  type ServiceProvider,
} from '../data/servicesData';
import { ProviderBrandMark, SERVICE_CATEGORY_ICONS } from './ServicesScreen';
import { cn } from '../components/ui';
import type { AdReportItem } from '../lib/supabase';

export type AdminTabId = 'pending_services' | 'active_services' | 'moderation';

interface AdminScreenProps {
  currentUser?: User | null;
  providers: ServiceProvider[];
  ads: Ad[];
  posts: Post[];
  adReports?: AdReportItem[];
  onApproveProvider: (providerId: string) => void;
  onRejectOrDeleteProvider: (providerId: string) => void;
  onRevokeProviderVerification: (providerId: string) => void;
  onOpenProviderProfile: (provider: ServiceProvider) => void;
  onOpenAddProviderModal: () => void;
  onDeleteAd?: (adId: string) => void;
  onUpdateAdStatus?: (adId: string, status: 'active' | 'reserved' | 'sold') => void;
  onDismissAdReport?: (reportId: string) => void;
  onDismissReportedReview?: (providerId: string, reviewId: string) => void;
  onDeleteReview?: (providerId: string, reviewId: string) => void;
  onAdminLoginSuccess?: (user: User) => void;
  onAdminLogout?: () => void;
  onExitAdmin: () => void;
}

export function AdminScreen({
  currentUser,
  providers,
  ads,
  posts,
  adReports = [],
  onApproveProvider,
  onRejectOrDeleteProvider,
  onRevokeProviderVerification,
  onOpenProviderProfile,
  onOpenAddProviderModal,
  onDeleteAd,
  onUpdateAdStatus,
  onDismissAdReport,
  onDismissReportedReview,
  onDeleteReview,
  onAdminLoginSuccess,
  onAdminLogout,
  onExitAdmin,
}: AdminScreenProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => Boolean(currentUser?.isAdmin));

  useEffect(() => {
    if (currentUser?.isAdmin) {
      setIsAuthenticated(true);
    }
  }, [currentUser?.isAdmin]);

  // Login form state (zero hardcoded credentials)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<AdminTabId>('pending_services');
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState<ServiceCategoryId>('all');
  const [providerSearchQuery, setProviderSearchQuery] = useState('');
  const [providerToDelete, setProviderToDelete] = useState<ServiceProvider | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<{
    provider: ServiceProvider;
    review: ServiceProvider['reviews'][number];
  } | null>(null);

  const pendingProviders = useMemo(
    () => providers.filter((p) => p.status === 'pending_verification'),
    [providers],
  );

  const verifiedProviders = useMemo(
    () => providers.filter((p) => p.status === 'verified'),
    [providers],
  );

  const filteredVerifiedProviders = useMemo(() => {
    let list = verifiedProviders;
    if (catalogCategoryFilter !== 'all') {
      list = list.filter((p) => p.categoryId === catalogCategoryFilter);
    }
    const q = providerSearchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.businessName.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.street.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [verifiedProviders, catalogCategoryFilter, providerSearchQuery]);

  const reportedReviews = useMemo(() => {
    const list: { provider: ServiceProvider; review: ServiceProvider['reviews'][number] }[] = [];
    for (const p of providers) {
      for (const r of p.reviews) {
        if (r.reported) {
          list.push({ provider: p, review: r });
        }
      }
    }
    return list;
  }, [providers]);

  // Ads Moderation State
  const [moderationSubTab, setModerationSubTab] = useState<'ads' | 'reviews'>('ads');
  const [adSearchQuery, setAdSearchQuery] = useState('');
  const [adStatusFilter, setAdStatusFilter] = useState<'all' | 'reported' | 'active' | 'reserved' | 'free'>('all');
  const [adCategoryFilter, setAdCategoryFilter] = useState<string>('all');
  const [adToDelete, setAdToDelete] = useState<Ad | null>(null);
  const [adToPreview, setAdToPreview] = useState<Ad | null>(null);
  const [deleteSuccessToast, setDeleteSuccessToast] = useState<string | null>(null);

  const reportsByAdId = useMemo(() => {
    const map = new Map<string, AdReportItem[]>();
    for (const r of adReports) {
      const existing = map.get(r.adId) || [];
      existing.push(r);
      map.set(r.adId, existing);
    }
    return map;
  }, [adReports]);

  const reportedAdsCount = useMemo(() => {
    const reportedIds = new Set(adReports.map((r) => r.adId));
    return ads.filter((a) => reportedIds.has(a.id)).length;
  }, [ads, adReports]);

  const activeAdsCount = useMemo(() => {
    return ads.filter((a) => a.status === 'active' || (!a.status && a.kind !== 'lost')).length;
  }, [ads]);

  const reservedAdsCount = useMemo(() => {
    return ads.filter((a) => a.status === 'reserved' || a.status === 'sold').length;
  }, [ads]);

  const freeAdsCount = useMemo(() => {
    return ads.filter((a) => a.kind === 'free').length;
  }, [ads]);

  const distinctAdCategories = useMemo(() => {
    const set = new Set<string>();
    for (const a of ads) {
      if (a.category) set.add(a.category);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pl'));
  }, [ads]);

  const filteredAds = useMemo(() => {
    let list = ads;

    if (adStatusFilter === 'reported') {
      const reportedIds = new Set(adReports.map((r) => r.adId));
      list = list.filter((a) => reportedIds.has(a.id));
    } else if (adStatusFilter === 'active') {
      list = list.filter((a) => a.status === 'active' || (!a.status && a.kind !== 'lost'));
    } else if (adStatusFilter === 'reserved') {
      list = list.filter((a) => a.status === 'reserved' || a.status === 'sold');
    } else if (adStatusFilter === 'free') {
      list = list.filter((a) => a.kind === 'free');
    }

    if (adCategoryFilter !== 'all') {
      list = list.filter((a) => a.category === adCategoryFilter);
    }

    const q = adSearchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.author.toLowerCase().includes(q) ||
          a.street.toLowerCase().includes(q) ||
          (a.description && a.description.toLowerCase().includes(q)),
      );
    }

    return list;
  }, [ads, adStatusFilter, adCategoryFilter, adSearchQuery, adReports]);

  const handleConfirmDeleteAd = () => {
    if (!adToDelete) return;
    const targetTitle = adToDelete.title;
    onDeleteAd?.(adToDelete.id);
    setDeleteSuccessToast(`Ogłoszenie „${targetTitle}” zostało pomyślnie usunięte z bazy danych Supabase.`);
    setAdToDelete(null);
    if (adToPreview?.id === adToDelete.id) {
      setAdToPreview(null);
    }
    setTimeout(() => {
      setDeleteSuccessToast((prev) => (prev?.includes(targetTitle) ? null : prev));
    }, 4500);
  };

  const handleConfirmDeleteProvider = () => {
    if (!providerToDelete) return;
    const targetName = providerToDelete.businessName;
    const isPending = providerToDelete.status === 'pending_verification';
    onRejectOrDeleteProvider(providerToDelete.id);
    setProviderToDelete(null);
    setDeleteSuccessToast(
      isPending
        ? `Wniosek „${targetName}” został odrzucony i usunięty z bazy danych.`
        : `Fachowiec „${targetName}” został trwale usunięty z katalogu usług.`
    );
    setTimeout(() => {
      setDeleteSuccessToast((prev) => (prev?.includes(targetName) ? null : prev));
    }, 4500);
  };

  const handleConfirmDeleteReview = () => {
    if (!reviewToDelete) return;
    const { provider, review } = reviewToDelete;
    onDeleteReview?.(provider.id, review.id);
    setReviewToDelete(null);
    setDeleteSuccessToast('Opinia została trwale usunięta z bazy danych Supabase.');
    setTimeout(() => {
      setDeleteSuccessToast((prev) => (prev?.includes('Opinia') ? null : prev));
    }, 4500);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;
    const cleanEmail = loginEmail.trim().toLowerCase();
    const cleanPass = loginPassword.trim();

    if (!cleanEmail || !cleanPass) {
      setLoginError('Wprowadź adres e-mail oraz hasło administratora.');
      return;
    }

    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await signInAdmin(cleanEmail, cleanPass);
      if (res.error || !res.user) {
        setLoginError(res.error || 'Nieprawidłowe dane logowania administratora.');
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
        setLoginPassword('');
        onAdminLoginSuccess?.(res.user);
      }
    } catch {
      setLoginError('Wystąpił błąd połączenia z serwerem autoryzacji.');
      setIsAuthenticated(false);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setIsAuthenticated(false);
    setLoginPassword('');
    onAdminLogout?.();
  };

  // ============================================================================
  // VIEW 1: DEDICATED ADMIN LOGIN SCREEN
  // ============================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-cream flex flex-col justify-between p-5 md:p-10">
        {/* Top bar */}
        <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onExitAdmin}
            className="inline-flex items-center gap-2 rounded-xl bg-white border border-mist-300 px-3.5 py-2 text-[12.5px] font-bold text-ink hover:bg-mist/60 transition-colors cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Wróć do mójMińsk.app</span>
          </button>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white">
            <Shield className="h-3.5 w-3.5 text-coral" />
            <span>Strefa Administracyjna</span>
          </div>
        </div>

        {/* Center login box */}
        <div className="my-auto py-8 w-full max-w-md mx-auto">
          <div className="rounded-3xl bg-white border border-mist-200 p-6 md:p-8 shadow-elevated">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ink text-white shadow-sm">
                <Lock className="h-5 w-5 text-coral" />
              </div>
              <div>
                <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-coral-700">
                  Autoryzacja Systemowa
                </span>
                <h1 className="font-display text-[22px] font-extrabold tracking-tight text-ink leading-tight">
                  Panel Administratora
                </h1>
              </div>
            </div>

            <p className="mt-3 text-[13px] leading-relaxed text-ink-500">
              Zaloguj się na konto administratora systemu <strong className="text-ink">mójMińsk.app</strong>, aby weryfikować i akceptować nowych usługodawców oraz moderować ogłoszenia i opinie.
            </p>

            <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-[11.5px] font-bold uppercase tracking-wider text-ink-500 mb-1.5"
                >
                  Adres e-mail administratora
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                  <input
                    id="admin-email"
                    type="email"
                    autoComplete="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Wprowadź e-mail konta admina"
                    required
                    disabled={isLoggingIn}
                    className="h-11 w-full rounded-xl border border-mist-300 bg-sand-50/40 pl-10 pr-3.5 text-[13.5px] font-semibold text-ink placeholder:text-ink-400 focus:border-ink focus:bg-white focus:outline-hidden disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-[11.5px] font-bold uppercase tracking-wider text-ink-500 mb-1.5"
                >
                  Hasło administratora
                </label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Wprowadź hasło"
                    required
                    disabled={isLoggingIn}
                    className="h-11 w-full rounded-xl border border-mist-300 bg-sand-50/40 pl-10 pr-10 text-[13.5px] font-semibold text-ink placeholder:text-ink-400 focus:border-ink focus:bg-white focus:outline-hidden disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-[12px] font-semibold text-rose-900 animate-in fade-in duration-150">
                  <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className={cn(
                  'flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-[13.5px] font-extrabold text-white shadow-sm hover:bg-ink-800 active:scale-[0.99] transition-all cursor-pointer',
                  isLoggingIn && 'opacity-70 cursor-not-allowed',
                )}
              >
                {isLoggingIn ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Weryfikacja danych i uprawnień...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 text-coral" />
                    <span>Zaloguj do Panelu Admina</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-mist-200 flex items-center justify-center gap-2 text-[11.5px] text-ink-500 font-medium text-center">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Autoryzacja Supabase Auth (RBAC) · Dostęp wyłącznie dla administratorów</span>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11.5px] text-ink-400">
          mójMińsk.app · Szyfrowane połączenie administracyjne · Zgodność RODO AES-256
        </p>
      </div>
    );
  }

  // ============================================================================
  // VIEW 2: AUTHENTICATED ADMIN DASHBOARD
  // ============================================================================
  return (
    <div className="min-h-screen w-full bg-cream pb-24">
      {/* ADMIN TOP NAVBAR */}
      <header className="sticky top-0 z-30 border-b border-mist-200 bg-ink text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-coral">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display text-[17px] font-black tracking-tight text-white">
                  mój<span className="text-coral">Mińsk</span>
                </span>
                <span className="rounded-md bg-coral px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-ink">
                  Panel Admina
                </span>
              </div>
              <p className="text-[11px] text-white/65 truncate hidden sm:block">
                Centrum weryfikacji usługodawców oraz moderacji treści
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onExitAdmin}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white/10 px-3 text-[12px] font-bold text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Widok aplikacji</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              title="Wyloguj z Panelu Administratora"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-500/20 border border-rose-400/30 px-3 text-[12px] font-bold text-rose-200 hover:bg-rose-500/30 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Wyloguj</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* KPI SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <button
            type="button"
            onClick={() => setActiveTab('pending_services')}
            className={cn(
              'text-left rounded-2xl p-4 border transition-all cursor-pointer shadow-card',
              activeTab === 'pending_services'
                ? 'bg-white border-coral ring-2 ring-coral/30'
                : 'bg-white border-mist-200 hover:border-mist-300',
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-500">
                Do akceptacji (Usługi)
              </span>
              <span
                className={cn(
                  'grid h-8 w-8 place-items-center rounded-xl',
                  pendingProviders.length > 0
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-700',
                )}
              >
                <Clock className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-2xl font-black text-ink">
                {pendingProviders.length}
              </span>
              <span className="text-[11.5px] font-semibold text-amber-800">
                {pendingProviders.length === 1 ? 'nowy wniosek' : 'oczekujące wnioski'}
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('active_services')}
            className={cn(
              'text-left rounded-2xl p-4 border transition-all cursor-pointer shadow-card',
              activeTab === 'active_services'
                ? 'bg-white border-ink ring-2 ring-ink/15'
                : 'bg-white border-mist-200 hover:border-mist-300',
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-500">
                Zweryfikowani Fachowcy
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
                <ShieldCheck className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-2xl font-black text-ink">
                {verifiedProviders.length}
              </span>
              <span className="text-[11.5px] font-medium text-ink-500">w 5 kategoriach</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('moderation')}
            className={cn(
              'text-left rounded-2xl p-4 border transition-all cursor-pointer shadow-card',
              activeTab === 'moderation'
                ? 'bg-white border-ink ring-2 ring-ink/15'
                : 'bg-white border-mist-200 hover:border-mist-300',
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-500">
                Ogłoszenia & Moderacja
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-sky-100 text-sky-800">
                <FileText className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-2xl font-black text-ink">{ads.length}</span>
              <span className="text-[11.5px] font-medium text-ink-500">
                ogłoszeń · {posts.length} wpisów
              </span>
            </div>
          </button>
        </div>

        {/* 1-CLICK ADMIN NAVIGATION TABS */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-mist-200 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('pending_services')}
              className={cn(
                'inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-[13px] font-bold transition-all cursor-pointer',
                activeTab === 'pending_services'
                  ? 'bg-ink text-white shadow-xs'
                  : 'bg-white text-ink-600 border border-mist-200 hover:bg-mist/60',
              )}
            >
              <Clock className="h-4 w-4 text-coral" />
              <span>Wnioski usługodawców</span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[11px] font-extrabold',
                  pendingProviders.length > 0
                    ? 'bg-coral text-ink'
                    : 'bg-white/20 text-white',
                )}
              >
                {pendingProviders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('active_services')}
              className={cn(
                'inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-[13px] font-bold transition-all cursor-pointer',
                activeTab === 'active_services'
                  ? 'bg-ink text-white shadow-xs'
                  : 'bg-white text-ink-600 border border-mist-200 hover:bg-mist/60',
              )}
            >
              <Wrench className="h-4 w-4" />
              <span>Zweryfikowani usługodawcy ({verifiedProviders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('moderation')}
              className={cn(
                'inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-[13px] font-bold transition-all cursor-pointer',
                activeTab === 'moderation'
                  ? 'bg-ink text-white shadow-xs'
                  : 'bg-white text-ink-600 border border-mist-200 hover:bg-mist/60',
              )}
            >
              <MessageSquareWarning className="h-4 w-4" />
              <span>Moderacja treści</span>
              {reportedReviews.length > 0 && (
                <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10.5px] font-extrabold text-white">
                  {reportedReviews.length}
                </span>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenAddProviderModal}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-coral px-4 text-[12.5px] font-extrabold text-ink hover:bg-coral-400 transition-all cursor-pointer shadow-2xs"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Dodaj usługodawcę</span>
          </button>
        </div>

        {/* =====================================================================
            TAB 1: WNIOSKI USŁUGODAWCÓW (PENDING APPROVAL)
        ===================================================================== */}
        {activeTab === 'pending_services' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-[20px] font-extrabold text-ink">
                  Oczekujące wnioski usługodawców ({pendingProviders.length})
                </h2>
                <p className="text-[13px] text-ink-500">
                  Zweryfikuj dane fachowca lub lokalnej firmy i zatwierdź jednym kliknięciem publikację profilu w katalogu usług.
                </p>
              </div>
            </div>

            {pendingProviders.length === 0 ? (
              <div className="rounded-3xl bg-white border border-mist-200 p-10 text-center shadow-card">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="mt-3 font-display text-[19px] font-bold text-ink">
                  Wszystkie wnioski zostały rozpatrzone!
                </h3>
                <p className="mx-auto mt-1 max-w-md text-[13px] text-ink-500">
                  Obecnie nie ma żadnych nowych profili usługodawców oczekujących na akceptację administratora.
                </p>
                <div className="mt-4 flex justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('active_services')}
                    className="rounded-xl bg-ink px-4 py-2.5 text-[12.5px] font-bold text-white hover:bg-ink-800 cursor-pointer"
                  >
                    Przejdź do aktywnych usługodawców ({verifiedProviders.length})
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                {pendingProviders.map((provider) => {
                  const cat = getServiceCategoryById(provider.categoryId);
                  const CatIcon = SERVICE_CATEGORY_ICONS[provider.categoryId] || Wrench;
                  const hasCompanyLogo = Boolean(provider.logoUrl);

                  return (
                    <article
                      key={provider.id}
                      className="rounded-2xl bg-white border-2 border-amber-300/90 p-5 shadow-card"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3.5 border-b border-mist-200">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 border border-amber-300 px-2.5 py-1 text-[11px] font-extrabold text-amber-950">
                            <Clock className="h-3.5 w-3.5 text-amber-700" />
                            <span>OCZEKUJE NA AKCEPTACJĘ ADMINA</span>
                          </span>

                          <span className="inline-flex items-center gap-1 rounded-lg bg-mist px-2.5 py-1 text-[11px] font-bold text-ink-600">
                            {hasCompanyLogo ? (
                              <>
                                <Building2 className="h-3.5 w-3.5 text-indigo-600" />
                                <span>Firma z logotypem</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Wykonawca indywidualny (Awatar)</span>
                              </>
                            )}
                          </span>
                        </div>

                        <span className="text-[11.5px] font-medium text-ink-400">
                          ID zgłoszenia: <span className="font-mono font-bold text-ink-600">{provider.id}</span>
                        </span>
                      </div>

                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                        {/* Left: Provider details */}
                        <div className="flex items-start gap-4 min-w-0 flex-1">
                          <ProviderBrandMark provider={provider} size="md" />

                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-display text-[17px] font-extrabold text-ink">
                                {provider.businessName}
                              </h3>
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold border',
                                  cat.tone.bg,
                                  cat.tone.text,
                                  cat.tone.border,
                                )}
                              >
                                <CatIcon className="h-3 w-3" />
                                <span>{cat.label}</span>
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-ink-600">
                              <span>
                                Imię i nazwisko: <strong className="text-ink">{provider.name}</strong>
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-coral-600" />
                                <strong>ul. {provider.street}</strong> ({provider.city})
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Phone className="h-3.5 w-3.5 text-emerald-600" />
                                <a
                                  href={`tel:${provider.phone.replace(/\s+/g, '')}`}
                                  className="font-mono font-bold text-ink underline hover:text-coral-700"
                                >
                                  {provider.phone}
                                </a>
                              </span>
                              <span>
                                Staż: <strong>{provider.yearsExperience} lat doświadczenia</strong>
                              </span>
                            </div>

                            <p className="text-[13px] leading-relaxed text-ink-700 bg-sand-50/70 rounded-xl p-3 border border-sand-200/80">
                              {provider.description}
                            </p>

                            {/* Subcategory badges */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              <span className="text-[11px] font-bold text-ink-400 mr-1">
                                Podkategorie:
                              </span>
                              {provider.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-md bg-mist px-2.5 py-0.5 text-[11px] font-bold text-ink-700"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>

                            {/* Portfolio preview if present */}
                            {provider.portfolio.length > 0 && (
                              <div className="pt-2 flex items-center gap-2.5">
                                {provider.portfolio.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center gap-2 rounded-xl bg-mist/60 p-1.5 pr-3 border border-mist-200"
                                  >
                                    <img
                                      src={item.imageUrl}
                                      alt={item.caption}
                                      className="h-10 w-14 rounded-lg object-cover"
                                    />
                                    <div className="text-[11px]">
                                      <p className="font-bold text-ink line-clamp-1">{item.caption}</p>
                                      {item.locationLabel && (
                                        <p className="text-ink-400">{item.locationLabel}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Admin Decision Buttons */}
                        <div className="flex sm:flex-row lg:flex-col items-stretch gap-2 shrink-0 lg:w-56 pt-3 lg:pt-0 border-t lg:border-t-0 border-mist-200">
                          <button
                            type="button"
                            onClick={() => {
                              onApproveProvider(provider.id);
                              setDeleteSuccessToast(`Wniosek „${provider.businessName}” został zatwierdzony i opublikowany w katalogu.`);
                            }}
                            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-[13px] font-extrabold text-white shadow-sm hover:bg-emerald-700 active:scale-[0.98] transition-all cursor-pointer"
                          >
                            <Check className="h-4 w-4 stroke-[2.8]" />
                            <span>Akceptuj i opublikuj</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenProviderProfile(provider)}
                            className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-mist-300 bg-white px-3 text-[12px] font-bold text-ink hover:bg-mist/70 transition-colors cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-ink-500" />
                            <span>Podgląd wizytówki</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setProviderToDelete(provider)}
                            className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/70 px-3 text-[12px] font-bold text-rose-800 hover:bg-rose-100 transition-colors cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Odrzuć zgłoszenie</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            TAB 2: ZWERYFIKOWANI USŁUGODAWCY W KATALOGU
        ===================================================================== */}
        {activeTab === 'active_services' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-[20px] font-extrabold text-ink">
                  Zweryfikowani usługodawcy w katalogu ({filteredVerifiedProviders.length})
                </h2>
                <p className="text-[13px] text-ink-500">
                  Zarządzaj opublikowanymi profilami fachowców i firm widocznymi dla mieszkańców w zakładce Usługi.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                {/* Wyszukiwarka tekstowa */}
                <div className="relative min-w-[200px] sm:min-w-[220px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-400" />
                  <input
                    type="text"
                    value={providerSearchQuery}
                    onChange={(e) => setProviderSearchQuery(e.target.value)}
                    placeholder="Szukaj fachowca, ulicy..."
                    className="h-9 w-full rounded-xl bg-white border border-mist-300 pl-8 pr-7 text-[12px] font-medium text-ink placeholder:text-ink-400 focus:outline-hidden focus:border-ink shadow-2xs"
                  />
                  {providerSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setProviderSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink cursor-pointer p-0.5"
                      title="Wyczyść szukanie"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* 1-Click category filter */}
                <div className="flex flex-wrap items-center gap-1">
                  {SERVICE_CATEGORIES.map((cat) => {
                    const active = catalogCategoryFilter === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCatalogCategoryFilter(cat.id)}
                        className={cn(
                          'rounded-xl px-2.5 py-1.5 text-[11px] font-bold transition-all cursor-pointer border',
                          active
                            ? 'bg-ink text-white border-ink'
                            : 'bg-white text-ink-600 border-mist-200 hover:bg-mist/60',
                        )}
                      >
                        {cat.shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {filteredVerifiedProviders.length === 0 ? (
              <div className="rounded-3xl bg-white border border-mist-200 p-10 text-center shadow-card">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-mist text-ink-500">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="mt-3 font-display text-[17px] font-bold text-ink">
                  Brak fachowców spełniających kryteria
                </h3>
                <p className="mx-auto mt-1 max-w-sm text-[12.5px] text-ink-500">
                  {providerSearchQuery
                    ? `Nie znaleziono wyników dla zapytania „${providerSearchQuery}”.`
                    : 'Brak zweryfikowanych usługodawców w wybranej kategorii.'}
                </p>
                {(providerSearchQuery || catalogCategoryFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setProviderSearchQuery('');
                      setCatalogCategoryFilter('all');
                    }}
                    className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-ink px-3.5 py-1.5 text-[12px] font-bold text-white hover:bg-ink-800 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Zresetuj filtry</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-white border border-mist-200 divide-y divide-mist-200 overflow-hidden shadow-card">
                {filteredVerifiedProviders.map((provider) => {
                  const cat = getServiceCategoryById(provider.categoryId);
                  const stats = computeProviderRatingStats(provider.reviews);

                  return (
                    <div
                      key={provider.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-sand-50/40 transition-colors"
                    >
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <ProviderBrandMark provider={provider} size="md" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-display text-[15px] font-bold text-ink">
                              {provider.businessName}
                            </span>
                            <span
                              className={cn(
                                'rounded-md px-2 py-0.5 text-[10.5px] font-bold border',
                                cat.tone.bg,
                                cat.tone.text,
                                cat.tone.border,
                              )}
                            >
                              {cat.shortLabel}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[11px] font-bold text-amber-950">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                              <span>{stats.count > 0 ? stats.average.toFixed(1) : 'Nowy'}</span>
                              <span className="text-[10px] text-amber-700">({stats.count})</span>
                            </span>
                          </div>

                          <p className="mt-0.5 text-[12px] text-ink-500">
                            <strong className="text-ink-700">{provider.name}</strong> · ul. {provider.street} · tel. {provider.phone} · {provider.yearsExperience} l. stażu
                          </p>

                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {provider.tags.map((t) => (
                              <span
                                key={t}
                                className="rounded-md bg-mist/80 px-2 py-0.5 text-[10px] font-semibold text-ink-600"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => onOpenProviderProfile(provider)}
                          className="inline-flex h-8 items-center gap-1 rounded-xl border border-mist-300 bg-white px-2.5 text-[11.5px] font-bold text-ink hover:bg-mist/70 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 text-ink-500" />
                          <span>Profil</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onRevokeProviderVerification(provider.id);
                            setDeleteSuccessToast(`Cofnięto weryfikację fachowca „${provider.businessName}”. Profil przeniesiono do wniosków.`);
                          }}
                          title="Cofnij status weryfikacji (przenieś do oczekujących)"
                          className="inline-flex h-8 items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 px-2.5 text-[11.5px] font-bold text-amber-900 hover:bg-amber-100 cursor-pointer"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Cofnij weryfikację</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setProviderToDelete(provider)}
                          title="Usuń wykonawcę z katalogu"
                          className="inline-flex h-8 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-2.5 text-rose-700 hover:bg-rose-100 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            TAB 3: MODERACJA OGŁOSZEŃ I ZGŁOSZONYCH OPINII
        ===================================================================== */}
        {activeTab === 'moderation' && (
          <div className="space-y-6">
            {/* Sub-tab switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-mist-200 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModerationSubTab('ads')}
                  className={cn(
                    'inline-flex h-9 items-center gap-2 rounded-xl px-4 text-[13px] font-bold transition-all cursor-pointer',
                    moderationSubTab === 'ads'
                      ? 'bg-ink text-white shadow-xs'
                      : 'bg-white text-ink-600 border border-mist-200 hover:bg-mist/60',
                  )}
                >
                  <FileText className="h-4 w-4" />
                  <span>Tablica ogłoszeń ({ads.length})</span>
                  {reportedAdsCount > 0 && (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10.5px] font-extrabold text-white">
                      {reportedAdsCount} zgłoszonych
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setModerationSubTab('reviews')}
                  className={cn(
                    'inline-flex h-9 items-center gap-2 rounded-xl px-4 text-[13px] font-bold transition-all cursor-pointer',
                    moderationSubTab === 'reviews'
                      ? 'bg-ink text-white shadow-xs'
                      : 'bg-white text-ink-600 border border-mist-200 hover:bg-mist/60',
                  )}
                >
                  <MessageSquareWarning className="h-4 w-4" />
                  <span>Zgłoszone opinie ({reportedReviews.length})</span>
                  {reportedReviews.length > 0 && (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10.5px] font-extrabold text-white">
                      {reportedReviews.length}
                    </span>
                  )}
                </button>
              </div>

              <div className="text-[12px] text-ink-500 font-medium">
                Panel moderatora platformy mójMińsk · Pełna synchronizacja z bazą Supabase
              </div>
            </div>

            {/* SUB-TAB 1: ADS MODERATION */}
            {moderationSubTab === 'ads' && (
              <div className="space-y-4">
                {/* 1-Click Status Filter Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAdStatusFilter('all')}
                    className={cn(
                      'inline-flex h-8 items-center gap-1.5 rounded-xl px-3 text-[12px] font-bold transition-all cursor-pointer',
                      adStatusFilter === 'all'
                        ? 'bg-ink text-white'
                        : 'bg-white text-ink-600 border border-mist-200 hover:border-mist-300',
                    )}
                  >
                    <span>Wszystkie ogłoszenia</span>
                    <span
                      className={cn(
                        'rounded-md px-1.5 py-0.2 text-[10.5px]',
                        adStatusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-mist text-ink-700',
                      )}
                    >
                      {ads.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdStatusFilter('reported')}
                    className={cn(
                      'inline-flex h-8 items-center gap-1.5 rounded-xl px-3 text-[12px] font-bold transition-all cursor-pointer',
                      adStatusFilter === 'reported'
                        ? 'bg-rose-600 text-white'
                        : reportedAdsCount > 0
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        : 'bg-white text-ink-600 border border-mist-200 hover:border-mist-300',
                    )}
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Zgłoszone przez sąsiadów</span>
                    <span
                      className={cn(
                        'rounded-md px-1.5 py-0.2 text-[10.5px] font-extrabold',
                        adStatusFilter === 'reported' ? 'bg-white/20 text-white' : 'bg-rose-200 text-rose-900',
                      )}
                    >
                      {reportedAdsCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdStatusFilter('active')}
                    className={cn(
                      'inline-flex h-8 items-center gap-1.5 rounded-xl px-3 text-[12px] font-bold transition-all cursor-pointer',
                      adStatusFilter === 'active'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-white text-ink-600 border border-mist-200 hover:border-mist-300',
                    )}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Aktywne</span>
                    <span
                      className={cn(
                        'rounded-md px-1.5 py-0.2 text-[10.5px]',
                        adStatusFilter === 'active' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800',
                      )}
                    >
                      {activeAdsCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdStatusFilter('reserved')}
                    className={cn(
                      'inline-flex h-8 items-center gap-1.5 rounded-xl px-3 text-[12px] font-bold transition-all cursor-pointer',
                      adStatusFilter === 'reserved'
                        ? 'bg-amber-600 text-white'
                        : 'bg-white text-ink-600 border border-mist-200 hover:border-mist-300',
                    )}
                  >
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    <span>Zarezerwowane / Zakończone</span>
                    <span
                      className={cn(
                        'rounded-md px-1.5 py-0.2 text-[10.5px]',
                        adStatusFilter === 'reserved' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900',
                      )}
                    >
                      {reservedAdsCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdStatusFilter('free')}
                    className={cn(
                      'inline-flex h-8 items-center gap-1.5 rounded-xl px-3 text-[12px] font-bold transition-all cursor-pointer',
                      adStatusFilter === 'free'
                        ? 'bg-teal-700 text-white'
                        : 'bg-white text-ink-600 border border-mist-200 hover:border-mist-300',
                    )}
                  >
                    <Tag className="h-3.5 w-3.5 text-teal-600" />
                    <span>Za darmo (oddam)</span>
                    <span
                      className={cn(
                        'rounded-md px-1.5 py-0.2 text-[10.5px]',
                        adStatusFilter === 'free' ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-900',
                      )}
                    >
                      {freeAdsCount}
                    </span>
                  </button>
                </div>

                {/* Search & Category Filter Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-mist-200 shadow-2xs">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                    <input
                      type="text"
                      value={adSearchQuery}
                      onChange={(e) => setAdSearchQuery(e.target.value)}
                      placeholder="Szukaj ogłoszenia po tytule, autorze, ulicy..."
                      className="w-full h-10 pl-9 pr-9 rounded-xl bg-mist/40 border border-mist-200 text-[13px] text-ink placeholder:text-ink-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-ink/20"
                    />
                    {adSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setAdSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold text-ink-500 shrink-0">Kategoria:</span>
                    <select
                      value={adCategoryFilter}
                      onChange={(e) => setAdCategoryFilter(e.target.value)}
                      className="h-10 px-3 rounded-xl bg-mist/40 border border-mist-200 text-[12.5px] font-bold text-ink focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-ink/20 cursor-pointer"
                    >
                      <option value="all">Wszystkie kategorie</option>
                      {distinctAdCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

                    <div className="text-[11.5px] text-ink-500 font-bold whitespace-nowrap pl-2">
                      Wyniki: {filteredAds.length} z {ads.length}
                    </div>
                  </div>
                </div>

                {/* Ads Moderation Cards List */}
                {filteredAds.length === 0 ? (
                  <div className="rounded-3xl bg-white border border-mist-200 p-10 text-center shadow-card space-y-3">
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-mist text-ink-400">
                      <Search className="h-6 w-6" />
                    </div>
                    <h3 className="font-display text-[17px] font-bold text-ink">
                      Brak ogłoszeń spełniających wybrane kryteria
                    </h3>
                    <p className="text-[13px] text-ink-500 max-w-md mx-auto">
                      Zmień frazę w wyszukiwarce lub wybierz inny filtr statusu/kategorii, aby przejrzeć ogłoszenia mieszkańców.
                    </p>
                    {(adSearchQuery || adStatusFilter !== 'all' || adCategoryFilter !== 'all') && (
                      <button
                        type="button"
                        onClick={() => {
                          setAdSearchQuery('');
                          setAdStatusFilter('all');
                          setAdCategoryFilter('all');
                        }}
                        className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-ink px-4 text-[12px] font-bold text-white hover:bg-ink-800 cursor-pointer"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Wyczyść filtry</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredAds.map((ad) => {
                      const adReportsList = reportsByAdId.get(ad.id) || [];
                      const isReported = adReportsList.length > 0;
                      const imagesCount = ad.images?.length || 1;

                      return (
                        <div
                          key={ad.id}
                          className={cn(
                            'rounded-2xl border bg-white p-4 transition-all shadow-card',
                            isReported
                              ? 'border-rose-300 ring-2 ring-rose-500/10'
                              : 'border-mist-200 hover:border-mist-300',
                          )}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {/* Left: Thumbnail & Main Info */}
                            <div className="flex items-start gap-3.5 min-w-0 flex-1">
                              <div className="relative shrink-0">
                                <img
                                  src={ad.image}
                                  alt={ad.title}
                                  className="h-16 w-16 md:h-20 md:w-20 rounded-xl object-cover bg-sand-100 border border-mist-200"
                                />
                                {imagesCount > 1 && (
                                  <span className="absolute bottom-1 right-1 rounded-md bg-ink/80 backdrop-blur-xs px-1.5 py-0.5 text-[9.5px] font-bold text-white flex items-center gap-0.5">
                                    <ImageIcon className="h-2.5 w-2.5" />
                                    <span>{imagesCount}</span>
                                  </span>
                                )}
                              </div>

                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-md bg-mist px-2 py-0.5 text-[11px] font-bold text-ink-700">
                                    {ad.category || 'Inne'}
                                  </span>

                                  {isReported && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 text-rose-800 px-2 py-0.5 text-[11px] font-extrabold">
                                      <AlertTriangle className="h-3 w-3" />
                                      <span>Zgłoszone ({adReportsList.length})</span>
                                    </span>
                                  )}

                                  {ad.status === 'reserved' && (
                                    <span className="rounded-md bg-amber-100 text-amber-800 px-2 py-0.5 text-[11px] font-bold">
                                      Zarezerwowane
                                    </span>
                                  )}

                                  {ad.status === 'sold' && (
                                    <span className="rounded-md bg-zinc-200 text-zinc-800 px-2 py-0.5 text-[11px] font-bold">
                                      Zakończone
                                    </span>
                                  )}

                                  {ad.kind === 'free' ? (
                                    <span className="rounded-md bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[11px] font-extrabold">
                                      Za darmo
                                    </span>
                                  ) : (
                                    <span className="font-display text-[15px] font-black text-ink">
                                      {ad.price !== null ? `${ad.price} zł` : 'Cena do uzgodnienia'}
                                    </span>
                                  )}
                                </div>

                                <h4
                                  onClick={() => setAdToPreview(ad)}
                                  className="font-display text-[16px] font-extrabold text-ink hover:text-coral transition-colors cursor-pointer truncate"
                                  title={ad.title}
                                >
                                  {ad.title}
                                </h4>

                                <p className="text-[12px] text-ink-500 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                  <span className="font-semibold text-ink-700">
                                    {ad.author} z ul. {ad.street}
                                  </span>
                                  <span>·</span>
                                  <span>Dodano: {ad.time || 'niedawno'}</span>
                                  {ad.expiresAt && (
                                    <>
                                      <span>·</span>
                                      <span className="text-ink-400">
                                        Ważne do: {formatAdExactDate(ad.expiresAt)}
                                      </span>
                                    </>
                                  )}
                                </p>

                                {ad.description && (
                                  <p className="text-[12px] text-ink-600 line-clamp-1">
                                    {ad.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex sm:flex-col md:flex-row items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-mist-200 justify-end">
                              {onUpdateAdStatus && (
                                <select
                                  value={ad.status || 'active'}
                                  onChange={(e) =>
                                    onUpdateAdStatus(
                                      ad.id,
                                      e.target.value as 'active' | 'reserved' | 'sold',
                                    )
                                  }
                                  aria-label="Zmień status ogłoszenia"
                                  className="h-9 rounded-xl bg-mist/60 border border-mist-300 text-[11.5px] font-bold text-ink px-2.5 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-ink/20"
                                >
                                  <option value="active">🟢 Aktywne</option>
                                  <option value="reserved">🟡 Zarezerwowane</option>
                                  <option value="sold">⚪ Zakończone</option>
                                </select>
                              )}

                              <button
                                type="button"
                                onClick={() => setAdToPreview(ad)}
                                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-mist-300 bg-white px-3 text-[12px] font-bold text-ink hover:bg-mist cursor-pointer transition-all"
                              >
                                <Eye className="h-3.5 w-3.5 text-ink-500" />
                                <span>Podgląd</span>
                              </button>

                              {onDeleteAd && (
                                <button
                                  type="button"
                                  onClick={() => setAdToDelete(ad)}
                                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 text-[12px] font-bold text-rose-700 hover:bg-rose-600 hover:text-white cursor-pointer transition-all"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>Usuń ogłoszenie</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Reported Ad Alert Box */}
                          {isReported && (
                            <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50/70 p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
                                  <span className="text-[12px] font-bold text-rose-900">
                                    Powód zgłoszenia przez mieszkańca:
                                  </span>
                                </div>
                                <span className="text-[11px] font-semibold text-rose-700">
                                  ID: {ad.id}
                                </span>
                              </div>

                              <div className="space-y-1.5">
                                {adReportsList.map((report) => (
                                  <div
                                    key={report.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/80 p-2.5 rounded-lg border border-rose-200/60 text-[12px]"
                                  >
                                    <div>
                                      <p className="font-bold text-ink">„{report.reason}”</p>
                                      {report.details && (
                                        <p className="text-[11.5px] text-ink-600">
                                          Szczegóły: {report.details}
                                        </p>
                                      )}
                                    </div>

                                    {onDismissAdReport && (
                                      <button
                                        type="button"
                                        onClick={() => onDismissAdReport(report.id)}
                                        className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-ink-600 hover:text-ink bg-white border border-mist-300 rounded-lg px-2.5 py-1 cursor-pointer"
                                      >
                                        <Check className="h-3 w-3 text-emerald-600" />
                                        <span>Odrzuć zgłoszenie (fałszywy alarm)</span>
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 2: REPORTED REVIEWS */}
            {moderationSubTab === 'reviews' && (
              <div className="rounded-2xl bg-white border border-mist-200 p-6 shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-rose-600" />
                    <h3 className="font-display text-[18px] font-bold text-ink">
                      Zgłoszone opinie o usługodawcach ({reportedReviews.length})
                    </h3>
                  </div>
                  <span className="text-[12px] text-ink-500">
                    Wymaga weryfikacji i decyzji moderatora
                  </span>
                </div>

                {reportedReviews.length === 0 ? (
                  <div className="rounded-2xl bg-sand-50 p-8 text-center text-[13px] text-ink-500">
                    Brak zgłoszonych opinii wymagających interwencji moderatora.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reportedReviews.map(({ provider, review }) => (
                      <div
                        key={review.id}
                        className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 space-y-2.5"
                      >
                        <div className="flex items-center justify-between text-[12px]">
                          <span className="font-bold text-ink">
                            Dotyczy wykonawcy: {provider.businessName}
                          </span>
                          <span className="text-rose-700 font-bold">Zgłoszono do moderacji</span>
                        </div>
                        <p className="text-[13px] text-ink-800 bg-white p-3 rounded-lg border border-mist-200">
                          „{review.comment}”
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-1 gap-2">
                          <span className="text-[11.5px] text-ink-500">
                            Autor opinii: {review.authorName} z ul. {review.authorStreet} · Ocena: {review.rating}/5
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                onDismissReportedReview?.(provider.id, review.id);
                                setDeleteSuccessToast('Zgłoszenie opinii odrzucone. Opinia pozostała w katalogu.');
                              }}
                              className="rounded-xl bg-white border border-mist-300 px-3 py-1.5 text-[11.5px] font-bold text-ink hover:bg-mist cursor-pointer"
                            >
                              Zostaw opinię (odrzuć zgłoszenie)
                            </button>
                            <button
                              type="button"
                              onClick={() => setReviewToDelete({ provider, review })}
                              className="rounded-xl bg-rose-600 px-3 py-1.5 text-[11.5px] font-bold text-white hover:bg-rose-700 cursor-pointer"
                            >
                              Usuń opinię
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            MODAL POTWIERDZENIA USUNIĘCIA OGŁOSZENIA Z BAZY
        ===================================================================== */}
        {adToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
            <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-mist-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-100 text-rose-700">
                  <AlertTriangle className="h-6 w-6 stroke-[2.2]" />
                </div>
                <button
                  type="button"
                  onClick={() => setAdToDelete(null)}
                  className="rounded-xl p-1.5 text-ink-400 hover:bg-mist hover:text-ink cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div>
                <h3 className="font-display text-[20px] font-extrabold text-ink">
                  Usunąć ogłoszenie z bazy?
                </h3>
                <p className="mt-1 text-[13px] text-ink-500">
                  To działanie jest natychmiastowe i nieodwracalne. Ogłoszenie zostanie trwale skasowane z platformy mójMińsk oraz z bazy danych Supabase.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-mist-200 bg-mist/40 p-3">
                <img
                  src={adToDelete.image}
                  alt={adToDelete.title}
                  className="h-14 w-14 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-[13.5px] text-ink truncate">
                    {adToDelete.title}
                  </h4>
                  <p className="text-[12px] text-ink-500">
                    Autor: {adToDelete.author} z ul. {adToDelete.street}
                  </p>
                  <p className="text-[12px] font-bold text-coral-700">
                    {adToDelete.kind === 'free' ? 'Za darmo' : `${adToDelete.price ?? 0} zł`}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-3 text-[12px] text-rose-800">
                <strong>Skutek kaskadowy (ON DELETE CASCADE):</strong> Wraz z ogłoszeniem zostaną usunięte powiązane wątki czatu mieszkańców, rezerwacje odbioru oraz zgłoszenia naruszeń.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdToDelete(null)}
                  className="rounded-xl border border-mist-300 bg-white px-4 py-2 text-[13px] font-bold text-ink hover:bg-mist cursor-pointer"
                >
                  Anuluj
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDeleteAd}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-[13px] font-bold text-white hover:bg-rose-700 cursor-pointer shadow-xs"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Tak, usuń trwale</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            MODAL POTWIERDZENIA USUNIĘCIA USŁUGODAWCY / ODRZUCENIA WNIOSKU
        ===================================================================== */}
        {providerToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
            <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-mist-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-100 text-rose-700">
                  <AlertTriangle className="h-6 w-6 stroke-[2.2]" />
                </div>
                <button
                  type="button"
                  onClick={() => setProviderToDelete(null)}
                  className="rounded-xl p-1.5 text-ink-400 hover:bg-mist hover:text-ink cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div>
                <h3 className="font-display text-[20px] font-extrabold text-ink">
                  {providerToDelete.status === 'pending_verification'
                    ? 'Odrzucić wniosek usługodawcy?'
                    : 'Usunąć fachowca z bazy?'}
                </h3>
                <p className="mt-1 text-[13px] text-ink-500">
                  {providerToDelete.status === 'pending_verification'
                    ? 'Wniosek zostanie trwale usunięty z kolejki weryfikacyjnej. Profil nie pojawi się w katalogu.'
                    : 'To działanie jest natychmiastowe i nieodwracalne. Wizytówka fachowca zniknie z katalogu usług.'}
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-mist-200 bg-mist/40 p-3">
                <ProviderBrandMark provider={providerToDelete} size="sm" />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-[13.5px] text-ink truncate">
                    {providerToDelete.businessName}
                  </h4>
                  <p className="text-[12px] text-ink-500 truncate">
                    {providerToDelete.name} · ul. {providerToDelete.street}
                  </p>
                  <p className="text-[11px] font-semibold text-ink-400">
                    Kategoria: {getServiceCategoryById(providerToDelete.categoryId).label}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-3 text-[12px] text-rose-800">
                <strong>Skutek kaskadowy (ON DELETE CASCADE):</strong> Wraz z profilem zostaną trwale skasowane wszystkie powiązane opinie mieszkańców oraz zdjęcia z portfolio w bazie PostgreSQL Supabase.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProviderToDelete(null)}
                  className="rounded-xl border border-mist-300 bg-white px-4 py-2 text-[13px] font-bold text-ink hover:bg-mist cursor-pointer"
                >
                  Anuluj
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDeleteProvider}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-[13px] font-bold text-white hover:bg-rose-700 cursor-pointer shadow-xs"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>
                    {providerToDelete.status === 'pending_verification'
                      ? 'Odrzuć i usuń wniosek'
                      : 'Tak, usuń trwale'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            MODAL POTWIERDZENIA USUNIĘCIA OPINII
        ===================================================================== */}
        {reviewToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
            <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-mist-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-100 text-rose-700">
                  <AlertTriangle className="h-6 w-6 stroke-[2.2]" />
                </div>
                <button
                  type="button"
                  onClick={() => setReviewToDelete(null)}
                  className="rounded-xl p-1.5 text-ink-400 hover:bg-mist hover:text-ink cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div>
                <h3 className="font-display text-[20px] font-extrabold text-ink">
                  Usunąć opinię mieszkańca?
                </h3>
                <p className="mt-1 text-[13px] text-ink-500">
                  Ta opinia zostanie bezpowrotnie skasowana z bazy danych Supabase, a średnia ocen wykonawcy zostanie automatycznie przeliczona.
                </p>
              </div>

              <div className="rounded-2xl border border-mist-200 bg-sand-50/60 p-3.5 space-y-1.5">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-bold text-ink">
                    {reviewToDelete.review.authorName} z ul. {reviewToDelete.review.authorStreet}
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                    <span>{reviewToDelete.review.rating}/5</span>
                  </span>
                </div>
                <p className="text-[12.5px] italic text-ink-700 bg-white p-2.5 rounded-xl border border-mist-200">
                  „{reviewToDelete.review.comment}”
                </p>
                <p className="text-[11.5px] text-ink-500">
                  Dotyczy: <strong>{reviewToDelete.provider.businessName}</strong>
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewToDelete(null)}
                  className="rounded-xl border border-mist-300 bg-white px-4 py-2 text-[13px] font-bold text-ink hover:bg-mist cursor-pointer"
                >
                  Anuluj
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDeleteReview}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-[13px] font-bold text-white hover:bg-rose-700 cursor-pointer shadow-xs"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Tak, usuń opinię</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            MODAL PODGLĄDU OGŁOSZENIA
        ===================================================================== */}
        {adToPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
            <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl border border-mist-200 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded-md bg-mist px-2.5 py-0.5 text-[11px] font-bold text-ink-700">
                    {adToPreview.category || 'Inne'}
                  </span>
                  <h3 className="mt-1 font-display text-[20px] font-extrabold text-ink">
                    {adToPreview.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setAdToPreview(null)}
                  className="rounded-xl p-1.5 text-ink-400 hover:bg-mist hover:text-ink cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Photos Gallery */}
              <div className="space-y-2">
                <img
                  src={adToPreview.image}
                  alt={adToPreview.title}
                  className="w-full h-56 rounded-2xl object-cover border border-mist-200"
                />
                {adToPreview.images && adToPreview.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {adToPreview.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt=""
                        className="h-16 w-16 rounded-xl object-cover shrink-0 border border-mist-200"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Price & author */}
              <div className="flex items-center justify-between rounded-2xl bg-mist/40 p-4 border border-mist-200">
                <div>
                  <p className="text-[11px] font-bold text-ink-400 uppercase">Cena</p>
                  <p className="font-display text-2xl font-black text-ink">
                    {adToPreview.kind === 'free' ? 'Za darmo' : `${adToPreview.price ?? 0} zł`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold text-ink-400 uppercase">Wystawiający sąsiad</p>
                  <p className="font-bold text-[13.5px] text-ink">
                    {adToPreview.author} z ul. {adToPreview.street}
                  </p>
                </div>
              </div>

              {/* Description */}
              {adToPreview.description && (
                <div className="space-y-1">
                  <h4 className="text-[12px] font-bold text-ink-500 uppercase tracking-wider">
                    Opis przedmiotu
                  </h4>
                  <p className="text-[13.5px] text-ink-700 leading-relaxed whitespace-pre-line bg-sand-50/50 p-3.5 rounded-xl border border-mist-200">
                    {adToPreview.description}
                  </p>
                </div>
              )}

              {/* Footer actions */}
              <div className="flex items-center justify-between pt-3 border-t border-mist-200">
                <button
                  type="button"
                  onClick={() => {
                    const toDelete = adToPreview;
                    setAdToPreview(null);
                    setAdToDelete(toDelete);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-[12.5px] font-bold text-rose-700 hover:bg-rose-100 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Usuń ogłoszenie</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdToPreview(null)}
                  className="rounded-xl bg-ink px-4 py-2 text-[13px] font-bold text-white hover:bg-ink-800 cursor-pointer"
                >
                  Zamknij podgląd
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TOAST POTWIERDZENIA AKCJI MODERATORA
        ===================================================================== */}
        {deleteSuccessToast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-ink text-white px-4 py-3 shadow-2xl border border-ink-700 animate-in fade-in slide-in-from-bottom-5 duration-200">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span className="text-[13px] font-bold">{deleteSuccessToast}</span>
            <button
              type="button"
              onClick={() => setDeleteSuccessToast(null)}
              className="text-white/60 hover:text-white cursor-pointer ml-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
